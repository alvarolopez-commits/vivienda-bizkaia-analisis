// «¿Hasta dónde llega mi hogar?»: el lector elige los ingresos de su hogar y lo que ahorra, y el mapa se colorea según si
// puede comprar la vivienda media de cada municipio: reunir la entrada en menos de 10 años y pagar una cuota que no pase
// del 30 % de los ingresos. Con el precio de cada municipio (el suyo, o el de su área si no lo tiene: aproximado) y las
// mismas fórmulas del análisis.
import { announce } from "../comun.js";
import { access } from "../calculo-acceso.js";
import { svgMap } from "../mapa.js";
import { el, es, euros } from "../ui.js";

const LONG = 10;
const COLOR = { las_dos: "#1a4d7a", una: "#f4a6a6", ninguna: "#b4545b", sin: "#ffffff" };
const LABEL = { las_dos: "Al alcance: las dos cosas", una: "Solo una de las dos", ninguna: "Ni la entrada ni la cuota", sin: "Sin precio" };

/** Los hogares de Bizkaia que se pueden elegir, con sus ingresos después de impuestos (acceso.json). */
function homes(store) {
  const net = (k) => store.acceso.bizkaia_tramos.find((r) => r.tramo.includes(k))?.renta_neta;
  return [["Dos salarios mínimos", net("Dos salarios")], ["Ingresos bajos", net("P25")], ["Hogar de 25 a 29 años", net("25-29")],
    ["Ingresos medios", net("P50")], ["Ingresos altos", net("P75")]].filter(([, v]) => v);
}

const priceOf = (m) => (m.compra?.precio ? { v: m.compra.precio, aprox: false } : m.compra?.orientativo?.precio ? { v: m.compra.orientativo.precio, aprox: true } : null);

export function alcance(store) {
  const s = store.acceso.supuestos, list = homes(store);
  const st = { home: list.find(([n]) => n === "Ingresos medios") ?? list[0], ahorro: 100 * s.ahorro[0] };
  const svg = svgMap(store.municipiosGeo, () => ({ fill: COLOR.sin }), { stroke: "#9fb0c3", label: "Mapa de Bizkaia: dónde llega el hogar elegido" });
  const paths = Object.fromEntries([...svg.querySelectorAll("path")].map((p) => [p.dataset.code, p]));
  const total = el("p", { class: "alcance-total" });
  const keyList = el("ul", { class: "alcance-clave" }, Object.entries(LABEL).map(([k, t]) => el("li", {}, [el("i", { style: `background:${COLOR[k]}`, "aria-hidden": "true" }), t])));

  const lists = el("div", { class: "sr-only" });
  const paint = () => {
    const net = st.home[1];
    const count = { las_dos: 0, una: 0, ninguna: 0, sin: 0 }, names = { las_dos: [], una: [], ninguna: [], sin: [] };
    let approx = 0;
    for (const [code, path] of Object.entries(paths)) {
      const m = store.municipios[code], price = m && priceOf(m);
      let k = "sin";
      if (price) {
        const r = access({ price: price.v, net, savings: st.ahorro / 100, downPayment: s.entrada[1], rate: s.tipo_hipoteca.media, years: Math.max(...s.plazos), loanShare: s.financiacion, cap: s.tope_esfuerzo });
        const ok = (r.yearsToSave < LONG ? 1 : 0) + (r.effort <= 100 * s.tope_esfuerzo ? 1 : 0);
        k = ok === 2 ? "las_dos" : ok === 1 ? "una" : "ninguna";
        if (price.aprox) approx += 1;
      }
      count[k] += 1;
      if (m) names[k].push(m.nombre);
      path.setAttribute("fill", COLOR[k]);
      path.replaceChildren(Object.assign(document.createElementNS("http://www.w3.org/2000/svg", "title"), { textContent: `${m?.nombre ?? ""}: ${LABEL[k].toLowerCase()}` }));
    }
    total.replaceChildren(el("b", { text: `${es(count.las_dos)} de ${es(count.las_dos + count.una + count.ninguna)}` }),
      ` municipios al alcance de un hogar con ${euros(Math.round(net))} al año que ahorra el ${st.ahorro} %.`);
    lists.replaceChildren(...Object.keys(LABEL).map((k) => el("p", { text: `${LABEL[k]}: ${names[k].sort((a, b) => a.localeCompare(b, "es")).join(", ") || "ninguno"}.` })));
    if (ready) announce(`${count.las_dos} municipios al alcance`, 400);
    note.textContent = `Entrada del ${es(100 * s.entrada[1])} % del precio, hipoteca a ${Math.max(...s.plazos)} años al ${es(s.tipo_hipoteca.media, 2)} %. ${es(approx)} municipios sin precio propio usan el de su área: aproximado.`;
  };
  const note = el("p", { class: "fuente" });
  const homeButtons = list.map((h) => el("button", { type: "button", class: "opcion", "aria-pressed": String(h === st.home), text: h[0] }));
  homeButtons.forEach((b, i) => b.addEventListener("click", () => { st.home = list[i]; homeButtons.forEach((o) => o.setAttribute("aria-pressed", String(o === b))); paint(); }));
  const saving = [10, 15, 20, 25].map((v) => el("button", { type: "button", class: "opcion", "aria-pressed": String(v === st.ahorro), text: `Ahorra el ${v} %` }));
  saving.forEach((b) => b.addEventListener("click", () => { st.ahorro = parseInt(b.textContent.match(/\d+/)[0], 10); saving.forEach((o) => o.setAttribute("aria-pressed", String(o === b))); paint(); }));
  let ready = false;
  paint();
  ready = true;
  return el("div", { class: "alcance" }, [
    el("div", { class: "alcance-controles", "data-control": "" }, [
      el("div", { class: "x-botones", role: "group", "aria-label": "Ingresos del hogar" }, homeButtons),
      el("div", { class: "x-botones", role: "group", "aria-label": "Lo que ahorra cada año" }, saving),
    ]),
    el("div", { class: "alcance-cuerpo" }, [el("div", { class: "mapa-lienzo" }, [svg]), el("div", { class: "alcance-lado" }, [total, keyList, note, lists])]),
  ]);
}
