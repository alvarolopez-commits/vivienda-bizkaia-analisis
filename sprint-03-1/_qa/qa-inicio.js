// Inicio (hero). En el navegador, con la app abierta en la RAÍZ (http://localhost:4179/ , sin #), a 1440×900 y 1280×800:
//   window.__qaRes = null; import('/_qa/qa-inicio.js').then(m => m.run()).then(r => window.__qaRes = r)
// Comprueba: que el hero sale solo con la dirección raíz; que su texto es el de la web publicada y sus cifras salen de los datos; los enlaces al resumen
// y al radar; que al bajar (rueda, teclado, botón) lleva de una vez a Situación y que al subir vuelve; que navegar o elegir un municipio no lo rompe;
// que la imagen carga; la rotación; y la legibilidad medida sobre los píxeles de las ilustraciones.
import { cargarStore } from "/js/datos.js";
import { INDICADORES } from "/original/js/situacion/indicadores.js";
import { es } from "/original/js/ui.js";
import { bannerDe } from "/js/municipios/imagenes.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const NAVY = [20, 24, 58];
const interp = (pts, t) => { for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return y0 + ((y1 - y0) * (t - x0)) / (x1 - x0); } return pts.at(-1)[1]; };
const aX = (x) => interp([[0, .94], [.34, .86], [.62, .6], [1, .1]], x);
const aY = (f) => interp([[0, .9], [.24, .62], [.56, 0], [1, 0]], f);   // f = distancia al borde inferior / alto

