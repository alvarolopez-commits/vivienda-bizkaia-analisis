# UX_AUDIT — Web interactiva «Análisis y medidas»

**Base:** `AS_IS_INVENTORY.md` (todo `OBSERVADO_EN_WEB_PENDIENTE_REPO`). Distingue **Hecho** (medido o visto) de **Hipótesis** (a validar con usuarios o código). Ninguna propuesta cambia textos, datos ni lógica.

## 0. Hallazgo que corrige el brief v0.2

El brief describe Situación como «portada, cinco problemas y mapa». Lo observado es distinto:

- La **portada es una escena de scroll anclado de 3.072 px** (≈ 4 pantallas a 768 px; 36 % de la altura de la vista) en la que **un mapa 3D** cambia de capa y muestra **una tarjeta de problema cada vez**.
- Después hay un **segundo mapa** («El mapa», con conmutador 2D/3D y cinco pestañas) que repite los mismos cinco temas.
- El brief dice «no introducir scrollytelling del Resumen en esta herramienta» y «no inferir que el mapa sea 3D». **Ya existe scrollytelling y el mapa 3D está visto en la web.** Decisión pendiente en §3.

## 1. Hechos observados

| ID | Hecho | Vista |
|---|---|---|
| F1 | Situación mide 8.432 px; portada 3.072 px, antes de llegar a la primera herramienta interactiva (mapa, a 3.358 px) | Situación |
| F2 | Las cinco tarjetas aparecen de una en una; **no se observó** índice, contador ni control para saltar a un problema concreto | Situación |
| F3 | La tarjeta inferior izquierda queda **recortada por el borde inferior** en viewport de 800×600 (texto «En el mapa: …») | Situación |
| F4 | En la captura de escritorio (~1024 px o menos) la cabecera muestra solo el nombre de la sección actual (cambia con el scroll: «Situación», «La tesis», «El mapa»), «Menú» y «Ver el radar». Los enlaces a las vistas existen en el DOM pero no se ven a ese ancho; «Método» solo aparece en el menú y el pie. **No se inspeccionaron anchos mayores** | Global |
| F5 | La cabecera marca estado activo con `aria-current="page"` en el enlace de la vista | Global |
| F6 | La entrada a las cuatro herramientas («Cada pregunta tiene su pestaña») está a 7.244 px; antes solo hay «Busca tu municipio» y «Menú» | Situación |
| F7 | «Ver el radar» tiene peso visual de botón primario, junto a la navegación; Resumen solo aparece en el pie | Global |
| F8 | Medidas: 12 columnas en la matriz; cuatro bloques exploratorios en la misma vista (burbujas, tabla filtrable, cadena problema→vigilar, quién decide) + comparador | Medidas |
| F9 | Medidas, Municipios y Normas repiten el listado de 34 / 113 elementos dentro de controles y de texto (largo para lector de pantalla); **no medido** | Varias |
| F10 | A 375 px no hay scroll horizontal en Medidas ni Municipios; la cabecera pasa a «Vivienda en Bizkaia · Menú · botón» | Global |

## 2. Hipótesis (no hechos)

- H1: quien llega a Situación sin saber qué es la herramienta tarda demasiado en descubrir que existen Acceso, Medidas y Normas (F6).
- H2: la portada compite con el mapa de la sección siguiente: dos mapas con los mismos cinco temas (F1).
- H3: sin salto directo a cada problema, volver a «Pueblos con viviendas vacías» exige re-scrollear (F2).
- H4: con las vistas dentro de «Menú», el estado «dónde estoy» es débil en escritorio (F4) — contradice la meta del brief §4.1.
- H5: en Medidas, el flujo explorar → filtrar → comparar no está señalizado como secuencia (F8).

## 3. Situación — dos alternativas (según brief §5) + una nota

Ambas conservan: título y entradilla originales, los cinco problemas **con sus literales y orden**, y el mapa interactivo (no imagen estática). Ninguna crea titulares ni cifras nuevas.

### Alternativa A — Bloque editorial arriba, mapa debajo a ancho completo
```text
┌ cabecera: marca · Situación Municipios Acceso Medidas Normas Método · Radar ┐
│ TÍTULO + ENTRADILLA originales                      [Busca tu municipio]   │
│ ┌ 1 ┐┌ 2 ┐┌ 3 ┐┌ 4 ┐┌ 5 ┐  los cinco problemas, a la vista a la vez          │
│ MAPA ancho completo: pestañas de tema sincronizadas con 1–5, 2D/3D, ficha   │
│ Frase de tesis · Entrada a las 4 herramientas (sube desde el final)         │
└─────────────────────────────────────────────────────────────────────────────┘
```
- **Pro:** resuelve F2, F6, H1, H3 y elimina el segundo mapa redundante (H2) al fusionarlo con el primero; móvil = apilado natural.
- **Contra:** **retira la escena anclada actual**; es el mayor cambio de experiencia y hay que decidirlo editorialmente. El mapa pierde la presencia de pantalla completa.

### Alternativa B — Cinco problemas junto al mapa (escritorio) / apilado (móvil)
```text
┌ cabecera igual ─────────────────────────────────────────────────────────────┐
│ TÍTULO + ENTRADILLA                                                          │
│ ┌ lista 1–5 (seleccionada) ┐ ┌ MAPA (capa del problema elegido) ───────────┐ │
│ │ tarjeta del problema      │ │ 3D/2D, leyenda, municipio al tocar          │ │
│ └───────────────────────────┘ └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```
- **Pro:** conserva el espíritu «mapa que cambia con el problema» y da salto directo 1–5; menos scroll (F1).
- **Contra:** solo si el mapa conserva legibilidad e interacción a ~60 % de ancho; en móvil la lista y el mapa compiten por la pantalla.

