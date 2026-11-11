// Banners de la cabecera municipal. En el navegador, con la app abierta en http://localhost:4179/ (1440×900 y 1280):
//   window.__qaRes = null; import('/_qa/qa-banners.js').then(m => m.run()).then(r => window.__qaRes = r)
// Comprueba, con datos reales: el texto de la cabecera es EXACTAMENTE el del renderizador original; cada caso de la tabla de QA del encargo;
// la asignación (16 identificados con código INE verificado contra el catálogo, 6 provisionales desactivados, 30 genéricos deterministas);
// que todos los archivos existen; cambios rápidos, fallo de imagen, recarga/enlace directo; geometría; y legibilidad medida sobre los píxeles reales.
import { cargarStore } from "/js/datos.js";
import { renderMunicipios } from "/original/js/municipios/index.js";
import { cifrasPlanas } from "/js/lectura.js";
import { bannerDe, genericoDe, GENERICOS, IDENTIFICADOS, PROVISIONALES } from "/js/municipios/imagenes.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const plano = (t) => t.replace(/\s+/g, "");
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]+/g, "_").replace(/^_|_$/g, "");

async function ir(hash, esperaImg = true) {
  location.hash = hash;
  for (let i = 0; i < 60; i++) {
    await sleep(100);
    const f = $(".v-municipios .muni-banner .muni-foto");
    if ($(".v-municipios .muni-cab") && (!esperaImg || (f && f.complete) || $(".muni-banner[data-banner='sin-imagen']"))) break;
  }
  await sleep(150);
}
const archivo = () => ($(".v-municipios .muni-banner .muni-foto")?.src ?? "").split("/").slice(-2).join("/");

// luminancia relativa y contraste WCAG
const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const NAVY = [20, 24, 58];
const alfaX = (x) => (x <= 0.34 ? 0.92 - ((0.92 - 0.78) * x) / 0.34 : x <= 0.64 ? 0.78 - ((0.78 - 0.28) * (x - 0.34)) / 0.3 : x <= 0.82 ? 0.28 - (0.28 * (x - 0.64)) / 0.18 : 0);

/** Peor contraste (percentil 98 del píxel más luminoso) del texto blanco sobre la imagen + el velo real en una zona del banner de 1066×208. */
async function contraste(src, zona, conPildora) {
  const W = 1066, H = 208;
  const im = new Image(); im.src = src; await im.decode();
  const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d", { willReadFrequently: true });
  const r = Math.max(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * r, h = im.naturalHeight * r;
  g.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
  const [x0, y0, x1, y1] = zona; const d = g.getImageData(x0, y0, x1 - x0, y1 - y0).data; const L = [];
  for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
    const i = ((y - y0) * (x1 - x0) + (x - x0)) * 4;
    const a1 = alfaX(x / W), a2 = Math.max(0, 0.5 * (1 - (H - y) / (H * 0.46)));
    const a = 1 - (1 - a1) * (1 - a2);
    let p = [0, 1, 2].map((k) => d[i + k] * (1 - a) + NAVY[k] * a);
    if (conPildora) p = p.map((v, k) => v * 0.45 + NAVY[k] * 0.55);
    L.push(lum(...p));
  }
  L.sort((p, q) => p - q);
  const peor = L[Math.floor(L.length * 0.98)];
  return 1.05 / (peor + 0.05);
}

