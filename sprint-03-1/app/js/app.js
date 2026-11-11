// Aplicación integrada · Sprint 03.1. Un marco, un almacén de datos y un router.
//
//   #situacion[/indicador[/INE]]   → Living Atlas (Sprint 02)
//   #medidas[...]                  → Explorador de Medidas (Sprint 03), con todas sus rutas y su contexto en la query
//   #municipios | #acceso | #normas | #metodo → página «aún no rediseñada» dentro del mismo marco (enlace a la versión actual en pestaña nueva)
//
// Solo hay una vista montada a la vez. Al cambiar de vista se desmonta la anterior (se quitan sus oyentes globales y su DOM) y se
// activa solo la hoja de estilos de la nueva: no hay dos aplicaciones superpuestas ni estados que se pisen. Dentro de una misma
// vista, los cambios de dirección los resuelve la propia vista (alCambiarDireccion), con el mismo código que antes.
import { cargarStore } from "./datos.js";

const raiz = document.getElementById("vista");
// cada vista tiene una o más hojas; solo están activas las de la vista abierta
const HOJAS = { situacion: [document.getElementById("css-situacion")], medidas: [document.getElementById("css-medidas"), document.getElementById("css-medidas-diseno")] };
const SECCIONES = { municipios: "Municipios", acceso: "Acceso", normas: "Normas", metodo: "Método" };
const NOMBRES = { situacion: "Situación", medidas: "Medidas", ...SECCIONES };
const TITULOS = { situacion: "Vivienda en Bizkaia · Análisis (prototipo integrado)", medidas: "Medidas · Vivienda en Bizkaia (prototipo integrado)", ...Object.fromEntries(Object.entries(SECCIONES).map(([k, v]) => [k, `${v} · Vivienda en Bizkaia (prototipo integrado)`])) };
let actual = null; // { nombre, clave, vista: { alCambiarDireccion, desmontar } }

/** Qué vista pide la dirección. Cualquier otra cosa (vacía, desconocida) abre Situación. */
export const vistaDe = (hash) => (/^#medidas([/?]|$)/.test(hash) ? "medidas" : "situacion");
/** Sección pendiente que pide la dirección (municipios, acceso, normas, metodo) o null. */
export const seccionDe = (hash) => (hash.match(/^#(municipios|acceso|normas|metodo)([/?]|$)/) || [])[1] || null;

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
  const seccion = seccionDe(location.hash);
  const nombre = seccion ? "pendiente" : vistaDe(location.hash);
  const clave = seccion || nombre; // la marca de navegación y el título siguen a la sección, no al módulo
  if (actual?.clave === clave) { actual.vista.alCambiarDireccion?.(); return; }
  try {
    const store = await cargarStore();
    await Promise.all(Object.values(HOJAS).flat().map(hojaLista));
    actual?.vista.desmontar?.();
    actual = null;
    raiz.replaceChildren();
    Object.entries(HOJAS).forEach(([k, links]) => links.forEach((link) => { link.disabled = k !== nombre; }));
    marcarNavegacion(clave);
    const modulo = await import(`./${nombre}/index.js`);
    const vista = await modulo.montar(raiz, { store, seccion });
    actual = { nombre, clave, vista };
    window.__vista = clave; // solo para las pruebas de _qa
  } catch (err) {
    console.error(err);
    raiz.replaceChildren(Object.assign(document.createElement("p"), { className: "aviso-error", textContent: `No se han podido cargar los datos (${err.message}). Recarga la página.` }));
  }
}

// Un solo montaje a la vez: si la dirección cambia mientras se monta una vista, se espera a que acabe y se relee la dirección más
// reciente (sin esto, dos montajes se pisarían el DOM y los oyentes).
let ocupado = false, pendiente = false;
async function solicitar() {
  if (ocupado) { pendiente = true; return; }
  ocupado = true;
  try { do { pendiente = false; await ir(); } while (pendiente); } finally { ocupado = false; }
}

addEventListener("hashchange", solicitar);
// el enlace «Saltar al contenido» no puede usar un hash: el router lo leería como una dirección
document.getElementById("salto").addEventListener("click", (e) => { e.preventDefault(); raiz.focus(); });
solicitar();
