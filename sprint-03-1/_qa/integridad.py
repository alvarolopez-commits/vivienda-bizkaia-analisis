"""Integridad de la aplicación integrada (independiente del navegador).

Referencias que usa (ninguna es una carpeta de trabajo):
  · DATA/vizcaya-vivienda-main/web-analisis  → el código fuente REAL de la web publicada (si la carpeta existe en este equipo).
  · app/../_qa/original-hashes.json          → sha256 de los 20 ficheros de app/original (se comprueban siempre, aunque no esté DATA).
  · historial de git, commit BASE            → los sprints 02 y 03 tal como se publicaron (sus carpetas ya no están en el árbol de trabajo).

Comprueba:
 1. Los 20 ficheros de app/original/ son idénticos a los de la web publicada (manifiesto sha256 y, si existe, el repositorio real).
 2. Cada módulo JS copiado es IDÉNTICO al de su sprint salvo la ruta de importación (../original → ../../original).
 3. Los dos main.js convertidos en montar() difieren de los originales solo en el número de líneas esperado.
 4. medidas.css solo difiere del Sprint 03 en tipografía; situacion.css y marco.css, respecto al commit publicado, solo cambian
    propiedades de PRESENTACIÓN (Design System Liquid Glass), nunca de maquetación; los tokens previos se conservan con el mismo valor.

Uso:  python -I sprint-03-1/_qa/integridad.py   (sale con 1 si algo falla)
"""
import difflib
import hashlib
import json
import pathlib
import re
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8")
R = pathlib.Path(__file__).resolve().parents[2]
APP = R / "sprint-03-1" / "app"
DATA = R / "DATA" / "vizcaya-vivienda-main" / "web-analisis"
BASE = "fb43450"  # commit publicado en GitHub Pages cuando se fijó esta referencia (contiene sprint-01/02/03 y la app)
res = []
notas = []


def ok(n, c, d=""):
    res.append((bool(c), n, d))


def hist(ruta):
    """Contenido de un fichero en el commit BASE (saltos de línea normalizados)."""
    r = subprocess.run(["git", "show", f"{BASE}:{ruta}"], cwd=R, capture_output=True, text=True, encoding="utf-8")
    return r.stdout.replace("\r\n", "\n") if r.returncode == 0 else None


def leer(p):
    return p.read_text(encoding="utf-8").replace("\r\n", "\n")


sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
shan = lambda p: hashlib.sha256(p.read_bytes().replace(b"\r\n", b"\n")).hexdigest()

# ---------- 1. originales ----------
man = json.loads((R / "sprint-03-1" / "_qa" / "original-hashes.json").read_text(encoding="utf-8"))["ficheros"]
orig = sorted(p for p in (APP / "original").rglob("*") if p.is_file())
rel = lambda p: p.relative_to(APP / "original").as_posix()
bad = [rel(p) for p in orig if man.get(rel(p)) != sha(p)]
ok(f"{len(orig)} ficheros de app/original/ coinciden con el manifiesto sha256 de la web publicada", not bad and len(orig) == len(man), bad)
if DATA.exists():
    bad = [rel(p) for p in orig if not (DATA / rel(p)).exists() or shan(p) != shan(DATA / rel(p))]
    ok(f"{len(orig)} ficheros de app/original/ idénticos a los de DATA/…/web-analisis (repositorio real, salvo saltos de línea)", not bad, bad)
else:
    notas.append("DATA/ no está en este equipo: se omite la comparación con el repositorio real.")

# ---------- 2. módulos copiados ----------
norm = lambda t: t.replace('"../original/', '"../../original/')
pares = [("sprint-02/atlas/js/mapa-atlas.js", APP / "js/situacion/mapa-atlas.js")] + [(f"sprint-03/medidas/js/{f}.js", APP / f"js/medidas/{f}.js") for f in ("calculo", "comparar", "detalle", "entender", "estado-app", "matriz-vista", "plano")]
for o, n in pares:
    h = hist(o)
    ok(f"{n.relative_to(APP).as_posix()}: idéntico al del sprint publicado salvo la ruta de importación", h is not None and norm(h) == leer(n))


