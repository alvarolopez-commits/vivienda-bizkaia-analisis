# PROTOTIPO_RADAR_NOTAS · Situación e Indicadores del Radar (escritorio)

**Qué es:** prototipo de diseño de dos vistas del Radar (Situación e Indicadores) en `prototipo-radar/`, con el lenguaje visual del dashboard PCI (`alvarolopez-commits/pci-dashboard`, v4 del 2026-10-21). No es el Radar publicado ni la migración fiel. No toca producción.
**Cómo verlo:**
```bash
python3 -m http.server 4174 --bind 127.0.0.1 --directory prototipo-radar
```
Abre http://localhost:4174/ (con `?marcar` se rodea en naranja lo nuevo). Sin servidor no cargan los datos, porque usa `fetch`.
**Revisado:** Chromium a 1440 px. Sin errores de consola. Cifras comparadas con el Radar publicado (ver §4).

## 1. Qué es literal (copiado del Radar publicado o de PCI)
- **Datos:** `data/*.json` y `data/municipios.geojson`, copia íntegra. `python -I tools/verificar_datos.py` los compara byte a byte con lo que sirve hoy el Radar (8 de 8 iguales el 2026-11-12).
- **Código del Radar, sin cambios:** `js/ui.js`, `comun.js`, `graficos.js`, `mapa.js`, `territorio3d.js`, `rutas.js`, `contrato.js` y `vendor/three/` (comprobado con `cmp` contra el original). El contrato de datos (`contrato.js`) sigue validando los ficheros al cargar, así que el prototipo conserva la idea del Radar de servir a cualquier territorio.
- **Textos y reglas:** títulos de dimensiones, preguntas, estados del semáforo, reglas, umbrales, fuentes y próximos datos salen de `catalogo.json`, `alertas.json` y `datos.json`. Los textos de la interfaz que ya existían (frase de arriba, «Alertas por municipio», «Los 12 indicadores clave», «Elige uno para ver su serie», catálogo, ficha) se mantienen.
- **Lógica de las capas del mapa 3D, del recuento de alertas y de la ficha** (último dato, semáforo, serie, umbral, mapa por municipio, reparto, CSV): adaptada de `situacion.js` e `indicadores.js` originales, guardados en `_origen/` para comparar.
- **Estilo:** `css/pci.css` es la copia literal del `<style>` de `pci-dashboard/index.html` (líneas 8 a 1140), sin editar. Raíl de cristal, barra de filtros, isla oscura con fondo `flow-01/02`, tarjetas, tabla `mini`, cajón de detalle, tokens `--pci-*`, Geist, Geist Mono y Montserrat. Los iconos son el sprite Phosphor (MIT) del mismo PCI.
- **Intro:** el mismo reveal que PCI (haz de luz, logotipo que se descubre con un barrido, texto que sube y el logotipo que vuela hasta el raíl). El CSS está en `pci.css`; la secuencia (`js/intro.js`) es la de `playIntro()` de pci-dashboard. Un clic o una tecla la saltan, el botón del raíl la repite y con «reducir movimiento» no se reproduce.
- **Lo propio del Radar** va aparte, en `css/radar.css` (gráficos y mapas del Radar, etiquetas de estado, lista de municipios, cuadro de indicadores), con los tokens de PCI.

