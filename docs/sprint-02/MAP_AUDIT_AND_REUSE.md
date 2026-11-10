# MAP_AUDIT_AND_REUSE · El mapa de Situación: qué hay y qué se reutiliza

**Sprint 02 · Living Atlas (Atlas 2D + Intelligence) · 10-11-2026 · PROTOTIPO**

## 0. De qué código partimos (verificado)

- **No tenemos el repositorio fuente de la web publicada** (pipeline `analysis/`, tests, configuración de Vercel). El repositorio `vivienda-bizkaia-analisis` es el nuestro, de rediseño.
- Lo que sí tenemos es el **cliente servido**: la web publicada entrega sus ES modules y sus JSON sin minificar. En `sprint-01/_original-servido/` hay una copia íntegra de esos 66 ficheros, con su sha256 en `sprint-01/_qa/original-hashes.json`.
- Por tanto, este prototipo trabaja sobre el código que ve el navegador, no sobre el fuente. Lo que no se ve desde el navegador (cómo se generan los JSON, los tests de `tests/test_rutas.py`…) sigue sin verificar.

## 1. Módulos inspeccionados (completos, no solo las cabeceras)

| Módulo | Qué hace | Cómo lo usa el atlas |
|---|---|---|
| `js/mapa.js` | `projection()` (grados a km alrededor del centro) y `svgMap()` (un `<path>` por municipio con `data-code`) | **Se reutiliza sin cambios.** Genera los 113 polígonos reales |
| `js/situacion/indicadores.js` | `INDICADORES`: los cinco indicadores (valor, texto, color, altura, fuente, leyenda, muestras) y `ranking()` | **Se reutiliza sin cambios.** Es la única fuente de valores, formato, colores, leyendas y orden |
| `js/store.js` | Orden alfabético de municipios (`localeCompare` es), nombres de tipo y fuentes | **Sin cambios.** Pide `medidas.json`, que por eso se incluye |
| `js/ui.js` | `el`, `es` (formato de número), `sourceLine`, `TYPE_COLORS` | **Sin cambios** |
| `js/comun.js` | `announce` (región `[data-anuncio]`) y `reduced` (prefers-reduced-motion) | **Sin cambios** |
| `js/situacion/mapa-vivo.js` | Mapa vivo: estado propio (`ind`, `code = "48020"`), cinco botones, 2D/3D, ficha mínima, selector «Otro municipio» | **No se importa**: mezcla estado y DOM. Se reproduce su comportamiento (mismos textos, leyenda y fuente) en `atlas/js/main.js` con estado compartido |
| `js/situacion/lista.js` | Lista: otro estado propio (`ind`, `tipo`, `all`), cinco pestañas, filtro de tipo, diez primeros y «Ver los N» | **No se importa**, por la misma razón. Se conservan su orden (`ranking()`), sus textos y su nota de recuento |
| `js/situacion/territorio.js` | Escena 3D (three.js) | **No se usa**: el sprint es 2D primero. Sigue intacto en la web original |
| `js/situacion/portada.js` | Escena de scroll de portada | **No se toca**. Decisión pendiente del autor |
| `js/rutas.js` | `parseHash` y `redirectOf` | **Solo se analiza**: el formato de URL propuesto se prueba contra él (`sprint-02/_qa/rutas.mjs`) |
| `js/situacion/hoja.js`, `cartas.js`, `index.js` | Siete tipos, cartas y montaje de la pestaña | Fuera de alcance: el atlas sustituye solo el bloque del mapa y la lista |
| CSS (`css/situacion.css`, `marco.css`) | Estilos del mapa vivo y la lista | No se reutilizan: el atlas tiene su propia hoja (provisional) |

## 2. Contrato de datos

| Dato | Origen | Clave |
|---|---|---|
| Geometría | `data/municipios.geojson` (113 features) | `properties.code` (INE) |
| Valores, nombre, tipo, comarca, población | `data/municipios.json` (113 entradas) | la misma clave INE |
| Definición, formato, color, escala, leyenda y fuente de cada indicador | `js/situacion/indicadores.js` | `INDICADORES[i]` |
| El problema en Bizkaia (titular, cifra, unidad, fuentes) | `data/resumen.json` → `problemas[]` | `indicador.problema` = `problemas[].id` |
| Nombres de tipo, fuentes, fecha de los datos | `data/meta.json` | `tipos`, `fuentes`, `fecha_datos` |

- Los 113 códigos del GeoJSON y los 113 de `municipios.json` coinciden: sin claves que falten ni colisiones (comprobado en `_qa/regresion.py`).
- Los ausentes siguen la regla de `indicadores.js`: `valor()` devuelve `null` y el municipio sale de `ranking()`. **Nunca se convierte un nulo en cero.**
- Recuentos con dato: **35, 113, 112, 113 y 113** (Alquiler, Entrada, Hogares, Turísticas y Vacías), iguales a los de la auditoría.

## 3. Limitaciones del código original que el atlas resuelve

1. **Tres selecciones de problema independientes**: la escena de portada, el mapa vivo y la lista. Pueden mostrar problemas distintos a la vez. El atlas tiene un único estado.
2. **El mapa no se puede usar con teclado**: `svgMap` pone `role="img"` y los polígonos no reciben foco; la única alternativa es el desplegable «Otro municipio».
3. **«Sin dato» en blanco (`#ffffff`)**, sin trama. Se distingue de los colores bajos, pero no se lee como ausencia sin la leyenda, y la leyenda original no incluye «Sin dato».
4. **La lista lleva directamente a la ficha** (cada fila es un enlace a `#municipios/<INE>`): elegir en la lista hace salir del mapa.
5. **La ficha del mapa vivo arranca en Bilbao** (`code = "48020"`) y no tiene un estado «Bizkaia en conjunto».
6. **No hay URL compartible** del problema ni del municipio elegidos.

## 4. Qué es real y qué es prototipo en `sprint-02/atlas/`

| Parte | Estado |
|---|---|
| Polígonos, valores, colores, escalas, leyendas, recuentos, orden del ranking, textos de indicador y fuente | **Reales**: módulos y JSON originales, idénticos byte a byte |
| Estado compartido, interacción del mapa (hover, foco, flechas, selección, zoom), ficha contextual, franja «Sus cinco problemas», búsqueda | **Prototipo funcional** (código nuevo en `atlas/js/`) |
| Cabecera y menú | Los del Sprint 01 |
| Formato de URL `#situacion/<indicador>/<INE>` | **Propuesta** pendiente de autorizar |
| «Ver su ficha» y las demás pestañas | Abren la web publicada (`#municipios/<INE>`, etc.) |
| Escena de portada y 3D | **No incluidos**. Siguen en la web original y en `sprint-01/preview-a` |
| Estilos (fondos, tipografía, controles) | **Provisionales** (sistema Astara de B v2) |

## 5. Puntos reutilizables para la integración (si se autoriza)

- `atlas/js/mapa-atlas.js` solo depende de `svgMap` y `comun.js`: podría sustituir al lienzo 2D de `mapa-vivo.js` sin tocar `mapa.js`.
- El estado `{ problema, municipio, tipo, búsqueda }` de `atlas/js/main.js` podría ser la fuente única de la pestaña, también para la escena de portada (su etiqueta 3D lee el mismo `INDICADORES`).
- Las pruebas de `sprint-02/_qa/` (navegador, Python y Node) sirven como criterio de aceptación de la integración.
