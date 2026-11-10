// Sprint 02 · Living Atlas · capa del mapa.
// La geometría y la proyección son las de js/mapa.js (svgMap, sin cambios) con data/municipios.geojson: los 113 polígonos
// reales. Aquí solo se añade la interacción: color por indicador (las funciones color() de indicadores.js), hover, foco
// con teclado (tabindex itinerante y flechas), selección persistente, zoom y desplazamiento, y transiciones discretas.
// No se regenera ninguna geometría: se cambian atributos y clases.
import { reduced } from "../original/js/comun.js";
import { svgMap } from "../original/js/mapa.js";

const NS = "http://www.w3.org/2000/svg";
const DIM = "#ffffff"; // el «sin dato» de mapa-vivo.js; aquí lleva además una trama para no confundirlo con un valor bajo
const SIN_DATO = "url(#trama-sin-dato)";
const svgEl = (tag, attrs = {}) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c) => `#${c.map((x) => Math.round(x).toString(16).padStart(2, "0")).join("")}`;
const lerp = (a, b, t) => hex(rgb(a).map((x, i) => x + (rgb(b)[i] - x) * t));
const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * @param {HTMLElement} host
 * @param {object} store  el store original (createStore)
 * @param {{ onPick: (code: string|null) => void, tip: HTMLElement, describe: (code: string) => {nombre: string, valor: string} }} opts
 */
