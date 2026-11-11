// Información del dato (Mejora D): un botón «i» que abre, junto a cada visualización, la ficha de trazabilidad del indicador con los campos que EXISTEN en
// los archivos de datos y en los textos originales: nombre y definición, fuente, periodo, fecha de actualización o revisión, cobertura, naturaleza del valor
// y enlace al bloque de Método. Si un campo no consta, se dice («No consta en los datos») y NO se rellena con una suposición.
//
// Fechas: son las de referencia que traen los datos (meta.fecha_datos, meta.fecha_revision, medidas.estado.comprobado_el, normas.fecha), nunca la fecha de hoy.
// Material: el vidrio (L1 el botón, L2 el marco) es solo el contenedor ligero de consulta; el texto, las fuentes y las explicaciones van en una superficie sólida.
import { TIPO, el, es } from "../original/js/ui.js";

// ---------------------------------------------------------------------------------------------------------------------------------------------
// Panel
const ICONO = () => {
  const NS = "http://www.w3.org/2000/svg", s = document.createElementNS(NS, "svg");
  s.setAttribute("viewBox", "0 0 16 16"); s.setAttribute("aria-hidden", "true"); s.setAttribute("focusable", "false");
  for (const [tag, a] of [["circle", { cx: "8", cy: "8", r: "6.2" }], ["path", { d: "M8 7.2v3.6" }], ["path", { d: "M8 5.1v.1" }]]) { const n = document.createElementNS(NS, tag); Object.entries(a).forEach(([k, v]) => n.setAttribute(k, v)); s.append(n); }
  return s;
};

let abierto = null;   // { boton, panel }
let n = 0;

function cerrar(devolverFoco = true) {
  if (!abierto) return;
  const { boton, panel } = abierto;
  abierto = null;
  panel.remove();
  boton.setAttribute("aria-expanded", "false");
  if (devolverFoco) boton.focus();
  document.removeEventListener("keydown", alTeclear, true);
  document.removeEventListener("pointerdown", alPulsarFuera, true);
  removeEventListener("scroll", alDesplazar, true);
  removeEventListener("resize", alRedimensionar);
  removeEventListener("hashchange", alNavegar);
}
const alTeclear = (e) => { if (e.key === "Escape" && abierto) { e.stopPropagation(); cerrar(true); } };
const alPulsarFuera = (e) => { if (abierto && !abierto.panel.contains(e.target) && !abierto.boton.contains(e.target)) cerrar(false); };
const alDesplazar = (e) => { if (abierto && !abierto.panel.contains(e.target)) cerrar(false); };
const alRedimensionar = () => cerrar(false);
const alNavegar = () => cerrar(false);

const FALTA = "No consta en los datos";

/** Campos de un descriptor, en el orden pedido. Devuelve [rótulo, nodo | null]; null = no consta. */
function campos(d) {
  const lista = (xs) => (xs?.length ? el("ul", { class: "info-lista" }, xs.map((x) => el("li", {}, [x.url ? el("a", { href: x.url, target: "_blank", rel: "noopener noreferrer", text: x.nombre }) : x.nombre ?? x]))) : null);
  return [
    ["Definición", d.definicion ? el("span", { text: d.definicion }) : null],
    ["Fuente", lista(d.fuentes)],
    ["Año o periodo de referencia", d.periodo ? el("span", { text: d.periodo }) : null],
    ["Fecha de actualización o revisión", d.actualizacion?.length ? el("ul", { class: "info-lista" }, d.actualizacion.map(([r, v]) => el("li", {}, [`${r}: `, el("b", { text: v })]))) : null],
    ["Cobertura territorial", d.cobertura ? el("span", { text: d.cobertura }) : null],
    ["Naturaleza del valor", d.naturaleza ? el("span", {}, [d.naturaleza.tipo ? el("span", { class: `info-pill ${TIPO[d.naturaleza.tipo].cls}`, text: TIPO[d.naturaleza.tipo].label }) : null, d.naturaleza.texto ? el("span", { class: "info-nat", text: d.naturaleza.texto }) : null]) : null],
  ];
}

