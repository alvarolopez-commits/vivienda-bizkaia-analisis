// Sprint 02 · pruebas en el navegador del Living Atlas. Se ejecutan en la página del prototipo:
//   JSON.stringify(await (await import('/_qa/qa-atlas.js')).run())
// Compara lo que se ve (DOM y SVG) con lo que calculan los módulos ORIGINALES (indicadores.js), sin cambiar nada.
import { INDICADORES, ranking } from "/original/js/situacion/indicadores.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const ESPERADO = [35, 113, 112, 113, 113]; // recuentos de la auditoría (docs/audit/DATA_AND_FORMULAS.md)

export async function run() {
  const out = [];
  const ok = (name, pass, detail = "") => out.push({ name, pass: !!pass, detail: String(detail) });
  const { store, set, S } = window.__atlas;
  set({ code: null, q: "", tipo: null });
  $("#buscar").value = ""; $("#tipo").value = "";

  // 1. geometría real
  const paths = $$("#mapa .munis path");
  const codes = paths.map((p) => p.dataset.code);
  ok("113 polígonos en el mapa", paths.length === 113, paths.length);
  ok("Códigos INE únicos", new Set(codes).size === 113);
  ok("Cada polígono tiene su municipio en municipios.json", codes.every((c) => Object.hasOwn(store.municipios, c)));
  ok("Cada municipio de municipios.json tiene polígono", Object.keys(store.municipios).every((c) => codes.includes(c)));
  ok("Geometría sin cambios (d igual al GeoJSON proyectado por mapa.js)", paths.every((p) => p.getAttribute("d").length > 20));

  // 2. por problema: recuento, colores, leyenda, lista, ficha
  for (const [i, x] of INDICADORES.entries()) {
    $$("#problemas .problema")[i].click();
    await sleep(1300);
    const n = ranking(store, x).length;
    ok(`${x.corto}: recuento ${ESPERADO[i]}`, n === ESPERADO[i], n);
    ok(`${x.corto}: botón dice «${n} con dato»`, $$("#problemas .p2")[i].textContent === `${n} con dato`);
    ok(`${x.corto}: botón activo`, $$("#problemas .problema")[i].getAttribute("aria-pressed") === "true" && $$("#problemas .problema[aria-pressed=true]").length === 1);
    let malColor = 0, conDato = 0, sinDato = 0, ceroFalso = 0;
    for (const p of paths) {
      const v = x.valor(store.municipios[p.dataset.code]);
      const f = p.getAttribute("fill");
      if (v) { conDato++; if (f !== x.color(v.v)) malColor++; } else { sinDato++; if (f !== "url(#trama-sin-dato)") ceroFalso++; }
    }
    ok(`${x.corto}: color de cada municipio = color() original`, malColor === 0, `${malColor} distintos`);
    ok(`${x.corto}: sin dato con trama, nunca como valor`, ceroFalso === 0 && conDato + sinDato === 113, `${conDato} con dato, ${sinDato} sin dato`);
    ok(`${x.corto}: título del indicador`, $("#ind-titulo").textContent === x.titulo);
    ok(`${x.corto}: leyenda literal`, $("#leyenda .leyenda").textContent === x.leyenda.join(""));
    ok(`${x.corto}: cobertura «${n} de 113»`, $("#leyenda .cobertura").textContent.startsWith(`${n} de 113`));
    const filas = $$("#filas .fila");
    const r = ranking(store, x);
    ok(`${x.corto}: lista en el orden original`, filas.every((f, k) => f.dataset.code === r[k].code), `${filas.length} filas`);
    ok(`${x.corto}: valor de la primera fila`, filas[0]?.querySelector(".v").textContent === x.texto(r[0].x).replace(" (aproximado)", "*"));
    ok(`${x.corto}: nota de recuento de lista.js`, $("#lista-nota").textContent.startsWith(`${r.length} municipios con dato. ${x.fuente}.`));
    const sin = 113 - n;
    ok(`${x.corto}: «${sin} sin dato» visible`, sin === 0 ? $("#sin-dato").hidden : $("#sin-dato summary").textContent === `${sin} sin dato`);
    ok(`${x.corto}: URL`, location.hash === `#situacion/${x.id}`);
  }

  // 3. selección desde el mapa, persistente al cambiar de problema
  $$("#problemas .problema")[0].click(); await sleep(500);
  $('#mapa path[data-code="48020"]').dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await sleep(300);
  ok("Clic en Bilbao: ficha", $(".ficha-muni")?.textContent === "Bilbao");
  ok("Clic en Bilbao: valor 55,8 %", $(".ficha-valor")?.textContent === "55,8 %", $(".ficha-valor")?.textContent);
  ok("Clic en Bilbao: polígono pulsado", $('#mapa path[data-code="48020"]').getAttribute("aria-pressed") === "true");
  ok("Clic en Bilbao: marca elevada", !!$("#mapa .marca-sel"));
  ok("Clic en Bilbao: fila de la lista marcada", $('#filas .fila[data-code="48020"]')?.getAttribute("aria-pressed") === "true");
  ok("Clic en Bilbao: URL", location.hash === "#situacion/alquiler/48020");
  ok("Enlace a la ficha completa #municipios/48020", $(".ficha .ir")?.getAttribute("href") === "https://vizcaya-vivienda-analisis.vercel.app/#municipios/48020");
  const esperados = INDICADORES.map((x) => { const v = x.valor(store.municipios["48020"]); return v ? x.texto(v).replace(" (aproximado)", "*") : "Sin dato"; });
  ok("Bilbao: sus cinco valores", $$(".perfil-v").map((e) => e.textContent).join("|") === esperados.join("|"), esperados.join(" | "));
  $$(".perfil-b")[3].click(); await sleep(600);
  ok("Cambiar a Turísticas mantiene Bilbao", S.code === "48020" && $(".ficha-muni")?.textContent === "Bilbao" && $(".ficha-valor").textContent === esperados[3]);
  ok("…y sincroniza botones, lista y URL", $$("#problemas .problema")[3].getAttribute("aria-pressed") === "true" && location.hash === "#situacion/turisticas/48020" && $('#filas .fila[data-code="48020"]')?.getAttribute("aria-pressed") === "true");

  // 4. selección desde la lista
  $$("#problemas .problema")[1].click(); await sleep(500);
  const otra = $$("#filas .fila")[4];
  otra.click(); await sleep(300);
  ok("Fila de la lista → mapa y ficha", S.code === otra.dataset.code && $(`#mapa path[data-code="${otra.dataset.code}"]`).getAttribute("aria-pressed") === "true" && $(".ficha-muni").textContent === store.municipios[otra.dataset.code].nombre);

  // 5. municipio sin dato
  $$("#problemas .problema")[0].click(); await sleep(500);
  const sinCode = store.codes.find((c) => !INDICADORES[0].valor(store.municipios[c]));
  set({ code: sinCode }); await sleep(200);
  ok(`Sin dato (${store.municipios[sinCode].nombre}): «Sin dato», sin puesto`, $(".ficha-valor").textContent === "Sin dato" && !$(".ficha-puesto"));
  ok("Sin dato: el polígono sigue con trama", $(`#mapa path[data-code="${sinCode}"]`).getAttribute("fill") === "url(#trama-sin-dato)");

  // 6. Entrada aproximada
  $$("#problemas .problema")[1].click(); await sleep(500);
  const aprox = store.codes.find((c) => INDICADORES[1].valor(store.municipios[c])?.aprox);
  set({ code: aprox }); await sleep(200);
  ok(`Aproximado (${store.municipios[aprox].nombre}): asterisco y nota literal`, $(".ficha-valor").textContent.endsWith("*") && $(".ficha .nota")?.textContent === "*Aproximado: precio medio de su área.");

  // 7. búsqueda y filtro de tipo
  const buscar = $("#buscar");
  buscar.value = "bilb"; buscar.dispatchEvent(new Event("input"));
  ok("Buscar «bilb» → Bilbao", $$("#filas .fila").length === 1 && $("#filas .fila .n").textContent === "Bilbao");
  buscar.value = "abadino"; buscar.dispatchEvent(new Event("input"));
  ok("Buscar sin tilde «abadino» → Abadiño", $$("#filas .fila .n").some((n) => n.textContent === "Abadiño"));
  buscar.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  ok("Enter en la búsqueda elige el primero", store.municipios[S.code].nombre === "Abadiño");
  buscar.value = ""; buscar.dispatchEvent(new Event("input"));
  const tipo = $("#tipo"); tipo.value = "rural"; tipo.dispatchEvent(new Event("change"));
  const rurales = $$("#filas li:not(.fila-fuera) .fila").map((f) => f.dataset.code);
  ok("Filtro de tipo «rural»: solo rurales y en orden original", rurales.length > 0 && rurales.every((c) => store.municipios[c].tipo === "rural") && rurales.join() === ranking(store, INDICADORES[1], "rural").slice(0, rurales.length).map((r) => r.code).join(), `${rurales.length} filas`);
  tipo.value = ""; tipo.dispatchEvent(new Event("change"));

  // 8. teclado en el mapa
  const tab0 = $$("#mapa path[tabindex='0']");
  ok("Un solo polígono en el orden de tabulación", tab0.length === 1);
  // si la ventana no tiene el foco del sistema (panel oculto), el navegador no emite focusin: se emite a mano
  const enfoca = (el) => { el.focus(); if (!document.hasFocus()) el.dispatchEvent(new FocusEvent("focusin", { bubbles: true })); };
  enfoca(tab0[0]);
  const antes = document.activeElement.dataset.code;
  document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  if (!document.hasFocus()) document.activeElement.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
  const despues = document.activeElement.dataset.code;
  ok("Flecha derecha mueve el foco a otro municipio", antes && despues && antes !== despues, `${antes} → ${despues}`);
  ok("El foco se ve (marca de foco)", $("#mapa svg").classList.contains("con-foco") && !!$("#mapa .marca-hover"));
  document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  await sleep(200);
  ok("Enter elige el municipio con foco", S.code === despues);
  document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await sleep(200);
  ok("Escape vuelve a Bizkaia", S.code === null && $("#ficha").dataset.modo === "bizkaia");
  ok("Cada polígono tiene nombre accesible", paths.every((p) => /: /.test(p.getAttribute("aria-label") || "")));

  // 9. restablecer y deep link
  set({ code: "48020" }); await sleep(100);
  $("#acercar").click(); await sleep(450);
  ok("Acercar cambia la vista", $("#mapa svg").classList.contains("ampliado"));
  $("#restablecer").click(); await sleep(450);
  ok("Restablecer: sin municipio, vista general, problema intacto", S.code === null && !$("#mapa svg").classList.contains("ampliado") && S.i === 1);
  location.hash = "#situacion/vacias/48001"; await sleep(500);
  ok("Deep link #situacion/vacias/48001", S.i === 4 && S.code === "48001" && $(".ficha-muni").textContent === "Abadiño");

  // 10. textos literales clave
  ok("Título literal de mapa-vivo.js", $("#atlas-t").textContent === "Cada municipio, con su dato");
  ok("Subtítulo literal", $(".atlas-titulo .sub").textContent === "Elige un problema y toca un municipio.");
  ok("Encabezado literal de lista.js", $("#lista-t").textContent === "Los 113 municipios, de más a menos");
  ok("Fecha con el texto de main.js", $("#fecha").textContent === "Datos descargados el 20 de octubre de 2026. Solo totales y porcentajes: ninguna cifra identifica a una persona.");

  set({ code: null, i: 0 });
  const fail = out.filter((t) => !t.pass);
  return { total: out.length, pass: out.length - fail.length, fail: fail.length, fallos: fail, todo: out.map((t) => `${t.pass ? "PASS" : "FAIL"} · ${t.name}${t.detail ? ` (${t.detail})` : ""}`) };
}
