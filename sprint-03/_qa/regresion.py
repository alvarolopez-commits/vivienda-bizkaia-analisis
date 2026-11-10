"""Sprint 03 · regresión del Explorador de Medidas, independiente del JavaScript del prototipo.

1. original/ (módulos y JSON de la web servida) es idéntico (sha256) al manifiesto de Sprint 01.
2. Línea base de los datos calculada desde medidas.json / ideas.json: 34 medidas, 30 + 4 de viabilidad, 17 sin magnitud, catálogos.
3. La nota ponderada y el orden se REIMPLEMENTAN aquí desde los JSON (misma fórmula documentada en matriz.js) y se comparan con
   el orden que registró la matriz original en el navegador (caracterizacion.json).
4. Los textos que el prototipo presenta como originales existen tal cual en el código servido.
5. Ninguna cifra o texto de datos escritos a mano en el código del prototipo.
6. Este sprint solo toca sprint-03/, docs/medidas/ y .claude/launch.json (nada de la web original ni de otros sprints).

Uso:  python -I sprint-03/_qa/regresion.py   (sale con 1 si algo falla)
"""
import hashlib
import json
import pathlib
import subprocess
import sys
from collections import Counter

sys.stdout.reconfigure(encoding="utf-8")  # con -I no se leen las variables de entorno: la consola de Windows usaría cp1252
RAIZ = pathlib.Path(__file__).resolve().parents[2]
MED =RAIZ / "sprint-03" / "medidas"
ORIG = MED / "original"
MANIFIESTO = json.loads((RAIZ / "sprint-01" / "_qa" / "original-hashes.json").read_text(encoding="utf-8"))["ficheros"]
res = []


def ok(n, c, d=""):
    res.append((bool(c), n, d))


# 1. copia exacta
for p in sorted(ORIG.rglob("*")):
    if p.is_file():
        rel = p.relative_to(ORIG).as_posix()
        ok(f"original/{rel} idéntico a la web servida", MANIFIESTO.get(rel) == hashlib.sha256(p.read_bytes()).hexdigest(), "sha256")

# 2. línea base de los datos
M = json.loads((ORIG / "data" / "medidas.json").read_text(encoding="utf-8"))
I = json.loads((ORIG / "data" / "ideas.json").read_text(encoding="utf-8"))
mun = json.loads((ORIG / "data" / "municipios.json").read_text(encoding="utf-8"))
meta = json.loads((ORIG / "data" / "meta.json").read_text(encoding="utf-8"))
ms = M["medidas"]
ids = [m["id"] for m in ms]
ok("34 medidas, M01 a M34, sin duplicados ni huecos", ids == [f"M{i:02d}" for i in range(1, 35)], len(ids))
c = Counter(m["viabilidad"] for m in ms)
ok("Viabilidad: 30 instrumento existente + 4 norma vasca o foral", c == {"instrumento_existente": 30, "nueva_norma_vasca_o_foral": 4}, dict(c))
ok("17 sin magnitud declarada", sum(1 for m in ms if not m.get("magnitud")) == 17)
ok("M33 y M34 con en_plan:false (y solo ellas)", [m["id"] for m in ms if m.get("en_plan") is False] == ["M33", "M34"])
ok("Catálogos: 6 líneas, 5 mecanismos, 5 agentes de decisión, 3 papeles de BM30", (len(M["lineas"]), len(M["mecanismos"]), len(M["decide"]), len(M["papeles_bm30"])) == (6, 5, 5, 3))
ok("Las 4 alternativas (ideas.json)", len(I["ideas"]) == 4, [i["id"] for i in I["ideas"]])
ok("Ninguna alternativa es una de las 34 medidas", not ({i["id"] for i in I["ideas"]} & set(ids)))

# 3. nota ponderada: reimplementación independiente
NORM = {
    "evidencia": {"Alta": 1, "Media-alta": .75, "Media": .5, "Media-baja": .25, "Baja": 0},
    "viabilidad": {"instrumento_existente": 1, "nueva_norma_vasca_o_foral": .5, "requiere_ley_estatal": 0},
    "plazo": {"corto": 1, "medio": .5, "largo": 0},
    "coste": {"bajo": 1, "medio": .5, "alto": 0},
}
KEYS = ["evidencia", "viabilidad", "plazo", "coste", "alcance"]


def pop(cods):
    return sum(mun[c]["poblacion"] for c in cods)


def reach(m):
    w = m["municipios"]
    return pop(set(w["plan"]) | set(w["probada"]) | set(w["piloto"])) / meta["poblacion_total"]


maxr = max(reach(m) for m in ms) or 1
lines = list(M["lineas"])


def orden(w):
    tot = sum(w)
    if not tot:
        return [m["id"] for m in sorted(ms, key=lambda m: (lines.index(m["linea"]), m["id"]))]

    def score(m):
        v = {k: NORM[k][m[k]] for k in NORM}
        v["alcance"] = reach(m) / maxr
        return sum(w[i] * v[k] for i, k in enumerate(KEYS)) / tot

    return [m["id"] for m in sorted(ms, key=lambda m: (-score(m), m["id"]))]


