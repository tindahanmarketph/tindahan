/*
 * Drapeaux de fonctionnalités TindaHan (cahier des charges bêta v1.1).
 *
 * VITE_DB_HARDENING=true  -> à activer SEULEMENT après avoir appliqué la
 *   migration SQL supabase/migrations/20261114_beta_hardening.sql.
 *   Active les appels RPC (réservation, annulation, expiration, notifications).
 * VITE_PAYMENTS_LIVE=true -> à activer uniquement quand PayMongo sera réellement
 *   branché. Tant que ce n'est pas "true", le paiement est SIMULÉ et la bannière
 *   "Beta – paiement simulé" s'affiche (décision D6).
 */
const env = import.meta.env || {};

export const DB_HARDENING = env.VITE_DB_HARDENING === "true";
export const PAYMENTS_SIMULATED = env.VITE_PAYMENTS_LIVE !== "true";
export const SOCIAL_LOGIN = env.VITE_SOCIAL_LOGIN === "true";

/* Décisions D1–D3 (valeurs proposées, modifiables ici en un seul endroit). */
export const LISTING_LOCK_MINUTES = 15;
export const SHIPPING_DEADLINE_DAYS = 7;
export const REMINDER_DAYS_BEFORE = [2, 1];
