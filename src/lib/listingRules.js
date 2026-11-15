/*
 * Règles de qualité d'annonce (cahier L4.8) partagées entre création et modification.
 */
import { BRAND_OPTIONS } from "./brands";

export const MIN_DESCRIPTION_LENGTH = 20;
export const MIN_LUXURY_PROOF_PHOTOS = 4;

/* Marques à contrôle renforcé (contrefaçon fréquente) */
export const LUXURY_BRANDS = [
  "louis vuitton", "gucci", "chanel", "hermes", "hermès", "prada", "dior", "balenciaga",
  "rolex", "cartier", "burberry", "fendi", "versace", "saint laurent", "ysl", "celine",
  "bottega veneta", "omega", "tiffany", "givenchy", "valentino", "goyard", "loewe"
];

export function isLuxuryBrand(brand) {
  const b = String(brand || "").trim().toLowerCase();
  return b.length > 0 && LUXURY_BRANDS.some((name) => b === name || b.includes(name));
}

/** Retourne { champ: message } ; vide = valide. */
export function validateListingText({ title, description, price, brand, photoCount, isEdit = false }) {
  const errors = {};
  if (String(title || "").trim().length < 3) errors.title = "Add a title (at least 3 characters).";
  if (String(description || "").trim().length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `Describe your item in at least ${MIN_DESCRIPTION_LENGTH} characters (condition, size, flaws).`;
  }
  const value = Number(price);
  if (!Number.isFinite(value) || value < 1) errors.price = "Enter a price of at least ₱1.";
  if (photoCount < 1) errors.photos = "Add at least one photo.";
  if (isLuxuryBrand(brand) && photoCount < MIN_LUXURY_PROOF_PHOTOS) {
    errors.photos = `Luxury brands need at least ${MIN_LUXURY_PROOF_PHOTOS} photos including label, serial number or proof of purchase.`;
  }
  return errors;
}

/* Cohérence meet-up (cahier L3.4) : la description mentionne-t-elle un meet-up ? */
export function mentionsMeetup(text) {
  return /\bmeet[\s-]?ups?\b|\bmeetup\b|\bmeet in person\b|\bpossible meet\b/i.test(String(text || ""));
}

export { BRAND_OPTIONS };
