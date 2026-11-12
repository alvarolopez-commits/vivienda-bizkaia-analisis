// Punto de entrada del radar (fase 15, pieza 4): carga los archivos del territorio, comprueba que cumplen el contrato
// (contrato.js), dibuja cada pestaña la primera vez que se abre y lleva la navegación. El código no sabe de qué territorio
// se trata: el nombre, los municipios, los indicadores y las medidas llegan en los datos.
import { animate } from "./comun.js";
import { OPTIONAL, REQUIRED, checkTerritoryFiles, isDataFile } from "./contrato.js";
import { renderDatos } from "./datos.js";
import { renderEscenarios } from "./escenarios.js";
import { renderIndicadores } from "./indicadores.js";
import { renderMedidas } from "./medidas.js";
import { renderMetodo } from "./metodo.js";
import { VIEWS, parseHash, redirectOf } from "./rutas.js";
import { renderSituacion } from "./situacion.js";
import { el, extLink, longDate } from "./ui.js";

const NAMES = { situacion: "Situación", indicadores: "Indicadores", medidas: "Medidas en marcha", escenarios: "Escenarios", datos: "Datos", metodologia: "Metodología" };
const RENDER = { situacion: renderSituacion, indicadores: renderIndicadores, medidas: renderMedidas, escenarios: renderEscenarios, datos: renderDatos, metodologia: renderMetodo };

const load = async (name) => {
  const res = await fetch(`data/${name}`, { cache: "no-cache" }); // siempre comprueba si hay datos nuevos
  if (!res.ok) throw new Error(`No se pudo cargar ${name} (${res.status})`);
  return res.json();
};
/** Un módulo opcional: null si el territorio no lo trae; si lo declara y no se puede leer, se apunta como problema. */
const optional = (name, problems) => {
  if (name === null || name === undefined) return Promise.resolve(null);
  if (!isDataFile(name)) return Promise.resolve(null); // el contrato lo dirá
  return load(name).catch((err) => { problems.push(`${name} · no se pudo leer (${err.message})`); return null; });
};

/** Lee los archivos del territorio: los obligatorios, el mapa y los opcionales que declare territorio.json. */
async function loadTerritory() {
  const territorio = await load("territorio.json");
  const rest = await Promise.all(REQUIRED.filter((k) => k !== "territorio").map((k) => load(`${k}.json`)));
  const files = { territorio, ...Object.fromEntries(REQUIRED.filter((k) => k !== "territorio").map((k, i) => [k, rest[i]])) };
  files.geo = await load(isDataFile(territorio.mapas?.municipios) ? territorio.mapas.municipios : "municipios.geojson");
  const files2 = territorio.archivos ?? {};
  const problems = [];
  const [esc, fit] = await Promise.all([optional(files2.escenarios, problems), optional(files2.donde_caben, problems)]);
  files[OPTIONAL.escenarios] = esc;
  files[OPTIONAL.donde_caben] = fit;
  return { files, problems };
}

/** Todo lo que las pestañas necesitan, con accesos cómodos por id. */
function makeStore(f) {
  const t = f.territorio;
  return {
    territorio: t, catalogo: f.catalogo, alertas: f.alertas, medidas: f.medidas, datos: f.datos, geo: f.geo,
    escenarios: f.escenario_base, dondeCaben: f.donde_caben,
    ind: Object.fromEntries(f.catalogo.indicadores.map((i) => [i.id, i])),
    dims: Object.fromEntries(f.catalogo.dimensiones.map((d) => [d.id, d])),
    calendar: Object.fromEntries(f.datos.calendario.map((c) => [c.id, c])),
    name: (code) => t.municipios[code]?.nombre ?? code,
    analysisUrl: t.analisis_url ?? null,
  };
}

function frame(store) {
  const t = store.territorio;
  document.querySelector("[data-producto]").textContent = t.producto;
  document.querySelector("[data-territorio-nombre]").textContent = t.nombre;
  const fecha = `Datos descargados el ${longDate(t.fecha_datos)}`;
  document.querySelector("[data-fecha]").textContent = fecha;
  document.querySelector("[data-barra-fecha]").textContent = fecha;
  document.querySelector("[data-enlaces]").replaceChildren(...(t.enlaces ?? []).map((e) => extLink(e.url, `${e.texto} ↗`)));
  if (!store.escenarios) document.querySelector('.nav a[data-view="escenarios"]').append(el("span", { class: "sr-only", text: " (no disponible)" }));
}

