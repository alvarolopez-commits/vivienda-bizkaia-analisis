// Sprint 03 · comparador de dos o tres medidas, columna por medida y fila por campo.
// Las 12 filas de criterios son las de criteria() de js/medidas/ficha.js (la función original, sin cambios). Debajo, los textos
// largos de la ficha, cada uno con su extracto y un control «Ver completo» por fila. Sin ganadores ni semáforos: solo se
// señala, como dato, que los valores de una fila no coinciden. Un valor ausente se escribe como lo escribe la web original
// («Sin evaluar», «Ningún municipio»…); si no hubiera texto, «Sin dato», nunca un cero.
import { criteria } from "../original/js/medidas/ficha.js";
import { LINE_COLORS } from "../original/js/medidas/burbujas.js";
import { el } from "../original/js/ui.js";
import { first } from "./calculo.js";
import { TEXTOS } from "./detalle.js";

/**
 * @param {object} api { hrefFicha(id), hrefSin(id), onRemove(id) }
 */
export function crearComparar(store, list, api) {
  const rows = list.map((m) => criteria(store, m));
  const grid = (cls) => el("div", { class: `fila ${cls ?? ""}`.trim(), role: "row" });
  const head = grid("cab");
  head.append(el("span", { role: "columnheader" }, [el("span", { class: "sr-only", text: "Campo" })]));
  list.forEach((m) => {
    const quitar = el("button", { type: "button", class: "quitar", "aria-label": `Quitar ${m.id} de la comparación`, title: "Quitar de la comparación" }, [el("span", { "aria-hidden": "true", text: "×" })]);
    quitar.setAttribute("data-propuesta", "");
    quitar.addEventListener("click", () => api.onRemove(m.id));
    head.append(el("span", { role: "columnheader" }, [
      el("span", { class: "medida-id", style: `--linea:${LINE_COLORS[m.linea]}`, text: m.id }),
      el("a", { href: api.hrefFicha(m.id), text: m.nombre }), quitar,
    ]));
  });

  const body = rows[0].map(([k], i) => {
    const values = rows.map((r) => r[i][1]);
    const differs = new Set(values).size > 1;
    const row = grid(differs ? "difiere" : "");
    row.append(el("span", { role: "rowheader" }, [k, differs ? el("span", { class: "marca-difiere", "data-propuesta": "", text: "difieren" }) : null]));
    values.forEach((v, j) => row.append(el("span", { role: "cell", "data-col": list[j].id, text: v || "Sin dato" })));
    return row;
  });

  const longRows = TEXTOS.map(([label, get]) => {
    const row = grid("larga");
    const texts = list.map((m) => get(m));
    const needs = texts.some((t) => t && first(t) !== t);
    const cells = texts.map((t, j) => el("span", { role: "cell", "data-col": list[j].id, class: "celda-larga", text: t ? first(t) : "Sin dato" }));
    const toggle = needs ? el("button", { type: "button", class: "leer-mas", "aria-expanded": "false", text: "Ver completo" }) : null;
    toggle?.setAttribute("data-propuesta", "");
    toggle?.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      cells.forEach((c, j) => { c.textContent = open ? (texts[j] || "Sin dato") : (texts[j] ? first(texts[j]) : "Sin dato"); });
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Ver menos" : "Ver completo";
      row.classList.toggle("abierta", open);
    });
    row.append(el("span", { role: "rowheader" }, [label, toggle]), ...cells);
    return row;
  });
  return el("div", { class: "tabla comparar-medidas", role: "table", "aria-label": "Medidas comparadas criterio a criterio", style: `--n:${list.length}` }, [head, ...body, ...longRows]);
}
