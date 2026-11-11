// Design System · contraste WCAG AA de los textos sobre superficies de vidrio (y opacas) de Situación. En el navegador, con la app abierta en
//   http://localhost:4179/#situacion/alquiler/48020
//   window.__qaRes = null; import('/_qa/qa-contraste.js').then(m => m.run()).then(r => window.__qaRes = r)
// Método: para cada texto se calcula el fondo efectivo recorriendo sus ancestros desde el más externo y componiendo cada capa con
// su alfa. El fondo de partida es el PEOR caso del fondo ambiental (el máximo de azul, la zona más oscura bajo el vidrio). Los reflejos
// (degradados blancos del vidrio) se ignoran: solo aclaran, así que el resultado es conservador. Mínimo: 4,5:1 (texto normal) y 3:1
// (texto grande: ≥ 24 px, o ≥ 18,66 px en negrita). Los textos se agrupan por selector y se comprueba el peor de cada uno.
const num = (s) => (s.match(/[\d.]+/g) || []).map(Number);
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const comp = (fg, a, bg) => fg.map((c, i) => Math.round(c * a + bg[i] * (1 - a)));

export async function run() {
  const out = [];
  const ok = (name, pass, detail = "") => out.push({ name, pass: !!pass, detail: String(detail) });
  const raiz = getComputedStyle(document.documentElement);
  const bg = raiz.getPropertyValue("--bg").trim();
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const PEOR = comp(hex("#8bcdff"), 0.34, hex(bg)); // el máximo de azul del fondo ambiental, bajo el vidrio
  const efectivo = (el) => {
    const cadena = []; for (let n = el; n && n.nodeType === 1; n = n.parentElement) cadena.unshift(n);
    let fondo = PEOR;
    for (const n of cadena) {
      const m = getComputedStyle(n).backgroundColor; if (!m || m === "transparent") continue;
      const v = num(m); const a = v.length > 3 ? v[3] : 1; if (a > 0) fondo = comp(v.slice(0, 3), a, fondo);
    }
    return fondo;
  };
  const casos = [
    ["Cabecera · pestaña inactiva", ".vistas a:not([aria-current])"], ["Cabecera · pestaña activa", '.vistas a[aria-current="page"]'], ["Cabecera · marca", ".marca"],
    ["Cabecera · enlace Resumen", ".enlace-ext"], ["Cabecera · Ver el radar", ".banda .btn"],
    ["Selector · título", ".problema .p1"], ["Selector · subtítulo", ".problema .p2"], ["Selector · activo (título)", '.problema[aria-pressed="true"] .p1'], ["Selector · activo (subtítulo)", '.problema[aria-pressed="true"] .p2'],
    ["Controles del mapa · Restablecer", ".herr-texto"],
    ["Panel · rótulo", ".ficha-tipo"], ["Panel · nombre", ".ficha-muni"], ["Panel · meta", ".ficha-meta"], ["Panel · fuente", ".source-line, .fuente"], ["Panel · «Sus cinco problemas»", ".perfil-t"],
    ["Panel · botón Ver su ficha", ".btn.primary.ir"], ["Panel · cabecera del ranking", ".lista-cab h2"], ["Panel · buscador (texto)", "#buscar"], ["Panel · filtro de tipo", "#tipo"],
    ["Ficha · cifra", ".ficha-valor"], ["Ficha · indicador", ".ficha-ind"], ["Ficha · puesto", ".ficha-puesto"], ["Perfil · nombre", ".perfil-n"], ["Perfil · valor", ".perfil-v"],
    ["Ranking · nombre", ".fila .n"], ["Ranking · valor", ".fila .v"], ["Ranking · posición", ".fila .pos"], ["Leyenda · rampa", ".leyenda"], ["Leyenda · cobertura", ".cobertura"], ["Título del indicador", ".ind-titulo"],
  ];
  for (const [nombre, sel] of casos) {
    const els = [...document.querySelectorAll(sel)].filter((e) => e.offsetParent !== null || getComputedStyle(e).position === "fixed");
    if (!els.length) { ok(`Contraste · ${nombre}`, false, `no encontrado: ${sel}`); continue; }
    let peor = 99, info = "";
    for (const e of els.slice(0, 12)) {
      const cs = getComputedStyle(e); const fgv = num(cs.color); const a = fgv.length > 3 ? fgv[3] : 1;
      const fondo = efectivo(e); const fg = comp(fgv.slice(0, 3), a, fondo);
      const px = parseFloat(cs.fontSize), grande = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
      const r = ratio(fg, fondo); const minimo = grande ? 3 : 4.5;
      if (r - minimo < peor) { peor = r - minimo; info = `${r.toFixed(2)}:1 (mín. ${minimo}) ${px}px`; }
    }
    ok(`Contraste · ${nombre}`, peor >= 0, info);
  }
  // el placeholder del buscador (color por defecto del navegador) también debe cumplir
  const ph = document.querySelector("#buscar"); const pc = getComputedStyle(ph, "::placeholder").color; const pv = num(pc);
  { const fondo = efectivo(ph.parentElement); const fg = comp(pv.slice(0, 3), pv.length > 3 ? pv[3] : 1, fondo); const r = ratio(fg, fondo); ok("Contraste · placeholder del buscador", r >= 4.5, `${r.toFixed(2)}:1`); }
  const fail = out.filter((t) => !t.pass);
  return { total: out.length, pass: out.length - fail.length, fail: fail.length, fallos: fail.map((f) => `${f.name} ${f.detail}`), todo: out.map((t) => `${t.pass ? "PASS" : "FAIL"} · ${t.name} (${t.detail})`) };
}