function construir(d, id) {
  const filas = campos(d);
  const cuerpo = el("div", { class: "info-cuerpo opaco" }, [
    el("div", { class: "info-cab" }, [el("h3", { class: "info-t", id: `${id}-t`, text: d.titulo }), el("button", { type: "button", class: "info-cerrar", "aria-label": "Cerrar la información" }, [el("span", { "aria-hidden": "true", text: "×" })])]),
    el("dl", { class: "info-campos" }, filas.flatMap(([r, v]) => [el("dt", { text: r }), el("dd", { class: v ? "" : "falta" }, [v ?? FALTA])])),
    d.nota ? el("p", { class: "info-notas" }, [d.nota]) : null,
    d.metodo?.length ? el("p", { class: "info-metodo" }, ["En Método: ", ...d.metodo.flatMap((m, i) => [i ? " · " : "", el("a", { href: m.href, text: m.texto })])]) : el("p", { class: "info-metodo falta" }, ["Enlace a Método: ", FALTA]),
  ]);
  const panel = el("div", { class: "info-panel vidrio-foco", role: "dialog", "aria-modal": "false", "aria-labelledby": `${id}-t`, id }, [cuerpo]);
  return panel;
}

function colocar(boton, panel) {
  const r = boton.getBoundingClientRect(), w = panel.offsetWidth, h = panel.offsetHeight;
  const left = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 12));
  const abajo = r.bottom + 8, arriba = r.top - 8 - h;
  panel.style.left = `${Math.round(left)}px`;
  panel.style.top = `${Math.round(abajo + h <= innerHeight - 12 || arriba < 12 ? Math.max(12, Math.min(abajo, innerHeight - h - 12)) : arriba)}px`;
}

function abrir(boton, getDesc) {
  cerrar(false);
  let d;
  try { d = getDesc(); } catch (err) { console.error("Información del dato:", err); d = { titulo: "Información no disponible" }; }
  const id = `info-${++n}`;
  const panel = construir(d, id);
  document.body.append(panel);
  abierto = { boton, panel };
  boton.setAttribute("aria-expanded", "true");
  boton.setAttribute("aria-controls", id);
  colocar(boton, panel);
  panel.querySelector(".info-cerrar").addEventListener("click", () => cerrar(true));
  panel.addEventListener("focusout", (e) => { if (abierto?.panel === panel && e.relatedTarget && !panel.contains(e.relatedTarget) && e.relatedTarget !== boton) cerrar(false); });
  document.addEventListener("keydown", alTeclear, true);
  document.addEventListener("pointerdown", alPulsarFuera, true);
  addEventListener("scroll", alDesplazar, { capture: true, passive: true });
  addEventListener("resize", alRedimensionar);
  addEventListener("hashchange", alNavegar);
  panel.querySelector(".info-cerrar").focus({ preventScroll: true });
}

/** El botón «i». `getDesc` se llama al abrir (así refleja el indicador elegido en ese momento). */
export function botonInfo(getDesc, { etiqueta = "Información sobre este dato", clase = "" } = {}) {
  const b = el("button", { type: "button", class: `info-b ${clase}`.trim(), "aria-label": etiqueta, "aria-expanded": "false", "aria-haspopup": "dialog", title: etiqueta }, [ICONO()]);
  b.addEventListener("click", () => (abierto?.boton === b ? cerrar(true) : abrir(b, getDesc)));
  return b;
}
export const cerrarInfo = () => cerrar(false);

// ---------------------------------------------------------------------------------------------------------------------------------------------
// Descriptores: solo lo que consta en los datos y en los textos originales

