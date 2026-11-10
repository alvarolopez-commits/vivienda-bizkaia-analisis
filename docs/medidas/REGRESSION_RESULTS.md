# REGRESSION_RESULTS · Pruebas del Explorador de Medidas

**Sprint 03 · 10-11-2026.** Resultados reales de esta sesión; nada estimado. Solo escritorio (1440 × 900 y 1280 × 800): no se ha probado ni desarrollado móvil, como se pidió.

## Cómo repetirlas

```bash
python -I sprint-03/_qa/regresion.py
```
```bash
node sprint-03/_qa/rutas.mjs
```
```bash
node sprint-01/_qa/baseline.mjs
```
En el navegador, con el explorador abierto en http://localhost:4178/medidas/ (consola):
```js
JSON.stringify(await (await import('/_qa/qa-equivalencia.js')).run())
JSON.stringify(await (await import('/_qa/qa-flujos.js')).run())
```
Todas las pruebas usan solo lo que está en el repositorio: `sprint-03/medidas/original/` y el manifiesto `sprint-01/_qa/original-hashes.json` (la copia completa de la web, `sprint-01/_original-servido/`, no se sube y no hace falta).

## Resultados

| Prueba | Qué comprueba | Resultado |
|---|---|---|
| `_qa/regresion.py` (Python, independiente del JS del prototipo) | sha256 de los 18 ficheros de `original/`; línea base de los datos; la nota ponderada y el orden **reimplementados desde los JSON** contra el orden que registró la matriz original; 37 literales; sin cifras escritas a mano; alcance del cambio | **72 PASS, 0 FAIL** |
| `_qa/rutas.mjs` (Node, `rutas.js` original) | 7 rutas × 6 formas de query dan lo mismo que sin query; redirecciones antiguas intactas | **19 PASS, 0 FAIL** |
| `_qa/qa-equivalencia.js` (navegador, oráculo = módulos originales servidos) | Ver «Equivalencia» | **30 PASS, 0 FAIL** a 1440 y a 1280 px |
| `_qa/qa-flujos.js` (navegador) | Datos, rutas, seis herramientas a ≤ 2 acciones, selección, bandeja, filtro que oculta una elegida, estado vacío, Plano ↔ Matriz, atrás, comparar, URL, teclado, maquetación y que no salga «null» | **74 PASS, 0 FAIL** a 1440 y a 1280 px |
| `sprint-01/_qa/baseline.mjs` | Línea base del Sprint 01 | **20 PASS** (sigue intacta) |

### Equivalencia con la web original (el núcleo del sprint)

Se monta cada módulo original aparte, se manejan sus controles como un lector y se compara lo que dibuja con lo que dibuja el explorador para el mismo estado:

- **Matriz:** 34 filas, mismo orden y mismas 12 celdas con 5 configuraciones fijas (sin pesos, y cuatro de pesos) y **60 configuraciones aleatorias reproducibles** de filtros + pesos: idénticas. «Quitar los pesos» devuelve el orden por línea e ID. La reimplementación en Python da los mismos órdenes que la matriz original.
- **Plano:** las 34 burbujas con el mismo `cx`, `cy`, `r`, color y número; los 14 filtros (7 líneas × aplicable ya) encienden las mismas burbujas.
- **Cadena y Quién decide:** los 13 diagramas (6 + «Todas» y 6) con columnas, textos y enlaces idénticos.
- **Criterios y comparación:** las 12 filas de las 34 fichas y 4 comparaciones, iguales a `criteria()` y `compare()` originales.
- **Textos:** cabecera, frase del Plano y notas de la Matriz idénticos; las 34 fichas completas con `que_hace`, `evidencia_detalle`, `por_que`, `kpi`, `riesgos` y las 115 fuentes enteros; las 4 alternativas con todos sus campos.
- **La prueba no es decorativa:** al **alterar a propósito un coeficiente** (`NORM.evidencia.Alta = 0.1`), 3 pruebas fallan; al restaurarlo, vuelven a pasar. Las cinco configuraciones de pesos dan cinco órdenes distintos (no se compara «lo mismo vacío»).

