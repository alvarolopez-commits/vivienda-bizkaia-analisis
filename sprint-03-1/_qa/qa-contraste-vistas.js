// Contraste WCAG AA (4,5:1 texto normal; 3:1 texto grande) de Municipios, Acceso, Normas y Método. En el navegador, con la app abierta:
//   window.__qaRes = null; import('/_qa/qa-contraste-vistas.js').then(m => m.run()).then(r => window.__qaRes = r)
// Mismo método que qa-contraste.js: el fondo efectivo de cada texto se compone capa a capa desde el más externo; el fondo de partida es el
// peor caso del halo ambiental (en estas vistas no hay halo, así que el resultado es conservador). Los reflejos del vidrio se ignoran (solo aclaran).
const num = (s) => (s.match(/[\d.]+/g) || []).map(Number);
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const comp = (fg, a, bg) => fg.map((c, i) => Math.round(c * a + bg[i] * (1 - a)));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CASOS = {
  "#municipios/48020": [["Cabecera · título", ".lec-titulo h1"], ["Cabecera · frase", ".lec-titulo .sub"], ["Índice · enlace", ".lec-ir:not([aria-current])"], ["Índice · actual", ".lec-ir[aria-current=true]"], ["Índice · rótulo", ".lec-indice-t"],
    ["Selectores · etiqueta", ".elige-muni label"], ["Selectores · valor", ".elige-muni select"], ["Buscador", "#muni-buscar"], ["Perfil · nombre", ".muni-nombre"], ["Perfil · datos", ".muni-datos"],
    ["Bloque · título", ".sec-cab h2"], ["Bloque · frase", ".sec-cab .sub"], ["Indicador · nombre", ".nombre-ind"], ["Indicador · cifra", ".cifra-dot b"], ["Indicador · puesto", ".cifra-dot .puesto"], ["Leyenda de la pista", ".clave-puntos"],
    ["Problema · nombre", ".fila-problema .nombre"], ["Problema · dato", ".fila-problema .dato"], ["Hogares · cabecera", ".tabla .cab > span"], ["Hogares · celda", ".tabla .fila:not(.cab) > span"], ["Hogares · nota", ".hogares .fuente"],
    ["Serie · título", ".serie figcaption"], ["Serie · cifras", ".serie-cifras"], ["Barrios · lista", ".barrios-lista li"], ["Plan · nombre", "a.fila-carta .nombre"], ["Plan · dato", "a.fila-carta .dato"], ["Plan · enlace", "a.fila-carta .ir"]],
  "#municipios/48020-48004": [["Comparador · diferencia", ".cmp-dif b"], ["Comparador · sin diferencia", ".cmp-dif.sin"], ["Comparador · columnas", ".cmp-col"], ["Comparador · cifra", ".cifra-dot b"], ["Comparador · puesto", ".cifra-dot .puesto"],
    ["Comparador · tabla grupo", ".cmp-hogares thead th.grupo"], ["Comparador · tabla municipio", ".cmp-hogares thead th.d0"], ["Comparador · tabla fila", ".cmp-hogares tbody th"], ["Comparador · tabla celda", ".cmp-hogares tbody td"],
    ["Comparador · precio", ".cmp-precio"], ["Comparador · etiqueta", ".cmp-etq"], ["Comparador · chip A", ".cmp-chip.d0"], ["Comparador · chip B", ".cmp-chip.d1"], ["Comparador · acción", ".cmp-acciones .btn"], ["Comparador · contexto", ".ctx-a"]],
  "#acceso": [["Cabecera · título", ".lec-titulo h1"], ["Cabecera · frase", ".lec-titulo .sub"], ["Pestañas · inactiva", ".lec-ir:not([aria-current])"], ["Pestañas · activa", ".lec-ir[aria-current=true]"],
    ["Alquiler · municipio", ".pesa-nombre"], ["Alquiler · cifra", ".pesa-cifra"], ["Alquiler · leyenda", ".clave-puntos"], ["Escalera · cabecera", ".esc-fila.cab span"], ["Escalera · hogar", ".esc-fila:not(.cab) > span:first-child"], ["Escalera · paso", ".paso-e"],
    ["Veredicto · Cabe", ".paso-e.bien .veredicto"], ["Veredicto · No cabe", ".paso-e.mal .veredicto"], ["Veredicto · Depende", ".paso-e.depende .veredicto"],
    ["Supuestos · «Lo que eliges»", ".x-lado-t"], ["Supuestos · etiqueta", ".x-etq"], ["Supuestos · opción", ".x-controles .opcion:not([aria-pressed=true])"], ["Supuestos · opción elegida", ".x-controles .opcion[aria-pressed=true]"], ["Supuestos · selector", "#x-lugar"],
    ["Supuestos fijos · título", ".x-fijos-t"], ["Supuestos fijos · texto", ".x-fijos li"], ["Resultado · cifra", ".x-num:not(.mal)"], ["Resultado · cifra con aviso", ".x-num.mal"], ["Resultado · explicación", ".x-lab"], ["Rejilla · cabecera", ".rj-fila > span"],
    ["Rejilla · casilla", ".rj-casilla:not(.mal):not([aria-pressed=true])"], ["Rejilla · casilla larga", ".rj-casilla.mal:not([aria-pressed=true])"], ["Rejilla · casilla elegida", ".rj-casilla[aria-pressed=true]"], ["Alcance · total", ".alcance-total"], ["Alcance · leyenda", ".alcance-clave li"], ["Fuente", ".fuente"]],
  "#normas": [["Cabecera · título", ".lec-titulo h1"], ["Cabecera · frase", ".lec-titulo .sub"], ["Cabecera · fecha", ".lec-estado"], ["Pestañas · inactiva", ".lec-ir:not([aria-current])"], ["Pestañas · activa", ".lec-ir[aria-current=true]"],
    ["Niveles · opción", ".opcion:not([aria-pressed=true])"], ["Niveles · elegido", ".opcion[aria-pressed=true]"], ["Matriz · cuenta", ".comp-cuenta"], ["Matriz · cabecera", ".comp-fila.cab span"], ["Matriz · instrumento", ".comp-instr"], ["Matriz · leyenda", ".clave-puntos"],
    ["Cronología · fecha", ".hito-fecha"], ["Cronología · texto", ".hito:not(.pendiente) .hito-texto"], ["Cronología · pendiente (texto)", ".hito.pendiente .hito-texto"], ["Cronología · rótulo «Pendiente»", ".hito-pend"], ["Margen · cifra", ".margen-cifra"], ["Margen · texto", ".margen p:not(.margen-cifra)"], ["Margen · botón", "a.pildora"], ["Fuente", ".fuente"]],
  "#metodo": [["Cabecera · título", ".lec-titulo h1"], ["Cabecera · frase", ".lec-titulo .sub"], ["Buscador", "#glos-buscar"], ["Índice · grupo", ".lec-grupo"], ["Índice · enlace", ".lec-ir:not([aria-current])"], ["Índice · actual", ".lec-ir[aria-current=true]"],
    ["Bloque · rótulo", ".lec-kicker"], ["Bloque · título", ".method-block > h2"], ["Bloque · texto", ".method-block > p"], ["Glosario · cuenta", ".glos-cuenta"], ["Glosario · término", "dl.glossary dt"], ["Glosario · definición", "dl.glossary dd"],
    ["Lista · punto", ".limitations li"], ["Subtítulo de historial", ".method-sub"], ["Fuentes · nombre", ".source h3"], ["Fuentes · nota", ".note"], ["Etiqueta de cifra", ".pill"]],
};

