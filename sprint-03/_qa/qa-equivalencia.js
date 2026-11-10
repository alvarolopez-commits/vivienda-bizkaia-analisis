// Sprint 03 · pruebas de EQUIVALENCIA contra la web original (en el navegador, con el explorador abierto en /medidas/):
//   JSON.stringify(await (await import('/_qa/qa-equivalencia.js')).run())
// El «oráculo» son los módulos ORIGINALES (original/js/matriz.js, medidas/burbujas.js, medidas/index.js, medidas/ficha.js),
// servidos sin tocar (sha256 comprobado en _qa/regresion.py). Se monta cada uno aparte, se manejan sus controles como lo haría
// un lector y se compara lo que dibujan con lo que dibuja el explorador para el mismo estado.
import { matrix } from "/medidas/original/js/matriz.js";
import { burbujas } from "/medidas/original/js/medidas/burbujas.js";
import { compare, criteria, ficha } from "/medidas/original/js/medidas/ficha.js";
import { renderMedidas } from "/medidas/original/js/medidas/index.js";
import { createStore } from "/medidas/original/js/store.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const WKEYS = ["evidencia", "viabilidad", "plazo", "coste", "alcance"];

export async function run() {
  const out = [];
  const ok = (name, pass, detail = "") => out.push({ name, pass: !!pass, detail: String(detail) });
  const { store, S, render, app, plano } = window.__medidas;
  const M = store.medidas;
  location.hash = "#medidas?rep=matriz"; await sleep(250);

  // ---------- 1. Matriz: mismas filas, mismo orden, mismas celdas ----------
  const orig = matrix(store); // la matriz ORIGINAL, aparte (sin insertar en la página)
  const oRows = () => $$("tbody tr", orig).map((tr) => ({ id: tr.querySelector("th a").getAttribute("href").split("/").pop(), cells: [...tr.children].map((c) => c.textContent) }));
  const oSel = (id) => $(`#${id}`, orig);
  const setOrig = (cfg) => {
    [["mx-linea", cfg.linea], ["mx-mec", cfg.mecanismo], ["mx-decide", cfg.decide], ["mx-papel", cfg.papel]].forEach(([id, v]) => { oSel(id).value = v || ""; oSel(id).dispatchEvent(new Event("change")); });
    $$(".mx-sliders .x-grupo", orig).forEach((g, i) => $$("button", g)[cfg.w[WKEYS[i]]].click());
  };
  const mine = () => $$("#v-explorar tbody tr").map((tr) => ({ id: tr.dataset.id, cells: [...tr.children].filter((c) => !c.classList.contains("x-extra")).map((c) => c.textContent) }));
  const setMine = (cfg) => { S.rep = "matriz"; S.f = { linea: cfg.linea || "", mecanismo: cfg.mecanismo || "", decide: cfg.decide || "", papel: cfg.papel || "", ya: false }; S.w = { ...cfg.w }; render(); };
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  const zero = Object.fromEntries(WKEYS.map((k) => [k, 0]));
  const named = {
    "sin filtros ni pesos": { w: { ...zero } },
    "pesos A: evidencia 3": { w: { ...zero, evidencia: 3 } },
    "pesos B: viabilidad 3, plazo 2": { w: { ...zero, viabilidad: 3, plazo: 2 } },
    "pesos C: 2, 1, 1, 3, 2": { w: { evidencia: 2, viabilidad: 1, plazo: 1, coste: 3, alcance: 2 } },
    "pesos D: solo alcance 1": { w: { ...zero, alcance: 1 } },
  };
  const recorded = {};
  for (const [name, cfg] of Object.entries(named)) {
    setOrig(cfg); setMine(cfg);
    const a = oRows(), b = mine();
    ok(`Matriz · ${name}: mismas filas, orden y celdas`, same(a, b), `${a.length} filas`);
    recorded[name] = a.map((r) => r.id).join(",");
  }
  // 60 configuraciones aleatorias reproducibles: filtros + pesos
  const rnd = mulberry(20261110), pick = (obj) => { const ks = Object.keys(obj); return rnd() < 0.55 ? "" : ks[Math.floor(rnd() * ks.length)]; };
  let bad = 0, firstBad = "";
  for (let i = 0; i < 60; i++) {
    const cfg = { linea: pick(M.lineas), mecanismo: pick(M.mecanismos), decide: pick(M.decide), papel: pick(M.papeles_bm30), w: Object.fromEntries(WKEYS.map((k) => [k, rnd() < 0.4 ? 0 : Math.floor(rnd() * 4)])) };
    setOrig(cfg); setMine(cfg);
    const a = oRows(), b = mine();
    if (!same(a, b)) { bad++; firstBad ||= JSON.stringify(cfg); }
    if (!same($(".note[aria-live]", orig).textContent.match(/^(\d+) de/)?.[1], String(a.length))) { bad++; }
  }
  ok("Matriz · 60 configuraciones aleatorias (filtros + pesos): idéntico a la original", bad === 0, bad ? firstBad : "60 de 60");

  // Sin pesos tras quitarlos: vuelve exactamente al orden original por línea e ID
  setOrig(named["pesos C: 2, 1, 1, 3, 2"]); setMine(named["pesos C: 2, 1, 1, 3, 2"]);
  setOrig(named["sin filtros ni pesos"]); document.querySelector("#filtros .pesos .btn-link")?.click();
  S.w = { ...zero }; render();
  ok("Matriz · «Quitar los pesos» restaura el orden original por línea/ID", same(oRows().map((r) => r.id), mine().map((r) => r.id)));
  const lineOrder = Object.keys(M.lineas);
  const expectedDefault = [...M.medidas].sort((a, b) => lineOrder.indexOf(a.linea) - lineOrder.indexOf(b.linea) || a.id.localeCompare(b.id)).map((m) => m.id);
  ok("Matriz · sin pesos = orden por línea (editorial) e ID", same(mine().map((r) => r.id), expectedDefault));
  ok("Matriz · sin pesos no hay columna ni puntuación", !$("#v-explorar .col-nota") && !mine().some((r) => r.cells[0] !== ""));
  S.w = { ...zero, evidencia: 3 }; render();
  ok("Matriz · con un peso aparece la nota (0 a 1) y el rango 1.º", !!$("#v-explorar .col-nota") && mine()[0].cells[0] === "1.º");
  const notas = $$("#v-explorar td.col-nota").map((t) => Number(t.textContent.replace(",", ".")));
  ok("Matriz · la nota va de mayor a menor y entre 0 y 1", notas.every((n, i) => n >= 0 && n <= 1 && (i === 0 || notas[i - 1] >= n)), notas.slice(0, 5).join(" "));
  S.w = { ...zero }; render();

  // «Se puede aplicar ya» (nuevo en la matriz, mismo predicado que el Plano): solo las 30 de instrumento existente
  S.f = { linea: "", mecanismo: "", decide: "", papel: "", ya: true }; render();
  ok("Aplicable ya: 30 de 34, todas con «Ya» en la columna Se aplica", mine().length === 30 && mine().every((r) => r.cells[6] === "Ya"), mine().length);
  S.f = { linea: "", mecanismo: "", decide: "", papel: "", ya: false }; render();

  // ---------- 2. Plano: mismas burbujas (posición, radio, color, número) y mismos filtros ----------
  const oPlano = burbujas(store);
  const oDots = $$("a.burbuja", oPlano).map((a) => { const c = $("circle", a), t = $("text", a); return { id: a.getAttribute("aria-label").split(" ")[0], cx: c.getAttribute("cx"), cy: c.getAttribute("cy"), r: c.getAttribute("r"), fill: c.getAttribute("fill"), t: t?.textContent ?? null, tc: t?.getAttribute("class") ?? null }; });
  const mDots = $$("a.burbuja", plano.node).map((a) => { const c = $("circle:not(.aro)", a), t = $("text", a); return { id: a.dataset.id, cx: c.getAttribute("cx"), cy: c.getAttribute("cy"), r: c.getAttribute("r"), fill: c.getAttribute("fill"), t: t?.textContent ?? null, tc: t?.getAttribute("class") ?? null }; });
  ok("Plano · 34 burbujas con la misma posición, radio, color y número que la original", oDots.length === 34 && same(oDots, mDots), `${mDots.length} burbujas`);
  ok("Plano · ninguna coordenada alterada (sin jitter): cx, cy y r idénticos", oDots.every((d, i) => d.cx === mDots[i].cx && d.cy === mDots[i].cy && d.r === mDots[i].r));
  const oLineBtns = $$(".filtro-lineas .opcion", oPlano);
  let badP = 0;
  for (const [li, line] of ["", ...Object.keys(M.lineas)].entries()) for (const ya of [false, true]) {
    oLineBtns[li].click(); const yaBtn = oLineBtns[oLineBtns.length - 1]; if ((yaBtn.getAttribute("aria-pressed") === "true") !== ya) yaBtn.click();
    const offOrig = new Set($$("a.burbuja:not(.apagada)", oPlano).map((a) => a.getAttribute("aria-label").split(" ")[0]));
    S.rep = "plano"; S.f = { linea: line, mecanismo: "", decide: "", papel: "", ya }; render();
    const onMine = new Set($$("a.burbuja:not(.apagada)", plano.node).map((a) => a.dataset.id));
    if (!same([...offOrig].sort(), [...onMine].sort())) badP++;
  }
  ok("Plano · los filtros de línea y «aplicables ya» encienden las mismas burbujas que la original (14 combinaciones)", badP === 0, badP);
  S.f = { linea: "", mecanismo: "", decide: "", papel: "", ya: false }; render();
  ok("Plano · contador «N de 34 medidas» con el conjunto filtrado", $(".cuenta").textContent === "34 de 34 medidas");

  // ---------- 3. Cadena y Quién decide: mismos diagramas ----------
  const root = document.createElement("div");
  const oApp = renderMedidas(root, store); oApp.show(undefined);
  const cols = (box) => $$(".enlaces-col", box).map((c) => c.outerHTML).join("|");
  const links = (box) => $$("path", box).map((p) => `${p.dataset.a}>${p.dataset.b}`).join(",");
  const { chain, deciders } = await import("/medidas/js/calculo.js");
  const cadSec = $("#cadena", root), decSec = $("#decide", root);
  let badC = 0, badD = 0;
  for (const [i, line] of Object.keys(M.lineas).entries()) {
    $$(".x-botones button", cadSec)[i].click();
    const o = $(".enlaces", cadSec), m = chain(store, line);
    if (cols(o) !== cols(m) || links(o) !== links(m) || o.getAttribute("aria-label") !== m.getAttribute("aria-label")) badC++;
  }
  for (const [i, line] of ["", ...Object.keys(M.lineas)].entries()) {
    $$(".x-botones button", decSec)[i].click();
    const o = $(".enlaces", decSec), m = deciders(store, line);
    if (cols(o) !== cols(m) || links(o) !== links(m)) badD++;
  }
  ok("Cadena · los 6 diagramas (columnas, textos y enlaces) idénticos a los originales", badC === 0, badC);
  ok("Quién decide · los 7 diagramas (Todas + 6 líneas) idénticos a los originales", badD === 0, badD);

  // ---------- 4. Cabeceras y textos de sección ----------
  ok("Título y entradilla de Medidas, literales de la web original", $("#vista-cab").textContent === $(".vista-cab", root).textContent, $("#vista-cab").textContent.slice(0, 50));
  S.rep = "plano"; render();
  ok("Frase del Plano (calculada con los datos) idéntica a la original", $("#v-explorar .rep-titulo .sub").textContent === $("#plano .sub", root).textContent);
  ok("Título y subtítulo de la Matriz, literales", (S.rep = "matriz", render(), $("#rep-t").textContent === $("#matriz-t", root).textContent && $("#v-explorar .rep-titulo .sub").textContent === $("#matriz .sub", root).textContent));
  ok("Notas de la Matriz (pesos y pie) idénticas a las originales", $(".pesos .note").textContent === $(".mx-weights .note", orig).textContent && $$(".matriz-notas .note").pop().textContent === $$(".note", orig).pop().textContent);
  S.rep = "plano"; render();

  // ---------- 5. Criterios, ficha y comparación: mismos valores, textos enteros ----------
  let badCr = 0, badCmp = 0;
  for (const m of M.medidas) {
    const a = criteria(store, m).map(([k, v]) => `${k}=${v}`).join("|");
    const fi = ficha(store, m);
    const b = $$(".criterios > div", fi).map((d) => `${$("dt", d).textContent}=${$("dd", d).textContent}`).join("|");
    if (a !== b) badCr++;
  }
  ok("Criterios de las 34 fichas (12 filas): los de la ficha original", badCr === 0, badCr);
  for (const ids of [["M01", "M06"], ["M01", "M06", "M20"], ["M33", "M34"], ["M10", "M08", "M09"]]) {
    location.hash = `#medidas/${ids.join("-")}`; await sleep(250);
    const oc = compare(store, ids.map((x) => store.measures[x]));
    const o = $$(".fila:not(.cab)", oc).map((r) => [...r.children].map((c) => c.textContent).join("¦"));
    const mi = $$("#v-comparar .fila:not(.cab):not(.larga)").map((r) => [...r.children].map((c) => c.textContent.replace(/difieren$/, "")).join("¦"));
    if (!same(o, mi)) badCmp++;
  }
  ok("Comparador · filas de criterios iguales a la comparación original (4 casos)", badCmp === 0, badCmp);

  const { first } = await import("/medidas/js/calculo.js");
  let trunc = 0, missing = [];
  for (const m of M.medidas) {
    location.hash = `#medidas/${m.id}`; await sleep(120);
    const txt = $("#v-ficha").textContent;
    for (const [lab, v] of [["que_hace", m.que_hace], ["evidencia_detalle", m.evidencia_detalle], ["por_que", m.papel_bm30.por_que], ["kpi", m.kpi], ["riesgos", m.riesgos]]) {
      if (v && !txt.includes(v)) missing.push(`${m.id}.${lab}`);
    }
    const hrefs = $$("#v-ficha .src-list a").map((a) => a.getAttribute("href"));
    for (const u of m.fuentes || []) if (!hrefs.includes(u)) missing.push(`${m.id}.fuente`);
    if (m.que_hace && first(m.que_hace) !== m.que_hace) trunc++;
  }
  ok("Ficha completa de las 34: que_hace, evidencia_detalle, BM30, kpi, riesgos y fuentes ENTEROS y literales", missing.length === 0, missing.slice(0, 5).join(", ") || "34 de 34");
  ok("Información: medidas cuyo «Qué hace» la ficha original recorta a dos frases", true, `${trunc} de 34 (el explorador las muestra enteras)`);

  // el panel contextual: extracto con «Leer más» y texto completo al abrirlo
  location.hash = "#medidas"; await sleep(200);
  const m06 = store.measures.M06;
  window.__medidas.openPanel("M06");
  const p = $(".panel-medida");
  const ext = $(".texto-largo", p);
  ok("Panel: el extracto de «Qué hace» es first() del texto literal", ext.textContent === first(m06.que_hace));
  const lm = $(".leer-mas", p); lm.click();
  ok("Panel: «Leer más» muestra el texto íntegro del JSON", $(".texto-largo", p).textContent === m06.que_hace && lm.getAttribute("aria-expanded") === "true");
  window.__medidas.closePanel();

  // ---------- 6. Alternativas: las cuatro, aparte de las 34 ----------
  location.hash = "#medidas/alternativas"; await sleep(250);
  const ideas = store.ideas.ideas;
  ok("Alternativas: las 4 ideas del JSON, con su motivo, separadas de las 34", $$("#v-alternativas details.idea").length === ideas.length && ideas.length === 4, `${$$("#v-alternativas details.idea").length} ideas`);
  const altTxt = $("#v-alternativas").textContent;
  ok("Alternativas: «Qué es», «Por qué no la proponemos» y demás literales", ideas.every((i) => [i.que_es, i.que_resuelve, i.donde_se_usa, i.por_que_no].every((t) => altTxt.includes(t))));
  location.hash = "#medidas"; await sleep(150);

  const fail = out.filter((t) => !t.pass);
  return { total: out.length, pass: out.length - fail.length, fail: fail.length, fallos: fail, registro: recorded, todo: out.map((t) => `${t.pass ? "PASS" : "FAIL"} · ${t.name}${t.detail ? ` (${t.detail})` : ""}`) };
}
