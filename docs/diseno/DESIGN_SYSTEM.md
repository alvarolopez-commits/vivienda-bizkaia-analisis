# Design System · Astara Intelligence × Liquid Glass

Interpretación de la filosofía de Apple ([presentación de Liquid Glass](https://www.apple.com/es/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/)): una capa funcional de controles que flota sobre el contenido, que sigue siendo el protagonista, y que se adapta a lo que hay detrás. **No** se copia la interfaz de Apple ni se promete su sistema óptico nativo.

Se implementa en CSS puro, sobre la aplicación integrada existente (`sprint-03-1/app`, ruta conservada). Sin frameworks nuevos.

## Dónde vive cada cosa

| Archivo | Contenido | Estado |
|---|---|---|
| `app/css/typography.css` | Familias: Montserrat (titulares), Geist (texto, UI y **todas las cifras**), Geist Mono (solo código) | Sin cambios |
| `app/css/tokens.css` | **Única fuente** de color de interfaz, espaciado, radios, movimiento, elevaciones y los tres materiales, más su degradación | **Nuevo** |
| `app/css/marco.css` | Marco global: cabecera, navegación, menú, botones, pie | Usa tokens; cabecera en vidrio L1 |
| `app/css/situacion.css` | Living Atlas | Materiales aplicados (solo presentación) |
| `app/css/medidas.css`, `medidas-diseno.css` | Medidas | **Sin tocar** (siguiente frente) |

Las **rampas semánticas de datos** (indicadores, líneas de medidas, «sin dato») no están en `tokens.css`: ninguna capa de interfaz puede cambiarlas.

## Tres capas de material

| Capa | Para qué | Cómo se aplica | Dónde, hoy |
|---|---|---|---|
| **L0 · Opaco** | Mapa, leyenda, ranking, cifras, tablas, matrices, texto largo | `--opaco-*` / clase `.opaco`. Nunca desenfoque | Lienzo del mapa, leyenda, tarjeta de la cifra, celdas del perfil, ranking |
| **L1 · Vidrio funcional** | Navegación global, selector de problema, controles, panel contextual breve | Clase `.vidrio` (una sola definición): fondo translúcido + reflejo + borde óptico + contorno fino + sombra + `blur(20px) saturate(170%)` | Cápsula de navegación, «Ver el radar», selector de problemas, controles del mapa, carcasa del panel |
| **L2 · Vidrio de foco** | Popover o panel temporal activo; máximo uno a la vez | Clase `.vidrio-foco` (más opaco, más blur) | Definida, aún sin uso (llegará con los popovers de Medidas) |

Fondo ambiental (`--ambiente`): dos halos suaves de color frío tras la cabecera, solo mientras Situación está activa. Da al vidrio algo que refractar sin competir con los datos.

## Degradación (todo a superficie sólida)
- Sin soporte de `backdrop-filter` (`@supports not`).
- `prefers-reduced-transparency: reduce`.
- `prefers-contrast: more` (además sube la opacidad de bordes y líneas).
- `prefers-reduced-motion` ya reduce transiciones y animaciones en las hojas de vista.
Si el contraste falla, se sube la opacidad antes que el desenfoque.

## Mapa de componentes (nombres del documento maestro → implementación actual)

| Componente | Implementación | Acción |
|---|---|---|
| AppShell / AppNavigation | `index.html`, `marco.css` (`.banda`, `.vistas`) | **Adaptado** (vidrio L1, píldora oscura = sección abierta, `aria-current`) |
| SegmentedControl | `.problemas` (Situación); `.opcion` y modos en Medidas | Situación **adaptado**; Medidas pendiente |
| GlassToolbar | `.herramientas` (mapa) | **Adaptado** |
| ContextPanel | `.panel` (Situación); `.m-side` y `.panel-medida` (Medidas) | Situación **adaptado** (carcasa L1, interior L0); Medidas pendiente |
| DataCard / DataPanel | `.ficha-dato`, `.perfil-b` | **Adaptado** (opaco con borde) |
| SearchField, SelectField | `.buscar`, `#tipo` | **Adaptado** (borde óptico sobre el vidrio) |
| Button | `.btn` | **Adaptado** (tokens, variante `.vidrio`) |
| MapShell | `.lienzo` | **Preservado** |
| Legend | `.leyenda-bloque` | **Cambiado a L0 opaco** (la leyenda es contenido; antes llevaba desenfoque) |
| Tooltip | `.tip` | Preservado |
| SourceNote | `.source-line`, `.fuente` | Preservado |
| DataTable / MatrixShell / ChartShell | Matriz y Plano de Medidas | Preservado (frente C) |
| ComparisonTray, SelectionChip, StatusTag | Medidas | Pendiente (frente C) |
| EmptyState / LoadingState / ErrorState | `.vacia`, `.cargando`, `.aviso-error`, `.pendiente` | Pendiente de normalizar |
| SectionHeader / SectionTabs / índice | Por vista | Pendiente (frentes D y E) |

## Cómo se comprueba (`sprint-03-1/_qa/`)
- `integridad.py`: JSON y módulos originales intactos; respecto al commit publicado, el CSS solo cambia propiedades de **presentación**, nunca de maquetación; los 25 tokens previos mantienen su valor.
- `qa-contraste.js`: WCAG AA de cada texto sobre su superficie, en el peor caso del fondo ambiental.
- Más las suites de navegación, Situación, equivalencia, flujos, composición y tipografía.
