# PROTOTIPO_RADAR_NOTAS · Situación e Indicadores del Radar (escritorio)

**Qué es:** prototipo de diseño de dos vistas del Radar (Situación e Indicadores) en `prototipo-radar/`, con el lenguaje visual del dashboard PCI (`alvarolopez-commits/pci-dashboard`, v4 del 2026-10-21). No es el Radar publicado ni la migración fiel. No toca producción.
**Cómo verlo:**
```bash
python3 -m http.server 4174 --bind 127.0.0.1 --directory prototipo-radar
```
Abre http://localhost:4174/ (con `?marcar` se rodea en naranja lo nuevo). Sin servidor no cargan los datos, porque usa `fetch`.
**Revisado:** Chromium a 1440 px. Sin errores de consola. Cifras comparadas con el Radar publicado (ver §4).

## 1. Qué es literal (copiado del Radar publicado o de PCI)
- **Datos:** `data/*.json` y `data/municipios.geojson`, copia íntegra. `python -I tools/verificar_datos.py` los compara byte a byte con lo que sirve hoy el Radar (8 de 8 iguales el 2026-11-12).
- **Código del Radar, sin cambios:** `js/ui.js`, `comun.js`, `graficos.js`, `mapa.js`, `territorio3d.js`, `rutas.js`, `contrato.js` y `vendor/three/` (comprobado con `cmp` contra el original). El contrato de datos (`contrato.js`) sigue validando los ficheros al cargar, así que el prototipo conserva la idea del Radar de servir a cualquier territorio.
- **Textos y reglas:** títulos de dimensiones, preguntas, estados del semáforo, reglas, umbrales, fuentes y próximos datos salen de `catalogo.json`, `alertas.json` y `datos.json`. Los textos de la interfaz que ya existían (frase de arriba, «Alertas por municipio», «Los 12 indicadores clave», «Elige uno para ver su serie», catálogo, ficha) se mantienen.
- **Lógica de las capas del mapa 3D, del recuento de alertas y de la ficha** (último dato, semáforo, serie, umbral, mapa por municipio, reparto, CSV): adaptada de `situacion.js` e `indicadores.js` originales, guardados en `_origen/` para comparar.
- **Estilo:** `css/pci.css` es la copia literal del `<style>` de `pci-dashboard/index.html` (líneas 8 a 1140), sin editar. Raíl de cristal, barra de filtros, isla oscura con fondo `flow-01/02`, tarjetas, tabla `mini`, cajón de detalle, tokens `--pci-*`, Geist, Geist Mono y Montserrat. Los iconos son el sprite Phosphor (MIT) del mismo PCI.
- **Intro:** el mismo reveal que PCI (haz de luz, logotipo que se descubre con un barrido, texto que sube y el logotipo que vuela hasta el raíl). El CSS está en `pci.css`; la secuencia (`js/intro.js`) es la de `playIntro()` de pci-dashboard. Un clic o una tecla la saltan, el botón del raíl la repite y con «reducir movimiento» no se reproduce.
- **Lo propio del Radar** va aparte, en `css/radar.css` (gráficos y mapas del Radar, etiquetas de estado, lista de municipios, cuadro de indicadores), con los tokens de PCI.

## 2. Qué es nuevo (a aprobar)
| Elemento | Nota |
|---|---|
| Aviso «Prototipo de diseño…» en la barra | Para que no se tome por el Radar final. |
| Raíl con las dos vistas hechas y las otras cuatro como enlaces al Radar publicado (↗) | Medidas en marcha, Escenarios, Datos y Metodología. |
| Isla oscura de Situación: «6 de 12 indicadores clave empeoran» y una barra con un segmento por indicador, coloreado por estado | En el Radar publicado la escena de entrada son las alertas por municipio. Aquí primero se cuenta el estado de los indicadores y, debajo, el territorio. Es un cambio de orden de bloques, no de textos. |
| Filtro por tipo de alerta junto al mapa, con sus puntos de color como leyenda | Gobierna el mapa, la lista y el 3D. Sustituye a las cuatro tarjetas de la isla, a la leyenda superpuesta y al selector de la barra. |
| Conmutador Plano / 3D en la cabecera del mapa. El plano es el predeterminado y el 3D se monta la primera vez que se pide | El original solo ofrece 3D y cae a plano si no hay WebGL. |
| Lista de municipios con alertas: barra de proporción, un punto por alerta (con anillo si es grave) y ficha de alertas del municipio elegido | Sustituye a la tabla de alertas. En 3D no se puede tocar un municipio (igual que el original): se elige en la lista. En plano también se toca en el mapa. |
| Detalle de un indicador clave en un cajón (como el «record sheet» de PCI) | En el original es un panel al lado. Misma información. |
| Catálogo de indicadores como tabla de PCI, con filtros de dimensión y búsqueda en la barra | Mismos filtros que el original. |
| Ficha de indicador con isla oscura de cifras | Mismas cifras que la tira del original. |
| Logotipo «RV» en el raíl y en la intro (`assets/radar-logo.svg`) | Nuevo. Mismas medidas, degradados y borde que el logotipo de PCI; las letras son trazos, no texto, para no depender de ninguna tipografía. No se usa el logotipo de Astara (el brief pide no atribuir autoría). |
| Textos de la intro: «Radar de vivienda» y «Bizkaia · 113 municipios», botón «Saltar la intro» | Nuevos. En PCI la segunda línea es «by Astara Intelligence»; aquí se omite por el mismo motivo. |
| Mapas por tramos de la ficha en la rampa azul de PCI (`js/colores.js`) | Mismos cortes (quintiles). Cambia solo el color. |

