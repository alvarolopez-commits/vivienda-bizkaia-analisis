// Inicio (hero + puerta a los tres productos). Se ve solo con la dirección raíz (vacía, «#» o «#inicio»); debajo está la vista Situación de siempre.
//   · dos composiciones del MISMO contenido (?hero=a editorial inmersiva, por defecto; ?hero=b atlas primero con el mapa real de Bizkaia);
//   · fondo «flow» (img/flow): ?fondo=1 o 2 para compararlos (A usa el 1 y B el 2 por defecto);
//   · el número de municipios sale de los datos; el mapa de B usa la geometría real de la aplicación (sin datos coloreados);
//   · NO secuestra el desplazamiento: la persona baja como siempre; «Explorar el análisis» y «Entrar al análisis» son botones que llevan a Situación.
// No lee ni cambia ningún dato analítico.
import { cargarStore } from "./datos.js";
import { svgMap } from "../original/js/mapa.js";
import { rollingFigures } from "../original/js/movimiento.js";
import { es } from "../original/js/ui.js";
import { cifrasPlanas } from "./lectura.js";
import { modo, reducido } from "./movimiento.js";

const ES_INICIO = /^#?(inicio)?$/;
const params = new URLSearchParams(location.search);
const VARIANTE = params.get("hero") === "b" ? "b" : "a";
const FONDO = params.get("fondo") === "1" ? 1 : params.get("fondo") === "2" ? 2 : VARIANTE === "b" ? 2 : 1;
document.documentElement.dataset.hero = VARIANTE;

const sec = document.getElementById("inicio");
const vista = document.getElementById("vista");
let construido = false;

// El hero está «visible» desde la carga con la dirección raíz hasta que la persona navega a otra dirección (hashchange). Situación reescribe la dirección
// por su cuenta (history.replaceState: #situacion/alquiler…) sin que eso quite el hero, por eso no se lee la dirección cada vez.
let visible = document.documentElement.classList.contains("con-inicio");
export const esInicio = () => visible;

const banda = () => document.querySelector(".banda")?.offsetHeight ?? 64;
function irAlAnalisis() {
  const y = Math.max(0, Math.round(vista.getBoundingClientRect().top + scrollY - banda()));
  scrollTo({ top: y, behavior: reducido() || modo() === "still" ? "auto" : "smooth" });
  vista.setAttribute("tabindex", "-1"); vista.focus({ preventScroll: true });
}

// las clases de entrada (rise) se retiran al terminar, como en el resto de la aplicación (si el hero no se ve, al cargar)
function limpiarEntrada() { sec.querySelectorAll(".rise").forEach((n) => n.classList.remove("rise")); }

async function construir() {
  const img = sec.querySelector(".hero-fondo img");
  img.src = new URL(`../img/flow/flow-${FONDO === 1 ? "a" : "b"}.webp`, import.meta.url).href;
  const store = await cargarStore();
  const n = es(store.codes.length);
  sec.querySelectorAll(".n-munis").forEach((s) => { s.textContent = n; });
  if (VARIANTE === "b") {
    const svg = svgMap(store.municipiosGeo, () => ({ fill: "#ffffff" }), { stroke: "#ffffff", label: "Mapa de los municipios de Bizkaia" });
    svg.removeAttribute("role"); svg.setAttribute("aria-hidden", "true"); svg.setAttribute("focusable", "false");
    sec.querySelector(".hero-mapa").replaceChildren(svg);
  }
  if (modo() === "expressive") rollingFigures(sec); else cifrasPlanas(sec, true);
  setTimeout(limpiarEntrada, 1800);
}

export function sincronizar() {
  document.documentElement.classList.toggle("con-inicio", visible);
  // el hero lleva el h1 de la página: el de Situación pasa a ser un encabezado de segundo nivel mientras el hero está
  const h1 = vista.querySelector("h1");
  if (h1) { if (visible) { h1.setAttribute("role", "heading"); h1.setAttribute("aria-level", "2"); } else { h1.removeAttribute("role"); h1.removeAttribute("aria-level"); } }
  if (visible && !construido) { construido = true; construir().catch((e) => console.error("Inicio:", e)); }
  if (!visible) limpiarEntrada();
}

sec.querySelectorAll("[data-ir='analisis']").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); irAlAnalisis(); }));
addEventListener("hashchange", () => { visible = ES_INICIO.test(location.hash); sincronizar(); if (visible) scrollTo(0, 0); });   // las vistas nuevas ya empiezan arriba (app.js)
