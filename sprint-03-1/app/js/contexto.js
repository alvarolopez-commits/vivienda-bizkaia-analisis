// Contexto de investigación compartido por Situación, Municipios, Acceso y Medidas.
//
// Qué se recuerda: el problema elegido en Situación (id del indicador), el municipio principal y, en Municipios, el municipio comparado.
// Para qué: (1) los enlaces de la cabecera llevan ese contexto («Municipios» abre el municipio que estabas mirando; «Situación», el problema y el municipio);
//           (2) cada vista ofrece una fila «Seguir con <municipio>» con los saltos que tienen sentido desde ella.
// No calcula ni cambia ningún dato: solo compone direcciones con las rutas que ya existen. Se guarda en sessionStorage (solo esta pestaña) y una dirección
// directa manda sobre lo guardado.
import { el } from "../original/js/ui.js";

const CLAVE = "vb-contexto";
let store = null;
let c = { problema: null, muni: null, muniB: null };
try { c = { ...c, ...JSON.parse(sessionStorage.getItem(CLAVE) ?? "{}") }; } catch { /* sin almacenamiento: solo en memoria */ }

const MAX_SEL = 3;   // el máximo de medidas elegidas a la vez en Medidas (js/medidas/estado-app.js)
const conMuni = (m) => Boolean(m) && store && Object.hasOwn(store.municipios, m);

/** Se llama una vez con el almacén de datos. */
export function iniciar(s) { store = s; if (!conMuni(c.muni)) c.muni = null; if (!conMuni(c.muniB)) c.muniB = null; actualizarCabecera(); }

export const leer = () => ({ ...c });

/** Cambia el contexto (solo las claves que llegan) y avisa a quien escuche. */
export function fijar(parcial) {
  const antes = JSON.stringify(c);
  // si cambia el municipio principal y no se dice nada del comparado, la comparación anterior ya no vale
  if ("muni" in parcial && parcial.muni !== c.muni && !("muniB" in parcial)) parcial = { ...parcial, muniB: null };
  c = { ...c, ...parcial };
  if (store && !conMuni(c.muni)) c.muni = null;
  if (store && !conMuni(c.muniB)) c.muniB = null;
  if (JSON.stringify(c) === antes) return;
  try { sessionStorage.setItem(CLAVE, JSON.stringify(c)); } catch { /* sin almacenamiento */ }
  actualizarCabecera();
  document.dispatchEvent(new CustomEvent("vb-contexto"));
}

/** Los municipios con precio de compra propio son los que el explorador de Acceso ofrece en «Dónde» (misma condición que original/js/acceso/explorador.js). */
const tieneCompra = (m) => Boolean(m?.compra?.precio && m.compra.ratio_neto && ["P25", "P50", "P75"].every((q) => m.compra.tramos?.[q]?.renta_bruta));

/** Dirección de cada vista con el contexto actual. */
export function enlace(vista) {
  const { problema, muni, muniB } = c;
  if (vista === "situacion") return `#situacion${problema ? `/${problema}${muni ? `/${muni}` : ""}` : muni ? `/alquiler/${muni}` : ""}`;
  if (vista === "municipios") return muni ? `#municipios/${muni}${muniB && muniB !== muni ? `-${muniB}` : ""}` : "#municipios";
  if (vista === "acceso") return muni && store && tieneCompra(store.municipios[muni]) ? `#acceso?lugar=${muni}` : "#acceso";
  if (vista === "medidas") {
    const ids = muni && store ? (store.municipios[muni].plan ?? []).map((p) => p.id).filter((id) => Object.hasOwn(store.measures, id)).slice(0, MAX_SEL) : [];
    return ids.length ? `#medidas?sel=${ids.join(",")}` : "#medidas";
  }
  return `#${vista}`;
}

/** Los enlaces de la cabecera (y del menú) llevan el contexto. */
export function actualizarCabecera() {
  document.querySelectorAll("a[data-vista]").forEach((a) => { if (["situacion", "municipios", "acceso", "medidas"].includes(a.dataset.vista)) a.setAttribute("href", enlace(a.dataset.vista)); });
}

const ROTULOS = { situacion: "Ver en el mapa", municipios: "Su ficha", acceso: "Calcular la compra", medidas: "Medidas de su plan" };
const TITULOS = {
  situacion: "Situación: el mapa con este municipio elegido y el mismo problema",
  municipios: "Municipios: la ficha de este municipio",
  acceso: "Acceso: el explorador de compra con este municipio en «Dónde»",
  medidas: "Medidas: sus medidas del plan ya elegidas (hasta tres)",
};

/** Fila «Seguir con <municipio>» para la vista `actual` (null si no hay municipio). Se redibuja sola cuando cambia el contexto. */
export function filaContexto(actual, { clase = "" } = {}) {
  const nav = el("nav", { class: `ctx-enlaces ${clase}`.trim(), "aria-label": "Seguir con este municipio en otras vistas" });
  const pintar = () => {
    if (nav.dataset.visto && !nav.isConnected) { document.removeEventListener("vb-contexto", pintar); return; }   // la vista se desmontó
    if (nav.isConnected) nav.dataset.visto = "1";
    if (!c.muni || !store) { nav.hidden = true; nav.replaceChildren(); return; }
    nav.hidden = false;
    const links = ["situacion", "municipios", "acceso", "medidas"].filter((v) => v !== actual).map((v) => ({ v, href: enlace(v) }))
      .filter(({ v, href }) => (v !== "acceso" || href !== "#acceso") && (v !== "medidas" || href !== "#medidas"));
    nav.replaceChildren(el("span", { class: "ctx-t" }, ["Seguir con ", el("b", { text: store.municipios[c.muni].nombre })]),
      ...links.map(({ v, href }) => el("a", { class: "ctx-a", href, title: TITULOS[v], text: ROTULOS[v] })));
  };
  pintar();
  document.addEventListener("vb-contexto", pintar);
  nav.desmontar = () => document.removeEventListener("vb-contexto", pintar);
  return nav;
}
