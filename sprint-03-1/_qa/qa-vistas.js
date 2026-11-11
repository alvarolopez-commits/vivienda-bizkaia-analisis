// Municipios, Acceso, Normas y Método integrados. En el navegador, con la app abierta en http://localhost:4179/
//   window.__qaRes = null; import('/_qa/qa-vistas.js').then(m => m.run()).then(r => window.__qaRes = r)
// Comprueba, con datos reales: (1) que lo que se ve es EXACTAMENTE lo que dibuja el renderizador original (mismo texto, cifra a cifra), (2) las rutas
// de la web publicada, (3) las cuentas de Acceso contra calculo-acceso.js, (4) los filtros de Normas contra normas.json, (5) la búsqueda del
// glosario, el índice interno y el buscador de municipios, y (6) que no hay «null», «undefined» ni «NaN» en pantalla.
import { cargarStore } from "/js/datos.js";
import { access } from "/original/js/calculo-acceso.js";
import { renderAcceso } from "/original/js/acceso/index.js";
import { renderMetodo } from "/original/js/view-metodo.js";
import { renderMunicipios } from "/original/js/municipios/index.js";
import { renderNormas } from "/original/js/normas.js";
import { es } from "/original/js/ui.js";
import { cifrasPlanas } from "/js/lectura.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const plano = (t) => t.replace(/\s+/g, "");  // sin espacios: se compara el texto, no cómo se separan los nodos

