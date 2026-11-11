# Exportación a PDF (Mejora E)

Archivos: `app/js/exportar.js` (botón y preparación), `app/css/impresion.css` (solo `media="print"`), `app/js/municipios/index.js` (coloca el botón), `_qa/qa-exportar.js` (17 pruebas) y los PDF de ejemplo en `docs/diseno/export/`.

## Qué hace
- **«Exportar a PDF»** en la ficha individual de Municipios (fila propia bajo el encabezado) y en la comparación (junto a «Intercambiar» y «Ver solo …»).
- Al pulsarlo: espera a que se dibujen los mapas de barrios, compone una **cabecera de impresión** (producto, «Ficha de consulta: X» o «Comparación: X y Y», **fechas de los datos** —descarga y revisión—, y la **dirección de la consulta**), un **pie con las fuentes del análisis** (las 20 de `meta.fuentes`, con su dirección) y abre la impresión del navegador. Se elige «Guardar como PDF». El título de la pestaña pasa temporalmente a «Ficha Bilbao · Vivienda en Bizkaia» / «Comparación Bilbao - Barakaldo · …» (es el nombre que propone el navegador) y todo se limpia al terminar.
- **Papel A4 en una columna**, sin cabecera de la aplicación, controles, botones, índice ni banners (los encabezados quedan como tarjetas blancas con el nombre y los datos del original); gráficos y tablas con sus colores (`print-color-adjust: exact`), filas sin partirse entre páginas.
- **Mismos datos y textos que la pantalla:** no se recalcula nada para el PDF; las diferencias de la comparación son las ya calculadas con dato en los dos municipios.
- **Sin servidor:** no se genera ni se envía nada fuera del navegador.

## PDF de ejemplo (generados con Chrome sin cabeza a partir de la propia aplicación; `?imprimir=1` deja la página preparada sin abrir el diálogo)
| Archivo | Caso | Páginas |
|---|---|---|
| `comparacion-bilbao-barakaldo.pdf` | Dos municipios con datos completos (precio observado en los dos) | 7 |
| `comparacion-bilbao-amoroto-alquiler-ausente.pdf` | Uno con el alquiler ausente: «sin dato» y «no comparable» | 7 |
| `comparacion-bilbao-abadino-precio-orientativo.pdf` | Uno con precio orientativo: etiqueta, «Dato aproximado», asterisco y nota original | 7 |
| `ficha-bilbao.pdf` | Ficha individual | 5 |

Revisados página a página (capturas en `capturas/inteligencia/E-pdf-*.png`). El comando: `chrome --headless=new --no-pdf-header-footer --virtual-time-budget=20000 --print-to-pdf=ficha.pdf "http://localhost:4179/?imprimir=1#municipios/48020"`.

## Límites y pendiente
1. **Solo Municipios (ficha y comparación).** Situación, Acceso, Medidas y Normas no tienen exportación: sería otra composición de papel por vista y habría que decidir qué contiene cada una.
2. **El diálogo de impresión depende del navegador** (no se puede probar el botón «Guardar» desde la página); las pruebas comprueban la preparación y la limpieza, y los PDF se generan y revisan aparte. No se ha probado en Safari ni Firefox.
3. **Textos nuevos (propuestos):** «Exportar a PDF», «Ficha de consulta», «Comparación», «Consulta:», «Fuentes del análisis» y la nota del pie («Las fuentes de cada indicador, su metodología y los límites… están en Método»).
4. El pie lista **todas** las fuentes del análisis, no las de cada indicador (no hay esa correspondencia en los datos: véase TRAZABILIDAD.md).
5. Los banners (ilustraciones de IA) **no** se imprimen, a propósito.
