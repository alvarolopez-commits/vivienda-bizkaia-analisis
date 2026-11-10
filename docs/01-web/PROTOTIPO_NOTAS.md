# PROTOTIPO_NOTAS · Situación (escritorio)

**Qué es:** prototipo de diseño de la vista Situación en `prototipo-situacion/`. No es la web publicada ni la migración fiel. No toca producción.
**Cómo verlo:**
```bash
python -m http.server 4173 --directory prototipo-situacion
```
Abre http://localhost:4173/ (con `?marcar` se rodea en naranja lo nuevo). Sin servidor no cargan los datos, porque usa `fetch`.
**Revisado:** Chromium a 1280 px. Sin errores de consola.
**Versión publicada (privada):** https://claude.ai/artifact/7fsKza34ntKNDvz5ufnz9b, versión 1 del 2026-11-10. Se genera con `python -I tools/build_artifact.py` (quita doctype, html, head y body de `index.html` en `dist/artifact.html`) y se publica con los ficheros de `css/`, `js/`, `data/`, `fonts/` y `vendor/` al lado. En el artifact, lo nuevo se marca con `#marcar` al final del enlace.

## 1. Qué es literal (copiado de la web publicada)
- **Textos fijos:** título, entradilla, «Cada municipio, con su dato», «Elige un problema y toca un municipio.», «Los 113 municipios, de más a menos», «Cada pregunta tiene su pestaña» y su subtítulo, descripciones de las cuatro herramientas. Comprobados uno a uno contra el HTML y JS servidos por la web (17 de 17 coinciden).
- **Los cinco problemas** (cifra, titular, unidad, etiqueta, fuentes) y la tesis: `data/resumen.json`, copia íntegra del original.
- **Valores por municipio:** `data/situacion.json`, subconjunto de `municipios.json` generado por `tools/extract_data.py`, que **comprueba que ningún valor cambia** (113 municipios; 35 con alquiler, 17 con precio propio de entrada y 96 aproximados, igual que la web).
- **Geometría:** `data/municipios.geojson`, copia íntegra.
- **Lógica de los cinco indicadores** (valor, color, texto, leyenda, ranking): `js/indicadores.js`, copia del original con una línea cambiada (el import). `js/mapa.js`, copia sin cambios.
- **Mapa 3D:** `js/territorio.js`, copia del original con tres rutas de import cambiadas (diferencia comprobada con `diff`), y `vendor/three/three.module.min.js` (three.js r160, licencia MIT), el mismo fichero que sirve la web. Mismo comportamiento: se monta la primera vez que se pide, cámara fija (`cam: 1`), etiqueta con el municipio de valor más alto del problema elegido, caída al mapa plano si no hay WebGL. El relieve en reposo usa la población, que se añadió al subconjunto de datos con la misma comprobación de igualdad.
- **Tipografías y colores:** desde la versión 2, los del dashboard PCI (ver §6). Los colores de cada problema en el mapa siguen siendo los de la web publicada, porque codifican el dato (por ejemplo, el umbral del 30 %).

## 2. Qué es nuevo (`MEJORA_UX_PROPUESTA`, a aprobar)
| Elemento | Nota |
|---|---|
| Aviso «Prototipo de diseño…» | Para que no se tome por la web final. |
| Cabecera con las seis vistas y Radar y Resumen aparte | Hoy las vistas están tras «Menú». Los enlaces apuntan a la web publicada. |
| Bloque único: lista de los cinco problemas, mapa y ficha | Sustituye a la escena anclada de 3.072 px y a la sección «El mapa». |
| Un solo selector de problema que gobierna mapa, ficha y lista de 113 | Las cinco pestañas de la lista desaparecen como control. |
| Franja de herramientas al inicio de la página | Misma información que «Cada pregunta tiene su pestaña», sin tarjetas con icono. |
| Información flotante al pasar el ratón por el mapa (municipio y valor) | No existe en la web actual. |
| Fila del municipio elegido resaltada en la lista | Solo si está entre las filas visibles. |
| Texto bajo el mapa en 3D: «En 3D, la altura y el color dicen lo mismo que el mapa plano. Elige el municipio con «Otro municipio» o en la lista.» | Microcopy nuevo. En 3D no se puede tocar un municipio, igual que en la web publicada. |
| Encuadre del 3D un 15 % más cerca | La web original deja Bizkaia en menos de la mitad del panel. Se cambia con la opción `keys` que ya ofrece `territorio.js`, sin tocar el módulo. |
| Estado de carga: «Cargando los datos de los 113 municipios…» | La web original no muestra nada mientras carga. |
| Estado vacío en la lista: «Ningún municipio de «Pueblos pequeños» tiene este dato.» | Aparece, por ejemplo, con Alquiler y Pueblos pequeños; antes la lista quedaba en blanco. |
| Transición del 3D sin GSAP | Una interpolación propia con la misma curva (power2.inOut) y duración (0,8 s) que el `gsap.to` original; evita cargar GSAP solo para esto. |

## 2 bis. Desviación conocida
Las cifras de la franja de herramientas (113, 10,8 a 16,9, 34 y 4) **van escritas a mano** en `index.html` con los valores publicados hoy. En la web original se calculan desde los datos (`situacion/cartas.js`). Si esos datos cambian, el prototipo quedaría desfasado. Es una segunda fuente de verdad que hay que eliminar antes de migrar: conectarlas a los datos de Acceso, Medidas y Normas.

