// Acceso · simulador de alquiler y compra. Las cuatro partes (El alquiler, La escalera, Prueba tus supuestos, ¿Hasta dónde llega mi hogar?)
// y TODAS las cuentas las dibuja el renderizador ORIGINAL (app/original/js/acceso, con calculo-acceso.js intacto). Aquí solo cambia la
// composición: pestañas internas de vidrio, supuestos a la izquierda y resultados a la derecha en el explorador, mapa y rejilla sólidos,
// y un cuadro que separa lo que el lector puede elegir de lo que son supuestos fijos del modelo (las cifras salen de acceso.json).
import { renderAcceso } from "../../original/js/acceso/index.js";
import { el, es } from "../../original/js/ui.js";
import { envolver } from "../lectura.js";

export function montar(raiz, { store }) {
  const lec = envolver(raiz, { clase: "v-acceso", indice: "pestanas", dibujar: (c) => renderAcceso(c, store) });
  const s = store.acceso.supuestos;

  // controles de parámetros: material de vidrio (L1); resultados y rejilla siguen siendo sólidos
  raiz.querySelectorAll(".x-controles, .alcance-controles").forEach((n) => n.classList.add("vidrio"));

  // «Lo que eliges» / «Lo que no cambia»: el explorador deja elegir dónde, hogar, ahorro, entrada, interés, plazo y «TU CASA»; el resto son supuestos
  // del modelo (acceso.json). El umbral de 10 años es el del código original (LONG); aquí solo se muestra, con texto además del color.
  const controles = raiz.querySelector(".x-controles");
  if (controles) {
    const fijos = el("div", { class: "x-fijos opaco", "data-propuesta": "" }, [
      el("p", { class: "x-fijos-t", text: "Lo que no cambia" }),
      el("ul", {}, [
        el("li", { text: `El banco presta el ${es(100 * s.financiacion)} % del precio.` }),
        el("li", { text: `La cuota no puede pasar del ${es(100 * s.tope_esfuerzo)} % de los ingresos después de impuestos.` }),
        el("li", { class: "largo", text: "Desde 10 años ahorrando la entrada, la casilla se marca con ◆ y en rosa." }),
      ]),
    ]);
    const lado = el("div", { class: "x-lado" }, [el("div", {}, [el("p", { class: "x-lado-t", "data-propuesta": "", text: "Lo que eliges" })]), fijos]);
    controles.before(lado);
    lado.firstChild.append(controles);
  }
  return { alCambiarDireccion() {}, desmontar: () => lec.desmontar() };
}
