// La portada de Situación y su escena. En reposo: tres bloques de color, el titular que los cruza y Bizkaia en 3D en el
// bloque azul noche. Con el scroll, el bloque azul noche se abre a toda la pantalla y el mapa recorre los cinco problemas
// del resumen (resumen.json), cada uno con su cifra; al final queda el último. En el móvil y con «reducir movimiento», la
// portada y debajo los cinco problemas en lista.
import { reduced } from "../comun.js";
import { el } from "../ui.js";
import { INDICADORES } from "./indicadores.js";
import { newState, territory } from "./territorio.js";

const SOURCE = { calculo: "Cálculo propio", oficial: "Dato oficial", aproximacion: "Aproximación" };

/** De dónde sale la cifra de un problema: los organismos de sus fuentes, sin repetir («Gobierno Vasco, Eustat»). */
const sourcesOf = (store, p) => [...new Set(p.fuentes.map((k) => (store.fuentes[k]?.nombre ?? "").split(",")[0]).filter(Boolean))].join(", ");

/** Los cinco pasos, escritos en la página: la cifra, el problema, lo que cuenta la cifra, su fuente y qué enseña el mapa. */
export function writeSteps(root, store) {
  const steps = store.resumen.problemas.map((p, i) => el("div", { class: "paso-terr", "data-i": String(i) }, [
    el("p", { class: "num", text: p.cifra }),
    el("h2", { text: p.titulo }),
    el("p", { class: "unidad", text: p.unidad }),
    el("p", { class: "fuente" }, [el("span", { class: "etiqueta", text: SOURCE[p.etiqueta] || "Dato oficial" }), ` ${sourcesOf(store, p)}`]),
    el("p", { class: "en-mapa", text: `En el mapa: ${INDICADORES[i].titulo.toLowerCase()}.` }),
  ]));
  root.querySelector("[data-pasos]").replaceChildren(...steps);
}

/** El ratón mueve un poco los bordes de los bloques (hasta un 4 %), con suavidad. */
function pointerShift(hero) {
  if (!window.gsap || reduced() || matchMedia("(pointer: coarse)").matches) return;
  const toX = gsap.quickTo(hero, "--px", { duration: 0.8, ease: "power3.out", unit: "%" });
  const toY = gsap.quickTo(hero, "--py", { duration: 0.8, ease: "power3.out", unit: "%" });
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    toX(((e.clientX - r.left) / r.width - 0.5) * 8);
    toY(((e.clientY - r.top) / r.height - 0.5) * 8);
  });
  hero.addEventListener("pointerleave", () => { toX(0); toY(0); });
}

/** El estado que mueve el 3D de la portada: lo comparten la escena y el territorio, aunque el 3D llegue después. */
export const portadaState = newState();

/** Registra la escena «territorio» en el escenario de taste. */
export function registerPortada() {
  const S = portadaState;
  Scenes.territorio = (root, opts = {}) => Stage.scene(root, {
    hold: opts.hold ?? 3,
    scrub: Stage.lenis ? true : 0.6,
    phone: "rest",
    build(tl, { q }) {
      const steps = q(".paso-terr");
      gsap.set(steps, { opacity: 0, y: 28 }); // opacidad, no visibility: los lectores de pantalla siguen leyendo los cinco
      // se abre el bloque azul noche y el titular se aparta
      tl.to(root, { "--open": 1, duration: 0.12, ease: "power2.inOut" }, 0.01)
        .to(q(".titular"), { autoAlpha: 0, duration: 0.06 }, 0.08)
        .to(S, { w0: 0, w1: 1, cam: 1, bias: 1, duration: 0.12 }, 0.04);
      const span = 0.17;
      steps.forEach((step, i) => {
        const at = 0.14 + i * span;
        tl.to(step, { opacity: 1, y: 0, duration: 0.05 }, at);
        tl.to(S, { label: i, duration: 0.001 }, at).to(S, { labelOp: 1, duration: 0.04 }, at + 0.02);
        if (i < steps.length - 1) {
          tl.to(step, { opacity: 0, y: -28, duration: 0.04 }, at + span - 0.045)
            .to(S, { labelOp: 0, duration: 0.03 }, at + span - 0.05)
            .to(S, { [`w${i + 1}`]: 0, [`w${i + 2}`]: 1, cam: i + 2, duration: 0.1 }, at + span - 0.04);
        }
      });
    },
    rest() { Object.assign(S, { w0: 1, w1: 0, w2: 0, w3: 0, w4: 0, w5: 0, cam: 0, bias: 0, labelOp: 0 }); },
  });
}

/** Monta la portada: los pasos, el movimiento de los bloques y el 3D (que se carga después de pintar). */
export async function portada(root, store) {
  writeSteps(root, store);
  pointerShift(root);
  const host = root.querySelector(".terr-map");
  return territory(host, store.municipiosGeo, store.municipios, { frame: root.querySelector(".b3"), label: root.querySelector('[data-l="bilbao"]'), state: portadaState });
}
