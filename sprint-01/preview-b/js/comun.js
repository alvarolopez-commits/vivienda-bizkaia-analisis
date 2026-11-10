// Utilidades del prototipo. `es`, `NA`, `reduced` y `announce` reproducen el comportamiento de la web publicada
// (js/ui.js y js/comun.js); `el` es un constructor de nodos mínimo.

export const NA = "sin dato";
export const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** Número en formato español. es(265733) -> '265.733'; es(2.92, 2) -> '2,92'. */
export const es = (v, d = 0) => (isNum(v) ? v.toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: "always" }) : NA);

export const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

let timer;
/** Escribe el aviso para lectores de pantalla en la región de estado. */
export function announce(text, wait = 0) {
  const node = document.querySelector("[data-anuncio]");
  if (!node) return;
  clearTimeout(timer);
  timer = setTimeout(() => { node.textContent = text; }, wait);
}

/** el("a", { href }, [hijos]) */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "text") node.textContent = v;
    else if (v === false || v == null) continue;
    else node.setAttribute(k, v === true ? "" : v);
  }
  node.append(...[].concat(children));
  return node;
}

// Colores de los 7 tipos de municipio (copiados de la web publicada, js/ui.js). Siempre van con su nombre al lado.
export const TYPE_COLORS = {
  bilbao: "#2e4a67",
  costa_turistica: "#d0878c",
  expansion: "#8f4c53",
  urbano_renta_baja: "#5584b4",
  urbano_renta_alta: "#86cbd3",
  villa: "#778a2d",
  rural: "#cad3a6",
};

/** Dirección de la web publicada a la que llevan los enlaces del prototipo. */
export const ORIGEN = "https://vizcaya-vivienda-analisis.vercel.app/";
