// Situación (fase 15, pieza 4): cómo estamos. Arriba, la escena de entrada: el territorio con sus alertas, que se levanta
// tipo a tipo al bajar, con la lectura por dimensión al lado. Después, el cuadro de mando: los indicadores clave en sus
// dimensiones; al elegir uno, su serie, su regla y su próximo dato. Al final, la lista de alertas por municipio.
import { announce } from "./comun.js";
import { lineChart } from "./graficos.js";
import { NODATA, svgMap } from "./mapa.js";
import { newState, territory3d } from "./territorio3d.js";
import { capital, changeText, el, es, extLink, isNum, jumpTo, labelTag, periodLabel, ruleText, sourcesLine, stateTag, unitOf } from "./ui.js";

const ALERT_COLORS = ["#b4545b", "#1a4d7a", "#5d6d1f", "#86bfc6", "#c08a2d", "#4d5a6a", "#d0878c", "#2e7d76"];
const PLURAL = { empeora: ["empeora", "empeoran"], mejora: ["mejora", "mejoran"], estable: ["estable", "estables"], cambia: ["cambia", "cambian"], primer_dato: ["sin dato anterior", "sin dato anterior"] };

const PAGE = 4; // municipios de la lista de alertas antes de «Ver todos»
const keys = (store) => store.catalogo.indicadores.filter((i) => i.clave);
const countText = (n, state) => `${n} ${PLURAL[state]?.[n === 1 ? 0 : 1] ?? state}`;

/** La frase de arriba: cuántos indicadores empeoran y cuántos municipios tienen alguna alerta. */
function finding(store) {
  const ks = keys(store), worse = ks.filter((k) => k.actual.estado === "empeora").length;
  const munis = Object.keys(store.alertas.municipios).length, total = Object.keys(store.territorio.municipios).length;
  return [el("strong", { text: `${worse} de ${ks.length} indicadores clave empeoran` }), " frente a su periodo anterior. ",
    el("strong", { text: `${munis} de ${total} ${store.territorio.unidad.varias}` }), " tienen alguna alerta."];
}

/** La lectura conjunta: en cada dimensión, cuántos indicadores empeoran, mejoran o siguen igual (sin índice único). */
function reading(store) {
  return el("ul", { class: "lectura" }, store.catalogo.dimensiones.map((d) => {
    const ks = keys(store).filter((k) => k.dimension === d.id);
    const by = ks.reduce((n, k) => ({ ...n, [k.actual.estado]: (n[k.actual.estado] ?? 0) + 1 }), {});
    return el("li", {}, [
      el("a", { href: `#indicadores?d=${d.id}`, class: "lectura-nombre", text: d.nombre }),
      el("span", { class: "lectura-estados" }, Object.entries(by).map(([st, n]) => stateTag(st, countText(n, st)))),
    ]);
  }));
}

// ---------- la escena: el territorio con sus alertas ----------

function alertLayers(store) {
  const a = store.alertas, types = Object.keys(a.tipos), munis = store.territorio.municipios;
  const maxPop = Math.max(...Object.values(munis).map((m) => m.poblacion));
  const has = (code, t) => (a.municipios[code] ?? []).filter((x) => x.tipo === t);
  const count = (code) => (a.municipios[code] ?? []).length;
  const maxCount = Math.max(1, ...Object.keys(munis).map(count));
  const gravest = (code) => { const list = a.municipios[code] ?? []; const g = list.find((x) => x.grave) ?? list[0]; return g ? ALERT_COLORS[types.indexOf(g.tipo) % ALERT_COLORS.length] : null; };
  return [
    { color: () => null, height: (c) => 0.06 + 0.3 * Math.sqrt((munis[c]?.poblacion ?? 0) / maxPop) },
    { color: gravest, height: (c) => (count(c) ? 0.2 + 0.8 * (count(c) / maxCount) : 0.02) },
    ...types.map((t, i) => ({ color: (c) => (has(c, t).length ? ALERT_COLORS[i % ALERT_COLORS.length] : null),
      height: (c) => (has(c, t).length ? (has(c, t).some((x) => x.grave) ? 1 : 0.6) : 0.02) })),
  ];
}

