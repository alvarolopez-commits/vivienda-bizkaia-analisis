# Primera intervención · Fundación del sistema y Situación en vidrio

**11-11-2026 · escritorio (1440 × 900 y 1280 × 800) · sin móvil · nada desplegado.** Frente A (fundación) y la parte de superficie del frente B (Situación). No se ha extendido el estilo al resto de vistas.

## 1. Punto de partida (confirmado)
- La URL `…/sprint-03-1/app/` la sirve GitHub Pages desde la rama `ux/sprint-03-1-continuidad`, commit **`fb43450`**.
- Verificado byte a byte (sin saltos de línea): `index.html`, `marco.css`, `situacion.css`, `medidas-diseno.css`, `app.js`, `situacion/index.js` y `pendiente/index.js` publicados = los del commit.
- Rama de trabajo aislada desde ese commit: **`ux/liquid-glass-fundacion`**. Sin carpetas de sprint nuevas: todo en `sprint-03-1/app` (nombre de ruta heredado), documentación en `docs/diseno/`.
- Los archivos de los sprints 02 y 03 solo se usan como referencia de la lógica copiada, que sigue siendo idéntica (lo comprueba `integridad.py`).

## 2. Estado de las seis vistas
| Vista | Estado real |
|---|---|
| Situación | Integrada (Living Atlas). **Intervenida ahora** (materiales). |
| Medidas | Integrada (explorador). Sin tocar, salvo la cabecera global compartida. |
| Municipios, Acceso, Normas, Método | **No integradas**: página «Aún no rediseñada» en el marco, con enlace a la versión actual en pestaña nueva. **BLOQUEO** para su rediseño: no se ha importado su código ni sus datos (frentes D y E). No se simula funcionalidad. |

## 3. Qué ha cambiado

**Tokens y materiales** (`tokens.css`, nuevo): colores de interfaz, espaciado, radios, movimiento y elevaciones consolidados en un solo sitio; materiales L0, L1 y L2; degradación a sólido. Ver `DESIGN_SYSTEM.md`.

**Cabecera y navegación:** barra translúcida con línea inferior; las seis pestañas en una **cápsula de vidrio**; la sección abierta es una píldora oscura con peso 600 y `aria-current` (no depende solo del color). «Ver el radar» con borde óptico.

**Situación:**
1. Selector de problemas: control segmentado de vidrio. Segmento activo oscuro; las barras de color de cada problema, intactas.
2. Controles del mapa (zoom, Restablecer): barra de vidrio L1.
3. Panel del municipio: carcasa de vidrio. Dentro, en **opaco**: la tarjeta de la cifra, las cinco celdas del perfil y el ranking. Buscador y filtro sobre el vidrio.
4. Leyenda: pasa a **opaco** (es contenido; antes llevaba desenfoque sobre el mapa).
5. Fondo ambiental discreto tras la cabecera.

**No cambia:** el mapa (113 geometrías), colores y escalas de datos, valores, «sin dato», ficha, ranking, selección, rutas, textos, JSON, fórmulas. **Ningún archivo JS de lógica**: el único cambio en `js/` son tres clases en `situacion/plantilla.html`.

## 4. Capturas antes / después (`docs/diseno/capturas/`)
- `antes/` y `despues/`: Situación (Bilbao·Alquiler, Bizkaia·Entrada, Getxo·Turísticas) a 1440 × 900, Bilbao a 1280 × 800, Medidas (Plano con ficha y Matriz) y Municipios pendiente.
- `comparativa-*.png`: antes y después lado a lado.

## 5. Diff
7 archivos, +277 −63 (respecto a `fb43450`):

| Archivo | Cambio |
|---|---|
| `app/css/tokens.css` | **Nuevo**: tokens y materiales |
| `app/css/marco.css` | Los tokens salen a `tokens.css`; cabecera y botones usan materiales |
| `app/css/situacion.css` | 33 declaraciones de presentación |
| `app/index.html` | Enlace a `tokens.css`; clase `vidrio` en la cápsula y en «Ver el radar» |
| `app/js/situacion/plantilla.html` | Clase `vidrio` en selector, controles del mapa y panel |
| `_qa/integridad.py` | Regla nueva: respecto al commit publicado solo cambia presentación |
| `_qa/qa-contraste.js` | **Nuevo**: contraste AA |

## 6. Regresión (escritorio)
| Comprobación | Resultado |
|---|---|
| Situación (suite completa: mapa, 5 problemas, selección, ranking, búsqueda, teclado, URL) | **PASS** 101 / 101 |
| Navegación entre las seis vistas, ida y vuelta, deep links | **PASS** 39 / 39 |
| Medidas: equivalencia con módulos originales | **PASS** 30 / 30 |
| Medidas: flujos (34 medidas, filtros, pesos, comparar) | **PASS** 74 / 74 |
| Medidas: composición | **PASS** 33 / 33 |
| Tipografía: sin serif, sin Geist Mono, cifras tabulares en Geist | **PASS** (0 incidencias; 2 titulares Montserrat sin etiqueta `h`, ya conocidos) |
| Integridad de datos, módulos y CSS | **PASS** 25 / 25 |
| Contraste WCAG AA, peor caso del fondo ambiental | **PASS** 31 / 31 (el más ajustado: posición del ranking, 4,65:1) |
| Foco de teclado visible sobre el vidrio | **PASS** (comprobado en pantalla) |
| Degradación a superficies sólidas | **PASS** con las reglas de `prefers-reduced-transparency` aplicadas a mano; **PENDIENTE** con la preferencia real del sistema operativo |
| 1280 px | **PASS** en captura de Situación (maqueta sin desbordes); la suite automática completa a 1280 queda **PENDIENTE** |
| Rendimiento (coste del blur) | **PENDIENTE** (medir con perfil de Chrome) |
| Lector de pantalla, Safari, Firefox | **PENDIENTE** |
| Móvil | No aplica (excluido) |

## 7. Decisiones editoriales bloqueadas (necesitan al autor)
Ninguna se ha tocado ni resuelto en esta intervención:
1. Significado de **BM30** (se mantiene como etiqueta original).
2. Estados jurídicos y convalidaciones (redacción actual).
3. Criterios de 10 años y 30 % hasta aprobación expresa.
4. Escena de scroll / 3D del original: no se ha restaurado.
5. «Sin dato» (trama) y atenuación: sin cambios; pendiente de confirmar.
6. Textos de las páginas «Aún no rediseñada» (propuesta).
Para cada una hay que abrir un ticket editorial con fecha y responsable (no creado todavía: lo decide el equipo).

## 8. Decisiones de diseño que quiero que revises
- **Leyenda opaca** (antes en vidrio): es contenido según el documento. ¿Conforme?
- **Cápsula de navegación**: ¿demasiado presente o bien? El vidrio es sutil a propósito; el fondo ambiental es lo que lo hace visible.
- **«Atajos claros»** del buscador y del mapa: hoy solo hay el teclado ya existente; añadir un atajo nuevo (por ejemplo «/» para buscar) cambiaría el comportamiento, así que lo dejo a tu decisión.

## 9. Reversión
Todo está en la rama `ux/liquid-glass-fundacion` sin fusionar ni publicar. Volver atrás = no fusionarla; el commit publicado `fb43450` queda intacto.
