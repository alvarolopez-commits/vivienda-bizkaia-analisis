// Indicadores (fase 15, pieza 4): el catálogo y la ficha de cada indicador, generada desde el catálogo (catalogo.json):
// qué mide, cómo se calcula, fuente y frecuencia, su serie, su mapa por municipio, cómo se reparte entre municipios y su
// umbral. Los indicadores clave llevan además su semáforo; los de contexto, solo el dato.
import { animate, announce } from "./comun.js";
import { lineChart, stripChart } from "./graficos.js";
import { colorOf, quintiles, scaleLegend, svgMap } from "./mapa.js";
import { LABELS, capital, changeText, csv, download, el, es, isNum, kpiCell, labelTag, periodLabel, ruleText, sourcesLine, stateTag, unitOf } from "./ui.js";

const lastOf = (ind) => [...ind.serie].reverse().find(([, v]) => isNum(v)) ?? null;
const fmtOf = (ind) => (v) => `${es(v, ind.decimales)} ${unitOf(ind.unidad)}`;

// ---------- el catálogo ----------

function catalogList(store, root) {
  const st = { d: "clave", q: "" };
  const body = el("tbody");
  const count = el("p", { class: "nota", "aria-live": "polite" });
  const dims = [["clave", "Clave"], ["", "Todos"], ...store.catalogo.dimensiones.map((d) => [d.id, d.nombre])];
  const buttons = dims.map(([id, text]) => {
    const b = el("button", { type: "button", class: "opcion", "aria-pressed": "false", text });
    b.addEventListener("click", () => { location.hash = id === "clave" ? "#indicadores" : `#indicadores?d=${id || "todos"}`; });
    return b;
  });
  const search = el("input", { type: "search", placeholder: "Buscar un indicador", "aria-label": "Buscar un indicador" });
  search.addEventListener("input", () => { st.q = search.value.trim().toLowerCase(); draw(); });
  const draw = () => {
    buttons.forEach((b, i) => b.setAttribute("aria-pressed", String(dims[i][0] === st.d)));
    const rows = store.catalogo.indicadores.filter((i) => (st.q ? i.nombre.toLowerCase().includes(st.q) : st.d === "clave" ? i.clave : !st.d || i.dimension === st.d));
    body.replaceChildren(...rows.map((i) => {
      const last = i.clave ? [i.actual.periodo, i.actual.valor] : lastOf(i);
      return el("tr", {}, [
        el("th", { scope: "row" }, [el("a", { href: `#indicadores/${i.id}`, text: i.nombre }), i.clave ? el("span", { class: "clave", text: "Clave" }) : null]),
        el("td", { text: store.dims[i.dimension]?.nombre ?? "" }),
        el("td", { class: "n" }, last && isNum(last[1]) ? [es(last[1], i.decimales), el("span", { class: "u", text: ` ${unitOf(i.unidad)}` })] : [el("span", { class: "guion", text: "sin dato" })]),
        el("td", { text: last ? periodLabel(last[0]) : "" }),
        el("td", {}, [labelTag(i.etiqueta)]),
        el("td", {}, [i.clave ? stateTag(i.actual.estado, store.catalogo.estados[i.actual.estado]) : el("span", { class: "guion", text: "sin semáforo" })]),
      ]);
    }));
    count.textContent = `${rows.length} de ${store.catalogo.indicadores.length} indicadores.`;
  };
  const node = el("div", { class: "catalogo" }, [
    el("div", { class: "filtros" }, [el("div", { class: "opciones", role: "group", "aria-label": "Dimensión" }, buttons), el("label", { class: "campo buscar" }, [search])]),
    count,
    el("div", { class: "tabla-caja" }, [el("table", { class: "tabla tabla-catalogo" }, [
      el("caption", { class: "sr-only", text: "Catálogo de indicadores" }),
      el("thead", {}, [el("tr", {}, ["Indicador", "Dimensión", "Último dato", "Periodo", "Tipo de dato", "Semáforo"].map((h, i) => el("th", { scope: "col", class: i === 2 ? "n" : null, text: h })))]),
      body])]),
  ]);
  return { node, set(d) { st.d = d === "todos" ? "" : Object.hasOwn(store.dims, d ?? "") ? d : "clave"; draw(); } };
}

// ---------- la ficha ----------

/** Una tabla plegada con los mismos datos que un gráfico o un mapa: se lee sin verlo y la encuentra el lector de pantalla. */
function dataTable(summary, head, rows) {
  return el("details", { class: "datos-tabla" }, [el("summary", { text: summary }), el("div", { class: "tabla-caja" }, [el("table", { class: "tabla" }, [
    el("thead", {}, [el("tr", {}, head.map((h, i) => el("th", { scope: "col", class: i ? "n-cab" : null, text: h })))]),
    el("tbody", {}, rows.map(([a, b]) => el("tr", {}, [el("th", { scope: "row", text: a }), el("td", { class: "n", text: b })]))),
  ])])]);
}

