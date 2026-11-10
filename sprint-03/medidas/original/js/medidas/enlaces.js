// Un esquema de columnas unidas por líneas: la cadena de cada línea de actuación (problema → cómo actúa → medida → qué
// vigilar) y «Quién decide» (nivel de gobierno → medida → papel de BM30). Cada columna es una lista que se lee sola; las
// líneas se dibujan encima en SVG y se recalculan al cambiar el tamaño. Al pasar o enfocar una medida se encienden sus
// líneas y lo que une.
import { el } from "../ui.js";

const NS = "http://www.w3.org/2000/svg";

/**
 * @param {{ columns: {title: string, items: {id: string, label: string, href?: string, cls?: string}[]}[], links: [string, string][], label: string }} spec
 */
export function linkDiagram({ columns, links, label }) {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "enlaces-lineas");
  svg.setAttribute("aria-hidden", "true");
  const nodes = {};
  const cols = columns.map((c) => el("div", { class: "enlaces-col" }, [
    el("p", { class: "enlaces-titulo", text: c.title }),
    el("ul", {}, c.items.map((it) => {
      const node = it.href ? el("a", { class: `nodo ${it.cls ?? ""}`, href: it.href, text: it.label }) : el("span", { class: `nodo ${it.cls ?? ""}`, text: it.label });
      nodes[it.id] = node;
      return el("li", {}, [node]);
    })),
  ]));
  const box = el("div", { class: "enlaces", role: "group", "aria-label": label, style: `--cols:${columns.length}` }, [svg, ...cols]);
  const paths = links.filter(([a, b]) => nodes[a] && nodes[b]).map(([a, b]) => {
    const p = document.createElementNS(NS, "path");
    p.dataset.a = a; p.dataset.b = b;
    svg.append(p);
    return p;
  });
  const draw = () => {
    const r0 = box.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${r0.width} ${r0.height}`);
    for (const p of paths) {
      const ra = nodes[p.dataset.a].getBoundingClientRect(), rb = nodes[p.dataset.b].getBoundingClientRect();
      const x1 = ra.right - r0.left, y1 = ra.top + ra.height / 2 - r0.top, x2 = rb.left - r0.left, y2 = rb.top + rb.height / 2 - r0.top;
      const mx = (x1 + x2) / 2;
      p.setAttribute("d", `M${x1.toFixed(1)},${y1.toFixed(1)} C${mx.toFixed(1)},${y1.toFixed(1)} ${mx.toFixed(1)},${y2.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`);
    }
  };
  const ro = new ResizeObserver(() => { if (!box.isConnected) { ro.disconnect(); return; } requestAnimationFrame(draw); });
  ro.observe(box);
  // al pasar por un nodo, sus líneas y los nodos que une se encienden
  const light = (id) => {
    box.classList.toggle("enfoca", Boolean(id));
    const on = new Set(id ? [id] : []);
    for (const p of paths) {
      const hit = id && (p.dataset.a === id || p.dataset.b === id);
      p.classList.toggle("on", Boolean(hit));
      if (hit) { on.add(p.dataset.a); on.add(p.dataset.b); }
    }
    Object.entries(nodes).forEach(([k, n]) => n.classList.toggle("on", on.has(k)));
  };
  Object.entries(nodes).forEach(([id, n]) => {
    n.addEventListener("pointerenter", () => light(id));
    n.addEventListener("focus", () => light(id));
    n.addEventListener("pointerleave", () => light(null));
    n.addEventListener("blur", () => light(null));
  });
  return box;
}
