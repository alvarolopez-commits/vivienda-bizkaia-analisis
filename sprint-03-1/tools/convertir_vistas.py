"""Convierte los main.js de Sprint 02 (Situación) y Sprint 03 (Medidas) en módulos montables de la app integrada.

Solo se cambia de dónde salen el almacén de datos y el DOM, y se registran los oyentes globales para poder quitarlos al salir
de la vista. Cada reemplazo se comprueba (assert): si el original cambia, el script falla en vez de escribir algo distinto.
Ninguna línea de lógica, de cálculo ni de texto se toca.

Uso:  python -I sprint-03-1/tools/convertir_vistas.py
"""
import pathlib
import sys

sys.stdout.reconfigure(encoding="utf-8")
RAIZ = pathlib.Path(__file__).resolve().parents[2]


def aplicar(src, dst, cambios):
    t = (RAIZ / src).read_text(encoding="utf-8").replace("\r\n", "\n")
    for viejo, nuevo in cambios:
        assert t.count(viejo) == 1, f"{src}: no aparece exactamente una vez:\n{viejo[:90]}"
        t = t.replace(viejo, nuevo)
    (RAIZ / dst).write_text(t, encoding="utf-8")
    print("escrito", dst, len(t.splitlines()), "líneas")


# ---------------- Situación (Sprint 02 · Living Atlas) ----------------
aplicar("sprint-02/atlas/js/main.js", "sprint-03-1/app/js/situacion/index.js", [
    ('import { announce, reduced } from "../original/js/comun.js";\nimport { createStore } from "../original/js/store.js";\n',
     'import { announce, reduced } from "../../original/js/comun.js";\n'),
    ('import { el, es, sourceLine, TYPE_COLORS } from "../original/js/ui.js";\nimport { INDICADORES, ranking } from "../original/js/situacion/indicadores.js";\nimport { crearMapa } from "./mapa-atlas.js?v=3";',
     'import { el, es, sourceLine, TYPE_COLORS } from "../../original/js/ui.js";\nimport { INDICADORES, ranking } from "../../original/js/situacion/indicadores.js";\nimport { crearMapa } from "./mapa-atlas.js";'),
    ('const load = async (f) => { const r = await fetch(`original/data/${f}`); if (!r.ok) throw new Error(`${f}: ${r.status}`); return r.json(); };\n', ''),
    ('async function main() {\n  const [municipios, municipiosGeo, meta, resumen, medidas] = await Promise.all(\n    ["municipios.json", "municipios.geojson", "meta.json", "resumen.json", "medidas.json"].map(load));\n  const store = createStore({ municipios, municipiosGeo, meta, resumen, medidas }, load);\n',
     '/** Monta la vista Situación (Living Atlas) en `raiz`. El almacén de datos es el único de la aplicación. */\nexport async function montar(raiz, { store }) {\n  const baja = []; // oyentes globales que hay que quitar al salir de la vista\n  raiz.innerHTML = await (await fetch(new URL("./plantilla.html", import.meta.url))).text();\n'),
    ('  addEventListener("hashchange", () => { const h = fromHash(); if (h && (h.i !== S.i || h.code !== S.code)) set(h); });\n  matchMedia("(min-width: 1100px)").addEventListener("change", () => pintarLista(false));\n',
     '  // el router de la aplicación avisa de los cambios de dirección (alCambiarDireccion); aquí solo el cambio de ancho de pantalla\n  const alCambiarDireccion = () => { const h = fromHash(); if (h && (h.i !== S.i || h.code !== S.code)) set(h); };\n  const mq = matchMedia("(min-width: 1100px)"), alCambiarAncho = () => pintarLista(false);\n  mq.addEventListener("change", alCambiarAncho);\n  baja.push(() => mq.removeEventListener("change", alCambiarAncho));\n'),
    ('  window.__atlas = { S, store, set }; // solo para las pruebas de _qa\n}\n\nmain().catch((err) => {\n  console.error(err);\n  $("#mapa").replaceChildren(el("p", { class: "cargando", text: `No se han podido cargar los datos (${err.message}).` }));\n});\n',
     '  window.__atlas = { S, store, set }; // solo para las pruebas de _qa\n  return { alCambiarDireccion, desmontar: () => { baja.forEach((f) => f()); delete window.__atlas; } };\n}\n'),
])

