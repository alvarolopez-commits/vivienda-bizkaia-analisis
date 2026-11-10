// El explorador de supuestos: el lector elige dónde, qué hogar, cuánto ahorra, la entrada, el interés y el plazo, con
// botones de valores reales (no deslizadores), y ve los años para reunir la entrada, la cuota y el precio que puede pagar.
// Debajo, la rejilla de años: cada casilla es una pareja de ahorro y entrada; tocarla la elige. Mismas fórmulas que el
// análisis (calculo-acceso.js); no se guarda ni se envía nada.
import { announce } from "../comun.js";
import { access } from "../calculo-acceso.js";
import { el, es, euros } from "../ui.js";

const TIERS = [["P25", "Ingresos bajos"], ["P50", "Ingresos medios"], ["P75", "Ingresos altos"]];
const AHORRO = [10, 15, 20, 25, 30], ENTRADA = [25, 30, 35, 40, 45], PLAZO = [20, 25, 30, 35];
const TU_CASA = { share: 0.2, max: 50000 }; // préstamo estatal «TU CASA» para la entrada: 20 % del precio, hasta 50.000 €
const LONG = 10; // años ahorrando: desde aquí, en rosa

/** Bizkaia y los municipios con precio de compra propio, con los ingresos de cada tramo después de impuestos. */
function places(store) {
  const bz = Object.fromEntries(store.acceso.bizkaia_tramos.filter((r) => /P\d\d/.test(r.tramo)).map((r) => [r.tramo.match(/P\d\d/)[0], r]));
  const out = [{ code: "48", name: "Bizkaia (vivienda media)", price: bz.P50.precio, net: Object.fromEntries(TIERS.map(([q]) => [q, bz[q].renta_neta])) }];
  store.codes.map((c) => store.municipios[c]).forEach((m, i) => {
    const t = m.compra?.tramos;
    if (!m.compra?.precio || !m.compra.ratio_neto || !TIERS.every(([q]) => t?.[q]?.renta_bruta)) return;
    out.push({ code: store.codes[i], name: m.nombre, price: m.compra.precio, net: Object.fromEntries(TIERS.map(([q]) => [q, t[q].renta_bruta * m.compra.ratio_neto])) });
  });
  return out;
}

const group = (label, values, current, fmt, onPick) => {
  const slug = label.normalize("NFD").replace(/[^a-zA-Z]+/g, "-").toLowerCase();
  const buttons = values.map((v, i) => el("button", { type: "button", id: `x-${slug}-${i}`, class: "opcion", "aria-pressed": String(v === current), text: fmt(v) }));
  buttons.forEach((b, i) => b.addEventListener("click", () => { buttons.forEach((o) => o.setAttribute("aria-pressed", String(o === b))); onPick(values[i]); }));
  return el("div", { class: "x-grupo", role: "group", "aria-label": label }, [el("span", { class: "x-etq", text: label }), el("div", { class: "x-botones" }, buttons)]);
};

