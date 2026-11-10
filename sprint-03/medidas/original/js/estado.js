// Fase 8: si cada medida ya se aplica en cada municipio. Etiquetas, colores y la prueba (detalle y fuente) de cada
// casilla. Los estados los calcula analysis/estado_medidas.py; aquí solo se enseñan. La usan Medidas, Mi municipio,
// Comparar y Resumen.
import { el, extLink } from "./ui.js";

export const STATE_KEYS = ["en_uso", "parcial", "en_preparacion", "sin_uso", "no_consta", "nueva_norma"];
// Siempre van con su nombre al lado: el color solo ayuda a ver la tabla de un vistazo
export const STATE_COLORS = {
  en_uso: "#1c5cab", bizkaia: "#8aa9d6", parcial: "#5fb4a8", en_preparacion: "#e0a526",
  sin_uso: "#c0392b", no_consta: "#e6ebf0", nueva_norma: "#6c7480",
};
// Un símbolo por estado, para que la tabla no dependa solo del color
export const STATE_SYMBOLS = { en_uso: "✓", bizkaia: "✓", parcial: "½", en_preparacion: "→", sin_uso: "✕", no_consta: "?", nueva_norma: "N" };
const DARK_TEXT = new Set(["bizkaia", "parcial", "en_preparacion", "no_consta"]);
export const BIZKAIA_LABEL = "En uso en toda Bizkaia (Gobierno Vasco)";

/** Estado de una medida en un municipio y si es del Gobierno Vasco (igual en toda Bizkaia). */
export const stateOf = (m, id) => ({ key: m.estado_medidas.estados[id], bizkaia: m.estado_medidas.toda_bizkaia.includes(id) });

export const stateLabel = (store, s) => (s.bizkaia ? BIZKAIA_LABEL : store.medidas.estado.estados[s.key]);
export const stateColor = (s) => (s.bizkaia ? STATE_COLORS.bizkaia : STATE_COLORS[s.key]);
const stateKey = (s) => (s.bizkaia ? "bizkaia" : s.key);

/** Cuadrado de color con su símbolo (en la tabla, la leyenda y las etiquetas). */
export const stateMark = (s, cls = "state-dot") => el("span", {
  class: cls, style: `background:${stateColor(s)};color:${DARK_TEXT.has(stateKey(s)) ? "#221e41" : "#ffffff"}`, "aria-hidden": "true",
}, [STATE_SYMBOLS[stateKey(s)]]);

/** Etiqueta en línea con el color y el nombre del estado. */
export const stateBadge = (store, s) => el("span", { class: `state-badge state-${stateKey(s)}` }, [stateMark(s), stateLabel(store, s)]);

const MONTH_NAMES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
/** '2026-09' -> 'septiembre de 2026'; '2026' se queda igual. */
const dateText = (d) => {
  const m = /^(\d{4})-(\d{2})/.exec(d);
  return m ? `${MONTH_NAMES[Number(m[2]) - 1]} de ${m[1]}` : d;
};

/** La prueba de una casilla: qué se ha encontrado, con su enlace y, si solo hay prensa, el aviso. */
export const proofNodes = (proof) => {
  if (!proof) return [];
  const one = (p) => [
    p.detalle, " ",
    p.fuente ? extLink(p.fuente, "Fuente") : null,
    p.fecha_dato ? ` (${dateText(p.fecha_dato)})` : null,
    p.dudoso ? el("span", { class: "pill pill-aproximacion pill-inline", text: "Solo prensa: por confirmar" }) : null,
  ];
  return [
    proof.detalle ? el("span", {}, one(proof)) : null,
    ...(proof.complementos || []).map((c) => el("span", { class: "state-extra" }, ["Además: ", ...one(c)])),
  ];
};

/** Municipios en cada estado de una medida, de mayor a menor población dentro de cada grupo. */
export const codesByState = (store, measure) => {
  const pop = (c) => store.municipios[c].poblacion;
  return Object.fromEntries(STATE_KEYS.map((k) => [k, [...(measure.por_estado[k] || [])].sort((a, b) => pop(b) - pop(a))]));
};

/** Leyenda de los estados. */
export const stateLegend = (store, { withBizkaia = true } = {}) => el("ul", { class: "state-legend" }, [
  ...STATE_KEYS.map((k) => ({ key: k, bizkaia: false })), ...(withBizkaia ? [{ key: "en_uso", bizkaia: true }] : []),
].map((s) => el("li", {}, [stateBadge(store, s)])));
