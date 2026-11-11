# Trazabilidad y confianza del dato (Mejora D)

Componente compartido: `app/js/info-dato.js` (botón «i» + panel) con estilos en `app/css/marco.css` y 74 pruebas en `_qa/qa-info.js`.
Cada campo sale de los archivos de datos o de los textos originales de la propia página; si no consta se escribe «No consta en los datos» y **no se rellena**. Las fechas son las de referencia de los datos, nunca la de hoy.

## Dónde está
| Vista | Botón «i» | Qué describe |
|---|---|---|
| Situación | junto al título del indicador | El problema elegido (cambia con él): Alquiler, Entrada, Hogares, Turísticas, Vacías |
| Municipios | en cada uno de los 13 indicadores y en «Alquilar y comprar» (también en la comparación) | El indicador / el precio y los ingresos |
| Acceso | en las cuatro partes (El alquiler, La escalera, Prueba tus supuestos, ¿Hasta dónde llega mi hogar?) | La parte |
| Medidas | junto al título del gráfico (Plano / Matriz) | El gráfico y el estado de las medidas |
| Normas | junto a la fecha del estado normativo | Competencias y línea de tiempo |
| Método | (sin botón: es la referencia) | Los enlaces del panel llevan a sus bloques: `#metodo/fuentes`, `#metodo/las-etiquetas-de-cada-cifra`, `#metodo/datos-aproximados`, `#metodo/limitaciones`… (por el principio del título, sin acentos) |

## Material y comportamiento
El vidrio (L1 el botón, L2 el marco) es solo el contenedor ligero; el texto, las fuentes y las explicaciones están en una superficie sólida. Teclado: Enter o espacio abre; el foco pasa al botón de cerrar; Escape o × cierran y devuelven el foco; Tab hacia fuera, un clic fuera, el scroll de la página o cambiar de dirección también cierran; solo hay un panel abierto a la vez. Contraste AA medido en todos los textos del panel.

## Campos: de dónde salen y qué falta
| Campo | Situación | Municipios (13 indicadores) | Alquilar y comprar | Acceso | Medidas | Normas |
|---|---|---|---|---|---|---|
| **Nombre** | `titulo` del indicador | etiqueta del original | título de la sección | título de la sección | título del gráfico | título de la sección |
| **Definición original** | frase de la cifra (`resumen.cifra` + `unidad`) | **No consta** (el original no trae definición por indicador) | entradilla de la sección | entradilla de la sección | entradilla del gráfico | entradilla de la sección |
| **Fuente** | `fuente` del indicador + `resumen.fuentes` → nombre y enlace de `meta.fuentes` | **No consta** por indicador (las 20 fuentes están juntas en Método) | fuentes de «alquiler» y «compra» (`resumen`) | línea de fuentes de la propia sección (si existe) + `resumen.fuentes` | **No consta** a nivel de gráfico; cada medida trae las suyas en su ficha | línea «Elaboración propia con…» de la página |
| **Año o periodo** | años del texto de la fuente | años del propio nombre (cuando los trae; si no, **No consta**) | `meta.periodo_precio` + `año_renta` | `acceso.supuestos` (`año_renta`, `periodo_precio`, interés medio) | **No consta** | **No consta** (solo la fecha del estado) |
| **Fecha de actualización o revisión** | `meta.fecha_datos` y `meta.fecha_revision` | ídem | ídem | ídem | `medidas.estado.comprobado_el` | `normas.fecha` |
| **Cobertura territorial** | «N de 113 municipios con dato» (recuento real) | ídem, por indicador | municipios con precio propio y orientativo (recuento) | alquiler: municipios con dato; compra: Bizkaia + municipios con precio propio | «34 medidas, 113 municipios» | «15 instrumentos y 4 niveles» |
| **Naturaleza del valor** | `resumen.etiqueta` (Cálculo propio / Aproximación) + la explicación original de lo aproximado (`meta.aproximados`) | **No consta** por indicador | etiqueta de «compra» + explicación de lo aproximado | etiqueta de «alquiler» o «compra» | **No consta** a nivel de gráfico (nota: está en la ficha de cada medida) | «Elaboración propia» (de la línea de fuentes) |
| **Enlace a Método** | etiquetas, fuentes, (aproximados) | fuentes, etiquetas, limitaciones | etiquetas, aproximados, fuentes | etiquetas, aproximados, fuentes | cómo se comparan / proponen las medidas, fuentes | fuentes |

## Carencias documentadas (necesitan al autor)
1. **No hay ninguna cifra clasificada como «dato oficial»** en los datos actuales: los cinco problemas son «Cálculo propio» u «Aproximación». El componente ya sabe mostrar «Dato oficial» si el dato lo trae.
2. **Los 13 indicadores municipales no tienen fuente, definición ni naturaleza por indicador** en los archivos (solo año en el nombre de algunos). Para completarlo haría falta una tabla indicador → fuente/definición/naturaleza validada por el autor.
3. **Las fechas son del conjunto de datos** (descarga 20/10/2026, revisión 21/10/2026): no hay fecha de actualización por indicador.
4. **Medidas y Normas:** no hay fuente, periodo ni naturaleza a nivel del gráfico o de la tabla; sí fecha de referencia (27/10/2026 y 2/11/2026).
5. Textos nuevos de la interfaz, marcados como propuesta: los rótulos de campo («Definición», «Fuente»…, «No consta en los datos»), la nota de Medidas («La fuente y la naturaleza… están en su ficha») y la de Normas («esta información no los actualiza»).
6. Los bloques de Método se enlazan por prefijo del título: si el autor renombra un bloque, hay que revisar `M` en `info-dato.js`.
