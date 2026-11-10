// La lista de Situación: los municipios ordenados por un problema. A la izquierda, los cinco problemas como pestañas
// apiladas; arriba, el filtro por tipo de municipio; a la derecha, los municipios en bandas, del que más al que menos.
// Se ven los diez primeros y un botón enseña todos.
import { announce } from "../comun.js";
import { el, TYPE_COLORS } from "../ui.js";
import { INDICADORES, ranking } from "./indicadores.js";

const FIRST = 10;

export function lista(store) {
  let ind = INDICADORES[0], tipo = null, all = false;
  const bands = el("ol", { class: "bandas", "aria-label": "Municipios ordenados por el problema elegido" });
  const more = el("button", { type: "button", class: "pildora" }, [el("span", { class: "rotulo" }, [el("span", { "data-t": "Ver todos", text: "Ver todos" })]), el("span", { class: "chip", "aria-hidden": "true", text: "↓" })]);
  const count = el("p", { class: "fuente" });

  const paint = () => {
    const rows = ranking(store, ind, tipo);
    const shown = all ? rows : rows.slice(0, FIRST);
    bands.replaceChildren(...shown.map(({ code, m, x }) => el("li", {}, [el("a", { class: "banda-muni", href: `#municipios/${code}` }, [
      el("span", { class: "v", text: ind.texto(x).replace(" (aproximado)", "*") }),
      el("span", { class: "n", text: m.nombre }),
      el("span", { class: "t" }, [el("span", { class: "punto-tipo", style: `background:${TYPE_COLORS[m.tipo]}`, "aria-hidden": "true" }), ` ${store.typeName(m.tipo)}`]),
      el("span", { class: "ir", text: "Ficha →" }),
    ])])));
    more.hidden = rows.length <= FIRST;
    more.querySelector("[data-t]").textContent = all ? "Ver los diez primeros" : `Ver los ${rows.length}`;
    more.querySelector("[data-t]").dataset.t = more.querySelector("[data-t]").textContent;
    const approx = shown.some((r) => r.x.aprox);
    count.textContent = `${rows.length} municipios con dato. ${ind.fuente}.${approx ? " *Aproximado: precio medio de su área." : ""}`;
  };

  const tabs = INDICADORES.map((x) => el("button", { type: "button", "aria-pressed": String(x === ind) }, [
    el("span", { class: "p1", text: x.corto }), el("span", { class: "p2", text: `${ranking(store, x).length} con dato` }),
  ]));
  tabs.forEach((b, i) => b.addEventListener("click", () => {
    ind = INDICADORES[i]; all = false;
    tabs.forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
    paint(); announce(`Ordenados por: ${ind.titulo}`);
  }));
  const types = [null, ...store.typeKeys].map((t) => el("button", { type: "button", class: "opcion", "aria-pressed": String(t === tipo), text: t ? store.typeName(t).split(" (")[0] : "Todos" }));
  types.forEach((b, i) => b.addEventListener("click", () => {
    tipo = i ? store.typeKeys[i - 1] : null; all = false;
    types.forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
    paint(); announce(tipo ? `Solo ${store.typeName(tipo)}` : "Todos los tipos");
  }));
  more.addEventListener("click", () => { all = !all; paint(); });
  paint();

  return el("section", { class: "sec lista-sec", id: "lista", "aria-labelledby": "lista-t", "data-capitulo": "Municipios" }, [
    el("div", { class: "sec-cab cab-lista" }, [
      el("h2", { id: "lista-t", "data-reveal": "heading" }, [el("span", { class: "suave", text: "Los 113 municipios," }), "de más a menos"]),
    ]),
    el("div", { class: "lista-cuerpo" }, [
      el("div", { class: "pestanas-v", role: "group", "aria-label": "Ordenar por", "data-control": "" }, tabs),
      el("div", {}, [el("div", { class: "filtro-tipos", role: "group", "aria-label": "Tipo de municipio", "data-control": "" }, types), bands,
        el("div", { class: "lista-pie" }, [more]), count]),
    ]),
  ]);
}