## 3. Decisiones que conviene validar
1. **Colores de los cuatro tipos de alerta** (rojo, azul, oliva, celeste): se conservan los del Radar publicado porque codifican una categoría, no una magnitud, y una sola rampa azul no los distinguiría. Es la única zona del prototipo fuera de la rampa PCI.
2. **Sin «budget lens» y sin el cristal con refracción** de PCI: el CSS de PCI trae esas partes pero el Radar no las usa. El cristal funciona sin la refracción (la parte en JavaScript no se ha portado).
3. **Sin Astara en el raíl ni en el pie.** PCI lleva el logotipo de Astara Intelligence; aquí se ha omitido por el compromiso de no atribuir autoría. Se puede añadir si Alvaro y el autor lo aprueban.
4. **La intro se reproduce en cada carga**, como en PCI. Si resulta pesada para quien entra a menudo, se puede limitar a una vez por sesión.
5. **Solo escritorio.** Móvil aplazado, como en el prototipo de Situación del análisis.

## 4. Calidad
- **Cifras comparadas con el Radar publicado:** 50 municipios con alguna alerta (23 graves); 32 viviendas turísticas, 3 contratos que caen, 17 alquiler por encima del límite, 6 zona tensionada; 6 de 12 indicadores empeoran; 971 €/mes en Bilbao (2025, +6,6 % frente a 2024); 281.141 € de compraventa; 32 municipios con dato de alquiler (Getxo 1.121 €/mes, Urduliz 1.005, Leioa 992).
- **Probado a mano:** elegir tipo (tarjeta y barra, sincronizados), elegir municipio en la lista y en el mapa plano, conmutar 3D/Plano, abrir y cerrar el cajón (botón y Escape), ficha desde el cajón, catálogo y selector de indicador.
- **No verificado:** contraste WCAG calculado, lector de pantalla real, navegación solo con teclado en toda la página, anchos menores de 1024 px, rendimiento del 3D en equipos modestos, navegador sin WebGL, Safari y Firefox. El detector de impeccable no se ha pasado.

## 5. Qué falta
- Las otras cuatro vistas (Medidas en marcha, Escenarios con su calculadora, Datos con el calendario, Metodología). Escenarios es la más delicada: su lógica de cálculo no se puede tocar.
- Recorte del CSS de PCI a lo que usa el Radar, una vez cerrado el alcance.
- Publicación del prototipo como artifact privado y validación con el autor.

## 6. Arreglos tras la crítica de diseño (2026-11-12)
Primera pasada sobre los fallos concretos que dejó la crítica de Situación e Indicadores. No cambia datos, textos ni orden de bloques.
| Fallo | Arreglo |
|---|---|
| El conmutador 3D / Plano estaba en la barra, lejos del mapa | Pasa a la cabecera del mapa. |
| El 3D era el predeterminado, poco preciso para vigilar, y cargaba Three.js siempre | Plano por defecto; el 3D (670 kB) se carga al elegirlo. |
| La columna «Grave» salía en casi todas las filas y no distinguía nada | Un punto por alerta, del color de su tipo; con anillo, grave. Leyenda de una línea sobre la lista. |
| Las etiquetas del eje X se pisaban en series trimestrales | Periodo corto en el eje (`T1 2010`, `may 2026`) con la opción `xLabel` que ya ofrece `graficos.js`, sin tocar el módulo. |
| El título mostraba un recuadro de foco al cambiar de vista | Sin recuadro en el foco programático (el foco sigue moviéndose al título). |
| Pie con contraste de 4,35:1 | Color secundario de PCI. |
| Los enlaces del raíl al Radar publicado no se distinguían | Insignia ↗ sobre el icono, visible también con el raíl cerrado, y separador entre las vistas propias y las externas. |

