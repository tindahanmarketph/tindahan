import { useCallback, useSyncExternalStore } from "react";

/*
 * Choix de stockage / cookies (Cookie settings).
 * - necessary : toujours actif
 * - preferences, analytics, marketing : optionnels, désactivés par défaut
 * Aujourd'hui TindaHan n'utilise ni outil d'analyse ni publicité : ces choix
 * serviront de garde-fou si on en ajoute (appeler hasConsent("analytics")
 * avant de charger quoi que ce soit).
 */

export const CONSENT_KEY = "tindahan_cookie_consent_v1";
export const CONSENT_EVENT = "tindahan-consent-change";
const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

function read() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (!data?.decided) return null;

    if (data.savedAt && Date.now() - new Date(data.savedAt).getTime() > CONSENT_MAX_AGE_MS) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

let cachedRaw = undefined;
let cachedValue = null;

function getSnapshot() {
  const raw =
    typeof window === "undefined" ? null : window.localStorage.getItem(CONSENT_KEY);

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = read();
  }

  return cachedValue;
}

function subscribe(callback) {
  window.addEventListener(CONSENT_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(CONSENT_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function saveConsent({ preferences = false, analytics = false, marketing = false }) {
  const value = {
    necessary: true,
    preferences: Boolean(preferences),
    analytics: Boolean(analytics),
    marketing: Boolean(marketing),
    decided: true,
    version: 1,
    savedAt: new Date().toISOString()
  };

  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }

  window.dispatchEvent(new Event(CONSENT_EVENT));
  return value;
}

export function hasConsent(category) {
  if (category === "necessary") return true;
  return Boolean(read()?.[category]);
}

export function useConsent() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const accept = useCallback((values) => saveConsent(values), []);
  return { consent, decided: Boolean(consent), save: accept };
}
