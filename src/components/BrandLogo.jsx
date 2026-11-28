/*
 * Logo officiel TindaHan.
 *
 * Le fichier principal doit être placé dans :
 * public/logo-tindahan.png
 *
 * Utilisation :
 * <BrandLogo />
 * <BrandLogo height={36} />
 * <BrandLogo tone="white" />   (logo blanc, pour fond orange ou foncé)
 */

export default function BrandLogo({
  variant = "horizontal",
  tone = "color",
  className = "",
  height = 36,
  alt = "TindaHan"
}) {
  /*
   * tone="white" : logo blanc, à utiliser sur fond orange ou foncé
   * (ex. pied de page). Fichier : public/brand/logo-horizontal-blanc.svg
   */
  let src = "/logo-tindahan.png?v=3";

  if (variant === "symbole") {
    src = "/favicon.svg?v=3";
  } else if (tone === "white") {
    src = "/brand/logo-horizontal-blanc.svg?v=1";
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`brand-logo brand-logo-${variant} ${className}`.trim()}
      style={{
        height: `${height}px`,
        width: "auto",
        maxWidth: "100%",
        objectFit: "contain",
        display: "block"
      }}
      draggable={false}
    />
  );
}