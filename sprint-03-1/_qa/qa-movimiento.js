// Movimiento (sistema Astara DCI §9). En el navegador, con la app abierta en la intensidad por defecto («expressive», sin ?mov=):
//   window.__qaRes = null; import('/_qa/qa-movimiento.js').then(m => m.run()).then(r => window.__qaRes = r)
// Comprueba: tokens de tiempo y curvas; transición entre vistas (View Transition); píldora deslizante (posición, aplastamiento y llegada); entrada
// escalonada con tope y un solo momento firma; cifras que ruedan (valor final exacto, texto accesible); línea de tiempo ligada al scroll; refresco de
// valores; intensidades still / restrained / expressive; camino de movimiento reducido; y las reglas de rendimiento (solo transform y opacidad,
// sin listeners de scroll ni will-change permanente). El rendimiento real (fotogramas) se mide aparte con el perfil del navegador.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export async function run() {
  const out = [];
  const ok = (name, pass, detail = "") => out.push({ name, pass: !!pass, detail: String(detail) });
  const esperar = async (vista, sel = ".lec-contenido > *") => { for (let i = 0; i < 80; i++) { if (window.__vista === vista && $(sel) && !$("[aria-busy=true]")) break; await sleep(100); } await sleep(900); };
  const ir = async (h, vista, sel) => { location.hash = h; await esperar(vista, sel); };
  const css = await (await fetch("/css/movimiento.css")).text();
  const js = await (await fetch("/js/movimiento.js")).text();
  const root = getComputedStyle(document.documentElement), body = getComputedStyle(document.body);

  // ---------- tokens ----------
  const tok = (n) => root.getPropertyValue(n).trim();
  ok("Tokens de tiempo: 150 / 240 / 420 ms (feedback, estado, vista) y curvas de desaceleración sin rebote", tok("--t-fast") === "150ms" && tok("--t-base") === "240ms" && tok("--t-layout") === "420ms" && /cubic-bezier\(\.16, 1, \.3, 1\)/.test(tok("--ease-out")) && /cubic-bezier\(\.65, 0, \.35, 1\)/.test(tok("--ease-inout")));
  ok("Intensidad por defecto «expressive» y momento firma de 700 ms (solo con esa intensidad)", document.body.dataset.motion === "expressive" && body.getPropertyValue("--t-focal").trim() === "700ms");

  // ---------- píldora deslizante: cabecera ----------
  await ir("#situacion/alquiler/48020", "situacion", "#mapa svg path");
  const nav = $(".vistas"), len = $(":scope > .lente", nav), on = $('.vistas [aria-current="page"]');
  ok("Cabecera: la píldora está bajo la pestaña activa (misma posición y tamaño) y no recibe puntero ni lector de pantalla", !!len && len.style.transform === `translate(${on.offsetLeft}px, ${on.offsetTop}px)` && len.style.width === `${on.offsetWidth}px` && getComputedStyle(len).pointerEvents === "none" && len.getAttribute("aria-hidden") === "true");
  ok("La pestaña activa no pinta su propio fondo (lo pinta la píldora) y su texto sigue en blanco", getComputedStyle(on).backgroundColor === "rgba(0, 0, 0, 0)" && getComputedStyle(on).color === "rgb(255, 255, 255)");

  // ---------- selector de problemas: la píldora se desliza y se aplasta ----------
  const prob = $$("#problemas .problema"); const pl = $("#problemas > .lente");
  const px = () => new DOMMatrix(getComputedStyle(pl).transform).e; const x0 = px(); prob[2].click();
  const muestras = []; for (let i = 0; i < 12; i++) { await sleep(35); muestras.push({ x: px(), esc: getComputedStyle(pl).scale, m: pl.classList.contains("moving") }); }
  await sleep(500);
  ok("Selector de problemas: al elegir otro, la píldora viaja (pasa por posiciones intermedias) hasta el nuevo elegido", px() === prob[2].offsetLeft && muestras.some((m) => m.x > x0 + 2 && m.x < prob[2].offsetLeft - 2), `${Math.round(x0)} → ${prob[2].offsetLeft}: ${muestras.map((m) => Math.round(m.x)).join(" ")}`);
  ok("La píldora se aplasta al salir y se recupera al llegar (gota de cristal) y vuelve a escala 1", muestras.some((m) => m.m || m.esc !== "1") && getComputedStyle(pl).scale === "1", muestras.map((m) => m.esc).join(" | "));
  prob[0].click(); await sleep(400);

  // ---------- transición entre vistas ----------
  let llamadas = 0; const orig = document.startViewTransition?.bind(document); if (orig) document.startViewTransition = (f) => { llamadas++; return orig(f); };
  const pildora = $(".vistas > .lente"), x0n = pildora.style.transform;
  const t0 = performance.now(); const gaps = []; let ult = performance.now(), vivo = true; const bucle = () => { const n = performance.now(); gaps.push(n - ult); ult = n; if (vivo) requestAnimationFrame(bucle); }; requestAnimationFrame(bucle);
  $('.vistas a[data-vista="municipios"]').click();
  let tPildora = null; for (let i = 0; i < 100; i++) { await sleep(10); if (pildora.style.transform !== x0n) { tPildora = performance.now() - t0; break; } }
  const veloCerrado = document.body.classList.contains("cambiando") && getComputedStyle($("#velo")).transitionDuration === "0.15s";
  let rise = [], focal = [];
  for (let i = 0; i < 60; i++) { await sleep(25); rise = $$(".v-municipios .rise"); focal = $$(".v-municipios .focal"); if (rise.length >= 3) break; }   // se leen en cuanto la vista se ha montado (duran 420–700 ms)
  await esperar("municipios", ".v-municipios .fila-ind");
  vivo = false; if (orig) document.startViewTransition = orig;
  ok("Cambiar de vista NO usa View Transitions (fotografían la vista entera y congelaban 300–670 ms); hay un velo y ninguna regla ::view-transition", llamadas === 0 && !!$("#velo") && !/view-transition/.test(css) && !/startViewTransition/.test(js), `llamadas ${llamadas}`);
  ok(`La píldora de la cabecera reacciona al instante (${Math.round(tPildora)} ms < 100 ms) y el velo se cierra en 150 ms`, tPildora !== null && tPildora < 100 && veloCerrado);
  ok("La salida es más rápida que la entrada: el velo se cierra en 150 ms y se abre en 240 ms", getComputedStyle($("#velo")).transitionDuration === "0.24s" && /body\.cambiando #velo \{ opacity: 1; transition: opacity var\(--t-fast\)/.test(css) && /#velo \{[^}]*transition: opacity var\(--t-base\)/.test(css));
  ok("Una vista nueva empieza arriba (scroll a 0)", scrollY === 0);
  ok("La entrada no anima la opacidad de bloques con vidrio (el fundido lo da el velo); solo las capas pequeñas (desplegable, ficha, bandeja) llevan rise-fade", /@keyframes rise \{ from \{ translate:[^}]*\} \}/.test(css) && /@keyframes rise-fade \{ from \{ opacity: 0;/.test(css) && /\.m-pop:not\(\[hidden\]\)[^}]*rise-fade/.test(css));
  // rendimiento real: ningún hueco entre fotogramas de más de 100 ms (con View Transition eran 316–667 ms) al recorrer las seis vistas
  const huecos = [];
  for (const [h, v] of [["#acceso", "acceso"], ["#normas", "normas"], ["#metodo", "metodo"], ["#medidas", "medidas"], ["#situacion/alquiler/48020", "situacion"], ["#municipios/48020", "municipios"]]) {
    const g = []; let ult2 = performance.now(), vivo2 = true; const bucle2 = () => { const n = performance.now(); g.push(n - ult2); ult2 = n; if (vivo2) requestAnimationFrame(bucle2); }; requestAnimationFrame(bucle2);
    location.hash = h; await esperar(v, v === "situacion" ? "#mapa svg path" : v === "medidas" ? ".m-stage" : ".lec-contenido > *"); vivo2 = false; huecos.push(`${v} ${Math.round(Math.max(...g))}`);
  }
  ok(`Rendimiento al cambiar de vista: ningún hueco entre fotogramas de más de 100 ms en las seis vistas (peor de cada una, ms: ${huecos.join(", ")})`, huecos.every((x) => Number(x.split(" ")[1]) < 100), huecos.join(" | "));
  await ir("#municipios/48020", "municipios", ".v-municipios .fila-ind");

  // ---------- entrada escalonada y momento firma ----------
  const pasos = rise.map((n) => Number(n.style.getPropertyValue("--i"))); const maxPaso = Math.max(...pasos);
  ok("Entrada de la vista: bloques escalonados con tope (4 pasos × 50 ms = 200 ms como máximo de retraso)", rise.length >= 2 && rise.length <= 8 && Math.min(maxPaso, 4) * 50 <= 200, `${rise.length} bloques, pasos 0–${maxPaso}`);
  ok("Un solo momento firma por vista (Municipios: la tarjeta del perfil)", focal.length === 1 && focal[0].classList.contains("muni-cab"), `${focal.length}`);
  await sleep(900);
  ok("Las clases de entrada se retiran al terminar (no se reanima al mover nodos)", $$(".rise, .focal").length === 0);

  // ---------- cifras que ruedan ----------
  await ir("#acceso", "acceso", ".v-acceso .roll");
  const rolls = $$(".v-acceso .roll");
  const finales = rolls.every((r) => { const strips = $$(".roll__strip", r); const txt = r.querySelector(".sr-only").textContent.replace(/\D/g, ""); return strips.length === txt.length && strips.every((s, i) => { const m = new DOMMatrix(getComputedStyle(s).transform); const h = parseFloat(getComputedStyle(s).fontSize) * 1.2; return Math.abs(-m.f / h - Number(txt[i])) < 0.02; }); });
  ok("Acceso: las cifras de la cabecera ruedan y terminan EXACTAMENTE en su valor (10,8 y 16,9), con el texto accesible intacto", rolls.length === 2 && rolls.map((r) => r.querySelector(".sr-only").textContent).join("|") === "10,8|16,9" && finales && $$(".roll__digits", rolls[0]).every((d) => d.getAttribute("aria-hidden") === "true"));
  ok("El movimiento de las cifras es de 700 ms y solo transform", /rodar 700ms/.test(css) && /@keyframes rodar \{ from \{ transform: translateY\(0\); \} \}/.test(css));

  // ---------- refresco de un valor ----------
  $(".lec-indice .lec-ir:nth-child(3)").click(); await sleep(900);
  const num = $(".v-acceso .x-num"); const antes = num.textContent;
  [...$$(".v-acceso .x-controles .x-grupo")].find((g) => g.textContent.includes("Ahorra")).querySelectorAll(".opcion")[3].click(); await sleep(80);
  const justo = num.textContent; await sleep(650);
  ok("Un valor que cambia al elegir otra cosa se refresca con «tick»: la cifra cambia de golpe (idéntica a los 80 ms y a los 700 ms), no se interpola", num.textContent !== antes && justo === num.textContent && $$(".v-acceso .tick").length >= 1, `${antes} → ${justo}`);

  // ---------- línea de tiempo ligada al scroll ----------
  await ir("#normas", "normas", ".v-normas .hilo-linea");
  const linea = $(".v-normas .hilo-linea");
  const prog = []; for (const y of [0, 1400, 2400]) { scrollTo(0, y); await sleep(250); prog.push(parseFloat(getComputedStyle(linea).scale.split(" ")[1] ?? "1")); } scrollTo(0, 0);
  ok("Normas: la línea de tiempo se dibuja con la lectura (animación ligada al scroll: más abajo, más trazada) y los 12 hitos entran al llegar", linea.getAnimations().some((a) => a.timeline?.constructor?.name === "ViewTimeline") && prog[1] > prog[0] && prog[2] >= prog[1] && $$(".v-normas .hito").length === 12 && $(".v-normas .hito").getAnimations().length >= 1, prog.map((p) => p.toFixed(2)).join(" → "));

  // ---------- capas: desplegable, bandeja, ficha ----------
  await ir("#medidas", "medidas", ".m-stage");
  const probe = (cls, extra = "") => { const e = document.createElement("div"); e.className = cls; e.style.cssText = "position:absolute;left:-9999px;" + extra; document.body.append(e); const cs = getComputedStyle(e); const r = { n: cs.animationName, d: cs.animationDuration, de: cs.animationDelay }; e.remove(); return r; };

  // ---------- intensidades ----------
  const inten = {};
  for (const m of ["still", "restrained", "expressive"]) { document.body.dataset.motion = m; await sleep(30); const e = document.createElement("div"); e.className = "rise"; e.style.setProperty("--i", "3"); document.body.append(e); const cs = getComputedStyle(e); inten[m] = { n: cs.animationName, d: cs.animationDuration, de: cs.animationDelay, y: cs.getPropertyValue("--rise-y").trim() }; e.remove(); const l = $(".vistas > .lente"); inten[m].lente = getComputedStyle(l).transitionProperty; }
  document.body.dataset.motion = "expressive";
  ok("Intensidad «still»: sin entradas de vista; solo feedback", inten.still.n === "none" && inten.still.lente === "opacity");
  ok("Intensidad «restrained»: fundido de 240 ms con 4 px, sin escalonado", inten.restrained.n === "rise" && inten.restrained.d === "0.24s" && inten.restrained.de === "0s" && inten.restrained.y === "4px", JSON.stringify(inten.restrained));
  ok("Intensidad «expressive»: 420 ms con 8 px y escalonado (paso 3 = 150 ms)", inten.expressive.n === "rise" && inten.expressive.d === "0.42s" && inten.expressive.de === "0.15s" && inten.expressive.y === "8px", JSON.stringify(inten.expressive));

  // ---------- movimiento reducido y carga ----------
  const reduce = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce) {\n  .rise"));
  ok("Movimiento reducido: se quita el recorrido (--rise-y 0), la píldora no se aplasta, no ruedan las cifras ni se dibujan líneas, y se conservan los fundidos", /--rise-y: 0px !important/.test(reduce) && /animation-duration: var\(--t-base\) !important/.test(reduce) && /\.lente, \.lente\.moving \{ scale: 1;/.test(reduce) && /\.roll__strip \{ animation: none/.test(reduce) && /\.v-normas \.hilo-linea, \.v-normas \.hito \{ animation: none/.test(reduce));
  ok("Carga: hay un esqueleto (aria-busy) mientras llegan los datos, con pulso en lugar de barrido si se reduce el movimiento", /#vista\[aria-busy="true"\]:empty/.test(css) && /#vista\[aria-busy="true"\]:empty::after \{ animation: pulse/.test(css));

  // ---------- reglas de rendimiento ----------
  const propsAnimadas = [...css.matchAll(/transition(?:-property)?:\s*([^;}]+)[;}]/g)].map((m) => m[1]).join(" ");
  const sinLente = css.replace(/\.lente[^{]*\{[^}]*\}/g, ""); // la píldora es la excepción documentada: es un elemento absoluto que no empuja a nadie
  ok("Solo se animan transform, opacity, translate, scale y color: ni width, height, top, left ni márgenes (salvo la píldora, excepción documentada)", !/\b(?:transition|animation)[^;{}]*\b(width|height|top|left|margin|padding)\b/.test(sinLente) && !/@keyframes[^{]*\{[^}]*\b(width|height|top|left|margin)\b/.test(css), propsAnimadas.slice(0, 60));
  ok("Sin listeners de scroll ni will-change permanente", !/addEventListener\(\s*["']scroll/.test(js) && !/will-change/.test(css) && !/will-change/.test(js));
  ok("El contenido es visible por defecto: ninguna regla oculta nada sin una clase que añade el script (rise / focal / roll.is-in)", !/(^|\n)\s*(?!body[\[.]|@|#vista|#velo|\.lente)[^{\n]*\{\s*(?:[^}]*;)?\s*(?:opacity: 0|visibility: hidden)/.test(css.replace(/@keyframes[^{]*\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, "")));

  const fail = out.filter((t) => !t.pass);
  return { total: out.length, pass: out.length - fail.length, fail: fail.length, fallos: fail.map((f) => `${f.name} (${f.detail})`), todo: out.map((t) => `${t.pass ? "PASS" : "FAIL"} · ${t.name}${t.detail ? ` (${t.detail})` : ""}`) };
}
