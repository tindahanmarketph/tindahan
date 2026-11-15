import { CATEGORIES } from "./categories";

/*
 * Recherche tolérante (cahier L4.6) : pluriels, synonymes courants, tous les mots requis.
 * Retourne la valeur du paramètre PostgREST `and` : chaque mot doit apparaître dans
 * le titre, la description ou la marque, sous l'une de ses variantes.
 */

const SYNONYM_GROUPS = [
  ["phone", "cellphone", "mobile", "smartphone", "telepono", "cp", "telephone", "téléphone", "portable"],
  ["laptop", "notebook", "ordinateur", "computer"],
  ["shoe", "sneaker", "sapatos", "sapato", "chaussure", "tsinelas"],
  ["bag", "handbag", "purse", "bolsa", "sac", "sacoche"],
  ["shirt", "tshirt", "t-shirt", "tee", "kamiseta", "chemise"],
  ["dress", "gown", "robe", "bestida"],
  ["pants", "trousers", "jeans", "pantalon", "pantalon"],
  ["watch", "relo", "montre", "wristwatch"],
  ["fridge", "refrigerator", "ref", "frigo", "refrigerateur"],
  ["tv", "television", "télévision", "telebisyon"],
  ["sofa", "couch", "canapé", "canape"],
  ["bike", "bicycle", "bisikleta", "vélo", "velo"],
  ["baby", "bebe", "bébé", "sanggol"],
  ["kids", "children", "bata", "enfant", "enfants"],
  ["jacket", "coat", "jaket", "veste", "manteau"],
  ["book", "libro", "livre"],
  ["toy", "laruan", "jouet"],
  ["earphones", "headphones", "earbuds", "écouteurs", "ecouteurs"]
];

const SYNONYMS = SYNONYM_GROUPS.reduce((map, group) => {
  group.forEach((word) => {
    map[word] = group.filter((other) => other !== word);
  });
  return map;
}, {});

export function singularize(word) {
  const w = String(word || "").toLowerCase();
  if (w.length <= 3) return w;
  if (/ies$/.test(w) && w.length > 4) return `${w.slice(0, -3)}y`;
  if (/(ches|shes|xes|sses|zes)$/.test(w)) return w.slice(0, -2);
  if (/[^s]s$/.test(w)) return w.slice(0, -1);
  return w;
}

export function termVariants(word) {
  const base = singularize(word);
  const variants = new Set([String(word).toLowerCase(), base, `${base}s`]);
  [...variants].forEach((v) => (SYNONYMS[v] || []).forEach((s) => variants.add(s)));
  return [...variants].filter((v) => v.length >= 2);
}

/* Catégories / sous-catégories dont le libellé correspond à l'un des mots (cahier L4.5). */
function categoryMatches(variants) {
  const wanted = new Set(variants.map(singularize));
  const clauses = [];

  CATEGORIES.forEach((category) => {
    if (wanted.has(singularize(category.label))) clauses.push(`category.eq.${category.id}`);
    (category.subcategories || []).forEach((sub) => {
      if (wanted.has(singularize(sub.label))) clauses.push(`subcategory.eq.${sub.id}`);
    });
  });

  return clauses;
}

export function buildSearchAndClause(cleanQuery) {
  const words = String(cleanQuery || "")
    .replace(/[*%\\:"]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .slice(0, 6);

  if (words.length === 0) return null;

  const groups = words.map((word) => {
    const variants = termVariants(word);
    const fields = [
      ...variants.flatMap((v) => [
        `title.ilike.*${v}*`,
        `description.ilike.*${v}*`,
        `brand.ilike.*${v}*`
      ]),
      ...categoryMatches(variants)
    ];
    return `or(${fields.join(",")})`;
  });

  return `(${groups.join(",")})`;
}

/* Tri par pertinence (défaut quand une recherche est active) : titre > marque > catégorie > description. */
export function rankByRelevance(rows, cleanQuery) {
  const words = String(cleanQuery || "").toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return rows;

  const score = (row) => {
    const title = String(row.title || "").toLowerCase();
    const brand = String(row.brand || "").toLowerCase();
    const description = String(row.description || "").toLowerCase();
    let total = 0;

    words.forEach((word) => {
      const variants = termVariants(word);
      if (variants.some((v) => new RegExp(`\\b${v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(title))) total += 10;
      else if (variants.some((v) => title.includes(v))) total += 6;
      if (variants.some((v) => brand.includes(v))) total += 4;
      if (variants.some((v) => description.includes(v))) total += 2;
      if (categoryMatches(variants).some((clause) => clause.endsWith(`.${row.category}`) || clause.endsWith(`.${row.subcategory}`))) total += 5;
    });

    return total;
  };

  return rows
    .map((row, index) => ({ row, index, value: score(row) }))
    .sort((a, b) => b.value - a.value || a.index - b.index)
    .map((entry) => entry.row);
}