## 3. Qué no está
- **3D de la portada con scroll:** el territorio 3D sí está (en el conmutador del mapa); lo que no está es su recorrido animado por scroll, retirado con la Alternativa B.
- **Sección «Siete tipos de municipio»** y los créditos de sus fotos: fuera del alcance del brief. Sin ellas no hacen falta los créditos.
- **Las otras cinco vistas:** solo hay enlaces a la web publicada.
- **Móvil:** aplazado por decisión del usuario; solo hay una regla mínima para que no se rompa.
- **Scroll anclado de la portada:** retirado a propósito (Alternativa B).

## 4. Calidad
- **Detector de impeccable:** 3 avisos. Uno, de relleno en la franja de herramientas, corregido. Los otros dos son por usar Montserrat, que es la tipografía de la web publicada; se mantiene a propósito.
- **Prueba funcional:** elegir problema, tocar un municipio en el mapa, desplegable, filtro por tipo y «Ver los 113» responden y siguen sincronizados. Valores comparados con la web: Bilbao 55,8 % (alquiler) y 6,1 por 1.000 (turísticas), Mundaka 47,1 por 1.000, 9 municipios de costa turística.
- **Excepción de diseño:** Playfair Display figura entre las tipografías «por defecto» que desaconseja impeccable; se conserva por ser la de la web original.
- **Pasada de pulido (impeccable `polish`):** revisado a 1100, 1280 y 1440 px. Contraste WCAG calculado en 17 textos clave: el más bajo es 5,52:1 (tipo de municipio en la lista), todos por encima de 4,5:1. Orden del tabulador lógico y foco visible. Columnas equilibradas (mapa a altura fija; lista de problemas compactada). Sin scroll horizontal a 1100 px.
- **No verificado:** lector de pantalla real, anchos menores de 1024 px, rendimiento del 3D en equipos modestos, navegador sin WebGL.

## 5. Para validar con el autor
1. Retirar el scroll anclado y el mapa 3D de la portada.
2. Que desaparezcan las cinco pestañas propias de la lista.
3. Que las cifras y textos del prototipo son los que quiere ver (son los publicados el 2026-11-10).

## 6. Versión 2 · estilo dashboard PCI (2026-11-10)
El usuario descartó el aspecto de la versión 1 («tipos que ya no usamos») y eligió como referencia el dashboard PCI (`SOLUTIONS/16 DISEÑO PCI/docs`).
- **Lenguaje:** lienzo claro con degradados suaves, raíl de navegación oscuro de cristal (se abre al pasar el ratón), barra de filtros de cristal fija arriba, isla oscura con el fondo `flow-01.webp` del PCI, tarjetas de cristal, paneles blancos de 20 px de radio. Tokens, radios, sombras y vidrio copiados del PCI.
- **Tipografía:** Geist (interfaz), Geist Mono (datos de la lista, leyenda, recuentos) y Montserrat solo en titulares y cifras clave. Se retira Playfair Display. Se cargan de Google Fonts.
- **Iconos:** Phosphor (MIT) del sprite de `BRAND/DCI DESIGN SYSTEM/assets/icons.svg`.

| Cambio frente a la versión 1 y a la web publicada | Nota |
|---|---|
| Los cinco problemas: el elegido en grande y los otros cuatro en tarjetas de cristal 2×2 | Al elegir una tarjeta, pasa a la zona grande. Los cinco siguen a la vista. |
| Municipio y tipo de municipio pasan a la barra de filtros | El tipo ahora también atenúa en el mapa los municipios de otros tipos (nuevo). |
| La lista de 113 lleva barras proporcionales al valor | Valores negativos (Hogares) sin barra. |
| Tocar una fila de la lista elige el municipio | Antes llevaba a su ficha; ahora la ficha se abre con «Ver su ficha». |
| Municipios sin dato en gris azulado (#e3e8f1) | En la web publicada son blancos y sobre el panel blanco no se verían. |
| Logotipo «VB» en el raíl | Nuevo, a aprobar. No se usa el logotipo de Astara (el brief pide no atribuir autoría). |

**Detector de impeccable (v2):** se corrigieron 2 textos con contraste 3,9:1. Se mantienen a propósito, por ser el patrón del PCI: borde fino con sombra amplia en tarjetas, chips sin relleno vertical, halo del fondo, brillo del raíl, Geist y Montserrat.
**Revisado:** 1280 y 1440 px, 2D y 3D, cambio de problema, sin errores de consola, sin scroll horizontal.

## 7. Versión 3 · mapa en rampa azul PCI (2026-11-10)
Decisión del usuario: los cinco problemas pasan de sus colores originales (rosa, verde, ocre) a la rampa azul del PCI (#d6e5fb → #5d95e8 → #0d3577).
- `js/colores.js` sustituye solo la función `color` de cada indicador; `indicadores.js` sigue siendo copia intacta del original. Mismos valores, mismos extremos de escala y mismos cortes: Alquiler conserva el salto en el 30 % (hasta el 30 % en el azul más claro; por encima, de azul medio a oscuro) y Hogares conserva el gris para los municipios donde los hogares crecen menos que las viviendas.
- El 3D usa los mismos colores, porque lee los mismos objetos.
- Municipios sin dato: trama gris diagonal, con su muestra «Sin dato» en la leyenda.
- Validar con el autor: es un cambio de codificación visual (no de dato). Con una sola tonalidad, los cinco problemas ya no se distinguen por color entre sí; se distinguen por la isla de cabecera y la leyenda.
