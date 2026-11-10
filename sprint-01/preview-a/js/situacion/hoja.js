// La hoja de los siete tipos: una hoja densa de teselas en columnas, como un pliego de muestras. Cada tipo de municipio es
// un mapa pequeño de Bizkaia con sus municipios en su color (pequeños múltiplos); entre ellos, la silueta del municipio
// más poblado de cada tipo y cuatro fotos de Bizkaia con su crédito.
import { projection, rings, svgMap } from "../mapa.js";
import { el, es, TYPE_COLORS } from "../ui.js";

const NS = "http://www.w3.org/2000/svg";

/** La silueta de un municipio, en el color de su tipo. */
function silhouette(geo, code, colour) {
  const { P } = projection(geo);
  const f = geo.features.find((x) => x.properties.code === code);
  const pts = rings(f.geometry).flatMap((poly) => poly[0].map(P));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => -p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const pad = Math.max(x1 - x0, y1 - y0) * 0.06;
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `${x0 - pad} ${y0 - pad} ${x1 - x0 + 2 * pad} ${y1 - y0 + 2 * pad}`);
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(NS, "path");
  path.setAttribute("d", rings(f.geometry).map((poly) => poly.map((r) => `M${r.map((c) => { const [x, y] = P(c); return `${x.toFixed(2)},${(-y).toFixed(2)}`; }).join("L")}Z`).join("")).join(""));
  path.setAttribute("fill", colour);
  svg.append(path);
  return svg;
}

const caption = (name, rest) => el("figcaption", {}, [el("b", { text: name }), `, ${rest}`]);

export function hoja(store, fotos) {
  const geo = store.municipiosGeo;
  const types = store.typeKeys.map((t) => {
    const n = store.codes.filter((c) => store.municipios[c].tipo === t).length;
    const map = svgMap(geo, (p) => (p.tipo === t ? { fill: TYPE_COLORS[t], on: true } : { fill: "#ffffff" }), { stroke: "#c3c7d9", label: `Mapa de Bizkaia con los municipios del tipo «${store.typeName(t)}»` });
    return el("figure", {}, [el("div", { class: "tesela tipo" }, [map]), caption(store.typeName(t).split(" (")[0], `${es(n)} ${n === 1 ? "municipio" : "municipios"}`)]);
  });
  const biggest = store.typeKeys.map((t) => store.codes.filter((c) => store.municipios[c].tipo === t).sort((a, b) => store.municipios[b].poblacion - store.municipios[a].poblacion)[0]);
  const shapes = biggest.map((c) => {
    const m = store.municipios[c];
    return el("figure", {}, [el("div", { class: "tesela forma", role: "img", "aria-label": `Silueta de ${m.nombre}` }, [silhouette(geo, c, TYPE_COLORS[m.tipo])]),
      caption(m.nombre, `${es(m.poblacion)} habitantes`)]);
  });
  const photos = fotos.map((f) => el("figure", {}, [el("img", { class: "tesela", src: f.src, width: String(f.w), height: String(f.h), alt: f.alt, loading: "lazy", decoding: "async" }), caption(f.lugar, f.tipo)]));
  // tipos, siluetas y fotos intercalados, para que la hoja no agrupe lo igual
  const tiles = types.flatMap((t, i) => [t, shapes[i], i % 2 === 1 ? photos[(i - 1) / 2] : null].filter(Boolean));
  return el("section", { class: "sec hoja-sec", id: "tipos", "aria-labelledby": "tipos-t", "data-capitulo": "Los tipos" }, [
    el("h2", { id: "tipos-t", class: "frase-hoja", "data-reveal": "heading", text: "Siete tipos de municipio. Cada uno tiene sus problemas y sus medidas." }),
    el("div", { class: "hoja" }, [...tiles, ...photos.slice(3)]),
  ]);
}
