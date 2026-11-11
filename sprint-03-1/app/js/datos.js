// Datos de la aplicación integrada: se cargan una vez y todas las vistas leen el mismo almacén (createStore original, sin cambios).
// Antes cada prototipo cargaba y construía el suyo; aquí Situación y Medidas no pueden ver datos distintos.
import { createStore } from "../original/js/store.js";

const FILES = ["municipios.json", "municipios.geojson", "meta.json", "resumen.json", "medidas.json", "ideas.json"];
const load = async (f) => { const r = await fetch(new URL(`../original/data/${f}`, import.meta.url)); if (!r.ok) throw new Error(`${f}: ${r.status}`); return r.json(); };
let promesa = null;

/** El almacén único (se carga la primera vez que se pide). */
export function cargarStore() {
  promesa ??= Promise.all(FILES.map(load)).then(([municipios, municipiosGeo, meta, resumen, medidas, ideas]) => createStore({ municipios, municipiosGeo, meta, resumen, medidas, ideas }, load));
  promesa.catch(() => { promesa = null; }); // se puede reintentar
  return promesa;
}