export async function run() {
  const out = [];
  const ok = (name, pass, detail = "") => out.push({ name, pass: !!pass, detail: String(detail) });
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const PEOR = comp(hex("#8bcdff"), 0.34, hex(bg));
  const efectivo = (el) => {
    const act = el.closest('[aria-pressed="true"], [aria-current="page"], [aria-current="true"]'); // el elegido va sobre la píldora oscura (.lente)
    if (act && act.parentElement?.classList.contains("con-lente")) return hex(getComputedStyle(document.documentElement).getPropertyValue("--ink").trim());
    const cadena = []; for (let n = el; n && n.nodeType === 1; n = n.parentElement) cadena.unshift(n);
    let fondo = PEOR;
    for (const n of cadena) { const m = getComputedStyle(n).backgroundColor; if (!m || m === "transparent") continue; const v = num(m); const a = v.length > 3 ? v[3] : 1; if (a > 0) fondo = comp(v.slice(0, 3), a, fondo); }
    return fondo;
  };
  for (const [hash, casos] of Object.entries(CASOS)) {
    location.hash = hash; await sleep(2600);
    const vista = hash.split("/")[0].slice(1);
    for (const [nombre, sel] of casos) {
      const els = [...document.querySelectorAll(sel)].filter((e) => e.offsetParent !== null || getComputedStyle(e).position === "fixed");
      if (!els.length) { ok(`${vista} · ${nombre}`, false, `no encontrado: ${sel}`); continue; }
      let peor = 99, info = "";
      for (const e of els.slice(0, 40)) {
        const cs = getComputedStyle(e); const fgv = num(cs.color); const a = fgv.length > 3 ? fgv[3] : 1;
        const fondo = efectivo(e); const fg = comp(fgv.slice(0, 3), a, fondo);
        const px = parseFloat(cs.fontSize), grande = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
        const r = ratio(fg, fondo), minimo = grande ? 3 : 4.5;
        if (r - minimo < peor) { peor = r - minimo; info = `${r.toFixed(2)}:1 (mín. ${minimo}) ${px}px`; }
      }
      ok(`${vista} · ${nombre}`, peor >= 0, info);
    }
  }
  const fail = out.filter((t) => !t.pass);
  return { total: out.length, pass: out.length - fail.length, fail: fail.length, fallos: fail.map((f) => `${f.name} ${f.detail}`), todo: out.map((t) => `${t.pass ? "PASS" : "FAIL"} · ${t.name} (${t.detail})`) };
}