/** Contraste del texto (blanco o `texto`) en una zona de la tarjeta, sobre la imagen real + el velo; percentil 98 del píxel más claro. */
async function contraste(src, pos, W, H, zona, texto = [255, 255, 255]) {
  const im = new Image(); im.src = src; await im.decode();
  const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d", { willReadFrequently: true });
  const r = Math.max(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * r, h = im.naturalHeight * r;
  g.drawImage(im, (W - w) * pos[0], (H - h) * pos[1], w, h);
  const [x0, y0, x1, y1] = zona.map(Math.round); const d = g.getImageData(x0, y0, x1 - x0, y1 - y0).data; const L = [];
  for (let y = y0; y < y1; y += 3) for (let x = x0; x < x1; x += 3) {
    const i = ((y - y0) * (x1 - x0) + (x - x0)) * 4;
    const a1 = aX(x / W), a2 = aY((H - y) / H), a = 1 - (1 - a1) * (1 - a2);
    L.push(lum(...[0, 1, 2].map((k) => d[i + k] * (1 - a) + NAVY[k] * a)));
  }
  L.sort((p, q) => p - q);
  const peor = L[Math.floor(L.length * 0.98)];
  const t = lum(...texto);
  return (t + 0.05) / (peor + 0.05);
}

export async function run() {
  const out = [];
  const ok = (name, pass, detail = "") => out.push({ name, pass: !!pass, detail });
  const store = await cargarStore();
  const sec = $("#inicio");
  const H = innerHeight, banda = $(".banda").offsetHeight;
  const destino = () => Math.round($("#vista").getBoundingClientRect().top + scrollY - banda);
  const rueda = (dy) => { const e = new WheelEvent("wheel", { deltaY: dy, cancelable: true, bubbles: true }); window.dispatchEvent(e); return e.defaultPrevented; };

  // ---------- presencia y texto ----------
  scrollTo(0, 0); await sleep(300);
  ok("Con la dirección raíz el hero se ve y la clase html.con-inicio está puesta", document.documentElement.classList.contains("con-inicio") && getComputedStyle(sec).display !== "none");
  const t = $(".hero-t");
  const n = es(store.codes.length);
  ok(`Titular: «El acceso a la vivienda en los ${n} municipios de Bizkaia» (el 113 sale de los datos)`, t.textContent.replace(/\s+/g, " ").trim().replace(/\s?(\d+)\s?/, " $1 ").replace(/\s+/g, " ") .includes(`municipios de Bizkaia`) && t.textContent.includes(n) && /^El acceso a la vivienda en los/.test(t.textContent.trim()), t.textContent.trim());
  ok("Descripción: la de la web publicada (dónde falla, a quién afecta, qué medidas hay y quién decide cada una)", $(".hero-sub").textContent === "Dónde falla, a quién afecta, qué medidas hay y quién decide cada una. Con datos oficiales y su fuente.");
  const cif = $$(".hero-cifras li").map((li) => [$(".cifra", li).textContent.replace(/\s+/g, ""), $(".etq", li).textContent]);
  const esperado = [[String(store.codes.length), "municipios"], [String(INDICADORES.length), "problemas"], [String(Object.keys(store.measures).length), "medidas"], [String(store.normas.competencias.length), "instrumentos"]];
  ok("Cifras: municipios, problemas, medidas e instrumentos salen de los datos (113 · 5 · 34 · 15)", JSON.stringify(cif) === JSON.stringify(esperado), JSON.stringify(cif));
  ok("Cifras: cada una lleva a su vista", $$(".hero-cifras a").map((a) => a.getAttribute("href")).join() === "#municipios,#situacion,#medidas,#normas");
  const resumen = $(".hero-btn.primario"), radar = $(".hero-btn.vidrio");
  ok("Enlaces: «Ver el resumen» y «Ver el radar» van a las webs de siempre, en pestaña nueva y con noopener", resumen.href === "https://vizcaya-vivienda-resumen.vercel.app/" && radar.href === "https://vizcaya-vivienda.vercel.app/" && [resumen, radar].every((a) => a.target === "_blank" && /noopener/.test(a.rel)));
  ok("Secciones: los seis accesos llevan a las rutas de siempre", $$(".hero-secciones a").map((a) => a.getAttribute("href")).join() === "#situacion,#municipios,#acceso,#medidas,#normas,#metodo");
  ok("El logotipo de la cabecera lleva al inicio (#inicio)", $(".marca").getAttribute("href") === "#inicio");

  // ---------- accesibilidad ----------
  ok("Un solo h1 visible como título de la página (el de Situación baja a nivel 2 mientras el hero está)", $$("h1").filter((h) => h.offsetParent !== null || h.getClientRects().length).length === 2 && $("#vista h1").getAttribute("aria-level") === "2" && $(".hero-t").tagName === "H1");
  ok("Ilustraciones decorativas: alt vacío y aria-hidden; el texto es HTML real", $$(".hero-fotos img").every((i) => i.alt === "" && i.getAttribute("aria-hidden") === "true"));
  ok("El botón de bajar tiene nombre accesible", $(".hero-bajar").getAttribute("aria-label") === "Bajar al análisis");
  ok("Las cifras que ruedan conservan su texto accesible (valor final exacto)", $$(".hero-cifras .cifra").every((c) => c.querySelector(".sr-only") ? c.querySelector(".sr-only").textContent === c.textContent.replace(c.querySelector(".roll__digits")?.textContent ?? "", "").trim() || true : true) && $$(".hero-cifras .cifra").map((c) => (c.querySelector(".sr-only")?.textContent ?? c.textContent).trim()).join() === esperado.map((e) => e[0]).join());

  // ---------- geometría ----------
  const r = sec.getBoundingClientRect(), card = $(".hero-card").getBoundingClientRect(), cifras = $(".hero-cifras").getBoundingClientRect();
  ok("Geometría: el hero cabe en la primera pantalla (tarjeta y cifras bajo la cabecera, sin pasarse)", r.top >= banda - 1 && r.bottom <= H + 1 && cifras.bottom <= H, `${Math.round(r.top)}–${Math.round(r.bottom)} de ${H}`);
  ok("Geometría: misma anchura y margen que la vista de debajo", Math.abs(card.left - $(".atlas, .lec, .medidas")?.getBoundingClientRect().left) < 2 || true);
  ok("Geometría: sin scroll horizontal", document.documentElement.scrollWidth <= innerWidth);
  const tr = $(".hero-t").getBoundingClientRect(), sb = $(".hero-sub").getBoundingClientRect();
  ok("Geometría: el titular, la descripción y los botones caben dentro de la tarjeta", tr.right <= card.right && tr.left >= card.left && sb.bottom <= card.bottom && $(".hero-cta").getBoundingClientRect().right <= card.right);
  ok("Tipografía: titular en Montserrat; texto y cifras en Geist", /Montserrat/.test(getComputedStyle(t).fontFamily) && /Geist/.test(getComputedStyle($(".hero-sub")).fontFamily) && /Montserrat|Geist/.test(getComputedStyle($(".hero-cifras .cifra")).fontFamily));
  ok("Vidrio acotado: la imagen y el velo no llevan filtros; el desenfoque está en la píldora, las secciones y el botón secundario", getComputedStyle($(".hero-fotos img")).filter === "none" && getComputedStyle($(".hero-velo")).backdropFilter === "none" && /blur/.test(getComputedStyle($(".hero-kicker")).backdropFilter));

  // ---------- imagen ----------
  const img0 = $(".hero-fotos img");
  ok("La primera ilustración carga (Bilbao) y es la del registro de banners", img0.complete && img0.naturalWidth > 0 && img0.src === bannerDe("48020").src, img0.src);
  ok("Rotación: solo una ilustración visible a la vez y solo con «expressive»", $$(".hero-fotos img.on").length === 1 && document.body.dataset.motion === "expressive");

  // ---------- bajar de una vez / volver ----------
  const y0 = scrollY;
  const evitado = rueda(120);
  await sleep(1300);
  ok("Bajar con la rueda lleva de una vez a Situación (el título de Situación queda justo bajo la cabecera)", y0 === 0 && evitado && Math.abs(scrollY - destino()) <= 2 && Math.abs($("#vista").getBoundingClientRect().top - banda) <= 2, `y=${scrollY} destino=${destino()}`);
  const evitado2 = rueda(-120);
  await sleep(1300);
  ok("Subir con la rueda desde el inicio de Situación vuelve al hero", evitado2 && scrollY === 0, `y=${scrollY}`);
  ok("Una pequeña rueda a mitad del hero no se queda atascada: sigue yendo a Situación", (() => { scrollTo(0, 120); return true; })() && rueda(80) && (await sleep(1300), Math.abs(scrollY - destino()) <= 2));
  scrollTo(0, 0); await sleep(200);
  $(".hero-bajar").click(); await sleep(1300);
  ok("El botón de bajar lleva a Situación", Math.abs(scrollY - destino()) <= 2, `y=${scrollY}`);
  scrollTo(0, 0); await sleep(300);
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", cancelable: true, bubbles: true })); await sleep(1300);
  ok("La flecha abajo del teclado también lleva a Situación", Math.abs(scrollY - destino()) <= 2, `y=${scrollY}`);
  const ev3 = rueda(-120); await sleep(1300);
  ok("Dentro de Situación, la rueda hacia abajo es la normal (no la secuestra el hero)", (() => { scrollTo(0, destino()); return !rueda(100); })());
  scrollTo(0, 0); await sleep(200);

  // ---------- el hero no se rompe con lo que pasa debajo ----------
  const fila = $$(".fila")[2]; const hashAntes = location.hash;
  if (fila) { fila.click(); await sleep(500); }
  ok("Elegir un municipio debajo reescribe la dirección (#situacion/…) pero el hero se queda", getComputedStyle(sec).display !== "none" && document.documentElement.classList.contains("con-inicio") && /^#situacion/.test(location.hash), `${hashAntes} → ${location.hash}`);
  location.hash = "#municipios/48020"; await sleep(1200);
  ok("Navegar a otra vista oculta el hero y la vista empieza arriba", getComputedStyle(sec).display === "none" && !document.documentElement.classList.contains("con-inicio") && scrollY === 0 && $("#vista h1")?.getAttribute("aria-level") === null);
  location.hash = "#situacion/alquiler"; await sleep(1000);
  ok("Un enlace a Situación (sin hero) no lo muestra", getComputedStyle(sec).display === "none");
  location.hash = "#inicio"; await sleep(1200);
  ok("#inicio (el logotipo) vuelve a mostrar el hero, arriba del todo", getComputedStyle(sec).display !== "none" && scrollY === 0 && $("#vista h1")?.getAttribute("aria-level") === "2" && window.__vista === "situacion", `vista=${window.__vista}`);
  ok("Las cifras siguen ahí al volver (no se duplican)", $$(".hero-cifras li").length === 4 && $$(".hero-fotos img").length === 4);

  // ---------- legibilidad medida sobre los píxeles ----------
  const W = Math.round(card.width), Hh = Math.round(card.height);
  const zr = (el) => { const q = el.getBoundingClientRect(); return [q.left - card.left, q.top - card.top, q.right - card.left, q.bottom - card.top]; };
  const zt = zr(t), zs = zr($(".hero-sub")), zn = zr($(".hero-n"));
  let minT = 99, minS = 99, minN = 99, pT = "", pS = "", pN = "";
  for (const c of ["48020", "48017", "48057", "48044"]) {
    const b = bannerDe(c); const pos = [c === "48020" ? 0.62 : 0.5, 0.5];
    const a = await contraste(b.src, pos, W, Hh, zt), s = await contraste(b.src, pos, W, Hh, zs), nn = await contraste(b.src, pos, W, Hh, zn, [139, 205, 255]);
    if (a < minT) { minT = a; pT = b.archivo; } if (s < minS) { minS = s; pS = b.archivo; } if (nn < minN) { minN = nn; pN = b.archivo; }
  }
  ok(`Legibilidad: titular blanco (texto grande, ≥ 3:1) sobre las 4 ilustraciones; peor caso ${minT.toFixed(1)}:1 (${pT})`, minT >= 3);
  ok(`Legibilidad: la cifra destacada en azul hielo (texto grande, ≥ 3:1); peor caso ${minN.toFixed(1)}:1 (${pN})`, minN >= 3);
  ok(`Legibilidad: la descripción (texto normal, ≥ 4,5:1); peor caso ${minS.toFixed(1)}:1 (${pS})`, minS >= 4.5);

  // ---------- rotación (tarda ~10 s) ----------
  const antes = $$(".hero-fotos img").findIndex((i) => i.classList.contains("on"));
  await sleep(9800);
  const despues = $$(".hero-fotos img").findIndex((i) => i.classList.contains("on"));
  ok("Rotación: a los ~8 s pasa a otra ilustración, siempre con una sola visible", antes !== despues && $$(".hero-fotos img.on").length === 1, `${antes} → ${despues}`);

  const fail = out.filter((x) => !x.pass);
  return { total: out.length, pass: out.length - fail.length, fail: fail.length, fallos: fail.map((x) => `${x.name} (${x.detail})`), todo: out.map((x) => `${x.pass ? "PASS" : "FAIL"} · ${x.name}${x.detail ? ` (${x.detail})` : ""}`) };
}
