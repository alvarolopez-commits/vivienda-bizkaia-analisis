// Inicio (hero + puerta a los tres productos). En el navegador, con la app abierta en la RAÍZ (http://localhost:4179/, sin #), a 1440×900 y 1280×800:
//   window.__qaRes = null; import('/_qa/qa-inicio.js').then(m => m.run()).then(r => window.__qaRes = r)
// Comprueba: el hero sale solo con la dirección raíz; su texto es el de las webs publicadas y el nº de municipios sale de los datos; los tres enlaces
// reales; que NO hay desplazamiento secuestrado (la rueda y el teclado son los del navegador); que los botones de «análisis» llevan a Situación;
// que navegar o elegir un municipio no lo rompe; que la imagen carga; accesibilidad, geometría y la legibilidad
// medida sobre los píxeles del fondo.
import { cargarStore } from "/js/datos.js";
import { es } from "/original/js/ui.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

/** Contraste del texto blanco (o `texto`) sobre el PÍXEL REAL renderizado: se pinta el fondo igual que el CSS (imagen cover × multiply + velos) en un canvas. */
async function contraste(card, zona, texto = [255, 255, 255]) {
  const W = Math.round(card.width), H = Math.round(card.height);
  const img = $(".hero-fondo img"); await img.decode?.().catch(() => {});
  const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d", { willReadFrequently: true });
  const r = Math.max(W / img.naturalWidth, H / img.naturalHeight), w = img.naturalWidth * r, h = img.naturalHeight * r;
  const pos = getComputedStyle(img).objectPosition.split(" ").map((p) => parseFloat(p) / 100);
  g.filter = getComputedStyle(img).filter === "none" ? "none" : getComputedStyle(img).filter;
  g.globalAlpha = parseFloat(getComputedStyle(img).opacity);
  g.fillStyle = "#221e41"; g.fillRect(0, 0, W, H);
  g.drawImage(img, (W - w) * pos[0], (H - h) * pos[1], w, h);
  g.filter = "none"; g.globalAlpha = 1;
  const m = getComputedStyle($(".hero-card"), "::before").backgroundColor;
  g.globalCompositeOperation = "multiply"; g.fillStyle = m; g.fillRect(0, 0, W, H); g.globalCompositeOperation = "source-over";
  // velos de ::after (se leen del CSS real: dos gradientes lineales)
  const after = getComputedStyle($(".hero-card"), "::after").backgroundImage;
  const partes = after.match(/linear-gradient\([^)]*\)(?:\s*\))?/g) ?? [];
  for (const p of after.split(/,\s*(?=linear-gradient)/)) {
    const ang = parseFloat(p.match(/linear-gradient\((-?[\d.]+)deg/)?.[1] ?? 180);
    const stops = [...p.matchAll(/rgba\((\d+), (\d+), (\d+), ([\d.]+)\)\s*([\d.]+)%/g)].map((s) => ({ c: [+s[1], +s[2], +s[3]], a: +s[4], t: +s[5] / 100 }));
    if (!stops.length) continue;
    const rad = (ang * Math.PI) / 180, dx = Math.sin(rad), dy = -Math.cos(rad), L = Math.abs(W * dx) + Math.abs(H * dy);
    const gr = g.createLinearGradient(W / 2 - (dx * L) / 2, H / 2 - (dy * L) / 2, W / 2 + (dx * L) / 2, H / 2 + (dy * L) / 2);
    stops.forEach((s) => gr.addColorStop(Math.min(1, Math.max(0, s.t)), `rgba(${s.c.join(",")},${s.a})`));
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }
  const [x0, y0, x1, y1] = zona.map(Math.round); const d = g.getImageData(x0, y0, x1 - x0, y1 - y0).data; const L = [];
  for (let i = 0; i < d.length; i += 16) L.push(lum(d[i], d[i + 1], d[i + 2]));
  L.sort((p, q) => p - q);
  return (lum(...texto) + 0.05) / (L[Math.floor(L.length * 0.98)] + 0.05);
}

