import { useTheme } from "../lib/theme";

/*
 * Logo TindaHan du kit (version « Sac affiné »).
 * - fond clair  -> variante "couleur"
 * - fond sombre -> variante "sombre"
 * variant : "horizontal" | "vertical" | "symbole"
 * tone    : "orange" pour poser le logo sur un fond orange
 */
export default function BrandLogo({
  variant = "horizontal",
  className = "",
  height,
  tone: forcedTone,
  alt = "TindaHan"
}) {
  const { theme } = useTheme();
  // forcedTone : "orange" pour les fonds orange (pied de page), sinon selon le thème
  const tone = forcedTone || (theme === "dark" ? "sombre" : "couleur");

  return (
    <img
      src={`/brand/${variant === "symbole" ? "symbole" : `logo-${variant}`}-${tone}.svg`}
      alt={alt}
      className={`brand-logo brand-logo-${variant} ${className}`.trim()}
      style={height ? { height } : undefined}
      draggable="false"
    />
  );
}
