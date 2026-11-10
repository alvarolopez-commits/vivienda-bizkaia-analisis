# REGRESSION_BASELINE — casos de referencia observados

**Estado:** `OBSERVADO_EN_WEB_PENDIENTE_REPO`. Valores leídos de la web publicada el 2026-11-10. Son el «antes»; tras cualquier maquetación deben reproducirse **idénticos**. Los casos de la sección 1 no incluyen el estado por defecto confirmado: es el estado que mostró la página al cargar `#acceso`.

## 1. Acceso — «Prueba tus supuestos»
Estado al cargar: Dónde = «Bizkaia (vivienda media)» · Hogar = Ingresos medios · Ahorro 15 % · Entrada 35 % · Interés 2,92 % · Plazo 30 años · Préstamo «TU CASA» = No.

| Entrada | Salida observada |
|---|---|
| estado al cargar | **16,9 años** ahorrando la entrada (**93.007 €**) · **29,0 %** de los ingresos (**887 € al mes**) · precio asequible **275.000 €** (vivienda media **265.733 €**) · ingresos **36.766 €**/año |
| rejilla, fila 15 % columna 35 % | 16,9 |
| rejilla, fila 20 % columna 35 % | 12,6 |
| rejilla, fila 10 % columna 25 % | 18,1 |
| mapa «¿Hasta dónde llega mi hogar?», ingresos medios + ahorro 15 % | **0 de 113** municipios con «las dos cosas»; 18 en «Ni la entrada ni la cuota»; 0 «Sin precio»; 96 municipios con precio de su área |

**Comprobación aritmética independiente (no es lectura de código):** 35 % × 265.733 = 93.007 ✓; 93.007 ÷ (15 % × 36.766) = 16,9 ✓; préstamo = 80 % del precio (212.586 €), 30 años al 2,92 % → cuota 887 € ✓; 887 × 12 ÷ 36.766 = 29,0 % ✓. El precio asequible 275.000 € coincide con el cálculo exacto (≈ 275.300 €) **redondeado**; la regla de redondeo es `NO_DOCUMENTADO` hasta ver el código.

**Escalera del acceso (5 hogares):** Ingresos medios → 36.766 € · alquiler 23,6 % «Cabe» · entrada 10,8 a 16,9 años «No cabe» · cuota 29,0 a 32,6 % «Depende». Ingresos bajos → 20.637 € · alquiler 39,9 % «No cabe» · 19,3 a 30,0 años · 51,6 a 58,1 %.

## 2. Municipios — Bilbao (`#municipios/48020`)
Habitantes 346.933 · alquiler nuevo 55,8 % (ingresos bajos) y 30,4 % (medios), ambos **puesto 1 de 35** · subida 2020–2025 **+24,1 %** (13 de 32) · viviendas turísticas 6,1 por 1.000 (43 de 113) · vacías o segunda residencia 10,0 % (103 de 113) · hogares +5,3 % vs viviendas +3,7 % (2014–2024). Tabla de ingresos: bajos 55,8 % / 22,9 a 35,6 años / 61,0 a 68,8 %; medios 30,4 % / 12,5 a 19,4 / 33,3 a 37,5 %; altos 18,7 % / 7,6 a 11,9 / 20,4 a 23,0 %.

## 3. Medidas
- 34 medidas M01–M34; «30 de 34 se pueden aplicar ya». Recuento observado en la matriz: 30 «Ya» y 4 «Norma vasca o foral» (M07, M19, M29, M34) ✓.
- 2 medidas «Evaluada, no se propone»: M33, M34 (población «No se propone»).
- M14 «Población donde hace falta: Ningún municipio».
- Matriz de 12 columnas: Orden, Medida, Línea, Cómo actúa, Evidencia, Magnitud documentada, Se aplica, Plazo, Coste público, Población donde hace falta, Quién decide, Papel de BM30.
- Contadores de filtros: «34 de 34 medidas».

## 4. Normas
15 instrumentos × 4 niveles; «9 de 15 los decide Euskadi». Recuento observado: Gobierno Vasco 6 + Diputación 3 = 9 ✓; Estado 4; Ayuntamientos 2. Hitos pendientes: «Sopela y Urduliz… falta el BOE» y «Decretos-ley 28 y 29/2026: pendientes de convalidar». Estado a 2 de noviembre de 2026.

## 5. Situación / navegación
Cinco problemas, orden: Alquiler (34 de 35) · Entrada (10,8 a 16,9) · Hogares (30.000 a 120.000) · Turísticas (38) · Vacías (53 de 63). Cabecera con `aria-current="page"` en la vista activa. Anclas: `#situacion #municipios #acceso #medidas #normas #metodo` y `#municipios/<INE>`.

## 6. Casos por diseñar al tener el repo
Comparador de municipios y de medidas (límite de 2–3) · reinicio de filtros · ordenar por prioridades · conmutador 2D/3D · hogares del mapa de Acceso · casos con dato ausente · navegación con teclado.
