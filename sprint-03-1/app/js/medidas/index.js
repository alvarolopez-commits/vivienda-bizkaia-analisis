// Sprint 03 · Explorador de Medidas (Explorar · Entender · Comparar · Alternativas). PROTOTIPO aislado, solo escritorio.
//
// Un único estado (estado-app.js) gobierna Plano, Matriz, filtros, pesos, bandeja, panel contextual y la URL. Nada se calcula
// aquí: valores, criterios, pesos y orden salen de calculo.js (copia literal de las funciones privadas de la web original) y
// de data/medidas.json; los textos, de data/medidas.json y de los módulos originales servidos en original/.
import { alternatives } from "../../original/js/alternativas.js";
import { announce } from "../../original/js/comun.js";
import { LINE_COLORS } from "../../original/js/medidas/burbujas.js";
import { el, es, pill } from "../../original/js/ui.js";
import { WEIGHTS, WEIGHT_WORDS, lineName, ordered, scorer } from "./calculo.js";
import { crearComparar } from "./comparar.js";
import { crearPanel, fichaCompleta } from "./detalle.js";
import { crearEntender } from "./entender.js";
import { MAX_SEL, createApp, emptyFilters } from "./estado-app.js";
import { crearMatriz } from "./matriz-vista.js";
import { crearPlano } from "./plano.js";
import { crearLista } from "./lista.js";

const $ = (s) => document.querySelector(s);
const NO_FILTER_LABEL = { mecanismo: "Cómo actúa", decide: "Quién decide", papel: "Papel de BM30" };
const SUB = {
  plano: ["Evidencia y plazo", null], // el subtítulo se calcula con los datos (planoSub, copiado de index.js)
  matriz: ["Todas, criterio a criterio", "Filtra o da peso a lo que te importa: la tabla se ordena."],
};

/** La frase del plano, contada con los datos (copia literal de planoSub() de js/medidas/index.js). */
function planoSub(M) {
  const high = M.medidas.filter((m) => m.evidencia === "Alta"), short = M.medidas.filter((m) => m.plazo === "corto");
  const weak = short.filter((m) => ["Media-baja", "Baja"].includes(m.evidencia)).length;
  const slow = high.every((m) => m.plazo !== "corto");
  return `${slow ? `Las ${es(high.length)} de evidencia alta tardan (medio o largo plazo)` : `${es(high.length)} tienen evidencia alta`}; de las ${es(short.length)} de corto plazo, ${es(weak)} tienen evidencia media-baja o baja. El tamaño de cada burbuja, la población donde hace falta.`;
}

