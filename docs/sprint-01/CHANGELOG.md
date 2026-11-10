# CHANGELOG · Sprint 01

Rama `ux/sprint-01-nav-situacion` (local, sin commits). Nada se ha publicado ni desplegado.

## Ficheros nuevos o modificados

| Fichero | Cambio |
|---|---|
| `sprint-01/preview-a/index.html` | **Único fichero original modificado**: 27 líneas de diferencia (Método y Resumen en la banda, vista activa, bloque «Otros productos» en el menú, barra interna, etiqueta de prototipo, una hoja y un script nuevos) |
| `sprint-01/preview-a/css/sprint01.css` | Nuevo (60 líneas): estilos de la navegación; usa solo tokens existentes de la web |
| `sprint-01/preview-a/js/sprint01.js` | Nuevo (~110 líneas): vista activa, `aria-current` del menú y saltos internos sin tocar el hash |
| `sprint-01/preview-a/` resto | Copia sin cambios de la web servida (66 ficheros + 4 fotos + favicon) |
| `sprint-01/preview-b/` | Prototipo B nuevo: `index.html`, `css/b.css`, `js/b-nav.js`, `js/app.js` (lógica de Situación adaptada del prototipo anterior) y copias de `indicadores.js`, `mapa.js`, `territorio.js`, `comun.js`, datos y three.js |
| `sprint-01/index.html`, `Abrir Sprint 01.bat` | Página para comparar A y B y lanzador |
| `sprint-01/_qa/` | Pruebas: `baseline.mjs`, `qa-*.js`, `original-hashes.json` |
| `docs/sprint-01/`, `docs/REGRESSION_BASELINE.md` | Documentación del sprint |
| `.gitignore`, `.claude/launch.json` | Ignora la copia íntegra del original; añade el servidor de comparación |
| `docs/audit/` | De la fase anterior; **sin commit** a petición del usuario |

## Comprobación de que nada protegido cambió

| Qué | Cómo | Resultado |
|---|---|---|
| Datos, JSON y GeoJSON de A | sha256 contra la web publicada | **Idénticos** (`baseline.mjs` B18) |
| `js/calculo-acceso.js` y todos los módulos JS originales de A | idem | **Idénticos** (B18, B19) |
| Textos editoriales (`glosario.js`, `view-metodo.js`, `normas.json`, `medidas.json`…) | idem | **Idénticos** |
| Qué cambia respecto al original | idem | **Solo `index.html`** (B20); añade `css/sprint01.css` y `js/sprint01.js` |
| Fórmulas y redondeos | Ejecución del módulo original con los datos | 16,9 · 93.007 € · 29,0 % · 887 €/mes · 275.000 € |
| B | `indicadores.js` = original salvo el import (`diff`); `territorio.js` y `mapa.js` originales con rutas ajustadas; `resumen.json` íntegro; `situacion.json` generado con comprobación de igualdad | Sin cambios de datos ni escalas |
| Producción | Sin push, sin build, sin despliegue | No tocada |

## Reversibilidad

A: borrar `css/sprint01.css` y `js/sprint01.js` y restaurar `index.html` desde la web publicada. B: carpeta aislada, se borra entera. Nada de lo existente depende de ellas.

## Dependencias nuevas

Ninguna. B usa three.js r160 y las mismas librerías que la web original (copiadas); A usa las suyas.

## Pasada de diseño de B (v2)

| Fichero | Cambio |
|---|---|
| `sprint-01/preview-b/index.html` | Nueva estructura: intro, cabecera de exploración con controles, escena (índice + mapa), detalle (ficha + lista) |
| `sprint-01/preview-b/css/b.css` | Reescrito: tokens de Astara, escala de 4 px, tipografías Montserrat/Geist/Geist Mono (Google Fonts) |
| `sprint-01/preview-b/js/app.js` | Solo cambia la presentación de los cinco problemas (índice en vez de cifra + tarjetas). Datos, indicadores, mapa, 3D y lista sin cambios |
| `sprint-01/_archivo/preview-b-neutro/` | Copia de la versión neutra, para comparar o volver atrás |
| `sprint-01/_qa/qa-b.js` | Selectores del índice |
| `preview-a/css/sprint01.css` | Solo el color de la etiqueta de prototipo (contraste) |
