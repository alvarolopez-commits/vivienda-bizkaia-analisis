// Sprint 02 · Living Atlas (Atlas 2D + Intelligence). PROTOTIPO aislado, no integrado en la web publicada.
//
// Un único estado para la vista: { problema, municipio, tipo, búsqueda }. El mapa, la leyenda, la cobertura, la ficha y
// la lista leen ese estado y se pintan a la vez, así que no pueden divergir (en la web original hay tres selectores de
// problema independientes: escena, mapa vivo y lista).
//
// Origen de todo lo que se muestra (carpeta original/, ficheros copiados byte a byte de la web servida, sha256 comprobado):
//   · datos: data/municipios.json, municipios.geojson, meta.json, resumen.json (y medidas.json, que pide store.js)
//   · indicadores, valores, formato, colores, leyendas y ranking: js/situacion/indicadores.js
//   · orden de los municipios, nombres de tipo: js/store.js · formato de números y fuentes: js/ui.js
// Los textos nuevos de interfaz llevan data-propuesta (PROPUESTA_MICROCOPY) y están listados en LIVING_ATLAS_UX_DECISIONS.md.
import { announce, reduced } from "../../original/js/comun.js";
import { el, es, sourceLine, TYPE_COLORS } from "../../original/js/ui.js";
import { INDICADORES, ranking } from "../../original/js/situacion/indicadores.js";
import { crearMapa } from "./mapa-atlas.js";
import { filaContexto, fijar } from "../contexto.js";
import { botonInfo, descSituacion } from "../info-dato.js";

const FIRST = 10; // como lista.js: diez primeros y un botón para ver todos (solo cuando la lista no tiene su propio scroll)
const $ = (s) => document.querySelector(s);
// mismo formato de fecha que main.js original
const dateLabel = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }); };
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); // solo para buscar: no cambia ningún nombre
const prop = (node) => { node.setAttribute("data-propuesta", ""); return node; };
const listaConScroll = () => matchMedia("(min-width: 1100px)").matches;

