"""Recompone la vista Medidas de la app integrada en las dos propuestas de layout (A · Escenario, B · Mesa).

Solo cambia la composición: dónde van los filtros (cinta con revelado progresivo), el escenario (Plano/Matriz), la ficha
(panel lateral con lista en A, franja inferior y cajón en B) y la bandeja. El estado, los filtros, los pesos, el Plano, la
Matriz, el comparador, la URL y todos los cálculos son los del Sprint 03, sin tocar. Cada reemplazo se comprueba (assert).

Uso:  python -I sprint-03-1/tools/componer_disenos.py
"""
import pathlib
import sys

sys.stdout.reconfigure(encoding="utf-8")
F = pathlib.Path(__file__).resolve().parents[1] / "app" / "js" / "medidas" / "index.js"
t = F.read_text(encoding="utf-8").replace("\r\n", "\n")


def r(viejo, nuevo):
    global t
    assert t.count(viejo) == 1, f"no aparece exactamente una vez:\n{viejo[:100]}"
    t = t.replace(viejo, nuevo)


r('import { crearPlano } from "./plano.js";\n', 'import { crearPlano } from "./plano.js";\nimport { crearLista } from "./lista.js";\nimport { crearInspector } from "./inspector.js";\n')
r('  const score = scorer(store, { get weights() { return S.w; } });\n',
  '  const score = scorer(store, { get weights() { return S.w; } });\n'
  '  // las dos propuestas de composición: ?diseno=a (Escenario) o ?diseno=b (Mesa); el estado y la lógica son los mismos\n'
  '  const diseno = new URLSearchParams(location.search).get("diseno") === "b" ? "b" : "a";\n'
  '  $("#medidas").dataset.diseno = diseno;\n'
  '  let cajon = false; // propuesta B: el cajón con la ficha completa\n')
r('  const closePanel = () => {\n    S.focus = null;\n',
  '  const closePanel = () => {\n    if (diseno === "b" && cajon) { cajon = false; render(); return; } // en B, el primer Esc o × cierra el cajón y conserva la medida\n    S.focus = null;\n')
r('    S.focus = id;\n    render();\n    panel.node.querySelector("h2")?.focus();\n',
  '    S.focus = id;\n    render();\n    (diseno === "b" ? inspector.node : panel.node).querySelector("h2")?.focus();\n')
r('!e.defaultPrevented && !$("#menu").open) {', '!e.defaultPrevented && !$("#menu").open && !document.querySelector(".m-pop:not([hidden])")) {')
r('  $("#v-explorar").replaceChildren(repHead, el("div", { class: "rep-titulo" }, [repH2, repSub]), vacio, repBox);\n',
  '  $("#v-explorar").replaceChildren(el("div", { class: "m-stage" }, [repHead, el("div", { class: "rep-titulo" }, [repH2, repSub]), vacio, repBox]));\n')
r('title: k ? M.lineas[k] : null, text: t });\n    b.addEventListener("click", () => { S.f.linea = k;',
  'title: k ? M.lineas[k] : null }, [el("span", { class: "t", text: t }), el("span", { class: "n", "aria-hidden": "true" })]);\n    b.addEventListener("click", () => { S.f.linea = k;')
r('''  filtros.replaceChildren(
    el("h2", { class: "f-titulo", text: "Criterios" }),
    el("p", { class: "note", "data-propuesta": "", text: "Se aplican al Plano y a la Matriz." }),
    el("div", { class: "campo" }, [el("span", { class: "field-label", id: "f-linea-t", text: "Línea de actuación" }), el("div", { class: "x-botones filtro-lineas", role: "group", "aria-labelledby": "f-linea-t" }, lineBtns)]),
    selects.mecanismo.node, selects.decide.node, selects.papel.node, yaBtn, quitarFiltros, pesosAviso, pesosBox,
  );
''', '''  // cinta de criterios con revelado progresivo: la línea y «aplicables ya» a la vista; el resto, en dos desplegables
  const masBadge = el("span", { class: "n", "aria-hidden": "true" }), pesosBadge = el("span", { class: "n", "aria-hidden": "true" });
  const masBtn = el("button", { type: "button", class: "opcion", "aria-expanded": "false", "aria-controls": "m-mas", "aria-haspopup": "true" }, [el("span", { class: "t", text: "Más criterios" }), masBadge]);
  const masCaja = el("div", { class: "m-pop", id: "m-mas", hidden: true, role: "group", "aria-label": "Más criterios" }, [el("p", { class: "note", "data-propuesta": "", text: "Se aplican al Plano y a la Matriz." }), selects.mecanismo.node, selects.decide.node, selects.papel.node, quitarFiltros]);
  const pesosBtn = el("button", { type: "button", class: "opcion", "aria-expanded": "false", "aria-controls": "m-pesos", "aria-haspopup": "true" }, [el("span", { class: "t", text: "Prioridades" }), pesosBadge]);
  const pesosCaja = el("div", { class: "m-pop m-pop-pesos", id: "m-pesos", hidden: true, role: "group", "aria-label": "Ordenar según tus prioridades" }, [pesosBox]);
  const pesosWrap = el("div", { class: "m-pop-wrap" }, [pesosBtn, pesosCaja]);
  const pops = [[masBtn, masCaja], [pesosBtn, pesosCaja]];
  const cerrarPops = () => pops.forEach(([b, c]) => { c.hidden = true; b.setAttribute("aria-expanded", "false"); });
  pops.forEach(([b, c]) => b.addEventListener("click", () => { const abrir = c.hidden; cerrarPops(); c.hidden = !abrir; b.setAttribute("aria-expanded", String(abrir)); }));
  const alPulsar = (e) => { if (!e.target.closest?.(".m-pop-wrap")) cerrarPops(); };
  const alEscape = (e) => { if (e.key === "Escape" && pops.some(([, c]) => !c.hidden)) { e.preventDefault(); const abierto = pops.find(([, c]) => !c.hidden)[0]; cerrarPops(); abierto.focus(); } };
  document.addEventListener("pointerdown", alPulsar);
  document.addEventListener("keydown", alEscape);
  baja.push(() => { document.removeEventListener("pointerdown", alPulsar); document.removeEventListener("keydown", alEscape); });
  filtros.replaceChildren(
    el("div", { class: "m-lineas", role: "group", "aria-labelledby": "f-linea-t" }, [el("span", { class: "sr-only", id: "f-linea-t", text: "Línea de actuación" }), ...lineBtns]),
    el("div", { class: "m-ctrl" }, [yaBtn, el("div", { class: "m-pop-wrap" }, [masBtn, masCaja]), pesosWrap, pesosAviso]),
  );
''')
r('      lineBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.linea === S.f.linea)));\n',
  '      lineBtns.forEach((b) => {\n        b.setAttribute("aria-pressed", String(b.dataset.linea === S.f.linea));\n        const k = b.dataset.linea, n = M.medidas.filter((m) => app.passes(m, { ...S.f, linea: k })).length; // cuántas quedarían con esa línea y los demás criterios\n        b.querySelector(".n").textContent = String(n);\n        b.setAttribute("aria-label", `${k ? lineName(store, k) : "Todas"}, ${n} medidas`);\n      });\n      const nMas = ["mecanismo", "decide", "papel"].filter((k) => S.f[k]).length;\n      masBadge.textContent = nMas ? String(nMas) : "";\n      pesosBadge.textContent = app.weighted() ? "●" : "";\n')
