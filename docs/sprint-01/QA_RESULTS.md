# QA_RESULTS · Sprint 01

**Entorno:** navegador integrado de la app de escritorio (Chromium), emulación de ancho, servidor local `python -m http.server`. Pruebas escritas en `sprint-01/_qa/` (`baseline.mjs`, `qa-header.js`, `qa-flujos.js`, `qa-b.js`). `PASS` = ejecutado y comprobado; `PENDIENTE` = no ejecutado. **No se ha probado en dispositivos reales, Safari ni Firefox, ni con lector de pantalla.**

## 1. Línea base automática (`node sprint-01/_qa/baseline.mjs`): 20 de 20 PASS

Ejecuta el `calculo-acceso.js` **original** (copia sin cambios, sha256 `6fa9a01ce433…`) con los datos de la web.

| Caso | Resultado |
|---|---|
| 113 municipios · M01–M34 (34) · 15 instrumentos · 4 niveles · 12 hitos · 124 términos · 22 fuentes | PASS |
| Cobertura de los cinco indicadores: 35, 113, 112, 113, 113 | PASS |
| Estado inicial de Acceso: 16,9 años · 93.007 € · 29,0 % · 887 €/mes · precio pagable 275.000 € (redondeo al millar; valor exacto 275.325,4) · vivienda media 265.733 € | PASS |
| Rejilla: 15 %×35 % = 16,9; 20 %×35 % = 12,6; 10 %×25 % = 18,1 | PASS |
| «30 de 34» aplicables ya · «9 de 15» los decide Euskadi | PASS |
| Opción A: los 61 ficheros de `js/`, `data/`, `vendor/`, `fonts/` e `img/` son idénticos a la web publicada; `calculo-acceso.js` idéntico; **solo cambia `index.html`** | PASS |

## 2. Opción A en el navegador (web completa)

| Prueba | Resultado |
|---|---|
| Línea base en la UI: Acceso 16,9 años / 29,0 % / 275.000 €, texto «ahorrando la entrada (93.007 €)» y «887 € al mes», rejilla 16,9, «0 de 113 municipios al alcance»; Medidas 34 filas y «30 de 34»; Normas 15 filas, 12 hitos y «9 de 15»; Método 124 términos y 22 fuentes; Municipios 113 opciones | PASS |
| 21 enlaces profundos y redirecciones (`#municipios/48020-48013`, `#medidas/M06`, `#medidas/M01-M06`, cuatro ids → tres, `#metodo/glosario`, `#resumen`→`#situacion`, `#diagnostico`→`#municipios`, `#compra`→`#acceso`, `#comparar/…`, `#ideas`, desconocido…) | PASS |
| Barra interna visible solo en Situación | PASS |
| Saltos «Mapa / Lista / Tipos / Otras herramientas»: la sección queda a 96 px (= banda + barra), `location.hash` no cambia, foco en el `<h2>`, marca «aquí» | PASS a **1440 px** y a **375 px** |
| Menú: seis vistas, «Otros productos» con Resumen y Radar, `aria-current` en la vista activa, foco dentro, cierre con «Cerrar» y con Escape, foco vuelve a «Menú» | PASS a 1440 y 375 |
| Orden de tabulación = orden visual (saltar, marca, seis vistas, Resumen, Radar, Menú, barra interna, contenido) | PASS a 1440 |
| 3D de «El mapa» en A: monta un canvas, oculta el SVG y cambia al elegir otro problema; sin errores nuevos de consola | PASS a 1440 px |
| Salto con pulsación inmediata tras cargar (antes de que la escena reserve su altura) | PASS a 1440 px (tras el arreglo 6 de §5) y a 375 px |

## 3. Cabecera y desbordes (medición en el DOM)

| Ancho | A: enlaces visibles | A: vista activa | A: externos en banda | B: enlaces visibles | B: vista activa | Scroll horizontal |
|---|---|---|---|---|---|---|
| 1440 | 6 | por `aria-current` | Resumen, Radar | 6 | por `aria-current` | No |
| 1280 | 6 | por `aria-current` | Resumen, Radar | 6 | idem | No |
| 1100 | plegados | «Situación» visible | Resumen, Radar | 6 | idem | No |
| 1024 | plegados | «Situación» visible | Resumen, Radar | plegados | «Situación» visible | No |
| 768 | plegados | «Situación» visible | Radar (Resumen en el menú) | plegados | «Situación» visible | No |
| 375 | plegados | «Situación» visible | ninguno (en el menú) | plegados | «Situación» visible | No |
| 320 | plegados | «Situación» visible | ninguno (en el menú) | plegados | «Situación» visible | No |

A 320 px: marca, vista activa y Menú no se solapan (huecos de 22 px) ni se recortan.

## 4. Opción B (funciones)