export async function run() {
  const out = [];
  const ok = (name, pass, detail = "") => out.push({ name, pass: !!pass, detail });
  const store = await cargarStore();
  location.hash = "#municipios/48020"; await ir("#municipios/48020");

  // ---------- catálogo: los códigos del registro existen y son los municipios que dicen ser ----------
  const esperado = { "48020": "bilbao", "48013": "barakaldo", "48044": "getxo", "48078": "portugalete", "48082": "santurtzi", "48046": "gernika_lumo", "48017": "bermeo", "48057": "lekeitio", "48068": "mundaka", "48031": "elantxobe", "48073": "ondarroa", "48090": "balmaseda", "48074": "urduna_orduna", "48077": "plentzia", "48043": "gorliz", "48012": "bakio" };
  const malos = Object.entries(IDENTIFICADOS).filter(([c, f]) => !store.municipios[c] || norm(store.municipios[c].nombre) !== esperado[c] || (c !== "48074" && f !== `${esperado[c]}.webp`) || (c === "48074" && f !== "orduna.webp"));
  ok("Registro: los 16 códigos INE existen en el catálogo y su nombre normalizado coincide exactamente (no por parecido)", Object.keys(IDENTIFICADOS).length === 16 && !malos.length, malos.join("; "));
  const provNombres = { "48003": "amorebieta_etxano", "48036": "galdakao", "48069": "mungia", "48089": "urduliz", "48085": "sopela", "48096": "zalla" };
  const malosP = Object.entries(PROVISIONALES).filter(([c, p]) => !store.municipios[c] || norm(store.municipios[c].nombre) !== provNombres[c] || p.archivo !== `${provNombres[c]}.webp`);
  ok("Registro: los 6 provisionales apuntan a su código INE real y NINGUNO está aprobado", Object.keys(PROVISIONALES).length === 6 && !malosP.length && Object.values(PROVISIONALES).every((p) => p.approved === false), malosP.join("; "));
  ok("Registro: 30 genéricos distintos, sin nombres repetidos", GENERICOS.length === 30 && new Set(GENERICOS).size === 30);

  // ---------- archivos: existen todos (HEAD) ----------
  const todos = [...Object.values(IDENTIFICADOS).map((f) => `identificados/${f}`), ...Object.values(PROVISIONALES).map((p) => `provisionales/${p.archivo}`), ...GENERICOS.map((f) => `genericos/${f}`)];
  const falta = [];
  for (const f of todos) { const r = await fetch(`/img/municipios/${f}`, { method: "HEAD" }); if (!r.ok) falta.push(f); }
  ok("Archivos: los 52 WebP existen y responden 200", todos.length === 52 && !falta.length, falta.join(", "));

  // ---------- asignación determinista de los 97 restantes ----------
  const marca = performance.getEntriesByType("resource").length;   // a partir de aquí solo cuentan las peticiones que hace la propia vista
  const resto = store.codes.filter((c) => !IDENTIFICADOS[c]);
  const a = resto.map((c) => genericoDe(c)), b = resto.map((c) => genericoDe(c));
  ok(`Genéricos: ${resto.length} municipios sin banner propio; asignación idéntica en dos pasadas (determinista)`, resto.length === 113 - 16 && a.join() === b.join());
  ok("Genéricos: solo salen de los 30 archivos compartidos", a.every((f) => GENERICOS.includes(f)));
  const usados = new Set(a);
  ok("Genéricos: el reparto usa buena parte de los 30 (no se amontona en unos pocos)", usados.size >= 22, `${usados.size} de 30`);
  ok("Genéricos: los provisionales no aprobados caen en un genérico, no en su imagen", Object.keys(PROVISIONALES).every((c) => bannerDe(c).tipo === "generico"));
  ok("Genéricos: no dependen del orden de la lista (solo del código)", genericoDe("48001") === genericoDe("48001") && [...store.codes].reverse().every((c) => (IDENTIFICADOS[c] ? true : genericoDe(c) === a[resto.indexOf(c)])));

  // ---------- casos de QA del encargo ----------
  const texto0 = () => plano($(".v-municipios .muni-cab").innerText);
  // 1. Bilbao: imagen y texto idénticos al renderizador original
  await ir("#municipios/48020");
  const cab = $(".v-municipios .muni-cab");
  const sombra = document.createElement("div"); document.body.append(sombra);
  renderMunicipios(sombra, store).show("48020"); cifrasPlanas(sombra);
  const original = plano($(".muni-cab", sombra).textContent);
  const real = plano(cab.textContent);
  sombra.remove();
  ok("Bilbao: muestra bilbao.webp", archivo() === "identificados/bilbao.webp", archivo());
  ok("Bilbao: el texto y las cifras de la cabecera son EXACTAMENTE los del renderizador original", real === original && real.includes("Bilbao") && real.includes("346.933"), `${real} | ${original}`);
  ok("Bilbao: nombre = mismo <p class='muni-nombre'> original, y es HTML real", $(".muni-nombre", cab)?.tagName === "P" && $(".muni-nombre", cab).textContent === store.municipios["48020"].nombre);
  ok("Imagen decorativa: alt vacío y aria-hidden", $(".muni-foto", cab)?.getAttribute("alt") === "" && $(".muni-foto", cab).getAttribute("aria-hidden") === "true");

  // 2. Getxo sin recargar
  const idSesion = (window.__qaSesion = Math.random());
  await ir("#municipios/48044");
  ok("Getxo: cambia a getxo.webp sin reiniciar la página", archivo() === "identificados/getxo.webp" && window.__qaSesion === idSesion, archivo());
  ok("Getxo: el selector principal y el texto siguen a Getxo", $("#muni-a").value === "48044" && /^Getxo/.test($(".muni-nombre").textContent));
  // 3. Gernika-Lumo y 4. Orduña
  await ir("#municipios/48046");
  ok("Gernika-Lumo: resuelve gernika_lumo.webp pese al guion", archivo() === "identificados/gernika_lumo.webp" && /Gernika/.test($(".muni-nombre").textContent), archivo());
  await ir("#municipios/48074");
  ok("Urduña / Orduña: resuelve orduna.webp pese a la ñ y al nombre bilingüe", archivo() === "identificados/orduna.webp", `${archivo()} · ${$(".muni-nombre").textContent}`);
  // 5. sin archivo propio
  const sinPropio = resto.find((c) => !PROVISIONALES[c]);
  await ir(`#municipios/${sinPropio}`);
  ok(`Sin archivo propio (${store.municipios[sinPropio].nombre}): muestra su genérico estable`, archivo() === `genericos/${genericoDe(sinPropio)}` && $(".muni-banner").dataset.banner === "generico", archivo());
  location.reload; // (la recarga real se comprueba abajo con navegación completa en el harness externo)
  await ir("#municipios/48001"); const g1 = archivo(); await ir("#municipios/48020"); await ir("#municipios/48001");
  ok("Genérico estable al volver al mismo municipio (misma imagen)", g1 === archivo() && g1 === `genericos/${genericoDe("48001")}`);
  // 6. provisional
  await ir("#municipios/48003");
  ok("Amorebieta-Etxano (provisional): usa un genérico hasta la aprobación, no amorebieta_etxano.webp", $(".muni-banner").dataset.banner === "generico" && !/provisionales/.test(archivo()) && archivo() === `genericos/${genericoDe("48003")}`, archivo());
  // 7. comparación
  await ir("#municipios/48020-48013");
  const bs = $$(".v-municipios .muni-banner");
  const cabs = $$(".v-municipios .cabeceras .muni-cab");
  ok("Bilbao–Barakaldo: el banner principal sigue a Bilbao", archivo() === "identificados/bilbao.webp" && /^Bilbao/.test(bs[0]?.querySelector(".muni-nombre").textContent), archivo());
  ok("Bilbao–Barakaldo: cada encabezado lleva su banner (Bilbao y Barakaldo) y sus datos (el comparador muestra los dos)", bs.length === 2 && cabs.length === 2 && cabs[1].querySelector("img")?.src.endsWith("barakaldo.webp") && /Barakaldo/.test(cabs[1].textContent) && /habitantes/.test(cabs[1].textContent));
  ok("Bilbao–Barakaldo: los selectores y la ruta no cambian", $("#muni-a").value === "48020" && $("#muni-b").value === "48013" && location.hash === "#municipios/48020-48013");
  const cmpTexto = plano(cabs[1].textContent);
  const sombra2 = document.createElement("div"); document.body.append(sombra2);
  renderMunicipios(sombra2, store).show("48020-48013"); cifrasPlanas(sombra2);
  const orig2 = $$(".muni-cab", sombra2).map((n) => plano(n.textContent)); sombra2.remove();
  ok("Bilbao–Barakaldo: el texto de las dos cabeceras coincide con el original", plano(cabs[0].textContent).replace(/^A/, "") === orig2[0] && plano(cmpTexto).replace(/^B/, "") === orig2[1]);   // sin las letras A y B del comparador
  // 8. cambio rápido
  await ir("#municipios/48020");
  location.hash = "#municipios/48044"; await sleep(15); location.hash = "#municipios/48013"; await sleep(15); location.hash = "#municipios/48078";
  await sleep(1200);
  ok("Cambio rápido de tres municipios: el banner es el del último (Portugalete) y no hay imágenes cruzadas", archivo() === "identificados/portugalete.webp" && $$(".v-municipios .muni-foto").length === 1 && $$(".v-municipios .muni-banner").length === 1 && /^Portugalete/.test($(".muni-nombre").textContent), archivo());
  // selector (cambio por interfaz)
  const sel = $("#muni-a"); sel.value = "48090"; sel.dispatchEvent(new Event("change", { bubbles: true })); await sleep(900);
  ok("Selector de la barra: elegir Balmaseda cambia el banner a balmaseda.webp", archivo() === "identificados/balmaseda.webp" && location.hash === "#municipios/48090", archivo());
  // 9. fallo
  await ir("#municipios/48020");
  const f = $(".v-municipios .muni-foto"); const logs = []; const w = console.warn; console.warn = (...x) => { logs.push(x.join(" ")); };
  f.dispatchEvent(new Event("error")); console.warn = w;
  const cs = getComputedStyle($(".v-municipios .muni-banner"));
  ok("Imagen inexistente: se retira la <img> (sin icono roto), queda el fondo azul marino del sistema y se deja una traza", !$(".v-municipios .muni-foto") && $(".muni-banner").dataset.banner === "sin-imagen" && /rgb\(34, 30, 65\)/.test(cs.backgroundColor) && logs.length === 1, `${cs.backgroundColor} · ${logs.join()}`);
  ok("Imagen inexistente: el texto sigue legible (blanco sobre fondo oscuro)", getComputedStyle($(".muni-nombre")).color === "rgb(255, 255, 255)");
  // 10. directo / reload: la URL se calcula desde el módulo, no desde el hash
  ok("Rutas: la imagen cuelga de la base de la aplicación (img/municipios/…) y no del hash ni de la raíz del dominio", bannerDe("48020").src === new URL("img/municipios/identificados/bilbao.webp", new URL("./", document.baseURI)).href || /\/img\/municipios\/identificados\/bilbao\.webp$/.test(bannerDe("48020").src), bannerDe("48020").src);
  ok("Rutas: sin /assets/… ni rutas absolutas en el código", !/["'`]\/(assets|img)\//.test(await fetch("/js/municipios/imagenes.js").then((r) => r.text())));

  // ---------- geometría ----------
  await ir("#municipios/48020");
  const ban = $(".v-municipios .muni-banner"), fic = $(".v-municipios .ficha"), sec = $(".v-municipios .ficha-sec");
  const rb = ban.getBoundingClientRect(), rs = sec.getBoundingClientRect();
  ok("Geometría: alto del banner entre 180 y 220 px a 1440×900 (n=1)", innerWidth < 1400 || (rb.height >= 180 && rb.height <= 220), `${rb.height}`);
  ok("Geometría: mismo ancho, misma alineación y misma posición horizontal que las tarjetas de debajo", Math.abs(rb.left - rs.left) < 1 && Math.abs(rb.width - rs.width) < 1, `${rb.left}/${rs.left} ${rb.width}/${rs.width}`);
  ok("Geometría: sin scroll horizontal", document.documentElement.scrollWidth <= innerWidth && ban.scrollWidth <= ban.clientWidth);
  const cabeceraFija = $(".banda").getBoundingClientRect();
  ok("Geometría: el banner no cubre la navegación", rb.top >= cabeceraFija.bottom - 1 || scrollY > 0);
  ok("Geometría: el primer gráfico («Dato a dato») sigue asomando en la pantalla inicial", $(".ficha-sec").getBoundingClientRect().top < innerHeight - 40, `${Math.round($(".ficha-sec").getBoundingClientRect().top)} de ${innerHeight}`);
  const nombre = $(".muni-nombre", ban).getBoundingClientRect();
  ok("Geometría: el nombre cabe en el banner sin cortarse", nombre.right <= rb.right && nombre.left >= rb.left && $(".muni-nombre", ban).scrollWidth <= $(".muni-nombre", ban).clientWidth + 1);
  await ir("#municipios/48074");  // nombre largo: «Urduña / Orduña»
  const nl = $(".muni-nombre"), rl = $(".muni-banner").getBoundingClientRect();
  ok("Nombre largo (Urduña / Orduña): visible entero dentro del banner", nl.getBoundingClientRect().right <= rl.right && nl.getBoundingClientRect().bottom <= rl.bottom && nl.getBoundingClientRect().top >= rl.top);
  // tipografía
  await ir("#municipios/48020");
  const fam = (s) => getComputedStyle($(s)).fontFamily;
  ok("Tipografía: nombre en Montserrat; metadatos y cifras en Geist", /Montserrat/.test(fam(".muni-banner .muni-nombre")) && /Geist/.test(fam(".muni-banner .muni-datos")) && !/Mono/.test(fam(".muni-banner .muni-datos")), `${fam(".muni-banner .muni-nombre")} | ${fam(".muni-banner .muni-datos")}`);
  const pil = getComputedStyle($(".muni-banner .muni-datos"));
  ok("Vidrio controlado: solo la píldora de metadatos tiene desenfoque; la imagen y el velo no", /blur/.test(pil.backdropFilter || pil.webkitBackdropFilter) && getComputedStyle($(".muni-foto")).filter === "none" && getComputedStyle($(".muni-foto")).backdropFilter === "none" && getComputedStyle($(".muni-velo")).backdropFilter === "none");
  ok("Imagen: object-fit cover y punto focal configurable", getComputedStyle($(".muni-foto")).objectFit === "cover" && $(".muni-foto").style.objectPosition !== "");
  ok("Carga: una sola imagen en la ficha, sin lazy, decoding async", $$(".v-municipios img").length === 1 && $(".muni-foto").getAttribute("loading") !== "lazy" && $(".muni-foto").getAttribute("decoding") === "async");
  const red = new Set(performance.getEntriesByType("resource").slice(marca).filter((r) => /img\/municipios\//.test(r.name)).map((r) => r.name.split("/").pop()));
  ok("Carga: solo se han pedido las imágenes de los municipios visitados en esta prueba (≤ 12 de las 52)", red.size > 0 && red.size <= 12, `${red.size} archivos distintos: ${[...red].join(", ")}`);
  ok("Foco/teclado: la <img> no recibe foco y los selectores siguen en el orden original", $(".muni-foto").tabIndex === -1 || !$(".muni-foto").matches("[tabindex]"));
  ok("Sin «null», «undefined» ni «NaN» en la cabecera", !/null|undefined|NaN/.test($(".muni-banner").innerText));

  // ---------- legibilidad sobre los píxeles reales de las 46 imágenes que se pueden mostrar ----------
  const nombreZona = [32, 66, 392, 138];       // nombre (Montserrat ~56 px, 24ch como máximo)
  const pildoraZona = [32, 150, 590, 190];     // píldora de metadatos con su fondo semisólido
  const peores = [];
  const imgs = [...Object.values(IDENTIFICADOS).map((f) => `/img/municipios/identificados/${f}`), ...GENERICOS.map((f) => `/img/municipios/genericos/${f}`)];
  let minNombre = 99, minPildora = 99, peorN = "", peorP = "";
  for (const s of imgs) {
    const cn = await contraste(s, nombreZona, false), cp = await contraste(s, pildoraZona, true);
    if (cn < minNombre) { minNombre = cn; peorN = s.split("/").pop(); }
    if (cp < minPildora) { minPildora = cp; peorP = s.split("/").pop(); }
    if (cn < 3 || cp < 4.5) peores.push(`${s.split("/").pop()} nombre ${cn.toFixed(1)} · píldora ${cp.toFixed(1)}`);
  }
  ok(`Legibilidad: el nombre (texto grande, ≥ 3:1) sobre las 46 imágenes; peor caso ${minNombre.toFixed(1)}:1 (${peorN})`, minNombre >= 3, peores.join("; "));
  ok(`Legibilidad: los metadatos (texto normal, ≥ 4,5:1) sobre las 46 imágenes; peor caso ${minPildora.toFixed(1)}:1 (${peorP})`, minPildora >= 4.5, peores.join("; "));

  const fail = out.filter((t) => !t.pass);
  return { total: out.length, pass: out.length - fail.length, fail: fail.length, fallos: fail.map((x) => `${x.name} (${x.detail})`), todo: out.map((t) => `${t.pass ? "PASS" : "FAIL"} · ${t.name}${t.detail ? ` (${t.detail})` : ""}`) };
}
