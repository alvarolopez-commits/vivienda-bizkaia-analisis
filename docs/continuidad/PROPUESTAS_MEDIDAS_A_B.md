# PROPUESTAS_MEDIDAS_A_B · Navegación integrada y dos composiciones de Medidas

**Sprint 03.1 · 11-11-2026 · escritorio (1440 × 900) · sin móvil · sin publicar · sin commit.**
Estado: **se detiene aquí para revisión** (Pasos 1 a 3 del documento). No se ha elegido propuesta.

## 1. Abrirla

```bash
python sprint-03-1/servidor.py
```
Después http://localhost:4179/ (o `Abrir Sprint 03.1.bat`).

| Qué | Dirección |
|---|---|
| Situación (Living Atlas, Sprint 02) | `#situacion/alquiler/48020` |
| Medidas, propuesta A · Escenario | `?diseno=a#medidas` (la de por defecto) |
| Medidas, propuesta B · Mesa | `?diseno=b#medidas` |
| Matriz con pesos y selección | `#medidas?rep=matriz&w=3,2,0,0,1&sel=M08,M01` |
| Comparar | `#medidas/M01-M06-M20` |

Dentro de Medidas, el selector «Composición A · Escenario / B · Mesa» (arriba a la derecha) cambia de propuesta conservando la dirección. `?limpio` oculta las etiquetas de prototipo.

## 2. Paso 1 · Qué se reutiliza de cada sprint

| | Sprint 02 (Living Atlas) | Sprint 03 (Explorador) | Nuevo en este sprint |
|---|---|---|---|
| **Datos y módulos originales** | 5 JSON y 5 módulos | 5 JSON y 13 módulos | Una sola carpeta `app/original/` (20 ficheros, la unión, idénticos a la web servida) |
| **Lógica** | `mapa-atlas.js` (mapa, zoom, teclado) y el `main.js` (estado único, ficha, ranking, búsqueda, URL) | `estado-app`, `calculo`, `plano`, `matriz-vista`, `entender`, `comparar`, `detalle` y el `main.js` (estado, filtros, pesos, bandeja, panel, rutas) | Los dos `main.js` convertidos en `montar()/desmontar()` (la lógica no cambia) |
| **Visual** | Todo el CSS del Atlas, **sin cambios** (`situacion.css`) | Hoja del explorador (`medidas.css`) | `medidas-diseno.css`: las dos composiciones, con las superficies, radios, cristal y estados del Atlas |
| **Marco** | Cabecera, menú, botones, tokens | (iguales) | Un solo marco (`marco.css`, `index.html`), un router, un almacén de datos, una hoja tipográfica |
| **Pruebas** | 101 (Atlas) | 30 + 74 | 29 de navegación, 34 + 36 de composición, tipografía, integridad |

## 3. Paso 2 · Navegación integrada

- **Una sola app y una sola URL.** Situación y Medidas son las versiones nuevas; ninguna ruta de esas dos vistas abre la web publicada. Municipios, Acceso, Normas y Método abren la «versión actual» y se marcan con ↗ (con el título «Versión actual publicada (aún no rediseñada)»).
- **Una sola vista montada a la vez.** Al cambiar se desmonta la anterior (oyentes y DOM) y se activa solo su hoja de estilos. La navegación está serializada: dos montajes nunca se solapan.
- **Prueba de ir y volver** (`_qa/qa-navegacion.js`, 29 de 29): clic en «Medidas» desde Situación (Getxo/Turísticas) → Explorador con las 34 medidas y el Atlas desmontado → clic en «Situación» → vuelven los 113 polígonos → «atrás» desde Situación devuelve a Medidas con sus filtros, selección y representación (desde la URL) → seis viajes de ida y vuelta dejan un solo mapa y un solo marco. Dentro de Medidas no hay ningún enlace a la web antigua; en Situación solo «Ver su ficha» (Municipios).
- **Deep links de los dos sprints** comprobados: `#situacion/alquiler/48020`, `#situacion/vacias/48001`, `#medidas`, `#medidas?rep=matriz&w=3,2,0,0,1`, `#medidas/M01-M06`, `#medidas/M06`, `#medidas/alternativas`, `#medidas?vista=entender`.

## 4. Paso 3 · Las dos composiciones

Las dos comparten **todo lo que no es colocación**: estado, filtros, pesos, Plano, Matriz, comparador, URL y cálculos (los de Sprint 03, sin tocar). Cambian la cinta de criterios, el escenario y dónde vive la ficha.

### Lo común (lo que el documento pide para Medidas)