**Corrección a la crítica:** el 2,49:1 que se midió en la fecha del raíl era un error de medición (el raíl es cristal oscuro y la medida tomó el fondo claro de la página). Con el fondo real son unos 6:1. Sigue pendiente la pasada completa de contraste.
**Pendiente de la crítica (más grandes, a aprobar):** reordenar Situación para contar una sola historia, aplanar las cajas anidadas, cerrar la escala tipográfica y sustituir las pastillas por cambio en color con mini serie.

## 7. Jerarquía de Situación (2026-11-12)
Segunda pasada de la crítica: cambia la composición, no los datos ni los textos. **A validar con el autor**, porque altera el orden de los bloques respecto al Radar publicado.
| Problema de la crítica | Cambio |
|---|---|
| Dos historias compiten en la isla (50 municipios y 6 de 12) y tres cifras grandes a la vez | Una sola cifra grande («6 de 12»). Los 50 municipios con alerta pasan a una línea secundaria con enlace «Ver el mapa». |
| Los cuatro mosaicos de la isla repetían el filtro de alertas | Se quitan. Una barra de 12 segmentos (uno por indicador, de más a menos urgente) y su leyenda con recuentos; cada segmento abre el cajón del indicador. |
| Cajas anidadas: tarjeta, tarjeta de dimensión y fila | Una tarjeta; los grupos de dimensión no tienen caja y cada indicador es una fila separada por un filete. |
| Las pastillas «Empeora» dominaban y todos los indicadores pesaban igual | El cambio es una flecha y el porcentaje en color (rojo si empeora, verde si mejora, neutro en el resto); el estado sigue en texto para lectores de pantalla. Cada indicador con serie lleva una mini serie con el punto final del color del estado. |
| El filtro de tipo de alerta estaba lejos del mapa y duplicado | Fichas con punto de color y recuento sobre el mapa; las mismas hacen de leyenda. La barra global desaparece de Situación porque ya no tiene filtros propios. |
| El aviso de prototipo ocupaba la barra | Pasa a la cabecera, junto a las demás etiquetas. |
**Orden resultante:** isla de indicadores, tablero de los 12 indicadores y, al final, mapa y lista de municipios con alertas.
**Pendiente:** cerrar la escala tipográfica, probar el orden con el autor y repetir la lógica en Indicadores (la ficha sigue con los mosaicos de la isla).

## 8. Escala tipográfica (2026-11-12)
Medido en Situación, catálogo, ficha y cajón a 1440 px: **antes 15 tamaños de texto** (10,5 · 11 · 12 · 12,5 · 13 · 13,5 · 14 · 15 · 16 · 18 · 22 · 24 · 28 · 44 …); **ahora 7**, cada uno con su papel. Los gráficos SVG quedan fuera porque se escalan con su contenedor (su texto es de 11 unidades de su propio dibujo).
| Tamaño | Papel |
|---|---|
| 12 | Etiquetas, estados, datos pequeños (Geist Mono solo en datos tabulares), cabeceras de ejes |
| 14 | Texto: cuerpo, descripciones, controles, filas, celdas de tabla, tooltips |
| 16 | Títulos de grupo y de tarjeta (h3), entradilla, nombre del producto en el raíl |
| 20 | Títulos de sección (h2) |
| 24 | Cifras de las filas y de los mosaicos, título del cajón |
| 32 | Título de página (h1) y cifra del cajón |
| 56 | Cifra grande de la isla y de la ficha (se reduce hasta 44 en pantallas estrechas) |
- **Papeles de familia:** Montserrat solo en títulos y cifras; Geist en todo lo demás; Geist Mono solo en datos tabulares y recuentos.
- **Pesos:** 400 texto, 500 controles, 600 títulos y cifras. La flecha de cambio pasó de 700 a 600; el nombre del producto en el raíl también.
- **Dónde vive:** tokens `--t-12` a `--t-56` y la capa de sobrescritura al final de `css/radar.css`. `pci.css` no se toca, y los selectores se repiten para ganar por orden.
- **Efecto:** el texto de ayuda sube de 12 y 12,5 a 14 (descripciones, notas, leyendas); las etiquetas y estados se quedan en 12. Las cifras de las filas suben de 22 a 24. La cifra de la isla fija su tope en 56 (antes llegaba a 64).
**Pendiente:** contraste calculado con el texto ya a 14, y repetir la revisión de jerarquía en Indicadores (los mosaicos de la ficha pesan demasiado: «Dato oficial» y «Dimensión» se leen como cifras).