function kpiStrip(ind, store) {
  const cells = [];
  if (ind.clave) {
    const a = ind.actual, cal = store.calendar[ind.calendario];
    cells.push(["Último dato", [el("span", { class: "kpi-valor", text: es(a.valor, ind.decimales) }), el("span", { class: "kpi-unidad", text: ` ${unitOf(ind.unidad)}` })], periodLabel(a.periodo)]);
    cells.push(["Frente al anterior", [stateTag(a.estado, store.catalogo.estados[a.estado])], changeText(ind)]);
    cells.push(["Próximo dato", [el("span", { class: "kpi-texto", text: cal?.proxima ?? "sin fecha" })], cal ? cal.periodicidad : ""]);
  } else {
    const last = lastOf(ind);
    cells.push([`Último dato · ${ind.ambito}`, last ? [el("span", { class: "kpi-valor", text: es(last[1], ind.decimales) }), el("span", { class: "kpi-unidad", text: ` ${unitOf(ind.unidad)}` })] : [el("span", { class: "guion", text: "sin dato" })], last ? periodLabel(last[0]) : ""]);
  }
  const m = ind.municipal ?? (ind.mapa ? store.ind[ind.mapa]?.municipal : null);
  if (m) {
    const p = m.periodos.at(-1), n = Object.values(m.valores).filter((v) => isNum(v[p])).length;
    cells.push([`${capital(store.territorio.unidad.varias)} con dato`, [el("span", { class: "kpi-valor", text: es(n) }), el("span", { class: "kpi-unidad", text: ` de ${Object.keys(store.territorio.municipios).length}` })], periodLabel(p)]);
  }
  return el("div", { class: "kpi-tira entra" }, cells.map(([label, value, foot]) => kpiCell(label, value, foot)));
}

function aboutWell(ind, store) {
  const map = ind.mapa ? store.ind[ind.mapa] : null;
  const threshold = ind.umbral ?? map?.umbral;
  const kv = (rows) => el("dl", {}, rows.filter((r) => r && r[1]).map(([k, v]) => el("div", { class: "fila-kv" }, [el("dt", { text: k }), el("dd", { text: v })])));
  const cal = ind.clave ? store.calendar[ind.calendario] : null;
  return el("div", { class: "pozo" }, [
    kv([["Ámbito", ind.ambito], ["Tipo de dato", LABELS[ind.etiqueta]], ind.clave ? ["Regla del semáforo", ruleText(ind)] : null,
      threshold ? [threshold.tipo === "meta" ? "Meta" : "Umbral", threshold.texto] : null,
      cal ? ["Frecuencia", `${cal.periodicidad}. Último publicado: ${cal.ultimo}.`] : null]),
    ind.como_se_calcula || ind.como_leer || ind.sin_dato || ind.nota ? el("details", { class: "pozo-mas" }, [el("summary", { text: "Cómo se calcula y notas" }),
      kv([["Cómo se calcula", ind.como_se_calcula], ["Cómo leerlo", ind.como_leer], ["Cuando no hay dato", ind.sin_dato], ["Nota", ind.nota]])]) : null,
    el("div", { class: "pozo-pie" }, [sourcesLine(ind.fuentes)]),
  ]);
}

function seriesCard(ind) {
  const xs = ind.serie.map(([p]) => p);
  const t = ind.umbral;
  return el("section", { class: "carta entra", "aria-labelledby": "f-serie" }, [
    el("div", { class: "carta-cab" }, [el("h2", { id: "f-serie", text: `En el tiempo · ${ind.ambito}` })]),
    xs.length > 1 ? lineChart({ xs, series: [{ nombre: ind.nombre, valores: ind.serie.map(([, v]) => v) }], alto: 230, etiqueta: `Serie de ${ind.nombre} en ${ind.ambito}`,
      fmtTip: fmtOf(ind), fmt: (v) => es(v, ind.decimales), umbral: t ? { ...t, corto: `${t.tipo === "meta" ? "Meta" : "Umbral"}: ${es(t.valor)}` } : null })
      : el("p", { class: "nota", text: xs.length ? `Un solo dato publicado (${periodLabel(xs[0])}): la serie empezará con el próximo.` : "Sin serie para el conjunto del territorio." }),
    xs.length > 1 ? dataTable("Ver la serie en una tabla", ["Periodo", ind.nombre], ind.serie.map(([p, v]) => [periodLabel(p), isNum(v) ? fmtOf(ind)(v) : "sin dato"])) : null,
  ]);
}

