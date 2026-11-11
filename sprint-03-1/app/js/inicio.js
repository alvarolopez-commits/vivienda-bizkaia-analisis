// Inicio (hero + puerta a los tres productos). Se ve solo con la dirección raíz (vacía, «#» o «#inicio»); debajo está la vista Situación de siempre.
//   · hero editorial inmersiva con el fondo «flow» (img/flow);
//   · el número de municipios sale de los datos;
//   · NO secuestra el desplazamiento: la persona baja como siempre; «Explorar el análisis» y «Entrar al análisis» son botones que llevan a Situación.
// No lee ni cambia ningún dato analítico.
import { cargarStore } from "./datos.js";
import { rollingFigures } from "../original/js/movimiento.js";
import { es } from "../original/js/ui.js";
import { cifrasPlanas } from "./lectura.js";
import { modo, reducido } from "./movimiento.js";

const ES_INICIO = /^#?(inicio)?$/;

const sec = document.getElementById("inicio");
const vista = document.getElementById("vista");
let construido = false;

// El hero está «visible» desde la carga con la dirección raíz hasta que la persona navega a otra dirección (hashchange). Situación reescribe la dirección
// por su cuenta (history.replaceState: #situacion/alquiler…) sin que eso quite el hero, por eso no se lee la dirección cada vez.
let visible = document.documentElement.classList.contains("con-inicio");
export const esInicio = () => visible;

// la cabecera (las seis vistas) solo se ve en el análisis: aparece cuando Situación llega a la parte alta de la pantalla (franja de 100 px) y se va al volver al hero
const umbral = document.getElementById("umbral");   // marca donde empieza el análisis: es el punto al que llevan los botones y donde aparece la cabecera
let io = null;
const dentro = new Set();
function vigilar() {
  io?.disconnect(); dentro.clear();
  io = new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? dentro.add(e.target) : dentro.delete(e.target))); document.documentElement.classList.toggle("en-analisis", dentro.size > 0); }, { rootMargin: `0px 0px -${Math.max(1, innerHeight - 100)}px 0px` });
  io.observe(umbral); io.observe(vista);
}
vigilar();
addEventListener("resize", () => { clearTimeout(vigilar.t); vigilar.t = setTimeout(vigilar, 150); });

const banda = () => document.querySelector(".banda")?.offsetHeight ?? 64;
function irAlAnalisis() {
  const y = Math.max(0, Math.round(umbral.getBoundingClientRect().top + scrollY - banda()));
  scrollTo({ top: y, behavior: reducido() || modo() === "still" ? "auto" : "smooth" });
  vista.setAttribute("tabindex", "-1"); vista.focus({ preventScroll: true });
}

// las clases de entrada (rise) se retiran al terminar, como en el resto de la aplicación (si el hero no se ve, al cargar)
function limpiarEntrada() { sec.querySelectorAll(".rise").forEach((n) => n.classList.remove("rise")); }

async function construir() {
  const img = sec.querySelector(".hero-fondo img");
  img.src = new URL("../img/flow/flow-3.webp", import.meta.url).href;
  const store = await cargarStore();
  const n = es(store.codes.length);
  sec.querySelectorAll(".n-munis").forEach((s) => { s.textContent = n; });
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
