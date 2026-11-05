/*
 * Boosts d'annonces — MODE SIMULATION (prototype).
 * Aucun vrai paiement : le "paiement" est simulé et les boosts sont stockés
 * dans le navigateur (localStorage). Pour passer en production plus tard :
 * remplacer payBoost() par l'appel à la fonction serveur PayMongo
 * (voir SPEC-BOOST-PAYMONGO.md) et lire les boosts depuis la table `boosts`.
 */

export const PAYMENT_MODE = "simulation"; // "simulation" | "paymongo"

export const BOOST_PLANS = [
  { id: "boost_1d", days: 1, price: 29, views: "≈ 150 more views" },
  { id: "boost_3d", days: 3, price: 69, views: "≈ 520 more views" },
  { id: "boost_7d", days: 7, price: 119, views: "≈ 1,300 more views" }
];

export const PAYMENT_METHODS = [
  { id: "gcash", label: "GCash" },
  { id: "maya", label: "Maya" },
  { id: "card", label: "Card" }
];

const DAY_MS = 24 * 60 * 60 * 1000;
const storageKey = (userId) => `tindahan_boosts_${userId || "guest"}`;

export function loadBoosts(userId) {
  try {
    const rows = JSON.parse(localStorage.getItem(storageKey(userId)) || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function saveBoosts(userId, rows) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(rows));
  } catch {
    /* stockage indisponible : le boost simulé n'est alors pas conservé */
  }
}

export function isBoostActive(boost, now = Date.now()) {
  return boost?.status === "active" && new Date(boost.ends_at).getTime() > now;
}

export function getActiveBoost(userId, listingId) {
  return loadBoosts(userId).find((b) => b.listing_id === listingId && isBoostActive(b)) || null;
}

/* Paiement simulé : aucun argent n'est débité. */
export async function payBoost({ userId, listing, planId, methodId }) {
  const plan = BOOST_PLANS.find((p) => p.id === planId);
  if (!plan || !listing?.id) throw new Error("Invalid boost request.");

  await new Promise((resolve) => setTimeout(resolve, 1400));

  const rows = loadBoosts(userId);
  const current = rows.find((b) => b.listing_id === listing.id && isBoostActive(b));
  const start = current ? new Date(current.ends_at).getTime() : Date.now();

  const boost = {
    id: `test_${Date.now()}`,
    listing_id: listing.id,
    listing_title: listing.title || "Listing",
    plan_id: plan.id,
    amount_php: plan.price,
    method: methodId,
    status: "active",
    test: true,
    starts_at: new Date(start).toISOString(),
    ends_at: new Date(start + plan.days * DAY_MS).toISOString(),
    created_at: new Date().toISOString()
  };

  saveBoosts(userId, [boost, ...rows]);
  return boost;
}
