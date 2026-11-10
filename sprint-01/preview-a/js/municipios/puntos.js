// La ficha visual: cada indicador como una pista con los 113 municipios en marcas suaves, la línea de Bizkaia, el anillo
// de la mediana de su tipo y el punto del municipio (dos puntos al comparar), con su cifra y su puesto entre los 113.
import { el, es, euros, isNum, pct } from "../ui.js";

const signed = (v) => `${v > 0 ? "+" : ""}${es(v, 1)} %`;
/** Indicador, nombre (el de la ficha de antes), cómo se escribe y si la mediana del tipo existe en tipos.json. */
export const DOTS = [
  ["esfuerzo_alquiler_P25", "Alquiler nuevo, en % de unos ingresos bajos (2024)", pct],
  ["esfuerzo_alquiler", "Lo mismo, con ingresos medios", pct],
  ["subida_alquiler", "Subida del alquiler de los contratos nuevos, 2020 a 2025", signed],
  ["pct_alquiler", "Viviendas habitadas en alquiler (2024)", pct],
  ["renta_persona", "Ingresos por persona al año, después de impuestos (2024)", euros],
  ["pct_pobreza", "Población en riesgo de pobreza (2024)", pct],
  ["vut_por_1000", "Viviendas turísticas por cada 1.000 viviendas", (v) => es(v, 1)],
  ["pct_no_principales", "Viviendas vacías o de segunda residencia (2024)", pct],
  ["crec_hogares", "Cambio del número de hogares, 2014 a 2024", signed],
  ["crecimiento_parque", "Cambio del número de viviendas, 2014 a 2024", signed],
  ["antiguedad_media", "Edad media de las viviendas (2024)", (v) => `${es(v, 1)} años`],
  ["pct_ascensor", "Viviendas con ascensor (2024)", pct],
  ["pct_mayores_65", "Población de 65 años o más (2024)", pct],
];

const at = (v, lo, hi) => `${(100 * (v - lo)) / (hi - lo || 1)}%`;

/** Las pistas de los indicadores para uno o dos municipios. */
export function dotPlot(store, codes) {
  const bizkaia = store.diagnostico.referencia_bizkaia;
  const rows = DOTS.map(([key, label, fmt]) => {
    const all = store.codes.map((c) => store.municipios[c].indicadores[key]).filter(isNum);
    const lo = Math.min(...all), hi = Math.max(...all);
    const track = el("div", { class: "pista-ind", "aria-hidden": "true" }, all.map((v) => el("span", { class: "marca", style: `left:${at(v, lo, hi)}` })));
    if (isNum(bizkaia[key])) track.append(el("span", { class: "bizkaia", style: `left:${at(bizkaia[key], lo, hi)}` }));
    const types = [...new Set(codes.map((c) => store.municipios[c].tipo))];
    types.forEach((t, i) => { const med = store.tipos[t].medianas?.[key]; if (isNum(med)) track.append(el("span", { class: `mediana m${i}`, style: `left:${at(med, lo, hi)}` })); });
    const values = codes.map((c, i) => {
      const v = store.municipios[c].indicadores[key];
      if (!isNum(v)) return el("span", { class: `cifra-dot d${i}`, text: "sin dato" });
      track.append(el("span", { class: `punto d${i}`, style: `left:${at(v, lo, hi)}` }));
      const rank = all.filter((x) => x > v).length + 1;
      return el("span", { class: `cifra-dot d${i}` }, [el("b", { text: fmt(v) }), el("span", { class: "puesto", text: ` · puesto ${es(rank)} de ${es(all.length)}` })]);
    });
    const said = codes.map((c) => `${store.municipios[c].nombre}: ${isNum(store.municipios[c].indicadores[key]) ? fmt(store.municipios[c].indicadores[key]) : "sin dato"}`).join("; ");
    return el("li", { class: "fila-ind" }, [
      el("span", { class: "nombre-ind", text: label }),
      el("div", { class: "pista-marco", role: "img", "aria-label": `${label}. ${said}. Bizkaia: ${isNum(bizkaia[key]) ? fmt(bizkaia[key]) : "sin dato"}.` }, [track]),
      el("span", { class: "cifras-ind" }, values),
    ]);
  });
  const key = el("p", { class: "clave-puntos" }, [
    ...codes.map((c, i) => el("span", { class: `k-punto d${i}` }, [el("i", { "aria-hidden": "true" }), store.municipios[c].nombre])),
    el("span", { class: "k-mediana" }, [el("i", { "aria-hidden": "true" }), `${codes.length > 1 ? "Mediana de su tipo" : `Mediana de ${(store.municipios[codes[0]].tipo === "bilbao" ? (n) => n : (n) => n.toLowerCase())(store.typeName(store.municipios[codes[0]].tipo).split(" (")[0])}`} (donde hay dato)`]),
    el("span", { class: "k-bizkaia" }, [el("i", { "aria-hidden": "true" }), "Bizkaia"]),
    el("span", { class: "k-marca" }, [el("i", { "aria-hidden": "true" }), "Cada municipio con dato"]),
  ]);
  return el("div", { class: "puntos" }, [key, el("ul", { class: "filas-ind" }, rows)]);
}
