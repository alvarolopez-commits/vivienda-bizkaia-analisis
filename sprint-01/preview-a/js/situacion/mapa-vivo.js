// El mapa vivo de Situación: el lector elige uno de los cinco indicadores y lo ve en los 113 municipios, en 2D (SVG) o en
// 3D (el mismo territorio de la portada, que se monta la primera vez que se pide). Tocar un municipio, o elegirlo en la
// lista, enseña su cifra, su tipo y el enlace a su ficha.
import { announce, reduced } from "../comun.js";
import { svgMap } from "../mapa.js";
import { el } from "../ui.js";
import { INDICADORES } from "./indicadores.js";
import { newState, territory } from "./territorio.js";

const DIM = "#ffffff";

function legend(ind) {
  const [lo, hi] = ind.leyenda;
  const stops = ind.muestras.map(ind.color);
  return el("p", { class: "leyenda" }, [el("span", { text: lo }), el("span", { class: "rampa", style: `background: linear-gradient(90deg, ${stops.join(", ")})` }), el("span", { text: hi })]);
}

export function mapaVivo(store) {
  let ind = INDICADORES[0], code = "48020", state3d = null, mounting = null;
  const lienzo = el("div", { class: "mapa-lienzo", "data-map": "" });
  const svg = svgMap(store.municipiosGeo, () => ({ fill: DIM }), { stroke: "#9fb0c3", label: "Mapa de los municipios de Bizkaia, coloreado por el indicador elegido" });
  lienzo.append(svg);
  const paths = Object.fromEntries([...svg.querySelectorAll("path")].map((p) => [p.dataset.code, p]));
  const ficha = {
    ind: el("p", { class: "titulo-ind" }), muni: el("p", { class: "muni" }), valor: el("p", { class: "valor" }), tipo: el("p", { class: "tipo" }),
    ir: el("a", { class: "pildora", href: "#municipios/48020" }, [el("span", { class: "rotulo" }, [el("span", { "data-t": "Ver su ficha", text: "Ver su ficha" })]), el("span", { class: "chip", "aria-hidden": "true", text: "→" })]),
  };
  const pick = el("select", { id: "mapa-muni", "aria-label": "Elige un municipio" }, store.codes.map((c) => el("option", { value: c, text: store.municipios[c].nombre })));
  const ley = el("div");
  const fuente = el("p", { class: "fuente" });

  const paint = () => {
    for (const [c, p] of Object.entries(paths)) {
      const m = store.municipios[c];
      const x = m && ind.valor(m);
      p.setAttribute("fill", x ? ind.color(x.v) : DIM);
      p.classList.toggle("sel", c === code);
    }
    const m = store.municipios[code], x = ind.valor(m);
    ficha.ind.textContent = ind.titulo;
    ficha.muni.textContent = m.nombre;
    ficha.valor.textContent = x ? ind.texto(x) : "Sin dato";
    ficha.tipo.textContent = store.typeName(m.tipo);
    ficha.ir.href = `#municipios/${code}`;
    pick.value = code;
    ley.replaceChildren(legend(ind));
    fuente.replaceChildren(el("span", { class: "etiqueta", text: "Cálculo propio" }), ` con ${ind.fuente.replace(/^Cálculo propio con /, "")}`);
    if (state3d) {
      const i = INDICADORES.indexOf(ind) + 1;
      const target = Object.fromEntries([1, 2, 3, 4, 5].map((k) => [`w${k}`, k === i ? 1 : 0]));
      if (window.gsap && !reduced()) gsap.to(state3d, { ...target, w0: 0, duration: 0.8, ease: "power2.inOut", overwrite: true });
      else Object.assign(state3d, target, { w0: 0 });
      Object.assign(state3d, { label: i - 1, labelOp: 1 });
    }
  };
  const choose = (c) => { if (!Object.hasOwn(store.municipios, c)) return; code = c; paint(); announce(`${store.municipios[c].nombre}: ${ficha.valor.textContent}`); };
  svg.addEventListener("click", (e) => { const c = e.target.closest("path")?.dataset.code; if (c && store.municipios[c]) choose(c); });
  pick.addEventListener("change", () => choose(pick.value));

  const indButtons = INDICADORES.map((x) => el("button", { type: "button", class: "opcion", "aria-pressed": String(x === ind), text: x.corto }));
  indButtons.forEach((b, i) => b.addEventListener("click", () => {
    ind = INDICADORES[i];
    indButtons.forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
    paint();
    announce(`Mapa: ${ind.titulo}`);
  }));
  const b2d = el("button", { type: "button", class: "opcion", "aria-pressed": "true", text: "2D" });
  const b3d = el("button", { type: "button", class: "opcion", "aria-pressed": "false", text: "3D" });
  const show3d = async (on) => {
    b2d.setAttribute("aria-pressed", String(!on)); b3d.setAttribute("aria-pressed", String(on));
    lienzo.classList.toggle("tres", on);
    svg.style.display = on ? "none" : "";
    if (on && !mounting) {
      const host = el("div", { class: "terr-map" }), label = el("span", { class: "etiqueta-3d" });
      lienzo.append(host, label);
      const state = newState();
      mounting = territory(host, store.municipiosGeo, store.municipios, { label, state }).then((ok) => {
        if (ok) { Object.assign(state, { cam: 1, bias: 0 }); state3d = state; paint(); return; }
        // sin WebGL: vuelve el mapa coloreado y el botón queda apagado, con su motivo
        show3d(false);
        b3d.disabled = true;
        b3d.title = "Este navegador no puede dibujar el mapa en 3D";
        announce("Este navegador no puede dibujar el mapa en 3D");
      });
    }
    lienzo.querySelector(".terr-map")?.toggleAttribute("hidden", !on);
    lienzo.querySelector(".etiqueta-3d")?.toggleAttribute("hidden", !on);
  };
  b2d.addEventListener("click", () => show3d(false));
  b3d.addEventListener("click", () => show3d(true));

  paint();
  return el("section", { class: "sec mapa-vivo", id: "mapa", "aria-labelledby": "mapa-t", "data-capitulo": "El mapa" }, [
    el("div", { class: "sec-cab" }, [
      el("h2", { id: "mapa-t", "data-reveal": "heading", text: "Cada municipio, con su dato" }),
      el("p", { class: "sub", text: "Elige un problema y toca un municipio." }),
    ]),
    el("div", { class: "controles", "data-control": "" }, [...indButtons, el("div", { class: "vista-mapa", role: "group", "aria-label": "Vista del mapa" }, [b2d, b3d])]),
    el("div", { class: "mapa-marco" }, [
      lienzo,
      el("div", { class: "mapa-ficha", "aria-live": "off" }, [ficha.ind, ficha.muni, ficha.valor, ficha.tipo, el("label", { class: "elige", for: "mapa-muni", text: "Otro municipio" }), pick, ley, ficha.ir, fuente]),
    ]),
  ]);
}
