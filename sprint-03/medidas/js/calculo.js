// Sprint 03 · Explorador de Medidas · PROTOTIPO.
//
// COPIAS LITERALES de las funciones PRIVADAS de los módulos originales (no exportadas, por eso no se pueden importar):
//   · js/matriz.js  → NORM, WEIGHTS, LINE_SHORT, MECH_SHORT, SHORT, HEADERS, NO_WEIGHTS, WEIGHT_WORDS, popOf, reach, scorer, ordered
//   · js/medidas/burbujas.js → EVIDENCE, TERM, geometría del plano (W, H, L, T, CW, CH) y popShare
//   · js/medidas/ficha.js → first
//   · js/medidas/index.js → watch, lineName, chain, deciders
// No se ha cambiado ni una línea de cálculo. La equivalencia con los módulos originales (que se sirven intactos desde
// original/) se comprueba en _qa/qa-equivalencia.js: mismo orden, mismas filas, mismas burbujas, mismos diagramas.
import { linkDiagram } from "../original/js/medidas/enlaces.js";

// ---------- js/matriz.js ----------
// Cada criterio pasado a una escala de 0 a 1 para poder ordenar con pesos (1 = lo más favorable)
export const NORM = {
  evidencia: { Alta: 1, "Media-alta": 0.75, Media: 0.5, "Media-baja": 0.25, Baja: 0 },
  viabilidad: { instrumento_existente: 1, nueva_norma_vasca_o_foral: 0.5, requiere_ley_estatal: 0 },
  plazo: { corto: 1, medio: 0.5, largo: 0 },
  coste: { bajo: 1, medio: 0.5, alto: 0 },
};
export const WEIGHTS = [
  ["evidencia", "Ha funcionado en otros sitios"], ["viabilidad", "Se puede aplicar ya"], ["plazo", "Da resultados pronto"],
  ["coste", "Cuesta poco dinero público"], ["alcance", "Hace falta en más población"],
];
export const LINE_SHORT = { oferta: "Más vivienda", parque: "Usar las que existen", compra: "Comprar", alquiler: "Alquiler y protección", turistica: "Turística", vigilancia: "Vigilancia" };
export const MECH_SHORT = { limita: "Limita o grava", publica: "Lo hace la administración", hogares: "Ayuda a los hogares", propietarios: "Incentiva al propietario", construir: "Facilita construir" };
export const SHORT = {
  viabilidad: { instrumento_existente: "Ya", nueva_norma_vasca_o_foral: "Norma vasca o foral", requiere_ley_estatal: "Ley estatal" },
  plazo: { corto: "Corto", medio: "Medio", largo: "Largo" },
  coste: { bajo: "Bajo", medio: "Medio", alto: "Alto" },
};
export const HEADERS = ["Orden", "Medida", "Línea", "Cómo actúa", "Evidencia", "Magnitud documentada", "Se aplica", "Plazo",
  "Coste público", "Población donde hace falta", "Quién decide", "Papel de BM30"];
export const NO_WEIGHTS = () => Object.fromEntries(WEIGHTS.map(([k]) => [k, 0]));
export const WEIGHT_WORDS = ["Sin peso", "Algo", "Bastante", "Mucho"];

export const popOf = (store, codes) => codes.reduce((n, c) => n + store.municipios[c].poblacion, 0);

/** Población de los municipios donde la medida se propone (en el plan o fuera de las prioritarias), de 0 a 1. */
export const reach = (store, m) => {
  const w = m.municipios;
  return popOf(store, [...new Set([...w.plan, ...w.probada, ...w.piloto])]) / store.meta.poblacion_total;
};

/** La nota de 0 a 1 según los pesos del lector, o null si no ha dado peso a ningún criterio. */
export const scorer = (store, state) => {
  const max = Math.max(...store.medidas.medidas.map((m) => reach(store, m))) || 1;
  return (m) => {
    const total = WEIGHTS.reduce((n, [k]) => n + state.weights[k], 0);
    if (!total) return null;
    const v = { ...Object.fromEntries(Object.keys(NORM).map((k) => [k, NORM[k][m[k]]])), alcance: reach(store, m) / max };
    return WEIGHTS.reduce((n, [k]) => n + state.weights[k] * v[k], 0) / total;
  };
};

