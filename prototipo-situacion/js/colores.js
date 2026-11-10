// Colores de los cinco problemas en la rampa azul del dashboard PCI (#d6e5fb → #5d95e8 → #0d3577).
// Solo cambia la paleta: los valores, los cortes y las escalas son los de indicadores.js (copia de la web
// publicada), que no se toca. Se sustituye la función `color` de cada indicador, así que el mapa 2D, la leyenda
// y el 3D (territorio.js lee los mismos objetos) cambian a la vez.
//   Alquiler: hasta el 30 % en el tono más claro; por encima, rampa de azul medio a oscuro (se mantiene el salto del 30 %).
//   Hogares: los que crecen menos que las viviendas (≤ 0) en gris; por encima, rampa azul hasta +10 puntos.
//   Entrada, Turísticas y Vacías: rampa continua con los mismos extremos y la misma escala que el original.
import { INDICADORES } from "./indicadores.js";

const RAMP = ["#e6eefb", "#d6e5fb", "#5d95e8", "#0d3577"];
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lerp = (a, b, t) => { const [x, y] = [hex(a), hex(b)]; const k = Math.max(0, Math.min(1, t)); return `#${x.map((c, i) => Math.round(c + (y[i] - c) * k).toString(16).padStart(2, "0")).join("")}`; };
/** Rampa de tres tramos: claro → azul medio → azul noche. */
const ramp = (t, from = RAMP[0]) => { const k = Math.max(0, Math.min(1, t)); return k < 0.5 ? lerp(from, RAMP[2], k / 0.5) : lerp(RAMP[2], RAMP[3], (k - 0.5) / 0.5); };

const PCI = {
  alquiler: (v) => (v <= 30 ? RAMP[1] : ramp(0.25 + 0.75 * ((v - 30) / 26), "#9cc0f2")),
  compra: (v) => ramp((v - 6) / 14),
  oferta: (v) => (v <= 0 ? "#cfd7e3" : ramp(v / 10, "#c4d8f6")),
  turisticas: (v) => ramp(Math.sqrt(v / 47)),
  vacias: (v) => ramp((v - 7) / 45),
};

export function aplicarPaletaPCI() {
  for (const ind of INDICADORES) if (PCI[ind.id]) ind.color = PCI[ind.id];
}
