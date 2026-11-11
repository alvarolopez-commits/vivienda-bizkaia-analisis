// Comparador municipal (Mejora C). Se aplica SOLO cuando hay dos municipios (#municipios/A-B) y recompone lo que dibuja el renderizador ORIGINAL
// (app/original/js/municipios, que no se toca): mismos 13 indicadores, mismas cifras, mismos puestos y mismas notas; solo cambia cómo se presentan.
//
//   · Indicadores enfrentados: municipio A · pista · municipio B · diferencia (B − A). La diferencia solo se calcula cuando AMBOS tienen dato del mismo
//     indicador (misma unidad); si falta uno se escribe «sin dato» y no hay diferencia. Sin colores de «mejor/peor», sin rankings ni notas agregadas.
//   · Alquilar y comprar: una sola tabla con los dos municipios (se reutiliza el texto de cada celda del original) y, debajo, la naturaleza del precio de
//     cada uno: observado (compraventas de 2025 en el municipio) u orientativo (el aproximado del original, con su nota).
//   · Problemas: dos columnas (como el original). Evolución, Barrios y Plan: cada municipio en su columna, con los mismos componentes originales y sin
//     ninguna cifra cruzada (no existe un modelo de datos de comparación para ellos).
import { barrios, plan, series } from "../../original/js/municipios/ficha.js";
import { DOTS } from "../../original/js/municipios/puntos.js";
import { approxTag, el, es, euros, isNum } from "../../original/js/ui.js";

const $ = (s, r) => r.querySelector(s);
const $$ = (s, r) => [...r.querySelectorAll(s)];

/** Cómo se escribe la diferencia de cada indicador: «puntos» para porcentajes y cambios porcentuales, euros, por 1.000 y años. */
const UNIDAD = {
  esfuerzo_alquiler_P25: "puntos", esfuerzo_alquiler: "puntos", subida_alquiler: "puntos", pct_alquiler: "puntos", pct_pobreza: "puntos", pct_no_principales: "puntos",
  crec_hogares: "puntos", crecimiento_parque: "puntos", pct_ascensor: "puntos", pct_mayores_65: "puntos",
  renta_persona: "euros", vut_por_1000: "por 1.000", antiguedad_media: "años",
};

/** B − A con signo y unidad, o null si no son comparables (falta algún dato o no hay unidad definida). */
export function diferencia(key, vA, vB) {
  const u = UNIDAD[key];
  if (!u || !isNum(vA) || !isNum(vB)) return null;
  const d = vB - vA;
  const signo = d > 0 ? "+" : d < 0 ? "−" : "";
  if (u === "euros") return Math.round(d) === 0 ? "0 €" : `${signo}${euros(Math.abs(Math.round(d)))}`;
  const x = es(Math.abs(d), 1);
  if (x === es(0, 1)) return `0 ${u}`;
  return `${signo}${x} ${u}`;
}

