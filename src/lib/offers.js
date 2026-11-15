/*
 * Validité des offres (cahier L4.4). Valeur proposée : 48 h.
 * - offre « pending » : sans réponse après 48 h => expirée ;
 * - offre « accepted » : le prix accepté est tenu 48 h à partir de l'acceptation.
 * Le statut effectif est calculé à la lecture ; le SQL `expire_stale_offers()` le persiste.
 */
export const OFFER_VALIDITY_HOURS = 48;

export function getOfferExpiry(offer) {
  if (!offer) return null;
  const base = offer.status === "accepted" ? offer.updatedAt || offer.createdAt : offer.createdAt;
  const start = base ? new Date(base) : null;
  if (!start || Number.isNaN(start.getTime())) return null;
  return new Date(start.getTime() + OFFER_VALIDITY_HOURS * 3600000);
}

export function getOfferEffectiveStatus(offer, now = new Date()) {
  if (!offer) return "";
  let status = offer.status === "sent" ? "pending" : offer.status;
  if (status === "pending" || status === "accepted") {
    const expiry = getOfferExpiry(offer);
    if (expiry && now.getTime() > expiry.getTime()) status = "expired";
  }
  return status;
}

export function formatOfferExpiry(offer, now = new Date()) {
  const expiry = getOfferExpiry(offer);
  if (!expiry) return "";
  const hoursLeft = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / 3600000));
  const date = expiry.toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  return hoursLeft > 0 ? `Expires ${date} (${hoursLeft}h left)` : `Expired ${date}`;
}
