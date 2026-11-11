# Sprint 03.1 · Prototipo integrado: una sola propuesta

**11-11-2026 · escritorio (1440 × 900) · sin móvil · no es producción.**

Una única aplicación donde Situación y Medidas comparten marco, datos y tipografía. Las propuestas A y B de Medidas eran casi iguales y confundían: queda una sola (la que era A).

## Cómo abrirla
```bash
python sprint-03-1/servidor.py
```
Después http://localhost:4179/ (o `Abrir Sprint 03.1.bat`). Publicada en GitHub Pages: `…/vivienda-bizkaia-analisis/sprint-03-1/app/`.

## Navegación: todo dentro del mismo marco
| Pestaña | Qué abre |
|---|---|
| Situación | Living Atlas (Sprint 02) |
| Medidas | Explorador (Sprint 03) con la composición única |
| Municipios, Acceso, Normas, Método | Página **«Aún no rediseñada»** en el mismo marco (misma cabecera, misma tipografía) con el botón «Ver la versión actual» (pestaña nueva) y «Volver a Situación» |
| Resumen, Radar, «Ver su ficha» | Otros productos o la web actual, siempre en pestaña nueva |

Antes, Municipios y compañía abrían la web antigua en la misma pestaña: se veía otra tipografía (con serif) y, al volver, «Situación» era la de la web antigua. Ya no ocurre: no se sale del prototipo. Las páginas pendientes no contienen contenido nuevo; sus textos son propuesta (marcados con `?marcar`).

## Medidas: la composición
- **Escenario** (Plano o Matriz) a la izquierda con el fondo y las superficies del Atlas.
- **Panel lateral fijo**: ficha de la medida elegida (o «El conjunto a la vista») y lista de las medidas a la vista, sincronizada.
- **Filtros** en una cinta superior: 6 líneas con su cuenta; «Más criterios» y «Prioridades» en desplegables.
- **Bandeja de comparación** flotante.

## Tipografía
Un solo archivo (`app/css/typography.css`): Montserrat solo en titulares, Geist en texto, navegación, controles, tablas y todas las cifras, Geist Mono solo para código (no se usa). Informe: `TIPOGRAFIA_APLICADA.md`.

## Qué se conserva
Datos, textos, criterios, pesos, orden y fórmulas. Los 20 ficheros originales de `app/original/` son idénticos (sha256) a los de la web servida; los módulos de cálculo copiados son idénticos salvo la ruta de importación.

## Pruebas (1440 × 900)
| Prueba | Resultado |
|---|---|
| Navegación (ida y vuelta, cuatro páginas pendientes, sin saltos de pestaña, tipografía de las pendientes) | 39 de 39 |
| Situación (suite del Sprint 02) | 101 de 101 |
| Equivalencia con los módulos originales | 30 de 30 |
| Flujos de Medidas (34 medidas, filtros, pesos, comparar 2–3) | 74 de 74 |
| Composición (cinta, panel, lista, bandeja, Matriz) | 33 de 33 |
| Tipografía | Todo en Geist salvo titulares en Montserrat; sin serif, sin Geist Mono, sin cifras fuera de Geist |
| Integridad (hashes, JSON, módulos copiados) | Ver `python -I sprint-03-1/_qa/integridad.py` |

**Sin probar:** móvil (excluido), 1280 px, lector de pantalla, Safari y Firefox.

## Capturas
`capturas/final/`: Situación, Medidas (Plano con ficha, Matriz con pesos y selección, Comparar, Entender) y una página pendiente en el marco. `capturas/antes` y `capturas/despues` son las de la tipografía.

## Diferencias deliberadas respecto a los sprints 02 y 03
1. Los filtros de Medidas pasan de la barra lateral a la cinta superior.
2. El panel de Medidas es persistente y lleva la lista (equivalente al ranking del Atlas).
3. La bandeja de comparación es flotante.
4. Municipios, Acceso, Normas y Método son páginas pendientes dentro del marco, no la web antigua.
5. La sección abierta de la cabecera se marca con una píldora oscura (como las pestañas de los problemas del Atlas), en lugar del subrayado.
6. Textos nuevos marcados con `data-propuesta`: «El conjunto a la vista», «Las medidas a la vista», «Más criterios», «Prioridades», y los de las páginas pendientes.
