// Propuesta A · la lista de las medidas a la vista, sincronizada con el Plano, la Matriz y el panel (equivale a la lista de 113
// municipios del Atlas). No calcula nada: recibe la lista ya ordenada por ordered() (con pesos, de mayor a menor nota; sin pesos,
// por línea e ID) y pinta nombre, evidencia y plazo tal como los dan los datos. Elegir una fila abre la ficha; el «+» la añade
// a la comparación (mismo estado de selección que la bandeja).
import { LINE_COLORS } from "../../original/js/medidas/burbujas.js";
import { el } from "../../original/js/ui.js";
import { SHORT } from "./calculo.js";

/**
 * @param {{ onOpen: (id: string, from: Element) => void, onToggle: (id: string) => void, isFull: () => boolean }} api
 */
export function crearLista(api) {
  const ol = el("ol", { class: "m-lista", "aria-label": "Las medidas a la vista" });
  const node = el("section", { class: "m-lista-caja", "aria-labelledby": "m-lista-t" }, [el("h2", { id: "m-lista-t", class: "f-titulo", "data-propuesta": "", text: "Las medidas a la vista" }), ol]);

  /** list: [{ m, s }] ya ordenada · weighted: hay pesos · sel: Set · focus: id abierto */
  const update = ({ list, weighted, sel, focus }) => {
    ol.replaceChildren(...list.map((x, i) => {
      const m = x.m, picked = sel.has(m.id), off = m.en_plan === false;
      const abrir = el("button", { type: "button", class: "m-fila", "data-id": m.id, "aria-pressed": String(m.id === focus) }, [
        el("span", { class: "m-fila-id medida-id", style: `--linea:${LINE_COLORS[m.linea]}`, text: m.id }),
        el("span", { class: "m-fila-n", text: m.nombre }),
        el("span", { class: "m-fila-v", text: weighted ? `${i + 1}.º · nota ${x.s.toFixed(2).replace(".", ",")}` : `${m.evidencia} · ${SHORT.plazo[m.plazo].toLowerCase()}${off ? " · no se propone" : ""}` }),
      ]);
      abrir.addEventListener("click", () => api.onOpen(m.id, abrir));
      const mas = el("button", { type: "button", class: "m-fila-add", "aria-pressed": String(picked), "aria-label": `${picked ? "Quitar" : "Añadir"} ${m.id} ${picked ? "de" : "a"} la comparación`, title: !picked && api.isFull() ? "Ya hay 3 medidas: quita una para añadir otra." : null }, [el("span", { "aria-hidden": "true", text: picked ? "✓" : "+" })]);
      mas.disabled = !picked && api.isFull();
      mas.addEventListener("click", () => api.onToggle(m.id));
      return el("li", { class: picked ? "elegida" : null }, [abrir, mas]);
    }));
  };
  return { node, update };
}
