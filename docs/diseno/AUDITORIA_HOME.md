# Auditoría de producto y portada (11/11/2026)

Encargo: `CLAUDE_REVISION_GLOBAL_HOME_ECOSISTEMA_BIZKAIA.md`. Rama local `ux/home-ecosistema` (sale de `ux/sin-adornos`). **Nada publicado.** Solo escritorio (1440×900 y 1280).

## 1. Verificaciones
| Verificación | Resultado |
|---|---|
| Qué alimenta GitHub Pages | Rama `ux/leyendas-arriba`, commit `21735b7`, carpeta `sprint-03-1/app/` (el nombre es solo la ruta publicada). Es el código integrado propio, **no** el de Vercel. Lo de esta entrega está solo en local |
| Dónde vive el contenido y los datos del autor | Textos: renderizadores originales en `app/original/js/` (idénticos a la web publicada, manifiesto sha256 en `_qa/original-hashes.json`, 21/21 en `_qa/integridad.py`). Datos: `app/original/data/*.json|geojson` (sin tocar). Baseline editorial: `docs/diseno/` y el historial de git |
| Vistas integradas | Las seis (Situación, Municipios, Acceso, Medidas, Normas, Método) montan en la misma aplicación y el mismo almacén. Ninguna envía a la web antigua |
| Enlaces a Resumen y Radar | `https://vizcaya-vivienda-resumen.vercel.app/` y `https://vizcaya-vivienda.vercel.app/` responden 200 (comprobado hoy). Rutas antiguas (`#diagnostico`, etc.) redirigen al radar mediante `rutas.js` |
| Regresión | Ver el final de este documento |

## 2. Tabla de hallazgos (hechos y evidencia medida; las propuestas, aparte)
| Observado | Evidencia | Impacto | Prioridad | Propuesta |
|---|---|---|---|---|
| La portada anterior (hero con ilustraciones y rueda secuestrada) no cumple el encargo: **desplazamiento secuestrado** (`wheel` con `preventDefault`), fila de cifras de adorno, ilustraciones de IA como fondo | `js/inicio.js` en `21735b7`; spec §3 y §7 | Alto: choca con «sin scroll-jacking» y «evitar cifras de adorno» | **Alta** | **Hecho en esta entrega:** fuera el secuestro, la rotación y las cifras; fondo `flow` |
| Solo existe un nivel de navegación en la cabecera: seis vistas + «Resumen ↗» y «Ver el radar ↗» mezclados | `index.html` cabecera; captura `1440-A-hero-puertas-situacion.png` | Medio: el visitante nuevo no distingue herramienta de ecosistema | Alta | **Hecho:** zona de tres puertas tras el hero (Análisis y medidas · Resumen · Radar); la cabecera no cambia |
| Tipografía efectiva en las seis vistas | CSS **computado**: Geist en 536 (Acceso), 359 (Medidas), 562 (Método), 1.480 (Municipios), 216 (Normas) y 559 (Situación) elementos; Montserrat solo en 5, 2, 16, 8, 4 y 3 (títulos). Geist Mono no se usa en pantalla. Fuentes cargadas: Geist 400/500/600 y Montserrat 600 | Bajo: cumple Montserrat titulares / Geist texto y cifras | — | Mantener |
| Fuentes servidas desde Google Fonts | `index.html` (`fonts.googleapis.com`) | Medio: dependencia externa y CSP de producción | Media | Autoalojar Montserrat y Geist antes de producción |
| Enlaces externos de datos en Método/Medidas: incluyen fuentes que no son oficiales (p. ej. `roams.es`, `mof.gov.sg`, `elindependiente.com`) | Inventario de `a[href^=http]` en las seis vistas (27 enlaces) | Editorial, no de diseño | Media | **Revisión editorial del autor**: no se tocan |
| Hay clases y reglas duplicadas entre hojas por vista | `.eligen` (Medidas y Municipios con reglas distintas), `.pie` (marco, Situación y Medidas), `.sr-only` (lectura y Medidas) | Bajo hoy; riesgo de divergencia | Baja | Consolidar en una pasada de limpieza aparte |
| Componentes reutilizados | `.vidrio`, `.btn`, lienzo de mapa (Situación, Acceso, barrios), índice interno (`lectura.js`), banner municipal, píldora deslizante | Positivo | — | Mantener |
| Assets realmente usados | `img/flow/flow-a.webp` (204 KB) o `flow-b.webp` (139 KB) en el hero; **un** banner municipal a la vez (de 52 WebP, 11,7 MB en el repo) | Bajo: solo se carga lo visible | — | Mantener; Lighthouse pendiente |
| Al cargar la raíz, Situación reescribe la dirección a `#situacion/alquiler` | `js/situacion/index.js:283` (`replaceState`) | Bajo: copiar la URL tras entrar no devuelve la portada | Baja | Decidir si la raíz debe conservarse mientras el hero está |
| La marca de la cabecera es texto; el logotipo existe solo en `ux/prueba-logo`, sin aprobar | rama `ux/prueba-logo`; el logotipo es azul oscuro y no sirve sobre el hero oscuro sin versión clara | Medio | Media | **Decisión del autor**: aprobar logotipo y su versión para fondo oscuro |
| «Radar» no tiene verificada su operación | spec §1 | Editorial | Alta | Etiqueta «Propuesta» en su puerta, marcada como texto por validar |

## 3. Mapa de rutas
| Dirección | Qué abre |
|---|---|
| `` (raíz), `#`, `#inicio` | **Hero + tres puertas** y, debajo, Situación |
| `#situacion[/indicador[/INE]]` | Situación (sin hero) |
| `#municipios[/INE[-INE]]` | Municipios y comparación |
| `#acceso` · `#medidas[...]` · `#normas` · `#metodo[/glosario]` | Las otras cuatro vistas |
| `#compra`, `#ideas`, `#comparar/A-B`, `#diagnostico`… | Redirecciones de `rutas.js` (a Acceso, Medidas, Municipios o al radar) |
| Enlaces externos de producto | Resumen, Radar (cabecera, hero y puertas) |

## 4. Entrega: portada de dos tiempos
Detalle en [HOME_ECOSISTEMA.md](HOME_ECOSISTEMA.md). Dos composiciones del mismo contenido (`?hero=a` editorial inmersiva, `?hero=b` atlas primero) y una zona de tres puertas con enlaces reales. Capturas en `docs/diseno/capturas/home/`.
