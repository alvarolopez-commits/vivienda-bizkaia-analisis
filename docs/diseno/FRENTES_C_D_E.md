# Frentes C, D y E · Medidas, Municipios, Acceso, Normas y Método

**11-11-2026 · escritorio (1440 × 900 y 1280 × 800) · sin móvil · nada subido ni desplegado.** Continúa `PRIMERA_INTERVENCION.md` (fundación y Situación). Rama local `ux/liquid-glass-fundacion`, sobre el commit publicado `fb43450`.

## 1. Qué es nuevo

Las **seis vistas** son ahora vistas reales de la misma aplicación: ya no hay páginas «aún no rediseñadas». El repositorio real de la web (`DATA/vizcaya-vivienda-main`, cuyo `web-analisis/` es idéntico a lo publicado) levantó el bloqueo que había para integrar Municipios, Acceso, Normas y Método.

**Enfoque (el mismo en las cuatro):** el contenido lo sigue dibujando el **renderizador original** de la web publicada, copiado byte a byte a `app/original/` (textos, cifras, cálculos y datos no se reescriben). Cada vista lo monta en una **composición propia** con `app/js/lectura.js` y su hoja de estilos. Una prueba comprueba que el texto que se ve es idéntico, carácter a carácter, al del renderizador original.

| Vista | Composición | Material |
|---|---|---|
| **Situación** | (primera intervención) mapa + panel con ficha y ranking | Vidrio: selector, controles, carcasa del panel · Sólido: mapa, leyenda, cifras, ranking |
| **Medidas** | Escenario (Plano o Matriz) + panel lateral con ficha y lista, cinta de criterios y bandeja | Vidrio L1: modos, cinta, controles, carcasa del panel, bandeja · L2: desplegables · Sólido: plano, matriz, leyenda, fichas, lista |
| **Municipios** | Barra de herramientas (buscador nuevo + selectores originales), índice lateral con los bloques originales (Datos, Problemas, Hogares, Evolución, Barrios, Plan), perfil en tarjeta y bloques en tarjetas. Comparación: dos perfiles (azul y rosa) y dos columnas | Vidrio: barra e índice · Sólido: perfil, indicadores, problemas, hogares, series, barrios, plan |
| **Acceso** | Pestañas internas (Alquilar, La escalera, Tus supuestos, Hasta dónde llega). En el explorador: **supuestos a la izquierda** (lo que eliges / lo que no cambia) y **resultados a la derecha**. Veredictos con icono y texto | Vidrio: pestañas y controles de parámetros · Sólido: resultados, rejilla, escalera, mapa |
| **Normas** | Fecha del estado normativo en la cabecera; matriz de 15 instrumentos × 4 niveles como pieza central (punto lleno = decide, anillo = aplica o lo pide); debajo, línea de tiempo y «El margen» como segunda zona | Vidrio: pestañas y selección de nivel · Sólido: matriz, hitos, margen |
| **Método** | Biblioteca: índice lateral agrupado (Glosario, Cómo se hizo, Límites y revisión, Historial, Fuentes), buscador de las palabras clave, rótulo de tipo en cada bloque, ancho de lectura controlado | Vidrio: índice y buscador · Sólido: todo el texto |

## 2. Tabla de regresión (escritorio)

| Comprobación | 1440 × 900 | 1280 × 800 |
|---|---|---|
| Navegación entre las seis vistas, ida y vuelta, deep links | **PASS** 41 / 41 | **PASS** 41 / 41 |
| Municipios, Acceso, Normas y Método (equivalencia con el original, rutas, cálculos, filtros, búsqueda, índice, rutas antiguas) | **PASS** 48 / 48 | **PASS** 48 / 48 |
| Situación (suite completa) | **PASS** 101 / 101 | **PASS** 101 / 101 |
| Medidas · equivalencia con los módulos originales | **PASS** 30 / 30 | **PASS** 30 / 30 |
| Medidas · flujos (34 medidas, filtros, pesos, comparar) | **PASS** 74 / 74 | **PASS** 74 / 74 |
| Medidas · composición | **PASS** 33 / 33 | **PASS** 33 / 33 |
| Desbordes horizontales (12 rutas, incluida comparación, matriz y glosario) | **PASS** 12 / 12 | **PASS** 12 / 12 |
| Contraste WCAG AA, cuatro vistas nuevas | **PASS** 93 / 93 | no repetido (no depende del ancho) |
| Contraste WCAG AA, Situación (primera intervención) | **PASS** 31 / 31 | — |
| Tipografía (13 pantallas: sin serif, sin Geist Mono, cifras en Geist tabular) | **PASS** | **PASS** |
| `calculo-acceso.js` frente a las fórmulas del análisis en Python | **PASS** 6 / 6 | — |
| Integridad (originales idénticos, CSS solo de presentación, tokens) | **PASS** 21 / 21 | — |
| Foco de teclado visible sobre el vidrio | **PASS** (comprobado en pantalla) | — |
| Degradación a sólido (`prefers-reduced-transparency`) | **PASS** con las reglas aplicadas a mano; **PENDIENTE** con la preferencia real del sistema | — |
| Rendimiento del desenfoque | **PENDIENTE** | — |
| Lector de pantalla, Safari, Firefox | **PENDIENTE** | — |
| Móvil | No aplica (excluido) | — |

Un defecto que ya existía se corrigió al probar a 1280: la ficha de Medidas se salía del panel por la izquierda por una regla antigua de `medidas.css` (panel superpuesto a menos de 1400 px).

