// Línea base automática del Sprint 01. Ejecuta el calculo-acceso.js ORIGINAL (copia servida, sin cambios) con los datos
// de la web publicada y comprueba los casos de regresión del documento del sprint. Uso: node _qa/baseline.mjs
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import { fileURLToPath, pathToFileURL } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rd = (f) => JSON.parse(fs.readFileSync(path.join(root, "preview-a", "data", f), "utf8"));
const { access } = await import(pathToFileURL(path.join(root, "preview-a", "js", "calculo-acceso.js")).href);
const res = []; const ok = (id, cond, det) => res.push({ id, estado: cond ? "PASS" : "FAIL", det });

// 1. recuentos
const muni = rd("municipios.json"), med = rd("medidas.json"), nor = rd("normas.json"), meta = rd("meta.json"), ac = rd("acceso.json");
const gl = fs.readFileSync(path.join(root, "preview-a/js/glosario.js"), "utf8");
ok("B01 municipios", Object.keys(muni).length === 113, Object.keys(muni).length);
ok("B02 medidas M01-M34", med.medidas.length === 34 && med.medidas[0].id === "M01" && med.medidas[33].id === "M34", `${med.medidas.length}`);
ok("B03 instrumentos", nor.competencias.length === 15, nor.competencias.length);
ok("B04 niveles", nor.niveles.length === 4, nor.niveles.length);
ok("B05 hitos", nor.hitos.length === 12, nor.hitos.length);
ok("B06 términos de glosario", (gl.match(/^\s*\["[^"]+",/gm) || []).length === 124, (gl.match(/^\s*\["[^"]+",/gm) || []).length);
ok("B07 fuentes", Object.keys(meta.fuentes).length === 22, Object.keys(meta.fuentes).length);

// 2. cobertura de los cinco indicadores (misma lógica que situacion/indicadores.js)
const yearsOf = (m) => m.compra?.tramos?.P50?.["años"] ?? m.compra?.orientativo?.tramos?.P50?.["años"] ?? null;
const cnt = {
  alquiler: Object.values(muni).filter((m) => m.indicadores.esfuerzo_alquiler_P25 != null).length,
  entrada: Object.values(muni).filter((m) => yearsOf(m)).length,
  hogares: Object.values(muni).filter((m) => m.indicadores.crec_hogares != null && m.indicadores.crecimiento_parque != null).length,
  turisticas: Object.values(muni).filter((m) => m.indicadores.vut_por_1000 != null).length,
  vacias: Object.values(muni).filter((m) => m.indicadores.pct_no_principales != null).length,
};
ok("B08 cobertura 35,113,112,113,113", JSON.stringify(Object.values(cnt)) === "[35,113,112,113,113]", JSON.stringify(cnt));

// 3. Acceso con el estado inicial
const tier = ac.bizkaia_tramos.find((r) => r.tramo.includes("P50"));
const s = ac.supuestos;
const r = access({ price: tier.precio, net: tier.renta_neta, savings: s.ahorro[0], downPayment: s.entrada[1], rate: s.tipo_hipoteca.media, years: Math.max(...s.plazos), loanShare: s.financiacion, cap: s.tope_esfuerzo });
const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1).replace(".", ",");
ok("B09 años de ahorro 16,9", f1(r.yearsToSave) === "16,9", r.yearsToSave.toFixed(3));
ok("B10 entrada 93.007 €", Math.round(r.entry) === 93007, Math.round(r.entry));
ok("B11 esfuerzo 29,0 %", f1(r.effort) === "29,0", r.effort.toFixed(3));
ok("B12 cuota 887 €/mes", Math.round(r.monthlyPayment) === 887, r.monthlyPayment.toFixed(2));
ok("B13 precio pagable 275.000 € (redondeo al millar)", Math.round(r.affordable / 1000) * 1000 === 275000, r.affordable.toFixed(1));
ok("B14 vivienda media 265.733 €", Math.round(tier.precio) === 265733, tier.precio);
// rejilla 15 % x 35 % y 20 % x 35 %
const g = (a, e) => access({ price: tier.precio, net: tier.renta_neta, savings: a, downPayment: e, rate: s.tipo_hipoteca.media, years: 30, loanShare: s.financiacion, cap: s.tope_esfuerzo }).yearsToSave;
ok("B15 rejilla 15/35 = 16,9 y 20/35 = 12,6 y 10/25 = 18,1", f1(g(0.15, 0.35)) === "16,9" && f1(g(0.2, 0.35)) === "12,6" && f1(g(0.1, 0.25)) === "18,1", `${f1(g(.15, .35))} ${f1(g(.2, .35))} ${f1(g(.1, .25))}`);

// 4. Medidas y normas
ok("B16 «30 de 34» se pueden aplicar ya", med.medidas.filter((m) => m.viabilidad === "instrumento_existente").length === 30, "30");
ok("B17 «9 de 15» los decide Euskadi", nor.competencias.filter((c) => ["Gobierno Vasco y Parlamento", "Diputación y Juntas Generales"].some((l) => c.papeles[l] === "decide")).length === 9, "9");

// 5. Integridad: preview-a frente a los sha256 de lo que sirve la web publicada (_qa/original-hashes.json)
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const A = path.join(root, "preview-a");
const rel = (b, f) => path.relative(b, f).split(path.sep).join("/");
const orig = new Map(Object.entries(JSON.parse(fs.readFileSync(path.join(root, "_qa", "original-hashes.json"), "utf8")).ficheros));
const dist = []; const nuevos = []; const iguales = []; const camb = [];
for (const f of walk(A)) { const k = rel(A, f); if (!orig.has(k)) { nuevos.push(k); continue; } (orig.get(k) === sha(f) ? iguales : camb).push(k); }
const sinTocar = (re) => iguales.filter((k) => re.test(k)).length === orig.size && true;
const protegidos = [...orig.keys()].filter((k) => /^(js\/|data\/|vendor\/|fonts\/|img\/)/.test(k));
const protegidosIguales = protegidos.filter((k) => iguales.includes(k));
ok("B18 js, data, vendor, fonts e img de A idénticos al original servido", protegidos.length === protegidosIguales.length, `${protegidosIguales.length}/${protegidos.length}`);
ok("B19 calculo-acceso.js idéntico", iguales.includes("js/calculo-acceso.js"), sha(path.join(A, "js/calculo-acceso.js")).slice(0, 12));
ok("B20 solo cambian index.html y nada más de lo original", JSON.stringify(camb.sort()) === JSON.stringify(["index.html"]), JSON.stringify(camb));

console.log(JSON.stringify({ resultados: res, ficherosNuevosEnA: nuevos, ficherosModificadosEnA: camb, totalOriginal: orig.size, iguales: iguales.length }, null, 1));
process.exit(res.some((x) => x.estado === "FAIL") ? 1 : 0);
