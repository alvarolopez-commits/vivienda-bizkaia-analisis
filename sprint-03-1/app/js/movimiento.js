// Movimiento · sistema Astara DCI (§9) aplicado a la aplicación (ver css/movimiento.css, que es donde viven los tiempos, las curvas y las reglas).
// Aquí solo está lo que necesita script: la intensidad (?mov=), la transición entre vistas (View Transitions), la píldora deslizante de los
// selectores, la entrada escalonada de cada vista y el refresco de un valor que cambia. Nada de esto toca datos, textos ni cálculos.
// Todo lo que se anima es transform u opacity (o las propiedades independientes translate y scale). Sin listeners de scroll.

import { rollingFigures } from "../original/js/movimiento.js"; // la animación original de las cifras (se dibuja con css/movimiento.css)

const INTENSIDAD = { quieto: "still", sobrio: "restrained", expresivo: "expressive", still: "still", restrained: "restrained", expressive: "expressive" };

export const reducido = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export const modo = () => document.body.dataset.motion;

/** Intensidad del producto: «expressive» por defecto; ?mov=quieto | sobrio | expresivo para compararlas. */
export function iniciar() {
  document.body.dataset.motion = INTENSIDAD[new URLSearchParams(location.search).get("mov")] ?? "expressive";
}

/**
 * Continuidad entre estados: el cambio de vista dentro de una View Transition (la cabecera se queda; el contenido se funde y sube).
 * Sin soporte, con «reducir movimiento», con intensidad «still» o con la pestaña oculta, el cambio se hace directo. Si el navegador no
 * llega a llamar a la función (sin fotogramas que esperar), a los 250 ms se ejecuta igualmente. Devuelve cuando el DOM ya está cambiado.
 */
export async function transicion(actualiza) {
  if (!document.startViewTransition || reducido() || modo() === "still" || document.hidden) return actualiza();
  let prom = null;
  const run = () => (prom ??= Promise.resolve().then(actualiza));
  const t = document.startViewTransition(run);
  t.ready.catch(() => {}); t.finished.catch(() => {}); t.updateCallbackDone.catch(() => {});
  setTimeout(run, 250);
  await Promise.race([t.updateCallbackDone.catch(() => {}), new Promise((r) => setTimeout(r, 600))]);
  return run();
}

// ---------------------------------------------------------------------------------------------------------------------
// Píldora deslizante: continuidad de «qué está elegido». La píldora oscura se mueve al nuevo elegido (aria-pressed / aria-current) en vez de
// apagarse en uno y encenderse en otro. Es un elemento absoluto que no empuja a nadie (la excepción documentada del sistema para animar su tamaño).
const ACTIVO = '[aria-pressed="true"], [aria-current="page"], [aria-current="true"]';
const SEL_LENTE = ".vistas, .problemas, .modos, .m-lineas, .rep-toggle, .lec-indice, .x-botones";

function colocar(c, l) {
  if (!l.isConnected) { c.prepend(l); delete l.dataset.a; }   // si el contenedor se reconstruyó, la píldora vuelve a su sitio sin deslizarse
  const on = [...c.children].find((h) => h !== l && h.matches(ACTIVO));
  if (!on || !on.offsetHeight) { l.style.opacity = "0"; return; }
  const a = `${on.offsetLeft},${on.offsetTop},${on.offsetWidth},${on.offsetHeight}`;
  if (l.dataset.a === a) return;
  const primera = !l.dataset.a;
  if (primera) l.style.transition = "none";
  else if (!reducido() && modo() !== "still") { l.classList.add("moving"); clearTimeout(l._m); l._m = setTimeout(() => l.classList.remove("moving"), 130); }   // la gota se aplasta al salir y se recupera al llegar
  l.dataset.a = a;
  l.style.width = `${on.offsetWidth}px`;
  l.style.height = `${on.offsetHeight}px`;
  l.style.borderRadius = getComputedStyle(on).borderRadius;
  l.style.transform = `translate(${on.offsetLeft}px, ${on.offsetTop}px)`;
  l.style.opacity = "1";
  if (primera) { void l.offsetWidth; l.style.transition = ""; }
}

