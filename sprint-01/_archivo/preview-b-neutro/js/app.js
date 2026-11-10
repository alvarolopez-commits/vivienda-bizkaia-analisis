// Prototipo de la vista Situación en el lenguaje del dashboard PCI. Un solo estado (problema, municipio, tipo)
// gobierna la isla de los cinco problemas, el mapa, la ficha y la lista de los 113. La lógica de los cinco
// indicadores, el mapa SVG y el 3D son los de la web publicada (indicadores.js, mapa.js, territorio.js, copias);
// aquí solo cambia cómo se presenta y se conecta.
import { announce, el, es, ORIGEN, reduced, TYPE_COLORS } from "./comun.js";
import { INDICADORES, ranking } from "./indicadores.js";
import { svgMap } from "./mapa.js";
import { newState, territory } from "./territorio.js";

// Con ?marcar (local) o #marcar (artifact, que solo deja pasar el hash) se rodea en naranja lo nuevo, a aprobar.
const marcar = () => document.documentElement.classList.toggle("marcar", new URLSearchParams(location.search).has("marcar") || location.hash === "#marcar");
marcar();
addEventListener("hashchange", marcar);

const FIRST = 10;
// Sin dato: blanco, como en la web publicada (el panel del mapa es gris claro para que se vea).
const NO_DATA = "#ffffff";
const SOURCE = { calculo: "Cálculo propio", oficial: "Dato oficial", aproximacion: "Aproximación" };
const get = (f) => fetch(`data/${f}`).then((r) => { if (!r.ok) throw new Error(`${f}: ${r.status}`); return r.json(); });
const SVG = "http://www.w3.org/2000/svg";
const ico = (id) => { const s = document.createElementNS(SVG, "svg"), u = document.createElementNS(SVG, "use"); s.setAttribute("class", "ico"); s.setAttribute("aria-hidden", "true"); u.setAttribute("href", `assets/icons.svg#${id}`); s.append(u); return s; };
const restart = (node, cls = "cambia") => { if (reduced()) return; node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); };

