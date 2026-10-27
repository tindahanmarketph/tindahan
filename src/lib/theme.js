import { useCallback, useEffect, useSyncExternalStore } from "react";

/*
 * Thème clair / sombre de TindaHan.
 *
 * Préférence enregistrée dans localStorage ("tindahan_theme") :
 *   "light"  -> toujours clair
 *   "dark"   -> toujours sombre
 *   "system" -> suit le réglage du téléphone ou de l'ordinateur
 *
 * Le choix est une demande explicite de la personne : il est enregistré
 * sur son appareil sans consentement supplémentaire (stockage strictement
 * nécessaire à la fonction demandée). Voir la Cookie Policy.
 */

export const THEME_STORAGE_KEY = "tindahan_theme";
export const THEME_EVENT = "tindahan-theme-change";

// Préférence appliquée tant que la personne n'a rien choisi.
// Mettre "system" pour suivre automatiquement l'appareil.
export const DEFAULT_THEME_PREFERENCE = "light";

export const THEME_COLORS = { light: "#F26A1B", dark: "#12181F" };

export const THEME_OPTIONS = [
  { value: "light", label: "Light", description: "Bright and warm, the TindaHan look." },
  { value: "dark", label: "Dark", description: "Easier on the eyes at night and on OLED screens." },
  { value: "system", label: "Automatic", description: "Follows your device settings." }
];

function isValid(value) {
  return value === "light" || value === "dark" || value === "system";
}

export function getStoredThemePreference() {
  if (typeof window === "undefined") return DEFAULT_THEME_PREFERENCE;

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isValid(stored) ? stored : DEFAULT_THEME_PREFERENCE;
  } catch {
    return DEFAULT_THEME_PREFERENCE;
  }
}

function systemPrefersDark() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function resolveTheme(preference) {
  if (preference === "dark") return "dark";
  if (preference === "light") return "light";
  return systemPrefersDark() ? "dark" : "light";
}

export function applyTheme(preference = getStoredThemePreference()) {
  if (typeof document === "undefined") return "light";

  const theme = resolveTheme(preference);
  const root = document.documentElement;

  root.setAttribute("data-theme", theme);
  root.setAttribute("data-theme-preference", preference);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLORS[theme]);

  return theme;
}

export function setThemePreference(preference) {
  if (!isValid(preference)) return;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    /* stockage indisponible : le thème s'applique quand même pour la session */
  }

  applyTheme(preference);
  window.dispatchEvent(new Event(THEME_EVENT));
}

function subscribe(callback) {
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", callback);

  const media =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;

  media?.addEventListener?.("change", callback);

  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", callback);
    media?.removeEventListener?.("change", callback);
  };
}

/** Hook : { preference, theme, setPreference, toggle } */
export function useTheme() {
  const preference = useSyncExternalStore(
    subscribe,
    getStoredThemePreference,
    () => DEFAULT_THEME_PREFERENCE
  );

  const theme = useSyncExternalStore(
    subscribe,
    () => resolveTheme(getStoredThemePreference()),
    () => "light"
  );

  // Garde l'attribut <html> synchronisé (changement de réglage système, autre onglet…)
  useEffect(() => {
    applyTheme(preference);
  }, [preference, theme]);

  const setPreference = useCallback((value) => setThemePreference(value), []);

  const toggle = useCallback(() => {
    setThemePreference(resolveTheme(getStoredThemePreference()) === "dark" ? "light" : "dark");
  }, []);

  return { preference, theme, setPreference, toggle };
}