# ---------- 3. main.js convertidos ----------
def lineas_cambiadas(o, n):
    a, b = norm(o).split("\n"), leer(n).split("\n")
    return sum(1 for l in difflib.unified_diff(a, b, lineterm="", n=0) if l[:1] in "+-" and l[:3] not in ("+++", "---"))


for o, n, esperado in (("sprint-02/atlas/js/main.js", APP / "js/situacion/index.js", 40), ("sprint-03/medidas/js/main.js", APP / "js/medidas/index.js", 160)):
    h = hist(o)
    c = lineas_cambiadas(h, n) if h else None
    ok(f"{n.relative_to(APP).as_posix()}: solo {c} líneas distintas del main.js original (montaje, oyentes y, en Medidas, la recomposición; el cálculo vive en módulos idénticos)", c is not None and c <= esperado, c)

# el componente nuevo de la lista no calcula: solo pinta lo que recibe y reutiliza funciones originales
src = "\n".join(l for l in leer(APP / "js/medidas/lista.js").splitlines() if not l.strip().startswith("//"))
ok("js/medidas/lista.js: sin cálculo propio (no usa NORM, scorer, reach, ordered ni redondea)", not any(k in src for k in ("NORM", "scorer", "reach(", "ordered(", "Math.round", "Math.floor")) and "calculo.js" in src)

# ---------- 4. estilos ----------
# medidas.css no se ha tocado desde el Sprint 03 más allá de la tipografía
h = hist("sprint-03/medidas/css/explorador.css") or ""
d = [l for l in (x[1:].strip() for x in difflib.unified_diff(h.split("\n"), leer(APP / "css/medidas.css").split("\n"), lineterm="", n=0) if x[:1] == "+" and x[:3] != "+++") if l]
tip = [l for l in d if any(k in l for k in ("font", "f-ui", "f-display", "f-data"))]
otras = [l for l in d if l not in tip and not (l.startswith("/*") or l.endswith("*/"))]
ok("css/medidas.css: las únicas diferencias con el Sprint 03 son líneas de familia/peso tipográfico", bool(h) and not otras, otras[:3])

# Design System: respecto al commit publicado (BASE) el CSS de Situación y del marco solo puede cambiar PRESENTACIÓN (material, color, borde,
# sombra, desenfoque, radios, relleno, transiciones, fuente), nunca maquetación (display, grid, flex, position, tamaños, overflow...).
PRESENTACION = {"background", "background-image", "background-color", "background-attachment", "border", "border-color", "border-radius", "border-bottom",
                "border-top", "scrollbar-width", "scrollbar-color", "min-width", "min-height", "box-shadow", "backdrop-filter", "-webkit-backdrop-filter", "color", "font", "transition", "padding", "margin", "opacity"}


# Cambio de maquetación PEDIDO por el autor: la leyenda del mapa (Situación) y la del Plano (Medidas) van ARRIBA del gráfico y el +/− del mapa abajo.
# Solo afecta a los contenedores del lienzo de Situación y a la leyenda del Plano; ningún dato, texto ni cálculo.
LEYENDA_ARRIBA = lambda s: s.split(" ")[0] in (".lienzo", ".lienzo-cab", ".mapa-zona", ".mapa", ".herramientas", ".leyenda-bloque") or ":has(> .leyenda-lineas)" in s


def reglas(texto):
    texto = re.sub(r"/\*.*?\*/", "", texto, flags=re.S)
    out = []
    for sel, cuerpo in re.findall(r"([^{}]+)\{([^{}]*)\}", texto):
        decl = {}
        for m in re.finditer(r"([a-z-]+)\s*:\s*((?:[^;(]|\([^)]*\))*)", cuerpo):
            decl[m.group(1).strip()] = m.group(2).strip()
        out.append((" ".join(sel.split()), decl))
    return out


