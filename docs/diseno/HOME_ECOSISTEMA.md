# Portada de dos tiempos (hero + tres puertas)

Rama local `ux/home-ecosistema`, sin publicar. Sustituye a la portada anterior (`INICIO.md`), que no cumplía el encargo (rueda secuestrada, cifras de adorno).

## Tiempo 1 · Hero (composición A, elegida)
Marco azul noche con una imagen «flow» como fondo atmosférico (nunca como dato). Fondo: la tercera de las tres imágenes azules aportadas (`app/img/flow/flow-3.webp`, 217 KB; se descartaron las otras dos). Un toque de azul noche y un velo a la izquierda dan el contraste del texto. De las dos composiciones propuestas (A editorial inmersiva y B atlas primero) se eligió la A; la B (y el selector `?hero=`) se retiró.

Contenido (sin textos nuevos del autor): titular «El acceso a la vivienda en los **113** municipios de Bizkaia» (el 113 sale de los datos) · «Dónde falla, a quién afecta, qué medidas hay y quién decide cada una. Con datos oficiales y su fuente.» (descripción de la web publicada) · botón principal **«Explorar el análisis ↓»** (lleva a Situación) · botón secundario **«Ver el resumen ↗»** (URL exacta, 200 comprobado). Sin píldora superior. Marca: el logotipo aprobado en la cabecera (la cabecera no se ve en el hero; véase «Pendiente»).

Capturas: `capturas/home/1440-hero.png`, `1280-hero.png` y `1440-hero-puertas-situacion.png` (hero, puertas y comienzo de Situación).

## Tiempo 2 · Puerta a los tres productos (clara, tras el hero)
Tres tarjetas opacas iguales, con los textos de las metadescripciones de cada web: **Análisis y medidas** («Entrar al análisis ↓», a Situación) · **Resumen** («Abrir el resumen ↗») · **Radar** («Abrir el radar ↗», con la etiqueta «Propuesta» por no estar verificada su operación). Asoman 100 px bajo el hero (salida evidente a la exploración). No sustituyen a la navegación de las seis vistas, que sigue en la cabecera.

## La cabecera es la del análisis
Mientras se ve el hero **no hay cabecera**: el hero ocupa la pantalla entera. Al llegar al análisis aparece la cabecera con las seis vistas (y Resumen y radar) y justo debajo un **umbral** («Análisis y medidas», con un filete) que marca dónde empieza el estudio; «Explorar el análisis» y «Entrar al análisis» llevan exactamente a ese punto. Al volver hacia el hero, la cabecera se va. Fuera de la raíz, la cabecera es la de siempre. Se resuelve con un `IntersectionObserver` (sin escuchar el scroll).

## Continuidad con el estudio
Debajo de las puertas, Situación **tal cual**: mismos mapa, leyenda, ranking, fichas y fuentes. El hero solo existe con la dirección raíz; los enlaces directos (`#situacion/…`, `#municipios/…`) siguen entrando sin hero. El logotipo de la cabecera lleva a `#inicio`. El `h1` de la página es el del hero; el de Situación baja a nivel 2 mientras el hero está.

## Lo que NO hace
Sin desplazamiento secuestrado ni scroll-snap (la rueda, el teclado y el gesto son los del navegador); sin cifras de adorno (el único número es el de municipios, de los datos); sin rotación de imágenes; sin KPIs ni «tiempo real». Movimiento: entrada escalonada y un zoom lento del fondo, solo en «expresivo» y sin movimiento reducido (`?mov=sobrio|quieto`).

## Pruebas (`_qa/qa-inicio.js`, 36, a 1440×900 y 1280)
Texto de las tres webs, enlaces sin vacíos y con `noopener`, sin scroll-jacking (rueda, flecha y espacio no se interceptan; sin scroll-snap), botones que llevan a Situación, hero que sobrevive a elegir un municipio y a navegar, `#inicio` vuelve, cabecera oculta en el hero y visible en el análisis (y de vuelta), accesibilidad (un h1, fondo decorativo), geometría (cabe, asoman las puertas, alineado con la vista), tipografía, vidrio acotado, imagen WebP < 300 KB y legibilidad medida sobre el píxel renderizado.

## Pendiente (decisión del autor)
1. Logotipo: el archivo disponible usa un azul marino y un turquesa algo distintos de #102E50 y #11B9B6; falta decidir su aparición sobre el hero oscuro.
2. Textos propuestos (marcados `data-propuesta`): «Explorar el análisis», «Entrar al análisis», «Abrir el resumen», «Abrir el radar», «Propuesta».
3. Si la raíz debe conservarse en la barra de direcciones mientras el hero se ve (hoy Situación la reescribe).
4. Lighthouse y la fluidez en un equipo modesto; Safari y Firefox.