export async function run() {
  const out = [];
  const ok = (name, pass, detail = "") => out.push({ name, pass: !!pass, detail: String(detail) });
  const store = await cargarStore();
  const listo = async (sel, ms = 8000) => { for (let i = 0; i < ms / 100; i++) { if ($(sel)) break; await sleep(100); } await sleep(350); };
  const ir = async (hash, sel) => { location.hash = hash; await listo(sel); };
  const limpio = (el) => { const c = el.cloneNode(true); c.querySelectorAll(".lec-kicker, .glos-cuenta, .glos-vacio, .x-fijos, .x-lado-t, [data-barrios]").forEach((n) => n.remove()); return c; };
  const texto = (lec) => plano(limpio($(".lec-titulo", lec)).textContent + " " + limpio($(".lec-contenido", lec)).textContent);
  const sinFeos = (lec) => !/\b(null|undefined|NaN)\b/.test(lec.textContent);

  // ---------------- Municipios ----------------
  await ir("#municipios/48020", ".v-municipios .fila-ind");
  let lec = $(".v-municipios");
  {
    const scratch = document.createElement("div");
    const v = renderMunicipios(scratch, store); v.show("48020"); cifrasPlanas(scratch);
    const ref = plano([...scratch.querySelectorAll("header.vista-cab, .ficha")].map((n) => { const c = n.cloneNode(true); c.querySelectorAll("[data-barrios]").forEach((x) => x.remove()); return c.textContent; }).join(" "));
    const live = plano($(".lec-titulo", lec).textContent + " " + (() => { const c = $(".ficha", lec).cloneNode(true); c.querySelectorAll("[data-barrios]").forEach((x) => x.remove()); return c.textContent; })());
    ok("Municipios · Bilbao: el texto y las cifras son idénticos a los del renderizador original", ref === live, ref === live ? `${live.length} caracteres` : `${ref.length} vs ${live.length}`);
  }
  ok("Municipios · perfil, 13 indicadores, problemas, hogares, evolución, barrios y plan", $(".muni-nombre", lec).textContent === "Bilbao" && $$(".fila-ind", lec).length === 13 && $$("section.ficha-sec", lec).map((s) => s.id).join() === "indicadores,problemas,hogares,evolucion,barrios,plan");
  ok("Municipios · el índice interno son los bloques originales, en su orden", $$(".lec-indice .lec-ir", lec).map((b) => b.textContent).join() === "Datos,Problemas,Hogares,Evolución,Barrios,Plan");
  await listo(".v-municipios .barrios-mapa svg path", 10000);
  const feats = (await store.sections()).features.filter((f) => f.properties.muni === "48020").length;
  ok("Municipios · el mapa de barrios de Bilbao dibuja todas sus secciones censales", $$(".barrios-mapa svg path", lec).length === feats && feats > 100, `${feats}`);
  $$(".lec-indice .lec-ir", lec).find((b) => b.textContent === "Plan").click(); await sleep(1200);
  ok("Municipios · «Plan» del índice lleva al bloque y queda marcado como actual", $(".lec-indice .lec-ir[aria-current=true]")?.textContent === "Plan" && Math.abs($("#plan", lec).getBoundingClientRect().top) < 260, `${Math.round($("#plan", lec).getBoundingClientRect().top)} px`);
  window.scrollTo(0, 0);
  // comparar
  await ir("#municipios/48020-48013", ".v-municipios .cabeceras.n2");
  lec = $(".v-municipios");
  ok("Municipios · #municipios/48020-48013 compara dos municipios en dos columnas y quita Evolución, Barrios y Plan", $$(".muni-cab", lec).length === 2 && !!$(".columnas.n2", lec) && !$("#evolucion", lec) && !$("#barrios", lec) && !$("#plan", lec) && $$(".k-punto", lec).length === 2);
  ok("Municipios · el indicador comparado enseña los dos municipios con su puesto entre los 113", $$(".fila-ind", lec)[0].querySelectorAll(".punto").length === 2 && /puesto \d+ de \d+/.test($(".cifras-ind", lec).textContent));
  // buscador y selectores
  const campo = $("#muni-buscar"); campo.value = "Getxo"; campo.dispatchEvent(new Event("change", { bubbles: true })); await sleep(800);
  ok("Municipios · el buscador lleva a Getxo conservando la comparación (#municipios/48044-48013)", location.hash === "#municipios/48044-48013" && $(".muni-nombre")?.textContent === "Getxo", location.hash);
  const sel = $("#muni-b"); sel.value = ""; sel.dispatchEvent(new Event("change", { bubbles: true })); await sleep(800);
  ok("Municipios · «Comparar con: Ninguno» vuelve a la ficha sencilla", location.hash === "#municipios/48044" && $$(".muni-cab").length === 1);
  await ir("#municipios/00000", ".v-municipios .fila-ind");
  ok("Municipios · un código desconocido abre Bilbao, como la web publicada", /#municipios\/48020/.test(location.hash) && $(".muni-nombre")?.textContent === "Bilbao", location.hash);
  ok("Municipios · sin «null», «undefined» ni «NaN» en pantalla", sinFeos($(".v-municipios")));
  ok("Municipios · cifras en Geist tabular, no hay cifras «que ruedan» sin su CSS", $$(".roll").length === 0 && getComputedStyle($(".muni-datos b, .muni-datos")).fontVariantNumeric.includes("tabular-nums"));

  // ---------------- Acceso ----------------
  await ir("#acceso", ".v-acceso .rejilla .rj-casilla");
  lec = $(".v-acceso");
  {
    const scratch = document.createElement("div"); renderAcceso(scratch, store); cifrasPlanas(scratch);
    const ref = plano(scratch.textContent), live = texto(lec);
    ok("Acceso · el texto y las cifras son idénticos a los del renderizador original (alquiler, escalera, explorador y alcance)", ref === live, ref === live ? `${live.length} caracteres` : `${ref.length} vs ${live.length}`);
  }
  ok("Acceso · cuatro bloques originales como pestañas internas", $$(".lec-indice .lec-ir", lec).map((b) => b.textContent).join() === "Alquilar,La escalera,Tus supuestos,Hasta dónde llega");
  const s = store.acceso.supuestos;
  const p50 = store.acceso.bizkaia_tramos.find((r) => r.tramo.includes("P50"));
  const base = { price: p50.precio, net: p50.renta_neta, savings: 0.15, downPayment: 0.35, rate: s.tipo_hipoteca.media, years: Math.max(...s.plazos), loanShare: s.financiacion, cap: s.tope_esfuerzo };
  const r0 = access(base);
  const nums = $$(".x-num", lec).map((n) => n.textContent);
  ok("Acceso · explorador con los supuestos por defecto: años, cuota y precio = access() de calculo-acceso.js", nums[0] === `${es(r0.yearsToSave, 1)} años` && nums[1] === `${es(r0.effort, 1)} %` && nums[2].replace(/\s| /g, "") === `${es(Math.round(r0.affordable / 1000) * 1000)}€`.replace(/\s| /g, ""), nums.join(" | "));
  const grid = $$(".rj-casilla", lec); const esperado = []; for (const a of [10, 15, 20, 25, 30]) for (const e of [25, 30, 35, 40, 45]) esperado.push(es(access({ ...base, savings: a / 100, downPayment: e / 100 }).yearsToSave, 1));
  ok("Acceso · las 25 casillas de la rejilla coinciden con access() una a una", grid.length === 25 && grid.every((b, i) => b.textContent.replace(/^◆\s*/, "") === esperado[i]), grid.slice(0, 5).map((b) => b.textContent).join(","));
  ok("Acceso · las casillas de 10 años o más están marcadas con ◆ además del color", grid.every((b, i) => b.classList.contains("mal") === (access({ ...base, savings: [10, 15, 20, 25, 30][Math.floor(i / 5)] / 100, downPayment: [25, 30, 35, 40, 45][i % 5] / 100 }).yearsToSave >= 10)) && getComputedStyle(grid.find((b) => b.classList.contains("mal")), "::before").content.includes("◆"));
  grid[0].click(); await sleep(250);
  const r1 = access({ ...base, savings: 0.10, downPayment: 0.25 });
  ok("Acceso · tocar una casilla elige ese ahorro y esa entrada y recalcula", $$(".x-num", lec)[0].textContent === `${es(r1.yearsToSave, 1)} años` && $$(".rj-casilla[aria-pressed=true]", lec).length === 1, $$(".x-num", lec)[0].textContent);
  ok("Acceso · «Lo que eliges» y «Lo que no cambia»: el 80 % y el 30 % salen de acceso.json", $(".x-lado-t", lec)?.textContent === "Lo que eliges" && $(".x-fijos", lec).textContent.includes(`${es(100 * s.financiacion)} %`) && $(".x-fijos", lec).textContent.includes(`${es(100 * s.tope_esfuerzo)} %`) && !!$(".x-controles.vidrio", lec));
  ok("Acceso · escalera de 5 hogares con veredicto en texto (Cabe / No cabe / Depende) y no solo en color", $$(".esc-fila:not(.cab)", lec).length === 5 && $$(".veredicto", lec).every((v) => /^(Cabe|No cabe|Depende)$/.test(v.textContent)));
  ok("Acceso · mapa de alcance con los 113 municipios y la leyenda de cuatro estados", $$(".alcance .mapa-lienzo path", lec).length >= 113 && $$(".alcance-clave li", lec).length === 4);
  ok("Acceso · sin «null», «undefined» ni «NaN» en pantalla", sinFeos(lec));

  // ---------------- Normas ----------------
  await ir("#normas", ".v-normas .comp-fila");
  lec = $(".v-normas"); const N = store.normas;
  {
    const scratch = document.createElement("div"); renderNormas(scratch, store); cifrasPlanas(scratch);
    const ref = plano(scratch.textContent), live = plano($(".lec-titulo", lec).textContent.replace(/Estado normativo a .*$/, "") + " " + $(".lec-contenido", lec).textContent);
    ok("Normas · el texto, las fechas y las cifras son idénticos a los del renderizador original", ref === live, ref === live ? `${live.length} caracteres` : `${ref.length} vs ${live.length}`);
  }
  ok("Normas · 15 instrumentos × 4 niveles y 12 hitos, los de normas.json", $$(".comp-fila:not(.cab)", lec).length === N.competencias.length && N.competencias.length === 15 && $$(".comp-fila.cab [data-nivel]", lec).length === 4 && $$(".hito", lec).length === N.hitos.length && N.hitos.length === 12);
  ok("Normas · la fecha del estado normativo está en la cabecera y es la del dato", $(".lec-estado b", lec).textContent === N.fecha, N.fecha);
  for (const nivel of N.niveles) {
    $$(".opcion", lec).find((b) => b.textContent === nivel).click(); await sleep(120);
    const n = N.competencias.filter((c) => c.papeles[nivel] === "decide").length;
    ok(`Normas · filtrar por «${nivel}»: resalta los ${n} instrumentos que decide`, $$(".comp-fila.on", lec).length === n && $(".comp-cuenta", lec).textContent === `${nivel}: decide ${es(n)} de ${es(N.competencias.length)}.`, $(".comp-cuenta", lec).textContent);
  }
  $$(".opcion", lec).find((b) => b.textContent === "Todos").click(); await sleep(120);
  ok("Normas · «Todos» quita el filtro", $$(".comp-fila.on", lec).length === 0 && !$(".comp.filtra", lec));
  const decide = N.competencias.reduce((n, c) => n + Object.values(c.papeles).filter((p) => p === "decide").length, 0), aplica = N.competencias.reduce((n, c) => n + Object.values(c.papeles).filter((p) => p === "aplica").length, 0);
  ok("Normas · punto lleno = decide y anillo = aplica o lo pide (forma distinta, no solo color), con los recuentos del dato", $$(".comp-celda i.decide", lec).length === decide && $$(".comp-celda i.aplica", lec).length === aplica && getComputedStyle($(".comp-celda i.aplica", lec)).backgroundColor !== getComputedStyle($(".comp-celda i.decide", lec)).backgroundColor, `${decide} decide, ${aplica} aplica`);
  const pend = N.hitos.filter((h) => h.estado === "pendiente").length;
  ok("Normas · los hitos pendientes se marcan con la palabra «Pendiente»", $$(".hito-pend", lec).length === pend && $$(".hito.pendiente", lec).length === pend, `${pend} pendientes`);
  ok("Normas · el margen: «30 de 34 medidas» se calcula de medidas.json", /30\s*de 34 medidas/.test($(".margen-cifra", lec).textContent) && store.medidas.medidas.filter((m) => m.viabilidad === "instrumento_existente").length === 30);
  ok("Normas · sin «null», «undefined» ni «NaN» en pantalla", sinFeos(lec));

  // ---------------- Método ----------------
  await ir("#metodo", ".v-metodo dl.glossary dt");
  lec = $(".v-metodo");
  {
    const scratch = document.createElement("div"); renderMetodo(scratch, store); cifrasPlanas(scratch);
    const ref = plano(scratch.textContent), live = texto(lec).replace(/\d+ términos/, "");
    const ref2 = ref; // el original no lleva el contador de términos
    ok("Método · todo el texto de los bloques es idéntico al del renderizador original (glosario, método, límites, revisión, historial y fuentes)", ref2 === plano(live), ref2 === plano(live) ? `${ref2.length} caracteres` : `${ref2.length} vs ${plano(live).length}`);
  }
  const dts = $$("dl.glossary dt", lec);
  ok("Método · 124 términos en el glosario", dts.length === 124 && $(".glos-cuenta", lec).textContent === "124 términos");
  const campoG = $("#glos-buscar"); campoG.value = "BOE"; campoG.dispatchEvent(new Event("input", { bubbles: true })); await sleep(150);
  const vis = dts.filter((d) => !d.hidden).map((d) => d.textContent);
  ok("Método · buscar «BOE» deja solo los términos que contienen el literal (término o definición) y lo cuenta", vis.length > 0 && vis.length < 124 && vis.includes("BOE y BOPV") && dts.filter((d) => !d.hidden).every((d) => /boe/i.test(d.textContent + d.nextElementSibling.textContent)) && /^\d+ de 124 términos$/.test($(".glos-cuenta", lec).textContent), $(".glos-cuenta", lec).textContent);
  campoG.value = "zzzzqq"; campoG.dispatchEvent(new Event("input", { bubbles: true })); await sleep(150);
  ok("Método · una búsqueda sin resultados lo dice", dts.every((d) => d.hidden) && !$(".glos-vacio", lec).hidden);
  campoG.value = ""; campoG.dispatchEvent(new Event("input", { bubbles: true })); await sleep(150);
  ok("Método · vaciar el buscador devuelve los 124 términos", dts.every((d) => !d.hidden) && $(".glos-vacio", lec).hidden);
  const bloques = $$(".method-block", lec);
  ok("Método · el índice tiene un enlace por bloque, agrupados en Glosario, Cómo se hizo, Límites y revisión, Historial y Fuentes", $$(".lec-indice .lec-ir", lec).length === bloques.length && $$(".lec-indice .lec-grupo", lec).map((g) => g.textContent).join() === "Glosario,Cómo se hizo,Límites y revisión,Historial,Fuentes");
  window.scrollTo(0, 0); $$(".lec-indice .lec-ir", lec).find((b) => b.textContent === "Fuentes").click(); await sleep(1300);
  ok("Método · «Fuentes» del índice lleva a ese bloque", $("#m-fuentes", lec).getBoundingClientRect().top < innerHeight - 200 && $(".lec-indice .lec-ir[aria-current=true]")?.textContent === "Fuentes", `${Math.round($("#m-fuentes").getBoundingClientRect().top)} px`);
  await ir("#metodo/glosario", ".v-metodo #glosario");
  window.scrollTo(0, 400); location.hash = "#metodo"; await sleep(300); location.hash = "#metodo/glosario"; await sleep(900);
  ok("Método · la ruta #metodo/glosario (la de la web publicada) lleva al glosario", $("#glosario") && $("#glosario").getBoundingClientRect().top > 60 && $("#glosario").getBoundingClientRect().top < 200, `${Math.round($("#glosario").getBoundingClientRect().top)} px`);
  ok("Método · ancho de lectura controlado (líneas de texto ≤ 80 caracteres)", getComputedStyle($(".method-block > p", lec)).maxWidth !== "none" && $(".method-block > p", lec).getBoundingClientRect().width / parseFloat(getComputedStyle($(".method-block > p", lec)).fontSize) <= 80);
  ok("Método · sin «null», «undefined» ni «NaN» en pantalla", sinFeos(lec));

  // ---------------- direcciones de antes (rutas.js original) ----------------
  await ir("#comparar/48020-48013", ".v-municipios .cabeceras.n2");
  ok("Rutas antiguas · #comparar/48020-48013 lleva a #municipios/48020-48013 (dos municipios)", location.hash === "#municipios/48020-48013" && $$(".muni-cab").length === 2, location.hash);
  await ir("#diagnostico/48044", ".v-municipios .fila-ind");
  ok("Rutas antiguas · #diagnostico/48044 lleva a la ficha de Getxo", location.hash === "#municipios/48044" && $(".muni-nombre")?.textContent === "Getxo", location.hash);
  await ir("#compra", ".v-acceso .rejilla .rj-casilla");
  ok("Rutas antiguas · #compra lleva a Acceso", location.hash === "#acceso" && !!$(".v-acceso"), location.hash);
  await ir("#ideas", ".medidas");
  ok("Rutas antiguas · #ideas lleva a las alternativas estudiadas de Medidas", location.hash === "#medidas/alternativas" && window.__vista === "medidas", location.hash);

  const fail = out.filter((t) => !t.pass);
  return { total: out.length, pass: out.length - fail.length, fail: fail.length, fallos: fail.map((f) => `${f.name} (${f.detail})`), todo: out.map((t) => `${t.pass ? "PASS" : "FAIL"} · ${t.name}${t.detail ? ` (${t.detail})` : ""}`) };
}