/** El mapa y el reparto entre municipios, con botones de periodo y la descarga de los datos. */
function municipalCard(ind, store) {
  const src = ind.municipal ? ind : ind.mapa ? store.ind[ind.mapa] : null;
  if (!src?.municipal) {
    return el("section", { class: "carta entra" }, [el("h2", { text: `Por ${store.territorio.unidad.una}` }),
      el("p", { class: "nota", text: `No hay dato por ${store.territorio.unidad.una}: la fuente solo lo publica para ${ind.ambito}.` })]);
  }
  const m = src.municipal, periods = m.periodos.filter((p) => Object.values(m.valores).some((v) => isNum(v[p]))).slice(-6);
  const fmt = fmtOf(src);
  const st = { p: periods.at(-1) };
  const mapBox = el("div", { class: "mapa" }), legend = el("div"), strip = el("div"), note = el("p", { class: "nota" }), table = el("div");
  const valueOf = (code) => m.valores[code]?.[st.p] ?? null;
  const map = svgMap(store.geo, { paint: () => "#fff", label: `Mapa de ${src.nombre} por ${store.territorio.unidad.una}`,
    tip: (code) => ({ title: store.name(code), lines: [isNum(valueOf(code)) ? fmt(valueOf(code)) : "sin dato"] }) });
  mapBox.append(map.svg);
  const draw = () => {
    const vals = Object.keys(store.territorio.municipios).map(valueOf);
    const cuts = quintiles(vals);
    map.repaint((code) => colorOf(valueOf(code), cuts));
    legend.replaceChildren(scaleLegend(cuts, (v) => es(v, src.decimales)));
    const pts = Object.keys(store.territorio.municipios).filter((c) => isNum(valueOf(c))).map((c) => ({ code: c, nombre: store.name(c), v: valueOf(c) }));
    strip.replaceChildren(stripChart({ puntos: pts, fmt, umbral: src.umbral, etiqueta: `Reparto de ${src.nombre} entre los ${store.territorio.unidad.varias}` }));
    const over = src.umbral ? pts.filter((p) => p.v > src.umbral.valor).length : null;
    const top = [...pts].sort((a, b) => b.v - a.v).slice(0, 3).map((p) => `${p.nombre} (${fmt(p.v)})`).join(", ");
    note.textContent = `${es(pts.length)} ${store.territorio.unidad.varias} con dato en ${periodLabel(st.p)}.${isNum(over) ? ` ${es(over)} pasan del umbral.` : ""}${top ? ` Los más altos: ${top}.` : ""}`;
    table.replaceChildren(dataTable(`Ver los ${store.territorio.unidad.varias} en una tabla (${periodLabel(st.p)})`, [capital(store.territorio.unidad.una), src.nombre],
      [...pts].sort((a, b) => b.v - a.v).map((p) => [p.nombre, fmt(p.v)])));
  };
  const buttons = periods.map((p) => {
    const b = el("button", { type: "button", class: "opcion", "aria-pressed": String(p === st.p), text: periodLabel(p) });
    b.addEventListener("click", () => { st.p = p; buttons.forEach((o) => o.setAttribute("aria-pressed", String(o === b))); draw(); announce(note.textContent, 250); });
    return b;
  });
  const save = el("button", { type: "button", class: "boton", text: "Descargar CSV" });
  save.addEventListener("click", () => download(`${src.id}.csv`, csv([[store.territorio.unidad.una, "código", ...m.periodos.map(periodLabel)],
    ...Object.keys(store.territorio.municipios).map((c) => [store.name(c), c, ...m.periodos.map((p) => m.valores[c]?.[p] ?? "")])])));
  draw();
  return el("section", { class: "carta entra municipal", "aria-labelledby": "f-muni" }, [
    el("div", { class: "carta-cab" }, [el("h2", { id: "f-muni", text: src === ind ? `Por ${store.territorio.unidad.una}` : `Por ${store.territorio.unidad.una}: ${src.nombre.toLowerCase()}` }), save]),
    ind.mapa_nota ? el("p", { class: "nota", text: ind.mapa_nota }) : null,
    periods.length > 1 ? el("div", { class: "opciones", role: "group", "aria-label": "Periodo" }, buttons) : null,
    el("div", { class: "municipal-rejilla" }, [el("figure", { class: "municipal-mapa" }, [mapBox, legend]), el("div", { class: "municipal-reparto" }, [el("h3", { text: "Cómo se reparte" }), strip, note, table])]),
    src !== ind ? sourcesLine(src.fuentes, "Fuente del mapa") : null,
  ]);
}

function ficha(ind, store) {
  return el("div", { class: "ficha" }, [
    kpiStrip(ind, store),
    el("div", { class: "ficha-rejilla" }, [seriesCard(ind), aboutWell(ind, store)]),
    municipalCard(ind, store),
  ]);
}

export function renderIndicadores(root, store) {
  const list = catalogList(store, root);
  const body = root.querySelector("[data-cuerpo]");
  const keyN = store.catalogo.indicadores.filter((i) => i.clave).length;
  let current = null;
  return {
    head() {
      if (!current) return { sub: `${keyN} indicadores clave con semáforo y ${store.catalogo.indicadores.length - keyN} de contexto, cada uno con su ficha.` };
      const ind = store.ind[current];
      return { title: ind.nombre, crumb: { href: "#indicadores", text: "Indicadores" },
        sub: [ind.que_mide, " ", store.dims[ind.dimension] ? el("span", { class: "nota", text: `Dimensión: ${store.dims[ind.dimension].nombre}.` }) : null] };
    },
    show(id, params) {
      if (id && Object.hasOwn(store.ind, id)) {
        current = id;
        body.replaceChildren(ficha(store.ind[id], store));
        animate(body);
        return;
      }
      current = null;
      if (!body.contains(list.node)) body.replaceChildren(list.node);
      list.set(params?.d ?? "");
    },
  };
}
