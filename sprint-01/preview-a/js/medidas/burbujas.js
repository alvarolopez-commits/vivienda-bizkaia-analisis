// Las 34 medidas en un plano: arriba lo que más ha funcionado en otros sitios (evidencia), a la izquierda lo que da
// resultados antes (plazo). El tamaño de cada burbuja es la población de los municipios donde se propone y el color, su
// línea de actuación. Los filtros apagan las que no cumplen, con una transición; tocar una burbuja abre su ficha.
import { announce } from "../comun.js";
import { el, es } from "../ui.js";

export const LINE_COLORS = { oferta: "#1a4d7a", parque: "#5d6d1f", alquiler: "#b4545b", compra: "#86bfc6", turistica: "#f4a6a6", vigilancia: "#4d5a6a" };
const LIGHT = new Set(["compra", "turistica"]); // sobre estos colores claros, el número va en tinta oscura
const EVIDENCE = ["Alta", "Media-alta", "Media", "Media-baja", "Baja"];
const TERM = [["corto", "Corto plazo"], ["medio", "Medio plazo"], ["largo", "Largo plazo"]];
const NS = "http://www.w3.org/2000/svg";
const W = 960, H = 560, L = 120, T = 20, CW = (W - L) / 3, CH = (H - T - 40) / 5;

const popShare = (store, m) => {
  const w = m.municipios, codes = [...new Set([...w.plan, ...w.probada, ...w.piloto])];
  return codes.reduce((n, c) => n + store.municipios[c].poblacion, 0) / store.meta.poblacion_total;
};
const svgEl = (tag, attrs, text) => {
  const n = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  if (text) n.textContent = text;
  return n;
};

export function burbujas(store) {
  const M = store.medidas;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "burbujas", role: "group", "aria-label": "Las medidas por evidencia y plazo" });
  // la rejilla: filas de evidencia y columnas de plazo
  EVIDENCE.forEach((e, i) => {
    svg.append(svgEl("rect", { x: L, y: T + i * CH, width: W - L, height: CH, fill: i % 2 ? "#e5ecf2" : "#dce5ed" }));
    svg.append(svgEl("text", { x: L - 14, y: T + i * CH + CH / 2 + 5, "text-anchor": "end", class: "eje" }, e));
  });
  TERM.forEach(([, t], j) => svg.append(svgEl("text", { x: L + j * CW + CW / 2, y: H - 12, "text-anchor": "middle", class: "eje" }, t)));
  // las burbujas, en su casilla, en una pequeña rejilla de más grande a más pequeña
  const cells = {};
  M.medidas.forEach((m) => { const k = `${m.evidencia}|${m.plazo}`; (cells[k] ??= []).push(m); });
  const dots = [];
  for (const [k, list] of Object.entries(cells)) {
    const [ev, term] = k.split("|"), i = EVIDENCE.indexOf(ev), j = TERM.findIndex(([t]) => t === term);
    list.sort((a, b) => popShare(store, b) - popShare(store, a));
    const cols = Math.ceil(Math.sqrt(list.length * (CW / CH))), rows = Math.ceil(list.length / cols);
    list.forEach((m, n) => {
      const cx = L + j * CW + (CW / cols) * ((n % cols) + 0.5), cy = T + i * CH + (CH / rows) * (Math.floor(n / cols) + 0.5);
      const r = Math.min(CH / rows, CW / cols) * 0.46 * (0.45 + 0.55 * Math.sqrt(popShare(store, m)));
      const a = svgEl("a", { href: `#medidas/${m.id}`, class: "burbuja", "aria-label": `${m.id} ${m.nombre}: evidencia ${m.evidencia.toLowerCase()}, plazo ${m.plazo}` });
      a.append(svgEl("title", {}, `${m.id} ${m.nombre}`), svgEl("circle", { cx: cx.toFixed(1), cy: cy.toFixed(1), r: Math.max(9, r).toFixed(1), fill: LINE_COLORS[m.linea] }));
      if (r > 15) a.append(svgEl("text", { x: cx.toFixed(1), y: (cy + 4).toFixed(1), "text-anchor": "middle", class: `id${LIGHT.has(m.linea) ? " oscura" : ""}` }, m.id));
      svg.append(a);
      dots.push({ m, a });
    });
  }
  const st = { linea: "", ya: false };
  const paint = () => {
    let n = 0;
    for (const { m, a } of dots) {
      const on = (!st.linea || m.linea === st.linea) && (!st.ya || m.viabilidad === "instrumento_existente");
      a.classList.toggle("apagada", !on);
      a.setAttribute("tabindex", on ? "0" : "-1");
      n += on ? 1 : 0;
    }
    count.textContent = `${es(n)} de ${es(M.medidas.length)} medidas.`;
    if (ready) announce(`${n} medidas a la vista`, 300);
  };
  let ready = false;
  const count = el("p", { class: "fuente" });
  const lines = [["", "Todas"], ...Object.entries(M.lineas).map(([k, v]) => [k, v.split(":")[0]])];
  const lineButtons = lines.map(([k, t]) => el("button", { type: "button", class: "opcion", "aria-pressed": String(k === ""), style: k ? `--punto:${LINE_COLORS[k]}` : null, text: t }));
  lineButtons.forEach((b, i) => b.addEventListener("click", () => { st.linea = lines[i][0]; lineButtons.forEach((o) => o.setAttribute("aria-pressed", String(o === b))); paint(); }));
  const ya = el("button", { type: "button", class: "opcion", "aria-pressed": "false", text: "Solo las que se pueden aplicar ya" });
  ya.addEventListener("click", () => { st.ya = !st.ya; ya.setAttribute("aria-pressed", String(st.ya)); paint(); });
  paint();
  ready = true;
  return el("div", { class: "burbujas-caja" }, [
    el("div", { class: "x-botones filtro-lineas", role: "group", "aria-label": "Línea de actuación", "data-control": "" }, [...lineButtons, ya]),
    el("div", { class: "burbujas-marco" }, [svg]),
    count,
  ]);
}
