# AS_IS_TO_BE · De las seis herramientas a un explorador

**Sprint 03 · Explorador de Medidas · 10-11-2026 · PROTOTIPO de escritorio, no integrado.**
Qué conserva, qué mejora y qué no se toca. Todo lo del «AS-IS» se ha leído en el código servido, completo, no solo en las cabeceras.

## 0. Procedencia del código (verificado, no supuesto)

- **No tenemos el repositorio fuente de la web publicada** (pipeline `analysis/`, pruebas, configuración de Vercel). El repositorio `vivienda-bizkaia-analisis` es nuestro, de rediseño.
- Lo que sí hay es el **cliente servido**: la web entrega sus ES modules y sus JSON sin minificar. Se copió a `sprint-01/_original-servido/` (66 ficheros, sha256 en `sprint-01/_qa/original-hashes.json`, fuera de git).
- Este sprint usa **18 ficheros** de esa copia, byte a byte, en `sprint-03/medidas/original/` (todos con su sha256 comprobado en `_qa/regresion.py`):
  - `js/matriz.js`, `js/alternativas.js`, `js/estado.js`, `js/store.js`, `js/ui.js`, `js/comun.js`, `js/mapa.js`, `js/movimiento.js`, `js/rutas.js`.
  - `js/medidas/index.js`, `burbujas.js`, `ficha.js`, `enlaces.js`.
  - Datos: `medidas.json`, `ideas.json`, `meta.json`, `municipios.json`, `municipios.geojson`.
- **Punto de partida:** rama `ux/sprint-03-explorador-medidas`, creada desde `ux/sprint-02-living-atlas` (`2c9093f`). Sin merges ni despliegues.
- **Limitación:** no se ha podido ver el pipeline que genera `medidas.json` (ni el `analysis/` que alimenta los textos) ni las pruebas originales. Todo lo que se afirma sobre contenido se refiere a lo que sirve la web, no a su fuente.

## 1. AS-IS: lo que hace hoy `#medidas`

Todo en una sola página larga (`js/medidas/index.js`, función `generalView`), con seis bloques que no comparten estado:

| # | Bloque | Código | Estado propio | Limitación comprobada |
|---|---|---|---|---|
| 1 | **Plano** evidencia × plazo | `medidas/burbujas.js` | `st = { linea, ya }` | No sabe de la Matriz; clic navega a la ficha (sale de la página) |
| 2 | **Matriz** (12 columnas) | `matriz.js` | `state = { linea, mecanismo, decide, papel, weights }` | Filtros y pesos locales; sin mensaje propio para 0 resultados; sin URL |
| 3 | **Cadena** problema → medida → qué vigilar | `medidas/enlaces.js` + `index.js::chain` | línea elegida | `watch()` abrevia el indicador (34 de 34 difieren del texto completo) |
| 4 | **Quién decide** | `index.js::deciders` | línea elegida | Experiencia separada |
| 5 | **Comparar** | `index.js::chooser` + `ficha.js::compare` | tres `select` | Los filtros y la selección no le llegan; solo se llega por rutas hash |
| 6 | **Alternativas** | `alternativas.js` + `ideas.json` | ninguno | (Debe quedarse aparte de las 34 medidas) |

**Fichas (`#medidas/M06`)**: `ficha.js` pinta criterios, cuatro textos y un mapa de estado. Muestra de cada texto **solo las dos primeras frases** (`first()`): en 11 de 34 medidas se recorta «Qué hace» y en 17 de 34 «Si ha funcionado». El texto completo está en el JSON, pero no en la ficha («el texto largo está en el informe», según el comentario del propio módulo).

**Rutas del AS-IS (todas conservadas):** `#medidas`, `#medidas/M06`, `#medidas/M01-M06` y `#medidas/M01-M06-M20`, y `#medidas/alternativas`. Ids no válidos se ignoran; repetidos se eliminan; como mucho tres.

## 2. TO-BE: qué pasa con cada bloque

| AS-IS (módulo) | TO-BE (componente nuevo) | Se conserva | Mejora |
|---|---|---|---|
| `burbujas.js` | `js/plano.js` | Rejilla, posición, radio y color de las 34 burbujas **idénticos** (comprobado burbuja a burbuja con el original). Eje, filtros de línea y «aplicable ya» | Sin estado propio: lo gobiernan los criterios compartidos; selección con aro; clic abre un panel en vez de salir; foco y teclado |
| `matriz.js` | `js/matriz-vista.js` + `js/calculo.js` | Las 12 columnas, el contenido de cada celda y los 4 filtros; pesos 0 a 3; orden por línea/ID sin pesos; `scorer` y `ordered` **sin cambios** | Cabecera y primeras columnas fijas; scroll horizontal dentro de la tabla; casilla de selección; nota visible solo con pesos |
| `chain()` / `deciders()` / `enlaces.js` | `js/entender.js` | Los diagramas completos (`linkDiagram` original) y sus textos de sección | Línea en el estado y la URL; la medida abierta se marca; el indicador completo se ve bajo la cadena |
| `chooser()` + `compare()` | `js/comparar.js` + bandeja | Las 12 filas de `criteria()` (la función original) | Bandeja de 1 a 3; filas de texto largo; «difieren» factual; copiar enlace; retirar medidas |
| `ficha.js` (`first()` recorta) | `js/detalle.js` (panel y ficha completa) | `criteria()`, los cuatro textos y el mapa de estado (`stateMap` copiado sin cambios) | **Textos íntegros** con «Leer más»; riesgos y fuentes del JSON; panel sin salir de la exploración |
| `alternativas.js` | La función original, importada | Las 4 ideas, sus motivos y fuentes | Solo se ha movido a su pestaña |
| Router (`rutas.js`, `index.js::show`) | `js/estado-app.js` | Todas las rutas | Contexto en la query (ver `STATE_AND_URL.md`) |

## 3. Qué se ha añadido, en una línea

Un **panel de criterios** común, un **estado de selección** persistente de 1 a 3, un **panel contextual** no modal, una **bandeja de comparación** y cuatro modos de navegación (Explorar, Entender, Comparar, Alternativas). Cada una de las seis herramientas queda a **dos acciones como máximo** desde `#medidas` (comprobado).

## 4. Qué no se ha tocado

- `data/medidas.json` y `data/ideas.json`: sha256 idéntico.
- `js/calculo-acceso.js`, `situacion/`, `municipios/`, `normas.js`, `view-metodo.js`, `glosario.js`: ni se han copiado ni se usan.
- Fórmulas (`NORM`, `WEIGHTS`, `reach`, `scorer`, `ordered`): copiadas **literalmente** a `js/calculo.js`; su equivalencia con la matriz original se prueba (ver `REGRESSION_RESULTS.md`).
- Estados jurídicos, textos de BM30, orden editorial y los datos de las 4 alternativas.
- La web publicada y el despliegue.
