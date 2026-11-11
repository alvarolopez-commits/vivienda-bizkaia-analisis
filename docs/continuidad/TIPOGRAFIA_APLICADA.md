# TIPOGRAFIA_APLICADA · Sistema tipográfico único en la app integrada

**Sprint 03.1 · 11-11-2026 · escritorio (1440 × 900) · sin móvil · sin publicar · sin commit.**
Fuente: `00_DESIGN_SYSTEM_TIPOGRAFIA_SPRINT_02_03_v1.md` y `TIPOGRAFIA_PATCH_SPRINT_02_03_v1.zip`.

## 1. Qué se hizo

1. **Comparar antes de sustituir.** El parche se extrajo aparte y se comparó con los ficheros actuales del repositorio. Las únicas diferencias eran las líneas tipográficas del parche: los ficheros no habían evolucionado desde los `.rar`. Se trasladó **por diff** (`sprint-03-1/tools/aplicar_tipografia.py`), exigiendo que cada línea apareciera una sola vez: **15 líneas** (5 en Situación, 10 en Medidas).
2. **Un único archivo de tokens:** `app/css/typography.css` (idéntico al del parche, más una regla, ver §3). Ninguna otra hoja define `--font-heading`, `--font-body`, `--font-number`, `--font-code` ni los alias `--f-*` (se retiraron de `marco.css`).
3. **Una sola aplicación** (`sprint-03-1/app/`, http://localhost:4179/): Situación (Sprint 02) y Medidas (Sprint 03) en el mismo marco. Las dos vistas cargan la misma hoja tipográfica; no hay dos copias que mantener.
4. **Sin tocar** JS de lógica, JSON, GeoJSON, textos, fórmulas ni estados de filtros (ver «Integridad»).

## 2. Reglas del sistema y cómo se cumplen

| Regla | Resultado medido (estilos calculados, 7 estados, 293 a 1.040 elementos con texto por estado) |
|---|---|
| Montserrat solo en titulares y encabezados | En `h1–h6` y **dos titulares sin etiqueta h** (ver §4). Marca de la cabecera, enlaces del menú, botón «×», pestañas, contadores e IDs: Geist |
| Geist en texto, navegación, controles, tablas y todas las cifras | **0 elementos con cifras fuera de Geist** (cifra protagonista, `.ficha-valor`, cobertura, ranking, leyendas, tooltips, matriz, IDs, contadores, SVG) |
| Geist Mono solo para código | **0 usos** (no hay `code`, `pre`, `kbd` ni `samp` en la app) |
| `lining-nums tabular-nums` | **0 elementos con cifras sin tabulares** (ver §3) |
| Pesos | Geist solo en **400, 500 y 600** (los que se cargan: sin negrita sintetizada); Montserrat solo en 600 |

Tamaños y pesos por rol, tal como estaban (un KPI protagonista sigue a 40 px; una cifra de tabla a 13 px):

| Rol | Estilo calculado |
|---|---|
| Titular de página (Situación / Medidas) | Montserrat 600 · 41,6 px / 36 px |
| Nombre de municipio y título de medida | Montserrat 600 · 30 px / 22 px |
| Cifra protagonista (34 de 35) | **Geist 600 · 40 px** |
| Valor grande de la ficha (55,8 %) | **Geist 600 · 33,8 px** |
| Contador (34 de 34) | **Geist 600 · 22 px** |
| Ranking: valor / puesto / nombre | Geist 500 · 13 px / 400 · 12 px / 600 · 14 px |
| Leyenda y «N con dato» | Geist 400 · 12 px |
| Tooltip: nombre / valor | Geist 600 · 13–14 px / 400 · 12–12,5 px |
| Matriz: cabecera / cifras / medida | Geist 600 · 13 px / 400 · 13 px / 600 · 13 px |
| Burbuja (SVG) y eje del Plano (SVG) | Geist 600 · 15 px / 19 px |
| ID de medida (panel, bandeja, comparador) | Geist 600 · 14 px |

## 3. Un hallazgo: la norma de cifras no llegaba a casi ninguna cifra

El parche pone `font-variant-numeric: lining-nums tabular-nums` en `body, button, input, select, textarea, table, svg text`. Pero el atajo `font:` que usan casi todas las reglas de la UI **reinicia** `font-variant-numeric`. Medido: solo la matriz (por estar en una `table`) tenía cifras tabulares; la cifra protagonista, el ranking, los contadores y las leyendas no.

**Corrección** (una regla al final de `typography.css`): `*, *::before, *::after { font-variant-numeric: lining-nums tabular-nums !important; }`. Lleva `!important` porque es el único modo de ganar al atajo en cualquier hoja de vista. No cambia ningún número, unidad ni formato, solo el diseño de los dígitos.

## 4. Decisiones y diferencias deliberadas (revisar)

| # | Qué | Por qué |
|---|---|---|
| 1 | **La marca «Vivienda en Bizkaia» de la cabecera pasa de Montserrat a Geist 600** | No es un titular. El parche la dejaba en Montserrat; la regla «únicamente titulares» no la ampara. Se revierte con una línea (`.marca` en `marco.css`) |
| 2 | **Los enlaces grandes del menú desplegable pasan a Geist 600** | Son navegación; la regla pide Geist. Mismo tamaño y peso |
| 3 | Botón «×» del comparador y texto solo para lectores de pantalla: Geist | Heredaban Montserrat de la cabecera de columna |
| 4 | `.sub b` («30 de 34») con peso 600 explícito | Geist se carga hasta 600; con el 700 por defecto del `<b>` el navegador elige 600 igualmente, así queda explícito |
| 5 | **Siguen en Montserrat dos titulares que no son `h1–h6`:** el título del mapa de Situación («Parte de unos ingresos bajos…», un `<p>`) y los nombres de medida en la cabecera de columna del comparador | Son titulares por función. Convertirlos en `h2/h3` cambiaría el marcado y la lógica del DOM; no se ha hecho |
| 6 | Los pesos de `.burbuja .id` y `.medida-id` pasan de 700 a 600 (como indica el parche) | Evita síntesis de negrita |

## 5. Carga de fuentes

La página pide las tres familias con el mismo enlace de Google Fonts que antes (sin cambiar fallbacks ni activos). En el navegador: `Geist 400/500/600` y `Montserrat 600` **cargadas** (`document.fonts`), `document.fonts.check` verdadero para las tres. **Geist Mono 400 no se carga, y es lo esperado**: no hay ningún elemento de código en la aplicación. Montserrat 500 y 700 se declaran pero no se usan. Sin bloqueos de red.

## 6. Archivos modificados

Todo vive en una rama local sin commit. Respecto a los Sprint 02 y 03 no se ha modificado ningún fichero de ellos; la aplicación integrada es una carpeta nueva.

**Hojas de estilo (el cambio tipográfico):**
- `sprint-03-1/app/css/typography.css` (nuevo, único)
- `sprint-03-1/app/css/marco.css` (cabecera, menú y tokens compartidos; sin definiciones de familia; `.marca` y `.menu-lista a` a Geist)
- `sprint-03-1/app/css/situacion.css` (5 líneas del parche)
- `sprint-03-1/app/css/medidas.css` (10 líneas del parche + `.quitar`, `.sr-only` de la cabecera del comparador y `.sub b`)
- `sprint-03-1/app/index.html` (enlaza `typography.css`)

**Integración (necesaria para aplicar el sistema «a la versión integrada»):** `app/js/app.js`, `app/js/datos.js`, `app/js/nav.js`, `app/js/situacion/index.js` y `plantilla.html`, `app/js/medidas/index.js` y `plantilla.html`, `sprint-03-1/servidor.py`, `.claude/launch.json`, `.gitattributes`.

**Copias sin cambios de lógica** (idénticas a su sprint salvo la ruta de importación): `app/js/situacion/mapa-atlas.js` y `app/js/medidas/{calculo,comparar,detalle,entender,estado-app,matriz-vista,plano}.js`. **`app/original/`**: 20 ficheros idénticos a la web servida.

**Pruebas:** `sprint-03-1/_qa/*`. **Capturas:** `docs/continuidad/capturas/final/`. Las capturas «antes/después» de esta fase y los scripts de aplicación se retiraron en la limpieza del 11-11-2026; siguen en el historial de git.

## 7. Comprobaciones realizadas (escritorio, 1440 × 900)

| Prueba | Qué comprueba | Resultado |
|---|---|---|
| `_qa/qa-tipografia.js` (estilos calculados) | Familias, pesos y cifras tabulares en Situación (3 estados, con tooltip) y Medidas (Plano con panel, Matriz con pesos, Comparar, Entender, Alternativas); tokens en una sola hoja; carga de fuentes | **PASS**: 0 cifras fuera de Geist, 0 sin tabulares, 0 Geist Mono, 0 Montserrat fuera de titulares (salvo §4.5) |
| `_qa/integridad.py` | 20 originales sha256; JSON y GeoJSON sin cambios; 8 módulos JS idénticos salvo ruta; los dos `main.js` convertidos difieren en 25 y 32 líneas (montaje y oyentes); CSS: solo líneas de familia/peso; una sola definición de las familias | **PASS 22 de 22** |
| `_qa/qa-situacion.js` (suite del Sprint 02) | Living Atlas: 113 polígonos, cinco problemas, colores, leyendas, recuentos, ranking, ficha, búsqueda, teclado, URL | **PASS 101 de 101** |
| `_qa/qa-equivalencia.js` (suite del Sprint 03) | Matriz, Plano, Cadena, Quién decide, criterios y fichas idénticos a la web original | **PASS 30 de 30** |
| `_qa/qa-flujos.js` (suite del Sprint 03) | 34 medidas, rutas, filtros, pesos, comparación 2–3, bandeja, teclado, maquetación sin desbordes | **PASS 74 de 74** |
| `_qa/qa-navegacion.js` | Situación ↔ Medidas por clics, un solo marco y una sola vista montada, deep links de los dos sprints, atrás/adelante, sin enlaces a la web antigua | **PASS 29 de 29** |
| Revisión visual a 1440 × 900 | Cifras grandes, leyendas, tooltips, ranking, matriz, plano, comparador (capturas antes/después) | **HECHO** (sin desbordes ni textos cortados) |
| Móvil, 1280 px, lector de pantalla, Safari y Firefox | — | **PENDIENTE / no se ha hecho** (móvil excluido expresamente) |

Las capturas «antes» salen de los prototipos originales de los Sprint 02 y 03 (tipografía anterior) y las «después» de la app integrada, con `--force-prefers-reduced-motion` (sin él, la animación de entrada del mapa queda a medias en la captura sin interfaz).
