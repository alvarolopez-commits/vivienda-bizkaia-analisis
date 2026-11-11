// Inicio (hero). Se ve solo con la dirección raíz (vacía, «#» o «#inicio»); debajo está la vista Situación de siempre.
//   · rellena las cifras con los datos reales (municipios, problemas, medidas, instrumentos) y hace rodar las cifras en «expressive»;
//   · rota unas pocas ilustraciones de fondo (solo «expressive», sin movimiento reducido) y precarga solo las que va a mostrar;
//   · al bajar (rueda, teclado o gesto), lleva de una vez a Situación; al subir desde su inicio, vuelve al hero.
// No lee ni cambia ningún dato; las ilustraciones salen del registro de banners (municipios/imagenes.js).
import { cargarStore } from "./datos.js";
import { INDICADORES } from "../original/js/situacion/indicadores.js";
import { rollingFigures } from "../original/js/movimiento.js";
import { es } from "../original/js/ui.js";
import { cifrasPlanas } from "./lectura.js";
import { modo, reducido } from "./movimiento.js";
import { bannerDe } from "./municipios/imagenes.js";

const ES_INICIO = /^#?(inicio)?$/;
const FOTOS = ["48020", "48017", "48057", "48044"];   // Bilbao, Bermeo, Lekeitio, Getxo (ilustraciones; véase docs/diseno/BANNERS_MUNICIPIOS.md)
const PERIODO = 8000;

const sec = document.getElementById("inicio");
const vista = document.getElementById("vista");
let construido = false, timer = null, animando = false;

// El hero está «visible» desde la carga con la dirección raíz hasta que la persona navega a otra dirección (hashchange). Situación reescribe la dirección
// por su cuenta (history.replaceState: #situacion/alquiler…) sin que eso quite el hero, por eso no se lee la dirección cada vez.
let visible = document.documentElement.classList.contains("con-inicio");
export const esInicio = () => visible;
const banda = () => document.querySelector(".banda")?.offsetHeight ?? 64;
const destino = () => Math.max(0, Math.round(vista.getBoundingClientRect().top + scrollY - banda()));

function ir(y) {
  if (animando) return;
  animando = true;
  const suave = !reducido() && modo() !== "still";
  scrollTo({ top: y, behavior: suave ? "smooth" : "auto" });
  setTimeout(() => { animando = false; }, suave ? 1000 : 50);
}

// ---------- rotación de ilustraciones ----------
function fotos() {
  const caja = sec.querySelector(".hero-fotos");
  const lista = FOTOS.map((c) => bannerDe(c));
  const imgs = lista.map((b, i) => {
    const img = Object.assign(document.createElement("img"), { alt: "", decoding: "async" });
    img.setAttribute("aria-hidden", "true");
    img.style.objectPosition = i === 0 ? "62% 50%" : "50% 50%";
    caja.append(img);
    return img;
  });
  // la primera se pide ya y se muestra al cargar; las demás solo si va a haber rotación, y cuando la página está en reposo
  imgs[0].fetchPriority = "high";
  imgs[0].addEventListener("load", () => imgs[0].classList.add("on"), { once: true });
  imgs[0].src = lista[0].src;
  let i = 0;
  const siguiente = () => {
    const j = (i + 1) % imgs.length;
    if (!imgs[j].src) imgs[j].src = lista[j].src;
    const mostrar = () => { imgs[i].classList.remove("on"); imgs[j].classList.add("on"); i = j; };
    if (imgs[j].complete && imgs[j].naturalWidth) mostrar(); else imgs[j].addEventListener("load", mostrar, { once: true });
  };
  const parar = () => { clearInterval(timer); timer = null; };
  const arrancar = () => { if (!timer && modo() === "expressive" && !reducido() && !sec.hidden && getComputedStyle(sec).display !== "none") timer = setInterval(() => { if (!document.hidden) siguiente(); }, PERIODO); };
  (window.requestIdleCallback ?? ((f) => setTimeout(f, 1200)))(() => { if (modo() === "expressive" && !reducido()) imgs.slice(1).forEach((m, k) => { m.src = lista[k + 1].src; }); });
  return { arrancar, parar };
}
let rot = null;

