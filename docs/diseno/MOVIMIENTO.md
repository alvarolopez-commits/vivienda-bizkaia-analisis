# Movimiento y transiciones

Basado en el sistema de marca de Astara (`BRAND/DCI DESIGN SYSTEM`, §9 «Movimiento y accesibilidad») y en las pautas de `animate` de impeccable (`BRAND/EL UNICO Y MEJOR SISTEMA DE DISEÑO`). Se reutilizan sus **tokens de tiempo y curvas**, su **píldora deslizante** (`lens`), su `tick` y sus reglas de intensidad y de movimiento reducido, adaptados a las clases de esta aplicación.

## Tesis de movimiento
- **Qué es el producto:** una herramienta de consulta y decisión (leer, comparar, simular). El movimiento sirve a **continuidad**, **estado** y **feedback**; no a la decoración.
- **Prueba de eliminación:** si quitar una animación no pierde significado, sobra. Por eso **no** hay revelados genéricos al hacer scroll, ni brillo que siga al puntero, ni cifras que cuenten de 0 a N al cambiar de problema.
- **Intensidad** (`<body data-motion>`): por defecto `expressive`. Se puede comparar con `?mov=quieto` (`still`), `?mov=sobrio` (`restrained`) y `?mov=expresivo` (`expressive`).

| Intensidad | Qué permite |
|---|---|
| `still` | Solo feedback de estado (hover, foco, carga, desplegables). Sin transición entre vistas ni entradas. |
| `restrained` | + entrada de la vista al cambiar de pestaña: fundido de 240 ms con 4 px, sin escalonado. |
| `expressive` | + escalonado (tope de 4 pasos = 200 ms) y **un** momento firma por vista (700 ms). |

## Tiempos y curvas (`tokens.css`)
150 ms feedback · 240 ms estado · 420 ms capa o vista · 700 ms solo el momento firma. `ease-out` (`cubic-bezier(.16,1,.3,1)`) al entrar, `ease-inout` al salir; **las salidas son más rápidas**. Sin rebote.

## Qué se mueve y por qué

| Pieza | Qué comunica | Cómo |
|---|---|---|
| **Cambio de vista** | Continuidad: la cabecera se queda y el contenido se funde | Un **velo** (un solo rectángulo que cambia de opacidad): se cierra en 150 ms sobre el contenido viejo, se cambia la vista detrás y se abre en 240 ms. La píldora de la cabecera se mueve al instante (≈ 10–30 ms) y las vistas se precargan al acercar el puntero; la vista nueva empieza arriba |
| **Píldora deslizante** (pestañas de la cabecera, problemas de Situación, modos y cinta de criterios de Medidas, Plano/Matriz, índices internos, botones de supuestos y de nivel) | Qué está elegido y que ha cambiado | La píldora oscura viaja al nuevo elegido (≈ 320 ms), se aplasta al salir y se recupera al llegar |
| **Entrada de la vista** | Jerarquía: primero la cabecera y lo que se consulta | Bloques escalonados con tope de 200 ms; las clases se retiran al terminar |
| **Momento firma** (uno por vista, solo `expressive`) | Dónde mirar primero | Situación: el mapa · Municipios: el perfil · Medidas: el escenario · Acceso y Normas: las **cifras que ruedan** (la animación original de la web publicada, ahora de 700 ms, una vez, con el valor final exacto y el texto accesible intacto) · Método: ninguno (es una biblioteca) |
| **Valor que cambia** | Feedback: «esto se ha recalculado» | `tick` de 240 ms al elegir otro supuesto, filtro o nivel. **La cifra cambia de golpe**; no se interpola |
| **Línea de tiempo de Normas** | El orden en el tiempo | Se dibuja y los hitos entran con la lectura (animación ligada al scroll; sin soporte, queda dibujada) |
| **Barras de Acceso** | El dato se dibuja | Crecen desde el origen (500 ms) |
| **Capas**: desplegables, ficha, bandeja de comparación, tooltip | Aparece algo nuevo | Fundido con subida de 6–12 px, 120–240 ms |
| **Carga inicial** | Estado: «llegan los datos» | Esqueleto con barrido (`aria-busy`) |

