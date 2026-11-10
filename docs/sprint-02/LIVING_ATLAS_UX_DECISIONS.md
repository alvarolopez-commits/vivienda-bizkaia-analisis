# LIVING_ATLAS_UX_DECISIONS · Decisiones del prototipo

**Sprint 02 · Living Atlas (Atlas 2D + Intelligence) · 10-11-2026 · PROTOTIPO, no integrado**

Prototipo: `sprint-02/atlas/` · http://localhost:4177/atlas/ (ver `sprint-02/README.md`).

## 1. Composición (escritorio, referencia 1440 px)

```text
┌ banda: marca │ seis vistas │ Resumen ↗  Ver el radar ↗ ┐                         (la de Sprint 01)
│ Cada municipio, con su dato              [Alquiler│Entrada│Hogares│Turísticas│Vacías] │  título y cinco problemas en una fila
│ Elige un problema y toca un municipio.     35 con dato … cada uno con su rampa        │
├──────────────────────────────────────────────────────┬────────────────────────────────┤
│ Título del indicador               [−][+][Restablecer]│ FICHA                           │
│                                                      │  sin municipio: el problema en  │
│          MAPA 2D · 113 polígonos reales              │  Bizkaia (resumen.json)         │
│          sombra del territorio, municipio elegido    │  con municipio: tipo, nombre,   │
│          elevado, el resto atenuado                  │  [Ver su ficha →], valor,       │
│                                                      │  puesto, sus cinco problemas,   │
│ [rampa original · ▧ Sin dato · 35 de 113 con dato]   │  fuente                         │
│                                                      ├────────────────────────────────┤
│                                                      │ LOS 113 MUNICIPIOS, DE MÁS A    │
│                                                      │ MENOS · [Buscar] [Tipo]         │
│                                                      │ 1 Bilbao ●            55,8 %    │
│                                                      │   ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬           │
│                                                      │ … (scroll propio) · ▧ 78 sin dato│
└──────────────────────────────────────────────────────┴────────────────────────────────┘
Datos descargados el 20 de octubre de 2026. …
```

- **El mapa es el protagonista**: ocupa unos dos tercios del ancho y toda la altura de la pantalla (entre 600 y 900 px).
- **Panel persistente a la derecha**: ficha arriba y ranking debajo, con su propio scroll. Así se puede elegir en la lista sin perder de vista el mapa. El brief dibujaba el ranking debajo del mapa; se cambió porque obligaba a salir del mapa para usarlo, que es lo que la definición de éxito pide evitar.
- **Un único estado** `{ problema, municipio, tipo, búsqueda }`. El mapa, la leyenda, la cobertura, la ficha, la lista y la URL se pintan desde él, así que no pueden divergir.
- **Estado inicial: Bizkaia, sin municipio elegido** (el original arranca en Bilbao). La ficha muestra el problema en Bizkaia con los literales de `resumen.json`. Primero se ve el patrón territorial y después se elige municipio.

## 2. Microinteracciones (implementadas)

| Acción | Respuesta | Tiempo |
|---|---|---|
| Abrir el atlas | El territorio aparece una vez (fundido y 14 px de subida) y los colores entran de oeste a este. **Se puede usar desde el primer instante.** Solo la primera vez en la sesión (`sessionStorage`) | 0,9 s |
| Cambiar de problema | Interpolación de color de cada municipio entre la escala anterior y la nueva; la trama de «Sin dato» cambia a mitad de camino (no se interpola). Leyenda, cobertura, ficha, lista y URL cambian **al instante** | 360 ms |
| Pasar el ratón | Contorno y leve elevación (sombra en unidades del mapa) y tooltip con nombre y valor real o «Sin dato» | inmediato |
| Elegir municipio (clic, Enter, fila, búsqueda) | Contorno persistente, elevación mayor, resto del mapa al 62 % de opacidad; la ficha entra con un fundido; la fila se marca y se desplaza a la vista **dentro de la lista** | 220 ms |
| Acercar y alejar | Animación del encuadre, sin acercar al elegir un municipio; si hay zoom y el elegido queda fuera, el mapa se desplaza hasta él sin acercar más. Arrastrar desplaza solo cuando hay zoom (sin scroll atrapado) | 320 ms |
| Restablecer | Quita el municipio y el zoom; **el problema se mantiene** | 320 ms |
| Reducir movimiento | Todo instantáneo (comprobado simulando la preferencia) | 0 |

**No hay**: vuelo de cámara, parallax, inclinación 3D, partículas, brillos permanentes ni etiquetas fijas de los 113 municipios.

## 3. Teclado y accesibilidad

- **Cinco problemas**: botones con `aria-pressed`; las flechas pasan de uno a otro.
- **Mapa**: grupo con `aria-roledescription="mapa"`. Cada polígono es un botón con nombre accesible («Bilbao: 55,8 %») y `aria-pressed`.
  - **Tabindex itinerante**: el mapa es una sola parada de tabulación.
  - **Flechas**: llevan al vecino más cercano en esa dirección, según los centroides.
  - **Enter o espacio** eligen el municipio; **Escape** vuelve a Bizkaia; **+ y −** acercan y alejan.
  - **Foco visible**: un contorno azul de 3 px, también sobre el municipio ya elegido.