function steps(store) {
  const a = store.alertas, types = Object.keys(a.tipos), unit = store.territorio.unidad;
  const names = (codes) => codes.slice(0, 4).map((c) => store.name(c)).join(", ") + (codes.length > 4 ? ` y ${codes.length - 4} más` : "");
  const all = Object.keys(a.municipios).sort((x, y) => a.municipios[y].length - a.municipios[x].length);
  const grave = all.filter((c) => a.municipios[c].some((x) => x.grave)).length;
  return [
    { n: all.length, titulo: `${unit.varias} con alguna alerta`, texto: `${grave} con alguna alerta grave.`, lista: names(all) },
    ...types.map((t, i) => {
      const codes = all.filter((c) => a.municipios[c].some((x) => x.tipo === t)).sort((x, y) => Number(a.municipios[y].some((z) => z.tipo === t && z.grave)) - Number(a.municipios[x].some((z) => z.tipo === t && z.grave)));
      // en la escena, la primera frase de la regla; la regla entera está en Metodología
      const why = (a.explicaciones?.[t] ?? "").split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚ])/)[0];
      return { n: codes.length, titulo: a.tipos[t], texto: why, lista: codes.length ? names(codes) : "Ninguno.", color: ALERT_COLORS[i % ALERT_COLORS.length] };
    }),
  ];
}

const sceneState = { current: null };

function scene(store) {
  const list = steps(store);
  const host = el("div", { class: "terr" });
  const panel = el("div", { class: "pasos" }, [
    el("div", { class: "paso paso-lectura", "data-paso": "lectura" }, [el("h2", { class: "paso-titulo", text: "Cómo está cada dimensión" }), reading(store)]),
    ...list.map((s, i) => el("div", { class: "paso", "data-paso": String(i) }, [
      el("p", { class: "paso-num" }, [el("span", { class: "muestra", style: `background:${s.color ?? "var(--ink)"}`, "aria-hidden": "true" }), el("span", { class: "kpi-valor", text: es(s.n) })]),
      el("h3", { class: "paso-titulo", text: s.titulo }),
      s.texto ? el("p", { class: "paso-texto", text: s.texto }) : null,
      el("p", { class: "paso-lista", text: s.lista }),
    ])),
  ]);
  const legend = el("ul", { class: "leyenda-cat leyenda-alertas", "aria-label": "Tipos de alerta" }, Object.values(store.alertas.tipos).map((t, i) =>
    el("li", {}, [el("span", { class: "muestra", style: `background:${ALERT_COLORS[i % ALERT_COLORS.length]}`, "aria-hidden": "true" }), t])));
  const section = el("section", { class: "scene escena-alertas", "aria-label": "El territorio con sus alertas" }, [
    el("div", { class: "scene-stage" }, [el("div", { class: "escena-rejilla" }, [panel, el("figure", { class: "terr-caja" }, [host, legend])])]),
  ]);
  return { section, host, n: list.length };
}

/** Registra la escena «alertas» en el escenario de taste: el panel pasa de la lectura a cada tipo y el mapa le sigue. */
function registerScene(n) {
  if (!window.Scenes) window.Scenes = {};
  Scenes.alertas = (root) => Stage.scene(root, {
    hold: 3, scrub: 0.6, phone: "rest",
    build(tl, { q }) {
      const S = sceneState.current;
      const parts = q(".paso");
      // si la escena no cabe en la pantalla (una tableta apaisada baja), queda en reposo: todo a la vista
      if (root.querySelector(".escena-rejilla").scrollHeight > innerHeight - 48) return Stage.REST;
      // autoAlpha (visibility): un paso apagado no tapa los enlaces del visible ni recibe el tabulador
      gsap.set(parts.slice(1), { autoAlpha: 0, y: 24 });
      const span = 0.9 / (n + 0.4);
      parts.forEach((p, i) => {
        if (!i) return;
        const at = 0.05 + (i - 1) * span;
        tl.to(parts[i - 1], { autoAlpha: 0, y: -24, duration: span * 0.3 }, at)
          .to(p, { autoAlpha: 1, y: 0, duration: span * 0.35 }, at + span * 0.25);
        // la lectura y el primer paso enseñan las dos todas las alertas (capa 1); desde ahí, una capa por tipo
        if (S && i > 1) tl.to(S.w, { [i - 1]: 0, [i]: 1, duration: span * 0.6 }, at);
        if (S && i === 1) tl.to(S, { cam: 1, duration: span * 0.6 }, at);
      });
    },
    rest() { if (sceneState.current) { sceneState.current.w.fill(0); sceneState.current.w[1] = 1; sceneState.current.cam = 0.4; } },
  });
}

async function mountMap(store, host) {
  const layers = alertLayers(store);
  const state = newState(layers);
  state.w.fill(0); state.w[1] = 1; // el territorio arranca con todas sus alertas
  sceneState.current = state;
  const flat = () => {
    const a = store.alertas, types = Object.keys(a.tipos);
    const paint = (c) => { const g = (a.municipios[c] ?? []).find((x) => x.grave) ?? a.municipios[c]?.[0]; return g ? ALERT_COLORS[types.indexOf(g.tipo) % ALERT_COLORS.length] : NODATA; };
    host.replaceChildren(svgMap(store.geo, { paint, label: `Mapa de los ${store.territorio.unidad.varias} con alertas`,
      tip: (c) => ({ title: store.name(c), lines: (a.municipios[c] ?? []).map((x) => x.texto) }) }).svg);
    host.classList.add("plano");
  };
  host.addEventListener("sin3d", flat);
  const ok = await territory3d(host, store.geo, layers, { state }).catch(() => false);
  if (!ok) flat();
}

