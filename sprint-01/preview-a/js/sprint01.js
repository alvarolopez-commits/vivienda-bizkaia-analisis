// Sprint 01 · Opción A. Añade, sin tocar main.js ni los módulos de datos:
//  1. el nombre de la vista activa cuando las pestañas se pliegan (nunca se oculta la vista activa);
//  2. aria-current en los enlaces del menú;
//  3. la navegación interna de Situación (Mapa, Lista, Tipos, Otras herramientas) SIN cambiar location.hash:
//     la dirección elige la vista, así que un ancla #mapa la rompería (main.js reinicia el scroll al cambiar el hash).
import { parseHash } from "./rutas.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Marcar lo nuevo con #marcar o ?marcar
const marcar = () => document.documentElement.classList.toggle("marcar", location.hash === "#marcar" || new URLSearchParams(location.search).has("marcar"));
marcar();
addEventListener("hashchange", marcar);
if (new URLSearchParams(location.search).has("limpio")) document.body.classList.add("limpio");

/* 1 y 2: vista activa */
function syncActive() {
  const { view } = parseHash(location.hash);
  const link = $(`.capitulos a[data-view="${view}"]`);
  const label = $("[data-vista-activa]");
  if (link && label) label.textContent = link.textContent;
  $$("#menu .menu-lista a").forEach((a) => {
    if (a.getAttribute("href") === `#${view}`) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
}
syncActive();
addEventListener("hashchange", () => requestAnimationFrame(syncActive));
new MutationObserver(syncActive).observe($(".capitulos"), { subtree: true, attributes: true, attributeFilter: ["aria-current"] });

/* 3: navegación interna de Situación */
const sub = $("#sub-situacion");
const view = $("#view-situacion");
const buttons = $$("button[data-ir]", sub);
const target = (b) => document.getElementById(b.dataset.ir);

function refresh() {
  sub.hidden = view.hidden;
  document.documentElement.style.setProperty("--sub-alto", view.hidden ? "0px" : `${sub.offsetHeight}px`);
  buttons.forEach((b) => b.setAttribute("aria-disabled", String(!target(b))));
}
new MutationObserver(refresh).observe(view, { attributes: true, attributeFilter: ["hidden"] });
new MutationObserver(refresh).observe(view, { childList: true, subtree: true }); // las secciones se dibujan después de cargar los datos
refresh();

const offset = () => $(".banda").offsetHeight + (sub.hidden ? 0 : sub.offsetHeight);
// Sin Lenis (móvil) el desplazamiento suave nativo no es fiable en todos los navegadores: se anima a mano.
let raf = 0;
function glide(y) {
  cancelAnimationFrame(raf);
  if (reduced()) { scrollTo(0, y); return; }
  const y0 = scrollY, t0 = performance.now(), dur = Math.min(900, 350 + Math.abs(y - y0) * 0.06);
  const ease = (k) => 1 - (1 - k) ** 3;
  const step = (now) => {
    const k = Math.min(1, (now - t0) / dur);
    scrollTo(0, y0 + (y - y0) * ease(k));
    if (k < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  // red de seguridad: si el navegador frena los fotogramas (pestaña en segundo plano), se llega igualmente
  setTimeout(() => { if (Math.abs(scrollY - y) > 2) { cancelAnimationFrame(raf); scrollTo(0, y); } }, dur + 150);
}
// La escena de la portada reserva su altura (pin de ScrollTrigger) un instante después de cargar. Si el usuario pulsa
// antes de que el diseño se asiente, el destino se corrige solo, salvo que el usuario ya haya tomado el control.
let usuario = false, correcciones = [];
["wheel", "touchstart", "keydown", "pointerdown"].forEach((ev) => addEventListener(ev, (e) => { if (!(e.target.closest && e.target.closest("#sub-situacion"))) usuario = true; }, { passive: true }));
const yDe = (t) => Math.max(0, t.getBoundingClientRect().top + scrollY - offset());
function ir(t, inmediato) {
  const y = yDe(t);
  // Lenis calcula su límite de scroll al cargar, antes de que la escena de la portada reserve su altura: se actualiza
  // antes de desplazar, o se queda corto (comprobado: límite 1041 px con la página de 10.251 px).
  if (window.Stage?.lenis) { Stage.lenis.resize?.(); Stage.lenis.scrollTo(y, { immediate: inmediato || reduced(), duration: 1 }); }
  else if (inmediato) scrollTo(0, y); else glide(y);
}
function go(b) {
  const t = target(b);
  if (!t) return;
  usuario = false; correcciones.forEach(clearTimeout);
  ir(t, false);
  correcciones = [1600, 3200].map((ms) => setTimeout(() => { if (!usuario && Math.abs(t.getBoundingClientRect().top - offset()) > 6) ir(t, true); }, ms));
  // el teclado sigue desde la sección elegida
  const h = $("h2", t) ?? t;
  h.setAttribute("tabindex", "-1");
  h.focus({ preventScroll: true });
  setTimeout(() => spy(), 1300); // por si el navegador no emite el evento de scroll al llegar
}
buttons.forEach((b) => b.addEventListener("click", () => go(b)));

/* Sección visible → marca «estás aquí» en la navegación interna (solo ayuda, no cambia nada) */
const spy = () => {
  if (sub.hidden) return;
  const line = offset() + 24;
  let current = null;
  buttons.forEach((b) => { const t = target(b); if (t && t.getBoundingClientRect().top <= line) current = b; });
  buttons.forEach((b) => (b === current ? b.setAttribute("aria-current", "location") : b.removeAttribute("aria-current")));
};
addEventListener("scroll", spy, { passive: true });
