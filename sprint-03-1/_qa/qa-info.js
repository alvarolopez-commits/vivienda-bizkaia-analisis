// Mejora D · información del dato. En el navegador, con la app abierta en http://localhost:4179/#situacion/alquiler :
//   window.__qaRes = null; import('/_qa/qa-info.js').then(m => m.run()).then(r => window.__qaRes = r)
// Comprueba que cada campo sale de los datos reales (y que si falta se dice, sin suposiciones), las fechas de referencia (no la de hoy), el teclado
// (abrir, foco, Escape, Tab, clic fuera, uno a la vez), el material (vidrio solo en el contenedor) y el contraste.
import { cargarStore } from "/js/datos.js";
import { INDICADORES } from "/original/js/situacion/indicadores.js";
import { DOTS } from "/original/js/municipios/puntos.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const rgb = (c) => (c.match(/[\d.]+/g) ?? []).map(Number);
const sobreBlanco = ([r, g, b, a = 1]) => [r, g, b].map((v) => v * a + 255 * (1 - a));
const L = (c) => { const [r, g, b] = c; return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const contraste = (fg, bg) => { const a = L(sobreBlanco(rgb(fg))), b = L(sobreBlanco(rgb(bg))); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
const fecha = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }); };

export async function run() {
  const out = [];
  const ok = (name, pass, detail = "") => out.push({ name, pass: !!pass, detail });
  const store = await cargarStore();
  const ir = async (hash, ms = 1700) => { location.hash = hash; await sleep(ms); };
  const campo = (rot) => { const dt = $$(".info-panel dt").find((x) => x.textContent === rot); return dt ? { dd: dt.nextElementSibling, txt: dt.nextElementSibling.textContent.trim(), falta: dt.nextElementSibling.classList.contains("falta") } : null; };
  const abre = async (b) => { b.click(); await sleep(250); return $(".info-panel"); };
  const cierra = async () => { document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })); await sleep(150); };
  const hoy = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  // ---------- Situación: los cinco indicadores ----------
  await ir("#situacion/alquiler/48020");
  const disp = $(".ind-cab .info-b");
  ok("Situación: el botón «i» está junto al título del indicador, con nombre accesible y sin abrir", !!disp && /Información sobre este indicador/.test(disp.getAttribute("aria-label")) && disp.getAttribute("aria-expanded") === "false" && !$(".info-panel"));
  const resumen = Object.fromEntries(store.resumen.problemas.map((p) => [p.id, p]));
  for (const [i, x] of INDICADORES.entries()) {
    window.__atlas.set({ i }); await sleep(300);
    const p = await abre($(".ind-cab .info-b"));
    const r = resumen[x.problema];
    const conDato = store.codes.filter((c) => x.valor(store.municipios[c])).length;
    const f = { fuente: campo("Fuente"), per: campo("Año o periodo de referencia"), act: campo("Fecha de actualización o revisión"), cob: campo("Cobertura territorial"), nat: campo("Naturaleza del valor"), def: campo("Definición") };
    ok(`Situación · ${x.corto}: nombre y definición originales (título del indicador y la frase de su cifra)`, p.querySelector(".info-t").textContent === x.titulo && f.def.txt === `${r.cifra} ${r.unidad}`, f.def?.txt);
    ok(`Situación · ${x.corto}: fuente original del indicador + las fuentes del problema (${r.fuentes.length}) con su enlace`, f.fuente.txt.includes(x.fuente) && r.fuentes.every((id) => $$(".info-lista a", f.fuente.dd).some((a) => a.href === store.fuentes[id].url && a.textContent === store.fuentes[id].nombre)));
    ok(`Situación · ${x.corto}: periodo tomado del texto de la fuente (${f.per.txt})`, !f.per.falta && x.fuente.includes(f.per.txt.split(" y ")[0]));
    ok(`Situación · ${x.corto}: fechas de referencia = las de los datos (descarga ${fecha(store.meta.fecha_datos)}, revisión ${fecha(store.meta.fecha_revision)}), no la de hoy`, f.act.txt.includes(fecha(store.meta.fecha_datos)) && f.act.txt.includes(fecha(store.meta.fecha_revision)) && !p.textContent.includes(hoy));
    ok(`Situación · ${x.corto}: cobertura calculada con el recuento real (${conDato} de ${store.codes.length})`, f.cob.txt.includes(`${conDato.toLocaleString("es-ES")} de ${store.codes.length}`), f.cob.txt);
    ok(`Situación · ${x.corto}: naturaleza = la etiqueta del dato («${r.etiqueta}»)${r.etiqueta === "aproximacion" || x.problema === "alquiler" || x.problema === "compra" ? " y su explicación original de lo aproximado" : ""}`, f.nat.dd.querySelector(".info-pill")?.className.includes(`pill-${r.etiqueta}`) && (!["alquiler", "compra"].includes(x.problema) || f.nat.txt.includes(store.meta.aproximados[x.problema].slice(0, 60))), f.nat.txt.slice(0, 80));
    ok(`Situación · ${x.corto}: enlace a Método (etiquetas y fuentes)`, $$(".info-metodo a", p).map((a) => a.getAttribute("href")).includes("#metodo/las-etiquetas-de-cada-cifra") && $$(".info-metodo a", p).map((a) => a.getAttribute("href")).includes("#metodo/fuentes"));
    await cierra();
  }

  // naturalezas que hay en los datos: ninguna es «oficial» (se documenta)
  const tipos = [...new Set(store.resumen.problemas.map((p) => p.etiqueta))];
  ok(`Naturalezas presentes en los datos: ${tipos.join(", ")} (ningún problema está clasificado como «oficial»: no se inventa)`, tipos.every((t) => ["oficial", "calculo", "aproximacion"].includes(t)) && !tipos.includes("oficial"));

  // ---------- teclado ----------
  await ir("#situacion/alquiler/48020");
  const b = $(".ind-cab .info-b");
  b.focus(); b.click(); await sleep(250);
  ok("Teclado: al abrir, el foco pasa al panel (botón de cerrar), el botón queda con aria-expanded=true y el panel es un diálogo con nombre", document.activeElement?.classList.contains("info-cerrar") && b.getAttribute("aria-expanded") === "true" && $(".info-panel").getAttribute("role") === "dialog" && !!document.getElementById($(".info-panel").getAttribute("aria-labelledby")));
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })); await sleep(200);
  ok("Teclado: Escape cierra el panel y devuelve el foco al botón", !$(".info-panel") && document.activeElement === b && b.getAttribute("aria-expanded") === "false");
  b.click(); await sleep(200); $(".info-cerrar").click(); await sleep(150);
  ok("El botón × cierra y devuelve el foco al botón", !$(".info-panel") && document.activeElement === b);
  b.click(); await sleep(200); b.click(); await sleep(150);
  ok("Pulsar otra vez el botón «i» lo cierra", !$(".info-panel"));
  b.click(); await sleep(200); document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })); await sleep(150);
  ok("Un clic fuera cierra el panel", !$(".info-panel"));
  b.click(); await sleep(200); const otro = $("#buscar"); otro.focus(); $(".info-cerrar").dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: otro })); await sleep(150);   // evento sintético: el panel del navegador no siempre tiene el foco de ventana
  ok("Si el foco sale del panel (Tab hacia fuera) el panel se cierra", !$(".info-panel"));
  b.click(); await sleep(200); window.dispatchEvent(new Event("hashchange")); await sleep(150);
  ok("Al cambiar de dirección el panel se cierra (no queda colgado al cambiar de vista)", !$(".info-panel"));
  b.click(); await sleep(200);
  $$(".info-b")[0].click();
  ok("Solo hay un panel abierto a la vez", $$(".info-panel").length <= 1);
  await cierra();

  // ---------- material y contraste ----------
  b.click(); await sleep(250);
  const cu = getComputedStyle($(".info-cuerpo")), pn = getComputedStyle($(".info-panel")), bt = getComputedStyle(b);
  ok("Material: vidrio solo en el contenedor ligero (el botón y el marco del panel); el texto va en una superficie sólida sin desenfoque", /blur/.test(bt.backdropFilter) && /blur/.test(pn.backdropFilter) && (cu.backdropFilter === "none" || !cu.backdropFilter) && !/blur/.test(getComputedStyle($(".info-campos")).backdropFilter));
  const fondo = cu.backgroundColor;
  const cs = [["título", ".info-t"], ["rótulo", ".info-campos dt"], ["texto", ".info-campos dd"], ["enlace de fuente", ".info-lista a"], ["enlace a Método", ".info-metodo a"], ["etiqueta", ".info-pill"]];
  const bajos = cs.map(([n, s]) => { const e = $(s); return e ? [n, contraste(getComputedStyle(e).color, getComputedStyle(e.className.includes("pill") ? e : e).backgroundColor === "rgba(0, 0, 0, 0)" ? fondo : getComputedStyle(e).backgroundColor)] : null; }).filter(Boolean).filter(([, c]) => c < 4.5);
  ok("Contraste AA (≥ 4,5:1) de título, rótulos, texto, enlaces y etiqueta sobre la superficie sólida", bajos.length === 0, bajos.map(([n, c]) => `${n} ${c.toFixed(2)}`).join(", "));
  ok("El contenido largo se desplaza dentro del panel (no sale de la ventana)", (() => { const r = $(".info-panel").getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth; })());
  await cierra();

  // ---------- Municipios: 13 indicadores ----------
  await ir("#municipios/48020", 2200);
  const bs = $$(".filas-ind .info-b");
  ok("Municipios: un botón «i» en cada uno de los 13 indicadores (sin cambiar el texto del nombre del indicador)", bs.length === 13 && $$(".nombre-ind").every((n, i) => n.textContent.trim() === DOTS[i][1]));
  const clave = DOTS.findIndex((d) => d[0] === "esfuerzo_alquiler_P25");   // «Alquiler nuevo, en % de unos ingresos bajos (2024)»: con año en el nombre y con huecos
  const pm = await abre(bs[clave]);
  const conDatoM = store.codes.filter((c) => typeof store.municipios[c].indicadores.esfuerzo_alquiler_P25 === "number").length;
  ok("Municipios · alquiler (indicador con huecos): nombre original, periodo del propio nombre (2024) y cobertura real", pm.querySelector(".info-t").textContent === DOTS[clave][1] && campo("Año o periodo de referencia").txt === "2024" && campo("Cobertura territorial").txt.startsWith(`${conDatoM} de ${store.codes.length}`) && /sin dato/.test(campo("Cobertura territorial").txt), campo("Cobertura territorial").txt);
  ok("Municipios: lo que NO consta (definición, fuente por indicador y naturaleza) se dice «No consta en los datos» y no se rellena", ["Definición", "Fuente", "Naturaleza del valor"].every((r) => campo(r).falta && campo(r).txt === "No consta en los datos"));
  ok("Municipios: aun así enlaza a Método (fuentes, etiquetas y limitaciones) y da las fechas de los datos", $$(".info-metodo a", pm).length === 3 && !campo("Fecha de actualización o revisión").falta);
  await cierra();
  const ibs = DOTS.map((d, i) => [d, i]).filter(([d]) => /\(\d{4}\)|\d{4} a \d{4}/.test(d[1]));
  let perOk = 0; for (const [d, i] of ibs) { await abre(bs[i]); const per = campo("Año o periodo de referencia"); if (!per.falta && d[1].includes(per.txt.split(" y ")[0])) perOk++; await cierra(); }
  ok(`Municipios: en los ${ibs.length} indicadores cuyo nombre trae un año o intervalo, el periodo mostrado es ese`, perOk === ibs.length, `${perOk}/${ibs.length}`);
  const sinAnio = DOTS.map((d, i) => [d, i]).filter(([d]) => !/\d{4}/.test(d[1]));
  let falta = 0; for (const [, i] of sinAnio) { await abre(bs[i]); if (campo("Año o periodo de referencia").falta) falta++; await cierra(); }
  ok(`Municipios: donde el nombre no trae año (${sinAnio.length} indicadores) el periodo figura como «No consta»`, falta === sinAnio.length, `${falta}/${sinAnio.length}`);

  // alquilar y comprar (precio observado y orientativo)
  const bh = $("#hogares .info-b");
  const ph = await abre(bh);
  const propios = store.codes.filter((c) => store.municipios[c].compra?.precio).length, orient = store.codes.filter((c) => !store.municipios[c].compra?.precio && store.municipios[c].compra?.orientativo).length;
  ok("Municipios · Alquilar y comprar: cobertura con el recuento real de precio propio y orientativo, periodo del precio y de los ingresos, y la explicación original de lo aproximado", campo("Cobertura territorial").txt.includes(`${propios} municipios`) && campo("Cobertura territorial").txt.includes(`${orient} de los`) && campo("Año o periodo de referencia").txt.includes(store.meta.periodo_precio) && campo("Naturaleza del valor").txt.includes(store.meta.aproximados.compra.slice(0, 50)), campo("Cobertura territorial").txt);
  await cierra();

  // en la comparación
  await ir("#municipios/48020-48004", 2400);
  ok("Comparación: los botones «i» siguen en los 13 indicadores y el de «Alquilar y comprar»", $$(".filas-ind .info-b").length === 13 && !!$("#hogares .info-b"));

  // ---------- Acceso ----------
  await ir("#acceso", 2200);
  const ids = ["alquilar", "escalera", "explorador", "alcance"];
  ok("Acceso: un botón «i» en cada una de las cuatro partes", ids.every((id) => !!$(`#${id} .sec-cab .info-b`)));
  const s = store.acceso.supuestos;
  for (const id of ids) {
    const p = await abre($(`#${id} .sec-cab .info-b`));
    const origen = $(`#${id} > .fuente`)?.textContent ?? null;
    ok(`Acceso · ${id}: título y entradilla de la propia página${origen ? " y su línea de fuentes original" : " (esta parte no tiene línea de fuentes propia: no se inventa)"}`, p.querySelector(".info-t").textContent === $(`#${id} .sec-cab h2`).textContent && campo("Definición").txt === $(`#${id} .sec-cab .sub`).textContent.trim() && (origen ? campo("Fuente").txt.includes(origen.trim()) : true));
    ok(`Acceso · ${id}: periodo con los supuestos reales (ingresos ${s["año_renta"]}${id === "alquilar" ? "" : `, precios «${s.periodo_precio}»`})`, campo("Año o periodo de referencia").txt.includes(s["año_renta"]) && (id === "alquilar" || campo("Año o periodo de referencia").txt.includes(s.periodo_precio)));
    await cierra();
  }

  // ---------- Medidas ----------
  await ir("#medidas", 2200);
  const pmd = await abre($(".rep-titulo .info-b"));
  ok("Medidas: el botón «i» del gráfico muestra el nombre del gráfico, la entradilla de la página, la fecha de comprobación del estado de las medidas (la del dato) y la cobertura real", pmd.querySelector(".info-t").textContent === $("#rep-t").textContent && campo("Fecha de actualización o revisión").txt.includes(store.medidas.estado.comprobado_el) && campo("Cobertura territorial").txt.includes(`${store.medidas.medidas.length} medidas`), campo("Fecha de actualización o revisión")?.txt);
  ok("Medidas: la fuente y la naturaleza por medida se remiten a su ficha (nota), no se inventa una fuente general", campo("Fuente").falta && /están en su ficha/.test($(".info-notas")?.textContent ?? ""));
  await cierra();

  // ---------- Normas ----------
  await ir("#normas", 2200);
  const pnor = await abre($(".lec-herr .info-b"));
  ok("Normas: la fecha mostrada es la de referencia del estado normativo del dato, no la de hoy", campo("Fecha de actualización o revisión").txt.includes(store.normas.fecha) && !pnor.textContent.includes(hoy), campo("Fecha de actualización o revisión")?.txt);
  ok("Normas: cobertura real (instrumentos y niveles), fuente original de la página y aviso de que no actualiza estados jurídicos", campo("Cobertura territorial").txt.includes(`${store.normas.competencias.length} instrumentos`) && campo("Fuente").txt.startsWith("Elaboración propia") && /no los actualiza/.test($(".info-notas").textContent));
  await cierra();

  // ---------- Método (la referencia documental) ----------
  await ir("#metodo/fuentes", 2600);
  ok("Método: «#metodo/fuentes» lleva al bloque de fuentes (el enlace de la información del dato)", !!$("#m-fuentes") && Math.abs($("#m-fuentes").getBoundingClientRect().top) < 200, `${Math.round($("#m-fuentes")?.getBoundingClientRect().top)}`);
  await ir("#metodo/datos-aproximados", 2600);
  const ba = $(".method-block[id^='m-datos-aproximados']");
  ok("Método: «#metodo/datos-aproximados» lleva al bloque (aunque su título lleve fecha) y las demás rutas de Método siguen igual", !!ba && Math.abs(ba.getBoundingClientRect().top) < 200);
  await ir("#metodo/glosario", 2200);
  ok("Método: #metodo/glosario sigue siendo la ancla del glosario", !!$("dl.glossary"));
  ok("Los textos de Método no cambian: 124 términos y los mismos bloques", $$("dl.glossary dt").length === 124 && $$(".method-block").length >= 14);
  ok("Ningún panel queda abierto y no hay errores de texto (null/undefined/NaN)", !$(".info-panel") && !/\b(null|undefined|NaN)\b/.test(document.body.innerText));

  const fail = out.filter((t) => !t.pass);
  return { total: out.length, pass: out.length - fail.length, fail: fail.length, fallos: fail.map((f) => `${f.name} (${f.detail})`), todo: out.map((t) => `${t.pass ? "PASS" : "FAIL"} · ${t.name}${t.detail ? ` (${t.detail})` : ""}`) };
}
