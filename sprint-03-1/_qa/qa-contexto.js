// Mejora A (navegación contextual) y B (consultas compartibles). En el navegador, con la app abierta en http://localhost:4179/#situacion/alquiler :
//   window.__qaRes = null; import('/_qa/qa-contexto.js').then(m => m.run()).then(r => window.__qaRes = r)
// Comprueba, con datos reales: que el municipio y el problema viajan entre Situación, Municipios, Acceso y Medidas; que la ficha de Situación ya no envía a la web antigua;
// que los enlaces de la cabecera llevan el contexto y que las filas «Seguir con…» solo ofrecen saltos con sentido.
import { cargarStore } from "/js/datos.js";
import { fijar } from "/js/contexto.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export async function run() {
  const out = [];
  const ok = (name, pass, detail = "") => out.push({ name, pass: !!pass, detail });
  const store = await cargarStore();
  const ir = async (hash, espera = 1500) => { location.hash = hash; await sleep(espera); };
  const clic = async (sel, espera = 1700) => { $(sel).click(); await sleep(espera); };
  const nav = () => Object.fromEntries($$(".vistas a").map((a) => [a.dataset.vista, a.getAttribute("href")]));
  const fila = (s) => { const n = $(s); return n ? [...n.children].map((x) => x.textContent.trim()).join(" ") : ""; };
  const bilbao = "48020", barakaldo = "48013";
  try { sessionStorage.clear(); } catch { /* */ }
  fijar({ problema: null, muni: null, muniB: null });

  // ---------- A · navegación contextual ----------
  await ir("#situacion/alquiler");
  ok("Sin municipio, no hay fila «Seguir con…» y la cabecera no lleva contexto de municipio", !$(".ctx-enlaces:not([hidden])") && nav().municipios === "#municipios" && nav().acceso === "#acceso");
  await ir(`#situacion/alquiler/${bilbao}`);
  ok("Situación → la ficha de Bilbao lleva a Municipios DENTRO de la aplicación (no a la web antigua)", $(".ficha-nombre a")?.getAttribute("href") === `#municipios/${bilbao}` && !$(".ficha-nombre a").target);
  ok("Situación: ninguna ficha ni enlace de la vista envía a vizcaya-vivienda-analisis.vercel.app", $$("#vista a[href]").every((a) => !/vizcaya-vivienda-analisis/.test(a.href)));
  ok("Situación: la cabecera lleva el contexto (mapa con Bilbao, Municipios/48020, Acceso con ?lugar, Medidas con su plan)", nav().situacion === `#situacion/alquiler/${bilbao}` && nav().municipios === `#municipios/${bilbao}` && nav().acceso === `#acceso?lugar=${bilbao}` && /^#medidas\?sel=M\d+/.test(nav().medidas), JSON.stringify(nav()));
  const plan = store.municipios[bilbao].plan.map((p) => p.id).slice(0, 3);
  ok("Medidas: el enlace lleva las medidas del plan de Bilbao (hasta tres, en el orden del plan)", nav().medidas === `#medidas?sel=${plan.join(",")}`, nav().medidas);
  ok("Situación: la fila «Seguir con Bilbao» ofrece Su ficha, Calcular la compra y Medidas de su plan", fila(".ctx-enlaces.en-ficha") === "Seguir con Bilbao Su ficha Calcular la compra Medidas de su plan", fila(".ctx-enlaces.en-ficha"));

  await clic('.ctx-enlaces .ctx-a[href^="#municipios"]');
  ok("→ Municipios abre la ficha de Bilbao", location.hash === `#municipios/${bilbao}` && $("#muni-a")?.value === bilbao && $(".muni-nombre")?.textContent === "Bilbao");
  ok("Municipios: la fila ofrece mapa, compra y medidas (no a sí misma)", fila(".ctx-enlaces.en-municipios") === "Seguir con Bilbao Ver en el mapa Calcular la compra Medidas de su plan");

  await clic('.ctx-enlaces .ctx-a[href^="#acceso"]');
  ok("→ Acceso abre el explorador con «Dónde» = Bilbao y su precio", location.hash === `#acceso?lugar=${bilbao}` && $("#x-lugar").selectedOptions[0].textContent === "Bilbao" && /vivienda media cuesta/.test($(".explorador")?.textContent ?? ""));
  ok("Acceso: la fila ofrece mapa, ficha y medidas", fila(".ctx-enlaces.en-acceso") === "Seguir con Bilbao Ver en el mapa Su ficha Medidas de su plan");

  await clic('.vistas a[data-vista="medidas"]');
  ok("→ Medidas abre con las medidas del plan de Bilbao elegidas", location.hash === `#medidas?sel=${plan.join(",")}` && JSON.stringify(window.__medidas?.S?.sel) === JSON.stringify(plan), JSON.stringify(window.__medidas?.S?.sel));
  ok("Medidas: la fila ofrece mapa, ficha y compra", fila(".ctx-enlaces.en-medidas") === "Seguir con Bilbao Ver en el mapa Su ficha Calcular la compra");

  await clic('.ctx-enlaces .ctx-a[href^="#situacion"]');
  ok("→ Situación vuelve al mapa con Bilbao y el MISMO problema", location.hash === `#situacion/alquiler/${bilbao}` && window.__atlas?.S?.code === bilbao && window.__atlas?.S?.i === 0);

  // el problema también viaja
  const otro = $$(".perfil-b")[3]; otro.click(); await sleep(600);
  const idOtro = location.hash.split("/")[1];
  ok("Situación: al cambiar de problema, la cabecera conserva problema y municipio", nav().situacion === `#situacion/${idOtro}/${bilbao}` && idOtro !== "alquiler", nav().situacion);
  await clic('.ctx-enlaces .ctx-a[href^="#municipios"]');
  await clic('.ctx-enlaces .ctx-a[href^="#situacion"]');
  ok("Ida y vuelta Situación → Municipios → Situación: mismo problema y mismo municipio", location.hash === `#situacion/${idOtro}/${bilbao}` && window.__atlas.S.code === bilbao);

  // comparación: el municipio comparado también se recuerda
  await ir(`#municipios/${bilbao}-${barakaldo}`);
  ok("Comparación: la cabecera recuerda los dos municipios (Municipios → Bilbao-Barakaldo)", nav().municipios === `#municipios/${bilbao}-${barakaldo}`, nav().municipios);
  ok("Comparación: Acceso y Medidas siguen el municipio principal (Bilbao)", nav().acceso === `#acceso?lugar=${bilbao}`);

  // sin compra propia no se ofrece Acceso
  const sinCompra = store.codes.find((c) => { const m = store.municipios[c]; return !(m.compra?.precio && m.compra.ratio_neto && ["P25", "P50", "P75"].every((q) => m.compra.tramos?.[q]?.renta_bruta)); });
  await ir(`#situacion/alquiler/${sinCompra}`);
  ok(`Municipio sin precio de compra propio (${store.municipios[sinCompra].nombre}): no se ofrece «Calcular la compra» ni se enlaza ?lugar`, !/Calcular la compra/.test($(".ctx-enlaces.en-ficha")?.textContent ?? "") && nav().acceso === "#acceso", nav().acceso);

  // datos y textos intactos
  ok("Los datos de la ficha siguen siendo los del almacén (Bilbao: 55,8 % en alquiler)", (await (async () => { await ir(`#situacion/alquiler/${bilbao}`); return $(".ficha-valor")?.textContent; })()) === "55,8 %");

  // ---------- B · consultas compartibles ----------
  // Situación: filtros de la lista en la dirección
  await ir(`#situacion/alquiler/${bilbao}`);
  const tipoBilbao = store.municipios[barakaldo].tipo;   // el tipo de Barakaldo: con la búsqueda «bar» la lista no queda vacía
  const sel = $("#tipo"); sel.value = tipoBilbao; sel.dispatchEvent(new Event("change", { bubbles: true })); await sleep(300);
  const buscar = $("#buscar"); buscar.value = "bar"; buscar.dispatchEvent(new Event("input", { bubbles: true })); await sleep(400);
  const urlSit = location.hash;
  ok("Situación: el tipo de municipio y la búsqueda de la lista pasan a la dirección (#situacion/…?tipo=…&q=…)", urlSit === `#situacion/alquiler/${bilbao}?tipo=${tipoBilbao}&q=bar`, urlSit);
  await ir("#acceso"); await ir(urlSit);
  ok("Situación: al abrir esa dirección se restauran el indicador, el municipio, el tipo y la búsqueda", window.__atlas.S.tipo === tipoBilbao && window.__atlas.S.q === "bar" && $("#tipo").value === tipoBilbao && $("#buscar").value === "bar" && window.__atlas.S.code === bilbao);
  ok("Situación: la lista filtrada solo muestra municipios de ese tipo cuyo nombre contiene la búsqueda", $$("#filas .fila").length > 0 && $$("#filas .fila").every((f) => /bar/i.test(store.municipios[f.dataset.code].nombre.normalize("NFD").replace(/[̀-ͯ]/g, "")) && store.municipios[f.dataset.code].tipo === tipoBilbao));
  await ir("#situacion/alquiler?tipo=zzz&q=" + "x".repeat(200));
  ok("Situación: un tipo que no existe se ignora y la búsqueda se recorta a 60 caracteres (sin errores)", window.__atlas.S.tipo === null && window.__atlas.S.q.length <= 60);

  // Acceso: supuestos
  await ir("#acceso");
  const kpis = () => $$(".x-kpi .x-num").map((n) => n.textContent).join("|");
  const base = kpis();
  const pulsa = (etq, texto) => { const b = $$(`.explorador [role="group"][aria-label="${etq}"] .opcion`).find((x) => x.textContent.trim() === texto); b.click(); return !!b; };
  pulsa("Hogar", "Ingresos bajos"); pulsa("Ahorra cada año", "20 %"); pulsa("Entrada, con impuestos y gastos", "30 %"); pulsa("Plazo", "25 años"); pulsa("Préstamo «TU CASA» para la entrada", "Sí");
  $("#x-lugar").value = bilbao; $("#x-lugar").dispatchEvent(new Event("change", { bubbles: true }));
  await sleep(400);
  const cambiado = kpis(), urlAcc = location.hash;
  ok("Acceso: los supuestos elegidos pasan a la dirección sin recargar (lugar, hogar, ahorro, entrada, plazo y TU CASA)", cambiado !== base && ["lugar=" + bilbao, "hogar=P25", "ahorro=20", "entrada=30", "plazo=25", "tu=1"].every((p) => urlAcc.includes(p)), urlAcc);
  await ir("#normas"); await ir(urlAcc, 2000);
  ok("Acceso: al abrir esa dirección se restauran los mismos supuestos y los MISMOS resultados (años, cuota y precio)", kpis() === cambiado && $("#x-lugar").selectedOptions[0].textContent === "Bilbao", `${kpis()} vs ${cambiado}`);
  const mapaAntes = $(".alcance-total")?.textContent;
  $$('.alcance-controles [role="group"][aria-label="Ingresos del hogar"] .opcion')[0].click(); $$('.alcance-controles [role="group"][aria-label="Lo que ahorra cada año"] .opcion').find((b) => /25/.test(b.textContent)).click(); await sleep(400);
  const urlMapa = location.hash, mapaDespues = $(".alcance-total")?.textContent;
  ok("Acceso: el mapa «¿Hasta dónde llega mi hogar?» también viaja en la dirección (mh y ma)", /mh=0/.test(urlMapa) && /ma=25/.test(urlMapa) && mapaDespues !== mapaAntes, urlMapa);
  await ir("#metodo"); await ir(urlMapa, 2000);
  ok("Acceso: se restaura el mapa con el mismo resultado", $(".alcance-total")?.textContent === mapaDespues && kpis() === cambiado);
  await ir("#acceso?hogar=P99&ahorro=999&entrada=abc&plazo=7&tu=2&mh=99&lugar=00000", 2000);
  ok("Acceso: valores que no existen en los controles se ignoran (queda lo de por defecto, sin errores)", kpis() === base);

  // Municipios y Medidas: ya tenían dirección compartible; se comprueba que siguen restaurándose
  await ir(`#municipios/${bilbao}-${barakaldo}`, 2000);
  ok("Municipios: #municipios/A-B restaura exactamente los dos municipios", $("#muni-a").value === bilbao && $("#muni-b").value === barakaldo && $$(".muni-cab").length === 2);
  await ir("#medidas?rep=matriz&w=3,2,0,0,1&sel=M08,M01", 2000);
  ok("Medidas: matriz, pesos y selección se restauran desde la dirección", window.__medidas.S.rep === "matriz" && window.__medidas.S.w.evidencia === 3 && JSON.stringify(window.__medidas.S.sel) === JSON.stringify(["M08", "M01"]));

  // botón «Copiar enlace»
  await ir(urlAcc, 1500);
  const boton = $("#copiar-enlace");
  boton.click(); await sleep(500);
  ok("«Copiar enlace»: el botón está en la cabecera y responde (copiado o aviso de que no se pudo)", !!boton && /^(Enlace copiado|No se pudo copiar)$/.test(boton.textContent));
  ok("«Copiar enlace»: lo que copia es la dirección completa de la consulta (la misma de la barra)", location.href.endsWith(urlAcc) && !!boton.title);

  const fail = out.filter((t) => !t.pass);
  return { total: out.length, pass: out.length - fail.length, fail: fail.length, fallos: fail.map((f) => `${f.name} (${f.detail})`), todo: out.map((t) => `${t.pass ? "PASS" : "FAIL"} · ${t.name}${t.detail ? ` (${t.detail})` : ""}`) };
}
