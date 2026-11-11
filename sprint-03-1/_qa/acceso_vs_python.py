"""Acceso · el módulo de cálculo que usa la app (app/original/js/calculo-acceso.js) da lo mismo que las fórmulas del análisis en Python
(DATA/vizcaya-vivienda-main/pipeline/transforms.py). Es la prueba tests/test_calculo_acceso.py del repositorio real, sin pytest, y
apuntada al fichero de ESTA aplicación. Necesita Node y la carpeta DATA (solo local).

Uso:  python -I sprint-03-1/_qa/acceso_vs_python.py   (sale con 1 si algo falla; con 2 si no hay DATA o Node)
"""
import json
import pathlib
import shutil
import subprocess
import sys

sys.stdout.reconfigure(encoding="utf-8")
R = pathlib.Path(__file__).resolve().parents[2]
REPO = R / "DATA" / "vizcaya-vivienda-main"
JS = R / "sprint-03-1" / "app" / "original" / "js" / "calculo-acceso.js"
if not REPO.exists() or shutil.which("node") is None:
    print("OMITIDA · hace falta la carpeta DATA y Node")
    sys.exit(2)
sys.dont_write_bytecode = True
sys.path.insert(0, str(REPO / "pipeline"))
from transforms import annual_mortgage_payment, mortgage_effort  # noqa: E402

CASES = [
    {"price": 265733, "net": 36766, "savings": 0.15, "downPayment": 0.35, "rate": 2.92, "years": 30, "loanShare": 0.8, "cap": 0.3},
    {"price": 265733, "net": 36766, "savings": 0.20, "downPayment": 0.30, "rate": 2.92, "years": 25, "loanShare": 0.8, "cap": 0.3},
    {"price": 298224, "net": 20637, "savings": 0.10, "downPayment": 0.40, "rate": 4.5, "years": 35, "loanShare": 0.8, "cap": 0.3},
    {"price": 150000, "net": 30000, "savings": 0.15, "downPayment": 0.30, "rate": 0, "years": 30, "loanShare": 0.8, "cap": 0.3},
    {"price": 265733, "net": 36766, "savings": 0.15, "downPayment": 0.35, "rate": 2.92, "years": 30, "loanShare": 0.8, "cap": 0.3, "loan": 50000},
]
script = f"const m = await import({json.dumps(JS.as_uri())});console.log(JSON.stringify({json.dumps(CASES)}.map((c) => m.access(c))));"
res = json.loads(subprocess.run(["node", "--input-type=module", "-e", script], capture_output=True, text=True, check=True, timeout=30).stdout)
close = lambda a, b: abs(a - b) <= 1e-9 * max(1, abs(b))
out = []
for i, (c, r) in enumerate(zip(CASES, res), 1):
    entry = max(0, c["downPayment"] * c["price"] - c.get("loan", 0))
    effort = mortgage_effort(c["price"], c["net"], c["rate"], c["years"], c["loanShare"])
    per_euro = annual_mortgage_payment(1.0, c["rate"], c["years"])
    out.append((f"caso {i}: entrada, años de ahorro, cuota (en %) y precio asequible = fórmulas del análisis",
                close(r["entry"], entry) and close(r["yearsToSave"], entry / (c["savings"] * c["net"])) and round(r["effort"], 1) == effort
                and close(r["affordable"], c["cap"] * c["net"] / (c["loanShare"] * per_euro))))
tiers = json.loads((R / "sprint-03-1" / "app" / "original" / "data" / "acceso.json").read_text(encoding="utf-8"))["bizkaia_tramos"]
p50 = next(t for t in tiers if "P50" in t["tramo"])
out.append(("con los supuestos del análisis, el hogar de ingresos medios de Bizkaia tarda lo que dice acceso.json (10,8 a 16,9 años)", [round(res[1]["yearsToSave"], 1), round(res[0]["yearsToSave"], 1)] == p50["años"]))
for n, p in out:
    print(f"{'PASS' if p else 'FAIL'} · {n}")
fallos = [n for n, p in out if not p]
print(f"\n{len(out) - len(fallos)} PASS, {len(fallos)} FAIL")
sys.exit(1 if fallos else 0)
