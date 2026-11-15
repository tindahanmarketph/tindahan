/*
 * Aide géographique légère (cahier Lot 5 : tri par proximité + délai estimé par région).
 * HYPOTHÈSE : la localisation d'une annonce est un texte libre ("Makati", "Cebu City"…).
 * On la rattache à un grand groupe (Metro Manila / Luzon / Visayas / Mindanao) par mots-clés.
 * Les délais sont des ESTIMATIONS à valider avec les transporteurs (non contractuelles).
 */

const METRO_MANILA = [
  "metro manila", "ncr", "manila", "makati", "taguig", "bgc", "pasig", "quezon city", "mandaluyong",
  "san juan", "marikina", "pasay", "paranaque", "parañaque", "las pinas", "las piñas", "muntinlupa",
  "caloocan", "valenzuela", "malabon", "navotas", "pateros"
];
const LUZON = [
  "luzon", "cavite", "laguna", "batangas", "rizal", "bulacan", "pampanga", "tarlac", "baguio", "benguet",
  "ilocos", "pangasinan", "nueva ecija", "bataan", "zambales", "quezon", "albay", "legazpi", "naga",
  "cagayan", "isabela", "angeles", "antipolo", "calamba", "dasmarinas", "dasmariñas", "bicol", "palawan"
];
const VISAYAS = [
  "visayas", "cebu", "mandaue", "lapu", "iloilo", "bacolod", "negros", "bohol", "tacloban", "leyte",
  "samar", "dumaguete", "aklan", "boracay", "capiz", "siquijor", "guimaras"
];
const MINDANAO = [
  "mindanao", "davao", "cagayan de oro", "zamboanga", "general santos", "gensan", "butuan", "cotabato",
  "iligan", "surigao", "bukidnon", "caraga", "sultan kudarat", "marawi", "tagum"
];

const norm = (v) =>
  String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const has = (text, list) => list.some((k) => text.includes(norm(k)));

export function regionGroup(...parts) {
  const text = norm(parts.filter(Boolean).join(" "));
  if (!text) return "unknown";
  if (has(text, METRO_MANILA)) return "metro_manila";
  if (has(text, MINDANAO)) return "mindanao";
  if (has(text, VISAYAS)) return "visayas";
  if (has(text, LUZON)) return "luzon";
  return "unknown";
}

/** 0 = même ville/lieu, 1 = même groupe de régions, 2 = groupe voisin, 3 = loin / inconnu. */
export function proximityScore(listingLocation, ref) {
  const refText = norm([ref?.city, ref?.province, ref?.region].filter(Boolean).join(" "));
  const loc = norm(listingLocation);
  if (!refText || !loc) return 3;
  const refCity = norm(ref?.city);
  if (refCity && (loc.includes(refCity) || refCity.includes(loc))) return 0;
  const a = regionGroup(listingLocation);
  const b = regionGroup(refText);
  if (a === "unknown" || b === "unknown") return 3;
  if (a === b) return 1;
  const near = { metro_manila: ["luzon"], luzon: ["metro_manila"], visayas: [], mindanao: [] };
  return (near[a] || []).includes(b) ? 2 : 3;
}

export function sortByProximity(listings, ref) {
  return [...listings]
    .map((l, i) => ({ l, i, s: proximityScore(l.location, ref) }))
    .sort((x, y) => x.s - y.s || x.i - y.i)
    .map((x) => x.l);
}

const SAME = { metro_manila: [2, 4], luzon: [3, 5], visayas: [3, 5], mindanao: [3, 5] };

/** Délai de livraison estimé en jours ouvrés [min, max], ou null si on ne sait pas. */
export function estimateDeliveryDays(sellerLocation, buyerAddress) {
  const from = regionGroup(sellerLocation);
  const to = regionGroup(buyerAddress?.city, buyerAddress?.province, buyerAddress?.region);
  if (from === "unknown" || to === "unknown") return null;
  if (from === to) return SAME[from];
  const set = new Set([from, to]);
  if (set.has("metro_manila") && set.has("luzon")) return [3, 5];
  if (set.has("mindanao") || set.has("visayas")) return [5, 9];
  return [4, 7];
}

export function formatDeliveryEstimate(range) {
  if (!range) return "Delivery time depends on the courier and the seller's location.";
  return `Estimated delivery: ${range[0]}–${range[1]} working days after the seller ships (estimate, not guaranteed).`;
}
