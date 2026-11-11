// Aplicación integrada · Sprint 03.1. Un marco, un almacén de datos y un router.
//
//   #situacion[/indicador[/INE]]   → Living Atlas (Sprint 02)
//   #medidas[...]                  → Explorador de Medidas (Sprint 03), con todas sus rutas y su contexto en la query
//   #municipios[/INE[-INE]]        → Explorador de municipios (ficha y comparación)
//   #acceso                        → Simulador de alquiler y compra
//   #normas                        → Competencias y línea de tiempo
//   #metodo[/glosario]             → Método, glosario y fuentes
//
// Solo hay una vista montada a la vez. Al cambiar de vista se desmonta la anterior (se quitan sus oyentes globales y su DOM) y se
// activa solo la hoja de estilos de la nueva: no hay dos aplicaciones superpuestas ni estados que se pisen. Dentro de una misma
// vista, los cambios de dirección los resuelve la propia vista (alCambiarDireccion), con el mismo código que antes.
import { cargarStore } from "./datos.js";
import { redirectOf } from "../original/js/rutas.js";
import { entrada, iniciar, lente, lentes, modo, observarTick } from "./movimiento.js";

iniciar(); // intensidad del movimiento (body[data-motion]); la píldora de la cabecera es la misma en las seis vistas
lente(document.querySelector(".vistas"));

const raiz = document.getElementById("vista");
// cada vista tiene una o más hojas; solo están activas las de la vista abierta
const hoja = (id) => document.getElementById(id);
const HOJAS = { situacion: [hoja("css-situacion")], medidas: [hoja("css-medidas"), hoja("css-medidas-diseno")], municipios: [hoja("css-municipios")], acceso: [hoja("css-acceso")], normas: [hoja("css-normas")], metodo: [hoja("css-metodo")] };
const NOMBRES = { situacion: "Situación", municipios: "Municipios", acceso: "Acceso", medidas: "Medidas", normas: "Normas", metodo: "Método" };
const TITULOS = Object.fromEntries(Object.entries(NOMBRES).map(([k, v]) => [k, k === "situacion" ? "Vivienda en Bizkaia · Análisis (prototipo integrado)" : `${v} · Vivienda en Bizkaia (prototipo integrado)`]));
let actual = null; // { nombre, vista: { alCambiarDireccion, desmontar } }
let limpieza = null; // suelta los observadores de movimiento de la vista que se va

/** Qué vista pide la dirección. Cualquier otra cosa (vacía, desconocida) abre Situación. */
export const vistaDe = (hash) => (hash.match(/^#(medidas|municipios|acceso|normas|metodo)([/?]|$)/) || [])[1] || "situacion";

async function hojaLista(link) {
  // una hoja desactivada ya se cargó la primera vez (solo se desactiva después): no tiene .sheet y su evento load no volverá
  if (!link.disabled && !link.sheet) await new Promise((r) => { link.addEventListener("load", r, { once: true }); link.addEventListener("error", r, { once: true }); });
}

function marcarNavegacion(nombre) {
  document.querySelectorAll("a[data-vista]").forEach((a) => {
    if (a.dataset.vista === nombre) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  document.getElementById("vista-activa").textContent = NOMBRES[nombre];
  document.title = TITULOS[nombre];
}

async function ir() {
  // direcciones de antes de la web publicada (#compra, #diagnostico, #comparar/A-B, #ideas...): se traducen con el mismo rutas.js original.
  // Las que ahora viven en el radar (otra web) se abren allí.
  const movida = redirectOf(location.hash);
  if (movida?.startsWith("https://")) { location.replace(movida); return; }
  if (movida) history.replaceState(null, "", movida);
  const nombre = vistaDe(location.hash);
  if (actual?.nombre === nombre) { actual.vista.alCambiarDireccion?.(); return; }
  const cubrir = Boolean(actual) && modo() !== "still"; // la primera carga no tiene contenido que cubrir
  if (!actual) raiz.setAttribute("aria-busy", "true");   // primera carga: esqueleto mientras llegan los datos
  try {
    // 1) respuesta inmediata: la píldora ya viaja a la pestaña nueva y el contenido viejo se cubre con el velo (150 ms)
    marcarNavegacion(nombre);
    if (cubrir) document.body.classList.add("cambiando");
    // 2) lo lento (módulos, datos, hojas de estilo) se hace MIENTRAS el velo se cierra, no después
    const [store, modulo] = await Promise.all([cargarStore(), import(`./${nombre}/index.js`), Promise.all(Object.values(HOJAS).flat().map(hojaLista)), cubrir ? pausa(150) : null]);
    // 3) con el velo cerrado se cambia la vista (nada de esto se ve)
    limpieza?.(); limpieza = null;
    actual?.vista.desmontar?.();
    actual = null;
    raiz.replaceChildren();
    Object.entries(HOJAS).forEach(([k, links]) => links.forEach((link) => { link.disabled = k !== nombre; }));
    const vista = await modulo.montar(raiz, { store });
    actual = { nombre, vista };
    window.__vista = nombre; // solo para las pruebas de _qa
    window.scrollTo(0, 0);   // una vista nueva empieza arriba
    entrada(nombre, raiz);
    const sueltaLentes = lentes(raiz), sueltaTick = observarTick(raiz);
    limpieza = () => { sueltaLentes(); sueltaTick(); };
  } catch (err) {
    console.error(err);
    raiz.replaceChildren(Object.assign(document.createElement("p"), { className: "aviso-error", textContent: `No se han podido cargar los datos (${err.message}). Recarga la página.` }));
  } finally {
    raiz.removeAttribute("aria-busy");
    requestAnimationFrame(() => document.body.classList.remove("cambiando")); // 4) el velo se abre (240 ms) y deja ver la vista nueva
  }
}
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

// Un solo montaje a la vez: si la dirección cambia mientras se monta una vista, se espera a que acabe y se relee la dirección más
// reciente (sin esto, dos montajes se pisarían el DOM y los oyentes).
let ocupado = false, pendiente = false;
async function solicitar() {
  if (ocupado) { pendiente = true; return; }
  ocupado = true;
  try { do { pendiente = false; await ir(); } while (pendiente); } finally { ocupado = false; }
}

// Precarga: cada vista se descarga en cuanto el puntero o el teclado llegan a su pestaña y, con la página en reposo, todas; así el cambio no espera a la red.
const precargar = (v) => import(`./${v}/index.js`).catch(() => {});
document.querySelectorAll("a[data-vista]").forEach((a) => ["pointerenter", "focus", "touchstart"].forEach((ev) => a.addEventListener(ev, () => precargar(a.dataset.vista), { once: true, passive: true })));
(window.requestIdleCallback ?? ((f) => setTimeout(f, 1500)))(() => Object.keys(NOMBRES).forEach(precargar));

addEventListener("hashchange", solicitar);
// el enlace «Saltar al contenido» no puede usar un hash: el router lo leería como una dirección
document.getElementById("salto").addEventListener("click", (e) => { e.preventDefault(); raiz.focus(); });
solicitar();
