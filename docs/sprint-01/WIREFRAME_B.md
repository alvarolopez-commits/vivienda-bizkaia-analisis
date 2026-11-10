# WIREFRAME_B · Herramienta primero

**Prototipo aislado y reversible, solo para evaluar la estructura.** No sustituye la portada real: si el autor no valida retirar la escena, B no se adopta. Tokens neutrales (gris, un azul de acción, tipografía del sistema): no usa el sistema visual de Astara.

```text
┌ banda: marca │ seis vistas │ Resumen ↗  Ver el radar ↗  Menú ┐                    mismo patrón que A
│ H1 «113 municipios, cinco problemas» + entradilla + [Busca tu municipio]     │ tesis y nota  EXACTAS (resumen.json) │
│ «Cada municipio, con su dato»                                                  │
│ [Municipio ▾] [Tipo de municipio ▾]                                  [2D|3D]   │   barra de controles (NUEVA)
│ ┌ problema elegido (grande) ┐ ┌ ficha del municipio  ┐                         │
│ │ + 4 problemas en tarjetas │ │ «Los 113 municipios,  │   UN solo selector      │
│ ├ mapa 2D / 3D  ────────────┤ │  de más a menos»      │   gobierna los tres     │
│ └───────────────────────────┘ └──────────────────────┘                         │
│ DEMOSTRACIÓN · «Siete tipos de municipio»  (bloque original NO incluido)       │
│ «Cada pregunta tiene su pestaña» (4 cartas con cifras calculadas)              │
└────────────────────────────────────────────────────────────────────────────────┘
```

## Qué es real y qué es demostración

| Bloque | Origen | Estado |
|---|---|---|
| Título, entradilla, «Busca tu municipio», encabezados | Literales de la web (`index.html`, `situacion/mapa-vivo.js`, `cartas.js`) | **Real** |
| Los cinco problemas (cifra, titular, unidad, fuentes) y la tesis | `data/resumen.json` (copia íntegra) | **Real** |
| Valores por municipio, colores, leyendas, lista de 113 | `data/situacion.json` (subconjunto con igualdad comprobada), `js/indicadores.js` (original, solo cambia un import) | **Real**, con los colores originales de cada indicador |
| Mapa SVG y 3D | `js/mapa.js` (original), `js/territorio.js` (original con 3 rutas), three.js r160 con la cámara original | **Real**, con el 3D |
| Cuatro cartas | Cifras **calculadas** de `acceso.json`, `medidas.json`, `normas.json` y de la lista de municipios | **Real** |
| Selector único de problema, ficha rápida, filtro por tipo, tooltips | Lógica nueva (`js/app.js`) | **Prototipo funcional** |
| Cabecera y menú | Nuevos | **Prototipo funcional** |
| «Siete tipos de municipio» | — | **Demostración rotulada**, sin contenido inventado |
| Enlaces «Ver su ficha» y de las cartas | Apuntan a la web publicada | Funcionan fuera del prototipo |

## Qué se gana y qué se pierde

| Se gana | Se pierde |
|---|---|
| Acceso directo al mapa, la ficha y la lista con un solo selector de problema | La escena narrativa de scroll y su efecto de marca (decisión del autor) |
| El mapa y la ficha llegan antes en la página | Las cinco pestañas propias de la lista de 113 (el selector único las sustituye) |
| Un solo estado para problema y municipio | Los siete tipos y las fotos (no incluidos) |
| Funciona a 1440, 1024, 768, 375 y 320 px | Debe validarse con el autor antes de cualquier migración |

Ningún indicador, escala, leyenda ni corte (30 %) se ha modificado.

## v2 · pasada de diseño «respira» (2026-11-10, a petición del usuario)

El usuario levantó la restricción de tokens neutrales para B y pidió un diseño más moderno y con más aire con el sistema de `BRAND/EL UNICO Y MEJOR SISTEMA DE DISEÑO` (flujo de `impeccable`: `typeset`, `layout`, `polish`). La versión neutra queda archivada en `sprint-01/_archivo/preview-b-neutro/`.

```text
┌ banda translúcida: marca │ seis vistas │ Resumen ↗  Ver el radar ↗ ┐
│                                                                         │
│ 113 municipios,                        │ Tesis (resumen.json)            │   mucho aire: 96 px arriba
│ cinco problemas                        │ Cálculo propio…                 │
│ entradilla · [Busca tu municipio →]    │                                 │
│───────────────────────────────────────────────────────────────────────│
│ Cada municipio, con su dato        [Municipio ▾] [Tipo ▾] [2D|3D]      │
│ ÍNDICE (4/12)                    │ MAPA en panel suave (8/12)          │
│ 34 de 35  ← elegido, grande      │                                      │
│  Alquilar se lleva… + unidad,    │                                      │
│  fuente, «En el mapa…»           │                                      │
│ 10,8 a 16,9 · Comprar…           │                                      │
│ 30.000 a 120.000 · Se construye… │                                      │
│ 38 · Viviendas turísticas…       │                                      │
│ 53 de 63 · Pueblos…              │           leyenda                   │
│ FICHA (fija al bajar)            │ LOS 113, DE MÁS A MENOS (filas de 48 px)│
│ «Cada pregunta tiene su pestaña»: 4 columnas separadas por líneas, sin tarjetas │
└───────────────────────────────────────────────────────────────────────┘
```

**Decisiones de diseño:**
- **Tipografía** (la del dashboard PCI, sin Playfair): Montserrat 600 solo para titulares y cifras (72, 52, 40, 30, 18 px); Geist para el texto (22 px entradilla, 15–16 px cuerpo); Geist Mono para listas y leyendas (13 px). Escalones claros entre papeles.
- **Color:** lienzo `#f7f8fb`, azul noche `#221e41` para el texto, azul `#1a4d7a` para las cifras elegidas, panel del mapa `#edf1f6`. Los colores de cada indicador no cambian.
- **Espacio:** escala de 4 px (4 a 128). Grupos por proximidad y líneas finas, no por cajas: sin tarjetas, sin sombras, sin «eyebrow».
- **Estructura:** los cinco problemas pasan de «cifra grande + 4 tarjetas» a un **índice** de cinco filas (la elegida se abre). La ficha y la lista quedan debajo, alineadas con las mismas dos columnas.
- **Movimiento:** uno solo (entrada de la cifra y el municipio al cambiar) y la apertura del índice; todo desactivado con «reducir movimiento».
