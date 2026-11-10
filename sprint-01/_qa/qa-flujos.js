// QA del Sprint 01 (opción A, la web completa): menú, enlaces profundos, orden de tabulación y línea base de funciones.
//   JSON.stringify(await (await import('/_qa/qa-flujos.js')).menu())
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
const txt = (e) => e.textContent.replace(/\s+/g, " ").trim();

export async function menu() {
  await sleep(1500);
  const btn = document.querySelector(".menu-boton"), d = document.getElementById("menu");
  btn.focus(); btn.click(); await sleep(500);
  const abierto = d.open;
  const r = {
    abierto,
    vistas: [...d.querySelectorAll(".menu-lista a")].map(txt),
    ariaCurrentEnMenu: [...d.querySelectorAll(".menu-lista a[aria-current=page]")].map(txt),
    otrosProductos: [...d.querySelectorAll(".menu-otros a")].map((a) => `${txt(a)} -> ${a.href}`),
    tituloOtros: d.querySelector(".menu-otros h2")?.textContent,
    focoDentro: d.contains(document.activeElement),
    botonCerrar: !!d.querySelector("form button"),
  };
  d.querySelector("form button").click(); await sleep(400);
  r.cerradoConCerrar = !d.open;
  r.focoVuelveAlBoton = document.activeElement === btn;
  return r;
}

export async function enlacesProfundos() {
  const casos = ["#situacion", "#municipios", "#municipios/48020", "#municipios/48020-48013", "#municipios/99999", "#acceso", "#medidas", "#medidas/M06", "#medidas/M01-M06", "#medidas/M01-M06-M20-M10", "#medidas/M01-M01", "#medidas/alternativas", "#normas", "#metodo", "#metodo/glosario", "#resumen", "#diagnostico", "#compra", "#comparar/48020-48013", "#ideas", "#cualquier-cosa"];
  const out = [];
  for (const h of casos) {
    location.hash = h; await sleep(1400);
    const vista = [...document.querySelectorAll(".view")].find((v) => !v.hidden);
    out.push({
      pedido: h, hashFinal: location.hash, vista: vista?.id,
      h1: vista?.querySelector("h1")?.textContent.replace(/\s+/g, " ").trim().slice(0, 48),
      titulo: document.title, subNavVisible: vis(document.getElementById("sub-situacion")),
      vistaActivaEnBanda: document.querySelector("[data-vista-activa]")?.textContent,
      ariaCurrentMenu: document.querySelector("#menu .menu-lista a[aria-current=page]")?.textContent,
    });
  }
  return out;
}

export async function ordenTabulacion() {
  await sleep(1500);
  const sel = 'a[href],button:not([disabled]),select,input,[tabindex]:not([tabindex="-1"])';
  const lista = [...document.querySelectorAll(sel)].filter((e) => vis(e) || e.classList.contains("saltar")).slice(0, 18);
  return lista.map((e) => { const r = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()}:${txt(e).slice(0, 22) || e.getAttribute("aria-label") || ""} @${Math.round(r.left)},${Math.round(r.top)}`; });
}

export async function lineaBase() {
  const out = {};
  location.hash = "#acceso"; await sleep(2000);
  const nums = [...document.querySelectorAll("#explorador .x-num")].map(txt);
  const labs = [...document.querySelectorAll("#explorador .x-lab")].map(txt);
  const casilla = document.querySelector("#rj-15-35")?.textContent;
  out.acceso = { numeros: nums, textos: labs, rejilla_15_35: casilla, ahorroActivo: document.querySelector('#explorador .x-grupo[aria-label="Ahorra cada año"] [aria-pressed=true]')?.textContent, alcance: document.querySelector(".alcance-total")?.textContent };
  location.hash = "#medidas"; await sleep(2200);
  out.medidas = { filas: document.querySelectorAll(".matrix-table tbody tr").length, contador: document.querySelector(".matrix .note[aria-live]")?.textContent, subtitulo: document.querySelector("#view-medidas .vista-cab .sub")?.textContent };
  location.hash = "#medidas/M01-M06-M20-M10"; await sleep(1500);
  out.comparador = { columnas: [...document.querySelectorAll("#view-medidas .compare th, #view-medidas .comparar th")].length, h1: document.querySelector("#view-medidas h1")?.textContent };
  location.hash = "#normas"; await sleep(1800);
  out.normas = { filas: document.querySelectorAll(".comp-fila:not(.cab)").length, hitos: document.querySelectorAll(".hito").length, cuenta: document.querySelector(".comp-cuenta")?.textContent, sub: document.querySelector("#view-normas .vista-cab .sub")?.textContent };
  location.hash = "#metodo"; await sleep(1800);
  out.metodo = { terminos: document.querySelectorAll("dl.glossary dt").length, fuentes: document.querySelectorAll(".sources .source").length };
  location.hash = "#municipios"; await sleep(1800);
  out.municipios = { opciones: document.querySelectorAll("#muni-a option").length };
  location.hash = "#situacion"; await sleep(2500);
  out.situacion = { cartas: [...document.querySelectorAll("#pestanas .num, #pestanas [data-roll]")].map(txt).slice(0, 8) };
  return out;
}
