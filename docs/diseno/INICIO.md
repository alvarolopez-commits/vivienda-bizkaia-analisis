# Inicio (hero)

Al entrar con la dirección raíz (`/`, `#` o `#inicio`) aparece un hero a pantalla casi completa y, justo debajo, la vista **Situación** de siempre. Con cualquier otra dirección (`#situacion/…`, `#municipios/…`) el hero no existe, así que los enlaces directos no cambian. El logotipo de la cabecera lleva a `#inicio`.

## Qué es
- **Tarjeta oscura** con una ilustración de Bizkaia detrás (Bilbao, Bermeo, Lekeitio y Getxo del registro de banners), degradado azul marino a la izquierda para el texto y a pie para los botones. Sin desenfoque sobre la imagen; el vidrio (L1) es solo la píldora superior, los seis accesos y el botón «Ver el radar».
- **Titular** (Montserrat): «El acceso a la vivienda en los **113** municipios de Bizkaia». Es la primera frase de la descripción de la web publicada; el 113 sale de los datos y rueda al entrar.
- **Descripción** (Geist), también de la web publicada: «Dónde falla, a quién afecta, qué medidas hay y quién decide cada una. Con datos oficiales y su fuente.»
- **Resumen y radar:** botones «Ver el resumen ↗» (principal, blanco) y «Ver el radar ↗» (vidrio), a las mismas webs de siempre, en pestaña nueva.
- **Seis accesos** a Situación, Municipios, Acceso, Medidas, Normas y Método, y un botón de bajar.
- **Cifras reales** bajo la tarjeta (113 municipios · 5 problemas · 34 medidas · 15 instrumentos): salen de los datos, ruedan al entrar y cada una lleva a su vista.

## Bajar de una vez
Con la rueda, la flecha abajo / AvPág / espacio, un gesto táctil o el botón, la página se desplaza **de una vez** hasta Situación (queda justo bajo la cabecera). Desde ese punto, subir con la rueda o la flecha vuelve al hero. En cualquier otro punto el desplazamiento es el normal. Con movimiento reducido el salto es inmediato.

## Movimiento
`?mov=expresivo` (por defecto): entrada escalonada, ligero zoom de la imagen (9 s, solo `scale`), cifras que ruedan y rotación de ilustraciones cada 8 s con fundido de 1,4 s (solo opacidad de cada imagen). `sobrio` y `quieto`: una sola ilustración, sin rotación ni zoom. La rotación se pausa si la pestaña está oculta o el hero no se ve; solo se precargan las ilustraciones que se van a mostrar y solo en «expresivo».

## Accesibilidad
El hero lleva el `h1` de la página; el de Situación pasa a encabezado de nivel 2 mientras el hero está. Las ilustraciones son decorativas (`alt=""`). El botón de bajar tiene nombre accesible. Los materiales se degradan con `prefers-reduced-transparency` y `prefers-contrast: more`.

## Pendiente (editorial)
- Las ilustraciones son generadas con IA y su exactitud geográfica no está verificada; no llevan etiqueta (véase `BANNERS_MUNICIPIOS.md`).
- Los rótulos «municipios / problemas / medidas / instrumentos» y el nombre del botón de bajar son propuestos.
- Qué ilustraciones y en qué orden se muestran es una decisión editorial (`FOTOS` en `js/inicio.js`).

## Archivos
`index.html` (marcado), `css/inicio.css`, `js/inicio.js`, `js/pre-inicio.js` (marca el inicio desde el primer fotograma) y `js/app.js` (conexión). Pruebas: `_qa/qa-inicio.js` (35), a 1440×900 y a 1280. Capturas en `docs/diseno/capturas/inicio/`.
