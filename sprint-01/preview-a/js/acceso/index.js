// Acceso: alquilar y comprar. Cuatro partes: lo que se lleva el alquiler en cada municipio (ingresos bajos y medios), la
// escalera del acceso de cada hogar de Bizkaia, el explorador de supuestos con su rejilla de años y «¿Hasta dónde llega
// mi hogar?», el mapa que se colorea con los ingresos y el ahorro del lector.
import { el, es, euros, isNum } from "../ui.js";
import { alcance } from "./alcance.js";
import { explorador } from "./explorador.js";

const LONG = 10;
const section = (id, title, sub, body, capitulo, fuente) => el("section", { class: "sec", id, "aria-labelledby": `${id}-t`, "data-capitulo": capitulo }, [
  el("div", { class: "sec-cab" }, [el("h2", { id: `${id}-t`, "data-reveal": "heading", text: title }), sub ? el("p", { class: "sub", text: sub }) : null]),
  el("div", { class: "sec-cuerpo" }, [body]), fuente ? el("p", { class: "fuente" }, fuente) : null,
]);
const at = (v, max) => `${Math.min(100, (100 * v) / max)}%`;

/** Cada municipio con dato propio: dos puntos, el hogar de ingresos bajos y el de medios, y la línea del 30 %. */
function rent(store) {
  const cap = 100 * store.acceso.supuestos.tope_esfuerzo, max = 60;
  const codes = store.codes.filter((c) => isNum(store.municipios[c].indicadores.esfuerzo_alquiler_P25))
    .sort((a, b) => store.municipios[b].indicadores.esfuerzo_alquiler_P25 - store.municipios[a].indicadores.esfuerzo_alquiler_P25);
  const rows = codes.map((c) => {
    const m = store.municipios[c], lo = m.indicadores.esfuerzo_alquiler_P25, mid = m.indicadores.esfuerzo_alquiler;
    return el("li", {}, [el("a", { class: "pesa", href: `#municipios/${c}` }, [
      el("span", { class: "pesa-nombre", text: m.nombre }),
      el("span", { class: "pesa-pista", role: "img", "aria-label": `${m.nombre}: ingresos bajos ${es(lo, 1)} %, medios ${isNum(mid) ? `${es(mid, 1)} %` : "sin dato"}` }, [
        el("span", { class: "tope", style: `left:${at(cap, max)}` }),
        isNum(mid) ? el("span", { class: "barra", style: `left:${at(mid, max)};width:calc(${at(lo, max)} - ${at(mid, max)})` }) : null,
        isNum(mid) ? el("span", { class: "p-medio", style: `left:${at(mid, max)}` }) : null,
        el("span", { class: `p-bajo${lo > cap ? " mal" : ""}`, style: `left:${at(lo, max)}` }),
      ]),
      el("span", { class: "pesa-cifra" }, [el("b", { text: `${es(lo, 1)} %` }), isNum(mid) ? ` · ${es(mid, 1)} %` : ""]),
    ])]);
  });
  const over = codes.filter((c) => store.municipios[c].indicadores.esfuerzo_alquiler_P25 > cap).length;
  return { over, n: codes.length, body: el("div", { class: "pesas" }, [
    el("p", { class: "clave-puntos" }, [el("span", { class: "k-punto d1" }, [el("i", { "aria-hidden": "true" }), "Ingresos bajos"]), el("span", { class: "k-punto" }, [el("i", { "aria-hidden": "true" }), "Ingresos medios"]),
      el("span", { class: "k-bizkaia" }, [el("i", { "aria-hidden": "true" }), `${es(cap)} % de los ingresos`])]),
    el("ol", { class: "filas-pesa" }, rows),
  ]) };
}