## Movimiento reducido (`prefers-reduced-motion`)
**Menos y más suave, no cero.** Se quita el recorrido (`--rise-y: 0`): quedan los **fundidos** y los cambios de estado y de color. La transición entre vistas, el aplastamiento de la píldora, las cifras que ruedan, las barras y la línea de tiempo se desactivan; la píldora pasa a su sitio sin viajar; el esqueleto pulsa en lugar de barrer.

## Rendimiento y seguridad
Solo `transform`, `opacity` y las propiedades independientes `translate` y `scale` (para no pisar los `transform` de cada pieza). **Nada** de animar `width`, `height`, `top`, `left` ni márgenes, salvo la píldora, que es un elemento absoluto que no empuja a nadie (la excepción documentada del sistema). Sin listeners de scroll (la línea de tiempo usa animación ligada al scroll en CSS) y sin `will-change` permanente. El contenido es **visible por defecto**: si falla el script no se oculta nada.

## Por qué NO hay View Transitions (paradas medidas y corregidas)
La primera versión usaba View Transitions, como hace el sistema DCI. Al probarla online se notaban **paradas**. Medido (cambio entre pestañas, mayor hueco entre fotogramas): con View Transition **316 ms en Normas, 484 en Método y 667 en Medidas**; sin ella, 22–38 ms. La causa: la transición fotografía el elemento entero antes de animar, y en las vistas largas (hasta 29.000 px de alto en Método) eso congela la pantalla. Además, mientras dura, la página no responde y la píldora no se movía hasta terminar la carga.

Solución, con las mismas intenciones de continuidad y sin esos costes:
- **Respuesta inmediata:** la pestaña y la píldora cambian en cuanto se pulsa.
- **Velo en lugar de fotografía:** nunca se anima la opacidad de un ancestro de elementos con vidrio (`backdrop-filter`), que los rompería.
- **Lo lento, en paralelo:** módulos, datos y hojas de estilo se cargan mientras el velo se cierra, y las vistas se precargan al acercar el puntero o el teclado (y, con la página en reposo, todas).
- **Entrada solo con desplazamiento** (`rise`, sin opacidad) en los bloques; el fundido lo da el velo. Las capas pequeñas (desplegable, ficha, bandeja) llevan `rise-fade`.
- Se quita `background-attachment: fixed` del fondo ambiental (repintaba la ventana en cada fotograma de scroll) y el desenfoque del vidrio baja de 20 px a 14 px.

**Resultado medido** (1440 × 900, peor hueco entre fotogramas): cambio de vista 19–38 ms; scroll de las seis vistas 18 ms; cambiar de problema, supuestos, filtros, municipio o buscar en el glosario, 19–41 ms; ninguna tarea larga. La suite comprueba que ningún cambio de vista tenga un hueco de más de 100 ms. La fluidez en un equipo con GPU modesta o con otra resolución sigue pendiente de medir en el equipo del usuario.

## Defectos que salieron al revisar con barras de desplazamiento reales
El Plano de Medidas desbordaba 37 px con la leyenda de dos líneas y mostraba una barra propia; la ficha de Medidas se salía del panel a 1280 px; el índice de Método tenía barra propia. Los tres están corregidos (ver `FRENTES_C_D_E.md`).

## Pruebas (`_qa/qa-movimiento.js`) y estado
25 comprobaciones: tokens, intensidades, píldora (posición, viaje, aplastamiento), sin View Transitions, píldora instantánea, velo (salida 150 ms, entrada 240 ms), sin huecos de más de 100 ms al cambiar de vista, entrada escalonada con tope y un solo momento firma, cifras que ruedan (valor final exacto), `tick` sin interpolación, línea de tiempo ligada al scroll, camino de movimiento reducido, esqueleto de carga y reglas de rendimiento. Los contrastes se calculan con la píldora como fondo del elegido.

**Pendiente:** medir la fluidez en un equipo con GPU modesta; probar con la preferencia real de movimiento reducido del sistema operativo; Safari y Firefox (Firefox no tiene animación ligada al scroll en todas las versiones: allí la línea de tiempo queda dibujada); lector de pantalla.

## Cómo se usa
`?mov=quieto | sobrio | expresivo` en la dirección (por ejemplo `http://localhost:4179/?mov=sobrio#acceso`).
Archivos: `app/css/movimiento.css` (reglas), `app/js/movimiento.js` (intensidad, transición, píldora, entrada, `tick`), tokens en `app/css/tokens.css`.
