// src/lib/sizeFormat.js
// Uniformise l'affichage des tailles de vêtements : "Medium", "small", "medium small",
// "XS · US 0–2" ... deviennent M, S, S/M, XS ...
// Les tailles numériques (chaussures, pantalons : 38, 28, US 8) restent inchangées.
//
// formatSize(...)     -> forme courte (S, M, XL) : fil d'actualité, cartes de la grille
// formatSizeLong(...) -> forme complète (Small, Medium, Extra large) : page de l'annonce

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

const LONG_NAMES = {
  XXXS: "Extra extra extra small",
  XXS: "Extra extra small",
  XS: "Extra small",
  S: "Small",
  M: "Medium",
  L: "Large",
  XL: "Extra large",
  XXL: "Extra extra large"
};

// Retourne { letters: ["S","M"] } pour une taille de vêtement,
// ou { text: "38" } si ce n'est pas une taille en lettres.
function parseSize(rawSize) {
  const original = String(rawSize ?? "").trim();

  if (!original) return { text: "" };

  // Retire "· US 8–10" et les parenthèses : "M (US 8-10)" -> "M"
  const cleaned = original
    .split("·")[0]
    .replace(/\(.*?\)/g, "")
    .trim();

  if (!cleaned) return { text: original };

  let text = cleaned.toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ");

  const compact = text.replace(/[\s.]/g, "");

  if (["onesize", "freesize", "os", "taillunique"].includes(compact)) {
    return { text: "One size" };
  }

  for (const [pattern, replacement] of PHRASES) {
    text = text.replace(pattern, replacement);
  }

  const tokens = text.split(/[\s/,&+]+/).filter(Boolean);

  const mapped = tokens.map((token) => ALIASES[token]);

  // Si un mot n'est pas une taille de vêtement (38, US 8, Other...), on garde le texte d'origine
  if (mapped.length === 0 || mapped.some((value) => !value)) {
    return { text: cleaned };
  }

  const letters = [...new Set(mapped)].sort(
    (a, b) => SCALE.indexOf(a) - SCALE.indexOf(b)
  );

  return { letters };
}

// Forme courte : M, S, XL, S/M ...
export function formatSize(rawSize) {
  const parsed = parseSize(rawSize);

  return parsed.letters ? parsed.letters.join("/") : parsed.text;
}

// Forme complète : Medium, Small, Extra large, Small / Medium ...
export function formatSizeLong(rawSize) {
  const parsed = parseSize(rawSize);

  if (!parsed.letters) return parsed.text;

  return parsed.letters.map((size) => LONG_NAMES[size] || size).join(" / ");
}

export default formatSize;