async function main() {
  const [geo, municipios, resumen, meta, acceso, medidas, normas] = await Promise.all([get("municipios.geojson"), get("situacion.json"), get("resumen.json"), get("meta.json"), get("acceso.json"), get("medidas.json"), get("normas.json")]);
  const store = {
    municipios, municipiosGeo: geo, resumen, fuentes: meta.fuentes,
    codes: Object.keys(municipios).sort((a, b) => municipios[a].nombre.localeCompare(municipios[b].nombre, "es")),
    typeKeys: Object.keys(meta.tipos),
    typeName: (t) => meta.tipos[t] || t,
  };
  const shortType = (t) => store.typeName(t).split(" (")[0];
  const sourcesOf = (p) => [...new Set(p.fuentes.map((k) => (store.fuentes[k]?.nombre ?? "").split(",")[0]).filter(Boolean))].join(", ");
  const fichaUrl = (code) => `${ORIGEN}#municipios/${code}`;

  const S = { i: 0, code: "48020", tipo: null, todos: false };
  const ind = () => INDICADORES[S.i];

  /* Tesis (pie de la isla) */
  document.getElementById("tesis").append(
    el("p", { class: "tesis-t", text: resumen.tesis.titulo }),
    el("p", { class: "nota" }, [el("b", { text: SOURCE[resumen.tesis.etiqueta] }), " con datos oficiales de 2024 y 2025. Las causas son hipótesis: cada una dice en qué dato se apoya."]),
  );

  /* Isla: el problema elegido en grande y los otros cuatro en tarjetas de cristal */
  const lead = document.getElementById("kb-lead"), duo = document.getElementById("kb-duo");
  function paintKeybox(animate) {
    const p = resumen.problemas[S.i];
    lead.replaceChildren(
      el("p", { class: "lab", text: INDICADORES[S.i].corto }),
      el("p", { class: "hero-num", text: p.cifra }),
      el("p", { class: "unidad", text: p.unidad }),
      el("h2", { text: p.titulo }),
      el("p", { class: "meta" }, [
        el("span", {}, [el("b", { text: SOURCE[p.etiqueta] || "Dato oficial" }), ` ${sourcesOf(p)}`]),
        el("span", { text: `En el mapa: ${INDICADORES[S.i].titulo.toLowerCase()}.` }),
      ]),
    );
    duo.replaceChildren(...resumen.problemas.map((q, k) => k === S.i ? null : (() => {
      const b = el("button", { type: "button", class: "kpi glass-kpi", "aria-label": `Ver: ${q.titulo}` }, [
        el("span", { class: "lab" }, [el("span", { text: INDICADORES[k].corto }), ico("i-arrow")]),
        el("span", { class: "num", text: q.cifra }),
        el("span", { class: "t", text: q.titulo }),
      ]);
      b.addEventListener("click", () => choose({ i: k }));
      return b;
    })()).filter(Boolean));
    if (animate) restart(lead);
  }

  /* Mapa */
  const mapa = document.getElementById("mapa");
  const svg = svgMap(geo, () => ({ fill: "#ffffff" }), { stroke: "#ffffff", label: "Mapa de los municipios de Bizkaia, coloreado por el problema elegido" });
  mapa.replaceChildren(svg);
  mapa.removeAttribute("aria-busy");
  const paths = Object.fromEntries([...svg.querySelectorAll("path")].map((p) => [p.dataset.code, p]));
  const tip = document.getElementById("tip");
  svg.addEventListener("click", (e) => { const c = e.target.closest("path")?.dataset.code; if (c) choose({ code: c }); });
  svg.addEventListener("pointermove", (e) => {
    const c = e.target.closest("path")?.dataset.code;
    if (!c) { tip.hidden = true; return; }
    const x = ind().valor(store.municipios[c]);
    tip.replaceChildren(el("b", { text: store.municipios[c].nombre }), el("span", { class: "tv", text: x ? ind().texto(x) : "sin dato" }));
    tip.hidden = false;
    tip.style.left = `${e.clientX + 14}px`; tip.style.top = `${e.clientY + 14}px`;
  });
  svg.addEventListener("pointerleave", () => { tip.hidden = true; });
  const ramp = document.getElementById("ramp");

  /* Conmutador 2D / 3D. El 3D es el territorio de la web publicada (territorio.js, copia): se monta la primera vez
     que se pide y se mueve con los mismos pesos (w1..w5, uno por problema). Sin WebGL, el botón queda apagado. */
  const b2d = el("button", { type: "button", "aria-pressed": "true", text: "2D" });
  const b3d = el("button", { type: "button", "aria-pressed": "false", text: "3D" });
  document.getElementById("vista").append(b2d, b3d);
  let state3d = null, mounting = null, anim = 0;
  const tweenTo = (obj, target, dur = 800) => { // equivale al gsap.to(..., { ease: "power2.inOut", duration: 0.8 }) del original
    cancelAnimationFrame(anim);
    const from = { ...obj }, t0 = performance.now(), ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur), e = ease(k);
      for (const key of Object.keys(target)) obj[key] = from[key] + (target[key] - from[key]) * e;
      if (k < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  };
  const paint3d = () => {
    if (!state3d) return;
    const i = S.i + 1;
    const target = Object.fromEntries([1, 2, 3, 4, 5].map((k) => [`w${k}`, k === i ? 1 : 0]));
    if (reduced()) Object.assign(state3d, target, { w0: 0 }); else tweenTo(state3d, { ...target, w0: 0 });
    Object.assign(state3d, { label: i - 1, labelOp: 1 });
  };
  const show3d = (on) => {
    b2d.setAttribute("aria-pressed", String(!on)); b3d.setAttribute("aria-pressed", String(on));
    mapa.classList.toggle("tres", on);
    svg.style.display = on ? "none" : "";
    tip.hidden = true;
    if (on && !mounting) {
      const host = el("div", { class: "terr-map" }), label = el("span", { class: "etiqueta-3d", "aria-hidden": "true" });
      mapa.append(host, label);
      const state = newState();
      mounting = territory(host, geo, store.municipios, { label, state }).then((ok) => {
        if (ok) { Object.assign(state, { cam: 1, bias: 0 }); state3d = state; paint3d(); return; }
        show3d(false);
        b3d.disabled = true;
        b3d.title = "Este navegador no puede dibujar el mapa en 3D";
        announce("Este navegador no puede dibujar el mapa en 3D");
      });
    }
    mapa.querySelector(".terr-map")?.toggleAttribute("hidden", !on);
    mapa.querySelector(".etiqueta-3d")?.toggleAttribute("hidden", !on);
    document.getElementById("mapa-nota").textContent = on ? "En 3D, la altura y el color dicen lo mismo que el mapa plano. Elige el municipio en la barra de arriba o en la lista." : "";
  };
  b2d.addEventListener("click", () => show3d(false));
  b3d.addEventListener("click", () => show3d(true));

  /* Barra: municipio y tipo */
  const pick = document.getElementById("elige-muni");
  pick.append(...store.codes.map((c) => el("option", { value: c, text: store.municipios[c].nombre })));
  pick.addEventListener("change", () => choose({ code: pick.value }));
  const tipoSel = document.getElementById("elige-tipo");
  tipoSel.append(el("option", { value: "", text: "Todos" }), ...store.typeKeys.map((t) => el("option", { value: t, text: shortType(t) })));
  tipoSel.addEventListener("change", () => { S.tipo = tipoSel.value || null; S.todos = false; paint(false); announce(S.tipo ? `Solo ${store.typeName(S.tipo)}` : "Todos los tipos"); });
  document.getElementById("busca").addEventListener("click", (e) => { e.preventDefault(); pick.focus(); try { pick.showPicker(); } catch { /* sin showPicker: queda el foco */ } });

  /* Ficha del municipio elegido */
  const ficha = document.getElementById("ficha");
  function paintFicha(animate) {
    const I = ind(), m = store.municipios[S.code], x = I.valor(m);
    ficha.replaceChildren(
      el("p", { class: "ind", text: I.titulo }),
      el("div", { class: "fila1" }, [el("p", { class: "muni", text: m.nombre }), el("p", { class: "valor", text: x ? I.texto(x) : "Sin dato" })]),
      el("div", { class: "fila2" }, [
        el("p", { class: "tipo" }, [el("span", { class: "dot", style: `background:${TYPE_COLORS[m.tipo]}`, "aria-hidden": "true" }), store.typeName(m.tipo)]),
        el("a", { class: "btn primary", href: fichaUrl(S.code), rel: "noopener" }, [el("span", { text: "Ver su ficha" }), ico("i-arrow")]),
      ]),
      el("p", { class: "fuente" }, [el("b", { text: "Cálculo propio" }), ` con ${I.fuente.replace(/^Cálculo propio con /, "")}`]),
    );
    if (animate) restart(ficha);
  }

  /* Lista de 113, con barras */
  const bandas = document.getElementById("bandas"), mas = document.getElementById("mas"), cuenta = document.getElementById("cuenta");
  mas.addEventListener("click", () => { S.todos = !S.todos; paintList(); });
  function paintList() {
    const I = ind();
    const rows = ranking(store, I, S.tipo);
    const shown = S.todos ? rows : rows.slice(0, FIRST);
    const max = Math.max(0, ...rows.map((r) => r.x.v)) || 1;
    bandas.classList.toggle("todos", S.todos);
    bandas.replaceChildren(...shown.map(({ code, m, x }) => {
      const w = x.v > 0 ? Math.max(1.5, (x.v / max) * 100) : 0;
      const b = el("button", { type: "button", class: code === S.code ? "sel" : "", "aria-current": code === S.code ? "true" : false }, [
        el("span", { class: "dot", style: `background:${TYPE_COLORS[m.tipo]}`, title: store.typeName(m.tipo) }),
        el("span", { class: "name", text: m.nombre }),
        el("span", { class: `liquid${w ? "" : " cero"}`, style: `width:${w || 100}%`, "aria-hidden": "true" }),
        el("span", { class: "v", text: I.texto(x).replace(" (aproximado)", "*") }),
      ]);
      b.addEventListener("click", () => choose({ code }));
      return el("li", {}, [b]);
    }));
    if (!rows.length) bandas.replaceChildren(el("li", { class: "vacio", text: S.tipo ? `Ningún municipio de «${shortType(S.tipo)}» tiene este dato.` : "Ningún municipio tiene este dato." }));
    mas.hidden = rows.length <= FIRST;
    mas.textContent = S.todos ? "Ver los diez primeros" : `Ver los ${rows.length}`;
    const approx = shown.some((r) => r.x.aprox);
    cuenta.textContent = `${rows.length} municipios con dato. ${I.fuente}.${approx ? " *Aproximado: precio medio de su área." : ""}`;
  }

  /* Pintar todo desde el estado */
  function paint(change) {
    const I = ind();
    for (const [c, p] of Object.entries(paths)) {
      const m = store.municipios[c], x = I.valor(m);
      p.style.fill = x ? I.color(x.v) : NO_DATA;
      p.classList.toggle("sel", c === S.code);
      p.classList.toggle("dim", !!S.tipo && m.tipo !== S.tipo);
    }
    paths[S.code].parentNode.append(paths[S.code]); // el elegido, encima, para que se vea todo su borde
    const [lo, hi] = I.leyenda;
    const sinDato = store.codes.some((c) => !I.valor(store.municipios[c]));
    ramp.replaceChildren(
      el("div", { class: "rb", style: `background: linear-gradient(90deg, ${I.muestras.map(I.color).join(", ")})` }),
      el("div", { class: "ends" }, [el("span", { text: lo }), el("span", { text: hi })]),
      sinDato ? el("div", { class: "nd" }, [el("span", { class: "nd-sw", "aria-hidden": "true" }), "Sin dato"]) : "",
    );
    pick.value = S.code;
    paintFicha(change?.code);
    paint3d();
    paintList();
  }
  function choose({ i, code }) {
    const prev = { i: S.i, code: S.code };
    if (i != null) { S.i = i; S.todos = false; }
    if (code && Object.hasOwn(store.municipios, code)) S.code = code;
    const changed = { i: prev.i !== S.i, code: prev.code !== S.code };
    if (!changed.i && !changed.code) return;
    if (changed.i) paintKeybox(true);
    paint(changed);
    announce(changed.i ? `Mapa y lista: ${ind().titulo}` : `${store.municipios[S.code].nombre}: ${ficha.querySelector(".valor").textContent}`);
  }

  /* Cuatro cartas a las demás pestañas: las cifras se CALCULAN con los datos, como en la web original (situacion/cartas.js:9-14) */
  const p50 = acceso.bizkaia_tramos.find((r) => r.tramo.includes("P50"));
  const cartas = [
    ["#municipios", "Municipios", es(store.codes.length), "fichas", "Cada municipio frente a Bizkaia y a los de su tipo, con su plan de medidas."],
    ["#acceso", "Acceso", `${es(p50.años[0], 1)} a ${es(p50.años[1], 1)}`, "años para la entrada", "Cuánto se tarda en reunir la entrada y cuánto cuesta alquilar, con tus supuestos."],
    ["#medidas", "Medidas", es(medidas.medidas.length), "medidas comparadas", "Por evidencia, plazo, coste y quién decide cada una."],
    ["#normas", "Normas", es(normas.niveles.length), "niveles de gobierno", "Quién decide cada herramienta, del Estado a los ayuntamientos."],
  ];
  document.getElementById("herramientas").replaceChildren(...cartas.map(([h, n, num, rot, desc]) => el("li", {}, [
    el("a", { class: "tool", href: `${ORIGEN}${h}`, rel: "noopener" }, [el("span", { class: "nombre", text: n }), el("span", { class: "num", text: num }), el("span", { class: "rot", text: rot }), el("span", { class: "desc", text: desc })]),
  ])));

  paintKeybox(false);
  paint(null);
}

main().catch((err) => {
  console.error(err);
  const mapa = document.getElementById("mapa");
  mapa.removeAttribute("aria-busy");
  mapa.querySelector(".cargando")?.replaceChildren("No se han podido cargar los datos.");
});
