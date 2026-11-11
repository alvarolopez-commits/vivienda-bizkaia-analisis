# Informe · Evolución integral del producto (mejoras A–E)

Rama: `feat/inteligencia-territorial` (local, **sin publicar**), creada desde `ux/home-ecosistema` en `5aa25e1`.
Aplicación: `sprint-03-1/app` (no se ha creado ninguna app, carpeta de sprint ni prototipo nuevos).
Solo escritorio (1440×900 y 1280). No se ha diseñado ni probado móvil.

## 1. Qué se ha hecho

| Bloque | Funcionalidad | Commit |
|---|---|---|
| A | Navegación contextual: Situación, Municipios, Acceso y Medidas conservan el contexto de la consulta (problema, municipio/s, plan) y se enlazan con una fila «Seguir con…» que lleva a la misma consulta en otra vista. Los enlaces solo se ofrecen si hay dato (p. ej. Acceso solo si el municipio tiene datos de compra propios). El enlace externo a la web antigua en Situación pasa a ser interno (`#municipios/<INE>`). | `260447b` |
| B | Consultas compartibles: el botón «Copiar enlace» copia una URL que restaura indicadores, municipios, filtros de Situación (`?tipo=&q=`) y los supuestos compatibles de Acceso (`?lugar=…`). Acceso restaura pulsando sus propios botones: no se ha tocado ninguna fórmula. | `260447b` |
| C | Comparador municipal: dos encabezados diferenciados con banner, selectores, intercambiar, «ver solo…», indicadores enfrentados (diferencia solo con dato en ambos lados y con unidad común), «sin dato» explícito, tabla común de alquilar y comprar con precio observado u orientativo diferenciados, Evolución/Barrios/Plan lado a lado, vuelta a la ficha individual y URL compartible. Sin rankings, sin puntuación agregada y sin «cuál es mejor». | `8ebf7a8` |
| D | Información del dato: componente reutilizable (botón ⓘ + panel) con nombre y definición, fuente, periodo, fecha de revisión, cobertura territorial, naturaleza del valor y enlace a Método. Usado en Situación, Municipios, Acceso, Medidas y Normas. Solo muestra campos reales; los que faltan se documentan, no se inventan. Cierra con Escape, ×, clic fuera, scroll, resize y cambio de ruta. | `0e1c559` |
| E | Exportación a PDF de la ficha de consulta y de la comparación (Municipios): «Exportar a PDF» abre la impresión del navegador con la hoja A4 en una columna, cabecera con producto, título, fechas de los datos y dirección de la consulta, y pie con las fuentes. Los mapas de barrios se esperan antes de imprimir. Todo se limpia en `afterprint`. | `0085568` |

No se han alterado textos, datos, fuentes, conclusiones, criterios, estados jurídicos ni metodología. `calculo-acceso.js`, su fórmula/redondeos, la lógica de puntuación de Medidas y `app/original/` no tienen ningún cambio (comprobado con `git diff --name-only 5aa25e1 HEAD`).

## 2. Archivos

Nuevos: `js/contexto.js`, `js/compartir.js`, `js/info-dato.js`, `js/exportar.js`, `js/municipios/comparador.js`, `css/impresion.css`.
Modificados: `js/app.js`, `js/situacion/index.js`, `js/acceso/index.js`, `js/municipios/index.js`, `js/medidas/index.js`, `js/normas/index.js`, `js/metodo/index.js`, `js/movimiento.js`, `css/marco.css`, `css/situacion.css`, `css/municipios.css`, `css/medidas-diseno.css`, `index.html`.
Pruebas: `_qa/qa-contexto.js`, `qa-comparador.js`, `qa-info.js`, `qa-exportar.js` (nuevas) y ajustes en `qa-vistas`, `qa-navegacion`, `qa-situacion`, `qa-equivalencia`, `qa-banners`, `qa-contraste-vistas`, `integridad.py`.
Documentación: `docs/diseno/COMPARADOR.md`, `TRAZABILIDAD.md`, `EXPORTACION.md` y este informe.
Total A–E: 48 archivos, +1.397 / −42 líneas.

## 3. Pruebas (navegador integrado, escritorio)

Cada suite se ejecuta desde una carga limpia. Resultado final:

| Suite | 1440×900 | 1280 |
|---|---|---|
| qa-situacion | 101/101 | — |
| qa-contraste | 31/31 | — |
| qa-vistas | 48/48 | 48/48 (tanda anterior) |
| qa-contraste-vistas | 108/108 | — |
| qa-navegacion | 41/41 | — |
| qa-desborde | 12/12 | 12/12 |
| qa-banners | 46/46 | — |
| qa-comparador | 35/35 | 35/35 |
| qa-contexto | 32/32 | 32/32 |
| qa-info | 74/74 | 74/74 |
| qa-exportar | 17/17 | — |
| qa-movimiento | 27/27 | — |
| qa-equivalencia / flujos / disenos / inicio | 30 / 74 / 33 / 36 (tanda anterior) | — |
| `integridad.py` | 21/21 | — |