export function componerComparacion({ raiz, store, A, B }) {
  const ficha = $(".ficha", raiz);
  if (!ficha || !A || !B) return;
  ficha.classList.add("cmp");
  const mA = store.municipios[A], mB = store.municipios[B];
  const cabs = $$(".cabeceras .muni-cab", ficha);

  // ---------- encabezados: «A» y «B» (los colores son los del gráfico) ----------
  cabs.forEach((c, i) => c.prepend(el("span", { class: `cmp-chip d${i}`, "aria-hidden": "true", text: i ? "B" : "A" })));

  // ---------- acciones: cambiar el orden y volver a la ficha individual ----------
  $(".cabeceras", ficha).after(el("div", { class: "cmp-acciones", role: "group", "aria-label": "Acciones de la comparación" }, [
    el("a", { class: "btn vidrio", href: `#municipios/${B}-${A}`, title: "Poner cada municipio en el lugar del otro", "data-propuesta": "" }, [el("span", { text: "Intercambiar" })]),
    el("a", { class: "btn vidrio", href: `#municipios/${A}`, title: `La ficha individual de ${mA.nombre}`, "data-propuesta": "" }, [el("span", { text: `Ver solo ${mA.nombre}` })]),
    el("a", { class: "btn vidrio", href: `#municipios/${B}`, title: `La ficha individual de ${mB.nombre}`, "data-propuesta": "" }, [el("span", { text: `Ver solo ${mB.nombre}` })]),
  ]));

  // ---------- indicadores enfrentados ----------
  const lista = $(".filas-ind", ficha);
  if (lista) {
    const filas = [...lista.children];
    filas.forEach((li, i) => {
      const [key] = DOTS[i] ?? [];
      const d = diferencia(key, mA.indicadores[key], mB.indicadores[key]);
      li.dataset.indicador = key;
      li.append(d
        ? el("span", { class: "cmp-dif" }, [el("b", { text: d }), el("span", { class: "sr-only", text: ` (${mB.nombre} menos ${mA.nombre})` })])
        : el("span", { class: "cmp-dif sin" }, [el("span", { "aria-hidden": "true", text: "no comparable" }), el("span", { class: "sr-only", text: "Sin diferencia: falta el dato de algún municipio" })]));
    });
    lista.before(el("div", { class: "cmp-cols", "aria-hidden": "true" }, [
      el("span", { text: "Indicador" }),
      el("span", { class: "cmp-col d0" }, [el("i", { text: "A" }), mA.nombre]),
      el("span", { text: "Entre los 113 municipios" }),
      el("span", { class: "cmp-col d1" }, [el("i", { text: "B" }), mB.nombre]),
      el("span", { "data-propuesta": "", text: "Diferencia (B − A)" }),
    ]));
  }

  // ---------- Alquilar y comprar: una sola tabla ----------
  const sec = $("#hogares", ficha);
  const colsH = sec ? $$(".columnas > div", sec) : [];
  if (sec && colsH.length === 2) {
    const tablas = colsH.map((c) => $(".tabla", c)), notas = colsH.map((c) => $(".fuente", c));
    const filasH = tablas.map((t) => $$(".fila:not(.cab)", t));
    const cab = $$(".fila.cab > span", tablas[0]).map((s) => s.textContent);   // los títulos de columna del original
    const th = (t, extra = {}) => el("th", { scope: "col", ...extra, text: t });
    const tabla = el("table", { class: "cmp-hogares" }, [
      el("caption", { class: "sr-only", text: `Alquilar y comprar según los ingresos del hogar: ${mA.nombre} y ${mB.nombre}` }),
      el("thead", {}, [
        el("tr", {}, [el("td", { rowspan: "2" }), ...cab.slice(1).map((t) => el("th", { scope: "colgroup", colspan: "2", class: "grupo", text: t }))]),
        el("tr", {}, [0, 1, 2].flatMap(() => [th(mA.nombre, { class: "d0" }), th(mB.nombre, { class: "d1" })])),
      ]),
      el("tbody", {}, filasH[0].map((fa, i) => {
        const fb = filasH[1][i], a = $$(":scope > span", fa), b = $$(":scope > span", fb);
        return el("tr", {}, [el("th", { scope: "row", text: a[0].textContent }), ...[1, 2, 3].flatMap((j) => [el("td", { class: "d0", text: a[j].textContent }), el("td", { class: "d1", text: b[j].textContent })])]);
      })),
    ]);
    const naturaleza = [[mA, notas[0]], [mB, notas[1]]].map(([m, n], i) => {
      const observado = Boolean(m.compra?.precio), orientativo = !observado && Boolean(m.compra?.orientativo);
      return el("li", { class: `cmp-precio d${i}` }, [
        el("b", { text: m.nombre }),
        observado ? el("span", { class: "cmp-etq", "data-propuesta": "", text: "Precio observado" }) : orientativo ? el("span", { class: "cmp-etq aprox", "data-propuesta": "", text: "Precio orientativo" }) : el("span", { class: "cmp-etq", "data-propuesta": "", text: "Sin precio de compra" }),
        orientativo ? approxTag() : null,
        n ? el("span", { class: "cmp-nota", text: n.textContent }) : null,
      ]);
    });
    $(".columnas", sec).replaceWith(el("div", { class: "cmp-hogares-caja" }, [tabla, el("ul", { class: "cmp-precios" }, naturaleza)]));
  }

  // ---------- Evolución, Barrios y Plan: cada municipio en su columna (mismos componentes originales, sin cifras cruzadas) ----------
  const seccion = (id, titulo, sub, cuerpo, capitulo) => el("section", { class: "sec ficha-sec", id, "aria-labelledby": `${id}-t`, "data-capitulo": capitulo }, [
    el("div", { class: "sec-cab" }, [el("h2", { id: `${id}-t`, text: titulo }), sub ? el("p", { class: "sub", text: sub }) : null]),
    el("div", { class: "sec-cuerpo" }, [cuerpo]),
  ]);
  const columnas = (fn) => el("div", { class: "columnas n2" }, [[A, mA], [B, mB]].map(([c, m]) => el("div", {}, [el("h3", { text: m.nombre }), fn(c, m)])));
  const barriosCaja = columnas((c) => el("div", { "data-barrios-cmp": c }, [el("p", { class: "vacio", text: "Cargando los barrios…" })]));
  ficha.append(
    seccion("evolucion", "Cómo ha cambiado", null, columnas((c, m) => series(m)), "Evolución"),
    seccion("barrios", "Sus barrios", "En color, los barrios con algún problema de barrio (sección censal).", barriosCaja, "Barrios"),
    seccion("plan", "Su plan de medidas", `Hasta ${store.medidas.plan_maximo} medidas: primero las probadas.`, columnas((c) => plan(store, c)), "Plan"),
  );
  [A, B].forEach((c) => barrios(store, c, store.problemName).then((caja) => $(`[data-barrios-cmp="${c}"]`, ficha)?.replaceChildren(caja))
    .catch((err) => { console.error("Barrios:", err); $(`[data-barrios-cmp="${c}"]`, ficha)?.replaceChildren(el("p", { class: "vacio", text: "No se pudieron cargar los barrios." })); }));
}
