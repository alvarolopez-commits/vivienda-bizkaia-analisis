// Desbordes de las seis vistas a la anchura actual de la ventana. En el navegador, con la app abierta (a 1440 y a 1280 px):
//   window.__qaRes = null; import('/_qa/qa-desborde.js').then(m => m.run()).then(r => window.__qaRes = r)
// Para cada vista (y las rutas con comparación, ficha y glosario): la página no desborda en horizontal y ningún texto o control queda fuera
// de la ventana por la derecha (se ignoran los contenedores con desplazamiento propio, como la matriz de Medidas o la de Normas).
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const RUTAS = ["#situacion/alquiler/48020", "#situacion/vacias", "#municipios/48020", "#municipios/48020-48013", "#acceso", "#medidas", "#medidas?rep=matriz&w=3,2,0,0,1&sel=M08,M01", "#medidas/M01-M06-M20", "#medidas?vista=entender", "#normas", "#metodo", "#metodo/glosario"];

export async function run() {
  const out = [];
  const ok = (name, pass, detail = "") => out.push({ name, pass: !!pass, detail: String(detail) });
  const ancho = document.documentElement.clientWidth;
  for (const h of RUTAS) {
    location.hash = h; await sleep(2600);
    const doc = document.documentElement;
    const fuera = [];
    for (const e of document.querySelectorAll("#vista *")) {
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || getComputedStyle(e).position === "fixed") continue;
      if (r.right > ancho + 1 && !e.closest(".table-scroll, .table-wrap, .m-stage, .bandeja, svg, .m-pop")) { fuera.push(`${e.tagName.toLowerCase()}.${String(e.className).split(" ")[0]} (${Math.round(r.right)})`); if (fuera.length > 3) break; }
    }
    ok(`${ancho}px · ${h}: sin desborde horizontal de la página ni controles fuera de la ventana`, doc.scrollWidth <= ancho + 1 && !fuera.length, `scrollWidth ${doc.scrollWidth} / ${ancho}${fuera.length ? ` · ${fuera.join(", ")}` : ""}`);
  }
  const fail = out.filter((t) => !t.pass);
  return { ancho, total: out.length, pass: out.length - fail.length, fail: fail.length, fallos: fail.map((f) => `${f.name} ${f.detail}`), todo: out.map((t) => `${t.pass ? "PASS" : "FAIL"} · ${t.name} (${t.detail})`) };
}
