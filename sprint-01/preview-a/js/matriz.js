// Matriz comparativa de medidas (fases 13 y 14): una fila por medida y una columna por criterio, con filtros y orden.
// Por defecto no hay ningún orden de prioridad: si el lector da peso a algún criterio, la matriz se ordena según sus
// prioridades. Nunca hay una nota única ni una medida del impacto.
import { el, es, pill } from "./ui.js";

// Cada criterio pasado a una escala de 0 a 1 para poder ordenar con pesos (1 = lo más favorable)
const NORM = {
  evidencia: { Alta: 1, "Media-alta": 0.75, Media: 0.5, "Media-baja": 0.25, Baja: 0 },
  viabilidad: { instrumento_existente: 1, nueva_norma_vasca_o_foral: 0.5, requiere_ley_estatal: 0 },
  plazo: { corto: 1, medio: 0.5, largo: 0 },
  coste: { bajo: 1, medio: 0.5, alto: 0 },
};
const WEIGHTS = [
  ["evidencia", "Ha funcionado en otros sitios"], ["viabilidad", "Se puede aplicar ya"], ["plazo", "Da resultados pronto"],
  ["coste", "Cuesta poco dinero público"], ["alcance", "Hace falta en más población"],
];
// En la tabla, nombres cortos de la línea y de cómo actúa (los largos están en los filtros y en la ficha)
const LINE_SHORT = { oferta: "Más vivienda", parque: "Usar las que existen", compra: "Comprar", alquiler: "Alquiler y protección", turistica: "Turística", vigilancia: "Vigilancia" };
const MECH_SHORT = { limita: "Limita o grava", publica: "Lo hace la administración", hogares: "Ayuda a los hogares", propietarios: "Incentiva al propietario", construir: "Facilita construir" };
const SHORT = {
  viabilidad: { instrumento_existente: "Ya", nueva_norma_vasca_o_foral: "Norma vasca o foral", requiere_ley_estatal: "Ley estatal" },
  plazo: { corto: "Corto", medio: "Medio", largo: "Largo" },
  coste: { bajo: "Bajo", medio: "Medio", alto: "Alto" },
};

const popOf = (store, codes) => codes.reduce((n, c) => n + store.municipios[c].poblacion, 0);

/** Población de los municipios donde la medida se propone (en el plan o fuera de las prioritarias), de 0 a 1. */
const reach = (store, m) => {
  const w = m.municipios;
  return popOf(store, [...new Set([...w.plan, ...w.probada, ...w.piloto])]) / store.meta.poblacion_total;
};

export const agents = (store, list) => (list.length ? list.map((a) => store.medidas.agentes[a]).join(", ") : "Sin coste directo relevante");

