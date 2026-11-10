# WIREFRAME_A · Evolución conservadora

**Es la web original ejecutándose** (copia local del cliente servido) con tres añadidos: cabecera de seis vistas con productos externos, menú con «Otros productos» y barra interna de Situación. La escena, el mapa 2D/3D, la lista, los siete tipos y las cartas no se han modificado.

```text
┌ banda: Vivienda en Bizkaia │ Situación Municipios Acceso Medidas Normas Método │ Resumen ↗  Ver el radar ↗  Menú ┐   ← NUEVO: Método y Resumen
├ Mapa · Lista de municipios · Tipos de municipio · Otras herramientas ─────────────────────────────────────────────┤   ← NUEVO (solo en Situación)
│ Portada / escena de scroll con el 3D                      situacion/portada.js, territorio.js   ORIGINAL        │
│ Frase de tesis                                            situacion/index.js                    ORIGINAL        │
│ «El mapa» 2D/3D + ficha rápida + pestañas de problema      situacion/mapa-vivo.js                ORIGINAL        │
│ «Los 113 municipios, de más a menos»                       situacion/lista.js                    ORIGINAL        │
│ «Siete tipos de municipio» + 4 fotos                       situacion/hoja.js, data/fotos.json    ORIGINAL        │
│ «Cada pregunta tiene su pestaña» (4 cartas con cifras)     situacion/cartas.js                   ORIGINAL        │
│ Pie con copiar Resumen / Radar                             index.html                            ORIGINAL        │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Origen de cada bloque nuevo

| Bloque | Archivo | Líneas |
|---|---|---|
| Método en la banda, Resumen, orden visual de la banda | `preview-a/index.html` | 27 líneas de diferencia con el original |
| Barra interna de Situación | `index.html` + `js/sprint01.js` + `css/sprint01.css` | 86 + 60 líneas |
| Nombre de la vista activa y `aria-current` en el menú | `js/sprint01.js` | — |

## Qué se gana y qué se pierde

| Se gana | Se pierde o queda igual |
|---|---|
| Se llega a mapa, lista, tipos y herramientas sin recorrer la escena de 3.072 px | La escena sigue ocupando el comienzo de la página |
| Método y Resumen accesibles desde cualquier vista | La barra interna tapa 40 px de la parte alta de la portada |
| Cero riesgo para datos, fórmulas, 3D y animaciones | Los cinco problemas siguen eligiéndose en tres sitios con estado independiente (no se unifica sin pruebas) |
| Reversible: borrar 2 ficheros y restaurar `index.html` | |

**Recomendación del sprint:** A es la opción para un primer incremento (cambia solo navegación). Decisión final pendiente del autor (`OPEN_QUESTIONS A3`).
