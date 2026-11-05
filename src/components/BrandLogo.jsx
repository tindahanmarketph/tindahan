/*
 * Logo officiel TindaHan.
 *
 * Le fichier principal doit être placé dans :
 * public/logo-tindahan.png
 *
 * Utilisation :
 * <BrandLogo />
 * <BrandLogo height={36} />
 */

export default function BrandLogo({
  variant = "horizontal",
  className = "",
  height = 36,
  alt = "TindaHan"
}) {
  const src =
    variant === "symbole"
      ? "/favicon.svg?v=3"
      : "/logo-tindahan.png?v=3";

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