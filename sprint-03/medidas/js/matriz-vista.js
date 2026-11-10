// Sprint 03 · la Matriz conectada al estado compartido.
// Las 12 columnas y el contenido de cada celda son los de js/matriz.js (la función row() se copia sin cambios de texto).
// Añadidos, fuera de las 12 columnas y marcados con la clase x-extra: la casilla «Comparar» (selección) y, solo si el lector
// ha dado peso a algún criterio, la «Nota» de 0 a 1 que ya calcula scorer().
import { el, es } from "../original/js/ui.js";
import { agents } from "../original/js/matriz.js";
import { HEADERS, LINE_SHORT, MECH_SHORT, NORM, SHORT, reach } from "./calculo.js";

/** Una fila: copia de row() de matriz.js (las 12 celdas), con la casilla de selección delante. */
function row(store, m, rank, { extra }) {
  const off = m.en_plan === false;
  const r = reach(store, m);
  const mag = m.magnitud;
  const cells = [
    el("td", { class: "num m-rank", text: rank ? `${rank}.º` : "" }),
    el("th", { scope: "row", class: "row-name" }, [el("a", { href: `#medidas/${m.id}`, "data-abrir": m.id, text: `${m.id} ${m.nombre}` }),
      off ? el("span", { class: "pill pill-off", text: "Evaluada, no se propone" }) : null]),
    el("td", { title: store.medidas.lineas[m.linea], text: LINE_SHORT[m.linea] }),
    el("td", { title: store.medidas.mecanismos[m.mecanismo], text: MECH_SHORT[m.mecanismo] }),
    el("td", {}, [el("span", { class: `ev ev-${NORM.evidencia[m.evidencia] * 4}`, text: m.evidencia })]),
    el("td", { class: "m-mag" }, mag ? [el("span", { class: `mag mag-${mag.tipo}`, text: mag.tipo === "efecto" ? "Efecto medido" : "Resultado" }), ` ${mag.texto}`] : [el("span", { class: "muted", text: "Sin evaluar" })]),
    el("td", { text: SHORT.viabilidad[m.viabilidad] }),
    el("td", { text: SHORT.plazo[m.plazo] }),
    el("td", { text: SHORT.coste[m.coste] }),
    el("td", { text: off ? "No se propone" : r ? `${es(100 * r)} %` : "Ningún municipio" }),
    el("td", { text: m.decide.map((d) => store.medidas.decide[d]).join(", ") }),
    el("td", {}, [el("span", { class: `bm30 bm30-${m.papel_bm30.papel}`, text: store.medidas.papeles_bm30[m.papel_bm30.papel] })]),
  ];
  cells.forEach((c, i) => c.setAttribute("data-col", HEADERS[i]));
  const tr = el("tr", { class: off ? "row-off" : null, "data-id": m.id }, cells);
  tr.prepend(el("td", { class: "x-extra col-sel" }, [extra.check]));
  return tr;
}

export function crearMatriz(store, { onOpen, onToggle, isFull }) {
  const body = el("tbody");
  const head = el("tr");
  const table = el("table", { class: "matrix-table" }, [el("caption", { class: "sr-only", text: "Matriz comparativa de las medidas" }), el("thead", {}, [head]), body]);
  const wrap = el("div", { class: "table-wrap table-scroll", tabindex: "0", role: "region", "aria-label": "Matriz comparativa de las medidas (se desplaza dentro de su recuadro)" }, [table]);

  const drawHead = (withScore) => {
    head.replaceChildren(el("th", { scope: "col", class: "x-extra col-sel" }, [el("span", { class: "sr-only", text: "Añadir a la comparación" }), el("span", { "aria-hidden": "true", text: "+" })]),
      ...HEADERS.map((h, i) => [el("th", { scope: "col", class: i === 0 ? "col-orden" : i === 1 ? "col-medida" : null, text: h }), i === 0 && withScore ? el("th", { scope: "col", class: "x-extra col-nota", text: "Nota (0 a 1)" }) : null]).flat().filter(Boolean));
    table.classList.toggle("con-nota", withScore);
  };

  /** list: [{ m, s }] ya ordenada · weighted: hay pesos · sel: Set de ids · focus: id abierto */
  const update = ({ list, weighted, sel, focus }) => {
    drawHead(weighted);
    body.replaceChildren(...list.map((x, i) => {
      const picked = sel.has(x.m.id);
      const check = el("input", { type: "checkbox", "aria-label": `Añadir ${x.m.id} a la comparación`, "data-sel": x.m.id });
      check.checked = picked;
      check.disabled = !picked && isFull();
      if (check.disabled) check.title = "Ya hay 3 medidas: quita una para añadir otra.";
      check.addEventListener("change", () => onToggle(x.m.id));
      const tr = row(store, x.m, weighted ? i + 1 : 0, { extra: { check } });
      if (weighted) tr.children[1].after(el("td", { class: "x-extra col-nota num", title: "Depende de los pesos que has elegido; no mide el impacto de la medida", text: x.s.toFixed(2).replace(".", ",") }));
      tr.classList.toggle("elegida", picked);
      tr.classList.toggle("abierta", x.m.id === focus);
      tr.querySelector("[data-abrir]").addEventListener("click", (e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return; e.preventDefault(); onOpen(x.m.id, e.currentTarget); });
      return tr;
    }));
  };
  return { node: wrap, update, table };
}
