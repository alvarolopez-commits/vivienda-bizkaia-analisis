// Normas · quién decide cada instrumento y línea de tiempo. Matriz de competencias, hitos, fechas y fuente: renderizador ORIGINAL
// (app/original/js/normas.js). Aquí: cabecera con la fecha del estado normativo bien visible (del propio dato), pestañas internas
// y composición en dos zonas (matriz y línea de tiempo). No se interpreta ni se actualiza ningún estado jurídico.
import { renderNormas } from "../../original/js/normas.js";
import { el } from "../../original/js/ui.js";
import { envolver } from "../lectura.js";

export function montar(raiz, { store }) {
  const fecha = el("p", { class: "lec-estado vidrio", "data-propuesta": "" }, [el("span", { text: "Estado normativo a " }), el("b", { text: store.normas?.fecha ?? "" })]);
  const lec = envolver(raiz, { clase: "v-normas", indice: "pestanas", dibujar: (c) => renderNormas(c, store), herramientas: () => fecha });
  return { alCambiarDireccion() {}, desmontar: () => lec.desmontar() };
}
