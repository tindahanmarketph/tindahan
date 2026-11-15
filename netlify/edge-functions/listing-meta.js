/*
 * Aperçus de partage par annonce (cahier L4.7).
 * Pour les robots d'aperçu (Facebook, Instagram, WhatsApp, X, Telegram, Google…),
 * on injecte titre / description / image UNIQUES de l'annonce dans le <head>.
 * Les vrais visiteurs reçoivent la page normale (SPA) sans aucun surcoût.
 *
 * Variables Netlify (scope « Functions » ou « All ») :
 *   SUPABASE_URL et SUPABASE_ANON_KEY  (ou à défaut VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
 */

const BOTS =
  /facebookexternalhit|facebot|twitterbot|instagram|whatsapp|slackbot|linkedinbot|telegrambot|discordbot|pinterest|skypeuripreview|googlebot|bingbot|embedly/i;

const ID_PATTERN = /^[0-9a-fA-F-]{8,64}$/;

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const env = (name) => {
  try {
    return globalThis.Netlify?.env?.get(name) || "";
  } catch {
    return "";
  }
};

export default async (request, context) => {
  const userAgent = request.headers.get("user-agent") || "";

  if (!BOTS.test(userAgent)) {
    return context.next();
  }

  const url = new URL(request.url);
  const id = url.pathname.split("/").filter(Boolean).pop() || "";

  if (!ID_PATTERN.test(id)) {
    return context.next();
  }

  const supabaseUrl = env("SUPABASE_URL") || env("VITE_SUPABASE_URL");
  const anonKey = env("SUPABASE_ANON_KEY") || env("VITE_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !anonKey) {
    return context.next();
  }

  let listing = null;

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/listings?id=eq.${encodeURIComponent(id)}&select=title,description,price,photos,status,brand&limit=1`,
      { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
    );
    const rows = response.ok ? await response.json() : [];
    listing = rows?.[0] || null;
  } catch {
    listing = null;
  }

  if (!listing) {
    return context.next();
  }

  const page = await context.next();
  const html = await page.text();

  const isSold = ["sold", "completed"].includes(String(listing.status).toLowerCase());
  const price = `₱${Number(listing.price || 0).toLocaleString("en-PH")}`;
  const title = `${isSold ? "[SOLD] " : ""}${listing.title} – ${price} | TindaHan`;
  const rawDescription = String(listing.description || "").replace(/\s+/g, " ").trim();
  const description = (rawDescription || `${listing.title} on TindaHan, with Buyer Protection.`).slice(0, 200);
  const image = Array.isArray(listing.photos) ? listing.photos.find(Boolean) : "";

  const tags = [
    `<meta property="og:type" content="product" />`,
    `<meta property="og:site_name" content="TindaHan" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url.origin + url.pathname)}" />`,
    image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : "",
    `<meta property="product:price:amount" content="${escapeHtml(Number(listing.price || 0))}" />`,
    `<meta property="product:price:currency" content="PHP" />`,
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : "",
    `<meta name="description" content="${escapeHtml(description)}" />`
  ]
    .filter(Boolean)
    .join("\n    ");

  let output = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta\s+(?:property|name)="(?:og:[^"]*|twitter:[^"]*|description|product:[^"]*)"[^>]*>\s*/gi, "");

  output = output.replace(/<\/head>/i, `    ${tags}\n  </head>`);

  return new Response(output, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300"
    }
  });
};


