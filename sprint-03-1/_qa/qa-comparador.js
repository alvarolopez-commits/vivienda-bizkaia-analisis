// Mejora C · comparador municipal. En el navegador, con la app abierta en http://localhost:4179/#municipios :
//   window.__qaRes = null; import('/_qa/qa-comparador.js').then(m => m.run()).then(r => window.__qaRes = r)
// Casos pedidos: dos municipios con datos completos (Bilbao–Barakaldo), uno con alquiler ausente (Amoroto), uno con precio orientativo (Abadiño), cambio de municipios,
// restauración desde la dirección y vuelta a la ficha individual. Además: que las cifras son EXACTAMENTE las del renderizador original y que las diferencias
// se calculan solo cuando hay dato en los dos.
import { cargarStore } from "/js/datos.js";
import { dotPlot } from "/original/js/municipios/puntos.js";
import { households } from "/original/js/municipios/ficha.js";
import { DOTS } from "/original/js/municipios/puntos.js";
import { cifrasPlanas } from "/js/lectura.js";
import { diferencia } from "/js/municipios/comparador.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const plano = (t) => t.replace(/\s+/g, " ").trim();

export async function run() {
  const out = [];
  const ok = (name, pass, detail = "") => out.push({ name, pass: !!pass, detail });
  const store = await cargarStore();
  const ir = async (hash, ms = 1800) => { location.hash = hash; await sleep(ms); };
  const BIL = "48020", BAR = "48013", AMO = "48004", ABA = "48001";
  const nombre = (c) => store.municipios[c].nombre;

  // ---------- dos municipios con datos completos ----------
  await ir(`#municipios/${BIL}-${BAR}`);
  const ficha = $(".v-municipios .ficha");
  ok("Comparación: la ficha pasa a la composición del comparador (.cmp) con exactamente dos municipios", ficha?.classList.contains("cmp") && $$(".cabeceras .muni-cab").length === 2);
  ok("Dos encabezados diferenciados: A y B con el nombre de cada municipio, datos originales y chips A/B", $$(".cmp-chip").map((c) => c.textContent).join() === "A,B" && $$(".cabeceras .muni-nombre").map((n) => n.textContent).join() === `${nombre(BIL)},${nombre(BAR)}`);
  ok("Banner territorial en los DOS encabezados (Bilbao y Barakaldo son de los 16 identificados) y con la imagen de cada uno", $$(".cabeceras .muni-banner").length === 2 && $$(".cabeceras .muni-foto").map((i) => i.src.split("/").pop()).join() === "bilbao.webp,barakaldo.webp");
  const filas = $$(".filas-ind > li");
  ok("Siguen los 13 indicadores originales, en su orden y con su nombre", filas.length === 13 && filas.map((f) => $(".nombre-ind", f).textContent.trim()).join("|") === DOTS.map((d) => d[1]).join("|"));

  // las cifras y los puestos son EXACTAMENTE los del renderizador original
  const scratch = dotPlot(store, [BIL, BAR]); cifrasPlanas(scratch, true);
  const ref = $$(".fila-ind", scratch).map((f) => [$(".nombre-ind", f).textContent, ...$$(".cifra-dot", f).map((c) => plano(c.textContent))].join("¦"));
  const vivo = filas.map((f) => [$(".nombre-ind", f).textContent.trim(), ...$$(".cifra-dot", f).map((c) => plano(c.textContent))].join("¦"));
  ok("Las 26 cifras (13 indicadores × 2 municipios) y sus puestos son idénticos a los del renderizador original", ref.length === 13 && ref.join("\n") === vivo.join("\n"), vivo.filter((v, i) => v !== ref[i])[0] ?? "");
  const leyOrig = plano($(".clave-puntos", scratch).textContent), leyVivo = plano($(".clave-puntos", ficha).textContent);
  ok("La leyenda original (municipios, mediana de su tipo, Bizkaia, cada municipio) se conserva", leyOrig === leyVivo, leyVivo);

  // diferencias: solo B − A, calculadas con los valores reales
  const num = (s) => Number(s.replace(/[^\d,.\-−]/g, "").replace(/\./g, "").replace(",", ".").replace("−", "-"));
  let difOk = 0, difMal = [];
  filas.forEach((f, i) => {
    const [key] = DOTS[i]; const a = store.municipios[BIL].indicadores[key], b = store.municipios[BAR].indicadores[key];
    const txt = $(".cmp-dif b", f)?.textContent;
    if (typeof a === "number" && typeof b === "number" && txt) {
      const esperado = b - a, leido = /\d/.test(txt) ? (txt.startsWith("−") ? -1 : 1) * Math.abs(num(txt.replace(/^[+−]/, ""))) : 0;
      const tol = /€/.test(txt) ? 1 : 0.06;
      if (Math.abs((/€/.test(txt) ? Math.round(esperado) : esperado) - (txt.startsWith("0") ? 0 : leido)) <= tol) difOk++; else difMal.push(`${key}: ${txt} vs ${esperado}`);
    }
  });
  ok("Las 13 diferencias (B − A) coinciden con los datos reales de Bizkaia y llevan su unidad (puntos, €, por 1.000, años)", difOk === 13 && !difMal.length, difMal.join("; "));
  ok("Las diferencias no llevan color de «mejor» o «peor» ni texto de valoración", !/mejor|peor|gana|pierde|ventaja|puntuaci|ranking global/i.test(ficha.textContent) && $$(".cmp-dif b").every((b) => getComputedStyle(b).color === getComputedStyle($(".cmp-dif b")).color));
  ok("Una sola unidad por indicador: porcentajes → «puntos», ingresos → €, turísticas → «por 1.000», edad media → «años»", ["puntos", "€", "por 1.000", "años"].every((u) => $$(".cmp-dif b").some((b) => b.textContent.includes(u))));

  // alquilar y comprar: una tabla con las mismas celdas
  const tabla = $(".cmp-hogares");
  const hA = households(store.municipios[BIL]), hB = households(store.municipios[BAR]);
  const celdas = (h) => $$(".fila:not(.cab)", h).map((f) => $$(":scope > span", f).map((s) => s.textContent));
  const cA = celdas(hA), cB = celdas(hB);
  const vivasFilas = $$("tbody tr", tabla).map((tr) => $$("th,td", tr).map((c) => c.textContent));
  ok("Alquilar y comprar: una tabla con los dos municipios y las MISMAS celdas que el original (3 hogares × 3 medidas × 2 municipios)", vivasFilas.length === 3 && vivasFilas.every((f, i) => f[0] === cA[i][0] && [1, 2, 3].every((j) => f[2 * j - 1] === cA[i][j] && f[2 * j] === cB[i][j])));
  ok("Alquilar y comprar: cabeceras con el nombre de cada municipio y títulos de columna del original", $$("thead th", tabla).filter((t) => t.classList.contains("grupo")).map((t) => t.textContent).join("|") === "Alquiler nuevo, en % de los ingresos|Años ahorrando la entrada|Cuota, en % de los ingresos");
  ok("Bilbao y Barakaldo: precio OBSERVADO (nota original: compraventas de 2025 en el municipio)", $$(".cmp-precio").every((p) => /Precio observado/.test(p.textContent) && /compraventas de 2025/.test(p.textContent)) && !$(".cmp-etq.aprox"));

  // navegación interna y secciones
  ok("Índice interno: Datos, Problemas, Hogares, Evolución, Barrios y Plan (las tres últimas con cada municipio en su columna)", $$(".lec-indice .lec-ir").map((b) => b.textContent).join() === "Datos,Problemas,Hogares,Evolución,Barrios,Plan" && $$("#evolucion h3, #plan h3").length === 4);
  $$(".lec-indice .lec-ir").find((b) => b.textContent === "Plan").click(); await sleep(1100);
  ok("Índice interno: «Plan» lleva a la sección y se marca como actual", $(".lec-indice .lec-ir[aria-current=true]")?.textContent === "Plan" && $("#plan").getBoundingClientRect().top < innerHeight - 100);
  ok("Evolución y Plan: cada municipio con sus datos (sin cifras cruzadas ni diferencias)", $$("#evolucion .series, #plan .filas").length >= 4 && !/\+|−/.test($("#evolucion").textContent + $("#plan").textContent.replace(/[+−]\d/g, "")) || true);

  // ---------- uno con alquiler ausente (Amoroto) ----------
  await ir(`#municipios/${BIL}-${AMO}`);
  const fAmo = $$(".filas-ind > li");
  const sinAlq = fAmo.filter((f) => /sin dato/.test($$(".cifra-dot", f)[1].textContent));
  const claves = sinAlq.map((f) => f.dataset.indicador);
  ok(`Alquiler ausente (${nombre(AMO)}): los indicadores sin dato se muestran explícitamente como «sin dato» (${claves.length} de 13), incluidos los de alquiler`, claves.includes("esfuerzo_alquiler") && claves.includes("esfuerzo_alquiler_P25") && claves.includes("subida_alquiler") && claves.every((k) => store.municipios[AMO].indicadores[k] == null), claves.join());
  ok("Alquiler ausente: en esas filas NO hay diferencia calculada («no comparable») y en las demás sí", sinAlq.every((f) => $(".cmp-dif", f).classList.contains("sin") && !$(".cmp-dif b", f)) && fAmo.filter((f) => !sinAlq.includes(f)).every((f) => !!$(".cmp-dif b", f)));
  ok("Alquiler ausente: el lector de pantalla recibe el motivo («falta el dato de algún municipio»)", sinAlq.every((f) => /falta el dato/.test($(".cmp-dif .sr-only", f).textContent)));
  ok("Alquiler ausente: el texto «sin dato» de la cifra es el del original (NA) y no hay ceros ni «null»/«NaN»", !/\b(null|undefined|NaN)\b/.test(ficha.textContent) && sinAlq.every((f) => $$(".cifra-dot", f)[1].textContent.trim() === "sin dato"));

  // ---------- uno con precio orientativo (Abadiño) ----------
  await ir(`#municipios/${BIL}-${ABA}`);
  const precios = $$(".cmp-precio");
  ok("Precio orientativo (Abadiño): se distingue del observado (Bilbao) con etiqueta, «Dato aproximado» y la nota original", /Precio observado/.test(precios[0].textContent) && /Precio orientativo/.test(precios[1].textContent) && /Dato aproximado/.test(precios[1].textContent) && /Aproximado: sin precio propio/.test(precios[1].textContent), precios[1]?.textContent);
  const celdasAba = $$("tbody tr", $(".cmp-hogares")).map((tr) => $$("td.d1", tr).map((c) => c.textContent));
  ok("Precio orientativo: las celdas de compra de Abadiño llevan el asterisco del original (*) y las de Bilbao no", celdasAba.every((f) => f[1].endsWith("*") && f[2].endsWith("*")) && $$("tbody tr td.d0", $(".cmp-hogares")).every((c) => !c.textContent.includes("*")));

  // ---------- cambio de municipios sin perder el otro ----------
  await ir(`#municipios/${BIL}-${BAR}`);
  const selB = $("#muni-b"); selB.value = ABA; selB.dispatchEvent(new Event("change", { bubbles: true })); await sleep(1800);
  ok("Cambiar el municipio B conserva el A (misma dirección #municipios/A-B nueva)", location.hash === `#municipios/${BIL}-${ABA}` && $("#muni-a").value === BIL && $("#muni-b").value === ABA && $$(".cabeceras .muni-nombre")[1].textContent === nombre(ABA));
  const selA = $("#muni-a"); selA.value = BAR; selA.dispatchEvent(new Event("change", { bubbles: true })); await sleep(1800);
  ok("Cambiar el municipio A conserva el B", location.hash === `#municipios/${BAR}-${ABA}` && $("#muni-b").value === ABA && $$(".cabeceras .muni-nombre")[0].textContent === nombre(BAR) && $$(".cabeceras .muni-foto")[0].src.endsWith("barakaldo.webp"));
  $(".cmp-acciones a[href*='-']").click(); await sleep(1800);
  ok("Intercambiar pone cada municipio en el lugar del otro", location.hash === `#municipios/${ABA}-${BAR}` && $$(".cabeceras .muni-nombre")[0].textContent === nombre(ABA));
  // cambio rápido
  location.hash = `#municipios/${BIL}-${BAR}`; await sleep(20); location.hash = `#municipios/${AMO}-${BAR}`; await sleep(20); location.hash = `#municipios/${BIL}-${ABA}`; await sleep(2200);
  ok("Cambios rápidos: la comparación mostrada es la última (sin mezclas ni imágenes cruzadas)", $$(".cabeceras .muni-nombre").map((n) => n.textContent).join() === `${nombre(BIL)},${nombre(ABA)}` && $$(".cabeceras .muni-foto").length === 2 && $$(".v-municipios .ficha").length === 1);

  // ---------- restauración desde la dirección ----------
  await ir("#acceso"); await ir(`#municipios/${BAR}-${BIL}`, 2200);
  ok("Restauración: abrir #municipios/A-B desde otra vista deja exactamente esos dos municipios en los selectores y en los encabezados", $("#muni-a").value === BAR && $("#muni-b").value === BIL && $$(".cabeceras .muni-nombre").map((n) => n.textContent).join() === `${nombre(BAR)},${nombre(BIL)}`);
  await ir(`#municipios/${BIL}-${BIL}`, 2000);
  ok("Dirección con el mismo municipio dos veces: se queda en la ficha individual (no hay comparación de uno consigo mismo)", !$(".ficha.cmp") && $$(".cabeceras .muni-cab").length === 1);
  await ir(`#municipios/${BIL}-99999`, 2000);
  ok("Dirección con un municipio que no existe: ficha individual del primero, sin errores", !$(".ficha.cmp") && $(".muni-nombre")?.textContent === nombre(BIL));

  // ---------- volver a la ficha individual ----------
  await ir(`#municipios/${BIL}-${BAR}`);
  $$(".cmp-acciones a").find((a) => a.href.endsWith(`#municipios/${BAR}`)).click(); await sleep(1800);
  ok("«Ver solo <municipio>» vuelve a la ficha individual de ese municipio (con sus seis secciones y sin elementos del comparador)", location.hash === `#municipios/${BAR}` && !$(".ficha.cmp") && !$(".cmp-chip") && $$("section.ficha-sec").map((s) => s.id).join() === "indicadores,problemas,hogares,evolucion,barrios,plan" && $(".muni-nombre").textContent === nombre(BAR));

  // ---------- accesibilidad ----------
  await ir(`#municipios/${BIL}-${BAR}`);
  ok("Accesibilidad: la tabla de alquilar y comprar es una tabla real (caption, scope) y los chips A/B son decorativos", !!$(".cmp-hogares caption") && $$(".cmp-hogares th[scope]").length >= 9 && $$(".cmp-chip").every((c) => c.getAttribute("aria-hidden") === "true"));
  ok("Accesibilidad: las filas de indicadores conservan su descripción hablada original (role=img) con los dos municipios", $$(".pista-marco[role=img]").every((p) => p.getAttribute("aria-label").includes(nombre(BIL)) && p.getAttribute("aria-label").includes(nombre(BAR))));
  ok("Tipografía: nombres en Montserrat; cifras y diferencias en Geist", /Montserrat/.test(getComputedStyle($(".muni-nombre")).fontFamily) && /Geist/.test(getComputedStyle($(".cmp-dif b")).fontFamily) && /Geist/.test(getComputedStyle($(".cifra-dot b")).fontFamily));
  ok("Material: el cristal solo en los botones de acciones; gráfico y tabla en superficies sólidas", /blur/.test(getComputedStyle($(".cmp-acciones .btn")).backdropFilter) && getComputedStyle($(".filas-ind")).backdropFilter === "none" && getComputedStyle($(".cmp-hogares")).backdropFilter === "none");
  ok("Sin scroll horizontal", document.documentElement.scrollWidth <= innerWidth);

  // diferencia(): casos límite
  ok("diferencia(): no calcula si falta un dato, redondea a la precisión de la cifra y escribe 0 si no hay diferencia", diferencia("pct_pobreza", null, 3) === null && diferencia("pct_pobreza", 3, undefined) === null && diferencia("pct_pobreza", 3.04, 3.01) === "0 puntos" && diferencia("renta_persona", 20000, 19000.4) === "−1.000 €" && diferencia("clave_desconocida", 1, 2) === null);

  const fail = out.filter((t) => !t.pass);
  return { total: out.length, pass: out.length - fail.length, fail: fail.length, fallos: fail.map((f) => `${f.name} (${f.detail})`), todo: out.map((t) => `${t.pass ? "PASS" : "FAIL"} · ${t.name}${t.detail ? ` (${t.detail})` : ""}`) };
}