/** Sin pesos, agrupadas por línea de actuación; con pesos, de la nota más alta a la más baja. */
export function ordered(M, rows, score) {
  const scored = rows.map((m) => ({ m, s: score(m) }));
  const weighted = scored.some((x) => x.s !== null);
  const lineOrder = Object.keys(M.lineas);
  const byLine = (a, b) => lineOrder.indexOf(a.m.linea) - lineOrder.indexOf(b.m.linea) || a.m.id.localeCompare(b.m.id);
  return { weighted, list: [...scored].sort((a, b) => (weighted ? (b.s - a.s) || a.m.id.localeCompare(b.m.id) : byLine(a, b))) };
}

// ---------- js/medidas/burbujas.js ----------
export const EVIDENCE = ["Alta", "Media-alta", "Media", "Media-baja", "Baja"];
export const TERM = [["corto", "Corto plazo"], ["medio", "Medio plazo"], ["largo", "Largo plazo"]];
export const W = 960, H = 560, L = 120, T = 20, CW = (W - L) / 3, CH = (H - T - 40) / 5;
export const popShare = (store, m) => {
  const w = m.municipios, codes = [...new Set([...w.plan, ...w.probada, ...w.piloto])];
  return codes.reduce((n, c) => n + store.municipios[c].poblacion, 0) / store.meta.poblacion_total;
};

// ---------- js/medidas/ficha.js ----------
/** Las primeras frases de un texto largo. */
export const first = (text, n = 2) => (text ?? "").split(/(?<=[.:])\s+(?=[A-ZÁÉÍÓÚ¿«])/).slice(0, n).join(" ");

// ---------- js/medidas/index.js ----------
/** Lo primero que dice el indicador de una medida («Precio de los contratos nuevos»). */
export const watch = (kpi) => (kpi ?? "").split(/[(;.]/)[0].trim();
export const lineName = (store, k) => store.medidas.lineas[k].split(":")[0];

/** La cadena de una línea: problema → cómo actúa → medida → qué vigilar. */
export function chain(store, line) {
  const ms = store.medidas.medidas.filter((m) => m.linea === line);
  const problems = [...new Set(ms.flatMap((m) => m.problemas))], mechs = [...new Set(ms.map((m) => m.mecanismo))];
  const links = new Set();
  ms.forEach((m) => { m.problemas.forEach((p) => links.add(`p:${p}|c:${m.mecanismo}`)); links.add(`c:${m.mecanismo}|m:${m.id}`); links.add(`m:${m.id}|k:${m.id}`); });
  return linkDiagram({
    label: `Cadena de «${lineName(store, line)}»`,
    columns: [
      { title: "El problema", items: problems.map((p) => ({ id: `p:${p}`, label: store.problemName(p) })) },
      { title: "Cómo actúa", items: mechs.map((c) => ({ id: `c:${c}`, label: store.medidas.mecanismos[c] })) },
      { title: "La medida", items: ms.map((m) => ({ id: `m:${m.id}`, label: `${m.id} ${m.nombre}`, href: `#medidas/${m.id}`, cls: "medida" })) },
      { title: "Qué vigilar", items: ms.map((m) => ({ id: `k:${m.id}`, label: watch(m.kpi) })) },
    ],
    links: [...links].map((x) => x.split("|")),
  });
}

/** Quién decide: nivel de gobierno → medida → papel de BM30. */
export function deciders(store, line) {
  const M = store.medidas, ms = M.medidas.filter((m) => !line || m.linea === line);
  const levels = Object.keys(M.decide).filter((d) => ms.some((m) => m.decide.includes(d)));
  const roles = Object.keys(M.papeles_bm30).filter((r) => ms.some((m) => m.papel_bm30.papel === r));
  return linkDiagram({
    label: "Quién decide cada medida y qué puede hacer BM30",
    columns: [
      { title: "Quién decide", items: levels.map((d) => ({ id: `d:${d}`, label: M.decide[d] })) },
      { title: "La medida", items: ms.map((m) => ({ id: `m:${m.id}`, label: `${m.id} ${m.nombre}`, href: `#medidas/${m.id}`, cls: "medida" })) },
      { title: "Papel de BM30", items: roles.map((r) => ({ id: `r:${r}`, label: M.papeles_bm30[r], cls: `papel-${r}` })) },
    ],
    links: ms.flatMap((m) => [...m.decide.map((d) => [`d:${d}`, `m:${m.id}`]), [`m:${m.id}`, `r:${m.papel_bm30.papel}`]]),
  });
}
