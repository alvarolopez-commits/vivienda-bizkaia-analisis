// Situación, la pestaña de entrada: la portada con su escena, el mapa vivo, la frase, la lista de municipios, la hoja de
// los siete tipos y las cartas de las demás pestañas. La portada ya está en el HTML; el resto se dibuja aquí.
import { el } from "../ui.js";
import { cartas, registerCartas } from "./cartas.js";
import { hoja } from "./hoja.js";
import { lista } from "./lista.js";
import { mapaVivo } from "./mapa-vivo.js";
import { portada, registerPortada } from "./portada.js";

/** La frase de la tesis: se llena de tinta al pasar. */
function frase() {
  return el("section", { class: "frase-sec", "aria-label": "La tesis del análisis", "data-capitulo": "La tesis" }, [
    el("p", { class: "frase-tinta", "data-tinta": "", text: "Bizkaia necesita más vivienda asequible cerca del empleo: el alquiler expulsa a los ingresos bajos y ahorrar la entrada frena a los medios." }),
    el("p", { class: "fuente" }, [el("span", { class: "etiqueta", text: "Cálculo propio" }), " con datos oficiales de 2024 y 2025. Las causas son hipótesis: cada una dice en qué dato se apoya."]),
  ]);
}

/** Dibuja la pestaña y registra sus dos escenas. Devuelve la promesa del 3D de la portada. */
export function renderSituacion(view, store) {
  registerPortada();
  registerCartas();
  view.querySelector(".hero").dataset.scene = "territorio"; // la escena se declara aquí, para que no exista en las otras pestañas
  view.querySelector("[data-situacion]").replaceChildren(frase(), mapaVivo(store), lista(store), hoja(store, store.fotos.fotos), cartas(store));
  return portada(view.querySelector(".hero"), store);
}
