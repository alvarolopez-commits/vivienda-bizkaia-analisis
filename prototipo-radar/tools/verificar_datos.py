"""Comprueba que los datos del prototipo son idénticos a los que sirve hoy el Radar publicado.

Descarga cada fichero de data/ de https://vizcaya-vivienda.vercel.app/data/ y lo compara byte a byte con el de esta carpeta.
Si el Radar publica datos nuevos, el prototipo queda desfasado y este script lo dice (no copia nada por sí solo).
Uso:  python -I tools/verificar_datos.py
"""
import hashlib
import pathlib
import sys
import urllib.request

BASE = "https://vizcaya-vivienda.vercel.app/data/"
DATA = pathlib.Path(__file__).resolve().parent.parent / "data"
bad = 0
for f in sorted(DATA.iterdir()):
    if f.suffix not in (".json", ".geojson"):
        continue
    with urllib.request.urlopen(BASE + f.name, timeout=30) as r:
        remote = r.read()
    same = hashlib.sha256(remote).hexdigest() == hashlib.sha256(f.read_bytes()).hexdigest()
    bad += not same
    print(("igual    " if same else "DISTINTO ") + f.name)
print("todo igual que el Radar publicado" if not bad else f"{bad} fichero(s) distinto(s): el prototipo esta desfasado")
sys.exit(1 if bad else 0)