- **Escenario protagonista:** una superficie con el fondo punteado y el degradado del lienzo del Atlas (28 px de radio), con el título arriba a la izquierda y una barra de cristal arriba a la derecha (Plano/Matriz, «34 de 34 medidas», chips de criterios activos).
- **Filtros progresivos:** una cinta como la de los cinco problemas del Atlas. **A la vista:** las 6 líneas más «Todas», cada una con **cuántas medidas quedarían** (calculado), y «Solo las que se pueden aplicar ya». **En desplegables:** «Más criterios» (Cómo actúa, Quién decide, Papel de BM30) y «Prioridades» (los pesos 0 a 3, solo en la Matriz). Conservan todos los criterios y controles originales; el botón muestra cuántos criterios avanzados hay activos.
- **Plano mejor tratado (sin tocar coordenadas, tamaños ni colores):** sin marco blanco y escalado al escenario; leyenda de cristal; al pasar o enfocar una burbuja el resto se atenúa; la elegida lleva un aro y la abierta un aro con halo. Etiquetas de eje más legibles.
- **Matriz:** cabecera con jerarquía, filas alternas, recuadro con profundidad; casilla, orden, nota y medida fijas al desplazar las 12 columnas.
- **Selección:** ficha contextual ligera en el entorno y **bandeja flotante de cristal** centrada y siempre visible, con el motivo cuando «Comparar» no está disponible.
- **Entender, Comparar, Ficha y Alternativas** siguen completas y con las mismas superficies redondeadas.

### Propuesta A · «Escenario» (la hermana directa del Atlas)

```text
 título                                              [Explorar][Entender][Comparar][Alternativas]
 [Todas 34][Más vivienda 11][Usar las existentes 9]…       [Aplicables ya][Más criterios][Prioridades]
 ┌─ ESCENARIO (Plano o Matriz) ───────────────┐ ┌─ PANEL ───────────────┐
 │ Evidencia y plazo        [Plano|Matriz] 34 │ │ M10 · ficha o         │
 │          burbujas escaladas                 │ │ «El conjunto a la     │
 │        [leyenda de cristal]                 │ │  vista»               │
 └─────────────────────────────────────────────┘ │ Las medidas a la vista│
                                                  │ (lista con «+»)      │
                                                  └───────────────────────┘
                       [ bandeja flotante de cristal ]
```
- Panel lateral **persistente**, con la altura del escenario: arriba la ficha de la medida elegida (o un resumen del conjunto: «34 de 34 medidas · 30 se pueden aplicar ya») y debajo **la lista de las medidas a la vista**, sincronizada con el Plano y la Matriz y con el mismo orden que la Matriz (con pesos, de mayor a menor nota). Cada fila tiene su «+» para la comparación. Es el equivalente exacto del ranking del Atlas.
- **Ventaja:** misma gramática que Situación; la ficha, la lista y el escenario se ven a la vez; descubrimiento por lista además de por gráfico.
- **Coste:** el escenario pierde ancho (≈ 920 px a 1440). La Matriz de 12 columnas se desplaza horizontalmente dentro del recuadro (cabecera y primeras columnas fijas).

### Propuesta B · «Mesa»

```text
 título                                              [Explorar][Entender][Comparar][Alternativas]
 [Todas 34][Más vivienda 11]…                        [Aplicables ya][Más criterios][Prioridades]
 ┌─ ESCENARIO A TODO EL ANCHO ───────────────────────────────────────────────┐
 │ Todas, criterio a criterio                         [Plano|Matriz] 34 de 34 │
 │   Matriz con las 12 columnas visibles (o el Plano grande)                  │
 └────────────────────────────────────────────────────────────────────────────┘
 ┌─ FRANJA FIJA ──────────────────────────────────────────────────────────────┐
 │ M10 Más viviendas en la ciudad ya construida  [Añadir][Ver la ficha][Abrir]│
 │ Línea · Cómo actúa · Evidencia · Plazo · Coste · Se aplica                 │
 │ Qué hace: extracto…                                                        │
 └────────────────────────────────────────────────────────────────────────────┘      → «Ver la ficha» abre un cajón a la derecha
```
- El escenario ocupa **todo el ancho**. La ficha rápida (los 6 primeros criterios y un extracto de «Qué hace») está en una **franja inferior fija**; la ficha completa se abre en un **cajón** a la derecha (no modal; Esc lo cierra y conserva la medida; un segundo Esc quita la elección).
- **Ventaja:** la **Matriz se ve casi entera** (12 columnas a 1.340 px) y el Plano se agranda; menos elementos competidores.
- **Coste:** no hay lista de medidas; el Plano es más alto que la ventana a 1440 × 900 (la franja fija tapa sus filas inferiores hasta desplazar); hay dos niveles de detalle (franja y cajón).

### Comparación rápida

| | A · Escenario | B · Mesa |
|---|---|---|
| Parecido con Living Atlas | **Alto** (panel + lista) | Medio (escenario + franja) |
| Ancho del escenario a 1440 | ≈ 920 px | ≈ 1.340 px |
| Matriz de 12 columnas | Con desplazamiento horizontal | **Casi entera** |
| Plano | **Cabe entero en la ventana** | Más grande, hay que desplazar |
| Ficha | Siempre visible al lado | Franja + cajón |
| Lista de las 34 | **Sí, sincronizada** | No |
| Cuándo gana | Descubrir y explorar | Leer y comparar criterios |

