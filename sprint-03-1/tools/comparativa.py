"""Compone imágenes antes/después de las zonas clave para revisar el sistema tipográfico (Pillow).

Uso:  python -I sprint-03-1/tools/comparativa.py
"""
import pathlib
import sys

from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding="utf-8")
CAP = pathlib.Path(__file__).resolve().parents[2] / "docs" / "continuidad" / "capturas"
ANTES, DESPUES = CAP / "antes", CAP / "despues"
fuente = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 22)

# (fichero, región (x0, y0, x1, y1), título de la comparativa)
CASOS = [
    ("situacion-bilbao-alquiler-1440x900.png", (730, 110, 1400, 900), "comparativa-situacion-ficha-ranking.png", "Situación · pestañas, cifra grande, perfil, ranking"),
    ("situacion-bizkaia-alquiler-1440x900.png", (990, 215, 1400, 760), "comparativa-situacion-cifra-protagonista.png", "Situación · cifra protagonista (34 de 35)"),
    ("medidas-matriz-pesos-1440x900.png", (370, 260, 1400, 900), "comparativa-medidas-matriz.png", "Medidas · contador, matriz con nota y orden"),
    ("medidas-plano-panel-1440x900.png", (370, 260, 1400, 900), "comparativa-medidas-plano-panel.png", "Medidas · plano, IDs en burbujas y panel"),
    ("medidas-comparar-1440x900.png", (40, 330, 1400, 900), "comparativa-medidas-comparar.png", "Medidas · comparador"),
]
for nombre, caja, salida, titulo in CASOS:
    a, d = Image.open(ANTES / nombre).crop(caja), Image.open(DESPUES / nombre).crop(caja)
    w, h = a.size
    lienzo = Image.new("RGB", (w, h * 2 + 100), "#ffffff")
    dib = ImageDraw.Draw(lienzo)
    dib.text((16, 10), f"{titulo}  ·  ANTES (arriba)", fill="#221e41", font=fuente)
    lienzo.paste(a, (0, 44))
    dib.text((16, h + 54), "DESPUÉS (abajo)", fill="#1a4d7a", font=fuente)
    lienzo.paste(d, (0, h + 94))
    lienzo.save(CAP / salida)
    print("escrito", salida, lienzo.size)
