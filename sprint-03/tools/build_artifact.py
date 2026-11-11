"""Genera la página para publicar el explorador como artifact privado de claude.ai.

El artifact envuelve la página en su propio esqueleto, así que se quitan doctype, <html>, <head> y <body> y se deja el título
y las referencias a los ficheros propios (css, js), que se publican al lado (parámetro files). Se quitan las marcas ?v=N de caché.
index.html sigue siendo la única fuente. Imprime la lista de ficheros que hay que publicar.

Uso:  python -I sprint-03/tools/build_artifact.py <ruta de salida .html>
"""
import json
import pathlib
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = pathlib.Path(__file__).resolve().parent.parent / "medidas"
src = (ROOT / "index.html").read_text(encoding="utf-8")
head = re.search(r"<head>(.*?)</head>", src, re.S).group(1)
body = re.search(r"<body>(.*?)</body>", src, re.S).group(1)
keep = [l for l in head.splitlines() if re.search(r"<title>|robots|preconnect|stylesheet|<script", l)]
keep = [re.sub(r"(href|src)=\"([^\"]+)\?v=\d+\"", r'\1="\2"', l) for l in keep]
i = next(i for i, l in enumerate(keep) if "<title>" in l)
keep[i] = "  <title>Explorador de Medidas</title>"
out = "\n".join(l.strip() for l in keep) + "\n" + body.strip() + "\n"
assert not re.search(r"<(html|head|body)[\s>]|<!doctype", out, re.I)  # <header> sí puede estar
pathlib.Path(sys.argv[1]).write_text(out, encoding="utf-8")
files = sorted(p.relative_to(ROOT).as_posix() for p in ROOT.rglob("*") if p.is_file() and p.name != "index.html")
print(len(out), "bytes de página;", len(files), "ficheros al lado")
print(json.dumps([{"path": f} for f in files]))