**Mi lectura (decide el equipo):** A es la continuación natural del Atlas y la que mejor cumple «misma gramática»; B sirve mejor si el uso principal es la Matriz. Una combinación posible, no hecha: A como vista por defecto y la Matriz con el panel plegable de B. No he elegido: el documento pide parar aquí.

## 5. Qué no ha cambiado

Datos, textos, criterios, pesos, notas, orden, fórmulas y URLs. Las piezas nuevas (`lista.js`, `inspector.js`) **no calculan**: pintan lo que reciben de `ordered()` y `criteria()` (originales). Lo comprueba `_qa/integridad.py`.

## 6. Diferencias deliberadas respecto a Sprint 02 y 03

| # | Diferencia |
|---|---|
| 1 | Medidas pierde la barra lateral izquierda de filtros del Sprint 03: pasa a la cinta superior (revelado progresivo) |
| 2 | El panel contextual deja de ser una tercera columna que reflowaba el escenario: en A es el panel persistente; en B, un cajón superpuesto |
| 3 | La bandeja pasa de barra a ancho completo a **cinta flotante de cristal** centrada |
| 4 | Los modos (Explorar, Entender, Comparar, Alternativas) pasan de barra fija a control segmentado a la derecha del título, como los problemas del Atlas |
| 5 | Textos nuevos marcados `data-propuesta` (`?marcar` los resalta): «El conjunto a la vista», «Las medidas a la vista», «Más criterios», «Prioridades», «Composición», «Ver la ficha», el texto de «franja vacía» |
| 6 | Situación (Sprint 02): **ningún cambio** salvo la tipografía aprobada y estar dentro del marco único |

## 7. Registro de pruebas (escritorio, 1440 × 900)

| Prueba | Qué comprueba | Resultado |
|---|---|---|
| `qa-navegacion.js` | Ida y vuelta Situación ↔ Medidas, un solo marco y vista, deep links, atrás/adelante, sin enlaces a la web antigua | **29 de 29** |
| `qa-situacion.js` (Sprint 02) | Living Atlas completo dentro del marco único | **101 de 101** |
| `qa-equivalencia.js` (Sprint 03) | Matriz, Plano, Cadena, Quién decide, criterios y fichas idénticos a la web original | **30 de 30 en A y 30 de 30 en B** |
| `qa-flujos.js` (Sprint 03) | 34 medidas, rutas, filtros, pesos, comparación 2–3, bandeja, teclado, maquetación | **74 de 74 en A** (la propuesta por defecto) |
| `qa-disenos.js` | Cinta con cuentas calculadas, desplegables (teclado, Escape, clic fuera), escenario, lista y panel (A), franja y cajón (B), bandeja flotante, Matriz fija, sin `null`, tipografía | **34 de 34 en A · 36 de 36 en B** |
| `qa-tipografia.js` | Estilos calculados | **PASS**: 0 cifras fuera de Geist, 0 sin tabulares, 0 Geist Mono |
| `integridad.py` | 20 originales sha256; JSON sin cambios; módulos copiados idénticos; las piezas nuevas no calculan | **24 de 24** |
| 34 medidas (M01 a M34), 30 + 4 de viabilidad | Datos completos | **PASS** (`qa-flujos`, `qa-equivalencia`) |
| `qa-flujos.js` en B | Esta suite asume el panel lateral de A | **PENDIENTE** (B se cubre con `qa-equivalencia` y `qa-disenos`) |
| 1280 px, móvil, lector de pantalla, Safari y Firefox | — | **PENDIENTE / no se ha hecho** (móvil excluido) |

## 8. Archivos nuevos o modificados en este paso

`sprint-03-1/app/css/medidas-diseno.css`, `app/js/medidas/lista.js`, `app/js/medidas/inspector.js`, `app/js/medidas/plantilla.html`, `app/js/medidas/index.js` (recomposición, `tools/componer_disenos.py`), `app/js/app.js` y `app/index.html` (segunda hoja de Medidas, icono vacío), `_qa/qa-disenos.js`, `_qa/integridad.py`, `README.md` y las capturas de `docs/continuidad/capturas/propuestas/`. Los del paso anterior (tipografía) están en `TIPOGRAFIA_APLICADA.md`.

## 9. Decisiones que necesito

1. **¿A, B o una mezcla?**
2. Si A: ¿el panel debe poder plegarse para dar más ancho a la Matriz?
3. ¿Los textos nuevos marcados (§6.5) son aceptables o los redactáis vosotros?
4. Tras elegir: Paso 4 (dejar una sola propuesta y borrar la otra) y Paso 5 (regresión completa y visual).
