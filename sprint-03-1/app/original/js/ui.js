// Utilidades compartidas: creacion de nodos sin innerHTML, formato de numeros y piezas de diseño.

export const NA = "sin dato"; // el sistema de diseño no usa guion largo

export const TIPO = {
  oficial: { label: "Dato oficial", cls: "pill-oficial" },
  calculo: { label: "Cálculo propio", cls: "pill-calculo" },
  aproximacion: { label: "Aproximación", cls: "pill-aproximacion" },
};

// Colores de los 7 tipos de municipio. Siempre van con su nombre al lado. Fase 12: sacados de los tonos de la marca
// (azul, teal, verde y rosa) con distinta luminosidad. Entre cualquier pareja, la diferencia de color minima (CIE76)
// es de 19 o mas con vision normal y con los tres tipos de daltonismo simulados; la paleta anterior (fase 5) bajaba a 11.
export const TYPE_COLORS = {
  bilbao: "#2e4a67",
  costa_turistica: "#d0878c",
  expansion: "#8f4c53",
  urbano_renta_baja: "#5584b4",
  urbano_renta_alta: "#86cbd3",
  villa: "#778a2d",
  rural: "#cad3a6",
};

export const SECTION_LABELS = {
  resumen: "Resumen", municipios: "Municipios", acceso: "Acceso", medidas: "Medidas", comparar: "Comparar", metodo: "Método y fuentes",
};

// Fase 13: la vigilancia (alertas, zonas tensionadas, Horizonte 2035, datos que faltan) vive en el radar, la otra web
export const RADAR_URL = "https://alvarolopez-commits.github.io/radar-vivienda-bizkaia/"; // el radar que se está construyendo (antes: https://vizcaya-vivienda.vercel.app/)
export const radarLink = (hash, text, cls = "btn-link") => el("a", { class: cls, href: `${RADAR_URL}${hash}`, rel: "noopener", text });

// Tramos de ingresos: hogares ordenados de menos a más ingresos (percentiles), con nombre en lenguaje llano
export const TIER_NAMES = { P10: "Ingresos muy bajos", P25: "Ingresos bajos", P50: "Ingresos medios", P75: "Ingresos altos", P90: "Ingresos muy altos" };
export const TIER_NOTE = "Para hablar de ingresos ordenamos todos los hogares de menos a más ingresos. Ingresos bajos: el hogar que gana más que 1 de cada 4 hogares y menos que los otros 3. Ingresos medios: el hogar del medio (la mitad de los hogares gana más y la otra mitad, menos). Ingresos altos: el hogar que gana más que 3 de cada 4 hogares y menos que el otro. Muy bajos: solo 1 de cada 10 hogares gana menos. Muy altos: solo 1 de cada 10 gana más.";

export const el = (tag, props = {}, children = []) => {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (v === undefined || v === null || v === false) return;
    if (k === "text") node.textContent = v;
    else if (k === "class") node.className = v;
    else node.setAttribute(k, v === true ? "" : v);
  });
  children.forEach((c) => { if (c !== null && c !== undefined && c !== false) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
  return node;
};

const SVG_NS = "http://www.w3.org/2000/svg";
export const svgEl = (tag, attrs = {}) => {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
};

export const isNum = (v) => typeof v === "number" && Number.isFinite(v);

/** Numero en formato español. es(265733) -> '265.733'; es(2.92, 2) -> '2,92'. */
export const es = (v, d = 0) => (isNum(v) ? v.toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: "always" }) : NA);

const MONTHS = { ENE: "enero", FEB: "febrero", MAR: "marzo", ABR: "abril", MAY: "mayo", JUN: "junio", JUL: "julio", AGO: "agosto", SEP: "septiembre", OCT: "octubre", NOV: "noviembre", DIC: "diciembre" };
/** Edicion del INE: 'MAY2026' -> 'mayo de 2026' (corta: 'may 2026'). */
export const editionLabel = (ed, short = false) => {
  const m = MONTHS[ed.slice(0, 3)] || ed.slice(0, 3).toLowerCase();
  return short ? `${m.slice(0, 3)} ${ed.slice(3)}` : `${m} de ${ed.slice(3)}`;
};

export const euros = (v) => (isNum(v) ? `${es(v)} €` : NA);
export const pct = (v, d = 1) => (isNum(v) ? `${es(v, d)} %` : NA);
export const range = (r, d = 1, suffix = "") => (Array.isArray(r) && r.every(isNum) ? `${es(r[0], d)} a ${es(r[1], d)}${suffix}` : NA);

