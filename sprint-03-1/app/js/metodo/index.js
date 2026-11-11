// Método · biblioteca de referencia. Todos los bloques (palabras clave, método, límites, revisión, historial y fuentes) los dibuja el
// renderizador ORIGINAL (app/original/js/view-metodo.js + glosario.js); su redacción no se toca. Aquí: índice lateral fijo agrupado,
// buscador sobre los términos del glosario (busca el literal original), rótulo de tipo de bloque y ancho de lectura controlado.
// Rutas: #metodo y #metodo/glosario (la ancla que ya existía).
import { renderMetodo } from "../../original/js/view-metodo.js";
import { parseHash } from "../../original/js/rutas.js";
import { el, es } from "../../original/js/ui.js";
import { envolver, lupa, norm } from "../lectura.js";

// grupo de cada bloque, por su título original (los títulos con fecha se reconocen por el principio)
const GRUPOS = [
  ["Glosario", ["Palabras clave"]],
  ["Cómo se hizo", ["Las etiquetas de cada cifra", "Tipos de municipio", "Problemas", "Comprar una vivienda", "Cómo se comparan las medidas", "Cómo se proponen las medidas", "Si cada medida ya se aplica", "Trabajadores 2035", "Datos aproximados"]],
  ["Límites y revisión", ["Viviendas turísticas y alquiler", "Limitaciones", "Revisión de los datos"]],
  ["Historial", ["Historial de cambios"]],
  ["Fuentes", ["Fuentes"]],
];
const grupoDe = (titulo) => GRUPOS.find(([, ts]) => ts.some((t) => titulo.startsWith(t)))?.[0] ?? "Cómo se hizo";
const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function montar(raiz, { store }) {
  const lec = envolver(raiz, {
    clase: "v-metodo", indice: "lateral", dibujar: (c) => renderMetodo(c, store),
    secciones: () => [...raiz.querySelectorAll(".method-block")].map((b) => {
      const t = b.querySelector("h2").textContent;
      if (!b.id) b.id = `m-${slug(t)}`;
      return { id: b.id, etiqueta: t, nodo: b, grupo: grupoDe(t) };
    }),
  });
  // rótulo de tipo antes de cada título de bloque (distingue glosario, método, límites, historial y fuentes sin tocar su redacción)
  raiz.querySelectorAll(".method-block").forEach((b) => {
    const g = grupoDe(b.querySelector("h2").textContent);
    b.dataset.grupo = slug(g);
    b.prepend(el("p", { class: "lec-kicker", "data-propuesta": "", text: g }));
  });
  lec.actualizarIndice();

  // buscador del glosario: oculta los términos que no contienen el texto (en el término o en su definición), sin reescribir nada
  const dl = raiz.querySelector("dl.glossary");
  const pares = [...dl.querySelectorAll("dt")].map((dt) => ({ dt, dd: dt.nextElementSibling, texto: norm(`${dt.textContent} ${dt.nextElementSibling.textContent}`) }));
  const cuenta = el("p", { class: "glos-cuenta", role: "status", "data-propuesta": "" });
  const vacio = el("p", { class: "glos-vacio", hidden: true, "data-propuesta": "", text: "Ningún término contiene ese texto." });
  const campo = el("input", { id: "glos-buscar", type: "search", placeholder: "Buscar en las palabras clave", autocomplete: "off", spellcheck: "false", "data-propuesta": "" });
  const filtrar = () => {
    const q = norm(campo.value.trim());
    let n = 0;
    pares.forEach((p) => { const on = !q || p.texto.includes(q); p.dt.hidden = p.dd.hidden = !on; if (on) n += 1; });
    cuenta.textContent = q ? `${es(n)} de ${es(pares.length)} términos` : `${es(pares.length)} términos`;
    vacio.hidden = n > 0;
  };
  campo.addEventListener("input", filtrar);
  lec.nodos.herr.append(el("label", { class: "buscar-lec vidrio" }, [el("span", { class: "sr-only", text: "Buscar en las palabras clave" }), lupa(), campo]));
  dl.before(cuenta);
  dl.after(vacio);
  filtrar();

  const mostrar = () => { lec.vista.show?.(parseHash(location.hash).sub); };
  mostrar();
  return { alCambiarDireccion: mostrar, desmontar: () => lec.desmontar() };
}
