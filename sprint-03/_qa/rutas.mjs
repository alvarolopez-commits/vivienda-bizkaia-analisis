// Sprint 03 · las direcciones de Medidas contra el router ORIGINAL (original/js/rutas.js, copia sin cambios de la web servida).
// Comprueba que la query de contexto (#medidas?linea=oferta&w=...) no cambia cómo el router original entiende la dirección y que
// las direcciones antiguas siguen redirigiéndose igual. Uso: node sprint-03/_qa/rutas.mjs   (sale con 1 si algo falla)
import { parseHash, redirectOf } from "../medidas/original/js/rutas.js";

const base = ["#medidas", "#medidas/M06", "#medidas/M01-M06", "#medidas/M01-M06-M20", "#medidas/alternativas", "#medidas/M34", "#medidas/zzz"];
const queries = ["", "?rep=matriz", "?linea=oferta&mec=limita&dec=ayuntamiento&bm30=facilita&ya=1", "?w=0,2,0,0,3&sel=M01,M06", "?vista=entender&tab=decide&ld=oferta&l=turistica", "?vista=comparar"];
let fallos = 0, n = 0;
const check = (name, pass, det = "") => { n++; if (!pass) fallos++; console.log(`${pass ? "PASS" : "FAIL"} · ${name}${det ? ` (${det})` : ""}`); };
for (const b of base) {
  const ref = JSON.stringify(parseHash(b)), refR = redirectOf(b);
  const bad = queries.filter((q) => JSON.stringify(parseHash(b.split("?")[0] + q)) !== ref || redirectOf(b + q) !== refR);
  check(`${b} + 6 formas de query: el router original lo entiende igual`, bad.length === 0, bad.join(" "));
  const p = parseHash(b);
  check(`${b} → vista «${p.view}»${p.sub ? ` · ${p.sub}` : ""} sin redirección`, p.view === "medidas" && redirectOf(b) === null);
}
// direcciones antiguas que no deben cambiar (SITEMAP_AS_IS)
const antiguas = { "#ideas": "#medidas/alternativas", "#compra": "#acceso", "#resumen": "#situacion", "#municipio/48020": "#municipios/48020" };
for (const [from, to] of Object.entries(antiguas)) check(`Redirección antigua ${from} → ${to}`, redirectOf(from) === to, redirectOf(from));
check("#ideas con query sigue yendo a las alternativas", redirectOf("#ideas?rep=matriz") === "#medidas/alternativas");
console.log(`\n${n - fallos} PASS, ${fallos} FAIL`);
process.exit(fallos ? 1 : 0);
