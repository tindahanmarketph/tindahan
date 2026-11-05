/*
 * Vérification d'identité (âge 18+ et pièce d'identité) — MODE SIMULATION.
 *
 * Prototype : les photos ne quittent pas l'appareil, la vérification est
 * acceptée automatiquement et seul le STATUT est mémorisé dans le navigateur.
 * En production : remplacer submitIdentity() par l'envoi des photos vers un
 * stockage privé + contrôle (IA puis revue manuelle si doute), et lire le
 * statut depuis la base (voir SPEC-VERIFICATION-IDENTITE.md).
 */

export const IDENTITY_MODE = "simulation"; // "simulation" | "live"
export const MIN_AGE = 18;

export const ID_TYPES = [
  { id: "philid", label: "Philippine National ID (PhilID)", both: true },
  { id: "drivers", label: "Driver's License", both: true },
  { id: "passport", label: "Passport", both: false },
  { id: "umid", label: "UMID", both: true },
  { id: "prc", label: "PRC ID", both: true },
  { id: "postal", label: "Postal ID", both: true },
  { id: "other", label: "Other government photo ID", both: true }
];

const key = (userId) => `tindahan_identity_${userId}`;

export function getAge(birthDate, now = new Date()) {
  const d = new Date(`${birthDate}T00:00:00`);
  if (!birthDate || Number.isNaN(d.getTime())) return null;
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

export function isAdult(birthDate) {
  const age = getAge(birthDate);
  return age !== null && age >= MIN_AGE;
}

export function loadIdentity(userId) {
  if (!userId) return null;
  try {
    return JSON.parse(localStorage.getItem(key(userId)) || "null");
  } catch {
    return null;
  }
}

export function isIdentityVerified(userId) {
  return loadIdentity(userId)?.status === "verified";
}

/* Simule l'envoi + le contrôle. Ne mémorise AUCUNE photo ni numéro de pièce. */
export async function submitIdentity({ userId, birthDate, documentType }) {
  if (!userId) throw new Error("You need to be logged in.");
  if (!isAdult(birthDate)) throw new Error(`You must be at least ${MIN_AGE} years old to use TindaHan.`);

  await new Promise((resolve) => setTimeout(resolve, 600));

  const record = {
    status: "verified",
    test: true,
    document_type: documentType,
    birth_date: birthDate,
    verified_at: new Date().toISOString()
  };
  try {
    localStorage.setItem(key(userId), JSON.stringify(record));
  } catch {
    /* stockage indisponible : la vérification de test sera redemandée */
  }
  return record;
}
