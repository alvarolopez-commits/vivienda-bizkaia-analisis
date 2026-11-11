// Vistas aún no rediseñadas (Municipios, Acceso, Normas, Método), dentro del mismo marco que Situación y Medidas.
// No enseñan contenido nuevo ni inventado: dicen que la sección no está rediseñada y ofrecen la versión actual publicada
// (en una pestaña nueva, para no perder esta) y la vuelta a Situación. Los textos son propuesta y van marcados (?marcar).
const WEB = "https://vizcaya-vivienda-analisis.vercel.app/";
const NOMBRES = { municipios: "Municipios", acceso: "Acceso", normas: "Normas", metodo: "Método" };

export function montar(raiz, { seccion }) {
  const nombre = NOMBRES[seccion] ?? "Esta sección";
  const el = (tag, attrs = {}, hijos = []) => { const n = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); n.append(...hijos); return n; };
  const marcar = (n) => { n.setAttribute("data-propuesta", ""); return n; };
  const titulo = el("h1", { tabindex: "-1" }, [nombre]);
  const abrir = el("a", { class: "btn primary", href: `${WEB}#${seccion}`, target: "_blank", rel: "noopener" }, [marcar(el("span", {}, ["Ver la versión actual"])), el("span", { "aria-hidden": "true" }, [" ↗"])]);
  const volver = el("a", { class: "btn", href: "#situacion" }, [marcar(el("span", {}, ["Volver a Situación"]))]);
  const seccionEl = el("section", { class: "pendiente", "aria-labelledby": "pendiente-t" }, [
    marcar(el("p", { class: "pendiente-rotulo" }, ["Aún no rediseñada"])),
    Object.assign(titulo, { id: "pendiente-t" }),
    marcar(el("p", { class: "pendiente-texto" }, [`La sección ${nombre} sigue como en la versión publicada. Se abre en una pestaña nueva para que esta no se pierda.`])),
    el("div", { class: "pendiente-acciones" }, [abrir, volver]),
  ]);
  raiz.replaceChildren(seccionEl);
  titulo.focus({ preventScroll: true });
  return { alCambiarDireccion() {}, desmontar() {} };
}