| Prueba | Resultado |
|---|---|
| Línea base por problema: «34 de 35 / 35 con dato», «10,8 a 16,9 / 113», «30.000 a 120.000 / 112», «38 / 113», «53 de 63 / 113»; Bilbao 55,8 % · 12,5 a 19,4 años · +1,6 puntos · 6,1 por 1.000 · 10,0 % | PASS |
| Cartas calculadas: 113 fichas · 10,8 a 16,9 años · 34 medidas · 4 niveles | PASS |
| Un selector de problema actualiza ficha, lista, recuento y mapa; clic en un municipio actualiza ficha, desplegable y enlace; filtro por tipo (9 de costa, 104 atenuados); «Ver los 113» y «Ver los diez primeros» | PASS a 1440 y 375 |
| 3D: monta un canvas, oculta el SVG, cambia con el problema y vuelve a 2D | PASS; la etiqueta «Bilbao 55,8 %» se vio en pantalla, pero la lectura por DOM salió vacía (el módulo original solo actualiza el texto al dibujar) |
| Menú: seis vistas, «Otros productos», `aria-current`, foco, cierre y retorno de foco | PASS a 375 |
| Orden de tabulación a 1440 | PASS (banda, controles, problemas) |

## 5. Problemas encontrados y corregidos durante la QA

1. El rastreo de la web había omitido 4 fotos (`img/*.jpg`, 404 en A): descargadas.
2. En móvil (A y B) se ocultaba el nombre de la vista activa: ahora siempre se ve (marca · vista · Menú).
3. En A sin Lenis (móvil) el salto no se movía: el desplazamiento suave nativo no avanzaba en el navegador de pruebas. Se anima a mano y con red de seguridad; comprobado a 375 px.
4. «Resumen ↗» medía 34 px de alto: ahora 40 px.
5. La hoja de estilos se quedaba en caché: se versiona con `?v=`.
6. En escritorio, una pulsación nada más cargar no llegaba a su sección: el límite de scroll de Lenis se calcula antes de que la escena de la portada reserve su altura (límite 1041 px con una página de 10.251 px). El salto llama ahora a `Stage.lenis.resize()` antes de desplazar y se autocorrige a 1,6 s y 3,2 s si el usuario no ha tomado el control. Comprobado con pulsación inmediata.

## 6. Observaciones abiertas (no corregidas)

- **Posible defecto de la web original (no verificado con rueda real):** el límite de scroll de Lenis queda en 1041 px hasta que algo llama a `resize()`. Aquí ocurrió en el navegador de pruebas y no se tocó el código original. Conviene comprobar con una rueda de ratón real en la web publicada.
- La marca «Vivienda en Bizkaia» mide 20 a 25 px de alto (enlace de texto original).
- La barra interna de A tapa 40 px de la parte alta de la portada.
- El botón del radar sale de la banda en ≤ 380 px (sigue en el menú).
- `prefers-reduced-motion`: el código lo respeta (salto sin animación, animaciones desactivadas), **pero no se pudo simular en el navegador de pruebas**.

## 7. PENDIENTE

Lector de pantalla real · dispositivos táctiles reales · Safari y Firefox · simular «reducir movimiento» · rendimiento del 3D en equipos modestos · contraste medido con herramienta · prueba con usuarios · comprobación de A entre 1100 y 1279 px por captura (medido, no visto).

## 8. Opción B v2 (pasada de diseño)

| Prueba | Resultado |
|---|---|
| Línea base por problema (cifras, recuentos 35/113/112/113/113, valores de Bilbao, primera fila) y cartas calculadas | PASS a 1440 px, idéntica a v1 |
| Índice: la fila elegida se abre (`aria-expanded="true"`) y gobierna mapa, ficha y lista | PASS |
| Clic en el mapa, filtro por tipo (9 / 104 atenuados), «Ver los 113», 3D y vuelta a 2D | PASS |
| Cabecera a 1440, 1024, 768, 375 y 320 px: sin scroll horizontal, vista activa siempre visible, **ningún objetivo táctil por debajo de 36 px** | PASS |
| Menú a 375 px: seis vistas, «Otros productos», foco y cierre | PASS |
| Escala tipográfica real (computada a 1440 px): h1 72 · cifra elegida 52 · h2 40 · cifra 31 · entradilla 22 · h3 18 · títulos 15 · datos 13 px | PASS |
| Detector de impeccable | 1 aviso corregido (etiqueta de prototipo con contraste 3,8:1 → fondo `#a84a06`, también en A). Falsos positivos explicados: «jerarquía plana» (el detector no resuelve `clamp()`; ver la escala real arriba), «relleno escaso» en el menú y en el panel del mapa (usan variables de espacio / el mapa ocupa el panel a propósito), Montserrat (tipografía de la marca) |

Pendiente para v2: revisión en dispositivo real; en móvil el mapa queda debajo del índice de cinco problemas (se valora en la próxima iteración).
