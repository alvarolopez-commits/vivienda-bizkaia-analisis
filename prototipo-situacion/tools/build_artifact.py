"""Genera dist/artifact.html a partir de index.html para publicarlo como artifact de claude.ai.

El artifact envuelve la página en su propio esqueleto, así que se quitan doctype, <html>, <head> y <body>
y se deja el título y las referencias a los ficheros propios (css, js), que se publican al lado.
index.html sigue siendo la única fuente: no editar dist/ a mano.
Uso:  python -I tools/build_artifact.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / "index.html").read_text(encoding="utf-8")

head = re.search(r"<head>(.*?)</head>", src, re.S).group(1)
body = re.search(r"<body>(.*?)</body>", src, re.S).group(1)
# del head se conservan título, robots, precarga de fuentes, hoja de estilos y script; charset y viewport los pone el esqueleto
keep = [l for l in head.splitlines() if re.search(r"<title>|robots|preload|stylesheet|<script", l)]
title = next(l for l in keep if "<title>" in l)
title_new = "  <title>Situación · Vivienda en Bizkaia</title>"
keep[keep.index(title)] = title_new
out = "\n".join(l.strip() for l in keep) + "\n" + body.strip() + "\n"

dist = ROOT / "dist"
dist.mkdir(exist_ok=True)
(dist / "artifact.html").write_text(out, encoding="utf-8")
assert not re.search(r"<(html|head|body)[\s>]|<!doctype", out, re.I)  # <header> sí puede estar
print("dist/artifact.html", len(out), "bytes")