r('      pesosBox.hidden = S.rep !== "matriz";\n', '      pesosWrap.hidden = S.rep !== "matriz";\n')
r('      // panel contextual\n      panel.node.hidden = !S.focus;\n      if (S.focus) panel.render(S.focus);\n    } else {\n      panel.node.hidden = true;\n    }\n',
  '''      // ficha: A, panel lateral con la lista; B, franja inferior y cajón con la ficha completa
      panel.node.hidden = !(diseno === "b" ? S.focus && cajon : S.focus);
      if (S.focus) panel.render(S.focus);
      side.hidden = diseno !== "a"; dock.hidden = diseno !== "b";
      if (diseno === "a") {
        resumen.hidden = Boolean(S.focus);
        resumenCuenta.textContent = `${es(vis.length)} de ${es(total)} medidas`;
        resumenYa.textContent = `${es(vis.filter((m) => m.viabilidad === "instrumento_existente").length)} se pueden aplicar ya`;
        lista.update({ list, weighted, sel, focus: S.focus });
        lista.node.hidden = S.rep === "matriz";
      } else {
        inspector.render(S.focus);
      }
    } else {
      panel.node.hidden = true; side.hidden = true; dock.hidden = true;
    }
''')
r('''  // el panel vive dentro de la rejilla, a la derecha del escenario
  $(".shell").append(panel.node);
''', '''  // ---------- composición de las dos propuestas ----------
  const lista = crearLista({ onOpen: openPanel, onToggle: toggle, isFull });
  const resumenCuenta = el("p", { class: "m-resumen-cifra" }), resumenYa = el("p", { class: "m-resumen-sub" });
  const resumen = el("div", { class: "m-resumen" }, [el("p", { class: "ficha-rotulo", "data-propuesta": "", text: "El conjunto a la vista" }), resumenCuenta, resumenYa,
    el("p", { class: "m-resumen-pista", "data-propuesta": "", text: "Elige una medida en el Plano, en la tabla o en la lista para ver su ficha." })]);
  const side = el("aside", { class: "m-side", "aria-label": "Medida elegida y lista de medidas" }, [resumen, panel.node, lista.node]);
  const inspector = crearInspector(store, { onToggle: toggle, onFicha: () => { cajon = true; render(); panel.node.querySelector("h2")?.focus(); }, hrefFicha: (id) => `#medidas/${id}`, isFull, isSel: (id) => S.sel.includes(id), outside: (id) => !app.passes(store.measures[id]) });
  const dock = el("div", { class: "m-dock", hidden: true }, [inspector.node]);
  if (diseno === "a") $(".shell").append(side);
  else { $("#medidas").append(panel.node, dock); } // el panel es el cajón (a la derecha, no modal)
  const disenos = el("div", { class: "m-disenos", role: "group", "aria-label": "Propuesta de composición", "data-propuesta": "" }, [el("span", { text: "Composición" }),
    ...["a", "b"].map((k) => { const b = el("button", { type: "button", "aria-pressed": String(diseno === k), text: k === "a" ? "A · Escenario" : "B · Mesa" }); b.addEventListener("click", () => { const u = new URL(location.href); u.searchParams.set("diseno", k); location.assign(u); }); return b; })]);
  $("#medidas").append(disenos);
''')
F.write_text(t, encoding="utf-8")
print("recompuesto", F.name, len(t.splitlines()), "líneas")
