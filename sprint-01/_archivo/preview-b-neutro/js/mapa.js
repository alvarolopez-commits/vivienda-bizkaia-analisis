// Mapas de Bizkaia: la proyección (grados a kilómetros alrededor del centro) y un mapa en SVG de los 113 municipios.
// Lo usan la escena del territorio (para el 3D y su plan B) y los paneles de las siete Bizkaias.

export const rings = (g) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates);

/** Proyección y tamaño del territorio, en kilómetros. */
export function projection(geo) {
  let minX = 180, maxX = -180, minY = 90, maxY = -90;
  for (const f of geo.features) for (const poly of rings(f.geometry)) for (const [x, y] of poly[0]) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  const lon0 = (minX + maxX) / 2, lat0 = (minY + maxY) / 2;
  const kx = 111.32 * Math.cos((lat0 * Math.PI) / 180), ky = 110.574;
  return { P: ([lon, lat]) => [(lon - lon0) * kx, (lat - lat0) * ky], W: (maxX - minX) * kx, H: (maxY - minY) * ky };
}

const NS = "http://www.w3.org/2000/svg";

/**
 * Mapa en SVG. fill(propiedades) devuelve { fill, on } para cada municipio.
 * @param {object} geo GeoJSON de los municipios
 * @param {(p: object) => {fill: string, on?: boolean}} fill
 * @param {{stroke?: string, label?: string}} [opts]
 */
export function svgMap(geo, fill, opts = {}) {
  const { P, W, H } = projection(geo);
  const pad = 1.5;
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `${-W / 2 - pad} ${-H / 2 - pad} ${W + 2 * pad} ${H + 2 * pad}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("data-map", "");
  if (opts.label) svg.setAttribute("aria-label", opts.label);
  for (const f of geo.features) {
    const d = rings(f.geometry).map((poly) => poly.map((ring) => `M${ring.map((c) => { const [x, y] = P(c); return `${x.toFixed(2)},${(-y).toFixed(2)}`; }).join("L")}Z`).join("")).join("");
    const path = document.createElementNS(NS, "path");
    const c = fill(f.properties);
    path.setAttribute("d", d);
    path.setAttribute("fill", c.fill);
    path.setAttribute("stroke", opts.stroke || "#ffffff");
    path.setAttribute("stroke-width", "0.25");
    path.dataset.code = f.properties.code;
    if (c.on) path.classList.add("on");
    svg.append(path);
  }
  return svg;
}
