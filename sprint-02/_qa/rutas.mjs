// Sprint 02 · compatibilidad del formato de URL propuesto con el router ORIGINAL (rutas.js de la web servida, sin cambios).
// Uso: node sprint-02/_qa/rutas.mjs   (sale con 1 si algo falla)
import { parseHash, redirectOf } from "../../sprint-01/_original-servido/js/rutas.js";

const casos = [
  // formato propuesto: la web original lo abre en Situación (ignora el resto) y no lo redirige
  ["#situacion/alquiler", { view: "situacion", sub: "alquiler" }, null],
  ["#situacion/alquiler/48020", { view: "situacion", sub: "alquiler" }, null],
  ["#situacion/vacias/48001", { view: "situacion", sub: "vacias" }, null],
  // rutas existentes que no deben cambiar
  ["#situacion", { view: "situacion", sub: null }, null],
  ["#municipios/48020", { view: "municipios", sub: "48020" }, null],
  ["#municipios/48020-48044", { view: "municipios", sub: "48020-48044" }, null],
  ["#medidas/alternativas", { view: "medidas", sub: "alternativas" }, null],
  // redirecciones antiguas (SITEMAP_AS_IS)
  ["#resumen", { view: "situacion", sub: null }, "#situacion"],
  ["#municipio/48020", { view: "municipios", sub: "48020" }, "#municipios/48020"],
  ["#diagnostico", { view: "municipios", sub: null }, "#municipios"],
  ["#comparar/48020-48044", { view: "municipios", sub: "48020-48044" }, "#municipios/48020-48044"],
  ["#compra", { view: "acceso", sub: null }, "#acceso"],
  ["#ideas", { view: "situacion", sub: null }, "#medidas/alternativas"],
  ["#prevencion", { view: "situacion", sub: null }, "https://vizcaya-vivienda.vercel.app/#mapa?modo=alertas"],
  ["#trabajadores", { view: "situacion", sub: null }, "https://vizcaya-vivienda.vercel.app/#horizonte"],
];

let fallos = 0;
for (const [hash, esperado, redir] of casos) {
  const p = parseHash(hash), r = redirectOf(hash);
  // en las direcciones que se redirigen solo importa la redirección (la vista se resuelve después, con la dirección nueva)
  const okP = redir ? true : p.view === esperado.view && p.sub === esperado.sub;
  const okR = r === redir;
  const pass = okP && okR;
  if (!pass) fallos++;
  console.log(`${pass ? "PASS" : "FAIL"} · ${hash} → parseHash ${JSON.stringify(p)} · redirectOf ${JSON.stringify(r)}`);
}
console.log(`\n${casos.length - fallos} PASS, ${fallos} FAIL`);
process.exit(fallos ? 1 : 0);
