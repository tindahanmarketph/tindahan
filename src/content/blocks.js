/* Petits constructeurs de blocs pour les pages d'information.
   Texte enrichi : **gras** et [libellé](/chemin ou https://…) */
export const p = (x) => ({ t: "p", x });
export const h3 = (x) => ({ t: "h3", x });
export const ul = (...items) => ({ t: "ul", items });
export const ol = (...items) => ({ t: "ol", items });
export const note = (x, tone = "info") => ({ t: "note", x, tone });
export const table = (head, rows) => ({ t: "table", head, rows });
export const section = (id, title, ...blocks) => ({ id, title, blocks });
