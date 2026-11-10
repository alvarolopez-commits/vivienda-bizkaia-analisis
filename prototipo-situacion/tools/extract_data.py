"""Extrae de los datos publicados solo lo que usa el prototipo de Situación.

No calcula ni redondea nada: copia los valores tal cual y comprueba que cada uno coincide con el original.
Origen: https://vizcaya-vivienda-analisis.vercel.app/data/ (copias en _origen/).
Uso:  python -I tools/extract_data.py
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
orig = json.loads((ROOT / "_origen" / "municipios.json").read_text(encoding="utf-8"))
meta = json.loads((ROOT / "_origen" / "meta.json").read_text(encoding="utf-8"))

IND_KEYS = ["esfuerzo_alquiler_P25", "crec_hogares", "crecimiento_parque", "vut_por_1000", "pct_no_principales"]
ANIOS = "años"  # la clave original lleva eñe

out = {}
for code, m in orig.items():
    ind = m.get("indicadores", {})
    compra = m.get("compra") or {}
    entry = {
        "nombre": m["nombre"],
        "tipo": m["tipo"],
        "poblacion": m["poblacion"],  # el relieve en reposo del 3D usa la población
        "indicadores": {k: ind.get(k) for k in IND_KEYS},
    }
    own = ((compra.get("tramos") or {}).get("P50") or {}).get(ANIOS)
    est = (((compra.get("orientativo") or {}).get("tramos") or {}).get("P50") or {}).get(ANIOS)
    if own is not None or est is not None:
        entry["compra"] = {}
        if own is not None:
            entry["compra"]["tramos"] = {"P50": {ANIOS: own}}
        if est is not None:
            entry["compra"]["orientativo"] = {"tramos": {"P50": {ANIOS: est}}}
    out[code] = entry

# Comprobación: cada valor copiado es idéntico al original
for code, e in out.items():
    m = orig[code]
    assert e["nombre"] == m["nombre"] and e["tipo"] == m["tipo"] and e["poblacion"] == m["poblacion"], code
    for k in IND_KEYS:
        assert e["indicadores"][k] == m["indicadores"].get(k), (code, k)
    if "compra" in e:
        if "tramos" in e["compra"]:
            assert e["compra"]["tramos"]["P50"][ANIOS] == m["compra"]["tramos"]["P50"][ANIOS], code
        if "orientativo" in e["compra"]:
            assert e["compra"]["orientativo"]["tramos"]["P50"][ANIOS] == m["compra"]["orientativo"]["tramos"]["P50"][ANIOS], code
assert len(out) == 113, len(out)

(ROOT / "data" / "situacion.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
(ROOT / "data" / "meta.json").write_text(
    json.dumps({"tipos": meta["tipos"], "fuentes": {k: {"nombre": v.get("nombre")} for k, v in meta["fuentes"].items()}}, ensure_ascii=False, separators=(",", ":")),
    encoding="utf-8",
)
print("municipios:", len(out), "| con alquiler:", sum(1 for e in out.values() if e["indicadores"]["esfuerzo_alquiler_P25"] is not None))
print("con entrada propia:", sum(1 for e in out.values() if e.get("compra", {}).get("tramos")), "| aproximada:", sum(1 for e in out.values() if e.get("compra", {}).get("orientativo") and not e["compra"].get("tramos")))
print("OK: valores idénticos al original")
