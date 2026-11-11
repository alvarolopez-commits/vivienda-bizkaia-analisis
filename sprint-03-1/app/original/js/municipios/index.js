// Municipios: elige un municipio y ve su ficha visual; elige otro y los ves lado a lado. Direcciones:
// #municipios (Bilbao, el más poblado), #municipios/48020 (su ficha) y #municipios/48020-48013 (comparar). La dirección
// de antes #comparar/A-B llega aquí (rutas.js).
import { announce } from "../comun.js";
import { revealHeadings, rollingFigures } from "../movimiento.js";
import { el, es, TYPE_COLORS } from "../ui.js";
import { barrios, households, plan, problems, series } from "./ficha.js";
import { dotPlot } from "./puntos.js";

const FIRST = "48020";
// los mismos textos que las fichas del informe
const ZONE = { declarada: "Zona tensionada declarada", en_tramitacion: "Zona tensionada en tramitación", zona_tensionada: "Zona tensionada en parte del municipio" };

const section = (id, title, sub, body, capitulo) => el("section", { class: "sec ficha-sec", id, "aria-labelledby": `${id}-t`, "data-capitulo": capitulo }, [
  el("div", { class: "sec-cab" }, [el("h2", { id: `${id}-t`, "data-reveal": "heading", text: title }), sub ? el("p", { class: "sub", text: sub }) : null]),
  el("div", { class: "sec-cuerpo" }, [body]),
]);

/** La cabecera de un municipio: su nombre grande, su tipo y su población. */
function head(store, code) {
  const m = store.municipios[code];
  const zona = ZONE[m.zona_tensionada] ?? null;
  return el("div", { class: "muni-cab" }, [
    el("p", { class: "muni-nombre", text: m.nombre }),
    el("p", { class: "muni-datos" }, [
      el("span", { class: "punto-tipo", style: `background:${TYPE_COLORS[m.tipo]}`, "aria-hidden": "true" }), ` ${store.typeName(m.tipo)} · ${m.comarca} · `,
      el("span", { "data-roll": "", text: es(m.poblacion) }), " habitantes", zona ? ` · ${zona}` : "",
    ]),
  ]);
}

function picker(store, id, label, value, withNone) {
  const options = store.codes.map((c) => el("option", { value: c, text: store.municipios[c].nombre }));
  const sel = el("select", { id }, withNone ? [el("option", { value: "", text: "Ninguno" }), ...options] : options);
  sel.value = value ?? "";
  return el("div", { class: "elige-muni" }, [el("label", { for: id, text: label }), sel]);
}

export function renderMunicipios(root, store) {
  const top = el("header", { class: "vista-cab" }, [
    el("h1", { text: "Cada municipio, frente a Bizkaia" }),
    el("p", { class: "sub", text: "Sus cifras, sus problemas, sus barrios y su plan. Elige otro para compararlos." }),
  ]);
  const controls = el("div", { class: "eligen", "data-control": "" });
  const body = el("div", { class: "ficha" });
  root.replaceChildren(top, controls, body);

  const show = (sub) => {
    const [a, b] = (sub ?? FIRST).split("-");
    const known = (c) => Boolean(c) && Object.hasOwn(store.municipios, c);
    const A = known(a) ? a : FIRST, B = known(b) && b !== A ? b : null;
    const canonical = `${A}${B ? `-${B}` : ""}`;
    if (sub && sub !== canonical && sub !== `${A}-`) history.replaceState(null, "", `#municipios/${canonical}`);
    const focused = document.activeElement?.id;
    controls.replaceChildren(picker(store, "muni-a", "Municipio", A, false), picker(store, "muni-b", "Comparar con", B, true));
    const go = () => { const x = controls.querySelector("#muni-a").value, y = controls.querySelector("#muni-b").value; location.hash = `#municipios/${x}${y ? `-${y}` : ""}`; };
    controls.querySelectorAll("select").forEach((s) => s.addEventListener("change", go));
    const codes = B ? [A, B] : [A];
    const name = (c) => store.municipios[c].nombre;
    body.replaceChildren(...[
      el("div", { class: `cabeceras n${codes.length}` }, codes.map((c) => head(store, c))),
      section("indicadores", B ? `${name(A)} y ${name(B)}, dato a dato` : "Dato a dato", "Cada fila, de menos a más entre los municipios con dato.", dotPlot(store, codes), "Datos"),
      section("problemas", "Sus problemas", null, el("div", { class: `columnas n${codes.length}` }, codes.map((c) => el("div", {}, [B ? el("h3", { text: name(c) }) : null, problems(store, store.municipios[c])]))), "Problemas"),
      section("hogares", "Alquilar y comprar, según los ingresos", "Un contrato nuevo de alquiler y una compra al precio del municipio.", el("div", { class: `columnas n${codes.length}` }, codes.map((c) => el("div", {}, [B ? el("h3", { text: name(c) }) : null, households(store.municipios[c])]))), "Hogares"),
      B ? null : section("evolucion", "Cómo ha cambiado", null, series(store.municipios[A]), "Evolución"),
      B ? null : section("barrios", "Sus barrios", "En color, los barrios con algún problema de barrio (sección censal).", el("div", { "data-barrios": "" }, [el("p", { class: "vacio", text: "Cargando los barrios…" })]), "Barrios"),
      B ? null : section("plan", "Su plan de medidas", `Hasta ${store.medidas.plan_maximo} medidas: primero las probadas.`, plan(store, A), "Plan"),
    ].filter(Boolean)); // replaceChildren escribiría «null» como texto
    if (!B) {
      barrios(store, A, store.problemName).then((box) => body.querySelector("[data-barrios]")?.replaceChildren(box))
        .catch((err) => { console.error("Barrios:", err); body.querySelector("[data-barrios]")?.replaceChildren(el("p", { class: "vacio", text: "No se pudieron cargar los barrios." })); });
    }
    if (focused) document.getElementById(focused)?.focus();
    rollingFigures(root);
    revealHeadings(root);
    announce(B ? `Comparando ${name(A)} y ${name(B)}` : `Ficha de ${name(A)}`);
  };
  return { show };
}