- **Alternativa robusta para municipios pequeños**: la búsqueda (sin distinguir tildes; Enter elige el primero) y la lista.
- **Avisos** por la región `[data-anuncio]` original: cambio de problema y municipio elegido.
- **No se depende del color**:
  - El valor se escribe siempre (ficha, lista, tooltip, nombre accesible).
  - «Sin dato» lleva una trama y una etiqueta.
  - El tipo de municipio también va en texto.
- **Cerrar la ficha** (×) devuelve el foco al municipio en el mapa.

## 4. Móvil (aparcado a petición del usuario)

El 10-11-2026 el usuario pidió dejar el móvil de momento. Lo que ya estaba hecho se queda, pero no se ha pulido ni revisado en dispositivo:
- **Composición en una columna**: cinco problemas en dos filas (3 y 2), mapa, leyenda, ficha y lista.
- **Lista corta**: los diez primeros y «Ver los N», como en el original; el municipio elegido se añade al final si no está entre ellos.
- **Comprobado** a 320, 375 y 390 px: sin scroll horizontal, sin controles de menos de 36 px y 101 de 101 pruebas funcionales.

## 5. Textos nuevos (PROPUESTA_MICROCOPY, marcados con `data-propuesta`)

Se ven todos con un contorno naranja discontinuo abriendo http://localhost:4177/atlas/?marcar (el hash lo ocupa el estado, por eso es un parámetro).

| Texto | Dónde |
|---|---|
| «El problema en Bizkaia» | Rótulo de la ficha sin municipio |
| «Toca un municipio en el mapa o elígelo en la lista.» | Pista de la ficha sin municipio |
| «{comarca} · {población} habitantes» | Bajo el nombre del municipio (datos de `municipios.json`) |
| «Puesto {k} de {n} con dato» | Posición en el `ranking()` original, sin filtro de tipo |
| «Sus cinco problemas» | Franja de la ficha |
| «Volver a Bizkaia» | Botón × de la ficha |
| «{n} de 113 municipios con dato» | Cobertura en la leyenda |
| «{n} sin dato» | Desplegable de municipios sin dato |
| «Buscar municipio», «Ningún municipio con dato coincide con la búsqueda.» | Búsqueda |
| «Acercar», «Alejar», «Restablecer» | Barra del mapa |

Todo lo demás es literal de los ficheros originales y está comprobado en `_qa/regresion.py`:
- Títulos y subtítulos, `titulo`, `texto`, `leyenda` y `fuente` de cada indicador.
- «Ver su ficha», «Sin dato», «N con dato», «Ver los N» y «Ver los diez primeros».
- La nota de recuento de `lista.js` y la fecha de `main.js`.
- Los titulares, cifras, unidades y fuentes de `resumen.json`.

## 6. Decisiones de la vista que conviene revisar con el autor

1. **Trama para «Sin dato».** En el original es blanco liso. El atlas lo deja blanco y le añade una trama gris clara, más la entrada «Sin dato» en la leyenda. No cambia ninguna escala ni corte, pero sí la presentación de la ausencia.
2. **Atenuar el resto del mapa al elegir** (62 % de opacidad). Aclara los colores de los demás municipios mientras hay uno elegido.
3. **La lista elige en lugar de navegar.** Sus filas eligen el municipio; la ficha completa queda a un clic en «Ver su ficha».
4. **El estado inicial es Bizkaia**, no Bilbao.
5. **La franja «Sus cinco problemas»** reúne en un solo sitio cinco valores que en el original solo se ven cambiando de problema.

## 7. Decisiones del autor (lista corta)

| # | Decisión | Por qué importa |
|---|---|---|
| 1 | **¿Dónde va la escena de portada y el 3D?** (a) Se quedan como portada y el atlas sustituye solo al mapa vivo y la lista. (b) El atlas pasa a ser la entrada de Situación y la escena se mueve a una sección «El territorio» o a un botón «Ver en 3D» | El brief prohíbe retirarlos sin su aprobación; el prototipo no los toca |
| 2 | **Semántica cromática**: ¿se aceptan la trama de «Sin dato» y la atenuación al elegir? | No cambian rangos ni cortes, pero sí la lectura |
| 3 | **Formato de URL** `#situacion/<indicador>/<INE>`. Compatible con `rutas.js` (15 de 15 casos) | Necesita autorización antes de integrarse |
| 4 | **La fuente con «Cálculo propio con …»**: el original antepone «Cálculo propio» también a fuentes que no lo son, como «Eustat: hogares…» o «Registro de viviendas turísticas…». El atlas lo reproduce tal cual | Posible errata del original. No se corrige sin su visto bueno |
| 5 | **«Puesto k de n»**: ¿se puede mostrar la posición en el ranking? | Es el orden original, pero es un dato que la web no enseña hoy |

## 8. Pendiente (no hecho en este sprint)

- Pruebas con lector de pantalla real (NVDA o VoiceOver), Safari y Firefox, y dispositivos táctiles.
- Modo concentración (plegar el panel): el brief lo deja a una prueba de uso y no se ha hecho.
- Comprobar el sistema de diseño definitivo de Astara: los estilos son los de B v2, provisionales.
