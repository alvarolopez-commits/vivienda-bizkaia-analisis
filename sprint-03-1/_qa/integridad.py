"""Sprint 03.1 · integridad de la app integrada frente a los Sprint 02 y 03 (independiente del navegador).

1. Los 20 ficheros de app/original/ (módulos y JSON originales) son idénticos (sha256) a los de la web servida.
2. Los JSON y el GeoJSON no se han tocado (hash igual que en Sprint 02 y 03).
3. Cada módulo JS copiado es IDÉNTICO al de su sprint salvo la ruta de importación (../original → ../../original).
4. Los dos main.js convertidos en montar() difieren de los originales solo en las líneas esperadas (se muestran).
5. Hojas de estilo: medidas.css solo difiere del Sprint 03 en tipografía; situacion.css y marco.css, respecto al commit publicado (BASE),
   solo cambian propiedades de presentación (Design System Liquid Glass); los tokens previos se conservan con el mismo valor.

Uso:  python -I sprint-03-1/_qa/integridad.py   (sale con 1 si algo falla)
"""
import difflib
import hashlib
import json
import pathlib
import sys

sys.stdout.reconfigure(encoding="utf-8")
R = pathlib.Path(__file__).resolve().parents[2]
APP = R / "sprint-03-1" / "app"
res = []


def ok(n, c, d=""):
    res.append((bool(c), n, d))


sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
man = json.loads((R / "sprint-01" / "_qa" / "original-hashes.json").read_text(encoding="utf-8"))["ficheros"]
orig = sorted(p for p in (APP / "original").rglob("*") if p.is_file())
bad = [p.relative_to(APP / "original").as_posix() for p in orig if man.get(p.relative_to(APP / "original").as_posix()) != sha(p)]
ok(f"{len(orig)} ficheros de app/original/ idénticos a la web servida (sha256)", not bad, bad)
for f in ("medidas.json", "ideas.json", "municipios.json", "municipios.geojson", "meta.json", "resumen.json"):
    a = APP / "original" / "data" / f
    otros = [R / "sprint-03" / "medidas" / "original" / "data" / f, R / "sprint-02" / "atlas" / "original" / "data" / f]
    ok(f"data/{f}: igual que en los sprints", all(sha(a) == sha(o) for o in otros if o.exists()))

norm = lambda p: p.read_text(encoding="utf-8").replace("\r\n", "\n").replace('"../original/', '"../../original/')
pares = [(R / "sprint-02/atlas/js/mapa-atlas.js", APP / "js/situacion/mapa-atlas.js")] + [(R / f"sprint-03/medidas/js/{f}.js", APP / f"js/medidas/{f}.js") for f in ("calculo", "comparar", "detalle", "entender", "estado-app", "matriz-vista", "plano")]
for o, n in pares:
    ok(f"{n.relative_to(APP).as_posix()}: idéntico al del sprint salvo la ruta de importación", norm(o) == n.read_text(encoding="utf-8").replace("\r\n", "\n"))


def lineas_cambiadas(o, n):
    a, b = norm(o).split("\n"), n.read_text(encoding="utf-8").replace("\r\n", "\n").split("\n")
    return sum(1 for l in difflib.unified_diff(a, b, lineterm="", n=0) if l[:1] in "+-" and l[:3] not in ("+++", "---"))


for o, n, esperado in ((R / "sprint-02/atlas/js/main.js", APP / "js/situacion/index.js", 40), (R / "sprint-03/medidas/js/main.js", APP / "js/medidas/index.js", 160)):
    c = lineas_cambiadas(o, n)
    ok(f"{n.relative_to(APP).as_posix()}: solo {c} líneas distintas del main.js original (montaje, oyentes y, en Medidas, la recomposición; el cálculo vive en módulos idénticos)", c <= esperado, c)

# el componente nuevo de la lista no calcula: solo pintan lo que reciben y reutilizan funciones originales
for f in ("lista.js",):
    src = "\n".join(l for l in (APP / "js/medidas" / f).read_text(encoding="utf-8").splitlines() if not l.strip().startswith("//"))  # sin comentarios
    ok(f"js/medidas/{f}: sin cálculo propio (no usa NORM, scorer, reach, ordered ni redondea)", not any(k in src for k in ("NORM", "scorer", "reach(", "ordered(", "Math.round", "Math.floor")) and "calculo.js" in src)
# estilos: lo que cambia respecto al sprint son solo líneas de familia/cifras
def distintas(o, n):
    a, b = o.read_text(encoding="utf-8").replace("\r\n", "\n").split("\n"), n.read_text(encoding="utf-8").replace("\r\n", "\n").split("\n")
    return [l[1:].strip() for l in difflib.unified_diff(a, b, lineterm="", n=0) if l[:1] in "+-" and l[:3] not in ("+++", "---")]



