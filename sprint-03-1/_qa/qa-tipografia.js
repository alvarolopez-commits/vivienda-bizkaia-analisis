// Sprint 03.1 · auditoría tipográfica por estilos CALCULADOS (en el navegador, con la app abierta):
//   window.__qaRes = null; import('/_qa/qa-tipografia.js').then(m => m.run()).then(r => window.__qaRes = r)
// Reglas del sistema (00_DESIGN_SYSTEM_TIPOGRAFIA): Montserrat solo en titulares y encabezados; Geist en texto, navegación,
// controles, tablas y TODAS las cifras; Geist Mono solo en código técnico (code, pre, kbd, samp).
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HEADINGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);
const CODE = new Set(["CODE", "PRE", "KBD", "SAMP"]);
const primera = (el) => getComputedStyle(el).fontFamily.split(",")[0].replace(/["']/g, "").trim();
const tieneTexto = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
const tieneCifra = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && /\d/.test(n.textContent));
const clase = (el) => { const c = el.className?.baseVal ?? el.className; return c ? "." + String(c).trim().split(/\s+/)[0] : ""; };

/** Recorre el DOM de la vista y devuelve el inventario tipográfico. */
function escanear(etiqueta) {
  const todos = [...document.querySelectorAll("header.banda *, #menu *, #vista *, footer *")].filter((e) => tieneTexto(e) || e.tagName === "text");
  const inv = {}, montserratNoTitular = [], monoFueraDeCodigo = [], cifrasNoGeist = [], sinTabular = [], pesos = {};
  for (const el of todos) {
    const f = primera(el); inv[f] = (inv[f] ?? 0) + 1;
    (pesos[f] ??= new Set()).add(getComputedStyle(el).fontWeight);
    if (tieneCifra(el) && !/tabular-nums/.test(getComputedStyle(el).fontVariantNumeric)) sinTabular.push(`${el.tagName.toLowerCase()}${clase(el)} «${el.textContent.trim().slice(0, 20)}»`);
    const desc = `${el.tagName.toLowerCase()}${clase(el)} «${el.textContent.trim().slice(0, 26)}»`;
    if (f === "Montserrat" && !HEADINGS.has(el.tagName)) montserratNoTitular.push(desc);
    if (f === "Geist Mono" && !CODE.has(el.tagName)) monoFueraDeCodigo.push(desc);
    if (tieneCifra(el) && f !== "Geist" && !CODE.has(el.tagName) && !HEADINGS.has(el.tagName)) cifrasNoGeist.push(`${desc} → ${f}`);
  }
  return { etiqueta, elementos: todos.length, familias: inv, pesos: Object.fromEntries(Object.entries(pesos).map(([k, v]) => [k, [...v].sort()])), cifrasSinTabular: [...new Set(sinTabular)], montserratNoTitular: [...new Set(montserratNoTitular)], monoFueraDeCodigo, cifrasNoGeist: [...new Set(cifrasNoGeist)] };
}

const muestra = (sel, rol) => {
  const el = document.querySelector(sel);
  if (!el) return { sel, rol, ausente: true };
  const cs = getComputedStyle(el);
  return { sel, rol, familia: primera(el), peso: cs.fontWeight, tam: cs.fontSize, numeros: cs.fontVariantNumeric, texto: el.textContent.trim().slice(0, 28) };
};

export async function run() {
  const res = { escaneos: [], muestras: {}, fuentes: {}, tokens: {} };
  const ir = async (h) => { location.hash = h; for (let i = 0; i < 40; i++) { await sleep(150); const q = /^#medidas/.test(h) ? "medidas" : "situacion"; if (window.__vista === q && !document.querySelector("[aria-busy=true]")) break; } await sleep(700); };

  // ---- tokens y carga de fuentes ----
  const root = getComputedStyle(document.documentElement);
  res.tokens = { heading: root.getPropertyValue("--font-heading").trim(), body: root.getPropertyValue("--font-body").trim(), number: root.getPropertyValue("--font-number").trim(), code: root.getPropertyValue("--font-code").trim() };
  const reglas = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules].map((r) => [s.href.split("/").pop(), r]); } catch { return []; } });
  res.tokens.hojasQueDefinenFamilias = [...new Set(reglas.filter(([, r]) => r.style?.getPropertyValue?.("--font-heading")).map(([h]) => h))];
  res.tokens.definicionesLocalesDeAlias = reglas.filter(([, r]) => r.style && ["--f-display", "--f-ui", "--f-data"].some((p) => r.style.getPropertyValue(p) && !/var\(--font-/.test(r.style.getPropertyValue(p)))).length;
  await document.fonts.ready;
  res.fuentes = { cargadas: [...document.fonts].filter((f) => f.status === "loaded").map((f) => `${f.family} ${f.weight}`), noCargadas: [...document.fonts].filter((f) => f.status !== "loaded").map((f) => `${f.family} ${f.weight} (${f.status})`),
    comprobacion: { montserrat600: document.fonts.check("600 20px Montserrat"), geist400: document.fonts.check("400 16px Geist"), geist500: document.fonts.check("500 16px Geist"), geist600: document.fonts.check("600 16px Geist"), geistMono400: document.fonts.check("400 14px 'Geist Mono'") } };

  // ---- Situación ----
  await ir("#situacion/alquiler/48020");
  res.escaneos.push(escanear("Situación · Bilbao en Alquiler"));
  res.muestras.situacion = [
    muestra(".atlas-titulo h1", "titular de página"), muestra(".ficha-muni", "nombre de municipio"), muestra(".ind-titulo", "título del mapa"),
    muestra(".ficha-valor", "cifra grande (valor)"), muestra(".ficha-puesto", "cifra pequeña (puesto)"), muestra("#filas .fila .v", "ranking · valor"), muestra("#filas .fila .pos", "ranking · puesto"),
    muestra("#filas .fila .n", "ranking · nombre"), muestra(".leyenda span", "leyenda"), muestra(".cobertura strong", "contador de cobertura"), muestra(".problema .p1", "pestaña de problema"),
    muestra(".problema .p2", "pestaña · «N con dato»"), muestra(".perfil-v", "perfil · valor"), muestra(".tip strong", "tooltip · nombre"), muestra(".tip span", "tooltip · valor"),
  ];
  // tooltip del mapa (hover real del ratón sobre Bilbao)
  { const p = document.querySelector('#mapa path[data-code="48020"]'), b = p.getBoundingClientRect(); p.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: b.left + b.width / 2, clientY: b.top + b.height / 2, pointerType: "mouse" })); await sleep(150);
    res.muestras.situacionTooltip = [muestra(".tip strong", "tooltip · nombre"), muestra(".tip span", "tooltip · valor")]; res.escaneos.push(escanear("Situación · con tooltip")); }
  await ir("#situacion/alquiler");
  res.escaneos.push(escanear("Situación · Bizkaia en Alquiler"));
  res.muestras.situacionBizkaia = [muestra(".ficha-problema", "titular de la ficha"), muestra(".ficha-cifra", "cifra protagonista (34 de 35)"), muestra(".ficha-unidad", "unidad")];

  // ---- Medidas ----
  await ir("#medidas");
  window.__medidas.openPanel("M10"); await sleep(500);
  res.escaneos.push(escanear("Medidas · Plano con panel"));
  res.muestras.medidas = [
    muestra(".vista-cab h1", "titular de página"), muestra(".vista-cab .sub b", "«30 de 34»"), muestra(".modo", "pestañas de modo"), muestra(".f-titulo", "título de filtros"), muestra(".cuenta b", "contador"),
    muestra(".rep-titulo h2", "título del Plano"), muestra(".burbuja .id", "número en burbuja (SVG)"), muestra(".burbujas .eje", "eje del Plano (SVG)"), muestra(".tip strong", "tooltip · medida"), muestra(".tip span", "tooltip · evidencia"),
    muestra(".panel-medida .medida-id", "ID de la medida"), muestra(".panel-medida .medida-nombre", "título de la medida"), muestra(".criterios dd", "criterio (valor)"), muestra(".texto h3", "encabezado de texto"),
  ];
  { const b = document.querySelector('a.burbuja[data-id="M10"]'); b.dispatchEvent(new PointerEvent("pointerenter")); await sleep(150);
    res.muestras.medidasTooltip = [muestra(".tip strong", "tooltip · medida"), muestra(".tip span", "tooltip · evidencia y plazo")]; }
  window.__medidas.closePanel();
  window.__medidas.toggle("M06"); window.__medidas.toggle("M01"); await sleep(300);
  res.muestras.bandeja = [muestra(".bandeja-t b", "contador de la bandeja"), muestra(".chip-medida .medida-id", "ID en la bandeja")];
  await ir("#medidas?rep=matriz&w=3,2,0,0,1");
  res.escaneos.push(escanear("Medidas · Matriz con pesos"));
  res.muestras.matriz = [muestra(".matrix-table thead th", "cabecera de columna"), muestra(".matrix-table td.num", "orden (cifra)"), muestra(".matrix-table tbody th a", "medida (ID y nombre)"), muestra(".matrix-table td.col-nota", "nota (cifra)"), muestra(".m-mag", "magnitud documentada")];
  await ir("#medidas/M01-M06-M20");
  res.escaneos.push(escanear("Medidas · Comparar"));
  res.muestras.comparar = [muestra(".comparar-medidas .cab [role=columnheader] a", "nombre de la medida"), muestra(".comparar-medidas .medida-id", "ID"), muestra(".comparar-medidas [role=cell]", "valor de criterio")];
  await ir("#medidas?vista=entender");
  res.escaneos.push(escanear("Medidas · Entender"));
  await ir("#medidas/alternativas");
  res.escaneos.push(escanear("Medidas · Alternativas"));
  await ir("#medidas");
  return res;
}
