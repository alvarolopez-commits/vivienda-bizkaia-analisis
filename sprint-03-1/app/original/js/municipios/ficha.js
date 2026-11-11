// Las piezas de la ficha de un municipio: sus problemas, qué supone alquilar y comprar para cada hogar, cómo ha cambiado
// (líneas pequeñas), sus barrios en un mapa y su plan de medidas. Solo enseña datos de municipios.json y secciones.geojson.
import { stateLabel, stateOf } from "../estado.js";
import { projection, rings } from "../mapa.js";
import { el, es, isNum, pct, svgEl } from "../ui.js";

const TIERS = [["P25", "Ingresos bajos", "esfuerzo_alquiler_P25"], ["P50", "Ingresos medios", "esfuerzo_alquiler"], ["P75", "Ingresos altos", "esfuerzo_alquiler_P75"]];
const SERIES = [["poblacion", "Habitantes", 0], ["renta_persona", "Ingresos por persona al año (€)", 0], ["renta_alquiler", "Alquiler de los contratos nuevos (€ al mes)", 0], ["viviendas_total", "Viviendas", 0]];
const range = (r) => (r[0].toFixed(1) === r[1].toFixed(1) ? es(r[0], 1) : `${es(r[0], 1)} a ${es(r[1], 1)}`);

/** Los problemas del municipio, uno por fila, con el dato que lo explica. */
export function problems(store, m) {
  const keys = Object.keys(m.problemas).sort((a, b) => (m.intensidad[b] ?? 0) - (m.intensidad[a] ?? 0));
  if (!keys.length) return el("p", { class: "vacio", text: "Ningún problema pasa de los límites del análisis." });
  return el("ul", { class: "filas" }, keys.map((k) => el("li", { class: "fila-carta fila-problema" }, [
    el("span", { class: "nombre", text: store.problemName(k) }),
    el("span", { class: "dato", text: m.por_que[k] ?? "" }),
  ])));
}

/** Qué supone alquilar y comprar para un hogar de ingresos bajos, medios y altos. */
export function households(m) {
  const tramos = m.compra?.tramos ?? {}, est = m.compra?.orientativo?.tramos ?? {};
  const rows = TIERS.map(([q, name, rentKey]) => {
    const rent = m.indicadores[rentKey];
    const own = tramos[q]?.años ? tramos[q] : null, approx = !own && est[q]?.años ? est[q] : null, buy = own ?? approx;
    return el("div", { class: "fila", role: "row" }, [
      el("span", { role: "rowheader", text: name }),
      el("span", { role: "cell", "data-col": "Alquiler nuevo", text: isNum(rent) ? pct(rent) : "sin dato" }),
      el("span", { role: "cell", "data-col": "Años para la entrada", text: buy ? `${range(buy.años)}${approx ? "*" : ""}` : "sin dato" }),
      el("span", { role: "cell", "data-col": "Cuota de la hipoteca", text: buy ? `${range(buy.esfuerzo)} %${approx ? "*" : ""}` : "sin dato" }),
    ]);
  });
  const note = m.compra?.precio ? "Precio de las compraventas de 2025 en el municipio." : m.compra?.orientativo ? `*Aproximado: sin precio propio, se usa la ${m.compra.orientativo.metodo} (${m.compra.orientativo.area}).` : "";
  return el("div", { class: "hogares" }, [
    el("div", { class: "tabla", role: "table", "aria-label": "Alquilar y comprar según los ingresos del hogar" }, [
      el("div", { class: "fila cab", role: "row" }, ["", "Alquiler nuevo, en % de los ingresos", "Años ahorrando la entrada", "Cuota, en % de los ingresos"].map((t) => el("span", { role: "columnheader", text: t }))),
      ...rows,
    ]),
    note ? el("p", { class: "fuente", text: note }) : null,
  ]);
}