const fecha = (iso) => { const [y, m, d] = String(iso).split("-").map(Number); return Number.isFinite(y) ? new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : null; };
/** Años o intervalos de años que aparecen en un texto («2024», «2014 a 2024», «2020 a 2025»). */
const periodoDe = (texto) => { const m = String(texto).match(/(?:19|20)\d{2}(?:\s*(?:a|-|–)\s*(?:19|20)\d{2})?/g); return m ? [...new Set(m)].join(" y ") : null; };
const fuentesDe = (store, ids) => (ids ?? []).map((i) => store.fuentes[i]).filter(Boolean).map((f) => ({ nombre: f.nombre, url: f.url }));
const datos = (store) => [store.meta.fecha_datos && ["Datos descargados el", fecha(store.meta.fecha_datos)], store.meta.fecha_revision && ["Revisión de los datos", fecha(store.meta.fecha_revision)]].filter(Boolean);
const M = { etiquetas: { texto: "Las etiquetas de cada cifra", href: "#metodo/las-etiquetas-de-cada-cifra" }, fuentes: { texto: "Fuentes", href: "#metodo/fuentes" }, aproximados: { texto: "Datos aproximados", href: "#metodo/datos-aproximados" }, limites: { texto: "Limitaciones", href: "#metodo/limitaciones" }, revision: { texto: "Revisión de los datos", href: "#metodo/revision-de-los-datos" } };
const nombres = (store, c) => store.municipios[c].nombre;

/** Situación: el problema elegido (INDICADORES[i]). `conDato` y `total` salen del recuento del propio mapa. */
export function descSituacion(store, x, conDato, total) {
  const p = store.resumen.problemas.find((r) => r.id === x.problema);
  const aprox = x.problema === "alquiler" ? store.meta.aproximados?.alquiler : x.problema === "compra" ? store.meta.aproximados?.compra : null;
  return {
    titulo: x.titulo,
    definicion: p ? `${p.cifra} ${p.unidad}` : null,
    fuentes: [{ nombre: x.fuente }, ...fuentesDe(store, p?.fuentes)],
    periodo: periodoDe(x.fuente) ?? periodoDe(p?.unidad ?? ""),
    actualizacion: datos(store),
    cobertura: `${es(conDato)} de ${es(total)} municipios de Bizkaia con dato en este indicador`,
    naturaleza: p ? { tipo: p.etiqueta, texto: aprox ? aprox : null } : null,
    metodo: [M.etiquetas, M.fuentes, ...(aprox ? [M.aproximados] : [])],
  };
}

/** Municipios: uno de los 13 indicadores de la ficha. `key` y `label` son los del original. */
export function descMunicipal(store, key, label) {
  const con = store.codes.filter((c) => typeof store.municipios[c].indicadores[key] === "number").length;
  return {
    titulo: label,
    definicion: null,                                 // el original no trae una definición por indicador
    fuentes: null,                                    // ni la fuente indicador a indicador (están todas juntas en Método)
    periodo: periodoDe(label),
    actualizacion: datos(store),
    cobertura: `${es(con)} de ${es(store.codes.length)} municipios con dato; el resto aparece como «sin dato»`,
    naturaleza: null,
    metodo: [M.fuentes, M.etiquetas, M.limites],
  };
}

/** Municipios: «Alquilar y comprar, según los ingresos». */
export function descHogares(store, definicion) {
  const propios = store.codes.filter((c) => store.municipios[c].compra?.precio).length, orient = store.codes.filter((c) => !store.municipios[c].compra?.precio && store.municipios[c].compra?.orientativo).length;
  const alq = store.resumen.problemas.find((r) => r.id === "alquiler"), com = store.resumen.problemas.find((r) => r.id === "compra");
  return {
    titulo: "Alquilar y comprar, según los ingresos",
    definicion,
    fuentes: [...fuentesDe(store, alq?.fuentes), ...fuentesDe(store, com?.fuentes)].filter((f, i, a) => a.findIndex((g) => g.url === f.url && g.nombre === f.nombre) === i),
    periodo: [store.meta.periodo_precio && `Precio: ${store.meta.periodo_precio}`, store.meta["año_renta"] && `Ingresos: ${store.meta["año_renta"]}`].filter(Boolean).join(" · ") || null,
    actualizacion: datos(store),
    cobertura: `Precio de compra propio en ${es(propios)} municipios; orientativo (el de su área) en ${es(orient)} de los ${es(store.codes.length)}`,
    naturaleza: { tipo: com?.etiqueta ?? "calculo", texto: store.meta.aproximados?.compra ?? null },
    metodo: [M.etiquetas, M.aproximados, M.fuentes],
  };
}