// ---------- cuadro de mando ----------

function kpiButton(ind, store, pick) {
  const a = ind.actual;
  const b = el("button", { type: "button", class: "kpi", "aria-pressed": "false", "data-id": ind.id }, [
    el("span", { class: "kpi-nombre", text: ind.nombre }),
    el("span", { class: "kpi-cifra" }, [el("span", { class: "kpi-valor", "data-rueda": "", text: es(a.valor, ind.decimales) }), el("span", { class: "kpi-unidad", text: ` ${unitOf(ind.unidad)}` })]),
    el("span", { class: "kpi-pie" }, [stateTag(a.estado, store.catalogo.estados[a.estado]), el("span", { class: "kpi-cambio", text: isNum(a.cambio) ? changeText(ind) : periodLabel(a.periodo) })]),
  ]);
  b.addEventListener("click", () => pick(ind.id, true));
  return b;
}

/** El panel del indicador elegido: su serie con el umbral o la meta, su regla, su nota, sus fuentes y su próximo dato. */
function detail(ind, store) {
  const a = ind.actual, cal = store.calendar[ind.calendario];
  const map = ind.mapa ? store.ind[ind.mapa] : null;
  const threshold = ind.umbral ?? null;
  const xs = ind.serie.map(([p]) => p);
  return el("div", { class: "detalle" }, [
    el("div", { class: "carta-cab" }, [el("h3", { text: ind.nombre }), labelTag(ind.etiqueta)]),
    el("p", { class: "detalle-cifra" }, [el("span", { class: "kpi-valor", text: es(a.valor, ind.decimales) }), el("span", { class: "kpi-unidad", text: ` ${unitOf(ind.unidad)} · ${periodLabel(a.periodo)} · ${ind.ambito}` })]),
    xs.length > 1 ? lineChart({ xs, series: [{ nombre: ind.nombre, valores: ind.serie.map(([, v]) => v) }], alto: 200, etiqueta: `Serie de ${ind.nombre}`,
      fmtTip: (v) => `${es(v, ind.decimales)} ${unitOf(ind.unidad)}`, umbral: threshold ? { ...threshold, corto: threshold.tipo === "meta" ? `Meta: ${es(threshold.valor)}` : `Umbral: ${es(threshold.valor)}` } : null })
      : el("p", { class: "nota", text: "Solo hay un dato publicado: la serie empezará con el próximo." }),
    el("dl", { class: "detalle-kv" }, [
      ["Regla", ruleText(ind)],
      threshold ? [threshold.tipo === "meta" ? "Meta" : "Umbral", threshold.texto] : map?.umbral ? ["Umbral en cada municipio", map.umbral.texto] : null,
      cal ? ["Próximo dato", `${cal.proxima} (${cal.periodicidad.toLowerCase()})`] : null,
    ].filter(Boolean).map(([k, v]) => el("div", { class: "fila-kv" }, [el("dt", { text: k }), el("dd", { text: v })]))),
    sourcesLine(ind.fuentes),
    el("a", { class: "boton", href: `#indicadores/${ind.id}`, text: "Ver la ficha del indicador" }),
  ]);
}

function dashboard(store) {
  const panel = el("aside", { class: "carta panel-indicador", "aria-label": "Indicador elegido" });
  let ready = false;
  const narrow = matchMedia("(max-width: 1199px)");
  const pick = (id, user) => {
    grid.querySelectorAll(".kpi").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === id)));
    panel.replaceChildren(detail(store.ind[id], store));
    if (narrow.matches) grid.querySelector(`.kpi[data-id="${CSS.escape(id)}"]`)?.closest(".dimension")?.after(panel);
    else if (panel.parentElement !== mando) mando.append(panel);
    if (ready && user) announce(`${store.ind[id].nombre}: serie y regla al lado`, 200);
  };
  const grid = el("div", { class: "dimensiones" }, store.catalogo.dimensiones.map((d) => {
    const ks = keys(store).filter((k) => k.dimension === d.id);
    if (!ks.length) return null;
    return el("section", { class: "carta dimension entra", "aria-labelledby": `dim-${d.id}` }, [
      el("header", { class: "dimension-cab" }, [el("h3", { id: `dim-${d.id}`, text: d.nombre }), el("p", { class: "nota", text: d.pregunta })]),
      el("div", { class: "kpis" }, ks.map((k) => kpiButton(k, store, pick))),
    ]);
  }));
  const mando = el("div", { class: "mando" }, [grid, panel]);
  pick(keys(store)[0].id, false);
  ready = true;
  return el("section", { class: "sec", "aria-labelledby": "s-mando" }, [
    el("div", { class: "sec-cab" }, [el("h2", { id: "s-mando", text: `Los ${keys(store).length} indicadores clave` }),
      el("p", { class: "sec-lead", text: "Elige uno para ver su serie." })]),
    mando,
  ]);
}