### Alternativa C (no pedida; la señalo, no la recomiendo por defecto)
Conservar la escena anclada tal cual y **añadir** únicamente un indicador 1–5 con salto y un acceso temprano a las cuatro herramientas. Es la de menor riesgo editorial; deja F1 y H2 sin resolver.

**DECISIÓN (2026-11-10, usuario): Alternativa B.** La escena anclada actual de la portada se sustituye por cinco problemas junto al mapa. Condiciones heredadas del brief: literales y orden de los cinco problemas intactos; mapa interactivo (no imagen); el mapa debe seguir legible a ~60 % de ancho; apilado en móvil. Pendiente de validar editorialmente que retirar el scroll anclado es aceptable para el autor original.

**DECISIÓN (2026-11-10, usuario): fusionar «El mapa» con el bloque de la portada.** La sección `mapa` (pestañas de tema, 2D/3D, mapa, «Otro municipio», cifra, «Ver su ficha», fuente) se integra en el bloque único de Situación. Las pestañas de tema las sustituye la lista de los cinco problemas, en el mismo orden. Se conservan literales, nota de fuente, leyenda y datos. Por verificar en repo: que las capas del mapa de portada y de `mapa` sean la misma lógica.

**DECISIÓN (2026-11-10, usuario): sincronizar la lista «Los 113 municipios, de más a menos» con el problema elegido en el bloque.** Un solo selector gobierna mapa, ficha rápida y lista. Las cinco pestañas propias de la lista desaparecen como control (los datos de cada una siguen accesibles); se conservan filtros por tipo, orden, recuentos «con dato», «Ficha →», «Ver los 35» y fuente. Es un cambio de interacción original: verificar con el repo antes de dar por pasada la prueba A06. Microcopy nuevo a aprobar: «Se actualiza con el problema elegido arriba».

**ALCANCE (2026-11-10, usuario): la versión móvil se aplaza.** Las maquetas y el análisis se hacen solo para escritorio. Lo dicho sobre 375 px en este documento queda como observación, sin diseño asociado, hasta nueva orden.

## 4. Mejoras de navegación global (`PROPUESTA_UX`)
1. Mostrar las seis vistas en la cabecera en escritorio (≥ 1024) y mantener «Menú» solo en móvil; incluir «Método» (F4, H4).
2. Separar visualmente «Radar» y «Resumen» como enlaces externos, con el mismo tratamiento para ambos (F7).
3. Conservar los hashes y el patrón `#municipios/<INE>`; añadir anclas de bloque solo si no chocan (compatibilidad de URL).
4. Retorno: al abrir una ficha o medida, recordar la posición previa.

## 5. Mejoras por herramienta (`PROPUESTA_UX`, sin tocar lógica)
- **Municipios:** distinguir en cabecera «Municipio» y «Comparar con»; mostrar claramente ausencia de dato (no 0).
- **Acceso:** agrupar controles («Tus supuestos») frente a resultados; mantener visibles unidades y el aviso «96 municipios sin precio propio usan el de su área: aproximado».
- **Medidas:** barra de filtros activos con «Quitar filtros» (F8, H5); separar «Explorar» y «Comparar» como pasos.
- **Normas:** fijar la cabecera de la matriz y resaltar el nivel filtrado.
- **Método:** índice alfabético del glosario solo si el repo confirma que la lista es estática.

## 5 bis. Verificación contra el código servido (2026-11-10)
La web publica sus módulos JS sin minificar (`/js/*.js`, `/data/*.json`). Leyéndolos se confirma, sin repo, que `OBSERVADO_EN_WEB_PENDIENTE_REPO` pasa a `VERIFICADO_EN_CODIGO_SERVIDO` para Situación:
- El mapa de «El mapa» es un **SVG** (`mapa.js`); el 3D es WebGL (`situacion/territorio.js`), que se monta la primera vez que se pide. El canvas que contó la auditoría inicial es el 3D.
- Los cinco indicadores, colores, leyendas y rankings salen de `situacion/indicadores.js`; los textos de las cinco tarjetas, de `resumen.json`.
- La portada usa la escena `territorio` de `vendor/taste/` (scroll anclado). **En móvil y con «reducir movimiento» la web ya cae a una lista de los cinco problemas sin scroll anclado**, lo que respalda la Alternativa B.
- La lista de 113 ya muestra 10 filas y un botón «Ver los N»; el prototipo mantiene ese comportamiento.
- Las cifras de las tarjetas de herramientas («113 fichas», «10,8 a 16,9», «34», «4») **se calculan** en `situacion/cartas.js` a partir de los datos (número de municipios, tramo P50 de acceso, número de medidas y de niveles de normas).
No verificado todavía: las vistas Municipios, Acceso, Medidas, Normas y Método (los módulos existen en `/js/` y se pueden leer del mismo modo).

## 6. Pendiente de repo / validación editorial
Fórmulas y datasets · estados de error/vacío · foco y teclado · lector de pantalla · rendimiento del canvas 3D en móvil · BM30 · vigencia de normas a 2-11-2026 (auditoría jurídica separada, no corregir) · marca Astara (el esquema azul noche/celeste/rosa **no** se asume corporativo).
