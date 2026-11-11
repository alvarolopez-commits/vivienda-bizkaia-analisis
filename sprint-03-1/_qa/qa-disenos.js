// Sprint 03.1 · pruebas de las dos propuestas de composición de Medidas (A · Escenario y B · Mesa). En el navegador, con la app abierta en
//   http://localhost:4179/?diseno=a#medidas   o   ?diseno=b#medidas
//   window.__qaRes = null; import('/_qa/qa-disenos.js').then(m => m.run()).then(r => window.__qaRes = r)
// Comprueba la cinta de criterios (con cuentas y desplegables), el escenario, la ficha (panel y lista en A; franja y cajón en B), la
// bandeja flotante y que ninguna pieza nueva cambie datos, textos ni selección. La lógica de fondo la cubren qa-equivalencia y qa-flujos.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export async function run() {
  const out = [];
  const ok = (name, pass, detail = "") => out.push({ name, pass: !!pass, detail: String(detail) });
  const diseno = $("#medidas").dataset.diseno;
  const { S, store, app, render, openPanel, closePanel, toggle } = window.__medidas;
  const M = store.medidas, total = M.medidas.length;
  const go = async (h, ms = 450) => { location.hash = h; await sleep(ms); };
  const reset = async () => { S.sel = []; S.focus = null; S.f = { linea: "", mecanismo: "", decide: "", papel: "", ya: false }; S.w = { evidencia: 0, viabilidad: 0, plazo: 0, coste: 0, alcance: 0 }; S.rep = "plano"; await go("#medidas?x=" + Math.random().toString(36).slice(2, 5)); await go("#medidas"); };
  await reset();
  ok(`Propuesta activa: ${diseno.toUpperCase()}`, diseno === "a" || diseno === "b", diseno);

  // ---------- cinta de criterios ----------
  const lineas = $$("#filtros .m-lineas [data-linea]");
  ok("Cinta: «Todas» y las 6 líneas (7 botones)", lineas.length === 7 && lineas[0].dataset.linea === "");
  const esperado = (k, f = {}) => M.medidas.filter((m) => app.passes(m, { linea: k, mecanismo: "", decide: "", papel: "", ya: false, ...f })).length;
  ok("Cada botón dice cuántas medidas hay (calculado de los datos, Todas = 34)", lineas.every((b) => b.querySelector(".n").textContent === String(esperado(b.dataset.linea))) && lineas[0].querySelector(".n").textContent === String(total), lineas.map((b) => b.querySelector(".n").textContent).join(","));
  ok("Las 6 cuentas suman 34 (cada medida está en una línea)", lineas.slice(1).reduce((n, b) => n + Number(b.querySelector(".n").textContent), 0) === total);
  S.f.ya = true; render();
  ok("Con «aplicables ya» las cuentas se recalculan (30 en total)", lineas.slice(1).every((b) => b.querySelector(".n").textContent === String(esperado(b.dataset.linea, { ya: true }))) && lineas[0].querySelector(".n").textContent === "30", lineas.map((b) => b.querySelector(".n").textContent).join(","));
  S.f.ya = false; render();
  lineas[1].click(); await sleep(150);
  ok("Elegir una línea filtra el escenario y la cuenta (11 de 34)", S.f.linea === "oferta" && $(".cuenta").textContent === "11 de 34 medidas" && lineas[1].getAttribute("aria-pressed") === "true");
  lineas[0].click(); await sleep(100);

  // «Más criterios»
  const masBtn = $("#filtros [aria-controls='m-mas']"), mas = $("#m-mas");
  ok("«Más criterios» empieza cerrado y accesible (aria-expanded, controla su caja)", mas.hidden && masBtn.getAttribute("aria-expanded") === "false");
  masBtn.click(); await sleep(80);
  ok("Se abre y contiene Cómo actúa, Quién decide y Papel de BM30 (con sus opciones originales)", !mas.hidden && masBtn.getAttribute("aria-expanded") === "true" && $$("select", mas).length === 3 && $$("#f-mecanismo option", mas).length === 1 + Object.keys(M.mecanismos).length &&$$("#f-papel option", mas).length === 1 + Object.keys(M.papeles_bm30).length);
  const sel = $("#f-mecanismo"); sel.value = "limita"; sel.dispatchEvent(new Event("change")); await sleep(120);
  ok("Un criterio de ahí filtra (8 de 34) y el botón muestra «1»", S.f.mecanismo === "limita" && $(".cuenta").textContent === "8 de 34 medidas" && masBtn.querySelector(".n").textContent === "1");
  ok("El chip del criterio activo aparece y se puede quitar", $$(".chips-filtro .chip").length === 1);
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })); await sleep(80);
  ok("Escape cierra el desplegable y devuelve el foco al botón", mas.hidden && document.activeElement === masBtn);
  masBtn.click(); await sleep(50); document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })); await sleep(50);
  ok("Pulsar fuera lo cierra", mas.hidden);
  S.f.mecanismo = ""; render();

  // «Prioridades» solo con la Matriz
  const pesosWrap = $("#m-pesos").closest(".m-pop-wrap");
  ok("«Prioridades» (pesos) no aparece en el Plano", pesosWrap.hidden);
  S.rep = "matriz"; render();
  ok("…y aparece en la Matriz con sus 5 criterios de 4 niveles", !pesosWrap.hidden && $$("#m-pesos .x-grupo").length === 5 && $$("#m-pesos .x-grupo")[0].querySelectorAll("button").length === 4);
  S.w = { ...S.w, coste: 3 }; render();
  ok("Con pesos, un punto lo indica en el botón y la Matriz muestra la nota", $("#filtros [aria-controls='m-pesos'] .pto.on") !== null && !!$("#v-explorar .col-nota"));
  S.w = { evidencia: 0, viabilidad: 0, plazo: 0, coste: 0, alcance: 0 }; S.rep = "plano"; render();

  // ---------- escenario ----------
  const st = $(".m-stage").getBoundingClientRect();
  ok("El escenario ocupa el ancho disponible y tiene el fondo de superficie del Atlas", st.width > 880 && getComputedStyle($(".m-stage")).borderRadius === "28px" && /radial-gradient/.test(getComputedStyle($(".m-stage")).backgroundImage));
  // A: el escenario cabe entero en 1440 × 900. B: el Plano ocupa todo el ancho y es más alto que la ventana (la franja inferior es fija y la
  // página se desplaza); basta con que el escenario empiece a la vista, con sitio para su contenido sobre la franja.
  ok(diseno === "a" ? `A · el escenario cabe en la ventana (${Math.round(st.bottom)} ≤ ${innerHeight})` : `B · el escenario empieza a la vista (${Math.round(st.top)} < ${innerHeight - 450})`, diseno === "a" ? st.bottom <= innerHeight + 2 : st.top < innerHeight - 450, `${Math.round(st.top)}–${Math.round(st.bottom)}`);
  const pl = $(".burbujas").getBoundingClientRect();
  ok("El Plano se ve entero dentro del escenario (34 burbujas, sin recortes)", $$("a.burbuja").length === 34 && pl.bottom <= st.bottom + 1 && pl.right <= st.right + 1 && pl.left >= st.left - 1);
  ok("Leyenda de líneas de cristal bajo el Plano", /blur/.test(getComputedStyle($(".leyenda-lineas")).backdropFilter) && $$(".leyenda-lineas li").length === 6);

  // ---------- ficha: A (panel + lista) y B (franja + cajón) ----------
  if (diseno === "a") {
    const side = $(".m-side");
    ok("A · panel lateral persistente a la derecha, de la altura del escenario", !!side && !side.hidden && Math.abs(side.getBoundingClientRect().height - st.height) < 3 && side.getBoundingClientRect().left > st.right, `${Math.round(side.getBoundingClientRect().height)} vs ${Math.round(st.height)}`);
    ok("A · sin medida elegida muestra «El conjunto a la vista» con cifras calculadas", !$(".m-resumen").hidden && $(".m-resumen-cifra").textContent === "34 de 34 medidas" && $(".m-resumen-sub").textContent === "30 se pueden aplicar ya");
    const filas = $$(".m-lista .m-fila");
    ok("A · la lista tiene las 34 medidas, por línea e ID como la Matriz sin pesos", filas.length === 34 && filas.map((f) => f.dataset.id).join() === [...M.medidas].sort((a, b) => Object.keys(M.lineas).indexOf(a.linea) - Object.keys(M.lineas).indexOf(b.linea) || a.id.localeCompare(b.id)).map((m) => m.id).join());
    filas[5].click(); await sleep(150);
    ok("A · elegir una fila abre su ficha en el panel y la marca en el Plano", S.focus === filas[5].dataset.id && !$(".panel-medida").hidden && $(".m-resumen").hidden && $(`a.burbuja[data-id="${S.focus}"]`).classList.contains("abierta") && $$(".m-fila[aria-pressed=true]").length === 1);
    ok("A · la ficha y la lista conviven (el panel no desplaza la lista fuera de la vista)", $(".m-lista").getBoundingClientRect().height > 120, `${Math.round($(".m-lista").getBoundingClientRect().height)} px`);
    const mas1 = $$(".m-lista li")[2].querySelector(".m-fila-add"); const idMas = $$(".m-lista .m-fila")[2].dataset.id;
    mas1.click(); await sleep(100);
    ok("A · el «+» de la lista añade a la comparación (mismo estado que la bandeja)", S.sel.includes(idMas) && $(`#bandeja .chip-medida .medida-id`)?.textContent === idMas);
    S.sel = ["M01", "M02", "M03"]; render();
    ok("A · con 3 elegidas los «+» restantes se deshabilitan", $$(".m-fila-add").filter((b) => b.getAttribute("aria-pressed") === "false").every((b) => b.disabled));
    S.sel = []; S.f.linea = "turistica"; render();
    ok("A · la lista sigue los criterios (3 medidas turísticas)", $$(".m-lista .m-fila").length === 3);
    S.f.linea = ""; S.rep = "matriz"; S.w = { ...S.w, evidencia: 3 }; render();
    const ordenLista = $$(".m-lista .m-fila").map((f) => f.dataset.id).join(), ordenTabla = $$("#v-explorar tbody tr").map((t) => t.dataset.id).join();
    ok("A · con pesos, la lista sigue el mismo orden que la Matriz y enseña la nota", ordenLista === ordenTabla && /nota/.test($(".m-fila-v").textContent), ordenLista.slice(0, 24));
    S.w = { evidencia: 0, viabilidad: 0, plazo: 0, coste: 0, alcance: 0 }; S.rep = "plano"; closePanel(); await sleep(100);
  } else {
    const dock = $(".m-dock");
    ok("B · franja inferior fija (sticky) a todo el ancho del escenario", !!dock && !dock.hidden && getComputedStyle(dock).position === "sticky" && Math.abs(dock.getBoundingClientRect().width - st.width) < 4);
    ok("B · sin medida elegida, la franja lo dice", !!$(".m-inspector-vacio"));
    ok("B · no hay panel lateral (el escenario usa todo el ancho)", $(".m-side") === null && st.width > 1300);
    openPanel("M10"); await sleep(150);
    const filas = $$(".m-inspector-criterios dd").map((d) => d.textContent);
    const { criteria } = await import("/original/js/medidas/ficha.js");
    ok("B · la franja enseña M10 con sus 6 primeros criterios, los de criteria() original", $(".m-inspector .medida-nombre").textContent === store.measures.M10.nombre && filas.join("|") === criteria(store, store.measures.M10).slice(0, 6).map(([, v]) => v).join("|"));
    ok("B · elegir una medida NO abre el cajón (no tapa el escenario)", $(".panel-medida").hidden && S.focus === "M10");
    const { first } = await import("/js/medidas/calculo.js");
    ok("B · el extracto de «Qué hace» es first() del texto literal", $(".m-inspector-extracto").textContent === `Qué hace ${first(store.measures.M10.que_hace)}`);
    $$(".m-inspector-acciones button")[1].click(); await sleep(150);
    const panel = $(".panel-medida");
    ok("B · «Ver la ficha» abre el cajón (fijo a la derecha, no modal) con la ficha completa", !panel.hidden && getComputedStyle(panel).position === "fixed" && panel.getBoundingClientRect().right <= innerWidth && !panel.hasAttribute("aria-modal") && panel.textContent.includes(store.measures.M10.riesgos));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })); await sleep(120);
    ok("B · el primer Escape cierra el cajón y conserva la medida elegida", panel.hidden && S.focus === "M10");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })); await sleep(120);
    ok("B · el segundo Escape quita la elección", S.focus === null && !!$(".m-inspector-vacio"));
    openPanel("M10"); await sleep(100);
    $$(".m-inspector-acciones button")[0].click(); await sleep(150);
    ok("B · «Añadir a la comparación» de la franja usa la misma selección", S.sel.join() === "M10" && $(".m-inspector-acciones button").getAttribute("aria-pressed") === "true");
    const tr = $("#bandeja").getBoundingClientRect(), dr = $(".m-dock").getBoundingClientRect();
    ok("B · la bandeja flota por encima de la franja sin taparla", !$("#bandeja").hidden && tr.bottom <= dr.top + 2, `${Math.round(tr.bottom)} ≤ ${Math.round(dr.top)}`);
    S.sel = []; closePanel(); closePanel(); await sleep(100);
  }

  // ---------- bandeja flotante ----------
  toggle("M06"); toggle("M01"); await sleep(150);
  const b = $("#bandeja").getBoundingClientRect();
  ok("Bandeja: flotante de cristal, centrada y dentro de la ventana", !$("#bandeja").hidden && getComputedStyle($("#bandeja")).position === "fixed" && b.left >= 0 && b.right <= innerWidth && b.bottom <= innerHeight && Math.abs((b.left + b.right) / 2 - document.documentElement.clientWidth / 2) < 3); // centrada en el área visible (sin la barra de desplazamiento)
  ok("Bandeja: dos medidas, «Comparar medidas» activa con la ruta de siempre", $("#bandeja .btn.primary").getAttribute("href") === "#medidas/M06-M01");
  S.sel = []; render();

  // ---------- Matriz en la composición ----------
  S.rep = "matriz"; render(); await sleep(100);
  const wrap = $(".table-wrap");
  ok("Matriz: las 12 columnas originales y desplazamiento dentro del recuadro", $$("#v-explorar thead th:not(.x-extra)").length === 12 && wrap.scrollWidth > wrap.clientWidth);
  ok("Matriz: cabecera, casilla, orden y medida fijas al desplazar", ["th", ".col-sel", ".col-orden", ".col-medida"].every((s) => getComputedStyle($(s, wrap)).position === "sticky"));
  S.rep = "plano"; render();

  // ---------- general ----------
  for (const h of ["#medidas?vista=entender", "#medidas/M01-M06-M20", "#medidas/M06", "#medidas/alternativas", "#medidas"]) await go(h, 500);
  const sucio = []; for (const h of ["#medidas", "#medidas?rep=matriz&w=3,2,0,0,1", "#medidas?vista=entender", "#medidas/M01-M06", "#medidas/M06", "#medidas/alternativas"]) { await go(h, 450); if (/null|undefined|NaN/.test($("#medidas").textContent)) sucio.push(h); if (document.documentElement.scrollWidth > innerWidth + 1) sucio.push(`desborde ${h}`); }
  ok("Ninguna vista escribe null, undefined o NaN ni desborda horizontalmente", sucio.length === 0, sucio.join(", "));
  const fam = [...document.querySelectorAll("#medidas *")].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && /\d/.test(n.textContent))).filter((e) => !/^H[1-6]$/.test(e.tagName)).map((e) => getComputedStyle(e).fontFamily.split(",")[0].replace(/["']/g, ""));
  ok("Tipografía: todas las cifras de las piezas nuevas en Geist", fam.length > 50 && fam.every((f) => f === "Geist"), [...new Set(fam)].join());
  await go("#medidas");

  const fail = out.filter((t) => !t.pass);
  return { diseno, total: out.length, pass: out.length - fail.length, fail: fail.length, fallos: fail, todo: out.map((t) => `${t.pass ? "PASS" : "FAIL"} · ${t.name}${t.detail ? ` (${t.detail})` : ""}`) };
}