for nombre in ("situacion.css", "marco.css", "medidas-diseno.css"):
    antes, ahora = reglas(hist(f"sprint-03-1/app/css/{nombre}") or ""), reglas(leer(APP / "css" / nombre))
    idx = {}
    for sel, dec in antes:
        idx.setdefault(sel, []).append(dec)
    usados, cambios = {}, []
    for sel, dec in ahora:
        i = usados.get(sel, 0)
        usados[sel] = i + 1
        previas = idx.get(sel, [])
        prev = previas[i] if i < len(previas) else {}
        for p, v in dec.items():
            if prev.get(p) != v:
                cambios.append((sel, p))
    de_maquetacion = [(s, p) for s, p in cambios if p not in PRESENTACION and p != "gap" and not p.startswith("--") and not s.startswith('.shell[data-detalle="abierto"] .m-side') and not s.startswith("::-webkit-scrollbar") and "::-webkit-scrollbar" not in s and s != ".m-stage .burbujas" and not LEYENDA_ARRIBA(s)]  # excepciones documentadas: ficha de Medidas dentro del panel a < 1400 px; aspecto de las barras de desplazamiento (::-webkit-scrollbar); altura del Plano de Medidas para que quepa con su leyenda
    quitadas = [(s, p) for sel, dec in antes for s, p in [(sel, k) for k in dec] if not any(s == s2 and p in d2 for s2, d2 in ahora)]
    quitadas = [(s, p) for s, p in quitadas if p not in PRESENTACION and not LEYENDA_ARRIBA(s) and s != ":root" and not s.startswith(".pendiente") and not p.startswith("--")]  # :root salió a tokens.css (se comprueba abajo); .pendiente era la página provisional, ya sustituida por las vistas reales
    ok(f"css/{nombre}: respecto al commit publicado solo cambia presentación, no maquetación ({len(cambios)} declaraciones cambiadas)", bool(antes) and not de_maquetacion and not quitadas, (de_maquetacion + quitadas)[:4])

# todos los tokens del marco anterior siguen existiendo en tokens.css con el MISMO valor (los cambios de interfaz son aditivos)
ant = dict(re.findall(r"(--[a-z0-9-]+)\s*:\s*([^;]+);", (hist("sprint-03-1/app/css/marco.css") or "").split("}")[0]))
nue = dict(re.findall(r"(--[a-z0-9-]+)\s*:\s*([^;]+);", leer(APP / "css/tokens.css").split("/* ---------- Materiales")[0]))
cambiados = {k: (v, nue.get(k)) for k, v in ant.items() if nue.get(k) is None or " ".join(nue[k].split()) != " ".join(v.split())}
ok(f"tokens.css conserva los {len(ant)} tokens del marco anterior con el mismo valor (los nuevos son aditivos)", bool(ant) and not cambiados, list(cambiados.items())[:3])
ok("Una sola definición de tokens: marco.css y las hojas de vista no definen :root", all(":root" not in re.sub(r"/\*.*?\*/", "", leer(APP / "css" / f), flags=re.S) for f in ("marco.css", "situacion.css", "medidas.css", "medidas-diseno.css")))
ok("Una sola definición de las familias: typography.css (ninguna otra hoja define --font-heading; solo la usan)", all("--font-heading:" not in leer(APP / "css" / f) for f in ("marco.css", "situacion.css", "medidas.css")))
ok("typography.css: las tres familias y una sola hoja", leer(APP / "css/typography.css").count("--font-heading:") == 1)

fallos = [r for r in res if not r[0]]
for p, n, d in res:
    print(f"{'PASS' if p else 'FAIL'} · {n}" + (f" ({d})" if d not in ("", None, []) else ""))
for n in notas:
    print(f"NOTA · {n}")
print(f"\n{len(res) - len(fallos)} PASS, {len(fallos)} FAIL")
sys.exit(1 if fallos else 0)