function menu() {
  const button = document.querySelector("[data-menu]"), side = document.querySelector("[data-lateral]");
  const sheet = document.getElementById("hoja");
  const set = (open) => {
    side.classList.toggle("abierto", open);
    button.setAttribute("aria-expanded", String(open));
    sheet.inert = open; // con el menú abierto, el tabulador no entra en la hoja tapada
    if (open) side.querySelector("a")?.focus();
  };
  button.addEventListener("click", () => set(!side.classList.contains("abierto")));
  side.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && side.classList.contains("abierto")) { set(false); button.focus(); } });
  // el enlace «Saltar al contenido» lleva el foco a la hoja sin cambiar la dirección (que es la ruta)
  document.querySelector("[data-saltar]").addEventListener("click", (e) => { e.preventDefault(); document.getElementById("hoja").focus(); });
}

function showProblems(problems) {
  const root = document.getElementById("hoja");
  root.replaceChildren(el("div", { class: "aviso", role: "alert" }, [
    el("strong", { text: "Los datos de este territorio no cumplen el formato del radar." }),
    el("p", { text: "Quien mantiene el radar tiene que corregir estos puntos (la guía «Llevar el radar a otro territorio» explica cada archivo):" }),
    el("ul", {}, problems.slice(0, 15).map((p) => el("li", { text: p }))),
    problems.length > 15 ? el("p", { text: `Y ${problems.length - 15} más.` }) : null,
  ]));
}

async function init() {
  let files, store;
  try {
    const loaded = await loadTerritory();
    files = loaded.files;
    const problems = [...loaded.problems, ...checkTerritoryFiles(files)];
    if (problems.length) { showProblems(problems); return; }
    store = makeStore(files);
    frame(store);
  } catch (err) {
    document.getElementById("hoja").replaceChildren(el("p", { class: "aviso", role: "alert", text: `No se pudieron cargar los datos (${err.message}). Recarga la página dentro de un momento.` }));
    return;
  }
  menu();
  const views = {};
  let current = null, sceneStarted = false;
  const route = () => {
    const moved = redirectOf(location.hash, store.analysisUrl);
    if (moved?.startsWith("https://")) { location.replace(moved); return; }
    if (moved) { history.replaceState(null, "", moved); }
    const { view, sub, params } = parseHash(location.hash);
    for (const v of VIEWS) document.getElementById(`view-${v}`).hidden = v !== view;
    document.querySelectorAll(".nav a[data-view]").forEach((a) => (a.dataset.view === view ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    document.querySelector("[data-barra-titulo]").textContent = NAMES[view];
    const root = document.getElementById(`view-${view}`);
    try {
      if (!views[view]) { views[view] = RENDER[view](root, store) ?? {}; animate(root); }
      views[view].show?.(sub, params);
    } catch (err) {
      root.querySelector("[data-cuerpo]").replaceChildren(el("p", { class: "aviso", role: "alert", text: `No se pudo dibujar esta pestaña (${err.message}). Recarga la página.` }));
    }
    const head = views[view]?.head?.() ?? {};
    const title = head.title ?? NAMES[view];
    document.getElementById("titulo").textContent = title;
    document.querySelector("[data-sub]").replaceChildren(...[head.sub ?? ""].flat().filter((x) => x !== null && x !== undefined));
    const crumb = document.querySelector("[data-miga]");
    crumb.hidden = !head.crumb;
    if (head.crumb) Object.assign(crumb.querySelector("a"), { href: head.crumb.href, textContent: head.crumb.text });
    document.title = `${title} · ${store.territorio.producto} · ${store.territorio.nombre}`;
    if (view === "situacion" && !sceneStarted && window.Stage) { sceneStarted = true; Stage.init(); }
    if (current !== `${view}/${sub ?? ""}`) {
      const keep = views[view]?.keepScroll?.(sub);
      if (!keep) window.scrollTo(0, 0);
      if (current !== null && !keep) { const h1 = document.getElementById("titulo"); h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
    }
    current = `${view}/${sub ?? ""}`;
    window.ScrollTrigger?.refresh();
  };
  window.addEventListener("hashchange", route);
  route();
}

init();
