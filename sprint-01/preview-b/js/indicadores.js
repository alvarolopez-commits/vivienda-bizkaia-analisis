// Los cinco indicadores de Situación, uno por problema del resumen (resumen.json): el mapa en 3D de la portada, el mapa
// vivo y la lista de municipios los leen de aquí. Cada uno toma su dato de municipios.json, sin calcular nada nuevo salvo
// la diferencia entre lo que crecen los hogares y las viviendas, que es la que usa el análisis para ese problema.
import { es as nf } from "./comun.js";

const mix = (a, b, t) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  const k = Math.max(0, Math.min(1, t));
  return `#${x.map((c, i) => Math.round(c + (y[i] - c) * k).toString(16).padStart(2, "0")).join("")}`;
};
const mid = (r) => (r[0] + r[1]) / 2;
const yearsOf = (m) => {
  const own = m.compra?.tramos?.P50?.años;
  if (own) return { v: mid(own), r: own, aprox: false };
  const est = m.compra?.orientativo?.tramos?.P50?.años;
  return est ? { v: mid(est), r: est, aprox: true } : null;
};
const ind = (m, k) => (m.indicadores[k] == null ? null : { v: m.indicadores[k], aprox: false });

/** Cada indicador: valor de un municipio ({ v, aprox } o null), cómo se escribe, su color y su altura (0 a 1). */
export const INDICADORES = [
  {
    id: "alquiler", corto: "Alquiler", problema: "alquiler",
    titulo: "Parte de unos ingresos bajos que se lleva un alquiler nuevo",
    valor: (m) => ind(m, "esfuerzo_alquiler_P25"), texto: (x) => `${nf(x.v, 1)} %`,
    color: (v) => (v <= 30 ? "#86bfc6" : mix("#f4a6a6", "#b4545b", (v - 30) / 26)), altura: (v) => v / 56,
    fuente: "Cálculo propio con la estadística de alquiler del Gobierno Vasco y Eustat, 2024", leyenda: ["Hasta el 30 %", "56 %"], muestras: [30, 36, 43, 50, 56],
  },
  {
    id: "compra", corto: "Entrada", problema: "compra",
    titulo: "Años ahorrando la entrada, hogar de ingresos medios",
    valor: yearsOf, texto: (x) => `${nf(x.r[0], 1)} a ${nf(x.r[1], 1)} años${x.aprox ? " (aproximado)" : ""}`,
    color: (v) => mix("#dce5ed", "#1a4d7a", (v - 6) / 14), altura: (v) => v / 20,
    fuente: "Cálculo propio con Registradores, Ministerio de Vivienda, Eustat e INE, 2025", leyenda: ["6 años", "20 años"], muestras: [6, 9.5, 13, 16.5, 20],
  },
  {
    id: "oferta", corto: "Hogares", problema: "oferta",
    titulo: "Cuánto más crecen los hogares que las viviendas, de 2014 a 2024",
    valor: (m) => (m.indicadores.crec_hogares == null || m.indicadores.crecimiento_parque == null ? null
      : { v: m.indicadores.crec_hogares - m.indicadores.crecimiento_parque, aprox: false }),
    texto: (x) => `${x.v > 0 ? "+" : ""}${nf(x.v, 1)} puntos`,
    color: (v) => (v <= 0 ? "#c9d6e2" : mix("#f4d9b8", "#a0602a", v / 10)), altura: (v) => Math.max(0.02, Math.min(1.4, v / 12)),
    fuente: "Eustat: hogares y viviendas familiares, 2014-2024", leyenda: ["Crecen menos", "+10 puntos o más"], muestras: [-1, 2.5, 5, 7.5, 10],
  },
  {
    id: "turisticas", corto: "Turísticas", problema: "turisticas",
    titulo: "Viviendas turísticas por cada 1.000 viviendas",
    valor: (m) => ind(m, "vut_por_1000"), texto: (x) => `${nf(x.v, 1)} por 1.000`,
    color: (v) => mix("#dce5ed", "#b4545b", Math.sqrt(v / 47)), altura: (v) => v / 47,
    fuente: "Registro de viviendas turísticas del Gobierno Vasco y Eustat, 2025", leyenda: ["0", "47 por 1.000"], muestras: [0, 3, 12, 26, 47],
  },
  {
    id: "vacias", corto: "Vacías", problema: "pueblos",
    titulo: "Viviendas vacías o de segunda residencia",
    valor: (m) => ind(m, "pct_no_principales"), texto: (x) => `${nf(x.v, 1)} %`,
    color: (v) => mix("#eef2dc", "#778a2d", (v - 7) / 45), altura: (v) => v / 61,
    fuente: "Eustat: viviendas familiares por tipo, 2024", leyenda: ["7 %", "52 % o más"], muestras: [7, 18, 30, 41, 52],
  },
];

/** Los municipios ordenados por un indicador, de mayor a menor; los que no tienen dato, fuera. */
export function ranking(store, indicador, tipo = null) {
  return store.codes
    .map((c) => ({ code: c, m: store.municipios[c], x: indicador.valor(store.municipios[c]) }))
    .filter((r) => r.x && (!tipo || r.m.tipo === tipo))
    .sort((a, b) => b.x.v - a.x.v);
}