### Ajustes tras la primera revisión local
1. **Barras de desplazamiento.** En Windows, Chrome y Edge pintaban la barra clásica (con flechas, pegada al borde y encima de las cifras del ranking). Ahora hay una barra del sistema, fina, redondeada y sin flechas, en todos los contenedores con scroll propio (ranking, listas, matrices, fichas, índices). Firefox mantiene la barra fina estándar.
2. **Pie de página.** Se elimina el texto «Prototipo integrado, no publicado…» y, con él, el pie.
3. **Fuentes de Situación.** El texto «Fuentes: Gobierno Vasco, estadística del alquiler… · Eustat… · Etxebide…» sale del panel y pasa al pie de la página, justo encima de «Datos descargados el…». Es el mismo elemento del original (mismos enlaces); ahora se ve siempre, con o sin municipio elegido, y cambia con el problema.
4. **Índice de Método** compactado para que quepa entero en una ventana de 900 px de alto sin barra propia.

## 3. Decisiones que he tomado y quiero que revises
1. **Cifras que ruedan → texto fijo.** La web publicada anima las cifras (dígitos que giran, con su CSS). Aquí se devuelven a texto plano en Geist tabular, para que ningún efecto visual altere una cifra. Se pierde esa animación de entrada.
2. **Efectos de movimiento del original** (títulos que se enfocan, frase que se llena de tinta, línea de tiempo que se dibuja al bajar, capítulo en la banda) **no se han portado**: no aportan al uso y chocan con «sin efectos que resten control».
3. **Buscador de municipios** (nuevo): lleva a la misma dirección que los selectores de siempre y conserva la comparación. No cambia ningún dato.
4. **Acceso, «Lo que no cambia»:** el 80 % y el 30 % salen de `acceso.json`. El umbral de **10 años** es una constante del código original (no está en los datos): se muestra como `10`.
5. **Método, buscador del glosario:** filtra por el literal original (en el término o en la definición). Los **rótulos de tipo de bloque** y los grupos del índice son nuevos (la redacción de los bloques no se toca).
6. **Normas:** la etiqueta «Estado normativo a» es nueva; la fecha es la del dato.
7. **No hecho a propósito:** URL compartible para los supuestos de Acceso (el documento maestro dice que solo después de fijar la codificación y con regresión).

Todos los textos nuevos llevan `data-propuesta` (`?marcar` los resalta): «En esta página», «Buscar municipio», «Lo que eliges», «Lo que no cambia» y sus tres frases, «Estado normativo a», «Buscar en las palabras clave», el contador de términos, «Ningún término contiene ese texto» y los rótulos de Método.

## 4. Decisiones editoriales que siguen bloqueadas (necesitan al autor)
Ninguna se ha tocado:
1. Significado de **BM30** (se mantiene como etiqueta original, también en Método).
2. **Estados jurídicos**: los dos decretos de octubre de 2026 «pendientes de convalidar» (texto de Método y de las fichas) y los hitos pendientes de Normas. Hay que revisarlos con el autor con fecha y responsable; este rediseño no los actualiza.
3. Criterios de **10 años y 30 %** hasta aprobación expresa.
4. El préstamo estatal **«TU CASA»** (texto jurídico de Acceso) y su remisión a revisión editorial.
5. «Sin dato» (trama) y valores orientativos en Municipios y Acceso («Aproximado»): sin cambios.
6. Escena de scroll / 3D del original: no restaurada.
7. Textos propuestos de la sección anterior.

## 5. Cosas técnicas pendientes
- **Fuentes en producción:** la web publicada impone una política de seguridad que solo admite fuentes propias (`vercel.json`). Nuestra app carga Montserrat y Geist desde Google Fonts; antes de publicar hay que servirlas desde el propio repositorio (comprobando su licencia).
- **`pytest` no está instalado**: las pruebas del repositorio real (`DATA/.../tests`) no se han ejecutado tal cual; `acceso_vs_python.py` reproduce la de `calculo-acceso`. Quedan sin ejecutar las de rutas, textos y exportación del repositorio original.
- **`DATA/` y `docs/audit/`** siguen fuera de git (repositorio público).
- Tres titulares de Montserrat siguen siendo `<p>` en Medidas (enlaces de la cadena); el nombre del municipio es ahora un encabezado ARIA.

## 6. Archivos
**Nuevos:** `app/js/lectura.js`; `app/js/{municipios,acceso,normas,metodo}/index.js`; `app/css/{lectura,municipios,acceso,normas,metodo}.css`; `app/original/js/{municipios,acceso}/*`, `normas.js`, `view-metodo.js`, `glosario.js`, `calculo-acceso.js` y siete JSON/GeoJSON (copias byte a byte); `_qa/qa-vistas.js`, `_qa/qa-contraste-vistas.js`, `_qa/qa-desborde.js`, `_qa/acceso_vs_python.py`.
**Modificados:** `app/index.html`, `app/js/app.js` (seis vistas y rutas antiguas), `app/js/datos.js` (carga completa), `app/css/{tokens,marco,medidas-diseno}.css`, `_qa/{integridad,qa-navegacion,qa-disenos,qa-tipografia}.js/py`, READMEs y documentos de `docs/diseno/`.
**Eliminado:** `app/js/pendiente/` (la página provisional).
**Capturas:** `docs/diseno/capturas/vistas/` (seis vistas a 1440 × 900 y a 1280 × 800, y páginas completas de las cuatro vistas nuevas).

## 7. Reversión
Todo está en la rama `ux/liquid-glass-fundacion`, sin fusionar ni publicar. Para volver atrás basta con no fusionarla: `fb43450` sigue intacto.
