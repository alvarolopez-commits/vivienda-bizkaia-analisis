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
    const quiere = (location.hash.match(/^#(medidas|municipios|acceso|normas|metodo)([/?]|$)/) || [])[1] || "situacion";
    const montada = () => (quiere === "medidas" ? window.__medidas : quiere === "situacion" ? window.__atlas : $(`.v-${quiere} .lec-contenido > *`));
    for (let i = 0; i < 80; i++) { if (window.__vista === quiere && montada() && !$("[aria-busy=true]")) break; await sleep(100); }
    await sleep(400); // deja terminar los pintados y las transiciones de la vista
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
  const otras = ["Municipios", "Acceso", "Normas", "Método"];
  ok("Municipios, Acceso, Normas y Método también son locales (hash en la misma app)", otras.every((n) => enlaces[n].getAttribute("href") === `#${n.toLowerCase().replace("é", "e")}` && !enlaces[n].hasAttribute("target")));
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
  // las otras cuatro vistas: se abren en el mismo marco, con su composición propia y sin salir de la app
  await ir("#situacion/alquiler/48020");
  await clic('.vistas a[data-vista="municipios"]');
  ok("Clic en «Municipios»: misma app y pestaña (mismo origen, sin recarga), solo esa vista montada", location.origin === origen && location.hash === "#municipios" && vista() === "municipios" && $$("main").length === 1 && $$("header.banda").length === 1 && !montadas().atlas && !montadas().medidas && !!$(".v-municipios"), location.href);
  ok("Municipios muestra su ficha real: 113 municipios en el selector, el perfil de Bilbao y 13 indicadores", $$(".v-municipios #muni-a option").length === 113 && $(".v-municipios .muni-nombre")?.textContent === "Bilbao" && $$(".v-municipios .fila-ind").length === 13);
  ok("La pestaña activa del marco es Municipios (y solo ella)", $$('.vistas a[aria-current="page"]').length === 1 && $('.vistas a[data-vista="municipios"]').getAttribute("aria-current") === "page" && $("#vista-activa").textContent === "Municipios" && /^Municipios/.test(document.title));
  const fuentes = (sel) => new Set([...$$(sel)].map((e) => getComputedStyle(e).fontFamily.split(",")[0].replace(/"/g, "")));
  ok("Tipografía de Municipios: solo Montserrat (titulares) y Geist; ni serif ni mono", [...fuentes(".v-municipios *")].every((f) => ["Montserrat", "Geist"].includes(f)), [...fuentes(".v-municipios *")].join(","));
  await clic('.vistas a[data-vista="acceso"]');
  ok("De Municipios a Acceso: cambia la vista y la marca de navegación, sin duplicar nada", vista() === "acceso" && !!$(".v-acceso") && !$(".v-municipios") && $$(".v-acceso section.sec").length === 4 && $('.vistas a[data-vista="acceso"]').getAttribute("aria-current") === "page" && $$('.vistas a[aria-current="page"]').length === 1);
  ok("Tipografía de Acceso: solo Montserrat y Geist", [...fuentes(".v-acceso *")].every((f) => ["Montserrat", "Geist"].includes(f)), [...fuentes(".v-acceso *")].join(","));
  await clic('.vistas a[data-vista="normas"]');
  ok("Normas: 15 instrumentos y 4 niveles, con la fecha del estado normativo", vista() === "normas" && $$(".v-normas .comp-fila:not(.cab)").length === 15 && $$(".v-normas .comp-fila.cab [data-nivel]").length === 4 && /2 de noviembre de 2026/.test($(".v-normas .lec-estado")?.textContent ?? ""));
  ok("Tipografía de Normas: solo Montserrat y Geist", [...fuentes(".v-normas *")].every((f) => ["Montserrat", "Geist"].includes(f)), [...fuentes(".v-normas *")].join(","));
  await clic('.vistas a[data-vista="metodo"]');
  ok("Método: 124 términos de glosario y el índice con todos los bloques", vista() === "metodo" && $$(".v-metodo dl.glossary dt").length === 124 && $$(".v-metodo .method-block").length === $$(".v-metodo .lec-indice .lec-ir").length && $$(".v-metodo .method-block").length >= 10, `${$$(".v-metodo .method-block").length} bloques`);
  ok("Tipografía de Método: solo Montserrat y Geist", [...fuentes(".v-metodo *")].every((f) => ["Montserrat", "Geist"].includes(f)), [...fuentes(".v-metodo *")].join(","));
  await clic('.vistas a[data-vista="medidas"]');
  await clic('.vistas a[data-vista="municipios"]');
  await clic('.vistas a[data-vista="situacion"]');
  ok("Medidas → Municipios → Situación: siempre una sola vista y el mismo marco, sin restos de las otras", vista() === "situacion" && montadas().atlas && $$("main").length === 1 && !$(".lec") && $$("#mapa svg").length === 1);
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
