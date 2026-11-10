# UX_DECISIONS · Decisiones del Explorador de Medidas

**Sprint 03 · 10-11-2026 · PROTOTIPO de escritorio, no integrado.** Qué se ha decidido y por qué, qué no se ha tocado y qué necesita al autor.
Prototipo: `sprint-03/medidas/` · http://localhost:4178/medidas/ (ver `sprint-03/README.md`). Capturas reales en `docs/medidas/capturas/` (Chrome sin interfaz, sin montajes).

## 1. Recorrido: explorar → entender → comparar

```text
┌ banda global (seis vistas; solo Medidas vive aquí, las demás abren la web publicada) ┐
│ Las medidas, con los mismos criterios · 30 de 34 se pueden aplicar ya…               │
│ [ Explorar ] [ Entender ] [ Comparar ] [ Alternativas ]            (sticky)          │
├───────────────────┬──────────────────────────────────────────┬───────────────────────┤
│ CRITERIOS         │ [Plano|Matriz]  34 de 34 medidas  chips ×│ PANEL CONTEXTUAL      │
│ Línea (con color) │ Evidencia y plazo / Todas, criterio a…   │ (no modal, a la dcha) │
│ Cómo actúa        │                                          │ M10 · nombre     ×   │
│ Quién decide      │       PLANO  o  MATRIZ (12 columnas)     │ [Añadir a la compar.]│
│ Papel de BM30     │                                          │ [Abrir ficha completa]│
│ Solo aplicables ya│                                          │ 12 criterios          │
│ Quitar filtros    │                                          │ Qué hace (+Leer más)  │
│ ─ solo Matriz ─   │                                          │ Si ha funcionado …    │
│ Ordenar según tus │                                          │ Riesgos · Fuentes     │
│ prioridades 0–3   │                                          │ Ver su cadena / decide│
├───────────────────┴──────────────────────────────────────────┴───────────────────────┤
│ BANDEJA (1 a 3):  [M06 · nombre ×] [M10 · nombre ×]   Puedes añadir una tercera. [Comparar medidas →] │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

- **Explorar** = Plano + Matriz, dos representaciones del mismo catálogo con los mismos criterios. Cambiar de una a otra no reinicia nada.
- **Entender** = Cadena y Quién decide (los diagramas originales), con la línea de la medida abierta preseleccionada y la medida marcada.
- **Comparar** = 2 o 3 medidas lado a lado; la ruta es la original (`#medidas/M01-M06`).
- **Alternativas** = el material original, aparte.

## 2. Decisiones y su porqué

| # | Decisión | Por qué |
|---|---|---|
| 1 | **Panel contextual a la derecha, no modal** (en lugar de navegar a la ficha) | El brief pide abrir el detalle sin perder la exploración. A 1440 px se acopla como tercera columna; a 1280 px se superpone (y se cierra con Esc o ×) para no dejar el Plano ilegible |
| 2 | **Los criterios van a la izquierda y valen para las dos vistas** | La Matriz tiene 12 columnas: no admite una columna de detalle permanente. Los cinco criterios son propiedades de la medida con el mismo predicado en ambas (ver `STATE_AND_URL.md` §2) |
| 3 | **La selección es un estado propio (bandeja)** | Es la pieza que une Plano, Matriz, panel y comparador: se añade desde cualquiera de los tres y siempre se ve |
| 4 | **Los pesos solo en la Matriz** (barra lateral, solo en esa vista) | Solo ordenan la Matriz. Con pesos activos en el Plano se avisa. `0,0,0,0,0` = sin nota ni orden |
| 5 | **La nota (0 a 1) solo aparece con pesos**, con su ayuda: «Depende de los pesos que has elegido; no mide el impacto» | El brief lo pide. No hay puntuación ni ranking por defecto, ni «mejores medidas» |
| 6 | **Sin ganadores en el comparador**: solo la etiqueta factual «difieren» en las filas cuyos valores no coinciden | El brief prohíbe semáforos y recomendaciones |
| 7 | **Textos enteros con «Leer más»** (panel) y enteros (ficha completa) | Regla 4: la ficha original recortaba con `first()` en 11 y 17 de 34 |
| 8 | **El Plano no mueve ninguna burbuja**: sin jitter; selección y filtro por aro y atenuación | Regla del brief. El original ya evita solapes colocando las burbujas de cada casilla en una mini rejilla |
| 9 | **El SVG del Plano se escala para caber en la altura de la ventana** | A 1440 × 900 se ve el plano entero. Solo cambia el tamaño del lienzo (`viewBox`), no las coordenadas |
| 10 | **Colores que codifican datos, intactos**: línea de actuación (`LINE_COLORS`, importado) y estados del mapa (`stateColor`, importado) | Fidelidad semántica |
| 11 | **Las seis herramientas a ≤ 2 acciones** | Plano 0 · Matriz 1 · Cadena 1 · Quién decide 2 · Comparar 1 · Alternativas 1 (comprobado) |
| 12 | **El estado vive en la URL** (query) y el historial distingue «ajustes» (`replaceState`) de «cambios de vista» (entrada nueva) | «Atrás» restaura la exploración; los enlaces se pueden compartir |
| 13 | **«Abrir» y «Añadir a la comparación» son dos acciones distintas** (clic o Intro abre; Espacio sobre una burbuja, o la casilla/botón, añade) | Lo pide el brief (§6.3) |