Notas honestas:
- Encadenar todas las suites en una sola carga provoca interferencias de orden (títulos de pestaña, clases de entrada de movimiento): los dos fallos que aparecieron en la cadena desaparecieron al ejecutar cada suite sola. En `qa-exportar` el fallo era un defecto de la prueba (leía el título antes de navegar) y está corregido.
- qa-equivalencia, flujos, disenos e inicio y las pasadas a 1280 de vistas se midieron en la tanda anterior a la última edición de E; no se repitieron una a una en esta última pasada.
- Casos cubiertos en C: pareja con datos completos, alquiler ausente (Amoroto), precio orientativo (Abadino), cambio de municipios, recarga y restauración por URL.
- La ventana de impresión del navegador no se puede probar desde la página; los PDF se generan con `chrome --headless=new --no-pdf-header-footer --virtual-time-budget=20000 --print-to-pdf` (o con `?imprimir=1`) y se han revisado a mano rasterizados.
- Safari y Firefox no se han probado.

## 4. Capturas y ejemplos reales (escritorio)

`docs/diseno/capturas/inteligencia/`: `A-situacion-contexto`, `A-municipios-contexto`, `B-acceso-url`, `C-comparador-bilbao-barakaldo`, `C-comparador-alquiler-ausente-amoroto`, `C-comparador-precio-orientativo-abadino`, `D-info-situacion-alquiler`, `D-info-municipios-indicador-sin-fuente`, `E-pdf-c1-p1`, `E-pdf-c3-p3`, `E-pdf-f1-p1`.
PDF de muestra en `docs/diseno/export/`: `comparacion-bilbao-barakaldo.pdf`, `comparacion-bilbao-amoroto-alquiler-ausente.pdf`, `comparacion-bilbao-abadino-precio-orientativo.pdf`, `ficha-bilbao.pdf`.

## 5. Problemas pendientes y límites

- **Evolución, Problemas y Plan en el comparador**: se muestran lado a lado, sin cruce calculado; una comparación real requiere criterio del autor y un modelo de datos compatible (documentado en `COMPARADOR.md`).
- **Información del dato (D)**: los 13 indicadores de Municipios no traen fuente, definición ni naturaleza propias; las fechas son del conjunto de datos, no por indicador. No existe clasificación «dato oficial». Esos campos aparecen como no disponibles en el panel.
- **Exportación (E)** solo en Municipios (ficha y comparación); no hay export en Situación, Acceso, Medidas ni Normas.
- Los periodos mostrados se extraen por expresión regular de los textos de fuente/etiqueta existentes.

## 6. Decisiones que necesitan su aprobación

1. Textos nuevos de interfaz, marcados con `data-propuesta`: «Copiar enlace», «Seguir con…», «Ver en el mapa», «Su ficha», «Calcular la compra», «Medidas de su plan», «Intercambiar», «Ver solo…», «Diferencia (B − A)», «no comparable», «Precio observado / orientativo», etiquetas y notas del panel de información, «Exportar a PDF» y textos de cabecera/pie de impresión.
2. Unidad «puntos» frente a «pp» en las diferencias de porcentajes.
3. Criterio del autor para comparar Evolución, Problemas y Plan.
4. Tabla de fuente/definición/naturaleza por cada uno de los 13 indicadores municipales.
5. Si se quiere exportación en el resto de vistas.
6. Logotipo: el PNG aprobado en cabecera tiene colores aprox. `#022443`/`#00A5AA`, distintos de los `#102E50`/`#11B9B6` del encargo; las propuestas SVG con los colores exactos no llevan texto. No se ha improvisado. Además, el punto 2 de la corrección del logotipo («Integración en la nueva home: La nueva portada cinematográfica debe…») llegó cortado: falta ese texto.
7. Publicación: subir la rama a GitHub y, después, si se cambia el origen de GitHub Pages. Nada de esto se ha hecho.

## 7. Cómo ejecutarlo en local

```bash
python sprint-03-1/servidor.py
```

(Es el servidor que usa `.claude/launch.json`, en el puerto 4179; también sirve `/_qa/`.) Abrir `http://localhost:4179/`. Rutas útiles: `#situacion/alquiler/48020`, `#municipios/48020-48013` (comparador), `#acceso?lugar=48020`, `#medidas`. Para preparar un PDF desde línea de órdenes, añadir `?imprimir=1` a una ficha o comparación y usar `chrome --headless=new --print-to-pdf`.
Las suites de `sprint-03-1/_qa/` se cargan en el navegador con la app abierta, por ejemplo `import('/_qa/qa-comparador.js').then(m => m.run())`.