function row(store, m, rank) {
  const off = m.en_plan === false;
  const r = reach(store, m);
  const mag = m.magnitud;
  const tr = el("tr", { class: off ? "row-off" : null }, [
    el("td", { class: "num m-rank", text: rank ? `${rank}.º` : "" }),
    el("th", { scope: "row", class: "row-name" }, [el("a", { href: `#medidas/${m.id}`, text: `${m.id} ${m.nombre}` }),
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
  ]);
  // fase 15: cada celda lleva el nombre de su columna, para leer la fila como una tarjeta en pantallas estrechas
  [...tr.children].forEach((c, i) => c.setAttribute("data-col", HEADERS[i]));
  return tr;
}

const select = (id, label, all, entries) => {
  const s = el("select", { class: "select", id }, [el("option", { value: "", text: all }), ...entries.map(([k, v]) => el("option", { value: k, text: v }))]);
  return { s, node: el("div", {}, [el("label", { class: "field-label", for: id, text: label }), s]) };
};

const HEADERS = ["Orden", "Medida", "Línea", "Cómo actúa", "Evidencia", "Magnitud documentada", "Se aplica", "Plazo",
  "Coste público", "Población donde hace falta", "Quién decide", "Papel de BM30"]; // a quién beneficia y quién paga, en la ficha de cada medida
const NO_WEIGHTS = () => Object.fromEntries(WEIGHTS.map(([k]) => [k, 0]));
const WEIGHT_WORDS = ["Sin peso", "Algo", "Bastante", "Mucho"];

/** La nota de 0 a 1 según los pesos del lector, o null si no ha dado peso a ningún criterio. */
const scorer = (store, state) => {
  const max = Math.max(...store.medidas.medidas.map((m) => reach(store, m))) || 1;
  return (m) => {
    const total = WEIGHTS.reduce((n, [k]) => n + state.weights[k], 0);
    if (!total) return null;
    const v = { ...Object.fromEntries(Object.keys(NORM).map((k) => [k, NORM[k][m[k]]])), alcance: reach(store, m) / max };
    return WEIGHTS.reduce((n, [k]) => n + state.weights[k] * v[k], 0) / total;
  };
};

/** Sin pesos, agrupadas por línea de actuación; con pesos, de la nota más alta a la más baja. */
function ordered(M, rows, score) {
  const scored = rows.map((m) => ({ m, s: score(m) }));
  const weighted = scored.some((x) => x.s !== null);
  const lineOrder = Object.keys(M.lineas);
  const byLine = (a, b) => lineOrder.indexOf(a.m.linea) - lineOrder.indexOf(b.m.linea) || a.m.id.localeCompare(b.m.id);
  return { weighted, list: [...scored].sort((a, b) => (weighted ? (b.s - a.s) || a.m.id.localeCompare(b.m.id) : byLine(a, b))) };
}

/** Cuatro botones por criterio (sin peso, algo, bastante, mucho) y el botón que quita todos los pesos. */
function weightControls(state, render) {
  const groups = WEIGHTS.map(([k, label]) => {
    const buttons = WEIGHT_WORDS.map((w, v) => el("button", { type: "button", class: "opcion", "aria-pressed": String(v === 0), text: w }));
    buttons.forEach((b, v) => b.addEventListener("click", () => {
      state.weights = { ...state.weights, [k]: v };
      buttons.forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
      render();
    }));
    return el("div", { class: "x-grupo", role: "group", "aria-label": label }, [el("span", { class: "x-etq", text: label }), el("div", { class: "x-botones" }, buttons)]);
  });
  const reset = el("button", { type: "button", class: "pildora", text: "Quitar los pesos" });
  reset.addEventListener("click", () => {
    state.weights = NO_WEIGHTS();
    groups.forEach((g) => g.querySelectorAll("button").forEach((b, v) => b.setAttribute("aria-pressed", String(v === 0))));
    render();
  });
  return [...groups, reset];
}

export function matrix(store) {
  const M = store.medidas;
  const state = { linea: "", mecanismo: "", decide: "", papel: "", weights: NO_WEIGHTS() };
  const filters = [
    ["linea", select("mx-linea", "Línea de actuación", "Todas", Object.entries(M.lineas))],
    ["mecanismo", select("mx-mec", "Cómo actúa", "Todos", Object.entries(M.mecanismos))],
    ["decide", select("mx-decide", "Quién decide", "Cualquiera", Object.entries(M.decide))],
    ["papel", select("mx-papel", "Papel de BM30", "Cualquiera", Object.entries(M.papeles_bm30))],
  ];
  const score = scorer(store, state);
  const body = el("tbody");
  const count = el("p", { class: "note", "aria-live": "polite" });
  const render = () => {
    const rows = M.medidas.filter((m) => (!state.linea || m.linea === state.linea) && (!state.mecanismo || m.mecanismo === state.mecanismo)
      && (!state.decide || m.decide.includes(state.decide)) && (!state.papel || m.papel_bm30.papel === state.papel));
    const { weighted, list } = ordered(M, rows, score);
    body.replaceChildren(...list.map((x, i) => row(store, x.m, weighted ? i + 1 : 0)));
    count.textContent = `${rows.length} de ${M.medidas.length} medidas. ${weighted ? "Ordenadas según los pesos que has elegido." : "Agrupadas por línea de actuación: da peso a algún criterio para ordenarlas."}`;
  };
  filters.forEach(([k, f]) => f.s.addEventListener("change", () => { state[k] = f.s.value; render(); }));
  render();
  return el("div", { class: "matrix" }, [
    el("div", { class: "table-tools mx-filters" }, filters.map(([, f]) => f.node)),
    el("details", { class: "mx-weights" }, [
      el("summary", { text: "Ordenar según tus prioridades" }),
      el("p", { class: "note", text: "Da más o menos peso a cada criterio y la tabla se ordena. El orden depende de lo que elijas: no mide el impacto de ninguna medida, que casi nunca se conoce en Bizkaia." }),
      el("div", { class: "mx-sliders" }, weightControls(state, render)),
    ]),
    count,
    el("div", { class: "table-wrap table-scroll" }, [el("table", { class: "matrix-table" }, [el("caption", { class: "sr-only", text: "Matriz comparativa de las medidas" }),
      el("thead", {}, [el("tr", {}, HEADERS.map((h) => el("th", { scope: "col", text: h })))]), body])]),
    el("p", { class: "note" }, [pill("calculo"), " Evidencia: si ha funcionado en otros sitios, con la escala escrita en Método. Magnitud: el efecto que mide una evaluación o el resultado que mide un programa, con su fuente en la ficha; «sin evaluar» si no hay ninguno. Población: la de los municipios donde se propone. El papel de BM30 es una propuesta nuestra, por validar."]),
  ]);
}