/** Una línea pequeña por serie, con el primer y el último año. */
export function series(m) {
  const items = SERIES.filter(([k]) => m.series[k] && Object.keys(m.series[k]).length > 1).map(([k, label, d]) => {
    const pts = Object.entries(m.series[k]).map(([y, v]) => [Number(y), v]).filter(([, v]) => isNum(v));
    const [x0, x1] = [pts[0][0], pts.at(-1)[0]], vs = pts.map(([, v]) => v), lo = Math.min(...vs), hi = Math.max(...vs);
    const X = (x) => (300 * (x - x0)) / (x1 - x0 || 1), Y = (v) => 72 - (64 * (v - lo)) / (hi - lo || 1);
    const svg = svgEl("svg", { viewBox: "-6 0 312 80", class: "linea-mini", "aria-hidden": "true" });
    svg.append(svgEl("polyline", { points: pts.map(([x, v]) => `${X(x).toFixed(1)},${Y(v).toFixed(1)}`).join(" "), fill: "none", stroke: "currentColor", "stroke-width": "2.5", "vector-effect": "non-scaling-stroke", "stroke-linejoin": "round" }));
    svg.append(svgEl("circle", { cx: X(x1).toFixed(1), cy: Y(pts.at(-1)[1]).toFixed(1), r: "4.5", fill: "currentColor" }));
    const change = (100 * (pts.at(-1)[1] - pts[0][1])) / pts[0][1];
    return el("figure", { class: "serie" }, [
      el("figcaption", { text: label }), svg,
      el("p", { class: "serie-cifras", text: `${x0}: ${es(pts[0][1], d)} · ${x1}: ${es(pts.at(-1)[1], d)} (${change > 0 ? "+" : ""}${es(change, 1)} %)` }),
    ]);
  });
  return el("div", { class: "series" }, items);
}

/** Sus barrios (secciones censales) en un mapa: en color, los que tienen algún problema de barrio. */
export async function barrios(store, code, problemName) {
  const geo = await store.sections();
  const feats = geo.features.filter((f) => f.properties.muni === code);
  const flagged = feats.filter((f) => f.properties.focos.length);
  const box = el("div", { class: "barrios" });
  if (!feats.length) return box;
  const { P } = projection({ features: feats });
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  const pts = feats.flatMap((f) => rings(f.geometry).flatMap((poly) => poly[0].map(P)));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => -p[1]);
  const [x0, y0, w, h] = [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
  svg.setAttribute("viewBox", `${x0 - w * 0.03} ${y0 - h * 0.03} ${w * 1.06} ${h * 1.06}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `Mapa de los ${feats.length} barrios: ${flagged.length} con algún problema de barrio`);
  for (const f of feats) {
    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", rings(f.geometry).map((poly) => poly.map((r) => `M${r.map((c) => { const [x, y] = P(c); return `${x.toFixed(3)},${(-y).toFixed(3)}`; }).join("L")}Z`).join("")).join(""));
    path.setAttribute("fill", f.properties.focos.length ? "#b4545b" : "#ffffff");
    path.setAttribute("stroke", "#9fb0c3");
    path.setAttribute("stroke-width", "0.6");
    path.setAttribute("vector-effect", "non-scaling-stroke");
    svg.append(path);
  }
  const count = {};
  flagged.forEach((f) => f.properties.focos.forEach((k) => { count[k] = (count[k] ?? 0) + 1; }));
  box.append(el("div", { class: "barrios-mapa" }, [svg]), el("ul", { class: "barrios-lista" }, Object.entries(count).sort((a, b) => b[1] - a[1])
    .map(([k, n]) => el("li", {}, [el("b", { text: es(n) }), ` ${n === 1 ? "barrio" : "barrios"}: ${problemName(k).toLowerCase()}`]))));
  if (!flagged.length) box.append(el("p", { class: "vacio", text: "Ningún barrio pasa de los límites del análisis." }));
  return box;
}

/** Su plan de medidas: una fila por medida, con por qué se propone y si ya se aplica. */
export function plan(store, code) {
  const m = store.municipios[code];
  if (!m.plan.length) return el("p", { class: "vacio", text: "No hay medidas propuestas para este municipio." });
  return el("ul", { class: "filas" }, m.plan.map((item) => {
    const measure = store.measures[item.id];
    return el("li", {}, [el("a", { class: "fila-carta", href: `#medidas/${item.id}` }, [
      el("span", { class: "nombre", text: measure.nombre }),
      el("span", { class: "dato" }, [el("b", { text: item.grupo === "probada" ? "Probada" : "Para probar con un piloto" }), `. Por: ${item.motivos.map((k) => store.problemName(k).toLowerCase()).join(", ")}. `, stateLabel(store, stateOf(m, item.id))]),
      el("span", { class: "ir", text: "Ver la medida →" }),
    ])]);
  }));
}
