// Sprint 02 · comprobación de maquetación a un ancho dado (se ejecuta tras cambiar el tamaño de la ventana):
//   JSON.stringify((await import('/_qa/qa-layout.js')).run())
// Desborde horizontal, objetivos táctiles de menos de 36 px, problemas visibles, mapa con altura útil.
export function run() {
  const vw = innerWidth;
  const sw = document.documentElement.scrollWidth;
  const visible = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden"; };
  const objetivos = [...document.querySelectorAll("main button, main a, main input, main select, .banda a, .banda button")].filter(visible);
  const pequenos = objetivos.filter((e) => { const r = e.getBoundingClientRect(); return r.height < 36 && !e.closest(".source-line, .fuente, .pie"); })
    .map((e) => `${e.tagName.toLowerCase()}.${e.className || ""} «${(e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 24)}» ${Math.round(e.getBoundingClientRect().height)}px`);
  const desbordan = [...document.querySelectorAll("main *")].filter((e) => { const r = e.getBoundingClientRect(); return r.right > vw + 1 && !e.closest("svg"); }).slice(0, 5)
    .map((e) => `${e.tagName.toLowerCase()}.${e.className?.baseVal ?? e.className}`);
  const problemas = [...document.querySelectorAll("#problemas .problema")].map((b) => { const r = b.getBoundingClientRect(); return r.left >= 0 && r.right <= vw + 1 && r.width > 40; });
  const mapa = document.querySelector("#mapa svg").getBoundingClientRect();
  return { ancho: vw, scrollWidth: sw, sinScrollHorizontal: sw <= vw, problemasVisibles: problemas.every(Boolean), mapa: `${Math.round(mapa.width)}×${Math.round(mapa.height)}`, pequenos, desbordan };
}
