// Propuesta B · la franja inferior («mesa»): resumen de la medida elegida sin salir del escenario. Reutiliza criteria() de la ficha
// original (los mismos criterios, con los mismos valores) y first() para el extracto de «Qué hace»; el texto íntegro y el resto
// de la ficha viven en el cajón (el panel de siempre), a un clic.
import { LINE_COLORS } from "../../original/js/medidas/burbujas.js";
import { criteria } from "../../original/js/medidas/ficha.js";
import { el } from "../../original/js/ui.js";
import { first } from "./calculo.js";

/**
 * @param {object} store
 * @param {{ onToggle: (id: string) => void, onFicha: (id: string) => void, hrefFicha: (id: string) => string, isFull: () => boolean, isSel: (id: string) => boolean, outside: (id: string) => boolean }} api
 */
export function crearInspector(store, api) {
  const node = el("section", { class: "m-inspector", "aria-label": "Resumen de la medida elegida" });
  const vacio = () => node.replaceChildren(el("p", { class: "m-inspector-vacio", "data-propuesta": "", text: "Elige una medida en el Plano o en la tabla para ver aquí sus criterios." }));

  const render = (id) => {
    if (!id) { vacio(); return null; }
    const m = store.measures[id], selected = api.isSel(id), full = api.isFull();
    const add = el("button", { type: "button", class: `btn${selected ? " on" : " primary"}`, "aria-pressed": String(selected), "data-propuesta": "", text: selected ? "Quitar de la comparación" : "Añadir a la comparación" });
    add.disabled = !selected && full;
    if (add.disabled) add.title = "Ya hay 3 medidas: quita una para añadir otra.";
    add.addEventListener("click", () => api.onToggle(id));
    const ficha = el("button", { type: "button", class: "btn", "data-propuesta": "", text: "Ver la ficha" });
    ficha.addEventListener("click", () => api.onFicha(id));
    const completa = el("a", { class: "btn-link", href: api.hrefFicha(id), text: "Abrir ficha completa" });
    const filas = criteria(store, m).slice(0, 6); // Línea, Cómo actúa, Evidencia, Plazo, Coste, Se aplica
    node.replaceChildren(
      el("div", { class: "m-inspector-cab" }, [
        el("p", { class: "medida-id", style: `--linea:${LINE_COLORS[m.linea]}`, text: m.id }),
        el("h2", { class: "medida-nombre", tabindex: "-1", text: m.nombre }),
        m.en_plan === false ? el("span", { class: "pill pill-off", text: "Evaluada, no se propone" }) : null,
        api.outside(id) ? el("span", { class: "fuera-nota", "data-propuesta": "", text: "Fuera de los criterios activos" }) : null,
      ].filter(Boolean)),
      el("dl", { class: "m-inspector-criterios" }, filas.map(([k, v]) => el("div", {}, [el("dt", { text: k }), el("dd", { text: v })]))),
      el("p", { class: "m-inspector-extracto" }, [el("b", { text: "Qué hace " }), first(m.que_hace)]),
      el("div", { class: "m-inspector-acciones" }, [add, ficha, completa]),
    );
    return node.querySelector("h2");
  };
  vacio();
  return { node, render };
}
