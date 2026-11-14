/*
 * Recherche tolérante (cahier L4.6) : pluriels, synonymes courants, tous les mots requis.
 * Retourne la valeur du paramètre PostgREST `and` : chaque mot doit apparaître dans
 * le titre, la description ou la marque, sous l'une de ses variantes.
 */

const SYNONYMS = {
  phone: ["cellphone", "mobile", "smartphone"],
  cellphone: ["phone", "mobile", "smartphone"],
  smartphone: ["phone", "cellphone"],
  laptop: ["notebook"],
  notebook: ["laptop"],
  sneaker: ["shoe", "rubber shoe"],
  shoe: ["sneaker"],
  bag: ["handbag", "purse"],
  handbag: ["bag", "purse"],
  tshirt: ["t-shirt", "shirt", "tee"],
  "t-shirt": ["tshirt", "shirt", "tee"],
  fridge: ["refrigerator", "ref"],
  refrigerator: ["fridge"],
  tv: ["television"],
  television: ["tv"],
  sofa: ["couch"],
  couch: ["sofa"],
  bike: ["bicycle"],
  bicycle: ["bike"]
};

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

export function buildSearchAndClause(cleanQuery) {
  const words = String(cleanQuery || "")
    .replace(/[*%\\:"]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .slice(0, 6);

  if (words.length === 0) return null;

  const groups = words.map((word) => {
    const fields = termVariants(word).flatMap((v) => [
      `title.ilike.*${v}*`,
      `description.ilike.*${v}*`,
      `brand.ilike.*${v}*`
    ]);
    return `or(${fields.join(",")})`;
  });

  return `(${groups.join(",")})`;
}