export function lente(c) {
  if (!c || c._lente) return;
  c._lente = true;
  c.classList.add("con-lente");
  if (getComputedStyle(c).position === "static") c.style.position = "relative";
  const l = Object.assign(document.createElement("span"), { className: "lente" });
  l.setAttribute("aria-hidden", "true");
  let r = 0;
  const poner = () => { cancelAnimationFrame(r); r = requestAnimationFrame(() => colocar(c, l)); };
  new MutationObserver(poner).observe(c, { childList: true, attributes: true, attributeFilter: ["aria-pressed", "aria-current"], subtree: true });
  if ("ResizeObserver" in window) new ResizeObserver(poner).observe(c);
  document.fonts?.ready.then(poner);
  colocar(c, l);
}

/** Pone la píldora en todos los selectores de la vista, también en los que se reconstruyen después (p. ej. los supuestos de Acceso). */
export function lentes(raiz) {
  const alta = () => raiz.querySelectorAll(SEL_LENTE).forEach(lente);
  alta();
  let r = 0;
  const mo = new MutationObserver(() => { cancelAnimationFrame(r); r = requestAnimationFrame(alta); });
  mo.observe(raiz, { childList: true, subtree: true });
  return () => mo.disconnect();
}

// ---------------------------------------------------------------------------------------------------------------------
// Entrada de la vista (jerarquía): primero la cabecera y lo que se consulta, escalonado con tope de 4 pasos (200 ms); un solo momento firma.
const BLOQUES = {
  situacion: [".atlas-cab", ".lienzo", ".panel"],
  medidas: [".m-cab", ".m-barra", ".m-stage", ".m-side"],
  municipios: [".lec-cab", ".lec-indice", ".muni-cab", ".ficha > section:first-of-type"],
  lec: [".lec-cab", ".lec-indice", ".lec-contenido > :nth-child(1)", ".lec-contenido > :nth-child(2)"],
};
const FOCAL = { medidas: ".m-stage", municipios: ".muni-cab" };   // Situación: el mapa (css); Acceso y Normas: las cifras que ruedan

export function entrada(nombre, raiz) {
  if (modo() === "still") return;
  if (modo() === "expressive") rollingFigures(raiz); // el main.js original la llamaba tras dibujar cada vista; solo con «expressive» (si no, las cifras quedan como texto)
  let i = 0;
  for (const s of BLOQUES[nombre] ?? BLOQUES.lec) {
    for (const n of raiz.querySelectorAll(s)) {
      n.style.setProperty("--i", String(i++));
      n.classList.add("rise");
      if (FOCAL[nombre] && n.matches(FOCAL[nombre])) n.classList.add("focal");
      n.addEventListener("animationend", (e) => { if (e.target === n) n.classList.remove("rise", "focal"); }, { once: true });
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Un valor que cambió tras elegir otra cosa (feedback): se refresca con un fundido corto. La cifra NO se interpola: cambia de golpe y se nota.
const SEL_TICK = ".x-num, .alcance-total, .comp-cuenta, .glos-cuenta, .m-resumen-cifra, .rep-cab .cuenta";

export function observarTick(raiz) {
  const mo = new MutationObserver((ms) => {
    const vistos = new Set();
    for (const m of ms) {
      const n = (m.target.nodeType === 1 ? m.target : m.target.parentElement)?.closest(SEL_TICK);
      if (!n || vistos.has(n)) continue;
      vistos.add(n);
      n.classList.remove("tick"); void n.offsetWidth; n.classList.add("tick");
    }
  });
  mo.observe(raiz, { subtree: true, characterData: true, childList: true });
  return () => mo.disconnect();
}
