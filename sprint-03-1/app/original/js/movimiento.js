// La capa de movimiento común a las pestañas: las cifras que ruedan (el momento estrella), los títulos que se enfocan al
// entrar, la frase que se llena de tinta con el scroll y el nombre de la sección en la banda. Todo con transform, opacity
// o color; con «reducir movimiento», cada cosa queda en su sitio y a la vista. Las vistas se dibujan después de cargar la
// página, así que cada función recibe la parte de la página que acaba de dibujarse.
import { reduced } from "./comun.js";

const io = (cb, opts) => ("IntersectionObserver" in window ? new IntersectionObserver(cb, opts) : null);

/** Cifras que ruedan: cada dígito sube hasta su valor una vez, al entrar en pantalla (el CSS hace el giro). */
export function rollingFigures(root) {
  const els = [...root.querySelectorAll("[data-roll]:not(.roll)")];
  els.forEach((el) => {
    const value = el.textContent.trim();
    const said = Object.assign(document.createElement("span"), { className: "sr-only", textContent: value });
    const shown = Object.assign(document.createElement("span"), { className: "roll__digits" });
    shown.setAttribute("aria-hidden", "true");
    let i = 0;
    for (const ch of value) {
      if (!/\d/.test(ch)) { shown.append(ch); continue; }
      const col = Object.assign(document.createElement("span"), { className: "roll__col" });
      const strip = Object.assign(document.createElement("span"), { className: "roll__strip" });
      strip.style.setProperty("--d", ch);
      strip.style.setProperty("--i", i++);
      col.append(strip);
      shown.append(col);
    }
    el.classList.add("roll");
    el.replaceChildren(said, shown);
  });
  const obs = io((entries) => { for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); obs.unobserve(e.target); } }, { rootMargin: "0px 0px -15% 0px" });
  els.forEach((el) => (obs ? obs.observe(el) : el.classList.add("is-in")));
}

/** Los títulos de sección se enfocan una vez al entrar (la entrada «focus» de base.css pone el desenfoque). */
export function revealHeadings(root) {
  const els = [...root.querySelectorAll("[data-reveal]:not(.is-in)")];
  const obs = io((entries) => { for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); obs.unobserve(e.target); } }, { rootMargin: "0px 0px -12% 0px", threshold: 0.1 });
  els.forEach((el) => (obs ? obs.observe(el) : el.classList.add("is-in")));
}

/** La frase se llena de tinta palabra a palabra mientras cruza la pantalla (sin fijarse). */
export function inkFill(el) {
  if (!el) return;
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute("aria-label", el.textContent.trim());
  el.replaceChildren(...words.flatMap((w, i) => {
    const s = Object.assign(document.createElement("span"), { className: "w", textContent: w });
    s.setAttribute("aria-hidden", "true");
    return i ? [" ", s] : [s];
  }));
  const spans = [...el.querySelectorAll(".w")];
  if (!window.ScrollTrigger || reduced()) { spans.forEach((s) => s.classList.add("on")); return; }
  ScrollTrigger.create({
    trigger: el, start: "top 80%", end: "bottom 40%",
    onUpdate: (self) => { const n = Math.round(self.progress * spans.length); spans.forEach((s, i) => s.classList.toggle("on", i < n)); },
  });
}

let chapterObserver = null;

/** El nombre de la sección a la vista, en el centro de la banda (solo donde la banda no enseña las pestañas). */
export function chapterName(root, fallback) {
  const label = document.querySelector("[data-capitulo]:not(section)") ?? document.querySelector(".capitulo-vivo span");
  if (!label) return;
  let current = label.textContent;
  const set = (name) => {
    if (name === current) return;
    current = name;
    const box = label.parentElement;
    if (reduced()) { label.textContent = name; return; }
    box.classList.add("cambia");
    setTimeout(() => { label.textContent = name; box.classList.remove("cambia"); }, 280);
  };
  set(fallback);
  chapterObserver?.disconnect(); // al cambiar de pestaña, el observador de la anterior se suelta
  chapterObserver = io((entries) => { for (const e of entries) if (e.isIntersecting) set(e.target.dataset.capitulo); }, { rootMargin: "-45% 0px -50% 0px" });
  root.querySelectorAll("section[data-capitulo]").forEach((s) => chapterObserver?.observe(s));
}
