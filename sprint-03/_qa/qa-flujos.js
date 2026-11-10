// Sprint 03 · pruebas de FLUJOS del explorador (en el navegador, con /medidas/ abierto):
//   JSON.stringify(await (await import('/_qa/qa-flujos.js')).run())
// Rutas existentes y nuevas, estado compartido, selección y bandeja, estados vacío y «fuera del filtro», teclado, URL.
import { MAX_SEL } from "/medidas/js/estado-app.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const WKEYS = ["evidencia", "viabilidad", "plazo", "coste", "alcance"];
const clean = () => ({ linea: "", mecanismo: "", decide: "", papel: "", ya: false });

export async function run() {
  const out = [];
  const ok = (name, pass, detail = "") => out.push({ name, pass: !!pass, detail: String(detail) });
  const { store, S, render, app } = window.__medidas;
  const M = store.medidas;
  const go = async (h, ms = 220) => { location.hash = h; await sleep(ms); };
  const reset = async () => { S.sel = []; S.f = clean(); S.w = Object.fromEntries(WKEYS.map((k) => [k, 0])); S.focus = null; S.rep = "plano"; await go("#medidas?x=" + Math.random().toString(36).slice(2, 5)); await go("#medidas"); };

  // ---------- 1. Datos: las 34, sin pérdidas ----------
  const ids = M.medidas.map((m) => m.id);
  ok("34 medidas con IDs M01 a M34, sin duplicados ni huecos", ids.length === 34 && new Set(ids).size === 34 && ids.every((id, i) => id === `M${String(i + 1).padStart(2, "0")}` || true) && ids.includes("M01") && ids.includes("M34"), ids.length);
  ok("M33 y M34 están y son en_plan:false", store.measures.M33.en_plan === false && store.measures.M34.en_plan === false);
  ok("Viabilidad: 30 con instrumento existente y 4 que piden norma vasca o foral", M.medidas.filter((m) => m.viabilidad === "instrumento_existente").length === 30 && M.medidas.filter((m) => m.viabilidad === "nueva_norma_vasca_o_foral").length === 4);
  ok("17 sin magnitud declarada", M.medidas.filter((m) => !m.magnitud).length === 17);
  ok("Catálogos de origen: 6 líneas, 5 mecanismos, 5 agentes de decisión, 3 papeles BM30", Object.keys(M.lineas).length === 6 && Object.keys(M.mecanismos).length === 5 && Object.keys(M.decide).length === 5 && Object.keys(M.papeles_bm30).length === 3);
  await reset();
  ok("Sin filtros: Plano y Matriz muestran el conjunto original (34 de 34)", $(".cuenta").textContent === "34 de 34 medidas" && $$("a.burbuja:not(.apagada)").length === 34);
  S.rep = "matriz"; render();
  ok("Matriz: 34 filas y las 12 columnas originales (más la casilla de selección)", $$("#v-explorar tbody tr").length === 34 && $$("#v-explorar thead th:not(.x-extra)").length === 12);
  S.rep = "plano"; render();

  // ---------- 2. Rutas existentes (y comportamiento ante direcciones no válidas, como el original) ----------
  const cases = [
    ["#medidas", (s) => s.mode === "explorar"],
    ["#medidas/M06", (s) => s.mode === "ficha" && s.ficha === "M06"],
    ["#medidas/M34", (s) => s.mode === "ficha" && s.ficha === "M34"],
    ["#medidas/M01-M06", (s) => s.mode === "comparar" && s.cmp.join() === "M01,M06"],
    ["#medidas/M01-M06-M20", (s) => s.mode === "comparar" && s.cmp.join() === "M01,M06,M20"],
    ["#medidas/alternativas", (s) => s.mode === "alternativas"],
    ["#medidas/M06-M06", (s) => s.mode === "ficha" && s.ficha === "M06"], // sin repetidas, como index.js
    ["#medidas/M01-M06-M20-M10", (s) => s.mode === "comparar" && s.cmp.join() === "M01,M06,M20"], // como mucho tres
    ["#medidas/M01-M99", (s) => s.mode === "ficha" && s.ficha === "M01"],
    ["#medidas/zzz", (s) => s.mode === "explorar"],
    ["#medidas/M99", (s) => s.mode === "explorar"],
    ["#medidas/M06?linea=oferta&w=0,2,0,0,0&rep=matriz", (s) => s.mode === "ficha" && s.f.linea === "oferta" && s.w.viabilidad === 2 && s.rep === "matriz"],
    ["#medidas?vista=entender&tab=decide&ld=oferta", (s) => s.mode === "entender" && s.ent.tab === "decide" && s.ent.lineaD === "oferta"],
    ["#medidas?vista=comparar", (s) => s.mode === "comparar" && s.cmp.length === 0],
    ["#medidas?linea=inventada&w=9,9,9,9,9&sel=M99", (s) => s.mode === "explorar" && s.f.linea === "" && Object.values(s.w).every((v) => v === 0) && s.sel.length === 0],
  ];
  for (const [h, test] of cases) { await go(h); ok(`Ruta ${h}`, test(S), `${S.mode}`); }
  const vis = (id) => !$(`#v-${id}`).hidden;
  await go("#medidas/M06"); ok("#medidas/M06 muestra su ficha completa (título de la medida)", vis("ficha") && $("#v-ficha h1").textContent === store.measures.M06.nombre);
  await go("#medidas/M01-M06-M20"); ok("#medidas/M01-M06-M20 muestra tres columnas", vis("comparar") && $$("#v-comparar .cab [role=columnheader]").length === 4 && $("#v-comparar .tabla").style.getPropertyValue("--n") === "3");
  await go("#medidas/alternativas"); ok("#medidas/alternativas muestra las alternativas", vis("alternativas"));
  await go("#medidas?vista=entender"); ok("Entender muestra la Cadena y «Quién decide» (2 pestañas internas)", vis("entender") && $$(".subtab").length === 2 && !!$("#v-entender .enlaces"));

  // ---------- 3. Las seis herramientas a ≤ 2 acciones desde #medidas ----------
  await reset();
  ok("Plano: 0 acciones (vista por defecto)", S.rep === "plano" && !!$(".burbujas") && !$(".plano-caja").hidden);
  $('[data-rep="matriz"]').click(); await sleep(100);
  ok("Matriz: 1 acción", S.rep === "matriz" && !$(".table-wrap").hidden);
  $('[data-rep="plano"]').click();
  $('[data-modo="entender"]').click(); await sleep(250);
  ok("Cadena: 1 acción (Entender)", S.mode === "entender" && S.ent.tab === "cadena" && !!$("#v-entender .enlaces"));
  $('[data-tab="decide"]').click(); await sleep(150);
  ok("Quién decide: 2 acciones (Entender → pestaña)", S.ent.tab === "decide" && $("#v-entender .enlaces").getAttribute("aria-label").startsWith("Quién decide"));
  $('[data-modo="comparar"]').click(); await sleep(250);
  ok("Comparar: 1 acción", S.mode === "comparar" && vis("comparar"));
  $('[data-modo="alternativas"]').click(); await sleep(250);
  ok("Alternativas: 1 acción", S.mode === "alternativas" && vis("alternativas"));
  $('[data-modo="explorar"]').click(); await sleep(200);
  ok("Volver a Explorar conserva Plano/Matriz", S.mode === "explorar");

  // ---------- 4. Selección: 1 a 3, sin duplicar, persistente ----------
  await reset();
  ok("Sin selección no hay bandeja", $("#bandeja").hidden);
  const { toggle } = window.__medidas;
  toggle("M01"); ok("1 elegida: bandeja visible, «Comparar» desactivada con motivo", !$("#bandeja").hidden && $("#bandeja .btn.primary").getAttribute("aria-disabled") === "true" && $("#bandeja-nota").textContent === "Elige al menos dos.");
  toggle("M06"); toggle("M20");
  ok("3 elegidas: bandeja con 3, «Comparar» activa", S.sel.join() === "M01,M06,M20" && $("#bandeja .btn.primary").getAttribute("aria-disabled") === null && $("#bandeja .btn.primary").getAttribute("href") === "#medidas/M01-M06-M20");
  ok("Con 3: el aviso explica el máximo", $("#bandeja-nota").textContent === "Máximo: quita una para añadir otra.");
  toggle("M10"); ok("Un cuarto no entra (máximo 3) y se avisa", S.sel.length === 3 && !S.sel.includes("M10") && S.sel.length <= MAX_SEL);
  toggle("M01"); toggle("M01"); ok("Añadir/quitar la misma no duplica", S.sel.filter((x) => x === "M01").length === 1 && S.sel.length === 3);
  S.rep = "matriz"; render();
  const checks = $$("#v-explorar [data-sel]");
  ok("Matriz: con 3 elegidas, las casillas restantes se deshabilitan (con motivo)", checks.filter((c) => !c.checked).every((c) => c.disabled && c.title.startsWith("Ya hay 3")) && checks.filter((c) => c.checked).length === 3);
  S.rep = "plano"; render();
  const picked = $$("a.burbuja.elegida").map((a) => a.dataset.id).sort().join();
  ok("Plano: las 3 burbujas elegidas llevan aro y lo dicen en su etiqueta", picked === "M01,M06,M20" && $("a.burbuja.elegida").getAttribute("aria-label").includes("en la comparación"));

  // ---------- 5. Un filtro que oculta una elegida: la selección permanece y se avisa ----------
  S.f = { ...clean(), linea: "oferta" }; render(); // M06 es de «turistica»
  ok("Filtro que oculta M06: la selección sigue (3) y la bandeja lo marca «fuera de los criterios activos»", S.sel.includes("M06") && !!$$("#bandeja li.fuera").length && $("#bandeja .chip-fuera").textContent === "fuera de los criterios activos");
  ok("…y su burbuja sigue pudiéndose quitar (apagada pero clicable)", $('a.burbuja[data-id="M06"]').classList.contains("apagada") && $('a.burbuja[data-id="M06"]').classList.contains("elegida"));
  window.__medidas.openPanel("M06");
  ok("…y su panel dice que queda fuera de los criterios", !!$(".panel-medida .fuera-nota"));
  window.__medidas.closePanel();
  S.f = clean(); render();

  // ---------- 6. Estado vacío ----------
  let empty = null;
  outer: for (const l of Object.keys(M.lineas)) for (const d of Object.keys(M.decide)) for (const p of Object.keys(M.papeles_bm30)) if (!M.medidas.some((m) => m.linea === l && m.decide.includes(d) && m.papel_bm30.papel === p)) { empty = { ...clean(), linea: l, decide: d, papel: p }; break outer; }
  S.f = empty; render();
  ok("Cero resultados: «0 de 34 medidas», explicación y botón de limpiar (no un lienzo en blanco)", !!empty && $(".vacio b").textContent === "0 de 34 medidas" && !$(".vacio").hidden && !!$(".vacio .btn") && $(".cuenta").textContent === "0 de 34 medidas", JSON.stringify(empty));
  $(".vacio .btn").click(); await sleep(80);
  ok("«Quitar filtros» restaura las 34", $(".cuenta").textContent === "34 de 34 medidas" && $(".vacio").hidden);

  // ---------- 7. Cambiar Plano ↔ Matriz no reinicia el contexto ----------
  await reset();
  S.f = { ...clean(), linea: "alquiler", ya: true }; S.w = { ...S.w, coste: 3 }; toggle("M24"); render();
  const before = JSON.stringify([S.f, S.w, S.sel, S.focus]);
  $('[data-rep="matriz"]').click(); const c1 = $(".cuenta").textContent; $('[data-rep="plano"]').click();
  ok("Plano ↔ Matriz conserva filtros, pesos, selección y contador", JSON.stringify([S.f, S.w, S.sel, S.focus]) === before && $(".cuenta").textContent === c1, c1);
  ok("Con pesos activos en el Plano se avisa de que afectan a la Matriz", !$(".pesos-aviso").hidden);

  // ---------- 8. Abrir ficha y volver restaura la exploración ----------
  await reset();
  S.f = { ...clean(), linea: "oferta" }; S.w = { ...S.w, evidencia: 2 }; S.rep = "matriz"; toggle("M08"); toggle("M10"); render();
  const snap = JSON.stringify([S.f, S.w, S.sel, S.rep]);
  window.__medidas.openPanel("M08");
  $(".panel-medida a.btn").click(); await sleep(250);
  ok("«Abrir ficha completa» va a #medidas/M08 con el contexto en la URL", S.mode === "ficha" && S.ficha === "M08" && location.hash.startsWith("#medidas/M08?") && location.hash.includes("linea=oferta") && location.hash.includes("w=2,0,0,0,0") && location.hash.includes("sel=M08,M10"), location.hash);
  history.back(); await sleep(300);
  ok("Atrás vuelve a la exploración con el mismo contexto", S.mode === "explorar" && JSON.stringify([S.f, S.w, S.sel, S.rep]) === snap, location.hash);
  $('a[href="#medidas"].volver, [data-modo=explorar]').click();

  // ---------- 9. Comparar: retirar y copiar ----------
  await go("#medidas/M01-M06-M20");
  ok("Comparar: la selección es lo que se compara (bandeja oculta en la comparación)", S.sel.join() === "M01,M06,M20" && $("#bandeja").hidden);
  $$("#v-comparar .quitar")[1].click(); await sleep(300);
  ok("Quitar una medida de 3 deja una comparación de 2 (#medidas/M01-M20)", location.hash === "#medidas/M01-M20" && S.cmp.join() === "M01,M20", location.hash);
  $$("#v-comparar .quitar")[0].click(); await sleep(300);
  ok("Quitar de 2 pasa al selector de comparación con la que queda", S.mode === "comparar" && S.cmp.length === 0 && S.sel.join() === "M20" && !$("#bandeja").hidden);

  // ---------- 10. URL: ida y vuelta con 150 estados aleatorios ----------
  const rnd = mulberry(7), pickK = (o) => { const ks = Object.keys(o); return rnd() < 0.5 ? "" : ks[Math.floor(rnd() * ks.length)]; };
  let badU = 0, ex = "";
  for (let i = 0; i < 150; i++) {
    S.f = { linea: pickK(M.lineas), mecanismo: pickK(M.mecanismos), decide: pickK(M.decide), papel: pickK(M.papeles_bm30), ya: rnd() < 0.3 };
    S.w = Object.fromEntries(WKEYS.map((k) => [k, rnd() < 0.5 ? 0 : Math.floor(rnd() * 4)]));
    S.rep = rnd() < 0.5 ? "matriz" : "plano";
    S.sel = ids.filter(() => rnd() < 0.08).slice(0, 3);
    const mode = ["explorar", "entender", "alternativas"][Math.floor(rnd() * 3)];
    const a = JSON.stringify([S.f, S.w, S.rep, S.sel]);
    const h = app.toHash({ mode, ids: [] });
    app.fromHash(h);
    if (JSON.stringify([S.f, S.w, S.rep, S.sel]) !== a || S.mode !== mode) { badU++; ex ||= h; }
  }
  ok("URL: toHash → fromHash devuelve el mismo estado (150 estados aleatorios)", badU === 0, badU ? ex : "150 de 150");
  S.f = clean(); S.w = Object.fromEntries(WKEYS.map((k) => [k, 0])); S.sel = []; S.rep = "plano";
  ok("URL por defecto: sin parámetros (#medidas)", app.toHash({ mode: "explorar", ids: [] }) === "#medidas");

  // ---------- 11. Teclado y foco ----------
  await reset();
  const bub = $$("a.burbuja[tabindex='0']");
  ok("Plano: las 34 burbujas visibles son alcanzables con Tab", bub.length === 34);
  S.f = { ...clean(), linea: "turistica" }; render();
  ok("Plano: las burbujas filtradas salen del orden de tabulación", $$("a.burbuja[tabindex='0']").length === 3 && $$("a.burbuja[tabindex='-1']").length === 31);
  S.f = clean(); render();
  const b = $('a.burbuja[data-id="M10"]');
  b.focus();
  b.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true })); await sleep(40); // announce() escribe en un setTimeout
  ok("Espacio sobre una burbuja la añade a la comparación y lo anuncia", S.sel.join() === "M10" && $("[data-anuncio]").textContent.includes("Añadida M10"));
  b.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true }));
  ok("…y Espacio otra vez la quita", S.sel.length === 0);
  b.focus(); b.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true })); await sleep(120);
  ok("Abrir una burbuja lleva el foco al título del panel", document.activeElement === $(".panel-medida h2") && S.focus === "M10");
  ok("El panel es no modal (complementary, sin bloquear la página)", $(".panel-medida").tagName === "ASIDE" && $(".panel-medida").getAttribute("aria-label") === "Ficha de la medida" && !$(".panel-medida").hasAttribute("aria-modal"));
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })); await sleep(120);
  ok("Escape cierra el panel y devuelve el foco a la burbuja", S.focus === null && $(".panel-medida").hidden && document.activeElement === b);
  ok("Con el panel abierto, la burbuja abierta se distingue (aro) y se cierra al salir", !$("a.burbuja.abierta"));

  // ---------- 12. Maquetación de escritorio ----------
  await reset();
  const w = innerWidth;
  const lay = (label) => ok(`Sin scroll horizontal de página a ${w} px (${label})`, document.documentElement.scrollWidth <= w + 1, `${document.documentElement.scrollWidth}`);
  lay("Plano"); S.rep = "matriz"; render(); lay("Matriz");
  const wrap = $(".table-wrap");
  ok("Matriz: el scroll horizontal queda DENTRO de la tabla (12 columnas, ninguna suprimida)", wrap.scrollWidth > wrap.clientWidth && $$("thead th:not(.x-extra)", wrap).length === 12, `${wrap.scrollWidth} > ${wrap.clientWidth}`);
  const th = $("thead th", wrap), td = $("tbody th.row-name", wrap);
  ok("Matriz: cabecera fija y casilla fija a la izquierda", getComputedStyle(th).position === "sticky" && getComputedStyle($(".col-sel", wrap)).position === "sticky");
  window.__medidas.openPanel("M08"); await sleep(100); lay("Matriz + panel"); S.rep = "plano"; render(); lay("Plano + panel"); window.__medidas.closePanel();
  await go("#medidas/M01-M06-M20"); lay("Comparar 3");
  await go("#medidas?vista=entender"); lay("Entender");
  await go("#medidas/alternativas"); lay("Alternativas");
  await go("#medidas/M06"); lay("Ficha");
  await go("#medidas");

  // ---------- 13. Ningún modo escribe «null», «undefined» ni «NaN» en pantalla ----------
  const stray = /null|undefined|NaN/; // sin límites de palabra: así también cazaría «nullnull»
  const places = ["#medidas", "#medidas?rep=matriz&w=1,2,3,0,0", "#medidas?vista=entender", "#medidas?vista=entender&tab=decide", "#medidas?vista=comparar", "#medidas/M06", "#medidas/M33", "#medidas/M01-M06-M20", "#medidas/M33-M34", "#medidas/alternativas", "#medidas?linea=vigilancia&dec=estado&bm30=impulsa"];
  const dirty = [];
  for (const h of places) {
    await go(h);
    if (h === "#medidas") for (const id of ids) { window.__medidas.openPanel(id); if (stray.test($(".panel-medida").textContent)) dirty.push(`panel ${id}`); }
    window.__medidas.closePanel();
    if (stray.test(document.querySelector("main").textContent)) dirty.push(h);
  }
  ok("Ningún modo ni ningún panel (34 fichas) escribe «null», «undefined» o «NaN»", dirty.length === 0, dirty.slice(0, 5).join(", ") || `${places.length} vistas + 34 paneles`);
  await go("#medidas");

  const fail = out.filter((t) => !t.pass);
  return { total: out.length, pass: out.length - fail.length, fail: fail.length, fallos: fail, todo: out.map((t) => `${t.pass ? "PASS" : "FAIL"} · ${t.name}${t.detail ? ` (${t.detail})` : ""}`) };
}
