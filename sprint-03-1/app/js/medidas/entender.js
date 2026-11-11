// Sprint 03 · «Entender»: la Cadena y «Quién decide» de la web original, con sus diagramas (linkDiagram) y sus textos de sección.
// Los diagramas se construyen con chain() y deciders() copiados de js/medidas/index.js. Lo nuevo es solo navegación:
//   · la línea elegida vive en el estado compartido (y en la URL);
//   · la medida abierta en el panel se marca en el diagrama;
//   · bajo la cadena, el indicador COMPLETO de cada medida (el diagrama muestra solo lo primero que dice, con watch()).
import { el } from "../../original/js/ui.js";
import { announce } from "../../original/js/comun.js";
import { chain, deciders, lineName } from "./calculo.js";

/**
 * @param {object} api { S, onChange() }  S.ent = { tab, linea, lineaD }
 */
export function crearEntender(store, { S, onChange, hrefFicha }) {
  const M = store.medidas;
  const out = el("div", { class: "entender" });

  const tabs = [["cadena", "De cada problema a qué vigilar", "Elige una línea de actuación. Pasa por una medida para ver su cadena."], ["decide", "Quién decide cada medida", "Del Estado a los ayuntamientos, y qué puede hacer BM30 en cada una."]];
  const tabBtns = tabs.map(([k, t]) => el("button", { type: "button", class: "subtab", role: "tab", "data-tab": k, text: t }));
  tabBtns.forEach((b) => b.addEventListener("click", () => { S.ent.tab = b.dataset.tab; onChange(); }));
  const lines = (withAll) => [...(withAll ? [""] : []), ...Object.keys(M.lineas)];
  const lineBtns = el("div", { class: "x-botones", role: "group", "aria-label": "Línea de actuación" });
  const holder = el("div", { class: "entender-cuerpo" });
  const sub = el("p", { class: "sub" });
  out.append(el("div", { class: "subtabs", role: "tablist", "aria-label": "Qué quieres entender" }, tabBtns), sub, lineBtns, holder);

  const kpiList = (line) => {
    const ms = M.medidas.filter((m) => m.linea === line);
    const d = el("details", { class: "kpi-completo" }, [el("summary", { text: "El indicador completo de cada medida" }),
      el("dl", {}, ms.flatMap((m) => [el("dt", {}, [el("a", { href: hrefFicha(m.id), text: `${m.id} ${m.nombre}` })]), el("dd", { text: m.kpi || "Sin dato" })]))]);
    d.querySelector("summary").setAttribute("data-propuesta", "");
    return d;
  };

  const render = (focus) => {
    const t = S.ent.tab, decide = t === "decide";
    tabBtns.forEach((b) => { const on = b.dataset.tab === t; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
    sub.textContent = tabs.find(([k]) => k === t)[2];
    const current = decide ? S.ent.lineaD : S.ent.linea;
    lineBtns.replaceChildren(...lines(decide).map((k) => {
      const b = el("button", { type: "button", class: "opcion", "aria-pressed": String(k === current), text: k ? lineName(store, k) : "Todas" });
      b.addEventListener("click", () => { if (decide) S.ent.lineaD = k; else S.ent.linea = k; onChange(); announce(b.textContent); });
      return b;
    }));
    const diagram = decide ? deciders(store, S.ent.lineaD) : chain(store, S.ent.linea);
    holder.replaceChildren(diagram, ...(decide ? [] : [kpiList(S.ent.linea)]));
    if (focus) diagram.querySelectorAll("a.nodo.medida").forEach((a) => { if (a.textContent.startsWith(`${focus} `)) a.classList.add("foco"); });
  };
  return { node: out, render };
}
