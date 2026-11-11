# Portada de dos tiempos (hero + tres puertas)

Rama local `ux/home-ecosistema`, sin publicar. Sustituye a la portada anterior (`INICIO.md`), que no cumplía el encargo (rueda secuestrada, cifras de adorno).

## Tiempo 1 · Hero (dos composiciones del MISMO contenido y el mismo estado)
Marco azul noche con una imagen «flow» como fondo atmosférico (nunca como dato): las dos imágenes aportadas, convertidas a WebP (`app/img/flow/flow-a.webp`, 204 KB, y `flow-b.webp`, 139 KB). Un multiplicado azul noche conserva los reflejos del vidrio y un velo a la izquierda da el contraste del texto.

| | A · Editorial inmersiva (`?hero=a`, por defecto) | B · Atlas primero (`?hero=b`) |
|---|---|---|
| Fondo | `flow` 1, a plena fuerza | `flow` 2, atenuado (luz y textura) |
| Protagonista | El titular y el vidrio | El **mapa real de Bizkaia** (geometría actual, 113 municipios, sin datos coloreados) |
| Cristal | Solo la píldora y el botón secundario | Igual |

Contenido (idéntico en ambas, sin textos nuevos del autor): píldora «Vivienda en Bizkaia · Análisis» (título de la web publicada) · titular «El acceso a la vivienda en los **113** municipios de Bizkaia» (el 113 sale de los datos) · «Dónde falla, a quién afecta, qué medidas hay y quién decide cada una. Con datos oficiales y su fuente.» (descripción de la web publicada) · botón principal **«Explorar el análisis ↓»** (lleva a Situación) · botón secundario **«Ver el resumen ↗»** (URL exacta, 200 comprobado). Marca: la de la cabecera (texto limpio); el logotipo está pendiente de aprobación.

Capturas lado a lado: `capturas/home/1440-A-vs-B.png` (A y B a 1440×900), `1440-A-editorial.png`, `1440-B-atlas.png`, `1440-A-fondo2.png` (A con el otro fondo), y a 1280.

## Tiempo 2 · Puerta a los tres productos (clara, tras el hero)
Tres tarjetas opacas iguales, con los textos de las metadescripciones de cada web: **Análisis y medidas** («Entrar al análisis ↓», a Situación) · **Resumen** («Abrir el resumen ↗») · **Radar** («Abrir el radar ↗», con la etiqueta «Propuesta» por no estar verificada su operación). Asoman 100 px bajo el hero (salida evidente a la exploración). No sustituyen a la navegación de las seis vistas, que sigue en la cabecera.

## Continuidad con el estudio
Debajo de las puertas, Situación **tal cual**: mismos mapa, leyenda, ranking, fichas y fuentes. El hero solo existe con la dirección raíz; los enlaces directos (`#situacion/…`, `#municipios/…`) siguen entrando sin hero. El logotipo de la cabecera lleva a `#inicio`. El `h1` de la página es el del hero; el de Situación baja a nivel 2 mientras el hero está.

## Lo que NO hace
Sin desplazamiento secuestrado ni scroll-snap (la rueda, el teclado y el gesto son los del navegador); sin cifras de adorno (el único número es el de municipios, de los datos); sin rotación de imágenes; sin KPIs ni «tiempo real». Movimiento: entrada escalonada y un zoom lento del fondo, solo en «expresivo» y sin movimiento reducido (`?mov=sobrio|quieto`).

## Pruebas (`_qa/qa-inicio.js`, 34 por composición, a 1440×900 y 1280)
Texto de las tres webs, enlaces sin vacíos y con `noopener`, sin scroll-jacking (rueda, flecha y espacio no se interceptan; sin scroll-snap), botones que llevan a Situación, hero que sobrevive a elegir un municipio y a navegar, `#inicio` vuelve, accesibilidad (un h1, fondo decorativo, mapa decorativo), geometría (cabe, asoman las puertas, alineado con la vista), tipografía, vidrio acotado, imagen WebP < 300 KB, mapa real de 113 formas en B y **legibilidad medida sobre el píxel renderizado** (blanco 13,9:1 · azul hielo 9,1:1 · descripción 15,0:1 en B; similar en A).
Regresión a 1440: Situación 101, contraste 31 y 93, vistas 48, navegación 41, movimiento 27, desborde 12, banners 46 e integridad 21. A 1280: la batería del hero y el desborde.

## Pendiente (decisión del autor)
1. Elegir A o B (y el fondo 1 o 2); después se integra una sola.
2. Logotipo y su versión sobre fondo oscuro.
3. Textos propuestos (marcados `data-propuesta`): «Explorar el análisis», «Entrar al análisis», «Abrir el resumen», «Abrir el radar», «Propuesta».
4. Si la raíz debe conservarse en la barra de direcciones mientras el hero se ve (hoy Situación la reescribe).
5. Lighthouse y la fluidez en un equipo modesto; Safari y Firefox.
