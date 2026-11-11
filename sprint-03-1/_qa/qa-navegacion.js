// Sprint 03.1 · navegación integrada. En el navegador, con la app abierta en http://localhost:4179/ :
//   JSON.stringify(await (await import('/_qa/qa-navegacion.js')).run())
// Comprueba que Situación y Medidas viven en el MISMO marco y se abren entre sí con clics reales, sin salir a la web publicada,
// sin dejar dos vistas montadas a la vez y sin perder los deep links de los Sprint 02 y 03.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export async function run() {
  const out = [];
  const ok = (name, pass, detail = "") => out.push({ name, pass: !!pass, detail: String(detail) });
  const origen = location.origin;
  // espera a que la vista pedida esté montada (la primera vez se carga su módulo), no un tiempo fijo
  const listo = async () => {
    const seccion = (location.hash.match(/^#(municipios|acceso|normas|metodo)([/?]|$)/) || [])[1];
    const quiere = seccion || (/^#medidas([/?]|$)/.test(location.hash) ? "medidas" : "situacion");
    for (let i = 0; i < 60; i++) { if (window.__vista === quiere && (seccion ? $(".pendiente") : quiere === "medidas" ? window.__medidas : window.__atlas) && !$("[aria-busy=true]")) break; await sleep(100); }
    await sleep(350); // deja terminar los pintados y transiciones de la vista
  };
  const ir = async (h) => { location.hash = h; await listo(); };
  const clic = async (sel) => { $(sel).click(); await listo(); };
  const vista = () => window.__vista;
  const montadas = () => ({ atlas: !!$("#atlas"), medidas: !!$("#medidas") });

  // --- el marco: un solo header, un solo menú, un solo main ---
  ok("Un único marco: 1 cabecera, 1 menú, 1 <main>, 1 pie", $$("header.banda").length === 1 && $$("dialog#menu").length === 1 && $$("main").length === 1 && $$("footer.pie").length === 1);
  const enlaces = Object.fromEntries($$(".vistas a").map((a) => [a.textContent.replace("↗", "").trim(), a]));
  ok("Situación y Medidas apuntan a la app nueva (hash local), no a Vercel", enlaces["Situación"].getAttribute("href") === "#situacion" && enlaces["Medidas"].getAttribute("href") === "#medidas" && !/vercel\.app/.test(enlaces["Situación"].href + enlaces["Medidas"].href));
  ok("La marca de la cabecera vuelve a Situación local", $(".marca").getAttribute("href") === "#situacion");
  const antiguas = ["Municipios", "Acceso", "Normas", "Método"];
  ok("Municipios, Acceso, Normas y Método también son locales (hash en la misma app)", antiguas.every((n) => enlaces[n].getAttribute("href") === `#${n.toLowerCase().replace("é", "e")}` && enlaces[n].classList.contains("por-hacer") && !enlaces[n].hasAttribute("target")));
  ok("En el menú, las seis vistas son locales (ningún salto a otra web)", $$("#menu .menu-lista a").length === 6 && $$("#menu .menu-lista a").every((a) => a.getAttribute("href").startsWith("#")));

  // --- Situación → Medidas → Situación con clics reales ---
  await ir("#situacion/turisticas/48044");
  ok("Situación arranca: Getxo en Turísticas", vista() === "situacion" && $(".ficha-muni")?.textContent === "Getxo" && montadas().atlas && !montadas().medidas);
  const errores = []; const oe = console.error; console.error = (...a) => { errores.push(a.join(" ")); oe(...a); };
  await clic('.vistas a[data-vista="medidas"]');
  ok("Clic en «Medidas»: se abre el Explorador en la misma app (misma origen, sin recarga)", vista() === "medidas" && location.origin === origen && location.hash.startsWith("#medidas") && !!$(".burbuja") && $$("a.burbuja").length === 34, location.hash);
  ok("Solo la vista Medidas está montada (el Atlas se ha desmontado)", montadas().medidas && !montadas().atlas);
  ok("Navegación: «Medidas» marcada como actual y «Situación» no", $('.vistas a[data-vista="medidas"]').getAttribute("aria-current") === "page" && !$('.vistas a[data-vista="situacion"]').hasAttribute("aria-current") && $("#vista-activa").textContent === "Medidas");
  ok("Solo la hoja de Medidas está activa", !$("#css-medidas").disabled && $("#css-situacion").disabled);
  await clic('.vistas a[data-vista="situacion"]');
  ok("Clic en «Situación»: vuelve el Living Atlas, en la misma app", vista() === "situacion" && location.origin === origen && !!$("#mapa svg") && $$("#mapa .munis path").length === 113 && montadas().atlas && !montadas().medidas, location.hash);
  ok("Situación vuelve con su selección reproducible desde la URL", /^#situacion\//.test(location.hash));
  ok("Solo la hoja de Situación está activa", $("#css-medidas").disabled && !$("#css-situacion").disabled);
  ok("La marca de la cabecera vuelve a Situación desde Medidas", await (async () => { await clic('.vistas a[data-vista="medidas"]'); await clic(".marca"); return vista() === "situacion"; })());

  // --- deep links de Sprint 02 y de Sprint 03 ---
  await ir("#situacion/alquiler/48020");
  ok("Sprint 02 · #situacion/alquiler/48020", vista() === "situacion" && $(".ficha-muni")?.textContent === "Bilbao" && $(".ficha-valor")?.textContent === "55,8 %");
  await ir("#situacion/vacias/48001");
  ok("Sprint 02 · #situacion/vacias/48001 (cambia de problema sin remontar)", $(".ficha-muni")?.textContent === "Abadiño" && $("#problemas .problema[aria-pressed=true] .p1").textContent === "Vacías");
  await ir("#medidas");
  ok("Sprint 03 · #medidas", vista() === "medidas" && window.__medidas.S.mode === "explorar" && $(".cuenta").textContent === "34 de 34 medidas");
  await ir("#medidas?rep=matriz&w=3,2,0,0,1");
  ok("Sprint 03 · #medidas?rep=matriz&w=3,2,0,0,1 (matriz con sus pesos)", window.__medidas.S.rep === "matriz" && window.__medidas.S.w.evidencia === 3 && window.__medidas.S.w.viabilidad === 2 && window.__medidas.S.w.alcance === 1 && $$("#v-explorar tbody tr").length === 34);
  await ir("#medidas/M01-M06");
  ok("Sprint 03 · #medidas/M01-M06 (comparar, conserva la selección)", window.__medidas.S.mode === "comparar" && window.__medidas.S.sel.join() === "M01,M06" && $$("#v-comparar .cab [role=columnheader]").length === 3);
  await ir("#medidas/M06"); ok("Sprint 03 · #medidas/M06 (ficha)", window.__medidas.S.mode === "ficha");
  await ir("#medidas/alternativas"); ok("Sprint 03 · #medidas/alternativas", window.__medidas.S.mode === "alternativas" && $$("#v-alternativas details.idea").length === 4);
  await ir("#medidas?vista=entender"); ok("Sprint 03 · #medidas?vista=entender", window.__medidas.S.mode === "entender" && !!$("#v-entender .enlaces"));

  // --- el contexto de Medidas sobrevive a un viaje por Situación ---
  await ir("#medidas?linea=alquiler&sel=M06,M01&rep=matriz");
  const antes = JSON.stringify([window.__medidas.S.f, window.__medidas.S.sel, window.__medidas.S.rep]);
  await clic('.vistas a[data-vista="situacion"]');
  history.back(); await sleep(900);
  ok("Atrás desde Situación devuelve a Medidas con sus filtros, selección y representación (desde la URL)", vista() === "medidas" && JSON.stringify([window.__medidas.S.f, window.__medidas.S.sel, window.__medidas.S.rep]) === antes, location.hash);
  history.forward(); await sleep(900);
  ok("Adelante vuelve a Situación", vista() === "situacion");

  // --- direcciones desconocidas y estabilidad ---
  await ir("#loquesea"); ok("Una dirección desconocida abre Situación (no una vista vacía)", vista() === "situacion" && !!$("#mapa svg"));
  for (let i = 0; i < 6; i++) { await clic('.vistas a[data-vista="medidas"]', 500); await clic('.vistas a[data-vista="situacion"]', 500); }
  ok("Seis viajes de ida y vuelta: sigue habiendo UNA vista, un solo mapa y un solo marco", montadas().atlas && !montadas().medidas && $$("#mapa svg").length === 1 && $$("main").length === 1 && $$("#atlas").length === 1);
  ok("Sin errores en consola durante la navegación", errores.length === 0, errores.slice(0, 2).join(" | "));
  console.error = oe;
  // vistas aún no rediseñadas: se abren en el mismo marco, sin salir de la app ni cambiar de tipografía
  await ir("#situacion/alquiler/48020");
  await clic('.vistas a[data-vista="municipios"]');
  ok("Clic en «Municipios»: se queda en la misma app y pestaña (mismo origen, sin recarga, sin abrir otra web)", location.origin === origen && location.hash === "#municipios" && vista() === "municipios" && $$("main").length === 1 && $$("header.banda").length === 1, location.href);
  ok("Municipios muestra «Aún no rediseñada» con su título y deja el Atlas desmontado", $(".pendiente h1")?.textContent === "Municipios" && /Aún no rediseñada/.test($(".pendiente-rotulo").textContent) && !montadas().atlas && !montadas().medidas);
  const ver = $(".pendiente-acciones a.primary");
  ok("«Ver la versión actual» abre la web publicada en pestaña nueva (no en esta)", ver.target === "_blank" && /vizcaya-vivienda-analisis\.vercel\.app\/#municipios$/.test(ver.href) && ver.rel.includes("noopener"));
  ok("La pestaña activa del marco es Municipios (y solo ella)", $$('.vistas a[aria-current="page"]').length === 1 && $('.vistas a[data-vista="municipios"]').getAttribute("aria-current") === "page" && $("#vista-activa").textContent === "Municipios" && /^Municipios/.test(document.title));
  const fuentes = new Set([...$$(".pendiente h1, .pendiente p, .pendiente a")].map((e) => getComputedStyle(e).fontFamily.split(",")[0].replace(/"/g, "")));
  ok("Tipografía de la página pendiente: solo Montserrat (titular) y Geist", [...fuentes].every((f) => ["Montserrat", "Geist"].includes(f)), [...fuentes].join(","));
  await clic('.vistas a[data-vista="acceso"]');
  ok("De Municipios a Acceso: cambia la página y la marca de navegación, sin duplicar nada", $(".pendiente h1")?.textContent === "Acceso" && $$(".pendiente").length === 1 && $('.vistas a[data-vista="acceso"]').getAttribute("aria-current") === "page" && $$('.vistas a[aria-current="page"]').length === 1);
  await clic('.pendiente-acciones a:not(.primary)');
  ok("«Volver a Situación» regresa al Atlas nuevo (un solo mapa)", vista() === "situacion" && montadas().atlas && $$("#mapa svg").length === 1 && !$(".pendiente"));
  await clic('.vistas a[data-vista="medidas"]');
  await clic('.vistas a[data-vista="normas"]');
  await clic('.vistas a[data-vista="metodo"]');
  ok("Medidas → Normas → Método: siempre una sola vista y el mismo marco", vista() === "metodo" && !montadas().medidas && $$("main").length === 1);
  await clic('.vistas a[data-vista="situacion"]');
  ok("Y se vuelve a Situación sin diferencias (Atlas montado)", vista() === "situacion" && montadas().atlas && $$("#mapa svg").length === 1);
  // enlaces a la web publicada DENTRO de cada vista (no en el marco): solo «Ver su ficha» de Situación (en pestaña nueva)
  const publicados = () => $$("#vista a[href*='vizcaya-vivienda']").map((a) => a.getAttribute("href").split("vercel.app/")[1]);
  await ir("#situacion/alquiler/48020");
  const enSit = publicados();
  ok("«Ver su ficha» de Situación abre la web publicada en pestaña nueva", $$("#vista a[href*='vizcaya-vivienda']")[0]?.target === "_blank");
  await ir("#medidas");
  window.__medidas.openPanel("M10"); await sleep(200);
  const enMed = publicados();
  ok("Dentro de Situación solo hay un enlace a la web publicada: «Ver su ficha» (Municipios, aún no rediseñada)", enSit.length === 1 && enSit[0].startsWith("#municipios/"), enSit.join(","));
  ok("Dentro de Medidas no hay ningún enlace a la web publicada", enMed.length === 0, enMed.join(","));

  const fail = out.filter((t) => !t.pass);
  return { total: out.length, pass: out.length - fail.length, fail: fail.length, fallos: fail, todo: out.map((t) => `${t.pass ? "PASS" : "FAIL"} · ${t.name}${t.detail ? ` (${t.detail})` : ""}`) };
}
