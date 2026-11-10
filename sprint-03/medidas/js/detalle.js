// Sprint 03 · textos largos, panel contextual y ficha completa.
// Regla de contenido: todo texto sale LITERAL de data/medidas.json. Los textos largos pueden plegarse a un extracto (las dos
// primeras frases, con la misma función first() de la web original) y siempre se pueden leer enteros con «Leer más».
import { STATE_KEYS, stateColor, stateLabel, stateOf } from "../original/js/estado.js";
import { criteria } from "../original/js/medidas/ficha.js";
import { LINE_COLORS } from "../original/js/medidas/burbujas.js";
import { svgMap } from "../original/js/mapa.js";
import { el, es, extLink } from "../original/js/ui.js";
import { first } from "./calculo.js";

/** Los textos largos de una medida: [etiqueta, campo de medidas.json, etiqueta literal de la web original o PROPUESTA]. */
export const TEXTOS = [
  ["Qué hace", (m) => m.que_hace, "original"], // ficha.js: «Qué hace»
  ["Si ha funcionado", (m) => m.evidencia_detalle, "original"], // ficha.js: «Si ha funcionado»
  ["Qué puede hacer BM30", (m) => m.papel_bm30.por_que, "original"], // ficha.js: «Qué puede hacer BM30»
  ["Qué vigilar", (m) => m.kpi, "original"], // ficha.js: «Qué vigilar»
  ["Riesgos", (m) => m.riesgos, "propuesta"], // el campo existe en el JSON pero la ficha original no lo muestra
];

/** Un texto largo: extracto de dos frases con «Leer más» que lo despliega entero. Sin texto: «Sin dato». */
export function textoLargo(text, { abierto = false } = {}) {
  if (!text) return el("p", { class: "muted", text: "Sin dato" });
  const ext = first(text);
  const p = el("p", { class: "texto-largo", text: abierto || ext === text ? text : ext });
  if (abierto || ext === text) return el("div", {}, [p]);
  const b = el("button", { type: "button", class: "leer-mas", "aria-expanded": "false", text: "Leer más" });
  b.setAttribute("data-propuesta", "");
  b.addEventListener("click", () => {
    const open = b.getAttribute("aria-expanded") !== "true";
    p.textContent = open ? text : ext;
    b.setAttribute("aria-expanded", String(open));
    b.textContent = open ? "Leer menos" : "Leer más";
    p.dataset.completo = open ? "1" : "";
  });
  return el("div", {}, [p, b]);
}

const sections = (m, opts) => TEXTOS.map(([label, get, origen]) => {
  const h = el("h3", { text: label });
  if (origen === "propuesta") h.setAttribute("data-propuesta", "");
  return el("section", { class: "texto" }, [h, textoLargo(get(m), opts)]);
});

const sourcesOf = (m) => (m.fuentes?.length ? el("section", { class: "texto" }, [
  el("h3", { text: "Fuentes", "data-propuesta": "" }), // PROPUESTA: la ficha original no las lista
  el("ul", { class: "src-list" }, m.fuentes.map((u) => el("li", {}, [extLink(u, u.replace(/^https:\/\/(www\.)?/, "").split("/")[0])]))),
]) : null);

/** La clave de los criterios: «Línea», «Cómo actúa»… y su valor (la función criteria() original). */
export const criteriaList = (store, m) => el("dl", { class: "criterios" }, criteria(store, m).map(([k, v]) => el("div", {}, [el("dt", { text: k }), el("dd", { text: v })])));

const addButton = ({ selected, full, onToggle }) => {
  const b = el("button", { type: "button", class: `btn${selected ? " on" : " primary"}`, "aria-pressed": String(selected), disabled: !selected && full ? true : null,
    text: selected ? "Quitar de la comparación" : "Añadir a la comparación" });
  b.setAttribute("data-propuesta", "");
  b.addEventListener("click", onToggle);
  return b;
};

/**
 * Panel contextual no modal con el resumen de una medida.
 * @param {object} api { hrefFicha(id), hrefEntender(id, tab), onClose, onToggle(id), isFull(), isSel(id), outside(id) }
 */
