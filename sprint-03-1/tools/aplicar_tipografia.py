"""Traslada el parche tipográfico (TIPOGRAFIA_PATCH_SPRINT_02_03_v1.zip) a las hojas de la app integrada, POR DIFF.

No se sustituye ningún fichero: se compara cada hoja del repositorio (la que partió del Sprint 02 y del Sprint 03) con la del parche,
se extraen solo las líneas que el parche cambia y se aplican a las hojas integradas, exigiendo que cada línea aparezca una sola vez.
Los tokens --f-display/--f-ui/--f-data dejan de definirse en marco.css y pasan a un único css/typography.css.

Uso:  python -I sprint-03-1/tools/aplicar_tipografia.py <carpeta donde se extrajo el parche>
"""
import difflib
import pathlib
import re
import shutil
import sys

sys.stdout.reconfigure(encoding="utf-8")
RAIZ = pathlib.Path(__file__).resolve().parents[2]
PARCHE = pathlib.Path(sys.argv[1])
APP = RAIZ / "sprint-03-1" / "app" / "css"
norm = lambda p: p.read_text(encoding="utf-8").replace("\r\n", "\n").split("\n")


def cambios(repo):
    a, b = norm(RAIZ / repo), norm(PARCHE / repo)
    ops = [o for o in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes() if o[0] != "equal"]
    reemplazos, borradas = [], []
    for tag, i1, i2, j1, j2 in ops:
        if tag == "replace" and (i2 - i1) == (j2 - j1):
            reemplazos += list(zip(a[i1:i2], b[j1:j2]))
        elif tag == "delete":
            borradas += a[i1:i2]
        else:
            raise SystemExit(f"{repo}: diferencia inesperada {tag} {a[i1:i2]} -> {b[j1:j2]}")
    return reemplazos, borradas


def aplicar(hoja, reemplazos):
    t = (APP / hoja).read_text(encoding="utf-8").replace("\r\n", "\n")
    n = 0
    for viejo, nuevo in reemplazos:
        if not re.search(r"font", viejo + nuevo):
            continue  # solo líneas tipográficas (se salta el comentario de cabecera)
        assert t.count(viejo) == 1, f"{hoja}: la línea no aparece exactamente una vez:\n{viejo}"
        t = t.replace(viejo, nuevo)
        n += 1
        print(f"  {hoja}: {viejo.strip()[:70]}…")
    (APP / hoja).write_text(t, encoding="utf-8")
    return n


total = 0
r_atlas, b_atlas = cambios("sprint-02/atlas/css/atlas.css")
total += aplicar("situacion.css", r_atlas)
r_med, b_med = cambios("sprint-03/medidas/css/explorador.css")
total += aplicar("medidas.css", r_med)
assert not b_med, "explorador.css no debería perder líneas"

# los tokens locales desaparecen del marco: hay una sola fuente de verdad (typography.css)
marco = (APP / "marco.css").read_text(encoding="utf-8").replace("\r\n", "\n")
for linea in b_atlas:
    assert marco.count(linea + "\n") == 1, f"marco.css: token no encontrado: {linea}"
    marco = marco.replace(linea + "\n", "")
(APP / "marco.css").write_text(marco, encoding="utf-8")
shutil.copyfile(PARCHE / "sprint-02/atlas/css/typography.css", APP / "typography.css")
assert (PARCHE / "sprint-02/atlas/css/typography.css").read_bytes() == (PARCHE / "sprint-03/medidas/css/typography.css").read_bytes()
print(f"{total} líneas tipográficas trasladadas; {len(b_atlas)} tokens locales retirados de marco.css; typography.css único")