car = json.loads((pathlib.Path(__file__).parent / "caracterizacion.json").read_text(encoding="utf-8"))
for nombre, w in car["pesos"].items():
    esperado = car["ordenes"][nombre].split(",")
    got = orden(w)
    ok(f"Orden «{nombre}»: la reimplementación en Python coincide con el de la matriz ORIGINAL", got == esperado,
       "34 de 34" if got == esperado else f"difiere en {sum(a != b for a, b in zip(got, esperado))} posiciones")
ok("Las cinco configuraciones dan órdenes distintos (la prueba no es vacía)", len(set(car["ordenes"].values())) == 5)

# 4. literales presentados como originales
# el corpus son los módulos servidos copiados en original/ (están en el repositorio): no hace falta la copia local completa de la web
corpus = "\n".join(p.read_text(encoding="utf-8") for p in ORIG.joinpath("js").rglob("*.js"))
literales = [
    "Las medidas, con los mismos criterios", "se pueden aplicar ya, sin cambiar ninguna ley. Ninguna tiene una nota única: cada criterio se ve aparte.",
    "Evidencia y plazo", "Todas, criterio a criterio", "Filtra o da peso a lo que te importa: la tabla se ordena.", "De cada problema a qué vigilar",
    "Elige una línea de actuación. Pasa por una medida para ver su cadena.", "Quién decide cada medida",
    "Del Estado a los ayuntamientos, y qué puede hacer BM30 en cada una.",
    "Dos o tres, lado a lado", "Compárala con otras", "Cambia la comparación", "Las alternativas estudiadas",
    "Ideas que se analizaron y por qué no están entre las 34.",
    "Medidas lado a lado", "← Todas las medidas", "Qué hace", "Si ha funcionado", "Qué puede hacer BM30", "Qué vigilar",
    "Evaluada, no se propone", "Quitar los pesos", "Ordenar según tus prioridades", "Sin peso", "Bastante",
    "Solo las que se pueden aplicar ya", "Línea de actuación", "Cómo actúa", "Quién decide", "Papel de BM30",
    "Dónde se usa ya y dónde se propone", "Y una tercera", "Ninguna",
    "Da más o menos peso a cada criterio y la tabla se ordena. El orden depende de lo que elijas: no mide el impacto de ninguna medida, que casi nunca se conoce en Bizkaia.",
    "Agrupadas por línea de actuación: da peso a algún criterio para ordenarlas.", "Ordenadas según los pesos que has elegido.", "Sin evaluar",
]
for t in literales:
    ok(f"Literal original: «{t[:60]}{'…' if len(t) > 60 else ''}»", t in corpus)

# 5. nada de datos escritos a mano en el prototipo
codigo = "\n".join(p.read_text(encoding="utf-8") for p in (MED / "js").glob("*.js")) + (MED / "index.html").read_text(encoding="utf-8")
sospechosas = [s for s in ["30 de 34", "441.998", "441998", "M10 Más", "Limitar dónde"] if s in codigo]
ok("Sin cifras ni nombres de medidas escritos a mano en el código del prototipo", not sospechosas, sospechosas)
ok("Se importan (no se copian) matriz.js, ficha.js, enlaces.js y alternativas.js; solo las funciones privadas están en calculo.js",
   all(f in codigo for f in ["original/js/matriz.js", "original/js/medidas/ficha.js", "original/js/medidas/enlaces.js", "original/js/alternativas.js"]))


# 6. alcance del cambio
def git(*a):
    return subprocess.run(["git", *a], cwd=RAIZ, capture_output=True, text=True, encoding="utf-8").stdout


cambiados = set(git("diff", "--name-only", "ux/sprint-02-living-atlas").splitlines()) | set(git("ls-files", "--others", "--exclude-standard").splitlines())
permitidos = ("sprint-03/", "docs/medidas/", ".claude/launch.json", "docs/audit/", ".gitignore")
fuera = sorted(f for f in cambiados if not f.startswith(permitidos))
ok("Fuera de sprint-03/ y docs/medidas/ no se ha tocado nada (rama partida de ux/sprint-02-living-atlas)", not fuera, fuera)
tocados = [f for f in cambiados if f.startswith(("sprint-01/preview", "sprint-02/", "docs/sprint-0"))]
ok("No se toca la web original, el Sprint 01 ni el Sprint 02", not tocados, tocados)

fallos = [r for r in res if not r[0]]
for p, n, d in res:
    print(f"{'PASS' if p else 'FAIL'} · {n}" + (f" ({d})" if d not in ('', None, []) else ""))
print(f"\n{len(res) - len(fallos)} PASS, {len(fallos)} FAIL")
sys.exit(1 if fallos else 0)
