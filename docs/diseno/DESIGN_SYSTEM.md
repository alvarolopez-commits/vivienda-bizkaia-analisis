# Design System · Astara Intelligence × Liquid Glass

Interpretación de la filosofía de Apple ([presentación de Liquid Glass](https://www.apple.com/es/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/)): una capa funcional de controles que flota sobre el contenido, que sigue siendo el protagonista, y que se adapta a lo que hay detrás. **No** se copia la interfaz de Apple ni se promete su sistema óptico nativo.

Se implementa en CSS y JavaScript sin frameworks, sobre la aplicación integrada (`sprint-03-1/app`, ruta conservada).

## Dónde vive cada cosa

| Archivo | Contenido |
|---|---|
| `app/css/typography.css` | Familias: Montserrat (titulares), Geist (texto, UI y **todas las cifras**), Geist Mono (solo código) |
| `app/css/tokens.css` | **Única fuente** de color de interfaz y de datos de las vistas de consulta, espaciado, radios, movimiento, elevaciones y los tres materiales, con su degradación |
| `app/css/marco.css` | Marco global: cabecera, navegación, menú, botones, pie |
| `app/css/movimiento.css` + `app/js/movimiento.js` | Movimiento: tokens de tiempo y curvas, transición de vistas, píldora deslizante, entrada, `tick`, cifras que ruedan, línea de tiempo, movimiento reducido |
| `app/css/lectura.css` + `app/js/lectura.js` | Composición compartida de las vistas de consulta: cabecera, barra de herramientas, índice interno, bloques de contenido |
| `app/css/situacion.css`, `medidas.css`, `medidas-diseno.css`, `municipios.css`, `acceso.css`, `normas.css`, `metodo.css` | Una hoja por vista; solo está activa la de la vista abierta |
| `app/original/` | Módulos y datos de la web publicada, copiados **byte a byte** (no se editan) |

Las **rampas semánticas de datos** (indicadores, líneas de medidas, «sin dato») no se tocan. Los pocos tonos de datos que usan las vistas de consulta (azul «decide / cabe», rosa «problema / no cabe») están en `tokens.css`, separados del color de interfaz.

## Tres capas de material

| Capa | Para qué | Cómo se aplica | Dónde |
|---|---|---|---|
| **L0 · Opaco** | Mapa, leyenda, ranking, cifras, tablas, matrices, texto largo | `--opaco-*`. Nunca desenfoque | Escenarios, mapa, Plano y leyenda, matrices, fichas, ranking, indicadores, rejilla de Acceso, texto de Método |
| **L1 · Vidrio funcional** | Navegación global, selectores, controles, índices, panel contextual breve | Clase `.vidrio` (una sola definición) o las mismas variables `--vidrio-*` | Cápsula de navegación, selector de problemas, controles del mapa, carcasa de los paneles, modos y cinta de criterios de Medidas, bandeja, barra de municipios, índices internos, controles del simulador de Acceso, nivel y fecha de Normas, buscadores |
| **L2 · Vidrio de foco** | Popover o panel temporal activo; máximo uno | `.vidrio-foco` / `--vidrio-foco-*` | Desplegables «Más criterios» y «Prioridades» |

Fondo ambiental (`--ambiente`): dos halos fríos tras la cabecera, solo en Situación. Da al vidrio algo que refractar.

## Movimiento
Sistema de movimiento tomado del sistema de marca de Astara (tiempos 150/240/420/700 ms, píldora deslizante, transición de vistas, `tick`, intensidades `still/restrained/expressive`, movimiento reducido): ver `MOVIMIENTO.md`. Archivos: `css/movimiento.css`, `js/movimiento.js`.

## Degradación (todo a superficie sólida)
Sin `backdrop-filter` (`@supports not`), con `prefers-reduced-transparency: reduce` y con `prefers-contrast: more` (además sube bordes y líneas). `prefers-reduced-motion` ya reduce transiciones. Si el contraste falla, se sube la opacidad antes que el desenfoque.

## Mapa de componentes (nombres del documento maestro → implementación)

| Componente | Implementación | Estado |
|---|---|---|
| AppShell / AppNavigation | `index.html`, `marco.css` | Hecho: cápsula L1, sección abierta en píldora oscura (`aria-current`), seis vistas locales |
| SectionHeader | `.lec-cab` (vistas de consulta), cabeceras de Situación y Medidas | Hecho |
| SectionTabs / índice interno | `.lec-indice` (lateral o en pestañas), con seguimiento del scroll | Hecho (Municipios, Método lateral; Acceso, Normas en pestañas) |
| GlassToolbar | `.herramientas`, `.lec-herr`, `.m-stage .rep-cab`, `.eligen` | Hecho |
| SegmentedControl | `.problemas`, `.modos`, `.m-lineas`, `.x-botones` + `.opcion` | Hecho |
| FilterBar / FilterPopover | Cinta y desplegables de Medidas | Hecho (L1 y L2) |
| ContextPanel | `.panel` (Situación), `.m-side` (Medidas): carcasa L1 con interior L0 | Hecho |
| DataPanel / DataCard | `.ficha-dato`, `.muni-cab`, `.x-kpi`, `.sec`, `.method-block` | Hecho (L0) |
| DataTable / MatrixShell | Matriz de Medidas, `.comp` (Normas), `.tabla`, `.escalera`, `.rejilla` | Hecho (L0) |
| MapShell | `.lienzo`, `.mapa-lienzo`, `.barrios-mapa` | Preservado (L0) |
| SearchField / SelectField | `.buscar`, `.buscar-lec`, selectores nativos con el aspecto de los controles | Hecho |
| Button | `.btn`, `a.pildora` | Hecho |
| ComparisonTray | `.bandeja` | Hecho (L1) |
| Legend | `.leyenda-bloque`, `.leyenda-lineas`, `.clave-puntos`, `.alcance-clave` | L0 opaco |
| StatusTag | `.veredicto`, `.pill`, `.hito-pend` | Hecho (texto + icono o forma, no solo color) |
| SourceNote | `.fuente`, `.source-line` | Preservado |
| Tooltip | `.tip` | Preservado |
| EmptyState / LoadingState / ErrorState | `.vacio`, `.glos-vacio`, `.aviso-error`, `.cargando` | Parcial: sin una pieza única todavía |

## Cómo se comprueba (`sprint-03-1/_qa/`)
- `integridad.py`: originales idénticos a la web publicada (manifiesto y, si existe, `DATA/`); CSS que cambia solo presentación, no maquetación (con una excepción documentada); tokens previos con el mismo valor.
- `acceso_vs_python.py`: `calculo-acceso.js` contra las fórmulas del análisis en Python del repositorio real.
- Navegador: navegación, Situación, equivalencia con los módulos originales, flujos, composición de Medidas, `qa-vistas.js` (Municipios, Acceso, Normas, Método, rutas antiguas), tipografía, contraste (`qa-contraste.js` y `qa-contraste-vistas.js`) y desbordes (`qa-desborde.js`).
