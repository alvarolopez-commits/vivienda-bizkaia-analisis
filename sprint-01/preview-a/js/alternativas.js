// Alternativas estudiadas (fase 8 «Ideas no propuestas»; fase 13: dentro de Medidas): ideas que no entran en el plan de
// ningún municipio, con qué son, qué podrían resolver, dónde se usan y por qué no las proponemos. Los datos salen de
// analysis/ideas_no_propuestas.json. Fase 15: cada idea es una fila que se abre.
import { el, extLink } from "./ui.js";

function ideaCard(idea) {
  const sources = idea.fuentes.map((u) => el("li", {}, [extLink(u, u.replace(/^https:\/\/(www\.)?/, "").split("/")[0])]));
  // fase 15: cada idea es una fila; su detalle se abre al pedirlo (es lo secundario de la pestaña)
  return el("details", { class: "idea" }, [el("summary", {}, [el("span", { class: "idea-id", text: idea.idea_propia ? "Idea propia" : idea.id }), ` ${idea.nombre}`]),
    el("dl", { class: "facts facts-stack idea-facts" }, [
      el("dt", { text: "Qué es" }), el("dd", { text: idea.que_es }),
      el("dt", { text: "Qué podría resolver" }), el("dd", { text: idea.que_resuelve }),
      el("dt", { text: "Dónde se usa" }), el("dd", { text: idea.donde_se_usa }),
      el("dt", { text: "Por qué no la proponemos" }), el("dd", { text: idea.por_que_no }),
    ]),
    sources.length ? el("ul", { class: "src-list" }, sources) : null,
  ]);
}

/** Bloques de la sección: uno por motivo (ya existe, falta un dato, descartada). */
export function alternatives(store) {
  const { ideas, motivos } = store.ideas;
  return Object.keys(motivos).map((k) => [k, ideas.filter((i) => i.motivo === k)]).filter(([, list]) => list.length).map(([k, list]) => el("div", { class: "alt-group" }, [
    el("h3", { class: "card-group", text: motivos[k] }),
    el("div", { class: "bento cards" }, list.map(ideaCard)),
  ]));
}
