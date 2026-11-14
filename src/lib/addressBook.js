/*
 * Carnet d'adresses acheteur/vendeur (cahier L2.2 / L2.4).
 * Aucune adresse ni numéro "exemple" n'est jamais pré-rempli : si rien n'est
 * enregistré, on renvoie un objet vide et l'utilisateur doit le compléter.
 * Stockage : localStorage `tindahan_address_<uid>` (même clé que Settings).
 */

export const EMPTY_ADDRESS = {
  fullName: "",
  mobileNumber: "",
  street: "",
  unit: "",
  barangay: "",
  city: "",
  province: "",
  region: "",
  postalCode: "",
  landmark: "",
  notes: ""
};

const PH_MOBILE = /^(\+63|0)9\d{9}$/;
const POSTAL = /^\d{4}$/;

export function addressKey(userId) {
  return `tindahan_address_${userId || "guest"}`;
}

export function loadSavedAddress(userId) {
  try {
    const raw = JSON.parse(localStorage.getItem(addressKey(userId)) || "null");
    if (!raw || typeof raw !== "object") return { ...EMPTY_ADDRESS };
    return { ...EMPTY_ADDRESS, ...raw, unit: raw.unit || raw.landmark || "" };
  } catch {
    return { ...EMPTY_ADDRESS };
  }
}

export function saveAddress(userId, address) {
  try {
    localStorage.setItem(addressKey(userId), JSON.stringify(address));
  } catch {
    /* stockage indisponible : l'adresse reste dans l'état de la page */
  }
}

export function cleanMobile(value) {
  return String(value || "").replace(/[\s-]/g, "");
}

/** Renvoie un objet { champ: "message" } ; vide = adresse valide. */
export function validateAddress(address, { requirePhone = true } = {}) {
  const a = address || {};
  const errors = {};
  const need = (key, label) => {
    if (!String(a[key] || "").trim()) errors[key] = `${label} is required.`;
  };

  need("fullName", "Full name");
  need("street", "Street, building and house number");
  need("barangay", "Barangay");
  need("city", "City / municipality");
  need("province", "Province");

  if (requirePhone) {
    if (!String(a.mobileNumber || "").trim()) {
      errors.mobileNumber = "Mobile number is required.";
    } else if (!PH_MOBILE.test(cleanMobile(a.mobileNumber))) {
      errors.mobileNumber = "Use a Philippine mobile number, e.g. 09171234567 or +639171234567.";
    }
  }

  if (!String(a.postalCode || "").trim()) {
    errors.postalCode = "Postal code is required.";
  } else if (!POSTAL.test(String(a.postalCode).trim())) {
    errors.postalCode = "Postal code must have 4 digits.";
  }

  return errors;
}

export const isAddressValid = (address, options) =>
  Object.keys(validateAddress(address, options)).length === 0;

export function formatAddressLines(address) {
  const a = address || {};
  return [
    a.street,
    a.unit,
    [a.barangay, a.city].filter(Boolean).join(", "),
    [a.province, a.postalCode].filter(Boolean).join(" ")
  ].filter((line) => String(line || "").trim());
}
