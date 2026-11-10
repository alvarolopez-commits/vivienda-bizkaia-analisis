// QA del Sprint 01 (opción B): línea base de Situación, menú y funciones.
//   JSON.stringify(await (await import('/_qa/qa-b.js')).lineaBase())
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
const txt = (e) => e.textContent.replace(/\s+/g, " ").trim();

export async function lineaBase() {
  await sleep(2200);
  const out = { problemas: [] };
  const labels = ["Alquiler", "Entrada", "Hogares", "Turísticas", "Vacías"];
  for (const [k, l] of labels.entries()) {
    document.querySelectorAll("#problemas .ind-b")[k].click();
    await sleep(700);
    out.problemas.push({
      problema: l,
      cifra: document.querySelector("#problemas .ind[data-activo] .ind-cifra").textContent,
      expandido: document.querySelector("#problemas .ind[data-activo] .ind-b").getAttribute("aria-expanded"),
      cuenta: document.getElementById("cuenta").textContent.split(".")[0],
      bilbao: document.querySelector("#ficha .valor").textContent,
      primera: txt(document.querySelector("#bandas li")),
      leyenda: txt(document.getElementById("ramp")),
    });
  }
  out.cartas = [...document.querySelectorAll("#herramientas .tool")].map((a) => txt(a).slice(0, 70));
  return out;
}

export async function funciones() {
  await sleep(1500);
  const out = {};
  // sincronía: problema -> ficha, lista y mapa a la vez
  document.querySelectorAll("#problemas .ind-b")[3].click(); await sleep(600);
  out.sincro = { lead: document.querySelector("#problemas .ind[data-activo] .ind-cifra").textContent, ficha: document.querySelector("#ficha .ind").textContent, lista: document.getElementById("cuenta").textContent.split(".")[0], rellenos: new Set([...document.querySelectorAll("#mapa svg path")].map((p) => p.style.fill)).size };
  // municipio desde el mapa
  document.querySelector('#mapa svg path[data-code="48044"]').dispatchEvent(new MouseEvent("click", { bubbles: true })); await sleep(300);
  out.mapaClic = { muni: document.querySelector("#ficha .muni").textContent, select: document.getElementById("elige-muni").value, enlace: document.querySelector("#ficha .btn").href };
  // tipo
  const tipo = document.getElementById("elige-tipo"); tipo.value = "costa_turistica"; tipo.dispatchEvent(new Event("change")); await sleep(300);
  out.tipo = { filas: document.querySelectorAll("#bandas li").length, cuenta: document.getElementById("cuenta").textContent.split(".")[0], atenuados: document.querySelectorAll("#mapa svg path.dim").length };
  tipo.value = ""; tipo.dispatchEvent(new Event("change")); await sleep(200);
  // ver todos
  document.getElementById("mas").click(); await sleep(300);
  out.verTodos = { filas: document.querySelectorAll("#bandas li").length, boton: document.getElementById("mas").textContent };
  document.getElementById("mas").click();
  // 3D (el módulo original solo dibuja cuando el mapa está a la vista: IntersectionObserver)
  document.getElementById("mapa").scrollIntoView({ block: "center" }); await sleep(400);
  document.querySelectorAll("#vista button")[1].click(); await sleep(3500);
  out.tres = { canvas: document.querySelectorAll(".terr-map canvas").length, svgOculto: getComputedStyle(document.querySelector("#mapa svg")).display === "none", etiqueta: document.querySelector(".etiqueta-3d")?.textContent, botonDesactivado: document.querySelectorAll("#vista button")[1].disabled };
  document.querySelectorAll("#problemas .ind-b")[0].click(); await sleep(1200);
  out.tresCambia = { lead: document.querySelector("#problemas .ind[data-activo] .ind-cifra").textContent, etiqueta: document.querySelector(".etiqueta-3d")?.textContent };
  document.querySelectorAll("#vista button")[0].click(); await sleep(400);
  out.vuelve2D = getComputedStyle(document.querySelector("#mapa svg")).display !== "none";
  return out;
}

export async function menu() {
  await sleep(1500);
  const btn = document.getElementById("menu-abrir"), d = document.getElementById("menu");
  btn.focus(); btn.click(); await sleep(500);
  const r = { botonVisible: vis(btn), abierto: d.open, vistas: [...d.querySelectorAll(".menu-lista a")].map(txt), ariaCurrent: [...d.querySelectorAll("a[aria-current=page]")].map(txt), otros: [...d.querySelectorAll(".menu-otros a")].map(txt), tituloOtros: d.querySelector(".menu-otros h2")?.textContent, focoDentro: d.contains(document.activeElement), expandido: btn.getAttribute("aria-expanded") };
  d.querySelector("form button").click(); await sleep(400);
  r.cerrado = !d.open; r.focoVuelve = document.activeElement === btn; r.expandidoTras = btn.getAttribute("aria-expanded");
  return r;
}

export async function orden() {
  await sleep(1500);
  const sel = 'a[href],button:not([disabled]),select,input,[tabindex]:not([tabindex="-1"])';
  return [...document.querySelectorAll(sel)].filter((e) => vis(e) || e.classList.contains("salto")).slice(0, 18).map((e) => { const r = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()}:${txt(e).slice(0, 22) || e.getAttribute("aria-label") || ""} @${Math.round(r.left)},${Math.round(r.top)}`; });
}
