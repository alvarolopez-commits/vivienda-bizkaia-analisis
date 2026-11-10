# REGRESSION_BASELINE

Línea base ejecutable del rediseño. **`node sprint-01/_qa/baseline.mjs`** ejecuta 20 comprobaciones y sale con código 0 si todas pasan. Resultado del 2026-11-10: **20 PASS, 0 FAIL**.

Complementa `docs/01-web/REGRESSION_BASELINE.md` (valores leídos de la interfaz) con una ejecución del **módulo de cálculo original**.

## Casos cubiertos (ejecutados)

- Recuentos: 113 municipios, 34 medidas (M01–M34), 15 instrumentos, 4 niveles, 12 hitos, 124 términos, 22 fuentes.
- Cobertura de los cinco indicadores de Situación: **35, 113, 112, 113, 113** (se calcula de los datos; no se escribe fija en la interfaz).
- Calculadora de Acceso con el estado inicial: **16,9 años**, **93.007 €**, **29,0 %**, **887 €/mes**, precio pagable **275.000 €** (redondeo al millar; valor exacto 275.325,4). Rejilla 15 %×35 % = 16,9; 20 %×35 % = 12,6; 10 %×25 % = 18,1.
- Medidas: «30 de 34» se pueden aplicar ya. Normas: «9 de 15» los decide Euskadi.
- Integridad de la opción A: los ficheros de `js/`, `data/`, `vendor/`, `fonts/` e `img/` son idénticos a la web publicada.

## Casos del documento del sprint con estado

| Caso | Estado |
|---|---|
| Comparador de Medidas: 2 o 3 como máximo, sin repetidas | **PASS** en el navegador (cuatro ids → tres; `M01-M01` → una sola) |
| Matriz de pesos: fórmula y orden | **PENDIENTE** (el módulo no se modificó; no hay prueba ejecutada del orden con pesos) |
| URLs existentes y redirecciones | **PASS** (21 casos, `QA_RESULTS.md §2`) |
| Textos extensos de Método y glosario literales | **PASS** por igualdad de sha256 en A; en B no se incluyen |
| «sin dato» no se convierte en cero; precio `orientativo` no pasa a propio | **PASS** en los dos indicadores de la lista (filas sin dato no se muestran; el valor aproximado lleva `*`) |
| Pruebas originales (`tests/…`) | **PENDIENTE**: no están disponibles |

## Cómo revalidar

Si cambian los datos por decisión del autor, este baseline pertenece a una fecha concreta (datos del 2026-10-20): hay que volver a fijar los valores esperados.
