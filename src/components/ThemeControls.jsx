import { Check, Monitor, Moon, Sun } from "lucide-react";
import { THEME_OPTIONS, useTheme } from "../lib/theme";

/* Petit bouton rond pour passer clair <-> sombre (barre de navigation) */
export function ThemeToggleButton({ className = "" }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`theme-toggle-button ${className}`.trim()}
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun size={21} /> : <Moon size={21} />}
    </button>
  );
}

/* Trois boutons compacts (pied de page) */
export function ThemeSegmented() {
  const { preference, setPreference } = useTheme();
  const icons = { light: Sun, dark: Moon, system: Monitor };

  return (
    <div className="theme-segmented" role="radiogroup" aria-label="Appearance">
      {THEME_OPTIONS.map((option) => {
        const Icon = icons[option.value];
        const active = preference === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            className={active ? "active" : ""}
            onClick={() => setPreference(option.value)}
          >
            <Icon size={15} />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* Cartes de choix (Settings > Appearance) avec aperçu */
export function ThemeChoiceCards() {
  const { preference, setPreference } = useTheme();

  return (
    <div className="theme-choice-grid" role="radiogroup" aria-label="Appearance">
      {THEME_OPTIONS.map((option) => {
        const active = preference === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            className={`theme-choice-card ${active ? "active" : ""}`}
            onClick={() => setPreference(option.value)}
          >
            <span className={`theme-preview theme-preview-${option.value}`} aria-hidden="true">
              <span className="theme-preview-bar" />
              <span className="theme-preview-card" />
              <span className="theme-preview-card short" />
              {option.value === "system" && <span className="theme-preview-split" />}
            </span>

            <span className="theme-choice-label">
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </span>

            <span className="theme-choice-check" aria-hidden="true">
              {active && <Check size={16} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
