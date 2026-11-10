"""Sprint 02 · comprobación de regresión del Living Atlas, independiente del JavaScript del prototipo.

1. Los módulos y datos de atlas/original/ son idénticos (sha256) a los que sirve la web publicada (manifiesto de Sprint 01).
2. Los recuentos de municipios con dato por problema, calculados aquí desde municipios.json con las reglas de indicadores.js.
3. Valores muestrales (Bilbao) contra los datos.
4. Los textos que el prototipo presenta como originales existen tal cual en los ficheros originales.
5. Ningún dato numérico del análisis escrito a mano en el código del prototipo.

Uso:  python -I sprint-02/_qa/regresion.py   (sale con 1 si algo falla)
"""
import hashlib
import json
import pathlib
import re
import sys

RAIZ = pathlib.Path(__file__).resolve().parents[2]
ATLAS = RAIZ / "sprint-02" / "atlas"
ORIG = ATLAS / "original"
SERVIDO = RAIZ / "sprint-01" / "_original-servido"
MANIFIESTO = json.loads((RAIZ / "sprint-01" / "_qa" / "original-hashes.json").read_text(encoding="utf-8"))["ficheros"]

resultados = []


def ok(nombre, cond, detalle=""):
    resultados.append((bool(cond), nombre, detalle))


# 1. copia exacta
for p in sorted(ORIG.rglob("*")):
    if p.is_file():
        rel = p.relative_to(ORIG).as_posix()
        h = hashlib.sha256(p.read_bytes()).hexdigest()
        ok(f"original/{rel} idéntico a la web servida", MANIFIESTO.get(rel) == h, "sha256")

# 2. recuentos con las reglas de indicadores.js
mun = json.loads((ORIG / "data" / "municipios.json").read_text(encoding="utf-8"))
geo = json.loads((ORIG / "data" / "municipios.geojson").read_text(encoding="utf-8"))


def entrada(m):
    own = (((m.get("compra") or {}).get("tramos") or {}).get("P50") or {}).get("años")
    if own:
        return own
    return ((((m.get("compra") or {}).get("orientativo") or {}).get("tramos") or {}).get("P50") or {}).get("años")


reglas = {
    "Alquiler": lambda m: m["indicadores"].get("esfuerzo_alquiler_P25") is not None,
    "Entrada": lambda m: bool(entrada(m)),
    "Hogares": lambda m: m["indicadores"].get("crec_hogares") is not None and m["indicadores"].get("crecimiento_parque") is not None,
    "Turísticas": lambda m: m["indicadores"].get("vut_por_1000") is not None,
    "Vacías": lambda m: m["indicadores"].get("pct_no_principales") is not None,
}
esperado = {"Alquiler": 35, "Entrada": 113, "Hogares": 112, "Turísticas": 113, "Vacías": 113}
for nombre, regla in reglas.items():
    n = sum(1 for m in mun.values() if regla(m))
    ok(f"{nombre}: {esperado[nombre]} municipios con dato", n == esperado[nombre], n)

codes_geo = [f["properties"]["code"] for f in geo["features"]]
ok("113 polígonos en el GeoJSON", len(codes_geo) == 113, len(codes_geo))
ok("Mismos códigos INE en GeoJSON y municipios.json", sorted(codes_geo) == sorted(mun), "")

# 3. valores muestrales (Bilbao)
b = mun["48020"]["indicadores"]
ok("Bilbao · alquiler 55,8 %", b["esfuerzo_alquiler_P25"] == 55.8, b["esfuerzo_alquiler_P25"])
ok("Bilbao · hogares - viviendas = +1,6 puntos", round(b["crec_hogares"] - b["crecimiento_parque"], 1) == 1.6, round(b["crec_hogares"] - b["crecimiento_parque"], 1))
ok("Bilbao · turísticas 6,1 por 1.000", b["vut_por_1000"] == 6.1, b["vut_por_1000"])
ok("Bilbao · vacías 10,0 %", b["pct_no_principales"] == 10.0, b["pct_no_principales"])
ok("Bilbao · entrada 12,5 a 19,4 años", entrada(mun["48020"]) == [12.5, 19.4], entrada(mun["48020"]))

# 4. literales presentados como originales
fuentes_txt = "\n".join(p.read_text(encoding="utf-8") for p in [
    *SERVIDO.joinpath("js").rglob("*.js"), SERVIDO / "index.html"])
literales = [
    "Cada municipio, con su dato", "Elige un problema y toca un municipio.", "Los 113 municipios,", "de más a menos",
    "Ver su ficha", "Sin dato", "con dato", "*Aproximado: precio medio de su área.", "Ver los diez primeros",
    "Datos descargados el", "Solo totales y porcentajes: ninguna cifra identifica a una persona.",
    "Mapa de los municipios de Bizkaia, coloreado por el indicador elegido", "Cálculo propio", "Todos",
    "Todos los tipos", "Mapa: ", "Ver el radar",
]
for t in literales:
    ok(f"Literal original: «{t}»", t in fuentes_txt)
# «Otros productos» y «Resumen ↗» de la cabecera son microcopia PROPUESTA del Sprint 01 (IA_NAVIGATION.md), no originales
ia = (RAIZ / "docs" / "sprint-01" / "IA_NAVIGATION.md").read_text(encoding="utf-8")
ok("«Otros productos» figura como propuesta de Sprint 01", "Otros productos" in ia and "Otros productos" not in fuentes_txt)

# 5. ninguna cifra del análisis escrita a mano en el código del prototipo
codigo = "\n".join(p.read_text(encoding="utf-8") for p in (ATLAS / "js").glob("*.js")) + (ATLAS / "index.html").read_text(encoding="utf-8")
sospechosas = [s for s in ["55,8", "55.8", "34 de 35", "35 de 113", "16,9", "10,8", "346.933", "346933"] if s in codigo]
ok("Sin cifras del análisis incrustadas en el código del prototipo", not sospechosas, sospechosas)
ok("indicadores.js no se ha duplicado en el prototipo", "mix(\"#f4a6a6\"" not in codigo)

fallos = [r for r in resultados if not r[0]]
for p, nombre, detalle in resultados:
    print(f"{'PASS' if p else 'FAIL'} · {nombre}" + (f" ({detalle})" if detalle not in ("", None) else ""))
print(f"\n{len(resultados) - len(fallos)} PASS, {len(fallos)} FAIL")
sys.exit(1 if fallos else 0)
