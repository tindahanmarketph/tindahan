-- =====================================================================
-- TindaHan — Durcissement bêta (cahier des charges v1.1, 12 nov 2026)
-- À appliquer par ChatGPT dans Supabase (SQL editor) AVANT d'activer
-- VITE_DB_HARDENING=true sur Netlify.
--
-- Tout est idempotent (IF NOT EXISTS / CREATE OR REPLACE) : relancer ce
-- script ne casse rien. LIRE les blocs « VÉRIFIER » avant exécution :
-- le schéma réel de Supabase n'était pas visible depuis le code.
-- Aucune suppression de données dans ce script.
-- =====================================================================

-- ---------------------------------------------------------------
-- 0. Colonnes nécessaires
-- ---------------------------------------------------------------
alter table public.listings add column if not exists reserved_by uuid references auth.users(id);
alter table public.listings add column if not exists reserved_until timestamptz;

alter table public.orders add column if not exists client_request_id text;
alter table public.orders add column if not exists cancelled_at timestamptz;
alter table public.orders add column if not exists cancel_reason text;
alter table public.orders add column if not exists reminder_j2_sent_at timestamptz;
alter table public.orders add column if not exists reminder_j1_sent_at timestamptz;

alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists address jsonb;

-- ---------------------------------------------------------------
-- 1. Un seul achat actif par annonce + idempotence (L1.1)
-- ---------------------------------------------------------------
-- VÉRIFIER avant : doublons existants (le CREATE UNIQUE INDEX échoue s'il y en a).
--   select listing_id, count(*) from public.orders
--   where status in ('paid_waiting_seller','label_downloaded','courier_pickup_scheduled',
--     'dropped_off','in_transit','ready_for_pickup','delivery_scheduled','meetup_request_sent','refund_requested')
--   group by 1 having count(*) > 1;
-- Les doublons doivent être traités À LA MAIN (annuler/rembourser la commande en trop)
-- après accord de Gian. Ce script ne supprime rien.

create unique index if not exists orders_one_active_per_listing
  on public.orders (listing_id)
  where status in (
    'paid_waiting_seller','label_downloaded','courier_pickup_scheduled','dropped_off',
    'in_transit','ready_for_pickup','delivery_scheduled','meetup_request_sent','refund_requested'
  );

create unique index if not exists orders_client_request_unique
  on public.orders (buyer_id, client_request_id)
  where client_request_id is not null;

-- ---------------------------------------------------------------
-- 2. Interdire l'auto-achat côté serveur (L1.2)
-- ---------------------------------------------------------------
create or replace function public.orders_block_self_purchase()
returns trigger language plpgsql as $$
begin
  if new.buyer_id = new.seller_id then
    raise exception 'You cannot buy your own listing' using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists trg_orders_block_self_purchase on public.orders;
create trigger trg_orders_block_self_purchase
  before insert on public.orders
  for each row execute function public.orders_block_self_purchase();

-- Idem pour les offres (table offers) : pas d'offre sur sa propre annonce.
create or replace function public.offers_block_self_offer()
returns trigger language plpgsql as $$
begin
  if new.buyer_id = new.seller_id then
    raise exception 'You cannot make an offer on your own listing' using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists trg_offers_block_self_offer on public.offers;
create trigger trg_offers_block_self_offer
  before insert on public.offers
  for each row execute function public.offers_block_self_offer();

-- ---------------------------------------------------------------
-- 3. Réservation d'annonce pendant le checkout (L1.1) — verrou 15 min (D1)
-- ---------------------------------------------------------------
create or replace function public.reserve_listing(p_listing_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  l record;
  uid uuid := auth.uid();
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  end if;

  select id, seller_id, status, reserved_by, reserved_until
    into l from public.listings where id = p_listing_id for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  if l.seller_id = uid then
    return jsonb_build_object('ok', false, 'reason', 'own_listing');
  end if;

  if lower(coalesce(l.status,'active')) in ('sold','completed','hidden','deleted','paused') then
    return jsonb_build_object('ok', false, 'reason', 'sold');
  end if;

  -- Réservée par quelqu'un d'autre et verrou encore valide => indisponible
  if lower(coalesce(l.status,'active')) = 'reserved'
     and l.reserved_by is not null and l.reserved_by <> uid
     and l.reserved_until is not null and l.reserved_until > now() then
    return jsonb_build_object('ok', false, 'reason', 'reserved');
  end if;

  -- Réservée manuellement par le vendeur (sans verrou) => indisponible
  if lower(coalesce(l.status,'active')) = 'reserved' and l.reserved_by is null then
    return jsonb_build_object('ok', false, 'reason', 'reserved');
  end if;

  update public.listings
     set status = 'reserved', reserved_by = uid,
         reserved_until = now() + interval '15 minutes'
   where id = p_listing_id;

  return jsonb_build_object('ok', true, 'reserved_until', now() + interval '15 minutes');
end $$;

create or replace function public.release_listing(p_listing_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  -- Libère seulement si aucune commande active ne tient l'annonce.
  if exists (
    select 1 from public.orders o
    where o.listing_id = p_listing_id
      and o.status in ('paid_waiting_seller','label_downloaded','courier_pickup_scheduled',
        'dropped_off','in_transit','ready_for_pickup','delivery_scheduled','meetup_request_sent','refund_requested')
  ) then
    return jsonb_build_object('ok', false, 'reason', 'active_order');
  end if;

  update public.listings
     set status = 'active', reserved_by = null, reserved_until = null
   where id = p_listing_id
     and lower(coalesce(status,'')) = 'reserved'
     and (reserved_by = auth.uid() or reserved_by is null or reserved_until < now()
          or seller_id = auth.uid());

  return jsonb_build_object('ok', true);
end $$;

-- Une commande créée « tient » l'annonce : reserved sans échéance, jusqu'à vente/annulation.
create or replace function public.orders_lock_listing()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.listings
     set status = 'reserved', reserved_by = new.buyer_id, reserved_until = null
   where id = new.listing_id;
  return new;
end $$;

drop trigger if exists trg_orders_lock_listing on public.orders;
create trigger trg_orders_lock_listing
  after insert on public.orders
  for each row execute function public.orders_lock_listing();

-- Commande terminée => annonce vendue ; commande annulée/expirée => annonce remise en vente.
create or replace function public.orders_sync_listing_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'completed' then
      update public.listings set status = 'sold', reserved_by = null, reserved_until = null
       where id = new.listing_id;
    elsif new.status in ('cancelled','canceled','expired','refunded') then
      update public.listings set status = 'active', reserved_by = null, reserved_until = null
       where id = new.listing_id and lower(coalesce(status,'')) in ('reserved');
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_orders_sync_listing_status on public.orders;
create trigger trg_orders_sync_listing_status
  after update of status on public.orders
  for each row execute function public.orders_sync_listing_status();

-- Verrous de checkout expirés (non suivis d'une commande) => annonce libérée.
create or replace function public.release_expired_locks()
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  update public.listings l
     set status = 'active', reserved_by = null, reserved_until = null
   where lower(coalesce(l.status,'')) = 'reserved'
     and l.reserved_until is not null and l.reserved_until < now()
     and not exists (select 1 from public.orders o where o.listing_id = l.id
        and o.status in ('paid_waiting_seller','label_downloaded','courier_pickup_scheduled',
          'dropped_off','in_transit','ready_for_pickup','delivery_scheduled','meetup_request_sent','refund_requested'));
  get diagnostics n = row_count;
  return n;
end $$;

-- ---------------------------------------------------------------
-- 4. Notifications (L4.2)
-- ---------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  order_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_created on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- Pas de policy INSERT : seules les fonctions SECURITY DEFINER / triggers écrivent.

create or replace function public.notify(p_user uuid, p_type text, p_title text, p_body text, p_link text, p_order uuid)
returns void language sql security definer set search_path = public as $$
  insert into public.notifications (user_id, type, title, body, link, order_id)
  values (p_user, p_type, p_title, p_body, p_link, p_order);
$$;

create or replace function public.orders_notify_on_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify(new.seller_id, 'order_sold', 'Your item has been sold',
    coalesce(new.listing_title,'Item') || ' — ship before ' || to_char(new.max_shipping_date, 'DD Mon YYYY'),
    '/orders/' || new.id, new.id);
  perform public.notify(new.buyer_id, 'order_paid', 'Order confirmed',
    coalesce(new.listing_title,'Item'), '/orders/' || new.id, new.id);
  return new;
end $$;

drop trigger if exists trg_orders_notify_insert on public.orders;
create trigger trg_orders_notify_insert
  after insert on public.orders
  for each row execute function public.orders_notify_on_insert();

create or replace function public.orders_notify_on_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    if new.status in ('cancelled','canceled') then
      perform public.notify(new.seller_id, 'order_cancelled', 'Order cancelled', coalesce(new.listing_title,'Item'), '/orders/' || new.id, new.id);
      perform public.notify(new.buyer_id,  'order_cancelled', 'Order cancelled — refunded', coalesce(new.listing_title,'Item'), '/orders/' || new.id, new.id);
    elsif new.status = 'expired' then
      perform public.notify(new.seller_id, 'order_expired', 'Order expired', 'You did not ship ' || coalesce(new.listing_title,'the item') || ' in time.', '/orders/' || new.id, new.id);
      perform public.notify(new.buyer_id,  'order_expired', 'Order expired — refunded', 'The seller did not ship in time. You are refunded in full.', '/orders/' || new.id, new.id);
    elsif new.status = 'completed' then
      perform public.notify(new.seller_id, 'order_completed', 'Order completed', 'Your earnings are now available in your wallet.', '/wallet', new.id);
    elsif new.status = 'in_transit' then
      perform public.notify(new.buyer_id, 'order_shipped', 'Your parcel is on its way', coalesce(new.listing_title,'Item'), '/orders/' || new.id, new.id);
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_orders_notify_status on public.orders;
create trigger trg_orders_notify_status
  after update of status on public.orders
  for each row execute function public.orders_notify_on_status();

-- ---------------------------------------------------------------
-- 5. Annulation acheteur et expiration automatique (L1.3, D2/D3)
-- ---------------------------------------------------------------
create or replace function public.cancel_order(p_order_id uuid, p_reason text default 'Cancelled by buyer')
returns jsonb language plpgsql security definer set search_path = public as $$
declare o record;
begin
  select * into o from public.orders where id = p_order_id for update;
  if not found or o.buyer_id <> auth.uid() then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;
  if o.status not in ('paid_waiting_seller','meetup_request_sent') or coalesce(o.shipping_label_downloaded,false) then
    return jsonb_build_object('ok', false, 'reason', 'too_late');
  end if;

  update public.orders
     set status = 'cancelled', cancelled_at = now(), cancel_reason = p_reason
   where id = p_order_id;

  insert into public.order_tracking_events (order_id, title, description, completed)
  values (p_order_id, 'Order cancelled',
          p_reason || '. The buyer is refunded in full (simulated during the beta).', true);

  return jsonb_build_object('ok', true);
end $$;

create or replace function public.expire_overdue_orders()
returns integer language plpgsql security definer set search_path = public as $$
declare r record; n integer := 0;
begin
  for r in
    select id from public.orders
     where status in ('paid_waiting_seller','meetup_request_sent')
       and max_shipping_date < now()
     for update skip locked
  loop
    update public.orders set status = 'expired', cancelled_at = now(),
           cancel_reason = 'Seller did not ship before the deadline'
     where id = r.id;
    insert into public.order_tracking_events (order_id, title, description, completed)
    values (r.id, 'Order expired',
      'The seller did not ship before the deadline. The buyer is refunded in full (simulated during the beta) and the item is available again.', true);
    n := n + 1;
  end loop;
  return n;
end $$;

-- Rappels vendeur J-2 / J-1 (D3)
create or replace function public.send_shipping_reminders()
returns integer language plpgsql security definer set search_path = public as $$
declare r record; n integer := 0;
begin
  for r in
    select id, seller_id, listing_title, max_shipping_date, reminder_j2_sent_at, reminder_j1_sent_at
      from public.orders
     where status in ('paid_waiting_seller','label_downloaded','courier_pickup_scheduled')
       and max_shipping_date > now()
  loop
    if r.max_shipping_date <= now() + interval '1 day' and r.reminder_j1_sent_at is null then
      perform public.notify(r.seller_id, 'ship_reminder', 'Last day to ship',
        coalesce(r.listing_title,'Your item') || ' must ship today or the order is cancelled.', '/orders/' || r.id, r.id);
      update public.orders set reminder_j1_sent_at = now(), reminder_j2_sent_at = coalesce(reminder_j2_sent_at, now()) where id = r.id;
      n := n + 1;
    elsif r.max_shipping_date <= now() + interval '2 days' and r.reminder_j2_sent_at is null then
      perform public.notify(r.seller_id, 'ship_reminder', '2 days left to ship',
        coalesce(r.listing_title,'Your item') || ' must ship before ' || to_char(r.max_shipping_date, 'DD Mon YYYY') || '.', '/orders/' || r.id, r.id);
      update public.orders set reminder_j2_sent_at = now() where id = r.id;
      n := n + 1;
    end if;
  end loop;
  return n;
end $$;

-- ---------------------------------------------------------------
-- 6. Tâches planifiées (pg_cron) — activer l'extension dans
--    Supabase > Database > Extensions > pg_cron, puis décommenter :
-- ---------------------------------------------------------------
-- select cron.schedule('tindahan-expire-orders',   '*/15 * * * *', $$select public.expire_overdue_orders()$$);
-- select cron.schedule('tindahan-release-locks',   '* * * * *',    $$select public.release_expired_locks()$$);
-- select cron.schedule('tindahan-ship-reminders',  '0 * * * *',    $$select public.send_shipping_reminders()$$);

-- ---------------------------------------------------------------
-- 7. Droits d'exécution
-- ---------------------------------------------------------------
revoke all on function public.expire_overdue_orders() from public, anon, authenticated;
revoke all on function public.send_shipping_reminders() from public, anon, authenticated;
revoke all on function public.release_expired_locks() from public, anon, authenticated;
revoke all on function public.notify(uuid,text,text,text,text,uuid) from public, anon, authenticated;
grant execute on function public.reserve_listing(uuid) to authenticated;
grant execute on function public.release_listing(uuid) to authenticated;
grant execute on function public.cancel_order(uuid,text) to authenticated;

-- ---------------------------------------------------------------
-- 8. Nettoyage des doublons existants — REQUÊTES DE LECTURE UNIQUEMENT
--    (aucune suppression sans validation de Gian)
-- ---------------------------------------------------------------
-- Annonces avec plusieurs commandes actives :
--   select listing_id, array_agg(id order by created_at) as orders, count(*)
--   from public.orders where status in ('paid_waiting_seller','label_downloaded',
--     'courier_pickup_scheduled','dropped_off','in_transit','ready_for_pickup',
--     'delivery_scheduled','meetup_request_sent','refund_requested')
--   group by listing_id having count(*) > 1;
-- Commandes où l'acheteur est le vendeur (auto-achat) :
--   select id, listing_id, buyer_id from public.orders where buyer_id = seller_id;
-- Annonces « reserved/sold » sans commande correspondante :
--   select l.id, l.title, l.status from public.listings l
--   where lower(l.status) in ('reserved','sold') and not exists
--     (select 1 from public.orders o where o.listing_id = l.id);

-- ---------------------------------------------------------------
-- 9. Compteur de vues sans écriture directe (L4.9) + annonces vendues lisibles (L4.1)
-- ---------------------------------------------------------------
create or replace function public.increment_listing_views(p_listing_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.listings
     set views = coalesce(views, 0) + 1
   where id = p_listing_id and seller_id is distinct from auth.uid();
$$;
grant execute on function public.increment_listing_views(uuid) to authenticated;

-- VÉRIFIER : la page « Sold » exige que les annonces vendues restent lisibles par tous
-- (le lien partagé doit rester valide). Si la policy SELECT de `listings` filtre sur
-- status = 'active', l'élargir, par exemple :
--   drop policy if exists "listings_public_read" on public.listings;
--   create policy "listings_public_read" on public.listings
--     for select using (status in ('active','available','reserved','sold','completed')
--                       or seller_id = auth.uid());
-- (les annonces 'hidden' restent visibles de leur seul vendeur.)

-- ---------------------------------------------------------------
-- 10. Statistiques vendeur réelles (L3.3) — ventes = commandes completed, note = moyenne des avis
-- VÉRIFIER : table `reviews` (reviewed_user_id, rating) et colonnes profiles.total_sales / profiles.rating.
-- ---------------------------------------------------------------
create or replace function public.seller_stats(p_seller uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'completed_sales', (select count(*) from public.orders where seller_id = p_seller and status = 'completed'),
    'rating_count',    (select count(*) from public.reviews where reviewed_user_id = p_seller),
    'rating_avg',      coalesce((select avg(rating)::numeric(4,2) from public.reviews where reviewed_user_id = p_seller), 0)
  );
$$;
grant execute on function public.seller_stats(uuid) to anon, authenticated;

-- Garde les colonnes dénormalisées de profiles à jour (utilisées par l'accueil et les cartes).
alter table public.profiles add column if not exists total_sales integer default 0;
alter table public.profiles add column if not exists rating numeric(4,2);

create or replace function public.refresh_seller_profile_stats(p_seller uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.profiles p set
    total_sales = (select count(*) from public.orders where seller_id = p_seller and status = 'completed'),
    rating = (select avg(rating)::numeric(4,2) from public.reviews where reviewed_user_id = p_seller)
  where p.id = p_seller;
end $$;

create or replace function public.orders_refresh_stats()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    perform public.refresh_seller_profile_stats(new.seller_id);
  end if;
  return new;
end $$;
drop trigger if exists trg_orders_refresh_stats on public.orders;
create trigger trg_orders_refresh_stats after update of status on public.orders
  for each row execute function public.orders_refresh_stats();

create or replace function public.reviews_refresh_stats()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.refresh_seller_profile_stats(coalesce(new.reviewed_user_id, old.reviewed_user_id));
  return coalesce(new, old);
end $$;
drop trigger if exists trg_reviews_refresh_stats on public.reviews;
create trigger trg_reviews_refresh_stats after insert or update or delete on public.reviews
  for each row execute function public.reviews_refresh_stats();

-- ---------------------------------------------------------------
-- 11. Expiration des offres (L4.4) : 48 h (offre sans réponse ; prix accepté tenu 48 h)
--     Le front calcule déjà le statut « expired » à la lecture ; ceci le persiste.
-- ---------------------------------------------------------------
create or replace function public.expire_stale_offers()
returns integer language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  update public.offers
     set status = 'expired', updated_at = now()
   where (status in ('pending','sent') and created_at < now() - interval '48 hours')
      or (status = 'accepted' and coalesce(updated_at, created_at) < now() - interval '48 hours');
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.expire_stale_offers() from public, anon, authenticated;
-- select cron.schedule('tindahan-expire-offers', '*/30 * * * *', $$select public.expire_stale_offers()$$);
-- VÉRIFIER : si offers.status a une contrainte CHECK, y ajouter 'expired'.
