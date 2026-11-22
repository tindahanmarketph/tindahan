// src/lib/sizeFormat.js
// Uniformise l'affichage des tailles de vêtements : "Medium", "small", "medium small",
// "XS · US 0–2" ... deviennent M, S, S/M, XS ...
// Les tailles numériques (chaussures, pantalons : 38, 28, US 8) restent inchangées.

const SCALE = [
  "XXXS",
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
  "4XL",
  "5XL",
  "6XL",
  "7XL",
  "8XL",
  "9XL"
];

// Variantes d'écriture -> taille standard
const ALIASES = {
  xxxs: "XXXS",
  "3xs": "XXXS",
  xxs: "XXS",
  "2xs": "XXS",
  xs: "XS",
  s: "S",
  sm: "S",
  small: "S",
  m: "M",
  med: "M",
  medium: "M",
  l: "L",
  lg: "L",
  large: "L",
  xl: "XL",
  xxl: "XXL",
  "2xl": "XXL",
  xxxl: "3XL",
  "3xl": "3XL",
  xxxxl: "4XL",
  "4xl": "4XL",
  "5xl": "5XL",
  "6xl": "6XL",
  "7xl": "7XL",
  "8xl": "8XL",
  "9xl": "9XL"
};

// Expressions en plusieurs mots, à remplacer avant de découper
const PHRASES = [
  [/extra extra extra large/g, "3xl"],
  [/extra extra large/g, "xxl"],
  [/extra extra small/g, "xxs"],
  [/extra small/g, "xs"],
  [/extra large/g, "xl"],
  [/double extra large/g, "xxl"],
  [/x x large/g, "xxl"],
  [/x x small/g, "xxs"],
  [/xx large/g, "xxl"],
  [/xx small/g, "xxs"],
  [/x large/g, "xl"],
  [/x small/g, "xs"]
];

export function formatSize(rawSize) {
  const original = String(rawSize ?? "").trim();

  if (!original) return "";

  // Retire "· US 8–10" et les parenthèses : "M (US 8-10)" -> "M"
  const cleaned = original
    .split("·")[0]
    .replace(/\(.*?\)/g, "")
    .trim();

  if (!cleaned) return original;

  let text = cleaned.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ");

  const compact = text.replace(/[\s.]/g, "");

  if (["onesize", "freesize", "os", "taillunique"].includes(compact)) {
    return "One size";
  }

  for (const [pattern, replacement] of PHRASES) {
    text = text.replace(pattern, replacement);
  }

  const tokens = text.split(/[\s/,&+]+/).filter(Boolean);

  const mapped = tokens.map((token) => ALIASES[token]);

  // Si un mot n'est pas une taille de vêtement (38, US 8, Other...), on garde le texte d'origine
  if (mapped.length === 0 || mapped.some((value) => !value)) {
    return cleaned;
  }

  const unique = [...new Set(mapped)].sort(
    (a, b) => SCALE.indexOf(a) - SCALE.indexOf(b)
  );

  return unique.join("/");
}

export default formatSize;