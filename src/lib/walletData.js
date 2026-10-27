import { supabase } from "./supabase";
import { getUserReviewSummary } from "./reviews";

/*
 * Données réelles du portefeuille et des badges, calculées à partir des tables
 * existantes (orders, listings, reviews). Aucune nouvelle table n'est nécessaire.
 */

const NOT_PENDING = ["completed", "cancelled", "canceled", "declined", "refund_requested"];
const SHIPPED = [
  "label_downloaded",
  "courier_pickup_scheduled",
  "dropped_off",
  "in_transit",
  "ready_for_pickup",
  "delivery_scheduled",
  "delivered",
  "completed"
];

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export async function loadSellerOrders(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

function orderTitle(row) {
  return (
    row.item_title ||
    row.listing_title ||
    row.title ||
    row.listing?.title ||
    "Order"
  );
}

/** Solde estimé à partir des ventes de la personne (frais vendeur : 0 %). */
export function summarizeWallet(rows) {
  let pending = 0;
  let available = 0;
  const history = [];

  rows.forEach((row) => {
    const amount = toNumber(row.item_price);
    const status = String(row.status || "");

    if (status === "completed") {
      available += amount;
      history.push({
        id: row.id,
        title: `Sale: ${orderTitle(row)}`,
        amount,
        date: row.updated_at || row.created_at
      });
    } else if (!NOT_PENDING.includes(status)) {
      pending += amount;
    }
  });

  return { pending, available, history };
}

export async function loadWalletSummary(userId) {
  return summarizeWallet(await loadSellerOrders(userId));
}

/* ---------- badges ---------- */

export function getInviteCount(userId) {
  try {
    return Number(localStorage.getItem(`tindahan_invites_${userId || "guest"}`)) || 0;
  } catch {
    return 0;
  }
}

export function bumpInviteCount(userId) {
  try {
    localStorage.setItem(`tindahan_invites_${userId || "guest"}`, String(getInviteCount(userId) + 1));
  } catch {
    /* ignore */
  }
}

function phoneIsVerified(profile) {
  if (profile?.phone_verified || profile?.phoneVerified) return true;

  try {
    const saved = JSON.parse(localStorage.getItem("tindahan_account_settings") || "{}");
    return Boolean(saved.phone_verified || saved.phoneVerified);
  } catch {
    return false;
  }
}

export async function loadBadgeStats(userId, profile) {
  if (!userId) {
    return { listings: 0, shipped: 0, completedSales: 0, rating: 0, phoneVerified: false, invites: 0 };
  }

  const stats = { listings: 0, shipped: 0, completedSales: 0, rating: 0, phoneVerified: phoneIsVerified(profile), invites: getInviteCount(userId) };

  try {
    const { count } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", userId);
    stats.listings = count || 0;
  } catch {
    /* garde 0 */
  }

  try {
    const orders = await loadSellerOrders(userId);
    stats.shipped = orders.filter((o) => SHIPPED.includes(String(o.status))).length;
    stats.completedSales = orders.filter((o) => o.status === "completed").length;
  } catch {
    /* garde 0 */
  }

  try {
    const summary = await getUserReviewSummary(userId);
    stats.rating = summary.average || 0;
  } catch {
    /* garde 0 */
  }

  return stats;
}

export function evaluateBadges(stats) {
  return [
    { id: "publisher", title: "Active Publisher", text: "List 5 items to earn this badge.", now: stats.listings, goal: 5, cta: { to: "/sell", label: "List an item" } },
    { id: "shipping", title: "Fast Shipping", text: "Ship 3 orders so buyers see you are reliable.", now: stats.shipped, goal: 3, cta: { to: "/orders", label: "Go to orders" } },
    { id: "trusted", title: "Trusted Seller", text: "Complete 10 sales with an average rating of 4.5 or more.", now: stats.rating >= 4.5 ? stats.completedSales : 0, goal: 10, cta: { to: "/orders", label: "Go to orders" } },
    { id: "verified", title: "Verified Member", text: "Verify your mobile number in Account settings.", now: stats.phoneVerified ? 1 : 0, goal: 1, cta: { to: "/settings/account", label: "Verify now" } },
    { id: "community", title: "Community Builder", text: "Invite 3 friends to TindaHan.", now: stats.invites, goal: 3, cta: { to: "/invite", label: "Invite friends" } }
  ].map((badge) => ({ ...badge, earned: badge.now >= badge.goal }));
}