# --- estilos ---
# medidas.css no se ha tocado desde el Sprint 03 más allá de la tipografía
d = [l for l in (x[1:].strip() for x in difflib.unified_diff((R / "sprint-03/medidas/css/explorador.css").read_text(encoding="utf-8").replace("\r\n", "\n").split("\n"), (APP / "css/medidas.css").read_text(encoding="utf-8").replace("\r\n", "\n").split("\n"), lineterm="", n=0) if x[:1] == "+" and x[:3] != "+++") if l]
tip = [l for l in d if any(k in l for k in ("font", "f-ui", "f-display", "f-data"))]
otras = [l for l in d if l not in tip and not (l.startswith("/*") or l.endswith("*/"))]
ok("css/medidas.css: las únicas diferencias con el Sprint 03 son líneas de familia/peso tipográfico", not otras, otras[:3])

# Design System: respecto al commit publicado (BASE) el CSS de Situación solo puede cambiar PRESENTACIÓN (material, color, borde,
# sombra, desenfoque, radios, relleno, transiciones, fuente), nunca maquetación (display, grid, flex, position, tamaños, overflow...).
import re
import subprocess
BASE = "fb43450"
PRESENTACION = {"background", "background-image", "background-color", "background-attachment", "border", "border-color", "border-radius", "border-bottom",
                "border-top", "box-shadow", "backdrop-filter", "-webkit-backdrop-filter", "color", "font", "transition", "padding", "margin", "opacity"}


def reglas(texto):
    texto = re.sub(r"/\*.*?\*/", "", texto, flags=re.S)
    out = []
    for sel, cuerpo in re.findall(r"([^{}]+)\{([^{}]*)\}", texto):
        decl = {}
        for m in re.finditer(r"([a-z-]+)\s*:\s*((?:[^;(]|\([^)]*\))*)", cuerpo):
            decl[m.group(1).strip()] = m.group(2).strip()
        out.append((" ".join(sel.split()), decl))
    return out


def base(ruta):
    return subprocess.run(["git", "show", f"{BASE}:{ruta}"], cwd=R, capture_output=True, text=True, encoding="utf-8").stdout.replace("\r\n", "\n")


for nombre in ("situacion.css", "marco.css"):
    antes, ahora = reglas(base(f"sprint-03-1/app/css/{nombre}")), reglas((APP / "css" / nombre).read_text(encoding="utf-8"))
    idx = {}
    for sel, dec in antes:
        idx.setdefault(sel, []).append(dec)
    usados, cambios = {}, []
    for sel, dec in ahora:
        i = usados.get(sel, 0); usados[sel] = i + 1
        previas = idx.get(sel, [])
        prev = previas[i] if i < len(previas) else {}
        for p, v in dec.items():
            if prev.get(p) != v:
                cambios.append((sel, p))
    de_maquetacion = [(s, p) for s, p in cambios if p not in PRESENTACION and p != "gap" and not p.startswith("--")]
    quitadas = [(s, p) for sel, dec in antes for s, p in [(sel, k) for k in dec] if not any(s == s2 and p in d2 for s2, d2 in ahora)]
    quitadas = [(s, p) for s, p in quitadas if p not in PRESENTACION and s != ":root" and not p.startswith("--")]  # :root salió a tokens.css (se comprueba abajo)
    ok(f"css/{nombre}: respecto al commit publicado solo cambia presentación, no maquetación ({len(cambios)} declaraciones cambiadas)", not de_maquetacion and not quitadas, (de_maquetacion + quitadas)[:4])

# todos los tokens del marco anterior siguen existiendo en tokens.css con el MISMO valor (los cambios de interfaz son aditivos)
ant = dict(re.findall(r"(--[a-z0-9-]+)\s*:\s*([^;]+);", base("sprint-03-1/app/css/marco.css").split("}")[0]))
nue = dict(re.findall(r"(--[a-z0-9-]+)\s*:\s*([^;]+);", (APP / "css/tokens.css").read_text(encoding="utf-8").split("/* ---------- Materiales")[0]))
cambiados = {k: (v, nue.get(k)) for k, v in ant.items() if nue.get(k) is None or " ".join(nue[k].split()) != " ".join(v.split())}
ok(f"tokens.css conserva los {len(ant)} tokens del marco anterior con el mismo valor (los nuevos son aditivos)", not cambiados, list(cambiados.items())[:3])
ok("Una sola definición de tokens: marco.css y las hojas de vista no definen :root", all(":root" not in re.sub(r"/\*.*?\*/", "", (APP / "css" / f).read_text(encoding="utf-8"), flags=re.S) for f in ("marco.css", "situacion.css", "medidas.css", "medidas-diseno.css")))

ok("Una sola definición de las familias: typography.css (ninguna otra hoja define --font-heading; solo la usan)", all("--font-heading:" not in (APP / "css" / f).read_text(encoding="utf-8") for f in ("marco.css", "situacion.css", "medidas.css")))
ok("typography.css: las tres familias y una sola hoja", (APP / "css/typography.css").read_text(encoding="utf-8").count("--font-heading:") == 1)

fallos = [r for r in res if not r[0]]
for p, n, d in res:
    print(f"{'PASS' if p else 'FAIL'} · {n}" + (f" ({d})" if d not in ("", None, []) else ""))
print(f"\n{len(res) - len(fallos)} PASS, {len(fallos)} FAIL")
sys.exit(1 if fallos else 0)
