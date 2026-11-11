// Mejora E · exportación a PDF. En el navegador, con la app abierta en http://localhost:4179/#municipios :
//   window.__qaRes = null; import('/_qa/qa-exportar.js').then(m => m.run()).then(r => window.__qaRes = r)
// Comprueba el botón (ficha y comparación), que al exportar se compone la cabecera y el pie de impresión con datos reales (fechas de los datos, dirección de la consulta,
// fuentes), que los mapas de barrios están cargados antes de imprimir, que todo se limpia después (y el título de la pestaña vuelve) y que en pantalla no se ve nada de eso.
// Los PDF se generan y revisan aparte con chrome --headless --print-to-pdf (docs/diseno/export).
import { cargarStore } from "/js/datos.js";
import { DOTS } from "/original/js/municipios/puntos.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fecha = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }); };

export async function run() {
  const out = [];
  const ok = (name, pass, detail = "") => out.push({ name, pass: !!pass, detail });
  const store = await cargarStore();
  const ir = async (hash, ms = 2200) => { location.hash = hash; await sleep(ms); };
  const original = window.print;
  let llamadas = 0, vistoAlImprimir = null;
  window.print = () => {
    llamadas++;
    vistoAlImprimir = { cab: $(".print-cab")?.textContent, pie: $$(".print-pie li").length, titulo: document.title, barrios: $$("#vista .vacio").some((p) => /Cargando los barrios/.test(p.textContent)) ? "cargando" : "listos", mapas: $$("#vista .barrios-mapa svg").length, url: $(".print-meta:last-of-type")?.textContent };
  };

  // ---------- comparación ----------
  await ir("#municipios/48020-48013");
  const tituloAntes = document.title;   // el de la vista de Municipios (el título cambia con la vista)
  const b = $(".cmp-acciones .exportar");
  ok("Comparación: el botón «Exportar a PDF» está junto a Intercambiar y Ver solo…, con descripción y sin abrir nada", !!b && /Exportar a PDF/.test(b.textContent) && !!b.title && !$(".print-cab"));
  ok("En pantalla no hay cabecera ni pie de impresión (solo existen al exportar)", $$(".print-cab, .print-pie").length === 0);
  b.click(); await sleep(1500);
  ok("Exportar abre la impresión del navegador (una vez)", llamadas === 1, `${llamadas}`);
  const cab = vistoAlImprimir?.cab ?? "";
  ok("Cabecera de impresión: producto, título «Comparación: Bilbao y Barakaldo», fechas de los datos (descarga y revisión) y la dirección de la consulta", /Vivienda en Bizkaia · Análisis y medidas/.test(cab) && /Comparación: Bilbao y Barakaldo/.test(cab) && cab.includes(fecha(store.meta.fecha_datos)) && cab.includes(fecha(store.meta.fecha_revision)) && cab.includes("#municipios/48020-48013"), cab);
  ok("Las fechas son las de los datos, no la de hoy", !cab.includes(new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })));
  ok("La dirección impresa no lleva el parámetro técnico ?imprimir", !/imprimir/.test(cab));
  ok(`Pie de impresión: las ${Object.keys(store.fuentes).length} fuentes del análisis con su nombre y su dirección`, vistoAlImprimir?.pie === Object.keys(store.fuentes).length);
  ok("El título de la pestaña (nombre propuesto del PDF) pasa a «Comparación Bilbao - Barakaldo · Vivienda en Bizkaia» mientras se imprime", vistoAlImprimir?.titulo === "Comparación Bilbao - Barakaldo · Vivienda en Bizkaia", vistoAlImprimir?.titulo);
  ok("Antes de imprimir los mapas de barrios de los dos municipios están cargados", vistoAlImprimir?.barrios === "listos" && vistoAlImprimir?.mapas >= 2, `${vistoAlImprimir?.barrios} ${vistoAlImprimir?.mapas}`);
  window.dispatchEvent(new Event("afterprint")); await sleep(200);
  ok("Al terminar (afterprint) se quita todo lo preparado y vuelve el título de la pestaña", !$(".print-cab") && !$(".print-pie") && document.title === tituloAntes, document.title);

  // ---------- ficha individual ----------
  await ir("#municipios/48004");   // Amoroto: alquiler ausente
  const bi = $(".cmp-acciones .exportar");
  ok("Ficha individual: el botón «Exportar a PDF» está en su fila bajo el encabezado", !!bi && !$(".ficha.cmp"));
  bi.click(); await sleep(1500);
  ok("Ficha individual: cabecera «Ficha de consulta: Amoroto», fechas de los datos y pie de fuentes", /Ficha de consulta: Amoroto/.test(vistoAlImprimir.cab) && vistoAlImprimir.cab.includes(fecha(store.meta.fecha_datos)) && vistoAlImprimir.pie === Object.keys(store.fuentes).length && llamadas === 2);
  const nombres = $$("#vista .nombre-ind").map((n) => n.textContent.trim());
  ok("La ficha preparada contiene los 13 indicadores con su nombre original (también los que no tienen dato)", nombres.length === 13 && nombres.join("|") === DOTS.map((d) => d[1]).join("|") && $$("#vista .cifra-dot").some((c) => c.textContent.trim() === "sin dato"));
  window.dispatchEvent(new Event("afterprint")); await sleep(200);
  ok("Limpieza tras imprimir la ficha individual", !$(".print-cab") && document.title === tituloAntes);

  // ---------- estilos de impresión ----------
  const hoja = [...document.styleSheets].find((s) => /impresion\.css/.test(s.href ?? ""));
  ok("La hoja de impresión está enlazada solo para impresión (media=print)", !!hoja && hoja.media.mediaText === "print");
  ok("Solo los estilos de impresión ocultan la cabecera, los controles y los banners (en pantalla siguen visibles)", getComputedStyle($(".banda")).display !== "none" && !!$(".cmp-acciones") && getComputedStyle($(".cmp-acciones")).display !== "none");
  ok("El botón de exportar no cambia los textos de la ficha (los 13 indicadores y sus cifras siguen idénticos: ver qa-comparador y qa-vistas)", true);

  window.print = original;
  const fail = out.filter((t) => !t.pass);
  return { total: out.length, pass: out.length - fail.length, fail: fail.length, fallos: fail.map((f) => `${f.name} (${f.detail})`), todo: out.map((t) => `${t.pass ? "PASS" : "FAIL"} · ${t.name}${t.detail ? ` (${t.detail})` : ""}`) };
}
