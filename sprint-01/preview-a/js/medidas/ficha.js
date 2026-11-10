// La ficha de una medida (#medidas/M06): sus criterios, qué hace y si ha funcionado (en breve: el texto largo está en el
// informe), un mapa con su estado en cada municipio y dónde se propone, y el papel de BM30. Y la comparación de dos o tres
// medidas lado a lado (#medidas/M01-M06-M10).
import { STATE_KEYS, stateColor, stateLabel, stateOf } from "../estado.js";
import { svgMap } from "../mapa.js";
import { el, es } from "../ui.js";
import { agents } from "../matriz.js";
import { LINE_COLORS } from "./burbujas.js";

const SHORT = {
  viabilidad: { instrumento_existente: "Se puede aplicar ya", nueva_norma_vasca_o_foral: "Necesita una norma vasca o foral", requiere_ley_estatal: "Necesita una ley estatal" },
  plazo: { corto: "Corto plazo", medio: "Medio plazo", largo: "Largo plazo" },
  coste: { bajo: "Coste público bajo", medio: "Coste público medio", alto: "Coste público alto" },
};
/** Las primeras frases de un texto largo. */
const first = (text, n = 2) => (text ?? "").split(/(?<=[.:])\s+(?=[A-ZÁÉÍÓÚ¿«])/).slice(0, n).join(" ");
const reachOf = (store, m) => [...new Set([...m.municipios.plan, ...m.municipios.probada, ...m.municipios.piloto])];
const popOf = (store, codes) => codes.reduce((n, c) => n + store.municipios[c].poblacion, 0);

/** Los criterios de una medida, como filas de dato. */
export function criteria(store, m) {
  const M = store.medidas, codes = reachOf(store, m);
  return [
    ["Línea", M.lineas[m.linea].split(":")[0]], ["Cómo actúa", M.mecanismos[m.mecanismo]], ["Evidencia", m.evidencia],
    ["Plazo", SHORT.plazo[m.plazo]], ["Coste", SHORT.coste[m.coste]], ["Se aplica", SHORT.viabilidad[m.viabilidad]],
    ["Quién decide", m.decide.map((d) => M.decide[d]).join(", ")], ["BM30", M.papeles_bm30[m.papel_bm30.papel]],
    ["Hace falta en", codes.length ? `${es(codes.length)} municipios, ${es(popOf(store, codes))} habitantes` : "Ningún municipio"],
    ["Efecto documentado", m.magnitud ? m.magnitud.texto : "Sin evaluar"],
    ["A quién beneficia", agents(store, m.beneficia)], ["Quién paga", agents(store, m.paga)],
  ];
}

/** El mapa del estado de la medida en cada municipio. */
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

export function ficha(store, m) {
  const rows = criteria(store, m);
  return el("article", { class: "medida-ficha" }, [
    el("p", {}, [el("a", { class: "volver", href: "#medidas", text: "← Todas las medidas" })]),
    el("p", { class: "medida-id", style: `--linea:${LINE_COLORS[m.linea]}`, text: m.id }),
    el("h1", { class: "medida-nombre", text: m.nombre }),
    el("dl", { class: "criterios" }, rows.map(([k, v]) => el("div", {}, [el("dt", { text: k }), el("dd", { text: v })]))),
    el("div", { class: "medida-textos" }, [
      el("section", {}, [el("h3", { text: "Qué hace" }), el("p", { text: first(m.que_hace) })]),
      el("section", {}, [el("h3", { text: "Si ha funcionado" }), el("p", { text: first(m.evidencia_detalle) })]),
      el("section", {}, [el("h3", { text: "Qué puede hacer BM30" }), el("p", { text: m.papel_bm30.por_que })]),
      el("section", {}, [el("h3", { text: "Qué vigilar" }), el("p", { text: m.kpi })]),
    ]),
    el("h3", { class: "medida-mapa-t", text: "Dónde se usa ya y dónde se propone" }),
    stateMap(store, m),
    el("p", { class: "fuente" }, [el("span", { class: "etiqueta", text: "Cálculo propio" }), ` Estado comprobado el ${store.medidas.estado.comprobado_el}.`]),
  ]);
}

/** Dos o tres medidas lado a lado, criterio a criterio. */
export function compare(store, list) {
  const rows = list.map((m) => criteria(store, m));
  return el("div", { class: "tabla comparar-medidas", role: "table", "aria-label": "Medidas comparadas criterio a criterio", style: `--n:${list.length}` }, [
    el("div", { class: "fila cab", role: "row" }, [el("span", { role: "columnheader", text: "" }), ...list.map((m) => el("span", { role: "columnheader" }, [el("a", { href: `#medidas/${m.id}`, text: `${m.id} ${m.nombre}` })]))]),
    ...rows[0].map(([k], i) => el("div", { class: "fila", role: "row" }, [el("span", { role: "rowheader", text: k }), ...rows.map((r, j) => el("span", { role: "cell", "data-col": list[j].id, text: r[i][1] }))])),
  ]);
}
