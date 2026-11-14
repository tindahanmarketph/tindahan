import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { DB_HARDENING } from "./featureFlags";
import { getOrderDeadlineInfo, getStoredOrders } from "./orders";

/*
 * Notifications (cahier L4.2).
 * - Toujours : notifications DÉRIVÉES des commandes de la personne (aucune table requise).
 * - Si VITE_DB_HARDENING=true : on ajoute la table `notifications` (voir la migration SQL),
 *   dédupliquée par (type, order_id).
 * L'état « lu » est gardé sur l'appareil (localStorage).
 */

const readKey = (uid) => `tindahan_notif_read_${uid}`;

function loadRead(uid) {
  try {
    return new Set(JSON.parse(localStorage.getItem(readKey(uid)) || "[]"));
  } catch {
    return new Set();
  }
}

function saveRead(uid, set) {
  try {
    localStorage.setItem(readKey(uid), JSON.stringify([...set].slice(-300)));
  } catch {
    /* ignoré */
  }
}

export function deriveOrderNotifications(orders, userId) {
  const items = [];

  (orders || []).forEach((order) => {
    const isSeller = String(order.sellerId) === String(userId);
    const link = `/orders/${order.id}`;
    const title = order.listingTitle || "Item";
    const created = order.createdAt;

    if (isSeller && ["paid_waiting_seller", "meetup_request_sent"].includes(order.status)) {
      const { daysLeft, overdue } = getOrderDeadlineInfo(order);
      items.push({
        id: `sold-${order.id}`,
        title: "Your item has been sold",
        body: `${title}. Ship it before the deadline.`,
        link,
        date: created
      });
      if (!overdue && daysLeft !== null && daysLeft <= 2) {
        items.push({
          id: `remind-${order.id}-${daysLeft}`,
          title: daysLeft <= 1 ? "Last day to ship" : `${daysLeft} days left to ship`,
          body: title,
          link,
          date: new Date().toISOString()
        });
      }
    }

    if (!isSeller && order.status === "paid_waiting_seller") {
      items.push({ id: `paid-${order.id}`, title: "Order confirmed", body: title, link, date: created });
    }

    if (order.status === "expired") {
      items.push({
        id: `expired-${order.id}`,
        title: isSeller ? "Order expired" : "Order expired — refunded",
        body: isSeller ? `You did not ship ${title} in time.` : "The seller did not ship in time. You are refunded in full.",
        link,
        date: order.updatedAt || created
      });
    }

    if (order.status === "cancelled") {
      items.push({ id: `cancelled-${order.id}`, title: "Order cancelled", body: title, link, date: order.updatedAt || created });
    }

    if (!isSeller && order.status === "in_transit") {
      items.push({ id: `transit-${order.id}`, title: "Your parcel is on its way", body: title, link, date: order.updatedAt || created });
    }

    if (isSeller && order.status === "completed") {
      items.push({ id: `done-${order.id}`, title: "Order completed", body: "Your earnings are available in your wallet.", link: "/wallet", date: order.completedAt || order.updatedAt });
    }
  });

  return items;
}

async function loadTableNotifications(userId) {
  if (!DB_HARDENING) return [];

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) return [];

    return (data || []).map((row) => ({
      id: `db-${row.id}`,
      dbId: row.id,
      dedupe: `${row.type}-${row.order_id}`,
      title: row.title,
      body: row.body,
      link: row.link,
      date: row.created_at,
      readAtServer: Boolean(row.read_at)
    }));
  } catch {
    return [];
  }
}

export function useNotifications(userId) {
  const [items, setItems] = useState([]);
  const [readSet, setReadSet] = useState(() => new Set());

  const refresh = useCallback(async () => {
    if (!userId) {
      setItems([]);
      return;
    }

    setReadSet(loadRead(userId));

    let derived = [];
    try {
      derived = deriveOrderNotifications(await getStoredOrders(userId), userId);
    } catch {
      derived = [];
    }

    const fromTable = await loadTableNotifications(userId);
    const tableOrderTypes = new Set(fromTable.map((n) => n.dedupe));
    const merged = [...fromTable, ...derived.filter((n) => !tableOrderTypes.has(n.id))];

    merged.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    setItems(merged.slice(0, 30));
  }, [userId]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 60000);
    return () => clearInterval(timer);
  }, [refresh]);

  const markAllRead = useCallback(() => {
    if (!userId) return;
    const next = new Set(readSet);
    items.forEach((n) => next.add(n.id));
    saveRead(userId, next);
    setReadSet(next);

    if (DB_HARDENING) {
      supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", userId)
        .is("read_at", null)
        .then(() => {}, () => {});
    }
  }, [items, readSet, userId]);

  const unread = items.filter((n) => !readSet.has(n.id) && !n.readAtServer).length;

  return { items, unread, markAllRead, refresh, isRead: (n) => readSet.has(n.id) || n.readAtServer };
}