export function crearMapa(host, store, { onPick, tip, describe }) {
  const svg = svgMap(store.municipiosGeo, () => ({ fill: DIM }), { stroke: "#ffffff", label: "Mapa de los municipios de Bizkaia, coloreado por el indicador elegido" });
  svg.setAttribute("role", "group"); // los municipios son controles: un role="img" los ocultaría
  svg.setAttribute("aria-roledescription", "mapa");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  const paths = [...svg.querySelectorAll("path")];
  const byCode = Object.fromEntries(paths.map((p) => [p.dataset.code, p]));

  // capas: sombra estática del territorio, municipios y marcas (hover / selección) por encima
  const defs = svgEl("defs");
  const trama = svgEl("pattern", { id: "trama-sin-dato", width: "1.4", height: "1.4", patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" });
  trama.append(svgEl("rect", { width: "1.4", height: "1.4", fill: DIM }), svgEl("line", { x1: "0", y1: "0", x2: "0", y2: "1.4", stroke: "#cdd6e0", "stroke-width": ".26" }));
  const blur = svgEl("filter", { id: "sombra-territorio", x: "-10%", y: "-10%", width: "120%", height: "130%" });
  blur.append(svgEl("feGaussianBlur", { stdDeviation: "1.4" }));
  // elevación óptica: sombra en unidades del mapa (km), así acompaña al zoom
  const elevar = (id, dy, sd, op) => {
    const f = svgEl("filter", { id, x: "-30%", y: "-30%", width: "160%", height: "180%" });
    f.append(svgEl("feDropShadow", { dx: "0", dy, stdDeviation: sd, "flood-color": "#14203c", "flood-opacity": op }));
    return f;
  };
  defs.append(trama, blur, elevar("elevar", ".9", ".9", ".38"), elevar("elevar-suave", ".45", ".5", ".26"));
  const sombra = svgEl("path", { class: "sombra", d: paths.map((p) => p.getAttribute("d")).join(""), filter: "url(#sombra-territorio)", transform: "translate(0 1.6)", "aria-hidden": "true" });
  const munis = svgEl("g", { class: "munis" });
  const marcas = svgEl("g", { class: "marcas", "aria-hidden": "true" });
  munis.append(...paths);
  svg.prepend(defs);
  svg.append(sombra, munis, marcas);

  paths.forEach((p) => {
    const c = p.dataset.code;
    p.setAttribute("role", "button");
    p.setAttribute("tabindex", "-1");
    p.setAttribute("aria-pressed", "false");
    p.id = `m-${c}`;
  });
  host.replaceChildren(svg);

  const fills = {}; // color actual de cada municipio (hex o la trama)
  let code = null, hovered = null, anim = 0, roving = byCode["48020"] || paths[0];
  roving.setAttribute("tabindex", "0");

  // ---------- marcas (clon del polígono: no se toca la geometría) ----------
  const mark = (cls, c) => {
    marcas.querySelector(`.${cls}`)?.remove();
    if (!c) return;
    const m = byCode[c].cloneNode(false);
    m.removeAttribute("id"); m.removeAttribute("role"); m.removeAttribute("tabindex"); m.removeAttribute("aria-pressed"); m.removeAttribute("aria-label");
    m.setAttribute("class", cls);
    m.setAttribute("fill", fills[c] || DIM);
    const sel = cls === "marca-sel";
    m.setAttribute("filter", `url(#${sel ? "elevar" : "elevar-suave"})`);
    m.setAttribute("transform", `translate(0 ${sel ? -0.45 : -0.22})`);
    if (cls === "marca-hover") marcas.append(m); else marcas.prepend(m);
  };
  const syncMarks = () => marcas.querySelectorAll("path").forEach((m) => {
    const c = m.dataset.code; if (c) m.setAttribute("fill", fills[c] || DIM);
  });

  // ---------- color ----------
  let fin = 0;
  const paint = (target, { animate = false, sweep = false } = {}) => {
    cancelAnimationFrame(anim);
    clearTimeout(fin);
    const from = { ...fills };
    const final = () => {
      cancelAnimationFrame(anim);
      for (const p of paths) { const c = p.dataset.code; fills[c] = target[c]; p.setAttribute("fill", target[c]); }
      syncMarks();
    };
    if (!animate || reduced()) { final(); return; }
    const dur = sweep ? 700 : 360, spread = sweep ? 420 : 0;
    fin = setTimeout(final, dur + spread + 60); // red de seguridad: con la pestaña en segundo plano rAF se frena
    const box = svg.viewBox.baseVal;
    const delay = Object.fromEntries(paths.map((p) => { const b = p.getBBox(); return [p.dataset.code, spread * ((b.x + b.width / 2 - box.x) / box.width)]; }));
    const t0 = performance.now();
    const step = (now) => {
      let done = true;
      for (const p of paths) {
        const c = p.dataset.code;
        const k = Math.max(0, Math.min(1, (now - t0 - delay[c]) / dur));
        if (k < 1) done = false;
        const a = from[c] || DIM, b = target[c];
        let f;
        if (a.startsWith("#") && b.startsWith("#")) f = lerp(a, b, ease(k));
        else f = k < .5 ? a : b; // la trama no se interpola: cambia a mitad de camino
        if (fills[c] !== f) { fills[c] = f; p.setAttribute("fill", f); }
      }
      syncMarks();
      if (!done) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  };

  // ---------- etiquetas accesibles ----------
  const label = () => paths.forEach((p) => { const d = describe(p.dataset.code); p.setAttribute("aria-label", `${d.nombre}: ${d.valor}`); });

  // ---------- selección ----------
  const select = (c) => {
    code = c;
    svg.classList.toggle("con-sel", !!c);
    paths.forEach((p) => p.setAttribute("aria-pressed", String(p.dataset.code === c)));
    mark("marca-sel", c);
    if (hovered && hovered === c && !svg.classList.contains("con-foco")) mark("marca-hover", null);
    if (c) { setRoving(byCode[c]); ensureVisible(c); }
  };
  const setRoving = (p) => { if (roving === p) return; roving.setAttribute("tabindex", "-1"); roving = p; roving.setAttribute("tabindex", "0"); };

  // ---------- tooltip ----------
  const showTip = (c, at) => {
    if (!c) { tip.hidden = true; return; }
    const d = describe(c);
    tip.replaceChildren(Object.assign(document.createElement("strong"), { textContent: d.nombre }), Object.assign(document.createElement("span"), { textContent: d.valor }));
    tip.hidden = false;
    const r = tip.parentElement.getBoundingClientRect();
    let x, y;
    if (at) { x = at.clientX - r.left; y = at.clientY - r.top; }
    else { const b = byCode[c].getBoundingClientRect(); x = b.left + b.width / 2 - r.left; y = b.top - r.top; }
    const w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = `${Math.max(8, Math.min(r.width - w - 8, x - w / 2))}px`;
    tip.style.top = `${Math.max(8, y - h - 14)}px`;
  };
  // con foco de teclado la marca se dibuja también sobre el municipio elegido, para que el foco siempre se vea
  const hover = (c, at) => {
    const foco = svg.classList.contains("con-foco");
    if (hovered !== c || foco) { hovered = c; mark("marca-hover", c && (c !== code || foco) ? c : null); }
    showTip(c, at);
  };

  // ---------- zoom y desplazamiento ----------
  const base = (() => { const b = svg.viewBox.baseVal; return { x: b.x, y: b.y, w: b.width, h: b.height }; })();
  let vb = { ...base }, zoomAnim = 0;
  const MAXZ = 6;
  const clampVB = (v) => {
    const w = Math.min(base.w, Math.max(base.w / MAXZ, v.w)), h = (w * base.h) / base.w;
    return { w, h, x: Math.min(base.x + base.w - w, Math.max(base.x, v.x)), y: Math.min(base.y + base.h - h, Math.max(base.y, v.y)) };
  };
  const zoomBtns = { mas: null, menos: null };
  const applyVB = (v) => {
    vb = v;
    svg.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`);
    const z = v.w < base.w - 0.01;
    svg.classList.toggle("ampliado", z);
    if (zoomBtns.menos) zoomBtns.menos.disabled = !z;
    if (zoomBtns.mas) zoomBtns.mas.disabled = v.w <= base.w / MAXZ + 0.01;
  };
  let zoomFin = 0;
  const zoomTo = (target, dur = 320) => {
    cancelAnimationFrame(zoomAnim);
    clearTimeout(zoomFin);
    target = clampVB(target);
    if (reduced() || !dur) { applyVB(target); return; }
    zoomFin = setTimeout(() => { cancelAnimationFrame(zoomAnim); applyVB(target); }, dur + 60); // como en paint()
    const from = { ...vb }, t0 = performance.now();
    const step = (now) => {
      const k = ease(Math.min(1, (now - t0) / dur));
      applyVB({ x: from.x + (target.x - from.x) * k, y: from.y + (target.y - from.y) * k, w: from.w + (target.w - from.w) * k, h: from.h + (target.h - from.h) * k });
      if (k < 1) zoomAnim = requestAnimationFrame(step);
    };
    zoomAnim = requestAnimationFrame(step);
  };
  const zoomBy = (f, cx = vb.x + vb.w / 2, cy = vb.y + vb.h / 2) => {
    const w = vb.w / f, h = vb.h / f;
    zoomTo({ x: cx - w / 2, y: cy - h / 2, w, h });
  };
  // si hay zoom y el municipio elegido queda fuera, se lleva a la vista (sin acercar más)
  const ensureVisible = (c) => {
    if (vb.w >= base.w - 0.01) return;
    const b = byCode[c].getBBox();
    const inside = b.x >= vb.x && b.y >= vb.y && b.x + b.width <= vb.x + vb.w && b.y + b.height <= vb.y + vb.h;
    if (!inside) zoomTo({ x: b.x + b.width / 2 - vb.w / 2, y: b.y + b.height / 2 - vb.h / 2, w: vb.w, h: vb.h });
  };
  const toSvg = (e) => {
    const r = svg.getBoundingClientRect();
    const s = Math.max(vb.w / r.width, vb.h / r.height);
    return { s };
  };
  let drag = null, moved = false;
  svg.addEventListener("pointerdown", (e) => {
    moved = false;
    if (!svg.classList.contains("ampliado") || e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, vb: { ...vb }, id: e.pointerId };
  });
  svg.addEventListener("pointermove", (e) => {
    if (drag && e.pointerId === drag.id) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!moved && Math.hypot(dx, dy) > 5) { moved = true; svg.setPointerCapture(e.pointerId); svg.classList.add("arrastrando"); hover(null); }
      if (moved) { const { s } = toSvg(e); applyVB(clampVB({ ...drag.vb, x: drag.vb.x - dx * s, y: drag.vb.y - dy * s })); return; }
    }
    if (e.pointerType === "mouse") { const c = e.target.closest?.("path[data-code]")?.dataset.code || null; hover(c, e); }
  });
  const endDrag = () => { drag = null; svg.classList.remove("arrastrando"); };
  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);
  svg.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && !drag) hover(null); });
  svg.addEventListener("click", (e) => {
    if (moved) { moved = false; return; }
    const c = e.target.closest("path[data-code]")?.dataset.code;
    if (c && store.municipios[c]) onPick(c);
  });

  // ---------- teclado: flechas al vecino más cercano en esa dirección ----------
  let centers = null;
  const center = (p) => { centers ??= Object.fromEntries(paths.map((q) => { const b = q.getBBox(); return [q.dataset.code, [b.x + b.width / 2, b.y + b.height / 2]]; })); return centers[p.dataset.code]; };
  const DIRS = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  const neighbour = (p, [dx, dy]) => {
    const [x0, y0] = center(p);
    let best = null, score = Infinity;
    for (const q of paths) {
      if (q === p) continue;
      const [x, y] = center(q);
      const along = (x - x0) * dx + (y - y0) * dy;
      if (along <= 0.2) continue;
      const across = Math.abs((x - x0) * dy - (y - y0) * dx);
      const s = along + 2.2 * across;
      if (s < score) { score = s; best = q; }
    }
    return best;
  };
  svg.addEventListener("keydown", (e) => {
    const p = e.target.closest?.("path[data-code]");
    if (!p) return;
    if (DIRS[e.key]) {
      e.preventDefault();
      const q = neighbour(p, DIRS[e.key]);
      if (q) { setRoving(q); q.focus({ preventScroll: true }); }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); onPick(p.dataset.code);
    } else if (e.key === "Escape" && code) {
      e.preventDefault(); onPick(null);
    } else if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomBy(1.6); }
    else if (e.key === "-") { e.preventDefault(); zoomBy(1 / 1.6); }
  });
  svg.addEventListener("focusin", (e) => {
    const p = e.target.closest?.("path[data-code]");
    if (!p) return;
    setRoving(p);
    svg.classList.add("con-foco");
    if (vb.w < base.w - 0.01) ensureVisible(p.dataset.code);
    hover(p.dataset.code);
  });
  svg.addEventListener("focusout", () => { svg.classList.remove("con-foco"); hover(null); });

  return {
    svg,
    paint: (target, opts) => paint(target, opts),
    label,
    select,
    refreshTip: () => { if (hovered) showTip(hovered); },
    zoomIn: () => zoomBy(1.6),
    zoomOut: () => zoomBy(1 / 1.6),
    reset: () => zoomTo(base),
    bindZoomButtons: (mas, menos) => { zoomBtns.mas = mas; zoomBtns.menos = menos; applyVB(vb); },
    focusCode: (c) => { const p = byCode[c]; if (p) { setRoving(p); p.focus({ preventScroll: true }); } },
    SIN_DATO,
  };
}
