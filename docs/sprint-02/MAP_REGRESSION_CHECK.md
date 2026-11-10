# MAP_REGRESSION_CHECK · Comprobaciones del Living Atlas

**Sprint 02 · 10-11-2026.** Resultados reales de esta sesión; nada estimado.

## Cómo repetirlas

```bash
python -I sprint-02/_qa/regresion.py
```
```bash
node sprint-02/_qa/rutas.mjs
```
```bash
node sprint-01/_qa/baseline.mjs
```
En el navegador, con el prototipo abierto en http://localhost:4177/atlas/ (consola):
```js
JSON.stringify(await (await import('/_qa/qa-atlas.js')).run())
JSON.stringify((await import('/_qa/qa-layout.js')).run())
```

## Resultados

| Prueba | Qué comprueba | Resultado |
|---|---|---|
| `_qa/regresion.py` (Python, independiente del JS del prototipo) | sha256 de los 10 ficheros de `atlas/original/` contra la web servida; recuentos calculados desde `municipios.json` con las reglas de `indicadores.js`; códigos INE del GeoJSON y de `municipios.json`; valores de Bilbao; 17 literales que el prototipo presenta como originales; ninguna cifra del análisis escrita a mano en el código; `indicadores.js` no duplicado | **42 PASS, 0 FAIL** |
| `_qa/qa-atlas.js` (navegador, 1440 × 900) | 113 polígonos y claves; por cada problema: recuento, «N con dato», color de cada municipio = `color()` original, trama en los sin dato, título, leyenda, cobertura, orden y valor de la lista, nota de `lista.js`, «N sin dato» y URL; selección desde el mapa, la lista y la búsqueda; persistencia al cambiar de problema; sin dato; aproximado; filtro de tipo; teclado (tabindex itinerante, flechas, Enter y Escape); zoom y Restablecer; deep link; literales | **101 PASS, 0 FAIL** |
| `_qa/qa-atlas.js` (navegador, 375 × 812) | Lo mismo con la lista corta | **101 PASS, 0 FAIL** |
| `_qa/rutas.mjs` (Node, `rutas.js` original) | Formato propuesto `#situacion/<indicador>/<INE>`, rutas actuales (`#municipios/<INE>`, comparar, alternativas) y las 8 redirecciones antiguas de `SITEMAP_AS_IS.md` | **15 PASS, 0 FAIL** |
| `sprint-01/_qa/baseline.mjs` | Línea base del Sprint 01 (sigue intacta) | **20 PASS** |
| `_qa/qa-layout.js` | Scroll horizontal, controles de menos de 36 px, problemas visibles y tamaño del mapa a 320, 390, 720 (zoom del 200 % sobre 1440), 1024, 1280 y 1440 px | **Sin desbordes ni controles pequeños** en los seis anchos |

## Conteos y valores muestrales

| Problema | Con dato | Sin dato | Bilbao (texto de `indicadores.js`) |
|---|---|---|---|
| Alquiler | 35 | 78 | 55,8 % |
| Entrada | 113 | 0 | 12,5 a 19,4 años |
| Hogares | 112 | 1 (Usansolo, 48916) | +1,6 puntos |
| Turísticas | 113 | 0 | 6,1 por 1.000 |
| Vacías | 113 | 0 | 10,0 % |

Iguales a la auditoría (`docs/audit/DATA_AND_FORMULAS.md`). Usansolo coincide con `meta.oferta_bizkaia.municipios_sin_dato`.

## Datos, fórmulas y textos: cambios

- **JSON y GeoJSON**: 0 cambios (sha256 idéntico).
- **`indicadores.js`, `mapa.js`, `store.js`, `ui.js` y `comun.js`**: 0 cambios (sha256 idéntico).
- **`calculo-acceso.js`, fórmulas, redondeos, umbrales del 30 % y los 10 años, estados jurídicos**: no se usan ni se tocan.
- **Escalas y colores**: los de `color()`, `leyenda` y `muestras` originales. Solo cambia la presentación de «Sin dato»: trama sobre el mismo blanco.
- **Textos**: los nuevos están en `LIVING_ATLAS_UX_DECISIONS.md §5` y llevan `data-propuesta`. El resto son literales comprobados.
- **Web publicada y despliegues**: no se han tocado.

## Rendimiento (medido, no estimado)

Equipo: Windows 10 Pro, 20 hilos lógicos. Navegador: Chrome 152 (panel del escritorio de Claude), 1440 × 900. Servidor local `sprint-02/servidor.py`, sin caché.

| Medida | Valor |
|---|---|
| `DOMContentLoaded` (primera carga, sin caché) | 1.207 ms |
| Datos descargados | municipios.json 962 KB, municipios.geojson 239 KB, medidas.json 238 KB, meta.json 16 KB, resumen.json 7 KB (264 a 312 ms en paralelo, local) |
| Cambiar de problema (trabajo síncrono de `set()`) | 0,2 / 18,5 / 11,2 / 16,1 / 12,8 ms |
| Hover (por evento `pointermove`) | 0,8 ms |
| Tareas largas (más de 50 ms) durante los cambios | ninguna |

**Nota:** `medidas.json` (238 KB) se carga solo porque lo pide `store.js`. Al integrar, la página ya lo tiene cargado.

**Observación:** con el panel del navegador oculto, `requestAnimationFrame` se frena. Las transiciones de color y de zoom tienen una red de seguridad (`setTimeout`) que fija el estado final.

## Capturas reales (Chrome sin interfaz, `docs/sprint-02/capturas/`)

| Fichero | Qué muestra |
|---|---|
| `01-escritorio-1440x900-primera-vista.png` | Lo que se ve al abrir, a 1440 × 900 |
| `02-escritorio-1440x1140-bizkaia-alquiler.png` | Escenario completo, Alquiler, sin municipio (ficha «El problema en Bizkaia») |
| `03-escritorio-1440x1140-bilbao-alquiler.png` | Bilbao elegido |
| `04-escritorio-1440x1140-getxo-turisticas.png` | Getxo en Turísticas |
| `05-escritorio-1440x1140-abadino-entrada-aproximado.png` | Dato aproximado (asterisco y nota literal) |
| `06-escritorio-1440x1140-hogares-sin-dato.png` | Usansolo, único municipio sin dato en Hogares |

Las capturas de 1440 × 1140 usan una ventana más alta para que quepa el escenario entero (mapa, leyenda y panel). No hay capturas de móvil: el móvil quedó aparcado a petición del usuario.

## No cubierto

Lector de pantalla real, Safari y Firefox, dispositivos táctiles reales y prueba con usuarios.
