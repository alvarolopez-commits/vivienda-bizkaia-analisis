// Normas (fase 15): la versión visual del capítulo 5 del informe, con sus mismos datos (analysis/normas.py). Quién decide
// cada instrumento, en una matriz que se enciende por nivel de gobierno, y la línea de tiempo de las normas, cuya línea
// se dibuja con el scroll.
import { announce, reduced } from "./comun.js";
import { revealHeadings } from "./movimiento.js";
import { el, es } from "./ui.js";

const section = (id, title, sub, body, capitulo) => el("section", { class: "sec", id, "aria-labelledby": `${id}-t`, "data-capitulo": capitulo }, [
  el("div", { class: "sec-cab" }, [el("h2", { id: `${id}-t`, "data-reveal": "heading", text: title }), sub ? el("p", { class: "sub", text: sub }) : null]),
  el("div", { class: "sec-cuerpo" }, [body]),
]);

/** La matriz: una fila por instrumento y una columna por nivel; punto lleno, decide; hueco, aplica o lo pide. */
function competences(N) {
  const rows = N.competencias.map((c) => el("div", { class: "comp-fila", role: "row", "data-decide": N.niveles.filter((l) => c.papeles[l] === "decide").join("|") }, [
    el("span", { role: "rowheader", class: "comp-instr", text: c.instrumento }),
    ...N.niveles.map((l) => el("span", { role: "cell", class: "comp-celda", "data-nivel": l }, [
      c.papeles[l] ? el("i", { class: c.papeles[l], "aria-hidden": "true" }) : null,
      el("span", { class: "sr-only", text: c.papeles[l] === "decide" ? "Decide" : c.papeles[l] === "aplica" ? "Aplica o lo pide" : "No interviene" }),
    ])),
  ]));
  const table = el("div", { class: "comp", role: "table", "aria-label": "Quién decide cada instrumento" }, [
    el("div", { class: "comp-fila cab", role: "row" }, [el("span", { role: "columnheader", text: "Instrumento" }), ...N.niveles.map((l) => el("span", { role: "columnheader", "data-nivel": l, text: l }))]),
    ...rows,
  ]);
  const count = el("p", { class: "comp-cuenta" });
  const pick = (level) => {
    table.classList.toggle("filtra", Boolean(level));
    let n = 0;
    rows.forEach((r) => { const on = !level || r.dataset.decide.split("|").includes(level); r.classList.toggle("on", Boolean(level) && on); n += on ? 1 : 0; });
    table.querySelectorAll("[data-nivel]").forEach((c) => c.classList.toggle("col-on", c.dataset.nivel === level));
    count.textContent = level ? `${level}: decide ${es(n)} de ${es(rows.length)}.` : `${es(rows.length)} instrumentos, cuatro niveles de gobierno.`;
    if (ready) announce(count.textContent);
  };
  let ready = false;
  const buttons = [null, ...N.niveles].map((l) => el("button", { type: "button", class: "opcion", "aria-pressed": String(l === null), text: l ?? "Todos" }));
  buttons.forEach((b, i) => b.addEventListener("click", () => { buttons.forEach((o) => o.setAttribute("aria-pressed", String(o === b))); pick(i ? N.niveles[i - 1] : null); }));
  pick(null);
  ready = true;
  return el("div", {}, [
    el("div", { class: "x-botones", role: "group", "aria-label": "Qué decide cada nivel", "data-control": "" }, buttons), count,
    el("div", { class: "table-scroll" }, [table]),
    el("p", { class: "clave-puntos" }, [el("span", { class: "k-decide" }, [el("i", { class: "decide", "aria-hidden": "true" }), "Decide"]), el("span", { class: "k-aplica" }, [el("i", { class: "aplica", "aria-hidden": "true" }), "Aplica o lo pide"])]),
  ]);
}

/** La línea de tiempo: cada norma en su fecha; las pendientes, marcadas. La línea se dibuja al bajar. */
function timeline(N) {
  const line = el("span", { class: "hilo-linea", "aria-hidden": "true" });
  const list = el("ol", { class: "hilo" }, [line, ...N.hitos.map((h) => el("li", { class: `hito ${h.estado}` }, [
    el("span", { class: "hito-fecha", text: h.fecha }),
    el("span", { class: "hito-texto" }, [h.texto, h.estado === "pendiente" ? el("span", { class: "hito-pend", text: "Pendiente" }) : null]),
  ]))]);
  if (window.gsap && window.ScrollTrigger && !reduced()) {
    gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: list, start: "top 70%", end: "bottom 60%", scrub: 0.4 } });
  }
  return list;
}

export function renderNormas(root, store) {
  const N = store.normas, M = store.medidas.medidas;
  if (!N) throw new Error("faltan los datos de las normas");
  const basque = N.competencias.filter((c) => ["Gobierno Vasco y Parlamento", "Diputación y Juntas Generales"].some((l) => c.papeles[l] === "decide")).length;
  const ya = M.filter((m) => m.viabilidad === "instrumento_existente").length;
  root.replaceChildren(
    el("header", { class: "vista-cab" }, [
      el("h1", { text: "Del Estado al ayuntamiento" }),
      el("p", { class: "sub" }, [el("b", { text: `${es(basque)} de ${es(N.competencias.length)}` }), " instrumentos los decide Euskadi: el Gobierno Vasco o la Diputación."]),
    ]),
    section("competencias", "Cada instrumento, quién lo decide", "Elige un nivel de gobierno para ver lo que decide.", competences(N), "Competencias"),
    section("hilo", "Las normas, en el tiempo", `Desde 2015 hasta hoy. Estado a ${N.fecha}: lo pendiente aún no está en vigor o falta un paso.`, timeline(N), "La línea de tiempo"),
    section("margen", "El margen sin cambiar ninguna ley", null, el("div", { class: "margen" }, [
      el("p", { class: "margen-cifra" }, [el("span", { "data-roll": "", text: es(ya) }), el("small", { text: ` de ${es(M.length)} medidas` })]),
      el("p", { text: "se pueden aplicar con las normas de hoy." }),
      el("p", {}, [el("a", { class: "pildora", href: "#medidas" }, [el("span", { class: "rotulo" }, [el("span", { "data-t": "Ver las medidas", text: "Ver las medidas" })]), el("span", { class: "chip", "aria-hidden": "true", text: "→" })])]),
    ]), "El margen"),
    el("p", { class: "fuente sec-fuente" }, [el("span", { class: "etiqueta", text: "Elaboración propia" }), ` con la Constitución, el Estatuto de Gernika, el Concierto Económico, el BOE, el BOPV y el Gobierno Vasco, a ${N.fecha}.`]),
  );
  revealHeadings(root);
  return {};
}
