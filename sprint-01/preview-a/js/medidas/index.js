// Medidas: las 34 medidas comparadas con los mismos criterios. Direcciones: #medidas (todas), #medidas/M06 (su ficha),
// #medidas/M01-M06 (dos o tres lado a lado) y #medidas/alternativas (las alternativas estudiadas).
import { alternatives } from "../alternativas.js";
import { announce } from "../comun.js";
import { matrix } from "../matriz.js";
import { revealHeadings } from "../movimiento.js";
import { el, es } from "../ui.js";
import { burbujas } from "./burbujas.js";
import { linkDiagram } from "./enlaces.js";
import { compare, ficha } from "./ficha.js";

const section = (id, title, sub, body, capitulo) => el("section", { class: "sec", id, "aria-labelledby": `${id}-t`, "data-capitulo": capitulo }, [
  el("div", { class: "sec-cab" }, [el("h2", { id: `${id}-t`, "data-reveal": "heading", text: title }), sub ? el("p", { class: "sub", text: sub }) : null]),
  el("div", { class: "sec-cuerpo" }, [body]),
]);
/** Lo primero que dice el indicador de una medida («Precio de los contratos nuevos»). */
const watch = (kpi) => (kpi ?? "").split(/[(;.]/)[0].trim();
const lineName = (store, k) => store.medidas.lineas[k].split(":")[0];

/** Un selector de línea de actuación con botones y lo que dibuja cada línea. */
function byLine(store, draw, withAll) {
  const keys = [...(withAll ? [""] : []), ...Object.keys(store.medidas.lineas)];
  const out = el("div", { class: "por-linea" });
  const buttons = keys.map((k) => el("button", { type: "button", class: "opcion", "aria-pressed": String(k === keys[0]), text: k ? lineName(store, k) : "Todas" }));
  buttons.forEach((b, i) => b.addEventListener("click", () => { buttons.forEach((o) => o.setAttribute("aria-pressed", String(o === b))); out.replaceChildren(draw(keys[i])); announce(b.textContent); }));
  out.append(draw(keys[0]));
  return el("div", {}, [el("div", { class: "x-botones", role: "group", "aria-label": "Línea de actuación", "data-control": "" }, buttons), out]);
}

/** La cadena de una línea: problema → cómo actúa → medida → qué vigilar. */
function chain(store, line) {
  const ms = store.medidas.medidas.filter((m) => m.linea === line);
  const problems = [...new Set(ms.flatMap((m) => m.problemas))], mechs = [...new Set(ms.map((m) => m.mecanismo))];
  const links = new Set();
  ms.forEach((m) => { m.problemas.forEach((p) => links.add(`p:${p}|c:${m.mecanismo}`)); links.add(`c:${m.mecanismo}|m:${m.id}`); links.add(`m:${m.id}|k:${m.id}`); });
  return linkDiagram({
    label: `Cadena de «${lineName(store, line)}»`,
    columns: [
      { title: "El problema", items: problems.map((p) => ({ id: `p:${p}`, label: store.problemName(p) })) },
      { title: "Cómo actúa", items: mechs.map((c) => ({ id: `c:${c}`, label: store.medidas.mecanismos[c] })) },
      { title: "La medida", items: ms.map((m) => ({ id: `m:${m.id}`, label: `${m.id} ${m.nombre}`, href: `#medidas/${m.id}`, cls: "medida" })) },
      { title: "Qué vigilar", items: ms.map((m) => ({ id: `k:${m.id}`, label: watch(m.kpi) })) },
    ],
    links: [...links].map((x) => x.split("|")),
  });
}

/** Quién decide: nivel de gobierno → medida → papel de BM30. */
function deciders(store, line) {
  const M = store.medidas, ms = M.medidas.filter((m) => !line || m.linea === line);
  const levels = Object.keys(M.decide).filter((d) => ms.some((m) => m.decide.includes(d)));
  const roles = Object.keys(M.papeles_bm30).filter((r) => ms.some((m) => m.papel_bm30.papel === r));
  return linkDiagram({
    label: "Quién decide cada medida y qué puede hacer BM30",
    columns: [
      { title: "Quién decide", items: levels.map((d) => ({ id: `d:${d}`, label: M.decide[d] })) },
      { title: "La medida", items: ms.map((m) => ({ id: `m:${m.id}`, label: `${m.id} ${m.nombre}`, href: `#medidas/${m.id}`, cls: "medida" })) },
      { title: "Papel de BM30", items: roles.map((r) => ({ id: `r:${r}`, label: M.papeles_bm30[r], cls: `papel-${r}` })) },
    ],
    links: ms.flatMap((m) => [...m.decide.map((d) => [`d:${d}`, `m:${m.id}`]), [`m:${m.id}`, `r:${m.papel_bm30.papel}`]]),
  });
}

/** Elegir dos o tres medidas para verlas lado a lado. */
function chooser(store, ids) {
  const opts = (none) => [...(none ? [el("option", { value: "", text: "Ninguna" })] : []), ...store.medidas.medidas.map((m) => el("option", { value: m.id, text: `${m.id} ${m.nombre}` }))];
  const sels = [0, 1, 2].map((i) => { const s = el("select", { id: `cmp-${i}` }, opts(i === 2)); s.value = ids[i] ?? (i === 0 ? "M01" : i === 1 ? (ids[0] === "M06" ? "M01" : "M06") : ""); return s; });
  const go = el("a", { class: "pildora primaria", href: "#medidas" }, [el("span", { class: "rotulo" }, [el("span", { "data-t": "Comparar", text: "Comparar" })]), el("span", { class: "chip", "aria-hidden": "true", text: "→" })]);
  const sync = () => { go.href = `#medidas/${[...new Set(sels.map((s) => s.value).filter(Boolean))].join("-")}`; };
  sels.forEach((s) => s.addEventListener("change", sync));
  sync();
  return el("div", { class: "eligen eligen-medidas", "data-control": "" }, [
    ...sels.map((s, i) => el("div", { class: "elige-muni" }, [el("label", { for: s.id, text: i === 2 ? "Y una tercera" : `Medida ${i + 1}` }), s])), el("p", {}, [go]),
  ]);
}

/** La frase del plano, contada con los datos: dónde caen las de evidencia alta y cuántas de las rápidas tienen poca. */
function planoSub(M) {
  const high = M.medidas.filter((m) => m.evidencia === "Alta"), short = M.medidas.filter((m) => m.plazo === "corto");
  const weak = short.filter((m) => ["Media-baja", "Baja"].includes(m.evidencia)).length;
  const slow = high.every((m) => m.plazo !== "corto");
  return `${slow ? `Las ${es(high.length)} de evidencia alta tardan (medio o largo plazo)` : `${es(high.length)} tienen evidencia alta`}; de las ${es(short.length)} de corto plazo, ${es(weak)} tienen evidencia media-baja o baja. El tamaño de cada burbuja, la población donde hace falta.`;
}

export function renderMedidas(root, store) {
  const M = store.medidas, ya = M.medidas.filter((m) => m.viabilidad === "instrumento_existente").length;
  const head = el("header", { class: "vista-cab" }, [
    el("h1", { text: "Las medidas, con los mismos criterios" }),
    el("p", { class: "sub" }, [el("b", { text: `${es(ya)} de ${es(M.medidas.length)}` }), " se pueden aplicar ya, sin cambiar ninguna ley. Ninguna tiene una nota única: cada criterio se ve aparte."]),
  ]);
  let general = null;
  const generalView = () => general ??= [
    head,
    section("plano", "Evidencia y plazo", planoSub(M), burbujas(store), "El plano"),
    section("matriz", "Todas, criterio a criterio", "Filtra o da peso a lo que te importa: la tabla se ordena.", matrix(store), "La matriz"),
    section("cadena", "De cada problema a qué vigilar", "Elige una línea de actuación. Pasa por una medida para ver su cadena.", byLine(store, (k) => chain(store, k), false), "La cadena"),
    section("decide", "Quién decide cada medida", "Del Estado a los ayuntamientos, y qué puede hacer BM30 en cada una.", byLine(store, (k) => deciders(store, k), true), "Quién decide"),
    section("comparar", "Dos o tres, lado a lado", null, chooser(store, []), "Comparar"),
    section("alternativas", "Las alternativas estudiadas", "Ideas que se analizaron y por qué no están entre las 34.", el("div", {}, alternatives(store)), "Alternativas"),
  ];
  const show = (sub) => {
    const ids = [...new Set((sub ?? "").split("-").filter((x) => Object.hasOwn(store.measures, x)))].slice(0, 3);
    if (ids.length === 1) {
      root.replaceChildren(el("div", { class: "sec ficha-medida" }, [ficha(store, store.measures[ids[0]])]), section("comparar", "Compárala con otras", null, chooser(store, [ids[0]]), "Comparar"));
    } else if (ids.length > 1) {
      root.replaceChildren(el("header", { class: "vista-cab" }, [el("p", {}, [el("a", { class: "volver", href: "#medidas", text: "← Todas las medidas" })]), el("h1", { text: "Medidas lado a lado" })]),
        el("div", { class: "sec" }, [compare(store, ids.map((x) => store.measures[x]))]), section("comparar", "Cambia la comparación", null, chooser(store, ids), "Comparar"));
    } else {
      root.replaceChildren(...generalView());
      if (sub === "alternativas") requestAnimationFrame(() => root.querySelector("#alternativas")?.scrollIntoView());
    }
    revealHeadings(root);
  };
  return { show };
}
