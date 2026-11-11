// Envoltura común de las vistas de consulta (Municipios, Acceso, Normas, Método).
// Cada vista sigue dibujando su contenido con el renderizador ORIGINAL de la web publicada (app/original/js, sin cambios): aquí solo se
// monta ese contenido dentro de una composición propia (cabecera, barra de herramientas, índice interno) y se le da el sistema de diseño.
// Nada de lo que se muestra (textos, cifras, cálculos) se escribe ni se recalcula en este archivo, salvo los rótulos marcados data-propuesta.
import { el } from "../original/js/ui.js";
import { modo } from "./movimiento.js";

export const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** La lupa de los buscadores (SVG real: el() solo crea nodos HTML). */
export function lupa() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = '<circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/>';
  return svg;
}

/** Las cifras «que ruedan» del original (movimiento.js) se animan con css/movimiento.css solo con la intensidad «expressive» (una vez, al entrar en
 *  pantalla); con las demás se devuelven a texto plano (Geist, tabular). `forzar` las aplana siempre (las pruebas comparan el texto). */
export function cifrasPlanas(raiz, forzar = false) {
  if (!forzar && modo() === "expressive") return;
  raiz.querySelectorAll(".roll").forEach((n) => {
    const dicho = n.querySelector(".sr-only")?.textContent;
    if (dicho !== undefined) { n.replaceChildren(document.createTextNode(dicho)); n.classList.remove("roll", "is-in"); }
  });
}

/**
 * @param {HTMLElement} raiz  contenedor de la vista (#vista)
 * @param {object} o
 * @param {string} o.clase    clase de la vista (p. ej. "v-municipios")
 * @param {(contenido:HTMLElement)=>object|void} o.dibujar  llama al renderizador original con el contenedor de contenido; devuelve su {show}
 * @param {"lateral"|"pestanas"|null} o.indice  tipo de índice interno
 * @param {()=>Array<{id:string,etiqueta:string,nodo:HTMLElement,grupo?:string}>} [o.secciones]  secciones del índice (por defecto, section[data-capitulo])
 * @param {(c:HTMLElement)=>HTMLElement|null} [o.herramientas]  nodo del contenido que pasa a la barra de herramientas
 * @param {HTMLElement[]} [o.extraCabecera]  nodos nuevos para la cabecera (marcados data-propuesta si son texto)
 */
export function envolver(raiz, o) {
  const titulo = el("div", { class: "lec-titulo" });
  const herr = el("div", { class: "lec-herr" });
  const cab = el("header", { class: "lec-cab" }, [titulo, herr]);
  const contenido = el("div", { class: "lec-contenido" });
  const indiceNav = o.indice ? el("nav", { class: `lec-indice vidrio ${o.indice === "pestanas" ? "pestanas" : "lateral"}`, "aria-label": "En esta página" }) : null;
  const cuerpo = el("div", { class: `lec-cuerpo${indiceNav ? ` con-${o.indice}` : ""}` }, [indiceNav, contenido]);
  const shell = el("div", { class: `lec ${o.clase}`, id: o.clase.replace(/^v-/, "") }, [cab, cuerpo]);
  raiz.replaceChildren(shell);

  const vista = o.dibujar(contenido) ?? {};
  // la cabecera original (h1 + frase) pasa a la cabecera de la composición; el resto del contenido se queda donde está
  const cabOriginal = contenido.querySelector("header.vista-cab");
  if (cabOriginal) { titulo.append(...cabOriginal.childNodes); cabOriginal.remove(); }
  const hr = o.herramientas?.(contenido);
  if (hr) herr.append(hr);
  (o.extraCabecera ?? []).forEach((n) => titulo.append(n));
  cifrasPlanas(contenido);

  // ---- índice interno con seguimiento de lo que se está leyendo ----
  let obs = null, botones = [], fijarHasta = 0, marcarActual = () => {};
  // al llegar al final de la página el último bloque no puede subir hasta arriba: se marca igualmente
  const alDesplazar = () => { if (Date.now() > fijarHasta && innerHeight + scrollY >= document.documentElement.scrollHeight - 4) marcarActual("ultimo"); };
  addEventListener("scroll", alDesplazar, { passive: true });
  const actualizarIndice = () => {
    if (!indiceNav) return;
    obs?.disconnect();
    const secs = (o.secciones ? o.secciones() : [...contenido.querySelectorAll("section[data-capitulo]")].map((s) => ({ id: s.id, etiqueta: s.dataset.capitulo, nodo: s })));
    botones = secs.map((s) => {
      const b = el("button", { type: "button", class: "lec-ir", "data-id": s.id, text: s.etiqueta });
      b.addEventListener("click", () => { fijarHasta = Date.now() + 1500; marcarActual(s.id); s.nodo.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); s.nodo.setAttribute("tabindex", "-1"); s.nodo.focus({ preventScroll: true }); });
      return b;
    });
    let ultimoGrupo = null; const hijos = [];
    secs.forEach((s, i) => { if (s.grupo && s.grupo !== ultimoGrupo) { hijos.push(el("p", { class: "lec-grupo", text: s.grupo })); ultimoGrupo = s.grupo; } hijos.push(botones[i]); });
    indiceNav.replaceChildren(...(o.indice === "lateral" ? [el("p", { class: "lec-indice-t", "data-propuesta": "", text: "En esta página" })] : []), ...hijos);
    const marcar = (id) => botones.forEach((b, i) => { if (b.dataset.id === (id === "ultimo" ? secs.at(-1).id : id)) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
    marcarActual = marcar;
    if (botones[0]) marcar(secs[0].id);
    if ("IntersectionObserver" in window) {
      obs = new IntersectionObserver((es) => { if (Date.now() < fijarHasta) return; const e = es.filter((x) => x.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (e) marcar(e.target.id); }, { rootMargin: "-20% 0px -65% 0px" });
      secs.forEach((s) => obs.observe(s.nodo));
    }
  };
  actualizarIndice();
  return { vista, nodos: { titulo, herr, contenido, indice: indiceNav, shell }, actualizarIndice, desmontar: () => { obs?.disconnect(); removeEventListener("scroll", alDesplazar); } };
}