export function crearPanel(store, api) {
  const node = el("aside", { class: "panel-medida", "aria-label": "Ficha de la medida", hidden: true });
  let current = null;
  const render = (id) => {
    current = id;
    const m = store.measures[id], selected = api.isSel(id), full = api.isFull();
    const closeBtn = el("button", { type: "button", class: "cerrar-panel", "aria-label": "Cerrar la ficha" }, [el("span", { "aria-hidden": "true", text: "×" })]);
    closeBtn.addEventListener("click", api.onClose);
    const title = el("h2", { class: "medida-nombre", tabindex: "-1", text: m.nombre });
    node.replaceChildren(...[
      el("div", { class: "panel-cab" }, [el("p", { class: "medida-id", style: `--linea:${LINE_COLORS[m.linea]}`, text: m.id }), closeBtn]),
      title,
      m.en_plan === false ? el("p", {}, [el("span", { class: "pill pill-off", text: "Evaluada, no se propone" })]) : null,
      api.outside(id) ? el("p", { class: "fuera-nota", role: "status", "data-propuesta": "", text: "Esta medida queda fuera de los criterios activos." }) : null,
      el("div", { class: "panel-acciones" }, [addButton({ selected, full, onToggle: () => api.onToggle(id) }),
        full && !selected ? el("p", { class: "nota-corta", "data-propuesta": "", text: "Ya hay 3 medidas: quita una para añadir otra." }) : null,
        el("a", { class: "btn", href: api.hrefFicha(id) }, [el("span", { text: "Abrir ficha completa" }), el("span", { "aria-hidden": "true", text: "→" })]),
      ]),
      criteriaList(store, m),
      ...sections(m, {}), sourcesOf(m),
      el("div", { class: "panel-enlaces", "data-propuesta": "" }, [
        el("a", { class: "btn-link", href: api.hrefEntender(id, "cadena"), text: "Ver su cadena" }),
        el("a", { class: "btn-link", href: api.hrefEntender(id, "decide"), text: "Ver quién decide" }),
      ]),
    ].filter(Boolean)); // replaceChildren(null) escribiría el texto «null»
    return title;
  };
  return { node, render, get current() { return current; } };
}

/** El mapa del estado de la medida en cada municipio (copia de stateMap() de js/medidas/ficha.js, sin cambios). */
function stateMap(store, m) {
  const plan = new Set(m.municipios.plan);
  const count = {};
  const svg = svgMap(store.municipiosGeo, (p) => {
    const muni = store.municipios[p.code];
    if (!muni) return { fill: "#ffffff" };
    const s = stateOf(muni, m.id);
    const key = s.bizkaia ? "bizkaia" : s.key;
    count[key] = (count[key] ?? 0) + 1;
    return { fill: stateColor(s), on: plan.has(p.code) };
  }, { stroke: "#9fb0c3", label: `Mapa del estado de ${m.id} en cada municipio` });
  svg.querySelectorAll("path.on").forEach((p) => { p.setAttribute("stroke", "#221e41"); p.setAttribute("stroke-width", "0.5"); });
  const keys = [...(count.bizkaia ? ["bizkaia"] : []), ...STATE_KEYS.filter((k) => count[k])];
  return el("div", { class: "medida-mapa" }, [
    el("div", { class: "mapa-lienzo" }, [svg]),
    el("ul", { class: "alcance-clave" }, [
      ...keys.map((k) => el("li", {}, [el("i", { style: `background:${stateColor(k === "bizkaia" ? { bizkaia: true } : { key: k })}`, "aria-hidden": "true" }), `${stateLabel(store, k === "bizkaia" ? { bizkaia: true } : { key: k })}: ${es(count[k])}`])),
      el("li", {}, [el("i", { class: "borde", "aria-hidden": "true" }), `Con borde: en el plan de ${es(plan.size)} municipios`]),
    ]),
  ]);
}

/** #medidas/M06: la ficha completa. Los textos van enteros (la ficha original los acorta con first()). */
export function fichaCompleta(store, m, api) {
  const selected = api.isSel(m.id), full = api.isFull();
  return el("article", { class: "medida-ficha" }, [
    el("p", {}, [el("a", { class: "volver", href: api.hrefExplorar(), text: "← Todas las medidas" })]),
    el("p", { class: "medida-id", style: `--linea:${LINE_COLORS[m.linea]}`, text: m.id }),
    el("h1", { class: "medida-nombre", text: m.nombre }),
    m.en_plan === false ? el("p", {}, [el("span", { class: "pill pill-off", text: "Evaluada, no se propone" })]) : null,
    el("div", { class: "panel-acciones" }, [addButton({ selected, full, onToggle: () => api.onToggle(m.id) }),
      el("a", { class: "btn", href: api.hrefEntender(m.id, "cadena"), "data-propuesta": "", text: "Ver su cadena" }),
      el("a", { class: "btn", href: api.hrefEntender(m.id, "decide"), "data-propuesta": "", text: "Ver quién decide" }),
    ]),
    criteriaList(store, m),
    el("div", { class: "ficha-cols" }, [
      el("div", { class: "medida-textos" }, [...sections(m, { abierto: true }), sourcesOf(m)]),
      el("div", {}, [el("h3", { class: "medida-mapa-t", text: "Dónde se usa ya y dónde se propone" }), stateMap(store, m),
        el("p", { class: "fuente" }, [el("span", { class: "etiqueta", text: "Cálculo propio" }), ` Estado comprobado el ${store.medidas.estado.comprobado_el}.`])]),
    ]),
  ]);
}
