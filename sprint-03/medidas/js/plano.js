// Sprint 03 · el Plano evidencia × plazo conectado al estado compartido.
// La geometría (rejilla, posición, radio y color de cada burbuja) es la de js/medidas/burbujas.js, copiada sin cambios:
// ni jitter ni coordenadas nuevas. Lo nuevo: los filtros y la selección vienen del estado único (no hay estado propio) y
// una burbuja puede abrir el panel contextual o sumarse a la comparación.
import { LINE_COLORS } from "../original/js/medidas/burbujas.js";
import { el } from "../original/js/ui.js";
import { CH, CW, EVIDENCE, H, L, popShare, T, TERM, W } from "./calculo.js";

const NS = "http://www.w3.org/2000/svg";
const LIGHT = new Set(["compra", "turistica"]); // sobre estos colores claros, el número va en tinta oscura
const svgEl = (tag, attrs, text) => {
  const n = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  if (text) n.textContent = text;
  return n;
};

/**
 * @param {object} store
 * @param {{ onOpen: (id: string, from: Element) => void, onToggle: (id: string) => void, tip: HTMLElement }} api
 */
export function crearPlano(store, { onOpen, onToggle, tip }) {
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
      const a = svgEl("a", { href: `#medidas/${m.id}`, class: "burbuja", "data-id": m.id, "aria-label": `${m.id} ${m.nombre}: evidencia ${m.evidencia.toLowerCase()}, plazo ${m.plazo}` });
      a.append(svgEl("title", {}, `${m.id} ${m.nombre}`), svgEl("circle", { cx: cx.toFixed(1), cy: cy.toFixed(1), r: Math.max(9, r).toFixed(1), fill: LINE_COLORS[m.linea] }));
      if (r > 15) a.append(svgEl("text", { x: cx.toFixed(1), y: (cy + 4).toFixed(1), "text-anchor": "middle", class: `id${LIGHT.has(m.linea) ? " oscura" : ""}` }, m.id));
      // lo nuevo: el aro de la selección (no mueve nada) y un aro de foco para la medida abierta
      const rr = Math.max(9, r);
      a.append(svgEl("circle", { cx: cx.toFixed(1), cy: cy.toFixed(1), r: (rr + 5).toFixed(1), class: "aro aro-sel", fill: "none" }));
      a.append(svgEl("circle", { cx: cx.toFixed(1), cy: cy.toFixed(1), r: (rr + 5).toFixed(1), class: "aro aro-foco", fill: "none" }));
      svg.append(a);
      dots.push({ m, a, cx, cy, r: rr });
    });
  }

  const showTip = (d) => {
    if (!d) { tip.hidden = true; return; }
    tip.replaceChildren(el("strong", { text: `${d.m.id} ${d.m.nombre}` }), el("span", { text: `Evidencia ${d.m.evidencia.toLowerCase()} · plazo ${d.m.plazo}` }));
    tip.hidden = false;
    const box = tip.parentElement.getBoundingClientRect(), b = d.a.getBoundingClientRect();
    const w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = `${Math.max(8, Math.min(box.width - w - 8, b.left + b.width / 2 - box.left - w / 2))}px`;
    tip.style.top = `${Math.max(8, b.top - box.top - h - 10)}px`;
  };
  dots.forEach((d) => {
    d.a.addEventListener("click", (e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; e.preventDefault(); onOpen(d.m.id, d.a); });
    // Espacio añade o quita de la comparación; Intro abre el panel (un enlace ya responde a Intro)
    d.a.addEventListener("keydown", (e) => { if (e.key === " ") { e.preventDefault(); onToggle(d.m.id); } });
    d.a.addEventListener("pointerenter", () => showTip(d));
    d.a.addEventListener("pointerleave", () => showTip(null));
    d.a.addEventListener("focus", () => showTip(d));
    d.a.addEventListener("blur", () => showTip(null));
  });

  /** visible: ids que cumplen los criterios · sel: ids elegidos para comparar · focus: id abierto en el panel */
  const update = ({ visible, sel, focus }) => {
    for (const { m, a } of dots) {
      const on = visible.has(m.id), picked = sel.has(m.id);
      a.classList.toggle("apagada", !on);
      a.classList.toggle("elegida", picked);
      a.classList.toggle("abierta", m.id === focus);
      a.setAttribute("tabindex", on ? "0" : "-1");
      a.setAttribute("aria-label", `${m.id} ${m.nombre}: evidencia ${m.evidencia.toLowerCase()}, plazo ${m.plazo}${picked ? ", en la comparación" : ""}${on ? "" : ", fuera de los criterios activos"}`);
    }
  };
  return { node: svg, update, dots };
}
