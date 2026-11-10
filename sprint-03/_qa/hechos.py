"""Hechos de los datos que citan los documentos de docs/medidas (recortes de first() y watch(), hashes, longitudes)."""
import hashlib
import json
import pathlib
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
RAIZ = pathlib.Path(__file__).resolve().parents[2]
D = RAIZ / "sprint-03" / "medidas" / "original" / "data"
M = json.loads((D / "medidas.json").read_text(encoding="utf-8"))["medidas"]
first = lambda t, n=2: " ".join(re.split(r"(?<=[.:])\s+(?=[A-ZÁÉÍÓÚ¿«])", t or "")[:n])
watch = lambda k: re.split(r"[(;.]", k or "")[0].strip()
print("sha256 medidas.json", hashlib.sha256((D / "medidas.json").read_bytes()).hexdigest())
print("sha256 ideas.json  ", hashlib.sha256((D / "ideas.json").read_bytes()).hexdigest())
print("que_hace recortado por first():", sum(first(m["que_hace"]) != m["que_hace"] for m in M), "de", len(M))
print("evidencia_detalle recortado por first():", sum(first(m["evidencia_detalle"]) != m["evidencia_detalle"] for m in M), "de", len(M))
print("kpi mostrado por watch() distinto del kpi completo:", sum(watch(m["kpi"]) != m["kpi"] for m in M), "de", len(M))
print("riesgos presentes:", sum(bool(m.get("riesgos")) for m in M), "| kpi presentes:", sum(bool(m.get("kpi")) for m in M), "| fuentes (urls):", sum(len(m.get("fuentes") or []) for m in M))
print("longitud max que_hace / evidencia_detalle / riesgos / kpi:", max(len(m["que_hace"]) for m in M), max(len(m["evidencia_detalle"]) for m in M), max(len(m.get("riesgos") or "") for m in M), max(len(m["kpi"] or "") for m in M))
print("campos de cada medida:", ", ".join(M[0].keys()))
