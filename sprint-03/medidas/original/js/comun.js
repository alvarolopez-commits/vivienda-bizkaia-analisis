// Dos utilidades que comparten los módulos de la página: si el lector pidió «reducir movimiento» y la región de estado
// que avisa a los lectores de pantalla de un cambio (la calculadora, la frase de construcción, «Copiado»).

export const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

let timer;
/** Escribe el aviso una sola vez, cuando el lector deja de tocar los controles (wait, en milisegundos). */
export function announce(text, wait = 0) {
  const el = document.querySelector("[data-anuncio]");
  if (!el) return;
  clearTimeout(timer);
  timer = setTimeout(() => { el.textContent = text; }, wait);
}
