// Datos de la aplicación integrada: se cargan una vez y las SEIS vistas leen el mismo almacén (createStore original, sin cambios).
// Los ficheros son los de la web publicada (app/original/data). Las 928 secciones censales las pide el almacén cuando una vista (barrios) las necesita.
import { createStore } from "../original/js/store.js";

// Misma lista y mismas claves que el main.js original: «municipios.geojson» → municipiosGeo; el resto, el nombre sin extensión.
const OBLIGATORIOS = ["meta.json", "resumen.json", "tipos.json", "municipios.json", "medidas.json", "acceso.json", "diagnostico.json", "municipios.geojson"];
// si falta uno de estos, la web sigue: su pestaña o su parte avisan por su cuenta (mismos valores por defecto que el original)
const OPCIONALES = { "ideas.json": { ideas: [], motivos: {} }, "prevencion.json": null, "fotos.json": { fotos: [] }, "normas.json": null };
const clave = (f) => (f.endsWith(".geojson") ? `${f.replace(".geojson", "")}Geo` : f.replace(".json", ""));
const load = async (f) => { const r = await fetch(new URL(`../original/data/${f}`, import.meta.url)); if (!r.ok) throw new Error(`${f}: ${r.status}`); return r.json(); };
let promesa = null;

/** El almacén único (se carga la primera vez que se pide). */
export function cargarStore() {
  promesa ??= (async () => {
    const opcionales = Object.keys(OPCIONALES);
    const [a, b] = await Promise.all([Promise.all(OBLIGATORIOS.map(load)), Promise.all(opcionales.map((f) => load(f).catch((err) => { console.error(`Falta ${f}:`, err); return OPCIONALES[f]; })))]);
    return createStore(Object.fromEntries([...OBLIGATORIOS.map((f, i) => [clave(f), a[i]]), ...opcionales.map((f, i) => [clave(f), b[i]])]), load);
  })();
  promesa.catch(() => { promesa = null; }); // se puede reintentar
  return promesa;
}
