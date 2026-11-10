// Rutas de la web de análisis (fases 13 y 15), sin efectos: las usa main.js y las prueba tests/test_rutas.py con Node.
// Fase 15: Situación sustituye a Resumen, Comparar entra en Municipios y hay una pestaña nueva, Normas.
import { RADAR_URL } from "./ui.js";

export const VIEW_NAMES = ["situacion", "municipios", "acceso", "medidas", "normas", "metodo"];
// pestañas que cambiaron de nombre (misma web; fase 13 y fase 15) o que se fueron al radar (otra web)
const RENAMED = { diagnostico: "municipios", municipio: "municipios", compra: "acceso", resumen: "situacion", comparar: "municipios" };
const TO_RADAR = { prevencion: "#mapa?modo=alertas", trabajadores: "#horizonte" };
/** '#municipios/48020' -> { view: 'municipios', sub: '48020' } */
export const parseHash = (hash) => {
  const [view, sub] = hash.replace(/^#/, "").split("?")[0].split("/");
  return { view: VIEW_NAMES.includes(view) ? view : "situacion", sub: sub || null };
};

/** Direccion nueva de una direccion de antes (null si no hay que cambiarla). Las del radar son absolutas. */
export const redirectOf = (hash) => {
  const [view, sub] = hash.replace(/^#/, "").split("?")[0].split("/");
  if (Object.hasOwn(TO_RADAR, view)) return `${RADAR_URL}${TO_RADAR[view]}`;
  if (view === "ideas") return "#medidas/alternativas";
  if (Object.hasOwn(RENAMED, view)) return `#${RENAMED[view]}${sub ? `/${sub}` : ""}`;
  return null;
};
