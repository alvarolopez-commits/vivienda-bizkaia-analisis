// Las cartas de las pestañas (escena «cartas», técnica de la biblioteca de taste: una carta por paso). Con el scroll se
// reparten una a una sobre el montón, cada una llega girada y se asienta con su pequeño ángulo, en abanico; el título
// queda al lado. Son las otras cuatro pestañas, cada una con una cifra suya. En reposo, en el móvil o con «reducir
// movimiento», las cuatro en fila.
import { el, es } from "../ui.js";

/** Las cuatro cartas, con cifras de los datos de la web. */
export function cartas(store) {
  const p50 = store.acceso.bizkaia_tramos.find((t) => t.tramo.includes("P50"));
  const deck = [
    { href: "#municipios", h: "Municipios", cifra: es(store.codes.length), roll: true, unidad: "fichas", txt: "Cada municipio frente a Bizkaia y a los de su tipo, con su plan de medidas." },
    { href: "#acceso", h: "Acceso", cifra: `${es(p50.años[0], 1)} a ${es(p50.años[1], 1)}`, roll: false, unidad: "años para la entrada", txt: "Cuánto se tarda en reunir la entrada y cuánto cuesta alquilar, con tus supuestos." },
    { href: "#medidas", h: "Medidas", cifra: es(store.medidas.medidas.length), roll: true, unidad: "medidas comparadas", txt: "Por evidencia, plazo, coste y quién decide cada una." },
    store.normas ? { href: "#normas", h: "Normas", cifra: es(store.normas.niveles.length), roll: true, unidad: "niveles de gobierno", txt: "Quién decide cada herramienta, del Estado a los ayuntamientos." } : null,
  ];
  const cards = deck.filter(Boolean).map((c, i) => el("a", { class: `carta${i % 2 ? " noche" : ""}`, href: c.href }, [
    el("h3", { text: c.h }),
    el("p", { class: "cifra" }, [el("span", { "data-roll": c.roll ? "" : null, text: c.cifra }), el("small", { text: c.unidad })]),
    el("p", { text: c.txt }),
    el("span", { class: "ir", text: "Abrir →" }),
  ]));
  return el("section", { class: "scene cartas-escena", id: "pestanas", "data-scene": "cartas", "aria-labelledby": "pestanas-t", "data-capitulo": "Las pestañas" }, [
    el("div", { class: "scene-stage" }, [
      el("div", { class: "cartas-cab" }, [
        el("h2", { id: "pestanas-t", "data-reveal": "heading", text: "Cada pregunta tiene su pestaña" }),
        el("p", { text: "Municipios, acceso, medidas y normas, con todos los datos para explorar." }),
      ]),
      el("div", { class: "mano" }, cards),
    ]),
  ]);
}

/** Registra la escena: la primera carta ya está en la mesa; las otras llegan giradas desde la derecha, una por paso, y se
 * asientan en fila, cada una montada sobre la anterior sin tapar su texto. Por debajo de 1.000 px de ancho, la fila quieta. */
export function registerCartas() {
  const ANGLES = [-2, 1.5, -1, 2];
  Scenes.cartas = (root, opts = {}) => Stage.scene(root, {
    hold: opts.hold ?? 1.5,
    scrub: Stage.lenis ? true : 0.6,
    phone: "rest",
    build(tl, { q }) {
      const hand = q(".mano")[0], cards = q(".carta");
      const W = hand.clientWidth, n = cards.length;
      if (W < 1000) return Stage.REST;
      const cardW = Math.min(380, W * 0.34), step = (W - cardW) / (n - 1);
      hand.style.setProperty("--carta-w", `${cardW}px`);
      hand.style.setProperty("--carta-paso", `${step}px`);
      cards.forEach((card, i) => {
        const end = { x: i * step, y: 0, rotation: ANGLES[i % ANGLES.length], autoAlpha: 1 };
        if (i === 0) { gsap.set(card, end); return; }
        // cada carta desde su propio estado de partida (nunca relativo a la anterior: un salto de scroll no deja huecos)
        tl.fromTo(card, { x: i * step + 260, y: 70, rotation: 16, autoAlpha: 0 }, { ...end, duration: 0.12, ease: "power4.out", immediateRender: true }, 0.06 + (i - 1) * 0.3);
      });
    },
  });
}
