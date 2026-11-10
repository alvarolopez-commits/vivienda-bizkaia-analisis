# Sprint 02 · Living Atlas (Atlas 2D + Intelligence) · PROTOTIPO

Explorador territorial de Situación. Incluye:
- Un mapa 2D real de los 113 municipios.
- Los cinco problemas.
- Una ficha contextual y un ranking conectados.

Es un prototipo aislado: no modifica la web publicada ni se despliega.

## Abrirlo

Doble clic en `Abrir Sprint 02.bat`, o desde la carpeta del proyecto:

```bash
python sprint-02/servidor.py
```

Después abrir http://localhost:4177/atlas/

- `?limpio` oculta la etiqueta naranja de prototipo; `?marcar` resalta los textos nuevos (PROPUESTA_MICROCOPY).
- El estado va en la URL, por ejemplo http://localhost:4177/atlas/#situacion/alquiler/48020 (Alquiler, Bilbao).

## Pruebas desde un clon de GitHub

`atlas/original/` sí está en el repositorio (el prototipo la necesita para funcionar). En cambio `sprint-01/_original-servido/` (copia íntegra de la web servida, 5 MB) está en `.gitignore`, y `_qa/regresion.py` y `_qa/rutas.mjs` la usan como referencia. En un clon limpio hay que regenerarla descargando la web publicada (ver `sprint-01/README.md`); el resto del prototipo funciona sin ella.

## Qué hay aquí

| Ruta | Qué es |
|---|---|
| `atlas/index.html`, `atlas/css/atlas.css` | La página y su estilo (provisional, sistema Astara de B v2) |
| `atlas/js/main.js` | Estado único de la vista, ficha, lista, búsqueda y URL |
| `atlas/js/mapa-atlas.js` | Interacción del mapa sobre `svgMap` original: color, hover, foco, flechas, selección y zoom |
| `atlas/js/nav.js` | Menú de la cabecera (igual que en Sprint 01) |
| `atlas/original/` | **Copia byte a byte** de 5 módulos y 5 JSON de la web servida (sha256 comprobado). No se edita |
| `_qa/` | Pruebas: `regresion.py`, `rutas.mjs`, `qa-atlas.js` y `qa-layout.js` |
| `servidor.py` | Servidor local en 127.0.0.1:4177, sin caché |

Documentación en `docs/sprint-02/`:
- `MAP_AUDIT_AND_REUSE.md`
- `LIVING_ATLAS_UX_DECISIONS.md`
- `MAP_REGRESSION_CHECK.md`
- `capturas/`

## Real y prototipo

- **Real (original sin cambios)**:
  - Polígonos, valores, colores y escalas.
  - Leyendas, recuentos y orden del ranking.
  - Textos de indicador y fuente.
  - Textos del problema en Bizkaia.
- **Prototipo funcional**:
  - Estado compartido e interacción del mapa.
  - Ficha contextual y franja de cinco problemas.
  - Búsqueda y URL compartible.
- **Fuera del prototipo**: la escena de portada y el 3D, que siguen en la web original; las demás pestañas, que abren la web publicada; y el móvil, aparcado (funciona pero no está pulido).