### Tres casos del conjunto real (sin valores manuales)

Registrados de la matriz original en `_qa/caracterizacion.json` (orden completo de las 34, empates incluidos):

| Caso | Primeras cinco medidas |
|---|---|
| Evidencia 3 | M08, M10, M01, M03, M04 |
| Viabilidad 3 + plazo 2 | M01, M02, M03, M04, M06 |
| Evidencia 2, viabilidad 1, plazo 1, coste 3, alcance 2 | M10, M01, M27, M24, M09 |

## Línea base AS-IS (caracterización del comportamiento actual)

| Dato | Valor | Verificado en |
|---|---|---|
| Medidas | 34 (M01 a M34, sin duplicados ni huecos) | `regresion.py`, `qa-flujos.js` |
| Viabilidad | 30 instrumento existente · 4 norma vasca o foral | ídem |
| Sin magnitud declarada | 17 | ídem |
| `en_plan:false` | M33 y M34 (se mantienen en Plano y Matriz) | ídem |
| Catálogos | 6 líneas · 5 mecanismos · 5 decide · 3 papeles BM30 | ídem |
| Alternativas | 4 (separadas de las 34) | ídem |
| Rutas | `#medidas`, `#medidas/M06`, `#medidas/M01-M06(-M20)`, `#medidas/alternativas` + 6 casos no válidos | `qa-flujos.js` (15 casos) y `rutas.mjs` |
| `first()` recorta | `que_hace` en 11 de 34; `evidencia_detalle` en 17 de 34 | `_qa/hechos.py` |
| `watch()` difiere del KPI completo | 34 de 34 | ídem |

## Diferencias respecto al original (todas intencionadas)

1. Los textos largos del panel y de la ficha van **enteros** (la ficha original recortaba 11 y 17 de 34).
2. «Riesgos» y «Fuentes» se muestran (existen en el JSON; la ficha original no los enseñaba).
3. Los cinco criterios valen para Plano **y** Matriz (en el original, el Plano solo tenía dos); «aplicable ya» pasa a la Matriz.
4. La nota (0 a 1) se enseña, solo con pesos.
5. Un clic en una burbuja abre un panel en vez de navegar a la ficha (la ficha sigue a un clic: «Abrir ficha completa»).
6. Las direcciones aceptan una query de contexto.

Ninguna diferencia toca un dato, una fórmula, un peso, un redondeo ni un resultado.

## Rendimiento (medido)

Windows 10 Pro, 20 hilos lógicos; Chrome 152 (panel del escritorio de Claude); 1440 × 900; servidor local sin caché.

| Medida | Valor |
|---|---|
| `DOMContentLoaded` (carga sin caché) | 1.600 ms |
| Datos descargados | `municipios.json` 962 KB, `municipios.geojson` 239 KB, `medidas.json` 238 KB, `meta.json` 16 KB, `ideas.json` 4 KB |
| Filtrar el Plano (`render()`, 20 cambios) | mediana 0,7 ms · máximo 1,9 ms |
| Recalcular la Matriz con pesos (20 cambios, 34 filas) | mediana 1,7 ms · máximo 2,7 ms |
| Abrir el panel de una medida (20 aperturas) | mediana 3,5 ms · máximo 8,8 ms |

**Nota:** `municipios.json` (962 KB) se carga solo para el mapa de estado de la ficha y la población del tamaño de las burbujas; en la web real ya estaría cargado. `store.js` lo exige además de `medidas.json`.

## Preguntas pendientes (no bloquean el prototipo)

Ver `UX_DECISIONS.md` §7. Resumen: repositorio fuente y pruebas del pipeline; significado del papel BM30; si el orden editorial es definitivo; autorización del formato de URL; extensión de filtros al Plano; sistema de diseño de Astara.

## No cubierto

Lector de pantalla real, Safari y Firefox, y pruebas con usuarios. **Móvil: no se ha probado** (aplazado expresamente).