# ---------------- Medidas (Sprint 03 · Explorador) ----------------
aplicar("sprint-03/medidas/js/main.js", "sprint-03-1/app/js/medidas/index.js", [
    ('import { alternatives } from "../original/js/alternativas.js";\nimport { announce } from "../original/js/comun.js";\nimport { LINE_COLORS } from "../original/js/medidas/burbujas.js";\nimport { createStore } from "../original/js/store.js";\nimport { el, es, pill } from "../original/js/ui.js";',
     'import { alternatives } from "../../original/js/alternativas.js";\nimport { announce } from "../../original/js/comun.js";\nimport { LINE_COLORS } from "../../original/js/medidas/burbujas.js";\nimport { el, es, pill } from "../../original/js/ui.js";'),
    ('const load = async (f) => { const r = await fetch(`original/data/${f}`); if (!r.ok) throw new Error(`${f}: ${r.status}`); return r.json(); };\n', ''),
    ('async function main() {\n  const [medidas, ideas, meta, municipios, municipiosGeo] = await Promise.all(["medidas.json", "ideas.json", "meta.json", "municipios.json", "municipios.geojson"].map(load));\n  const store = createStore({ medidas, ideas, meta, municipios, municipiosGeo }, load);\n',
     '/** Monta la vista Medidas (Explorador) en `raiz`. El almacén de datos es el único de la aplicación. */\nexport async function montar(raiz, { store }) {\n  const baja = []; // oyentes globales que hay que quitar al salir de la vista\n  raiz.innerHTML = await (await fetch(new URL("./plantilla.html", import.meta.url))).text();\n'),
    ('  document.addEventListener("click", (e) => {\n    const a = e.target.closest?.("a[href^=\'#medidas\']");\n    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;\n    e.preventDefault();\n    goto(targetOf(a.getAttribute("href")));\n  });\n',
     '  const alClic = (e) => {\n    const a = e.target.closest?.("a[href^=\'#medidas\']");\n    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;\n    e.preventDefault();\n    goto(targetOf(a.getAttribute("href")));\n  };\n  document.addEventListener("click", alClic);\n  baja.push(() => document.removeEventListener("click", alClic));\n'),
    ('  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && S.focus && S.mode === "explorar" && !e.defaultPrevented && !$("#menu").open) { e.preventDefault(); closePanel(); } });\n',
     '  const alTeclear = (e) => { if (e.key === "Escape" && S.focus && S.mode === "explorar" && !e.defaultPrevented && !$("#menu").open) { e.preventDefault(); closePanel(); } };\n  document.addEventListener("keydown", alTeclear);\n  baja.push(() => document.removeEventListener("keydown", alTeclear));\n'),
    ('(prototipo Sprint 03)`;', '(prototipo integrado)`;'),
    ('  addEventListener("hashchange", onHash);\n  onHash();\n', '  onHash(); // los cambios de dirección los avisa el router de la aplicación (alCambiarDireccion)\n'),
    ('  $("#main").setAttribute("aria-busy", "false");\n', '  $("#medidas").setAttribute("aria-busy", "false");\n'),
    ('  window.__medidas = { app, store, S, render, goto, openPanel, closePanel, toggle, plano, matriz, score, ordered }; // solo para las pruebas de _qa\n}\n\nmain().catch((err) => {\n  console.error(err);\n  $("#v-explorar").replaceChildren(el("p", { class: "aviso-error", text: `No se han podido cargar los datos (${err.message}).` }));\n});\n',
     '  window.__medidas = { app, store, S, render, goto, openPanel, closePanel, toggle, plano, matriz, score, ordered }; // solo para las pruebas de _qa\n  return { alCambiarDireccion: onHash, desmontar: () => { baja.forEach((f) => f()); document.body.classList.remove("con-bandeja"); delete window.__medidas; } };\n}\n'),
])