## 3. Teclado y accesibilidad (escritorio)

- **Plano:** las burbujas visibles son enlaces alcanzables con Tab (las atenuadas salen del orden). **Intro/clic** abre el panel; **Espacio** añade o quita de la comparación y lo **anuncia**. Cada burbuja dice su medida, evidencia, plazo, y si está en la comparación o fuera de los criterios.
- **Matriz:** región con foco que se desplaza dentro de su recuadro; la casilla y el nombre fijos; casillas con etiqueta; con tres elegidas las demás se deshabilitan, con motivo.
- **Panel:** `aside` no modal con nombre; al abrir, el foco va al título; **Esc cierra y devuelve el foco** al elemento de origen.
- **Criterios y pesos:** botones con `aria-pressed`; selects con etiqueta; el contador `N de 34` es una región `aria-live`.
- **Foco visible** en todo control; `prefers-reduced-motion` desactiva transiciones.
- **No se depende solo del color:** cada burbuja lleva su ID y etiqueta accesible, la leyenda de línea escribe el nombre, y la selección usa aro + texto en la bandeja.

## 4. Lo que NO se ha tocado

Datos (`medidas.json`, `ideas.json`), fórmulas y pesos, el orden editorial, los estados jurídicos, BM30, `calculo-acceso.js`, `situacion/`, `municipios/`, `normas.js`, `view-metodo.js`, `glosario.js`, la web publicada y Sprint 01 y 02. Tampoco se ha hecho nada específico de móvil.

## 5. Qué es real y qué es prototipo

| Parte | Estado |
|---|---|
| Datos, cálculo, textos de sección, criterios, diagramas, alternativas, mapa de estado | **Real**: los módulos y JSON originales (idénticos byte a byte) |
| Estado compartido, filtros comunes, bandeja, panel, comparador con textos largos, modos, URL con contexto | **Prototipo funcional** (código nuevo) |
| Cabecera de seis vistas | La del Sprint 01; las otras vistas abren la web publicada |
| Diseño visual | **Provisional** (tokens de Astara de Sprint 01/02; el sistema definitivo no se ha entregado) |

## 6. Pendiente en este sprint

Lector de pantalla real, Safari y Firefox, y pruebas con usuarios. Móvil (aparcado). Modo de «concentración» (plegar la barra de criterios para ampliar el Plano cuando el panel está abierto): el brief no lo pide y se valoraría tras probarlo.

## 7. Decisiones del autor y del equipo (lista corta)

| # | Decisión | Por qué importa |
|---|---|---|
| 1 | **Significado y validación del papel BM30.** Hasta entonces, literales sin tocar | El filtro, la columna y el panel lo muestran tal cual |
| 2 | **¿Es definitivo el orden editorial por línea/ID?** | Es el que se ve sin pesos |
| 3 | **Tratamiento de las 4 alternativas** (hoy, pestaña aparte, sin mezclar) | Quedan fuera de las 34, la nota y el comparador |
| 4 | **¿Los cinco criterios valen para Plano y Matriz?** (el Plano original solo tenía dos) | Extiende el Plano; no cambia ningún dato |
| 5 | **Mostrar la «Nota (0 a 1)» con pesos.** El código original ya la calcula pero solo ordena | Puede leerse como puntuación |
| 6 | **Enseñar «Riesgos» y «Fuentes»**, que el JSON trae y la ficha original no mostraba | Es contenido ya existente, no nuevo |
| 7 | **Formato de URL con contexto** (`#medidas?…`) | Compatible con el `rutas.js` servido; falta confirmar el repositorio real y Vercel |
| 8 | **Repositorio fuente y pruebas del pipeline** | Sin ellos todo esto es prototipo y no se puede integrar |
| 9 | **Sistema de diseño de Astara** | Los estilos son provisionales |
| 10 | **Revisar los textos propuestos** (`CONTENT_FIDELITY.md` §6) | Es copy nuevo, marcado |