// las clases de entrada (rise/focal) se retiran al terminar, como en el resto de la aplicación (si el hero no se ve, al cargar)
function limpiarEntrada() { sec.querySelectorAll(".rise, .focal").forEach((n) => n.classList.remove("rise", "focal")); }

// ---------- cifras reales ----------
async function cifras() {
  const store = await cargarStore();
  const datos = [
    [store.codes.length, "municipios", "#municipios"],
    [INDICADORES.length, "problemas", "#situacion"],
    [Object.keys(store.measures).length, "medidas", "#medidas"],
    [store.normas?.competencias?.length ?? 0, "instrumentos", "#normas"],
  ].filter(([n]) => n > 0);
  sec.querySelector(".hero-cifras").replaceChildren(...datos.map(([n, etq, href], i) => {
    const li = document.createElement("li");
    const a = Object.assign(document.createElement("a"), { href });
    a.className = "rise"; a.style.setProperty("--i", String(Math.min(i + 3, 4)));
    a.innerHTML = '<span class="cifra" data-roll></span><span class="linea"></span><span class="etq"></span>';
    a.querySelector(".cifra").textContent = es(n);
    a.querySelector(".etq").textContent = etq;
    li.append(a);
    return li;
  }));
  sec.querySelector(".hero-n").textContent = es(store.codes.length);
  if (modo() === "expressive") rollingFigures(sec); else cifrasPlanas(sec, true);
  setTimeout(limpiarEntrada, 1800);
}

// ---------- mostrar / ocultar según la dirección ----------
export function sincronizar() {
  const dentro = esInicio();
  document.documentElement.classList.toggle("con-inicio", dentro);
  // el hero lleva el h1 de la página: el de Situación pasa a ser un encabezado de segundo nivel mientras el hero está
  const h1 = vista.querySelector("h1");
  if (h1) { if (dentro) { h1.setAttribute("role", "heading"); h1.setAttribute("aria-level", "2"); } else { h1.removeAttribute("role"); h1.removeAttribute("aria-level"); } }
  if (dentro && !construido) { construido = true; rot = fotos(); cifras().catch((e) => console.error("Inicio:", e)); }
  if (dentro) rot?.arrancar(); else { rot?.parar(); limpiarEntrada(); }
}

// ---------- bajar de una vez a Situación (y volver) ----------
const campo = (t) => t && (t.closest?.("input, select, textarea, [contenteditable='true']") || t.isContentEditable);
function enHero() { return esInicio() && scrollY < sec.offsetHeight * 0.5; }
function enContenido() { return esInicio() && Math.abs(scrollY - destino()) < 6; }

addEventListener("wheel", (e) => {
  if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
  if (e.deltaY > 4 && enHero()) { e.preventDefault(); ir(destino()); }
  else if (e.deltaY < -4 && enContenido()) { e.preventDefault(); ir(0); }
  else if (animando && esInicio()) e.preventDefault();
}, { passive: false });
addEventListener("keydown", (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey || campo(e.target) || e.target.closest?.("button, a, summary")) return;
  if (["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey && enHero()) { e.preventDefault(); ir(destino()); }
  else if (["ArrowUp", "PageUp"].includes(e.key) && enContenido()) { e.preventDefault(); ir(0); }
});
let y0 = null;
addEventListener("touchstart", (e) => { y0 = e.touches[0]?.clientY ?? null; }, { passive: true });
addEventListener("touchend", (e) => {
  if (y0 === null) return;
  const dy = (e.changedTouches[0]?.clientY ?? y0) - y0; y0 = null;
  if (dy < -50 && enHero()) ir(destino()); else if (dy > 50 && enContenido()) ir(0);
}, { passive: true });
sec.querySelector(".hero-bajar")?.addEventListener("click", () => ir(destino()));
addEventListener("hashchange", () => { visible = ES_INICIO.test(location.hash); sincronizar(); if (visible) scrollTo(0, 0); });   // las vistas nuevas ya empiezan arriba (app.js)
