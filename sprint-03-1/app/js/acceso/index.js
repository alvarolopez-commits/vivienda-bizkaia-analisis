// Acceso · simulador de alquiler y compra. Las cuatro partes (El alquiler, La escalera, Prueba tus supuestos, ¿Hasta dónde llega mi hogar?)
// y TODAS las cuentas las dibuja el renderizador ORIGINAL (app/original/js/acceso, con calculo-acceso.js intacto). Aquí solo cambia la
// composición: pestañas internas de vidrio, supuestos a la izquierda y resultados a la derecha en el explorador, mapa y rejilla sólidos,
// y un cuadro que separa lo que el lector puede elegir de lo que son supuestos fijos del modelo (las cifras salen de acceso.json).
import { renderAcceso } from "../../original/js/acceso/index.js";
import { el, es } from "../../original/js/ui.js";
import { envolver } from "../lectura.js";
import { fijar, filaContexto, leer } from "../contexto.js";

export function montar(raiz, { store }) {
  const lec = envolver(raiz, { clase: "v-acceso", indice: "pestanas", dibujar: (c) => renderAcceso(c, store) });
  const s = store.acceso.supuestos;

  // controles de parámetros: material de vidrio (L1); resultados y rejilla siguen siendo sólidos
  raiz.querySelectorAll(".x-controles, .alcance-controles").forEach((n) => n.classList.add("vidrio"));

  // ---------- consulta compartible: los supuestos viajan en la dirección ----------
  //   #acceso?lugar=48020&hogar=P50&ahorro=15&entrada=35&interes=2.92&plazo=30&tu=1&mh=2&ma=15
  //   lugar = «Dónde» (código INE o 48 = Bizkaia) · hogar = P25|P50|P75 · ahorro y entrada en % · interes en % · plazo en años · tu=1 con el préstamo TU CASA
  //   mh y ma = hogar (posición en la lista) y ahorro (%) del mapa «¿Hasta dónde llega mi hogar?». Solo se escribe lo que no es el valor por defecto.
  //   No se toca ninguna fórmula: se pulsan los mismos controles que pulsaría la persona y la dirección se escribe sin recargar la vista.
  const lugar = raiz.querySelector("#x-lugar");
  const HOGAR = { "Ingresos bajos": "P25", "Ingresos medios": "P50", "Ingresos altos": "P75" };
  const num = (s) => Number(String(s).replace(",", ".").match(/[\d.]+/)?.[0]);
  const botones = (etq, ambito = ".explorador") => [...(raiz.querySelector(`${ambito} [role="group"][aria-label="${etq}"]`)?.querySelectorAll(".opcion") ?? [])];
  const activo = (etq, ambito) => botones(etq, ambito).findIndex((b) => b.getAttribute("aria-pressed") === "true");
  const E = { ahorro: "Ahorra cada año", entrada: "Entrada, con impuestos y gastos", interes: "Interés", plazo: "Plazo", tu: "Préstamo «TU CASA» para la entrada", hogar: "Hogar" };
  const estado = () => {
    const v = (etq) => botones(etq)[activo(etq)]?.textContent.trim();
    return { lugar: lugar?.value, hogar: HOGAR[v(E.hogar)], ahorro: num(v(E.ahorro)), entrada: num(v(E.entrada)), interes: num(v(E.interes)), plazo: num(v(E.plazo)), tu: v(E.tu) === "Sí" ? 1 : 0,
      mh: activo("Ingresos del hogar", ".alcance-controles"), ma: num(botones("Lo que ahorra cada año", ".alcance-controles")[activo("Lo que ahorra cada año", ".alcance-controles")]?.textContent) };
  };
  const porDefecto = estado();
  let ultimo = location.hash;   // la última dirección que escribió esta vista: si la de la barra es otra (pegada, atrás/adelante), se vuelve a aplicar
  const escribir = () => {
    const e = estado(), q = new URLSearchParams();
    Object.entries(e).forEach(([k, val]) => { if (val !== undefined && !Number.isNaN(val) && val !== porDefecto[k]) q.set(k, String(val)); });
    const qs = q.toString();
    history.replaceState(null, "", `#acceso${qs ? `?${qs}` : ""}`);
    ultimo = location.hash;
  };
  // Pone TODOS los controles como dice la dirección; lo que falta o no existe en los controles se deja en su valor por defecto (así también sirve al pegar otra dirección).
  const aplicar = () => {
    const q = new URLSearchParams(location.hash.split("?")[1] ?? "");
    const pulsa = (etq, valor, ambito) => { const b = botones(etq, ambito).find((x) => (HOGAR[x.textContent.trim()] ?? num(x.textContent)) === valor); b?.click(); return !!b; };
    const elige = (etq, pedido, defecto, ambito) => { const valido = pedido !== null && (typeof pedido === "string" || Number.isFinite(pedido)); if (valido && pulsa(etq, pedido, ambito)) return; if (defecto !== undefined && !Number.isNaN(defecto)) pulsa(etq, defecto, ambito); };
    if (lugar) {
      const quiere = q.get("lugar"), v = quiere && [...lugar.options].some((o) => o.value === quiere) ? quiere : porDefecto.lugar;
      if (lugar.value !== v) { lugar.value = v; lugar.dispatchEvent(new Event("change", { bubbles: true })); }
    }
    elige(E.hogar, ["P25", "P50", "P75"].includes(q.get("hogar")) ? q.get("hogar") : null, porDefecto.hogar);
    for (const k of ["ahorro", "entrada", "interes", "plazo"]) elige(E[k], q.has(k) ? num(q.get(k)) : null, porDefecto[k]);
    botones(E.tu)[q.get("tu") === "1" ? 1 : 0]?.click();
    const mh = Number(q.get("mh")), bh = botones("Ingresos del hogar", ".alcance-controles");
    (q.has("mh") && Number.isInteger(mh) && bh[mh] ? bh[mh] : bh[porDefecto.mh])?.click();
    elige("Lo que ahorra cada año", q.has("ma") ? num(q.get("ma")) : null, porDefecto.ma, ".alcance-controles");
  };
  aplicar();
  lugar?.addEventListener("change", () => { if (lugar.value !== "48") fijar({ muni: lugar.value }); });
  const alCambiar = () => queueMicrotask(escribir);
  ["click", "change"].forEach((ev) => lec.nodos.contenido.addEventListener(ev, (e) => { if (e.target.closest(".explorador, .alcance-controles")) alCambiar(); }));
  lec.nodos.contenido.prepend(filaContexto("acceso", { clase: "en-acceso" }));

  // la leyenda del mapa «¿Hasta dónde llega mi hogar?» va encima del mapa, como la de Situación (el nodo no se vuelve a dibujar: solo cambia de sitio)
  const clave = raiz.querySelector(".alcance-clave"), lienzo = raiz.querySelector(".mapa-lienzo");
  if (clave && lienzo) lienzo.prepend(clave);

  // «Lo que eliges» / «Lo que no cambia»: el explorador deja elegir dónde, hogar, ahorro, entrada, interés, plazo y «TU CASA»; el resto son supuestos
  // del modelo (acceso.json). El umbral de 10 años es el del código original (LONG); aquí solo se muestra, con texto además del color.
  const controles = raiz.querySelector(".x-controles");
  if (controles) {
    const fijos = el("div", { class: "x-fijos opaco", "data-propuesta": "" }, [
      el("p", { class: "x-fijos-t", text: "Lo que no cambia" }),
      el("ul", {}, [
        el("li", { text: `El banco presta el ${es(100 * s.financiacion)} % del precio.` }),
        el("li", { text: `La cuota no puede pasar del ${es(100 * s.tope_esfuerzo)} % de los ingresos después de impuestos.` }),
        el("li", { class: "largo", text: "Desde 10 años ahorrando la entrada, la casilla se marca con ◆ y en rosa." }),
      ]),
    ]);
    const lado = el("div", { class: "x-lado" }, [el("div", {}, [el("p", { class: "x-lado-t", "data-propuesta": "", text: "Lo que eliges" })]), fijos]);
    controles.before(lado);
    lado.firstChild.append(controles);
  }
  return { alCambiarDireccion() { if (location.hash !== ultimo) aplicar(); }, desmontar: () => lec.desmontar() };
}
