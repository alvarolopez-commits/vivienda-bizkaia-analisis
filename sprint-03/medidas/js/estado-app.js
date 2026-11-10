// Sprint 03 · estado único del explorador y su serialización en la URL (PROPUESTA, ver docs/medidas/STATE_AND_URL.md).
//
// La ruta conserva EXACTAMENTE el significado de la web original (js/medidas/index.js):
//   #medidas            todas              #medidas/M06         ficha
//   #medidas/M01-M06    comparar 2 o 3     #medidas/alternativas alternativas
// El contexto de exploración (filtros, pesos, selección, Plano/Matriz, Entender) viaja en la query: #medidas?linea=oferta&w=0,2,0,0,0
// El router original corta la query antes de interpretar la ruta (rutas.js: hash.split("?")[0]), así que una dirección con
// query se resuelve igual que sin ella. Se comprueba contra el rutas.js original en _qa/rutas.mjs.
import { NO_WEIGHTS, WEIGHTS } from "./calculo.js";

export const MAX_SEL = 3;
export const MODES = ["explorar", "entender", "comparar", "alternativas"];
const has = (o, k) => Object.hasOwn(o, k);

export const emptyFilters = () => ({ linea: "", mecanismo: "", decide: "", papel: "", ya: false });

export function createApp(store) {
  const M = store.medidas;
  const S = {
    mode: "explorar", // explorar | entender | comparar | alternativas | ficha
    rep: "plano", // plano | matriz
    f: emptyFilters(),
    w: NO_WEIGHTS(),
    sel: [], // 0 a 3 medidas para comparar
    cmp: [], // las medidas de #medidas/M01-M06 (2 o 3); vacío = selector
    ficha: null, // id de #medidas/M06
    focus: null, // medida abierta en el panel contextual
    ent: { tab: "cadena", linea: Object.keys(M.lineas)[0], lineaD: "" },
  };

  /** Una medida cumple los criterios activos (los mismos predicados de matriz.js y burbujas.js). */
  const passes = (m, f = S.f) => (!f.linea || m.linea === f.linea) && (!f.mecanismo || m.mecanismo === f.mecanismo)
    && (!f.decide || m.decide.includes(f.decide)) && (!f.papel || m.papel_bm30.papel === f.papel) && (!f.ya || m.viabilidad === "instrumento_existente");
  const visible = () => M.medidas.filter((m) => passes(m));
  const filtersActive = () => Object.entries(S.f).filter(([, v]) => v).length;
  const weighted = () => WEIGHTS.some(([k]) => S.w[k] > 0);

  /** #medidas/M01-M06 → ids válidos, sin repetidos, como mucho tres (igual que index.js original). */
  const idsOf = (sub) => [...new Set((sub ?? "").split("-").filter((x) => has(store.measures, x)))].slice(0, MAX_SEL);

  /** Lee una dirección; devuelve false si no es de Medidas. Cambia S. */
  function fromHash(hash) {
    const [path, qs = ""] = hash.replace(/^#/, "").split("?");
    const [view, sub] = path.split("/");
    if (view !== "medidas") return false;
    const q = new URLSearchParams(qs);
    S.rep = q.get("rep") === "matriz" ? "matriz" : "plano";
    S.f = {
      linea: has(M.lineas, q.get("linea")) ? q.get("linea") : "", mecanismo: has(M.mecanismos, q.get("mec")) ? q.get("mec") : "",
      decide: has(M.decide, q.get("dec")) ? q.get("dec") : "", papel: has(M.papeles_bm30, q.get("bm30")) ? q.get("bm30") : "", ya: q.get("ya") === "1",
    };
    const w = (q.get("w") ?? "").split(",").map(Number);
    S.w = w.length === WEIGHTS.length && w.every((x) => [0, 1, 2, 3].includes(x)) ? Object.fromEntries(WEIGHTS.map(([k], i) => [k, w[i]])) : NO_WEIGHTS();
    const selq = [...new Set((q.get("sel") ?? "").split(",").filter((x) => has(store.measures, x)))].slice(0, MAX_SEL);
    S.ent = { tab: q.get("tab") === "decide" ? "decide" : "cadena", linea: has(M.lineas, q.get("l")) ? q.get("l") : Object.keys(M.lineas)[0], lineaD: has(M.lineas, q.get("ld")) ? q.get("ld") : "" };
    const ids = idsOf(sub);
    S.cmp = []; S.ficha = null;
    if (ids.length === 1) { S.mode = "ficha"; S.ficha = ids[0]; S.sel = selq; }
    else if (ids.length > 1) { S.mode = "comparar"; S.cmp = ids; S.sel = ids; } // la selección es lo que se compara
    else if (sub === "alternativas") { S.mode = "alternativas"; S.sel = selq; }
    else { S.mode = q.get("vista") === "entender" ? "entender" : q.get("vista") === "comparar" ? "comparar" : "explorar"; S.sel = selq; }
    return true;
  }

  /** La dirección que representa el estado (con la ruta del modo pedido). Solo escribe lo que no es el valor por defecto. */
  function toHash(over = {}) {
    const mode = over.mode ?? S.mode;
    const ids = over.ids ?? (mode === "ficha" ? [S.ficha] : mode === "comparar" ? S.cmp : []);
    const q = new URLSearchParams();
    if (mode === "entender") q.set("vista", "entender");
    if (mode === "comparar" && ids.length < 2) q.set("vista", "comparar");
    if (S.rep === "matriz") q.set("rep", "matriz");
    if (S.f.linea) q.set("linea", S.f.linea);
    if (S.f.mecanismo) q.set("mec", S.f.mecanismo);
    if (S.f.decide) q.set("dec", S.f.decide);
    if (S.f.papel) q.set("bm30", S.f.papel);
    if (S.f.ya) q.set("ya", "1");
    if (weighted()) q.set("w", WEIGHTS.map(([k]) => S.w[k]).join(","));
    if (S.sel.length && !(mode === "comparar" && ids.length > 1)) q.set("sel", S.sel.join(","));
    if (S.ent.tab === "decide") q.set("tab", "decide");
    if (S.ent.linea !== Object.keys(M.lineas)[0]) q.set("l", S.ent.linea);
    if (S.ent.lineaD) q.set("ld", S.ent.lineaD);
    const path = mode === "alternativas" ? "/alternativas" : ids.length ? `/${ids.join("-")}` : "";
    const qs = q.toString().replace(/%2C/g, ",");
    return `#medidas${path}${qs ? `?${qs}` : ""}`;
  }

  /** Añade o quita una medida de la selección. Devuelve { ok, reason }. */
  function toggleSel(id) {
    const i = S.sel.indexOf(id);
    if (i >= 0) { S.sel = S.sel.filter((x) => x !== id); return { ok: true, added: false }; }
    if (S.sel.length >= MAX_SEL) return { ok: false, reason: "max" };
    S.sel = [...S.sel, id];
    return { ok: true, added: true };
  }

  return { S, M, passes, visible, filtersActive, weighted, idsOf, fromHash, toHash, toggleSel };
}
