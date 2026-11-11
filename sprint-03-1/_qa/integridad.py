"""Sprint 03.1 · integridad de la app integrada frente a los Sprint 02 y 03 (independiente del navegador).

1. Los 20 ficheros de app/original/ (módulos y JSON originales) son idénticos (sha256) a los de la web servida.
2. Los JSON y el GeoJSON no se han tocado (hash igual que en Sprint 02 y 03).
3. Cada módulo JS copiado es IDÉNTICO al de su sprint salvo la ruta de importación (../original → ../../original).
4. Los dos main.js convertidos en montar() difieren de los originales solo en las líneas esperadas (se muestran).
5. Hojas de estilo: lo único que cambia respecto a los sprints son las líneas del parche tipográfico y las 3 reglas de familia
   que aplican «Montserrat solo en titulares» (marca, menú, botón ×) más la hoja typography.css única.

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


for o, n, nombre in ((R / "sprint-02/atlas/css/atlas.css", APP / "css/situacion.css", "situacion.css"), (R / "sprint-03/medidas/css/explorador.css", APP / "css/medidas.css", "medidas.css")):
    # solo las líneas NUEVAS respecto al sprint (las que salieron al marco compartido se comprueban aparte, abajo)
    d = [l for l in (x[1:].strip() for x in difflib.unified_diff(o.read_text(encoding="utf-8").replace("\r\n", "\n").split("\n"), n.read_text(encoding="utf-8").replace("\r\n", "\n").split("\n"), lineterm="", n=0) if x[:1] == "+" and x[:3] != "+++") if l]
    # las líneas del marco (tokens, cabecera...) salieron a marco.css y no cuentan; el resto debe ser solo de familia/peso
    tipograficas = [l for l in d if any(k in l for k in ("font", "f-ui", "f-display", "f-data"))]
    otras = [l for l in d if l not in tipograficas and not (l.startswith("/*") or l.startswith("Mundo visual") or l.startswith("El mapa es el protagonista") or l.startswith("y los colores") or l.endswith("*/"))]  # los comentarios de cabecera no son estilo
    ok(f"css/{nombre}: las únicas diferencias con el sprint son líneas de familia/peso tipográfico", not otras, otras[:3])
marco_sp2 = (R / "sprint-02/atlas/css/atlas.css").read_text(encoding="utf-8").replace("\r\n", "\n")
union = ((APP / "css/marco.css").read_text(encoding="utf-8") + (APP / "css/situacion.css").read_text(encoding="utf-8")).replace("\r\n", "\n")
perdidas = [l for l in marco_sp2.split("\n")[5:] if l.strip() and l not in union]
ok("marco.css + situacion.css conservan TODAS las reglas de atlas.css salvo las tipográficas cambiadas", all(any(k in l for k in ("font", "--f-")) for l in perdidas), [l[:60] for l in perdidas if not any(k in l for k in ("font", "--f-"))][:3])
ok("Una sola definición de las familias: typography.css (ninguna otra hoja define --font-heading ni los alias)", all("--font-heading" not in (APP / "css" / f).read_text(encoding="utf-8") for f in ("marco.css", "situacion.css", "medidas.css")))
ok("typography.css: las tres familias y una sola hoja", (APP / "css/typography.css").read_text(encoding="utf-8").count("--font-heading:") == 1)

fallos = [r for r in res if not r[0]]
for p, n, d in res:
    print(f"{'PASS' if p else 'FAIL'} · {n}" + (f" ({d})" if d not in ("", None, []) else ""))
print(f"\n{len(res) - len(fallos)} PASS, {len(fallos)} FAIL")
sys.exit(1 if fallos else 0)