export function explorador(store) {
  const s = store.acceso.supuestos, list = places(store);
  const rates = [...new Set([2, s.tipo_hipoteca.media, 3.5, 4.5])].sort((a, b) => a - b);
  const st = { place: list[0], tier: "P50", ahorro: 100 * s.ahorro[0], entrada: 100 * s.entrada[1], rate: s.tipo_hipoteca.media, years: Math.max(...s.plazos), tuCasa: false };
  const calc = (ahorro, entrada) => {
    const p = st.place;
    return access({ price: p.price, net: p.net[st.tier], savings: ahorro / 100, downPayment: entrada / 100, rate: st.rate, years: st.years, loanShare: s.financiacion, cap: s.tope_esfuerzo,
      loan: st.tuCasa ? Math.min(TU_CASA.share * p.price, TU_CASA.max) : 0 });
  };
  const out = { anos: el("p", { class: "x-num" }), cuota: el("p", { class: "x-num" }), precio: el("p", { class: "x-num" }),
    anosTxt: el("p", { class: "x-lab" }), cuotaTxt: el("p", { class: "x-lab" }), precioTxt: el("p", { class: "x-lab" }) };
  const grid = el("div", { class: "rejilla", role: "group", "aria-label": "Años ahorrando la entrada según el ahorro (filas) y la entrada (columnas)" });
  const nota = el("p", { class: "fuente" });

  const paint = () => {
    const r = calc(st.ahorro, st.entrada), p = st.place, net = p.net[st.tier];
    out.anos.textContent = `${es(r.yearsToSave, 1)} años`;
    out.anos.classList.toggle("mal", r.yearsToSave >= LONG);
    out.anosTxt.textContent = `ahorrando la entrada (${euros(Math.round(r.entry))})`;
    out.cuota.textContent = `${es(r.effort, 1)} %`;
    out.cuota.classList.toggle("mal", r.effort > 100 * s.tope_esfuerzo);
    out.cuotaTxt.textContent = `de los ingresos para la cuota (${euros(Math.round(r.monthlyPayment))} al mes)`;
    out.precio.textContent = euros(Math.round(r.affordable / 1000) * 1000);
    out.precio.classList.toggle("mal", r.affordable < p.price);
    out.precioTxt.textContent = `precio que se puede pagar sin pasar del ${es(100 * s.tope_esfuerzo)} % (la vivienda media cuesta ${euros(Math.round(p.price))})`;
    grid.replaceChildren(
      el("div", { class: "rj-fila cab", "aria-hidden": "true" }, [el("span", { text: "Ahorro" }), ...ENTRADA.map((e) => el("span", { text: `${e} %` }))]),
      ...AHORRO.map((a) => el("div", { class: "rj-fila" }, [el("span", { "aria-hidden": "true", text: `${a} %` }), ...ENTRADA.map((e) => {
        const y = calc(a, e).yearsToSave;
        const b = el("button", { type: "button", id: `rj-${a}-${e}`, class: `rj-casilla${y >= LONG ? " mal" : ""}`, "aria-pressed": String(a === st.ahorro && e === st.entrada),
          "aria-label": `Ahorro del ${a} %, entrada del ${e} %: ${es(y, 1)} años`, text: es(y, 1) });
        b.addEventListener("click", () => { st.ahorro = a; st.entrada = e; rebuild(); });
        return b;
      })])),
    );
    nota.textContent = `Ingresos del hogar: ${euros(Math.round(net))} al año, después de impuestos. El banco presta el ${es(100 * s.financiacion)} % del precio. En rosa: 10 años o más ahorrando, o una cuota de más del ${es(100 * s.tope_esfuerzo)} %.${st.tuCasa ? " «TU CASA» rebaja la entrada; ese préstamo se devuelve después, sus condiciones aún no están fijadas y el decreto que lo crea está pendiente de convalidar." : ""}`;
    if (ready) announce(`${es(r.yearsToSave, 1)} años ahorrando la entrada; cuota del ${es(r.effort, 1)} % de los ingresos`, 600);
  };
  const where = el("select", { id: "x-lugar" }, list.map((p) => el("option", { value: p.code, text: p.name })));
  where.addEventListener("change", () => { st.place = list.find((p) => p.code === where.value); paint(); });
  const controls = el("div", { class: "x-controles", "data-control": "" });
  let ready = false;
  const rebuild = () => {
    const focused = document.activeElement?.id; // al redibujar, el foco vuelve al mismo control
    controls.replaceChildren(
      el("div", { class: "x-grupo" }, [el("label", { class: "x-etq", for: "x-lugar", text: "Dónde" }), where]),
      group("Hogar", TIERS.map(([q]) => q), st.tier, (q) => TIERS.find(([k]) => k === q)[1], (v) => { st.tier = v; paint(); }),
      group("Ahorra cada año", AHORRO, st.ahorro, (v) => `${v} %`, (v) => { st.ahorro = v; paint(); }),
      group("Entrada, con impuestos y gastos", ENTRADA, st.entrada, (v) => `${v} %`, (v) => { st.entrada = v; paint(); }),
      group("Interés", rates, st.rate, (v) => `${es(v, 2)} %`, (v) => { st.rate = v; paint(); }),
      group("Plazo", PLAZO, st.years, (v) => `${v} años`, (v) => { st.years = v; paint(); }),
      group("Préstamo «TU CASA» para la entrada", [false, true], st.tuCasa, (v) => (v ? "Sí" : "No"), (v) => { st.tuCasa = v; paint(); }),
    );
    paint();
    if (focused) document.getElementById(focused)?.focus();
  };
  rebuild();
  ready = true;
  return el("div", { class: "explorador" }, [
    controls,
    el("div", { class: "x-resultado", "aria-live": "off" }, [
      el("div", { class: "x-kpi" }, [out.anos, out.anosTxt]), el("div", { class: "x-kpi" }, [out.cuota, out.cuotaTxt]), el("div", { class: "x-kpi" }, [out.precio, out.precioTxt]),
      el("p", { class: "x-etq rj-titulo", text: "Años ahorrando, según el ahorro y la entrada" }), grid, nota,
    ]),
  ]);
}