export async function run() {
  const out = [];
  const ok = (name, pass, detail = "") => out.push({ name, pass: !!pass, detail });
  const store = await cargarStore();
  const sec = $("#inicio");
  const H = innerHeight, banda = $(".banda").offsetHeight;
  const destino = () => Math.round($("#umbral").getBoundingClientRect().top + scrollY - banda);   // el umbral del análisis queda justo bajo la cabecera
  const rueda = (dy) => { const e = new WheelEvent("wheel", { deltaY: dy, cancelable: true, bubbles: true }); window.dispatchEvent(e); return e.defaultPrevented; };

  // ---------- presencia y texto ----------
  scrollTo(0, 0); await sleep(300);
  ok("Con la dirección raíz el hero se ve y html.con-inicio está puesto", document.documentElement.classList.contains("con-inicio") && getComputedStyle(sec).display !== "none");
  const t = $(".hero-t"), n = es(store.codes.length);
  ok(`Titular: «El acceso a la vivienda en los ${n} municipios de Bizkaia» (el número sale de los datos)`, /^El acceso a la vivienda en los/.test(t.textContent.trim()) && t.textContent.includes(n) && /municipios de Bizkaia$/.test(t.textContent.trim()), t.textContent.trim());
  ok("Descripción del hero: la de la web publicada", $(".hero-sub").textContent === "Dónde falla, a quién afecta, qué medidas hay y quién decide cada una. Con datos oficiales y su fuente.");
  const tarj = $$(".puerta");
  ok("Tres puertas, en este orden: Análisis y medidas · Resumen · Radar", tarj.map((p) => $(".puerta-t", p).childNodes[0].textContent.trim()).join("|") === "Análisis y medidas|Resumen|Radar");
  const desc = tarj.map((p) => $(".puerta-d", p).textContent);
  ok("Descripciones: las de las metadescripciones de las webs publicadas (Análisis con el nº de municipios de los datos)", desc[0] === `El acceso a la vivienda en los ${n} municipios de Bizkaia: dónde falla, a quién afecta, qué medidas hay y quién decide cada una. Con datos oficiales y su fuente.` && desc[1] === "Resumen del acceso a la vivienda en Bizkaia: qué pasa con el alquiler y la compra, en qué municipios, cuánta vivienda hace falta y qué se puede hacer." && desc[2] === "Radar de vivienda: cómo está cada indicador, si las medidas en marcha funcionan y qué puede pasar hasta 2040. Datos oficiales con su fuente y su fecha.");
  const enl = tarj.map((p) => $(".puerta-a", p));
  ok("Enlaces: Resumen y Radar a sus URL exactas, en pestaña nueva y con noopener; Análisis a #situacion", enl[1].href === "https://vizcaya-vivienda-resumen.vercel.app/" && enl[2].href === "https://vizcaya-vivienda.vercel.app/" && [enl[1], enl[2]].every((a) => a.target === "_blank" && /noopener/.test(a.rel)) && enl[0].getAttribute("href") === "#situacion");
  ok("Ningún enlace vacío (href=\"#\") ni botón sin destino en el hero y las puertas", $$("a, button", sec).every((a) => a.tagName !== "A" || (a.getAttribute("href") && a.getAttribute("href") !== "#")));
  ok("El botón principal del hero y «Ver el resumen» llevan a Análisis y al resumen", $(".hero-btn.primario").dataset.ir === "analisis" && $(".hero-btn.vidrio").href === "https://vizcaya-vivienda-resumen.vercel.app/");
  ok("Sin cifras de adorno: no hay números en el hero salvo el de municipios (de los datos)", !/\d/.test($(".hero-sub").textContent + $$(".hero-btn").map((b) => b.textContent).join("")) && /^\d[\d.]*$/.test($(".hero-n").textContent.trim()) );
  ok("El logotipo de la cabecera lleva al inicio (#inicio)", $(".marca").getAttribute("href") === "#inicio");
  const radar = $(".puerta-tag");
  ok("Radar: se muestra como propuesta (etiqueta marcada como propuesta de texto, por validar)", radar?.textContent.trim() === "Propuesta" && radar.hasAttribute("data-propuesta"));

  // ---------- accesibilidad ----------
  ok("Un solo h1 de página: el del hero (el de Situación baja a nivel 2) y las puertas son h2", $(".hero-t").tagName === "H1" && $("#vista h1").getAttribute("aria-level") === "2" && $$(".puerta-t").every((h) => h.tagName === "H2"));
  ok("Fondo decorativo: alt vacío; el texto es HTML real", $(".hero-fondo img").alt === "" && $(".hero-fondo").getAttribute("aria-hidden") === "true");

  // ---------- geometría ----------
  const r = sec.getBoundingClientRect(), card = $(".hero-card").getBoundingClientRect(), p0 = tarj[0].getBoundingClientRect();
  ok("Geometría: el hero cabe en la primera pantalla y deja asomar las puertas (salida evidente a la exploración)", card.bottom <= H - 40 && p0.top < H - 40 && p0.top > card.bottom, `tarjeta hasta ${Math.round(card.bottom)}, puertas desde ${Math.round(p0.top)} de ${H}`);
  ok("Geometría: sin scroll horizontal", document.documentElement.scrollWidth <= innerWidth);
  const tr = $(".hero-t").getBoundingClientRect(), cta = $(".hero-cta").getBoundingClientRect();
  ok("Geometría: el titular, la descripción y los botones caben dentro de la tarjeta", tr.right <= card.right - 16 && tr.left >= card.left && cta.bottom <= card.bottom && $(".hero-sub").getBoundingClientRect().right <= card.right);
  ok("Geometría: las tres puertas tienen la misma altura y el mismo ancho", new Set(tarj.map((p) => Math.round(p.getBoundingClientRect().width))).size <= 2 && new Set(tarj.map((p) => Math.round(p.getBoundingClientRect().height))).size === 1);
  ok("Geometría: mismos márgenes que la vista de debajo (tarjeta y puertas alineadas)", Math.abs(card.left - p0.left) < 2 && Math.abs(card.right - tarj[2].getBoundingClientRect().right) < 2);
  ok("Tipografía: titular y títulos de puerta en Montserrat; texto en Geist", /Montserrat/.test(getComputedStyle(t).fontFamily) && tarj.every((p) => /Montserrat/.test(getComputedStyle($(".puerta-t", p)).fontFamily)) && /Geist/.test(getComputedStyle($(".hero-sub")).fontFamily) && /Geist/.test(getComputedStyle($(".puerta-d")).fontFamily));
  ok("Vidrio acotado: solo el botón secundario; la imagen y el mapa sin desenfoque", /blur/.test(getComputedStyle($(".hero-btn.vidrio")).backdropFilter) && !/blur/.test(getComputedStyle($(".hero-fondo img")).filter) && getComputedStyle($(".puerta")).backdropFilter === "none");

  // ---------- imagen ----------
  const img = $(".hero-fondo img");
  ok("El fondo «flow» carga y es WebP optimizado (< 300 KB)", img.complete && img.naturalWidth >= 1900 && /\/img\/flow\/flow-3\.webp$/.test(img.src) && (await fetch(img.src, { method: "HEAD" }).then((x) => +x.headers.get("content-length") < 300000)), img.src);

  // ---------- la cabecera de las seis vistas es la del ANÁLISIS ----------
  const cab = () => { const b = $(".banda"); return { vis: getComputedStyle(b).visibility, top: Math.round(b.getBoundingClientRect().top) }; };
  ok("Cabecera: mientras se ve el hero NO está (oculta y fuera de pantalla, sin foco en sus enlaces)", cab().vis === "hidden" && cab().top < 0 && !document.documentElement.classList.contains("en-analisis"), JSON.stringify(cab()));
  ok("Cabecera: el hero ocupa la pantalla entera desde arriba (tarjeta pegada al margen superior)", Math.round($(".hero-card").getBoundingClientRect().top) <= 24, `${Math.round($(".hero-card").getBoundingClientRect().top)}`);

  // ---------- SIN desplazamiento secuestrado ----------
  const evitado = rueda(120), evitado2 = rueda(-120);
  const kd = new KeyboardEvent("keydown", { key: "ArrowDown", cancelable: true, bubbles: true }); window.dispatchEvent(kd);
  const kp = new KeyboardEvent("keydown", { key: " ", cancelable: true, bubbles: true }); window.dispatchEvent(kp);
  await sleep(300);
  ok("Sin scroll-jacking: la rueda, la flecha y el espacio no se interceptan (el navegador desplaza como siempre)", !evitado && !evitado2 && !kd.defaultPrevented && !kp.defaultPrevented && scrollY === 0);
  ok("Sin scroll-snap en la página", getComputedStyle(document.documentElement).scrollSnapType === "none");

  // ---------- botones de análisis ----------
  $(".hero-btn.primario").click(); await sleep(1300);
  ok("«Explorar el análisis» lleva al umbral del análisis (queda justo bajo la cabecera) y no cambia la dirección", Math.abs(scrollY - destino()) <= 2 && /^#(situacion|inicio)?/.test(location.hash) && document.documentElement.classList.contains("con-inicio"), `y=${scrollY} destino=${destino()}`);
  ok("Cabecera: al llegar al análisis aparece (visible y arriba del todo), con el umbral «Análisis y medidas» justo debajo y Situación a continuación", cab().vis === "visible" && cab().top === 0 && document.documentElement.classList.contains("en-analisis") && Math.abs($("#umbral").getBoundingClientRect().top - banda) <= 2 && $("#vista").getBoundingClientRect().top < H, JSON.stringify(cab()));
  scrollTo({ top: 300, behavior: "instant" }); await sleep(700);
  ok("Cabecera: al volver hacia el hero se va otra vez", cab().vis === "hidden" && cab().top < 0, JSON.stringify(cab()));
  scrollTo(0, 0); await sleep(300);
  enl[0].click(); await sleep(1300);
  ok("«Entrar al análisis» de la puerta también", Math.abs(scrollY - destino()) <= 2, `y=${scrollY}`);
  scrollTo(0, 0); await sleep(200);

  // ---------- el hero no se rompe con lo que pasa debajo ----------
  const fila = $$(".fila")[2];
  if (fila) { fila.click(); await sleep(500); }
  ok("Elegir un municipio debajo reescribe la dirección (#situacion/…) pero el hero se queda", getComputedStyle(sec).display !== "none" && document.documentElement.classList.contains("con-inicio") && /^#situacion/.test(location.hash), location.hash);
  location.hash = "#municipios/48020"; await sleep(1200);
  ok("Navegar a otra vista oculta el hero, la vista empieza arriba y la cabecera es la de siempre (visible, pegada arriba)", cab().vis === "visible" && getComputedStyle($(".banda")).position === "sticky" && getComputedStyle(sec).display === "none" && !document.documentElement.classList.contains("con-inicio") && scrollY === 0 && $("#vista h1")?.getAttribute("aria-level") === null);
  location.hash = "#situacion/alquiler"; await sleep(1000);
  ok("Un enlace a Situación (sin hero) no lo muestra", getComputedStyle(sec).display === "none");
  location.hash = "#inicio"; await sleep(1200);
  ok("#inicio (el logotipo) vuelve a mostrar el hero, arriba del todo", getComputedStyle(sec).display !== "none" && scrollY === 0 && $("#vista h1")?.getAttribute("aria-level") === "2" && window.__vista === "situacion", `vista=${window.__vista}`);

  // ---------- legibilidad medida sobre los píxeles ----------
  const cardR = $(".hero-card").getBoundingClientRect();
  const zr = (el) => { const q = el.getBoundingClientRect(); return [q.left - cardR.left, q.top - cardR.top, q.right - cardR.left, q.bottom - cardR.top]; };
  const cT = await contraste(cardR, zr($(".hero-t"))), cN = await contraste(cardR, zr($(".hero-n")), [139, 205, 255]), cS = await contraste(cardR, zr($(".hero-sub")));
  ok(`Legibilidad: titular blanco (texto grande ≥ 3:1) sobre el píxel real; ${cT.toFixed(1)}:1`, cT >= 3);
  ok(`Legibilidad: el número en azul hielo (texto grande ≥ 3:1); ${cN.toFixed(1)}:1`, cN >= 3);
  ok(`Legibilidad: la descripción (texto normal ≥ 4,5:1); ${cS.toFixed(1)}:1`, cS >= 4.5);

  const fail = out.filter((x) => !x.pass);
  return { total: out.length, pass: out.length - fail.length, fail: fail.length, fallos: fail.map((x) => `${x.name} (${x.detail})`), todo: out.map((x) => `${x.pass ? "PASS" : "FAIL"} · ${x.name}${x.detail ? ` (${x.detail})` : ""}`) };
}