export const safeUrl = (url) => (/^https:\/\//.test(url) ? url : "#");

export const extLink = (url, text) => el("a", { href: safeUrl(url), target: "_blank", rel: "noopener noreferrer", text });

export const pill = (tipo) => el("span", { class: `pill ${TIPO[tipo].cls}`, text: TIPO[tipo].label });
/** Etiqueta en linea de un dato aproximado (fase 4: alquiler estimado por comarca, precio orientativo). */
export const approxTag = () => el("span", { class: "pill pill-aproximacion pill-inline", text: "Dato aproximado" });

export const typePill = (key, name) => el("span", { class: "type-pill" }, [
  el("span", { class: "type-dot", style: `background:${TYPE_COLORS[key]}`, "aria-hidden": "true" }), name,
]);

/** Cabecera de una vista: antetitulo, titulo y entradilla. */
export const viewHead = ({ eyebrow, title, lede, light = false }) => el("header", { class: "view-head" }, [
  el("span", { class: `eyebrow${light ? " light" : ""}`, text: eyebrow }),
  el("h1", { class: `section-h2${light ? " light" : ""}`, text: title }),
  lede ? el("p", { class: `section-lede${light ? " light" : ""}`, text: lede }) : null,
]);

/** Tarjeta double-bezel. */
export const dz = ({ cls = "", eye, title, body, nodes = [] }) => {
  const dark = /\b(accent|mid)\b/.test(cls);
  const inner = el("div", { class: `dz-inner${dark ? " light" : ""}` }, [
    eye ? el("div", { class: "card-eye" }, Array.isArray(eye) ? eye : [eye]) : null,
    title !== undefined ? el("h3", { class: "card-h3", text: title }) : null,
    body !== undefined ? (typeof body === "string" ? el("p", { class: "card-body", text: body }) : body) : null,
    ...nodes,
  ]);
  return el("div", { class: `dz ${cls}`.trim() }, [inner]);
};

export const chartBox = (id, cls = "") => el("div", { class: `chart-box ${cls}`.trim() }, [el("canvas", { id, role: "img", "aria-label": "Gráfico" })]);

export const bigNumber = (value, unit, cls = "big-num") => el("div", { class: cls }, [value, unit ? el("span", { class: "big-unit", text: unit }) : null]);

/** Lista de fuentes de una cifra, con enlace a la publicacion original. */
export const sourceLine = (keys, fuentes, prefix = "Fuente") => {
  const links = keys.filter((k) => fuentes[k]).map((k) => extLink(fuentes[k].url, fuentes[k].nombre));
  if (!links.length) return null;
  const nodes = [`${prefix}${links.length > 1 ? "s" : ""}: `];
  links.forEach((a, i) => { if (i) nodes.push(" · "); nodes.push(a); });
  return el("p", { class: "source-line" }, nodes);
};

/** Barra horizontal simple (0 a max) con etiqueta y valor. */
export const meter = ({ label, value, max, text, cls = "" }) => el("div", { class: `meter ${cls}`.trim() }, [
  el("div", { class: "meter-head" }, [el("span", { text: label }), el("span", { class: "meter-v", text })]),
  el("div", { class: "meter-track", "aria-hidden": "true" }, [el("div", { class: "meter-fill", style: `width:${Math.max(0, Math.min(100, (100 * value) / (max || 1))).toFixed(1)}%` })]),
]);

/** Tabla accesible a partir de cabeceras y filas de celdas (texto o nodos). */
export const table = (headers, rows, { caption, numeric = [] } = {}) => el("div", { class: "table-wrap" }, [
  el("table", {}, [
    caption ? el("caption", { class: "sr-only", text: caption }) : null,
    el("thead", {}, [el("tr", {}, headers.map((h, i) => el("th", { scope: "col", class: numeric.includes(i) ? "num" : null, text: h })))]),
    el("tbody", {}, rows.map((r) => el("tr", { class: r.cls || null }, (r.cells || r).map((c, i) => {
      const cell = el("td", { class: numeric.includes(i) ? "num" : null });
      if (c instanceof Node) cell.appendChild(c); else cell.textContent = c ?? NA;
      return cell;
    })))),
  ]),
]);

// ---------- movimiento (fase 12) ----------

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const COUNT_MS = 900;

/** Cifra de portada que cuenta desde 0 una sola vez. Los lectores de pantalla leen solo la cifra final. */
export const countUp = (value, digits = 0) => {
  const show = (v) => v.toLocaleString("es-ES", { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: "always" });
  const anim = el("span", { "aria-hidden": "true", text: isNum(value) ? show(value) : NA });
  const wrap = el("span", {}, [anim, el("span", { class: "sr-only", text: anim.textContent })]);
  if (!isNum(value) || reducedMotion()) return wrap;
  const t0 = performance.now();
  const tick = (t) => {
    const k = Math.min(1, (t - t0) / COUNT_MS);
    anim.textContent = show(value * (1 - (1 - k) ** 3));
    if (k < 1) requestAnimationFrame(tick);
  };
  anim.textContent = show(0);
  requestAnimationFrame(tick);
  return wrap;
};

/** Marca los elementos .reveal como visibles. Fase 5: ya no se esconden hasta entrar en pantalla, porque al bajar
 * deprisa (o al saltar a un enlace) algunas tarjetas se quedaban en blanco. */
export const observeReveal = (root) => {
  root.querySelectorAll(".reveal").forEach((n) => n.classList.add("visible"));
};
