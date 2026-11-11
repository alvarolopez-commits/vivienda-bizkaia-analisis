// Exportación (Mejora E): fichas de consulta y comparaciones preparadas para PDF.
// «Exportar a PDF» abre la impresión del navegador con la ficha o la comparación ya compuestas (css/impresion.css): se elige «Guardar como PDF».
// Añade (solo al imprimir) una cabecera con el nombre del producto, el título, las fechas de referencia de los datos y la dirección de la consulta, y un pie con
// las fuentes del análisis. Los datos, textos y cifras son los de la pantalla. No se genera ningún PDF en el servidor ni se envía nada.
//   · ?imprimir=1 en la dirección deja la página ya preparada (cabecera y pie) sin abrir el diálogo: sirve para generar el PDF desde línea de órdenes
//     (chrome --headless --print-to-pdf) y para revisarlo.
import { el } from "../original/js/ui.js";
import { announce } from "../original/js/comun.js";

const fecha = (iso) => { const [y, m, d] = String(iso).split("-").map(Number); return Number.isFinite(y) ? new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : ""; };
let tituloOriginal = null;
/** La dirección de la consulta, sin el parámetro que prepara la impresión. */
const direccion = () => { const u = new URL(location.href); u.searchParams.delete("imprimir"); return u.toString(); };

/** Los municipios de la consulta que se está viendo. */
const consulta = (store) => {
  const A = document.querySelector("#muni-a")?.value, B = document.querySelector("#muni-b")?.value;
  return { A: A || null, B: B || null, nA: A ? store.municipios[A]?.nombre : null, nB: B ? store.municipios[B]?.nombre : null };
};

/** Quita lo preparado para imprimir y devuelve el título de la pestaña. */
export function limpiarImpresion() {
  document.querySelectorAll(".print-cab, .print-pie").forEach((n) => n.remove());
  if (tituloOriginal !== null) { document.title = tituloOriginal; tituloOriginal = null; }
}

/** Espera a que los mapas de barrios (que se cargan aparte) estén dibujados. */
async function esperaBarrios(ms = 6000) {
  const pendiente = () => [...document.querySelectorAll("#vista .vacio")].some((p) => /Cargando los barrios/.test(p.textContent));
  for (let t = 0; t < ms && pendiente(); t += 100) await new Promise((r) => setTimeout(r, 100));
}

/** Compone cabecera y pie de impresión de la ficha o comparación que hay en pantalla. Devuelve false si no hay ficha. */
export async function prepararImpresion(store) {
  const vista = document.getElementById("vista");
  if (!vista?.querySelector(".v-municipios .ficha")) return false;
  limpiarImpresion();
  await esperaBarrios();
  const { nA, nB } = consulta(store);
  if (!nA) return false;
  const titulo = nB ? `Comparación: ${nA} y ${nB}` : `Ficha de consulta: ${nA}`;
  tituloOriginal = document.title;
  document.title = `${nB ? `Comparación ${nA} - ${nB}` : `Ficha ${nA}`} · Vivienda en Bizkaia`;   // el navegador lo propone como nombre del PDF
  vista.before(el("header", { class: "print-cab" }, [
    el("p", { class: "print-marca", text: "Vivienda en Bizkaia · Análisis y medidas" }),
    el("h1", { class: "print-t", text: titulo }),
    el("p", { class: "print-meta", text: `Datos descargados el ${fecha(store.meta.fecha_datos)} · Revisión de los datos: ${fecha(store.meta.fecha_revision)}` }),
    el("p", { class: "print-meta", text: `Consulta: ${direccion()}` }),
  ]));
  vista.after(el("footer", { class: "print-pie" }, [
    el("h2", { text: "Fuentes del análisis" }),
    el("ul", {}, Object.values(store.fuentes).map((f) => el("li", {}, [f.nombre, el("span", { class: "print-url", text: ` — ${f.url}` })]))),
    el("p", { class: "print-nota", text: "Las fuentes de cada indicador, su metodología y los límites de los datos están en la sección Método de la aplicación." }),
  ]));
  return true;
}

async function exportar(store) {
  if (!(await prepararImpresion(store))) return;
  announce("Ficha preparada: elige «Guardar como PDF» en el diálogo de impresión");
  addEventListener("afterprint", limpiarImpresion, { once: true });
  window.print();
}

/** El botón «Exportar a PDF». */
export function botonExportar(store) {
  const b = el("button", { type: "button", class: "btn vidrio exportar", title: "Abre la impresión del navegador con esta ficha preparada: elige «Guardar como PDF»", "data-propuesta": "" }, [el("span", { text: "Exportar a PDF" })]);
  b.addEventListener("click", () => exportar(store));
  return b;
}
