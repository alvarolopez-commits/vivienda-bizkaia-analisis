// Punto de entrada: carga los datos, dibuja cada pestaña la primera vez que se abre y gestiona la navegación.
// Rutas (fase 15): #situacion · #municipios/48020 · #municipios/48020-48013 (comparar) · #acceso · #medidas/M06 ·
// #medidas/alternativas · #normas · #metodo. Las direcciones de antes se traducen a las nuevas o llevan al radar.
import { announce } from "./comun.js";
import { chapterName, inkFill, revealHeadings, rollingFigures } from "./movimiento.js";
import { redirectOf, parseHash } from "./rutas.js";
import { renderSituacion } from "./situacion/index.js";
import { createStore } from "./store.js";
import { el, extLink } from "./ui.js";
import { renderAcceso } from "./acceso/index.js";
import { renderMedidas } from "./medidas/index.js";
import { renderMetodo } from "./view-metodo.js";
import { renderMunicipios } from "./municipios/index.js";
import { renderNormas } from "./normas.js";

const NAMES = { situacion: "Situación", municipios: "Municipios", acceso: "Acceso", medidas: "Medidas", normas: "Normas", metodo: "Método" };
const VIEWS = {
  situacion: renderSituacion, municipios: renderMunicipios, acceso: renderAcceso, medidas: renderMedidas,
  normas: renderNormas, metodo: renderMetodo,
};
const FILES = ["meta.json", "resumen.json", "tipos.json", "municipios.json", "medidas.json", "acceso.json", "diagnostico.json", "municipios.geojson"];
// si falta uno de estos, la web sigue: su pestaña o su parte avisan por su cuenta
const OPTIONAL = { "ideas.json": { ideas: [], motivos: {} }, "prevencion.json": null, "fotos.json": { fotos: [] }, "normas.json": null };

const load = async (name) => {
  const res = await fetch(`data/${name}`, { cache: "no-cache" }); // siempre comprueba si hay datos nuevos
  if (!res.ok) throw new Error(`No se pudo cargar ${name} (${res.status})`);
  return res.json();
};
/** 'municipios.json' -> 'municipios'; 'municipios.geojson' -> 'municipiosGeo' */
const dataKey = (file) => (file.endsWith(".geojson") ? `${file.replace(".geojson", "")}Geo` : file.replace(".json", ""));
const dateLabel = (iso) => {
  const [y, m, d] = iso.split("-").map(Number); // fecha local, sin desfase de zona horaria
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
};

/** La banda, el menú, los diálogos, los botones de copiar y el enlace para saltar al contenido. */
function navigation() {
  const lock = (on) => {
    document.documentElement.classList.toggle("modal-abierto", on);
    if (on) window.Stage?.lenis?.stop(); else window.Stage?.lenis?.start();
  };
  document.querySelectorAll("[data-abre]").forEach((b) => b.addEventListener("click", () => { document.getElementById(b.dataset.abre).showModal(); lock(true); }));
  document.querySelectorAll("dialog").forEach((d) => d.addEventListener("close", () => lock(false)));
  document.querySelectorAll("#menu a").forEach((a) => a.addEventListener("click", () => document.getElementById("menu").close()));
  document.querySelectorAll("[data-copia]").forEach((b) => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(b.dataset.copia); b.textContent = "Copiado"; announce("Dirección copiada"); } catch { b.textContent = "Cópialo a mano"; announce("No se pudo copiar: cópialo a mano"); }
    setTimeout(() => { b.textContent = "Copiar"; }, 2000);
  }));
  // saltar al contenido sin cambiar de pestaña (la dirección # elige la pestaña)
  document.querySelector(".saltar").addEventListener("click", (e) => { e.preventDefault(); document.getElementById("main").focus(); });
}

/** Los créditos de las fotos, en su diálogo. */
function credits(fotos) {
  document.querySelector("[data-creditos]").replaceChildren(...fotos.map((f) => el("li", {}, [
    extLink(f.pagina, f.credito), " (", extLink(f.licencia, "licencia"), ")",
  ])));
}

/** Movimiento y escenas de lo que se acaba de dibujar. */
function animate(root) {
  rollingFigures(root);
  revealHeadings(root);
  root.querySelectorAll("[data-tinta]").forEach(inkFill);
}

async function init() {
  navigation();
  const moved = redirectOf(location.hash);
  if (moved?.startsWith("https://")) { location.replace(moved); return; } // la sección vive ahora en el radar
  if (moved) history.replaceState(null, "", moved);
  if (window.Stage && window.gsap) Stage.smooth();
  // la pestaña pedida se ve ya, con su título, mientras llegan los datos
  const first = parseHash(location.hash).view;
  Object.keys(VIEWS).forEach((v) => { document.getElementById(`view-${v}`).hidden = v !== first; });
  try {
    const optional = Object.keys(OPTIONAL);
    const [loaded, extra] = await Promise.all([Promise.all(FILES.map(load)),
      Promise.all(optional.map((f) => load(f).catch((err) => { console.error(`Falta ${f}:`, err); return OPTIONAL[f]; })))]);
    const store = createStore(Object.fromEntries([...FILES.map((f, i) => [dataKey(f), loaded[i]]), ...optional.map((f, i) => [dataKey(f), extra[i]])]), load);
    document.getElementById("loading").remove();
    document.querySelector("[data-fecha-datos]").textContent = `Datos descargados el ${dateLabel(store.meta.fecha_datos)}. Solo totales y porcentajes: ninguna cifra identifica a una persona.`;
    credits(store.fotos.fotos);
    const drawn = {};
    const show = () => {
      const next = redirectOf(location.hash);
      if (next?.startsWith("https://")) { location.assign(next); return; }
      if (next) { location.replace(next); return; } // vuelve a llamar a show con la dirección nueva
      const { view, sub } = parseHash(location.hash);
      Object.keys(VIEWS).forEach((v) => { document.getElementById(`view-${v}`).hidden = v !== view; });
      document.querySelectorAll(".capitulos a").forEach((a) => (a.dataset.view === view ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
      const root = document.getElementById(`view-${view}`);
      try {
        if (!drawn[view]) {
          const out = VIEWS[view](root, store);
          if (out instanceof Promise) out.catch((err) => console.error(`${view}: falló una parte que se carga después`, err));
          drawn[view] = out && typeof out === "object" && !(out instanceof Promise) ? out : {};
          animate(root);
          if (view === "situacion" && window.Stage && window.gsap) { Stage.init(); Stage.ready(); }
        }
        drawn[view].show?.(sub);
      } catch (err) {
        console.error(`No se pudo dibujar ${view}:`, err);
        root.replaceChildren(el("p", { class: "aviso-error", text: `No se pudo mostrar esta sección: ${err.message}. Recarga la página.` }));
      }
      chapterName(root, NAMES[view]);
      document.title = view === "situacion" ? "Vivienda en Bizkaia · Análisis" : `${NAMES[view]} · Vivienda en Bizkaia`;
      const keepScroll = (view === "medidas" && sub === "alternativas") || (view === "metodo" && sub);
      if (!keepScroll) { if (window.Stage?.lenis) Stage.lenis.scrollTo(0, { immediate: true }); else window.scrollTo(0, 0); }
      requestAnimationFrame(() => window.ScrollTrigger?.refresh());
    };
    window.addEventListener("hashchange", show);
    show();
  } catch (err) {
    console.error("Error cargando los datos:", err);
    document.getElementById("main").replaceChildren(el("p", { class: "aviso-error", text: "No se pudieron cargar los datos. Recarga la página dentro de un momento." }));
  }
}

init();