/** Monta la vista Situación (Living Atlas) en `raiz`. El almacén de datos es el único de la aplicación. */
export async function montar(raiz, { store }) {
  const baja = []; // oyentes globales que hay que quitar al salir de la vista
  raiz.innerHTML = await (await fetch(new URL("./plantilla.html", import.meta.url))).text();
  const TOTAL = store.codes.length;

  // ---------- estado único ----------
  const S = { i: 0, code: null, tipo: null, q: "", todos: false };
  const ind = () => INDICADORES[S.i];
  const valorDe = (c, x = ind()) => x.valor(store.municipios[c]);
  const rankAll = INDICADORES.map((x) => ranking(store, x)); // orden y recuento originales, sin filtro de tipo
  const puesto = (c, i = S.i) => rankAll[i].findIndex((r) => r.code === c);

  // ---------- URL compartible (PROPUESTA de formato, compatible con rutas.js: #situacion/<indicador>/<INE>) ----------
  const fromHash = () => {
    const [ruta, qs = ""] = location.hash.replace(/^#/, "").split("?");
    const [view, a, b] = ruta.split("/");
    if (view !== "situacion") return null;
    const i = INDICADORES.findIndex((x) => x.id === a);
    // los filtros de la lista (tipo de municipio y búsqueda) viajan en la query: #situacion/<indicador>/<INE>?tipo=<tipo>&q=<texto>
    const q = new URLSearchParams(qs);
    const tipo = q.get("tipo");
    return { i: i < 0 ? 0 : i, code: b && Object.hasOwn(store.municipios, b) ? b : null, tipo: store.typeKeys.includes(tipo) ? tipo : null, q: (q.get("q") ?? "").slice(0, 60) };
  };
  const toHash = () => {
    const q = new URLSearchParams();
    if (S.tipo) q.set("tipo", S.tipo);
    if (S.q.trim()) q.set("q", S.q.trim());
    const qs = q.toString();
    return `#situacion/${ind().id}${S.code ? `/${S.code}` : ""}${qs ? `?${qs}` : ""}`;
  };
  const sincronizarFiltros = () => { tipoSel.value = S.tipo ?? ""; buscar.value = S.q; };

  // ---------- información del dato (fuente, periodo, cobertura, naturaleza) junto al título del indicador ----------
  { const titulo = $("#ind-titulo"), cab = el("div", { class: "ind-cab" });
    titulo.before(cab);
    cab.append(titulo, botonInfo(() => descSituacion(store, ind(), rankAll[S.i].length, TOTAL), { etiqueta: "Información sobre este indicador: fuente, periodo y cobertura" })); }

  // ---------- mapa ----------
  const tip = $("#tip");
  const mapa = crearMapa($("#mapa"), store, {
    tip,
    onPick: (c) => set({ code: c }, { anuncio: true }),
    describe: (c) => { const x = valorDe(c); return { nombre: store.municipios[c].nombre, valor: x ? ind().texto(x) : "Sin dato" }; },
  });
  const acercar = $("#acercar"), alejar = $("#alejar");
  mapa.bindZoomButtons(acercar, alejar);
  acercar.addEventListener("click", mapa.zoomIn);
  alejar.addEventListener("click", mapa.zoomOut);
  $("#restablecer").addEventListener("click", () => { mapa.reset(); set({ code: null }); announce("Vista general de Bizkaia"); });

  // ---------- los cinco problemas ----------
  const tabs = INDICADORES.map((x, i) => {
    const stops = x.muestras.map(x.color).join(", ");
    return el("button", { type: "button", class: "problema", "aria-pressed": "false", "data-i": String(i) }, [
      el("span", { class: "p1", text: x.corto }),
      el("span", { class: "p2", text: `${rankAll[i].length} con dato` }),
      el("span", { class: "p3", style: `background: linear-gradient(90deg, ${stops})`, "aria-hidden": "true" }),
    ]);
  });
  $("#problemas").replaceChildren(...tabs);
  tabs.forEach((b, i) => {
    b.addEventListener("click", () => set({ i }, { anuncio: true }));
    b.addEventListener("keydown", (e) => { // flechas entre los cinco, como un grupo de opciones
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      const j = (i + d + tabs.length) % tabs.length;
      tabs[j].focus(); set({ i: j }, { anuncio: true });
    });
  });

  // ---------- filtro de tipo (el de lista.js, en un desplegable) y búsqueda ----------
  const tipoSel = $("#tipo");
  tipoSel.replaceChildren(el("option", { value: "", text: "Todos" }), ...store.typeKeys.map((t) => el("option", { value: t, text: store.typeName(t).split(" (")[0] })));
  tipoSel.addEventListener("change", () => { set({ tipo: tipoSel.value || null, todos: false }); announce(S.tipo ? `Solo ${store.typeName(S.tipo)}` : "Todos los tipos"); });
  const buscar = $("#buscar");
  buscar.addEventListener("input", () => set({ q: buscar.value }));
  buscar.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { const f = $("#filas .fila"); if (f) { e.preventDefault(); set({ code: f.dataset.code }, { anuncio: true }); } }
    if (e.key === "Escape" && buscar.value) { e.preventDefault(); buscar.value = ""; set({ q: "" }); }
  });
  $("#mas").addEventListener("click", () => set({ todos: !S.todos }));

  // ---------- pintado ----------
  const pintarProblemas = () => tabs.forEach((b, i) => b.setAttribute("aria-pressed", String(i === S.i)));

  const pintarMapa = (animate, sweep) => {
    const x = ind();
    const target = Object.fromEntries(store.codes.map((c) => { const v = valorDe(c, x); return [c, v ? x.color(v.v) : mapa.SIN_DATO]; }));
    mapa.paint(target, { animate, sweep });
    mapa.label();
    mapa.refreshTip();
  };

  // leyenda: la misma rampa que legend() de mapa-vivo.js (muestras → color), más la trama de «Sin dato» y la cobertura
  const pintarLeyenda = () => {
    const x = ind(), [lo, hi] = x.leyenda, n = rankAll[S.i].length;
    $("#leyenda").replaceChildren(
      el("p", { class: "leyenda" }, [el("span", { text: lo }), el("span", { class: "rampa", style: `background: linear-gradient(90deg, ${x.muestras.map(x.color).join(", ")})` }), el("span", { text: hi })]),
      el("p", { class: "ley-sin" }, [el("span", { class: "muestra-sin", "aria-hidden": "true" }), "Sin dato"]),
      prop(el("p", { class: "cobertura" }, [el("strong", { text: `${n}` }), ` de ${TOTAL} municipios con dato`,
        el("span", { class: "cob-barra", "aria-hidden": "true" }, [el("i", { style: `width:${(100 * n / TOTAL).toFixed(1)}%` })])])),
    );
    $("#ind-titulo").textContent = x.titulo;
  };

  // fuente con el formato de mapa-vivo.js
  const fuenteInd = (x) => el("p", { class: "fuente" }, [el("span", { class: "etiqueta", text: "Cálculo propio" }), ` con ${x.fuente.replace(/^Cálculo propio con /, "")}`]);

  const pintarFicha = (animar) => {
    const x = ind(), f = $("#ficha");
    let nodes;
    if (!S.code) {
      // sin municipio: el problema en Bizkaia, literal de resumen.json
      const p = store.resumen.problemas.find((r) => r.id === x.problema);
      nodes = [
        prop(el("p", { class: "ficha-rotulo", text: "El problema en Bizkaia" })),
        el("h2", { class: "ficha-problema", text: p.titulo }),
        el("p", { class: "ficha-cifra", text: p.cifra }),
        el("p", { class: "ficha-unidad", text: p.unidad }),
        prop(el("p", { class: "ficha-pista", text: "Toca un municipio en el mapa o elígelo en la lista." })),
      ];
      f.dataset.modo = "bizkaia";
    } else {
      const m = store.municipios[S.code], v = valorDe(S.code), k = puesto(S.code), n = rankAll[S.i].length;
      nodes = [
        el("div", { class: "ficha-cab" }, [
          el("p", { class: "ficha-tipo" }, [el("span", { class: "punto-tipo", style: `background:${TYPE_COLORS[m.tipo]}`, "aria-hidden": "true" }), store.typeName(m.tipo)]),
          prop(el("button", { type: "button", class: "ficha-cerrar", "aria-label": "Volver a Bizkaia", title: "Volver a Bizkaia" }, [el("span", { "aria-hidden": "true", text: "×" })])),
        ]),
        el("div", { class: "ficha-nombre" }, [
          el("h2", { class: "ficha-muni", text: m.nombre }),
          el("a", { class: "btn primary ir", href: `#municipios/${S.code}`, title: "La ficha de este municipio en Municipios" }, [el("span", { text: "Ver su ficha" }), el("span", { "aria-hidden": "true", text: "→" })]),
        ]),
        prop(el("p", { class: "ficha-meta", text: `${m.comarca} · ${es(m.poblacion)} habitantes` })),
        el("div", { class: "ficha-dato" }, [
          el("p", { class: "ficha-ind", text: x.titulo }),
          el("p", { class: "ficha-linea" }, [
            el("span", { class: `ficha-valor${v ? "" : " sin"}`, text: v ? x.texto(v).replace(" (aproximado)", "*") : "Sin dato" }),
            v ? prop(el("span", { class: "ficha-puesto", text: `Puesto ${k + 1} de ${n} con dato` })) : null,
          ]),
          v?.aprox ? el("p", { class: "nota", text: "*Aproximado: precio medio de su área." }) : null,
        ]),
        el("div", { class: "perfil" }, [
          prop(el("p", { class: "perfil-t", text: "Sus cinco problemas" })),
          el("ul", {}, INDICADORES.map((y, j) => {
            const w = valorDe(S.code, y);
            return el("li", {}, [el("button", { type: "button", class: "perfil-b", "aria-pressed": String(j === S.i), "data-i": String(j) }, [
              el("span", { class: `perfil-sw${w ? "" : " sin"}`, style: w ? `background:${y.color(w.v)}` : null, "aria-hidden": "true" }),
              el("span", { class: "perfil-n", text: y.corto }),
              el("span", { class: "perfil-v", text: w ? y.texto(w).replace(" (aproximado)", "*") : "Sin dato" }),
            ])]);
          })),
        ]),
        fuenteInd(x),
        filaContexto("situacion", { clase: "en-ficha" }),
      ];
      f.dataset.modo = "municipio";
    }
    f.replaceChildren(...nodes.filter(Boolean));
    // «Fuentes: …» del problema: el mismo elemento de siempre (sourceLine del original), ahora al pie de la página y siempre visible
    $("#fuentes-pie").replaceChildren(...[sourceLine(store.resumen.problemas.find((r) => r.id === x.problema).fuentes, store.fuentes)].filter(Boolean));
    // cerrar devuelve el foco al municipio en el mapa, para seguir con las flechas
    f.querySelector(".ficha-cerrar")?.addEventListener("click", () => { const c = S.code; set({ code: null }, { anuncio: true }); mapa.focusCode(c); });
    f.querySelectorAll(".perfil-b").forEach((b) => b.addEventListener("click", () => set({ i: Number(b.dataset.i) }, { anuncio: true })));
    if (animar && !reduced()) f.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 220, easing: "cubic-bezier(.16,1,.3,1)" });
  };

  const pintarLista = (animar) => {
    const x = ind(), filas = $("#filas");
    const rows = ranking(store, x, S.tipo); // la función original: de mayor a menor, sin los que no tienen dato
    const q = norm(S.q.trim());
    const match = (c) => !q || norm(store.municipios[c].nombre).includes(q);
    const vis = rows.filter((r) => match(r.code));
    const corta = !listaConScroll() && !q && !S.todos;
    let shown = corta ? vis.slice(0, FIRST) : vis;
    // en la lista corta, el municipio elegido se añade al final (con su puesto real) para que la selección siempre se vea
    const fuera = corta && S.code && !shown.some((r) => r.code === S.code) ? vis.find((r) => r.code === S.code) : null;
    if (fuera) shown = [...shown, fuera];
    filas.replaceChildren(...shown.map(({ code, m, x: v }) => el("li", { class: code === fuera?.code ? "fila-fuera" : null }, [el("button", { type: "button", class: "fila", "aria-pressed": String(code === S.code), "data-code": code }, [
      el("span", { class: "pos", text: String(puesto(code) + 1) }),
      el("span", { class: "nom" }, [el("span", { class: "n", text: m.nombre }), el("span", { class: "t", title: store.typeName(m.tipo) }, [el("span", { class: "punto-tipo", style: `background:${TYPE_COLORS[m.tipo]}`, "aria-hidden": "true" }), el("span", { class: "solo-lectores", text: `, ${store.typeName(m.tipo)}` })])]),
      el("span", { class: "v", text: x.texto(v).replace(" (aproximado)", "*") }),
      el("span", { class: "barra", "aria-hidden": "true" }, [el("i", { style: `width:${(100 * Math.max(0.015, Math.min(1, x.altura(v.v)))).toFixed(1)}%;background:${x.color(v.v)}` })]),
    ])])));
    if (!shown.length) filas.append(prop(el("li", { class: "vacia", text: "Ningún municipio con dato coincide con la búsqueda." })));

    const mas = $("#mas");
    mas.hidden = listaConScroll() || !!q || rows.length <= FIRST;
    mas.textContent = S.todos ? "Ver los diez primeros" : `Ver los ${rows.length}`;

    // municipios sin dato para este problema: visibles y elegibles, nunca convertidos en cero
    const sin = store.codes.filter((c) => !valorDe(c) && (!S.tipo || store.municipios[c].tipo === S.tipo) && match(c));
    const det = $("#sin-dato");
    det.hidden = !sin.length;
    det.querySelector("summary").textContent = `${sin.length} sin dato`;
    det.querySelector("summary").setAttribute("data-propuesta", "");
    det.querySelector("ul").replaceChildren(...sin.map((c) => el("li", {}, [el("button", { type: "button", class: "sin-b", "aria-pressed": String(c === S.code), "data-code": c, text: store.municipios[c].nombre })])));
    if (q && sin.length && !vis.length) det.open = true;

    // nota de recuento literal de lista.js
    const approx = shown.some((r) => r.x.aprox);
    $("#lista-nota").textContent = `${rows.length} municipios con dato. ${x.fuente}.${approx ? " *Aproximado: precio medio de su área." : ""}`;

    if (animar && !reduced()) filas.animate([{ opacity: .25 }, { opacity: 1 }], { duration: 200, easing: "ease-out" });
    marcarFila(false);
  };

  // resalta la fila elegida sin rehacer la lista; en escritorio la lleva a la vista dentro de su propio scroll
  const marcarFila = (scroll) => {
    document.querySelectorAll("#filas .fila, #sin-dato .sin-b").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.code === S.code)));
    if (scroll && S.code && listaConScroll()) {
      const f = document.querySelector(`#filas .fila[data-code="${S.code}"]`);
      const box = $("#lista-scroll");
      if (f) {
        const r = f.getBoundingClientRect(), b = box.getBoundingClientRect();
        if (r.top < b.top || r.bottom > b.bottom) box.scrollTo({ top: box.scrollTop + r.top - b.top - b.height / 2 + r.height / 2, behavior: reduced() ? "auto" : "smooth" });
      }
    }
  };

  const listaClick = (e) => {
    const b = e.target.closest("[data-code]");
    if (!b) return;
    set({ code: b.dataset.code }, { anuncio: true, desdeLista: true });
  };
  $("#filas").addEventListener("click", listaClick);
  $("#sin-dato").addEventListener("click", listaClick);

  // ---------- set: el único punto que cambia el estado ----------
  function set(patch, { anuncio = false, desdeLista = false } = {}) {
    const prev = { ...S };
    Object.assign(S, patch);
    const cambiaInd = prev.i !== S.i, cambiaMuni = prev.code !== S.code;
    if (cambiaInd) S.todos = false;

    if (cambiaInd) { pintarProblemas(); pintarMapa(true, false); pintarLeyenda(); }
    if (cambiaInd || cambiaMuni) { mapa.select(S.code); pintarFicha(true); }
    if (cambiaInd || prev.tipo !== S.tipo || prev.q !== S.q || prev.todos !== S.todos || (cambiaMuni && !listaConScroll())) pintarLista(cambiaInd);
    if (cambiaMuni) marcarFila(true);

    // en móvil, elegir desde la lista lleva al mapa para ver dónde está (en escritorio el mapa ya está a la vista)
    if (desdeLista && cambiaMuni && S.code && !listaConScroll()) {
      document.querySelector(".lienzo").scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
    }

    fijar({ problema: ind().id, muni: S.code });
    if (location.hash === "" || location.hash.startsWith("#situacion")) history.replaceState(null, "", toHash());
    if (anuncio) {
      if (cambiaInd) announce(`Mapa: ${ind().titulo}`);
      else if (S.code) { const v = valorDe(S.code); announce(`${store.municipios[S.code].nombre}: ${v ? ind().texto(v) : "Sin dato"}`); }
      else announce("Vista general de Bizkaia");
    }
  }

  // el router de la aplicación avisa de los cambios de dirección (alCambiarDireccion); aquí solo el cambio de ancho de pantalla
  const alCambiarDireccion = () => { const h = fromHash(); if (h && (h.i !== S.i || h.code !== S.code || h.tipo !== S.tipo || h.q !== S.q)) { set(h); sincronizarFiltros(); } };
  const mq = matchMedia("(min-width: 1100px)"), alCambiarAncho = () => pintarLista(false);
  mq.addEventListener("change", alCambiarAncho);
  baja.push(() => mq.removeEventListener("change", alCambiarAncho));

  // ---------- arranque: la entrada se reproduce una sola vez por sesión ----------
  let primera = true;
  try { primera = !sessionStorage.getItem("atlas-entrada"); sessionStorage.setItem("atlas-entrada", "1"); } catch { /* sin almacenamiento: se reproduce */ }
  const h = fromHash() || { i: 0, code: null, tipo: null, q: "" };
  Object.assign(S, { i: h.i, code: h.code, tipo: h.tipo, q: h.q });
  sincronizarFiltros();
  $("#fecha").textContent = `Datos descargados el ${dateLabel(store.meta.fecha_datos)}. Solo totales y porcentajes: ninguna cifra identifica a una persona.`;
  document.querySelector(".lienzo").classList.toggle("entrada", primera && !reduced());
  pintarProblemas();
  pintarMapa(primera, true);
  pintarLeyenda();
  mapa.select(S.code);
  pintarFicha(false);
  pintarLista(false);
  fijar({ problema: ind().id, muni: S.code });
  history.replaceState(null, "", toHash());
  $("#atlas").setAttribute("aria-busy", "false");
  window.__atlas = { S, store, set }; // solo para las pruebas de _qa
  return { alCambiarDireccion, desmontar: () => { baja.forEach((f) => f()); delete window.__atlas; } };
}