## 2. Qué es nuevo (a aprobar)
| Elemento | Nota |
|---|---|
| Aviso «Prototipo de diseño…» en la barra | Para que no se tome por el Radar final. |
| Raíl con las dos vistas hechas y las otras cuatro como enlaces al Radar publicado (↗) | Medidas en marcha, Escenarios, Datos y Metodología. |
| Isla oscura de Situación: 50 municipios, «6 de 12 indicadores clave empeoran» y los cuatro tipos de alerta como selectores | En el Radar publicado esos tipos se recorren con un scroll anclado. Aquí se eligen. |
| Un solo selector de tipo de alerta (tarjeta de la isla o selector de la barra) que gobierna isla, mapa y lista | Tocar la tarjeta elegida vuelve a «Todas». |
| Conmutador 3D / Plano del mapa | El original solo ofrece 3D y cae a plano si no hay WebGL. |
| Lista de municipios con alertas, con barra de proporción y ficha de alertas del municipio elegido | Sustituye a la tabla de alertas. En 3D no se puede tocar un municipio (igual que el original): se elige en la lista. En plano también se toca en el mapa. |
| Detalle de un indicador clave en un cajón (como el «record sheet» de PCI) | En el original es un panel al lado. Misma información. |
| Catálogo de indicadores como tabla de PCI, con filtros de dimensión y búsqueda en la barra | Mismos filtros que el original. |
| Ficha de indicador con isla oscura de cifras | Mismas cifras que la tira del original. |
| Logotipo «RV» en el raíl y en la intro (`assets/radar-logo.svg`) | Nuevo. Mismas medidas, degradados y borde que el logotipo de PCI; las letras son trazos, no texto, para no depender de ninguna tipografía. No se usa el logotipo de Astara (el brief pide no atribuir autoría). |
| Textos de la intro: «Radar de vivienda» y «Bizkaia · 113 municipios», botón «Saltar la intro» | Nuevos. En PCI la segunda línea es «by Astara Intelligence»; aquí se omite por el mismo motivo. |
| Mapas por tramos de la ficha en la rampa azul de PCI (`js/colores.js`) | Mismos cortes (quintiles). Cambia solo el color. |

## 3. Decisiones que conviene validar
1. **Colores de los cuatro tipos de alerta** (rojo, azul, oliva, celeste): se conservan los del Radar publicado porque codifican una categoría, no una magnitud, y una sola rampa azul no los distinguiría. Es la única zona del prototipo fuera de la rampa PCI.
2. **Sin «budget lens» y sin el cristal con refracción** de PCI: el CSS de PCI trae esas partes pero el Radar no las usa. El cristal funciona sin la refracción (la parte en JavaScript no se ha portado).
3. **Sin Astara en el raíl ni en el pie.** PCI lleva el logotipo de Astara Intelligence; aquí se ha omitido por el compromiso de no atribuir autoría. Se puede añadir si Alvaro y el autor lo aprueban.
4. **La intro se reproduce en cada carga**, como en PCI. Si resulta pesada para quien entra a menudo, se puede limitar a una vez por sesión.
5. **Solo escritorio.** Móvil aplazado, como en el prototipo de Situación del análisis.

## 4. Calidad
- **Cifras comparadas con el Radar publicado:** 50 municipios con alguna alerta (23 graves); 32 viviendas turísticas, 3 contratos que caen, 17 alquiler por encima del límite, 6 zona tensionada; 6 de 12 indicadores empeoran; 971 €/mes en Bilbao (2025, +6,6 % frente a 2024); 281.141 € de compraventa; 32 municipios con dato de alquiler (Getxo 1.121 €/mes, Urduliz 1.005, Leioa 992).
- **Probado a mano:** elegir tipo (tarjeta y barra, sincronizados), elegir municipio en la lista y en el mapa plano, conmutar 3D/Plano, abrir y cerrar el cajón (botón y Escape), ficha desde el cajón, catálogo y selector de indicador.
- **No verificado:** contraste WCAG calculado, lector de pantalla real, navegación solo con teclado en toda la página, anchos menores de 1024 px, rendimiento del 3D en equipos modestos, navegador sin WebGL, Safari y Firefox. El detector de impeccable no se ha pasado.

## 5. Qué falta
- Las otras cuatro vistas (Medidas en marcha, Escenarios con su calculadora, Datos con el calendario, Metodología). Escenarios es la más delicada: su lógica de cálculo no se puede tocar.
- Recorte del CSS de PCI a lo que usa el Radar, una vez cerrado el alcance.
- Publicación del prototipo como artifact privado y validación con el autor.
