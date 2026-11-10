# IA_NAVIGATION · Navegación actual y propuesta

## 1. Estado actual (verificado en código)

| Elemento | Comportamiento | Archivo |
|---|---|---|
| Banda | 5 enlaces (Situación, Municipios, Acceso, Medidas, Normas), **sin Método**; se pliegan por debajo de 1100 px y solo queda el nombre de la sección en curso | `index.html:21-31`, `css/marco.css:57-64` |
| Menú | `<dialog>` nativo con las seis vistas y «Ver el radar» | `index.html:93-96` |
| Vista activa | `aria-current="page"` en el enlace de la banda | `js/main.js:92` |
| Resumen | Solo en el pie, con botón de copiar | `index.html:67-90` |
| Radar | Pastilla en la banda, en el menú y en el pie | idem |
| Rutas | Una sola página con `location.hash`; `#municipios/<INE>[-<INE>]`, `#medidas/Mxx[-Mxx[-Mxx]]`, `#medidas/alternativas`, `#metodo/glosario` y redirecciones antiguas | `js/rutas.js`, `docs/audit/SITEMAP_AS_IS.md` |

## 2. Propuesta (opciones A y B comparten esta cabecera)

| Ancho | Banda | Menú |
|---|---|---|
| ≥ 1280 px (A) / ≥ 1100 px (B) | marca · **seis vistas** (activa en negrita y subrayada, `aria-current`) · **Resumen ↗** · **Ver el radar ↗** · Menú | Disponible |
| < 1280 px (A) / < 1100 px (B) | marca · **nombre de la vista activa** · productos externos · Menú | Seis vistas + bloque independiente **«Otros productos»** + «Cerrar» |
| ≤ 899 px | Se retira «Resumen» de la banda (sigue en el menú) | idem |
| ≤ 380 px | marca · vista activa · Menú; los productos externos solo en el menú | idem |

Reglas aplicadas (del documento del sprint): nombres originales; Método visible; Resumen y Radar como externos (`↗` solo como indicación, `rel="noopener"`); no se oculta nunca la vista activa; menú nativo con foco restaurado; el botón de copiar del pie no se toca; no hay segunda barra fija global.

**Por qué 1280 y no 1100 en A:** la banda original reserva dos columnas laterales iguales; con seis enlaces y dos productos externos no caben en 1100 px sin desbordar. Se plegó antes y se muestra siempre el nombre de la vista (comprobado a 1100, 1280 y 1440 px).

## 3. Navegación interna de Situación (solo opción A)

`Mapa` · `Lista de municipios` · `Tipos de municipio` · `Otras herramientas` (barra discreta de 40 px bajo la banda, solo en Situación).

- **No cambia `location.hash`**: la dirección elige la vista, y `main.js` reinicia el scroll al cambiar el hash. Los accesos desplazan con el scroll de la página.
- Destinos: `#mapa`, `#lista`, `#tipos`, `#pestanas` (ids ya existentes en la web original).
- Tras el salto el foco pasa al `<h2>` de la sección. Marca «estás aquí» con `aria-current="location"`.
- Con «reducir movimiento» se salta sin animación.

## 4. Compatibilidad de enlaces (probada en la opción A)

Se probaron 21 direcciones en el navegador: las seis vistas, `#municipios/48020`, `#municipios/48020-48013`, `#municipios/99999` (cae a Bilbao), `#medidas/M06`, `#medidas/M01-M06`, cuatro ids (se queda con tres), repetidos (`M01-M01`), `#medidas/alternativas`, `#metodo/glosario`, las redirecciones `#resumen`, `#diagnostico`, `#compra`, `#comparar/…`, `#ideas` y un hash desconocido. **Todas se comportan como en la web original** y la barra interna de Situación solo aparece en Situación. Detalle en `QA_RESULTS.md`.

## 5. Inventario de microcopy nuevo (`PROPUESTA_MICROCOPY`, a validar)

| Texto | Dónde | Nota |
|---|---|---|
| «Resumen ↗», glifo `↗` en «Ver el radar» | A y B, banda y menú | Mantiene el texto original «Ver el radar»; el spec sugería «Radar ↗» |
| «Otros productos» | A y B, menú | Título del bloque independiente |
| «Mapa», «Lista de municipios», «Tipos de municipio», «Otras herramientas» | A, barra interna | Etiquetas propuestas por el documento del sprint |
| «En Situación» (`aria-label`) | A | |
| «Prototipo Sprint 01 · Opción A/B» | A y B | Etiqueta de prototipo (se oculta con `?limpio`) |
| «Cargando los datos de los 113 municipios…», «Ningún municipio de «…» tiene este dato.», «Municipio», «Tipo de municipio», «Cerrar ×», nota de 3D | B | La web original no tiene estos estados |
| «DEMOSTRACIÓN · NO ES EL COMPONENTE ORIGINAL» | B | Rótulo de componente de demostración |

Todo lo nuevo se puede ver rodeado en naranja añadiendo `#marcar` a la dirección.