// ---------- alertas por municipio ----------

function alertList(store) {
  const a = store.alertas, types = Object.keys(a.tipos);
  const rows = Object.entries(a.municipios).sort(([c1, x1], [c2, x2]) => x2.filter((x) => x.grave).length - x1.filter((x) => x.grave).length || x2.length - x1.length || store.name(c1).localeCompare(store.name(c2), "es"));
  const body = el("tbody");
  const count = el("p", { class: "nota" });
  const more = el("button", { type: "button", class: "boton", text: "Ver todos" });
  const st = { tipo: "", all: false };
  const draw = () => {
    const shown = rows.filter(([, list]) => !st.tipo || list.some((x) => x.tipo === st.tipo));
    const page = st.all ? shown : shown.slice(0, PAGE);
    const ficha = store.territorio.ficha_municipio;
    body.replaceChildren(...page.map(([code, list]) => el("tr", {}, [
      el("th", { scope: "row" }, [ficha ? extLink(ficha.replace("{codigo}", code), store.name(code)) : store.name(code)]),
      el("td", { "data-col": "Alertas" }, [el("ul", { class: "alertas-muni" }, list.filter((x) => !st.tipo || x.tipo === st.tipo).map((x) => el("li", {}, [
        el("span", { class: "muestra", style: `background:${ALERT_COLORS[types.indexOf(x.tipo) % ALERT_COLORS.length]}`, "aria-hidden": "true" }),
        el("span", {}, [x.grave ? el("strong", { text: "Grave. " }) : null, x.texto])])))]),
    ])));
    count.textContent = `${es(shown.length)} ${shown.length === 1 ? store.territorio.unidad.una : store.territorio.unidad.varias}${st.tipo ? ` con alertas de «${a.tipos[st.tipo].toLowerCase()}»` : " con alguna alerta"}.`;
    more.hidden = shown.length <= PAGE;
    more.textContent = st.all ? "Ver menos" : `Ver los ${shown.length}`;
  };
  const filters = [["", "Todas"], ...types.map((t) => [t, `${a.tipos[t]} (${a.recuento?.[t] ?? 0})`])].map(([t, text]) => {
    const b = el("button", { type: "button", class: "opcion", "aria-pressed": String(!t), text });
    b.addEventListener("click", () => { st.tipo = t; st.all = false; filterRow.querySelectorAll(".opcion").forEach((o) => o.setAttribute("aria-pressed", String(o === b))); draw(); announce(count.textContent, 200); });
    return b;
  });
  const filterRow = el("div", { class: "opciones", role: "group", "aria-label": "Tipo de alerta" }, filters);
  more.addEventListener("click", () => { st.all = !st.all; draw(); });
  draw();
  return el("section", { class: "sec", id: "alertas", "aria-labelledby": "s-alertas" }, [
    el("div", { class: "sec-cab" }, [el("h2", { id: "s-alertas", text: `Alertas por ${store.territorio.unidad.una}` }),
      el("p", { class: "sec-lead", text: `Datos de ${periodLabel(a.fecha)}.` })]),
    filterRow, count,
    el("div", { class: "tabla-caja" }, [el("table", { class: "tabla tabla-alertas" }, [
      el("caption", { class: "sr-only", text: "Alertas por municipio" }),
      el("thead", {}, [el("tr", {}, [el("th", { scope: "col", text: capital(store.territorio.unidad.una) }), el("th", { scope: "col", text: "Alertas" })])]), body])]),
    more,
  ]);
}

export function renderSituacion(root, store) {
  const { section, host, n } = scene(store);
  section.dataset.scene = "alertas";
  root.querySelector("[data-cuerpo]").replaceChildren(section, dashboard(store), alertList(store));
  registerScene(n);
  mountMap(store, host);
  return {
    head: () => ({ sub: finding(store) }),
    show(sub) { if (sub === "alertas") requestAnimationFrame(() => jumpTo("s-alertas")); },
    keepScroll: (sub) => sub === "alertas",
  };
}
