# Vivienda en Bizkaia · Análisis y medidas (rediseño)

Rediseño de la web interactiva [vizcaya-vivienda-analisis.vercel.app](https://vizcaya-vivienda-analisis.vercel.app/) en el lenguaje visual del dashboard PCI de Astara Intelligence. Los textos, datos y cálculos son los de la web publicada; este repositorio solo cambia cómo se presentan.

**Estado:** prototipo de la vista **Situación**, solo escritorio. No sustituye a la web publicada.

## Estructura

| Carpeta | Qué hay |
|---|---|
| `prototipo-situacion/` | El prototipo: `index.html`, `css/`, `js/`, `data/`, `assets/`, `vendor/three/` |
| `prototipo-radar/` | Prototipo de **Situación e Indicadores del Radar** con el estilo del dashboard PCI (`css/pci.css` es copia literal). Notas en `docs/02-radar/PROTOTIPO_RADAR_NOTAS.md` |
| `prototipo-situacion/js/indicadores.js`, `mapa.js`, `territorio.js` | Copias del código de la web publicada (solo cambian las rutas de import) |
| `prototipo-situacion/js/colores.js` | Paleta azul PCI de los cinco problemas, sin tocar valores ni cortes |
| `prototipo-situacion/tools/` | `extract_data.py` (subconjunto de datos con comprobación de igualdad) y `build_artifact.py` (versión publicable) |
| `prototipo-situacion/_origen/` | Copias de los ficheros originales de la web, como referencia |
| `docs/01-web/` | Auditoría, decisiones y notas del prototipo (`PROTOTIPO_NOTAS.md` resume qué es literal y qué es nuevo) |
| `PRODUCT.md` | Contexto del producto |

## Verlo en local

Doble clic en `prototipo-situacion/Abrir prototipo.bat`, o:

```bash
python -m http.server 4173 --bind 127.0.0.1 --directory prototipo-situacion
```

Abre http://localhost:4173/ (con `?marcar` se rodea en naranja lo que es nuevo y está pendiente de aprobar). Abriendo `index.html` directamente no cargan los datos.

## Regenerar datos y versión publicable

```bash
cd prototipo-situacion
python -I tools/extract_data.py
python -I tools/build_artifact.py
```

### Prototipo del Radar

```bash
python3 -m http.server 4174 --bind 127.0.0.1 --directory prototipo-radar
python3 -I prototipo-radar/tools/verificar_datos.py   # compara los datos con el Radar publicado
```
Abre http://localhost:4174/ (con `?marcar` se rodea en naranja lo nuevo).