/** La escalera: para cada hogar, sus ingresos, el alquiler, los años para la entrada y la cuota, y si cada paso cabe. */
function ladder(store) {
  const s = store.acceso.supuestos, cap = 100 * s.tope_esfuerzo, ref = store.diagnostico.referencia_bizkaia;
  const tier = (k) => store.acceso.bizkaia_tramos.find((r) => r.tramo.includes(k));
  const homes = [["Dos salarios mínimos", tier("Dos salarios"), null], ["Ingresos bajos", tier("P25"), ref.esfuerzo_alquiler_P25],
    ["Hogar de 25 a 29 años", tier("25-29"), null], ["Ingresos medios", tier("P50"), ref.esfuerzo_alquiler],
    ["Ingresos altos", tier("P75"), null]].filter(([, r]) => r);
  // cabe: todo el rango por debajo del límite; no cabe: todo por encima; depende: el rango cruza el límite
  const verdict = (lo, hi, lim) => (hi <= lim ? "bien" : lo > lim ? "mal" : "depende");
  const WORD = { bien: "Cabe", mal: "No cabe", depende: "Depende" };
  const step = (col, state, text) => el("span", { role: "cell", "data-col": col, class: `paso-e ${state ?? "nd"}` }, [state ? el("b", { class: "veredicto", text: WORD[state] }) : null, text]);
  const head = ["Hogar", "1. Ingresos al año", "2. Alquiler nuevo", "3. Ahorrar la entrada", "4. Cuota de la hipoteca"];
  return el("div", { class: "escalera", role: "table", "aria-label": "La escalera del acceso: cada hogar, paso a paso" }, [
    el("div", { class: "esc-fila cab", role: "row" }, head.map((h) => el("span", { role: "columnheader", text: h }))),
    ...homes.map(([name, r, rentPct]) => el("div", { class: "esc-fila", role: "row" }, [
      el("span", { role: "rowheader", text: name }),
      el("span", { role: "cell", "data-col": "Ingresos al año", class: "paso-e", text: `${euros(Math.round(r.renta_neta))}` }),
      step("Alquiler nuevo", isNum(rentPct) ? verdict(rentPct, rentPct, cap) : null, isNum(rentPct) ? `${es(rentPct, 1)} % de los ingresos` : "sin dato para Bizkaia"),
      step("Ahorrar la entrada", verdict(r.años[0], r.años[1], LONG - 1e-9), `${es(r.años[0], 1)} a ${es(r.años[1], 1)} años`),
      step("Cuota de la hipoteca", verdict(r.esfuerzo[0], r.esfuerzo[1], cap), `${es(r.esfuerzo[0], 1)} a ${es(r.esfuerzo[1], 1)} %`),
    ])),
  ]);
}

export function renderAcceso(root, store) {
  const s = store.acceso.supuestos, r = rent(store), p50 = store.acceso.bizkaia_tramos.find((x) => x.tramo.includes("P50"));
  root.replaceChildren(
    el("header", { class: "vista-cab" }, [
      el("h1", { text: "Alquilar y comprar en Bizkaia" }),
      el("p", { class: "sub" }, ["Un hogar de ingresos medios tarda ", el("b", { "data-roll": "", text: es(p50.años[0], 1) }), " a ", el("b", { "data-roll": "", text: es(p50.años[1], 1) }), " años en reunir la entrada."]),
    ]),
    section("alquilar", "El alquiler, municipio a municipio", `En ${es(r.over)} de los ${es(r.n)} municipios con dato, un contrato nuevo se lleva más del ${es(100 * s.tope_esfuerzo)} % de unos ingresos bajos (2024).`, r.body, "Alquilar",
      [el("span", { class: "etiqueta", text: "Cálculo propio" }), " con la estadística de alquiler del Gobierno Vasco y los ingresos de Eustat."]),
    section("escalera", "La escalera del acceso", "Cada hogar de Bizkaia, paso a paso. Cabe: no pasa del 30 % de los ingresos ni de 10 años ahorrando; depende: según los supuestos.", ladder(store), "La escalera",
      [el("span", { class: "etiqueta", text: "Cálculo propio" }), ` con Registradores, Eustat e INE. Vivienda media de Bizkaia: ${euros(Math.round(p50.precio))}.`]),
    section("explorador", "Prueba tus supuestos", "Cambia el ahorro, la entrada, el interés o el plazo. La rejilla enseña todas las combinaciones.", explorador(store), "Tus supuestos"),
    section("alcance", "¿Hasta dónde llega mi hogar?", "Elige los ingresos y el ahorro: el mapa enseña dónde se puede comprar la vivienda media.", alcance(store), "Hasta dónde llega"),
  );
  return {};
}
