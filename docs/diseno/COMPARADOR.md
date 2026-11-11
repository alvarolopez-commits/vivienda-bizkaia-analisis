# Comparador municipal (Mejora C)

Archivos: `app/js/municipios/comparador.js` (nuevo), `app/js/municipios/index.js` (llama al comparador y pone banner a los dos municipios), `app/css/municipios.css` (estilos), `_qa/qa-comparador.js` (35 pruebas).
Rutas sin cambios: `#municipios/A-B` (los mismos selectores «Municipio» y «Comparar con» de siempre). El renderizador original (`app/original/js/municipios`) no se toca.

## Cómo funcionaba antes
Con dos municipios el original dibujaba: dos cabeceras, el gráfico de 13 pistas con dos puntos, «Sus problemas» y «Alquilar y comprar» en dos columnas, y **ocultaba Evolución, Barrios y Plan**.

## Qué hace ahora
- **Dos encabezados diferenciados** con su banner (cuando hay imagen identificada; si no, genérico del registro) y un distintivo **A** (tinta) y **B** (rosa), que son los colores de los puntos del gráfico. Los textos son los del original.
- **Cambiar cualquiera sin perder el otro:** los selectores de siempre; más «Intercambiar» y «Ver solo <municipio>» (vuelve a la ficha individual).
- **Indicadores enfrentados:** columnas *A · pista entre los 113 · B · Diferencia (B − A)*. Las **26 cifras y sus puestos son idénticos a los del renderizador original** (se prueba cifra a cifra). La diferencia se calcula solo si **los dos** tienen dato y con la unidad del indicador: «puntos» (porcentajes y cambios porcentuales), € (ingresos), «por 1.000» (turísticas) y «años» (edad media). Si falta uno: «sin dato» en su cifra y «no comparable» en la diferencia (con motivo para lectores de pantalla). Sin color de «mejor/peor», sin ranking, sin nota agregada.
- **Alquilar y comprar:** una tabla real (caption, `scope`) con los dos municipios, reutilizando el texto de cada celda del original. Debajo, la **naturaleza del precio**: «Precio observado» (nota original: compraventas de 2025 en el municipio) o «Precio orientativo» + «Dato aproximado» + la nota original; las celdas orientativas conservan su asterisco.
- **Compartir:** la dirección `#municipios/A-B` restaura exactamente la comparación (y el botón «Copiar enlace» de la cabecera la copia). Direcciones con un municipio repetido o inexistente caen en la ficha individual.
- **Navegación interna:** índice lateral Datos, Problemas, Hogares, Evolución, Barrios, Plan.

## Qué se mantiene y qué requiere desarrollo
| Bloque | Estado | Detalle |
|---|---|---|
| Datos (13 indicadores) | **Comparado** | Mismas cifras; diferencia solo con unidad común |
| Problemas | Dos columnas (como el original) | Cada municipio lista sus problemas con el «por qué» original. No se cruzan: un problema que un municipio no tiene no se rellena con texto inventado |
| Alquilar y comprar | **Tabla común** | Los rangos («13,6 a 21,1») no se restan: no hay diferencia definida para un rango |
| Evolución | Lado a lado | Mismas series originales, cada una con su propia escala: **sin** diferencias ni índices (habría que decidir qué normalización es válida) |
| Barrios | Lado a lado | Dos mapas de secciones; no hay modelo de datos para compararlos entre municipios |
| Plan | Lado a lado | Las listas de cada municipio; la intersección o diferencia de medidas sería un cálculo nuevo que no existe |

## Pendiente de decisión editorial
- Los rótulos nuevos están marcados `data-propuesta`: «Intercambiar», «Ver solo …», «Diferencia (B − A)», «no comparable», «Precio observado», «Precio orientativo», «Sin precio de compra».
- Si «puntos» es la unidad deseada para restar porcentajes (es la convención estadística, pero el autor puede preferir «pp»).
- Si se quiere una comparación de Evolución (p. ej. índice base 100), de Problemas por tipo o de Plan (medidas comunes): requiere un criterio del autor.