/** Monta la vista Medidas (Explorador) en `raiz`. El almacén de datos es el único de la aplicación. */
export async function montar(raiz, { store }) {
  const baja = []; // oyentes globales que hay que quitar al salir de la vista
  raiz.innerHTML = await (await fetch(new URL("./plantilla.html", import.meta.url))).text();
  const app = createApp(store);
  const { S, M } = app;
  const total = M.medidas.length;
  const score = scorer(store, { get weights() { return S.w; } });

  // ---------- cabecera de la vista (literales de js/medidas/index.js) ----------
  const ya = M.medidas.filter((m) => m.viabilidad === "instrumento_existente").length;
  $("#vista-cab").replaceChildren(
    el("h1", { text: "Las medidas, con los mismos criterios" }),
    el("p", { class: "sub" }, [el("b", { text: `${es(ya)} de ${es(total)}` }), " se pueden aplicar ya, sin cambiar ninguna ley. Ninguna tiene una nota única: cada criterio se ve aparte."]),
  );

  // ---------- navegación: dirección ↔ estado ----------
  const targetOf = (href) => {
    const [path, qs = ""] = href.replace(/^#/, "").split("?");
    const q = new URLSearchParams(qs), ids = app.idsOf(path.split("/")[1]);
    const mode = ids.length === 1 ? "ficha" : ids.length > 1 ? "comparar" : path.split("/")[1] === "alternativas" ? "alternativas" : q.get("vista") === "entender" ? "entender" : q.get("vista") === "comparar" ? "comparar" : "explorar";
    return { mode, ids, tab: q.get("tab"), l: q.get("l"), ld: q.get("ld") };
  };
  const goto = ({ mode, ids = [], tab, l, ld }) => {
    if (tab === "decide" || tab === "cadena") S.ent.tab = tab;
    if (l && Object.hasOwn(M.lineas, l)) S.ent.linea = l;
    if (ld && Object.hasOwn(M.lineas, ld)) S.ent.lineaD = ld;
    const next = app.toHash({ mode, ids });
    if (next === location.hash) render(); else location.hash = next;
  };
  // todo enlace interno a #medidas se resuelve con el contexto actual (filtros, pesos, selección)
  const alClic = (e) => {
    const a = e.target.closest?.("a[href^='#medidas']");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault();
    goto(targetOf(a.getAttribute("href")));
  };
  document.addEventListener("click", alClic);
  baja.push(() => document.removeEventListener("click", alClic));
  const syncUrl = () => { const h = app.toHash(); if (h !== location.hash) history.replaceState(null, "", h); };

  // ---------- selección y comparación ----------
  const isFull = () => S.sel.length >= MAX_SEL;
  const toggle = (id) => {
    const r = app.toggleSel(id);
    if (!r.ok) { announce(`Ya hay ${MAX_SEL} medidas en la comparación: quita una para añadir otra.`); return; }
    announce(`${r.added ? "Añadida" : "Quitada"} ${id} ${r.added ? "a" : "de"} la comparación (${S.sel.length} de ${MAX_SEL}).`);
    render({ keepFocus: true });
  };

  // ---------- panel contextual ----------
  let origin = null;
  const panel = crearPanel(store, {
    hrefFicha: (id) => `#medidas/${id}`,
    hrefEntender: (id, tab) => `#medidas?vista=entender&tab=${tab}&${tab === "decide" ? "ld" : "l"}=${store.measures[id].linea}`,
    onClose: () => closePanel(),
    onToggle: toggle, isFull, isSel: (id) => S.sel.includes(id),
    outside: (id) => !app.passes(store.measures[id]),
  });
  const openPanel = (id, from) => {
    origin = from ?? origin;
    S.focus = id;
    render();
    panel.node.querySelector("h2")?.focus();
    announce(`Ficha de ${id} abierta`);
  };
  const closePanel = () => {
    S.focus = null;
    render();
    (origin?.isConnected ? origin : null)?.focus();
    announce("Ficha cerrada");
  };
  const alTeclear = (e) => { if (e.key === "Escape" && S.focus && S.mode === "explorar" && !e.defaultPrevented && !$("#menu").open && !document.querySelector(".m-pop:not([hidden])")) { e.preventDefault(); closePanel(); } };
  document.addEventListener("keydown", alTeclear);
  baja.push(() => document.removeEventListener("keydown", alTeclear));

  // ---------- Plano y Matriz ----------
  const tip = el("div", { class: "tip", hidden: true });
  const plano = crearPlano(store, { onOpen: openPanel, onToggle: toggle, tip });
  const matriz = crearMatriz(store, { onOpen: openPanel, onToggle: toggle, isFull });

  const repHead = el("div", { class: "rep-cab" });
  const repH2 = el("h2", { id: "rep-t" });
  const repSub = el("p", { class: "sub" });
  const planoCaja = el("div", { class: "plano-caja" }, [el("div", { class: "burbujas-marco" }, [plano.node]), tip]);
  const leyenda = el("ul", { class: "leyenda-lineas", "aria-label": "Color de cada línea de actuación" }, Object.keys(M.lineas).map((k) => el("li", {}, [el("i", { style: `background:${LINE_COLORS[k]}`, "aria-hidden": "true" }), lineName(store, k)])));
  const pesosNota = el("p", { class: "note", "aria-live": "polite" });
  const matrizNotas = el("div", { class: "matriz-notas" }, [pesosNota, el("p", { class: "note" }, [pill("calculo"), " Evidencia: si ha funcionado en otros sitios, con la escala escrita en Método. Magnitud: el efecto que mide una evaluación o el resultado que mide un programa, con su fuente en la ficha; «sin evaluar» si no hay ninguno. Población: la de los municipios donde se propone. El papel de BM30 es una propuesta nuestra, por validar."])]);
  const vacio = el("div", { class: "vacio", role: "status" });
  const repBox = el("div", {}, [planoCaja, leyenda, matriz.node, matrizNotas]);
  $("#v-explorar").replaceChildren(el("div", { class: "m-stage" }, [repHead, el("div", { class: "rep-titulo" }, [repH2, repSub]), vacio, repBox]));

  // ---------- criterios (barra lateral) ----------
  const filtros = $("#filtros");
  const lineBtns = [["", "Todas"], ...Object.keys(M.lineas).map((k) => [k, lineName(store, k)])].map(([k, t]) => {
    const b = el("button", { type: "button", class: "opcion", "data-linea": k, style: k ? `--punto:${LINE_COLORS[k]}` : null, title: k ? M.lineas[k] : null }, [el("span", { class: "t", text: t }), el("span", { class: "n", "aria-hidden": "true" })]);
    b.addEventListener("click", () => { S.f.linea = k; render(); announce(`${visibleCount()} de ${total} medidas`); });
    return b;
  });
  const select = (key, label, all, entries) => {
    const s = el("select", { class: "select", id: `f-${key}` }, [el("option", { value: "", text: all }), ...entries.map(([k, v]) => el("option", { value: k, text: v }))]);
    s.addEventListener("change", () => { S.f[key] = s.value; render(); announce(`${visibleCount()} de ${total} medidas`); });
    return { s, node: el("div", { class: "campo" }, [el("label", { class: "field-label", for: s.id, text: label }), s]) };
  };
  const selects = { mecanismo: select("mecanismo", "Cómo actúa", "Todos", Object.entries(M.mecanismos)), decide: select("decide", "Quién decide", "Cualquiera", Object.entries(M.decide)), papel: select("papel", "Papel de BM30", "Cualquiera", Object.entries(M.papeles_bm30)) };
  const yaBtn = el("button", { type: "button", class: "opcion ancho", "aria-pressed": "false", text: "Solo las que se pueden aplicar ya" });
  yaBtn.addEventListener("click", () => { S.f.ya = !S.f.ya; render(); announce(`${visibleCount()} de ${total} medidas`); });
  const quitarFiltros = el("button", { type: "button", class: "btn-link", text: "Quitar filtros" });
  quitarFiltros.addEventListener("click", () => { S.f = emptyFilters(); render(); announce(`Sin filtros: ${total} de ${total} medidas`); });

  const weightGroups = WEIGHTS.map(([k, label]) => {
    const buttons = WEIGHT_WORDS.map((w, v) => {
      const b = el("button", { type: "button", class: "opcion", "aria-pressed": "false", text: w });
      b.addEventListener("click", () => { S.w = { ...S.w, [k]: v }; render(); });
      return b;
    });
    return { k, buttons, node: el("div", { class: "x-grupo", role: "group", "aria-label": label }, [el("span", { class: "x-etq", text: label }), el("div", { class: "x-botones", role: "group", "aria-label": label }, buttons)]) };
  });
  const quitarPesos = el("button", { type: "button", class: "btn-link", text: "Quitar los pesos" });
  quitarPesos.addEventListener("click", () => { S.w = Object.fromEntries(WEIGHTS.map(([k]) => [k, 0])); render(); announce("Sin pesos: orden original por línea de actuación"); });
  const pesosBox = el("section", { class: "pesos", "aria-labelledby": "pesos-t" }, [
    el("h2", { id: "pesos-t", class: "f-titulo", text: "Ordenar según tus prioridades" }),
    el("p", { class: "note", text: "Da más o menos peso a cada criterio y la tabla se ordena. El orden depende de lo que elijas: no mide el impacto de ninguna medida, que casi nunca se conoce en Bizkaia." }),
    ...weightGroups.map((g) => g.node), quitarPesos,
  ]);
  const pesosAviso = el("p", { class: "note pesos-aviso", "data-propuesta": "" });
  // cinta de criterios con revelado progresivo: la línea y «aplicables ya» a la vista; el resto, en dos desplegables
  const masBadge = el("span", { class: "n", "aria-hidden": "true" }), pesosBadge = el("span", { class: "n", "aria-hidden": "true" });
  const masBtn = el("button", { type: "button", class: "opcion", "aria-expanded": "false", "aria-controls": "m-mas", "aria-haspopup": "true" }, [el("span", { class: "t", text: "Más criterios" }), masBadge]);
  const masCaja = el("div", { class: "m-pop", id: "m-mas", hidden: true, role: "group", "aria-label": "Más criterios" }, [el("p", { class: "note", "data-propuesta": "", text: "Se aplican al Plano y a la Matriz." }), selects.mecanismo.node, selects.decide.node, selects.papel.node, quitarFiltros]);
  const pesosBtn = el("button", { type: "button", class: "opcion", "aria-expanded": "false", "aria-controls": "m-pesos", "aria-haspopup": "true" }, [el("span", { class: "t", text: "Prioridades" }), pesosBadge]);
  const pesosCaja = el("div", { class: "m-pop m-pop-pesos", id: "m-pesos", hidden: true, role: "group", "aria-label": "Ordenar según tus prioridades" }, [pesosBox]);
  const pesosWrap = el("div", { class: "m-pop-wrap" }, [pesosBtn, pesosCaja]);
  const pops = [[masBtn, masCaja], [pesosBtn, pesosCaja]];
  const cerrarPops = () => pops.forEach(([b, c]) => { c.hidden = true; b.setAttribute("aria-expanded", "false"); });
  pops.forEach(([b, c]) => b.addEventListener("click", () => { const abrir = c.hidden; cerrarPops(); c.hidden = !abrir; b.setAttribute("aria-expanded", String(abrir)); }));
  const alPulsar = (e) => { if (!e.target.closest?.(".m-pop-wrap")) cerrarPops(); };
  const alEscape = (e) => { if (e.key === "Escape" && pops.some(([, c]) => !c.hidden)) { e.preventDefault(); const abierto = pops.find(([, c]) => !c.hidden)[0]; cerrarPops(); abierto.focus(); } };
  document.addEventListener("pointerdown", alPulsar);
  document.addEventListener("keydown", alEscape);
  baja.push(() => { document.removeEventListener("pointerdown", alPulsar); document.removeEventListener("keydown", alEscape); });
  filtros.replaceChildren(
    el("div", { class: "m-lineas", role: "group", "aria-labelledby": "f-linea-t" }, [el("span", { class: "sr-only", id: "f-linea-t", text: "Línea de actuación" }), ...lineBtns]),
    el("div", { class: "m-ctrl" }, [yaBtn, el("div", { class: "m-pop-wrap" }, [masBtn, masCaja]), pesosWrap, pesosAviso]),
  );
  const visibleCount = () => app.visible().length;

  // ---------- Entender ----------
  const entender = crearEntender(store, { S, onChange: () => { render(); syncUrl(); }, hrefFicha: (id) => `#medidas/${id}` });
  $("#v-entender").replaceChildren(entender.node);

  // ---------- Comparar / ficha / alternativas ----------
  const chooser = (ids) => {
    const opts = (none) => [...(none ? [el("option", { value: "", text: "Ninguna" })] : []), ...M.medidas.map((m) => el("option", { value: m.id, text: `${m.id} ${m.nombre}` }))];
    const sels = [0, 1, 2].map((i) => { const s = el("select", { id: `cmp-${i}` }, opts(i === 2)); s.value = ids[i] ?? (i === 0 ? "M01" : i === 1 ? (ids[0] === "M06" ? "M01" : "M06") : ""); return s; });
    const go = el("a", { class: "btn primary", href: "#medidas" }, [el("span", { text: "Comparar" }), el("span", { "aria-hidden": "true", text: "→" })]);
    const sync = () => { go.href = `#medidas/${[...new Set(sels.map((s) => s.value).filter(Boolean))].join("-")}`; };
    sels.forEach((s) => s.addEventListener("change", sync));
    sync();
    return el("div", { class: "eligen", "data-control": "" }, [...sels.map((s, i) => el("div", { class: "campo" }, [el("label", { for: s.id, class: "field-label", text: i === 2 ? "Y una tercera" : `Medida ${i + 1}` }), s])), el("p", {}, [go])]);
  };
  const compApi = { hrefFicha: (id) => `#medidas/${id}`, onRemove: (id) => {
    S.sel = S.sel.filter((x) => x !== id);
    announce(`Quitada ${id} de la comparación`);
    // con una sola medida, #medidas/M20 sería su ficha: se vuelve al selector de comparación, con la que queda elegida
    goto({ mode: "comparar", ids: S.sel.length > 1 ? S.sel : [] });
  } };
  const renderComparar = () => {
    const box = $("#v-comparar");
    if (S.cmp.length > 1) {
      const copy = el("button", { type: "button", class: "btn", "data-propuesta": "", text: "Copiar enlace de la comparación" });
      copy.addEventListener("click", async () => {
        const url = location.href;
        try { await navigator.clipboard.writeText(url); copy.textContent = "Enlace copiado"; announce("Enlace copiado"); } catch { copy.textContent = "Selecciona y copia la dirección del navegador"; }
      });
      box.replaceChildren(
        el("p", {}, [el("a", { class: "volver", href: "#medidas", text: "← Todas las medidas" })]),
        el("h2", { class: "vista-titulo", text: "Medidas lado a lado" }),
        el("div", { class: "panel-acciones" }, [copy]),
        crearComparar(store, S.cmp.map((id) => store.measures[id]), compApi),
        el("section", { class: "sec-comp" }, [el("h3", { text: "Cambia la comparación" }), chooser(S.cmp)]),
      );
    } else {
      const note = el("p", { class: "note", "data-propuesta": "", text: S.sel.length === 1 ? "Elige una segunda medida (y, si quieres, una tercera) para compararlas lado a lado." : "Elige dos o tres medidas para compararlas lado a lado. También puedes añadirlas desde el Plano o la Matriz." });
      box.replaceChildren(el("h2", { class: "vista-titulo", text: "Dos o tres, lado a lado" }), note, chooser(S.sel));
    }
  };
  const renderFicha = () => {
    const m = store.measures[S.ficha];
    $("#v-ficha").replaceChildren(fichaCompleta(store, m, { hrefExplorar: () => "#medidas", hrefEntender: (id, tab) => `#medidas?vista=entender&tab=${tab}&${tab === "decide" ? "ld" : "l"}=${store.measures[id].linea}`, onToggle: toggle, isFull, isSel: (id) => S.sel.includes(id) }),
      el("section", { class: "sec-comp" }, [el("h3", { text: "Compárala con otras" }), chooser([m.id])]));
  };
  $("#v-alternativas").replaceChildren(
    el("h2", { class: "vista-titulo", id: "alt-t", text: "Las alternativas estudiadas" }),
    el("p", { class: "sub", text: "Ideas que se analizaron y por qué no están entre las 34." }),
    el("div", {}, alternatives(store)),
  );

  // ---------- bandeja de comparación ----------
  const bandeja = $("#bandeja");
  const renderBandeja = () => {
    const show = S.sel.length > 0 && !(S.mode === "comparar" && S.cmp.length > 1);
    bandeja.hidden = !show;
    document.body.classList.toggle("con-bandeja", show);
    if (!show) return;
    const chips = S.sel.map((id) => {
      const m = store.measures[id], out = !app.passes(m);
      const rm = el("button", { type: "button", class: "chip-quitar", "aria-label": `Quitar ${id} de la comparación` }, [el("span", { "aria-hidden": "true", text: "×" })]);
      rm.addEventListener("click", () => toggle(id));
      const open = el("a", { class: "chip-medida", href: `#medidas/${id}`, title: "Abrir su ficha completa" }, [el("span", { class: "medida-id", style: `--linea:${LINE_COLORS[m.linea]}`, text: id }), el("span", { class: "chip-nombre", text: m.nombre })]);
      return el("li", { class: out ? "fuera" : "" }, [open, out ? el("span", { class: "chip-fuera", "data-propuesta": "", text: "fuera de los criterios activos" }) : null, rm]);
    });
    const ready = S.sel.length >= 2;
    const cmp = el("a", { class: `btn primary${ready ? "" : " off"}`, href: ready ? `#medidas/${S.sel.join("-")}` : "#medidas", "aria-disabled": ready ? null : "true", "aria-describedby": "bandeja-nota" }, [el("span", { text: "Comparar medidas" }), el("span", { "aria-hidden": "true", text: "→" })]);
    if (!ready) cmp.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); announce("Elige al menos dos medidas para comparar."); }, true);
    bandeja.replaceChildren(
      el("p", { class: "bandeja-t", "data-propuesta": "" }, [el("b", { text: `${S.sel.length} de ${MAX_SEL}` }), " para comparar"]),
      el("ul", { class: "bandeja-lista", "aria-label": "Medidas elegidas para comparar" }, chips),
      el("p", { class: "bandeja-nota", id: "bandeja-nota", "data-propuesta": "", text: S.sel.length >= MAX_SEL ? "Máximo: quita una para añadir otra." : ready ? "Puedes añadir una tercera." : "Elige al menos dos." }),
      cmp,
    );
  };

  // ---------- render: un único punto que pinta todo desde el estado ----------
  const MODE_NAMES = { explorar: "Explorar", entender: "Entender", comparar: "Comparar", alternativas: "Alternativas" };
  const modeOf = () => (S.mode === "ficha" ? "explorar" : S.mode);
  const tabsBox = $("#modos");
  tabsBox.replaceChildren(...Object.keys(MODE_NAMES).map((k) => {
    const href = k === "alternativas" ? "#medidas/alternativas" : k === "explorar" ? "#medidas" : `#medidas?vista=${k}`;
    const a = el("a", { class: "modo", href, "data-modo": k, "data-propuesta": "", text: MODE_NAMES[k] });
    return a;
  }));
  const repBtns = ["plano", "matriz"].map((k) => {
    const b = el("button", { type: "button", class: "opcion rep", "aria-pressed": "false", "data-rep": k, text: k === "plano" ? "Plano" : "Matriz" });
    b.addEventListener("click", () => { S.rep = k; render(); announce(`${b.textContent}: ${visibleCount()} de ${total} medidas`); });
    return b;
  });
  const cuenta = el("p", { class: "cuenta", "aria-live": "polite" });
  const chipsBox = el("ul", { class: "chips-filtro", "aria-label": "Criterios activos" });
  repHead.append(el("div", { class: "rep-toggle", role: "group", "aria-label": "Representación" }, repBtns), cuenta, chipsBox);

  function visibleSet() { return new Set(app.visible().map((m) => m.id)); }

  function render({ keepFocus = false } = {}) {
    const activeKey = keepFocus ? document.activeElement?.closest?.("[data-sel],button[aria-pressed]")?.dataset?.sel : null;
    const mode = modeOf();
    // vistas
    ["explorar", "entender", "comparar", "ficha", "alternativas"].forEach((k) => { $(`#v-${k}`).hidden = k !== S.mode; });
    tabsBox.querySelectorAll(".modo").forEach((a) => { const on = a.dataset.modo === mode; if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    $("#cabecera-modos").hidden = false;
    const explorar = S.mode === "explorar";
    $("#filtros").hidden = !explorar;
    $(".shell").dataset.detalle = explorar && S.focus ? "abierto" : "cerrado";
    $(".shell").dataset.modo = S.mode;

    if (explorar) {
      const vis = app.visible(), set = new Set(vis.map((m) => m.id)), sel = new Set(S.sel);
      // criterios
      lineBtns.forEach((b) => {
        b.setAttribute("aria-pressed", String(b.dataset.linea === S.f.linea));
        const k = b.dataset.linea, n = M.medidas.filter((m) => app.passes(m, { ...S.f, linea: k })).length; // cuántas quedarían con esa línea y los demás criterios
        b.querySelector(".n").textContent = String(n);
        b.setAttribute("aria-label", `${k ? lineName(store, k) : "Todas"}, ${n} medidas`);
      });
      const nMas = ["mecanismo", "decide", "papel"].filter((k) => S.f[k]).length;
      masBadge.textContent = nMas ? String(nMas) : "";
      pesosBadge.className = `n pto${app.weighted() ? " on" : ""}`; // punto: hay pesos activos
      Object.entries(selects).forEach(([k, f]) => { f.s.value = S.f[k]; });
      yaBtn.setAttribute("aria-pressed", String(S.f.ya));
      quitarFiltros.hidden = !app.filtersActive();
      weightGroups.forEach((g) => g.buttons.forEach((b, v) => b.setAttribute("aria-pressed", String(S.w[g.k] === v))));
      pesosWrap.hidden = S.rep !== "matriz";
      pesosAviso.hidden = S.rep === "matriz" || !app.weighted();
      pesosAviso.textContent = "Hay pesos activos: afectan al orden de la Matriz.";
      quitarPesos.hidden = !app.weighted();
      // cabecera de la representación
      repBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.rep === S.rep)));
      cuenta.replaceChildren(el("b", { text: `${es(vis.length)} de ${es(total)}` }), " medidas");
      chipsBox.replaceChildren(...[
        S.f.linea ? ["linea", lineName(store, S.f.linea)] : null, S.f.mecanismo ? ["mecanismo", M.mecanismos[S.f.mecanismo]] : null,
        S.f.decide ? ["decide", M.decide[S.f.decide]] : null, S.f.papel ? ["papel", M.papeles_bm30[S.f.papel]] : null, S.f.ya ? ["ya", "Solo las que se pueden aplicar ya"] : null,
      ].filter(Boolean).map(([k, t]) => {
        const rm = el("button", { type: "button", class: "chip-quitar", "aria-label": `Quitar el criterio ${t}` }, [el("span", { "aria-hidden": "true", text: "×" })]);
        rm.addEventListener("click", () => { S.f[k] = k === "ya" ? false : ""; render(); });
        return el("li", { class: "chip" }, [NO_FILTER_LABEL[k] ? `${NO_FILTER_LABEL[k]}: ${t}` : t, rm]);
      }));
      const [title, sub] = SUB[S.rep];
      repH2.textContent = title;
      repSub.textContent = sub ?? planoSub(M);
      const empty = vis.length === 0;
      vacio.hidden = !empty;
      if (empty) {
        const b = el("button", { type: "button", class: "btn primary", text: "Quitar filtros" });
        b.addEventListener("click", () => { S.f = emptyFilters(); render(); });
        vacio.replaceChildren(el("p", {}, [el("b", { text: `0 de ${es(total)} medidas` })]), el("p", { "data-propuesta": "", text: "Ninguna medida cumple a la vez todos los criterios activos. Las 34 siguen ahí: quita algún criterio para volver a verlas." }), b);
      }
      repBox.hidden = empty;
      planoCaja.hidden = leyenda.hidden = S.rep !== "plano" || empty;
      matriz.node.hidden = matrizNotas.hidden = S.rep !== "matriz" || empty;
      plano.update({ visible: set, sel, focus: S.focus });
      const { weighted, list } = ordered(M, vis, score);
      matriz.update({ list, weighted, sel, focus: S.focus });
      pesosNota.textContent = `${vis.length} de ${total} medidas. ${weighted ? "Ordenadas según los pesos que has elegido." : "Agrupadas por línea de actuación: da peso a algún criterio para ordenarlas."}`;
      // ficha: panel lateral persistente con la lista de las medidas a la vista
      panel.node.hidden = !S.focus;
      if (S.focus) panel.render(S.focus);
      side.hidden = false;
      resumen.hidden = Boolean(S.focus);
      resumenCuenta.textContent = `${es(vis.length)} de ${es(total)} medidas`;
      resumenYa.textContent = `${es(vis.filter((m) => m.viabilidad === "instrumento_existente").length)} se pueden aplicar ya`;
      lista.update({ list, weighted, sel, focus: S.focus });
    } else {
      panel.node.hidden = true; side.hidden = true;
    }
    if (S.mode === "entender") entender.render(S.focus);
    if (S.mode === "comparar") renderComparar();
    if (S.mode === "ficha") renderFicha();
    renderBandeja();
    document.title = `${MODE_NAMES[mode]} · Medidas · Vivienda en Bizkaia (prototipo integrado)`;
    syncUrl();
    if (activeKey) document.querySelector(`[data-sel="${activeKey}"]`)?.focus();
    else if (keepFocus && S.focus) panel.node.querySelector("button[aria-pressed]")?.focus();
  }

  // ---------- composición: escenario + panel lateral con la lista ----------
  const lista = crearLista({ onOpen: openPanel, onToggle: toggle, isFull });
  const resumenCuenta = el("p", { class: "m-resumen-cifra" }), resumenYa = el("p", { class: "m-resumen-sub" });
  const resumen = el("div", { class: "m-resumen" }, [el("p", { class: "ficha-rotulo", "data-propuesta": "", text: "El conjunto a la vista" }), resumenCuenta, resumenYa,
    el("p", { class: "m-resumen-pista", "data-propuesta": "", text: "Elige una medida en el Plano, en la tabla o en la lista para ver su ficha." })]);
  const side = el("aside", { class: "m-side", "aria-label": "Medida elegida y lista de medidas" }, [resumen, panel.node, lista.node]);
  $(".shell").append(side);

  // ---------- arranque y cambios de dirección ----------
  const onHash = () => {
    if (!app.fromHash(location.hash)) { history.replaceState(null, "", "#medidas"); app.fromHash("#medidas"); }
    render();
    window.scrollTo(0, 0); // cada modo es una pestaña propia, no una sección de una página larga: se empieza arriba
  };
  onHash(); // los cambios de dirección los avisa el router de la aplicación (alCambiarDireccion)
  // ayuda para capturas y revisión: ?abrir=M10 abre el panel contextual de esa medida al cargar (no forma parte de la URL de la web)
  const abrir = new URLSearchParams(location.search).get("abrir");
  if (abrir && Object.hasOwn(store.measures, abrir) && S.mode === "explorar") { openPanel(abrir); }
  $("#medidas").setAttribute("aria-busy", "false");
  window.__medidas = { app, store, S, render, goto, openPanel, closePanel, toggle, plano, matriz, score, ordered }; // solo para las pruebas de _qa
  return { alCambiarDireccion: onHash, desmontar: () => { baja.forEach((f) => f()); document.body.classList.remove("con-bandeja"); delete window.__medidas; } };
}
