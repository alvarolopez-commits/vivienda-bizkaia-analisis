// «Copiar enlace»: copia la dirección actual, que ya recoge la consulta (vista, problema, municipios, filtros, supuestos, medidas elegidas).
// Cada vista escribe su estado en la dirección con las rutas que ya existían (+ una query); este botón solo copia lo que hay en la barra.
import { announce } from "../original/js/comun.js";

const boton = document.getElementById("copiar-enlace");

async function copiar(texto) {
  try { await navigator.clipboard.writeText(texto); return true; } catch { /* sin permiso o sin API: se prueba el método clásico */ }
  const t = Object.assign(document.createElement("textarea"), { value: texto });
  t.setAttribute("readonly", ""); t.style.cssText = "position:fixed;top:0;left:0;opacity:0";
  document.body.append(t); t.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch { ok = false; }
  t.remove();
  return ok;
}

let reponer = null;
boton?.addEventListener("click", async () => {
  const ok = await copiar(location.href);
  const original = boton.dataset.rotulo ?? (boton.dataset.rotulo = boton.textContent);
  boton.textContent = ok ? "Enlace copiado" : "No se pudo copiar";
  announce(ok ? "Enlace de esta consulta copiado" : "No se pudo copiar el enlace; cópialo de la barra de direcciones");
  clearTimeout(reponer);
  reponer = setTimeout(() => { boton.textContent = original; }, 2200);
});