/** Acceso: una de sus partes (alquilar, escalera, explorador o alcance). El texto de definición y la línea de fuentes son los de la propia página. */
export function descAcceso(store, parte, { titulo, definicion, fuenteOriginal }) {
  const id = parte === "alquilar" ? "alquiler" : "compra";
  const p = store.resumen.problemas.find((r) => r.id === id);
  const s = store.acceso.supuestos;
  const conAlq = store.codes.filter((c) => typeof store.municipios[c].indicadores.esfuerzo_alquiler_P25 === "number").length;
  const propios = store.codes.filter((c) => store.municipios[c].compra?.precio).length;
  return {
    titulo, definicion,
    fuentes: [...(fuenteOriginal ? [{ nombre: fuenteOriginal }] : []), ...fuentesDe(store, p?.fuentes)],
    periodo: parte === "alquilar" ? `Ingresos: ${s["año_renta"]} · Alquiler: 2024` : `Precios: ${s.periodo_precio} · Ingresos: ${s["año_renta"]} · Interés medio ${es(s.tipo_hipoteca.media, 2)} % (${s.tipo_hipoteca.meses} meses de ${s.tipo_hipoteca["año"]})`,
    actualizacion: datos(store),
    cobertura: parte === "alquilar" ? `${es(conAlq)} de ${es(store.codes.length)} municipios con dato de alquiler` : `Bizkaia y ${es(propios)} municipios con precio propio (el resto, el de su área: aproximado)`,
    naturaleza: p ? { tipo: p.etiqueta, texto: parte === "alquilar" ? store.meta.aproximados?.alquiler : store.meta.aproximados?.compra } : null,
    metodo: [M.etiquetas, M.aproximados, M.fuentes],
  };
}

/** Medidas: la vista en general (Plano y Matriz). */
export function descMedidas(store, { titulo, definicion }) {
  const e = store.medidas.estado;
  return {
    titulo, definicion: definicion ?? null,
    fuentes: null,
    periodo: null,
    actualizacion: e?.comprobado_el ? [["Estado de las medidas comprobado el", e.comprobado_el]] : null,
    cobertura: `${es(store.medidas.medidas.length)} medidas, para los ${es(store.codes.length)} municipios de Bizkaia`,
    naturaleza: null,
    nota: "La fuente y la naturaleza («Cálculo propio») de cada medida están en su ficha.",
    metodo: [{ texto: "Cómo se comparan las medidas", href: "#metodo/como-se-comparan-las-medidas" }, { texto: "Cómo se proponen las medidas", href: "#metodo/como-se-proponen-las-medidas" }, M.fuentes],
  };
}

/** Normas: competencias y línea de tiempo. La fecha es la de referencia del estado normativo que trae el dato, no la de hoy; definición y fuente son las textos de la propia página. */
export function descNormas(store, { titulo, definicion, fuenteOriginal }) {
  const N = store.normas;
  return {
    titulo, definicion: definicion ?? null,
    fuentes: fuenteOriginal ? [{ nombre: fuenteOriginal }] : null,
    periodo: null,
    actualizacion: N?.fecha ? [["Estado normativo a", N.fecha]] : null,
    cobertura: N ? `${es(N.competencias.length)} instrumentos y ${es(N.niveles.length)} niveles de gobierno` : null,
    naturaleza: { tipo: null, texto: fuenteOriginal && /^Elaboración propia/.test(fuenteOriginal) ? "Elaboración propia" : null },
    nota: "Los estados jurídicos son los que trae el dato: esta información no los actualiza.",
    metodo: [M.fuentes],
  };
}
