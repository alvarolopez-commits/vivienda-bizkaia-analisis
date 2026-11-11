# Banners de la cabecera municipal

Encargo: `CLAUDE_INTEGRACION_BANNERS_MUNICIPIOS_BIZKAIA.md`. Rama `ux/banners-municipios` (sale de `ux/liquid-glass-fundacion`, commit `af6852c`). **Sin publicar.** Solo escritorio (1440×900 y 1280).

## Qué cambia (y qué no)
La cabecera del municipio primario de `Municipios` (la tarjeta blanca con nombre y datos) pasa a ser un banner territorial de 208 px con una imagen ilustrativa detrás. **El texto es el mismo HTML del renderizador original**, que no se toca: `app/original/js/municipios/index.js` sigue idéntico byte a byte. La vista solo añade, tras dibujar la ficha, una `<img>` decorativa y un velo en la primera `.muni-cab`.

| Archivo | Cambio |
|---|---|
| `app/js/municipios/imagenes.js` (nuevo) | Registro: código INE → banner. Genéricos deterministas. Rutas desde `import.meta.url` |
| `app/js/municipios/index.js` | `banner()`: añade la imagen al primario; `error` → fondo del sistema |
| `app/css/municipios.css` | Estilos del banner (solo presentación) |
| `app/img/municipios/` (nuevo) | 52 WebP + `MANIFEST.json` del paquete (11,7 MB; se cargan de uno en uno) |
| `_qa/qa-banners.js` (nuevo), `_qa/integridad.py` | Pruebas del banner; la comprobación de presentación admite el selector de barra de la rama anterior |

Sin cambios en JSON de datos, cálculos, rutas, comparador, selectores ni textos.

## Resolución de imágenes
- **Clave: el código INE que ya usa la aplicación** (`store.municipios`), no el nombre visible. Cada uno de los 22 códigos se comprobó contra `original/data/municipios.json` por coincidencia exacta del nombre normalizado (sin acentos ni signos); la prueba lo repite en el navegador.
- **16 identificados** (48020 Bilbao, 48013 Barakaldo, 48044 Getxo, 48078 Portugalete, 48082 Santurtzi, 48046 Gernika-Lumo, 48017 Bermeo, 48057 Lekeitio, 48068 Mundaka, 48031 Elantxobe, 48073 Ondarroa, 48090 Balmaseda, 48074 Urduña / Orduña → `orduna.webp`, 48077 Plentzia, 48043 Gorliz, 48012 Bakio): su banner.
- **6 provisionales** (Amorebieta-Etxano 48003, Galdakao 48036, Mungia 48069, Urduliz 48089, Sopela 48085, Zalla 48096): en `PROVISIONALES` con `approved: false`. **No se usan** hasta que el equipo editorial ponga `approved: true`, uno a uno.
- **Resto (97 municipios, incluidos los 6 provisionales):** uno de los 30 genéricos compartidos, por FNV-1a del código INE módulo 30. Sin `Math.random`, sin estado, sin depender del orden de la lista. No se usa el criterio costa/interior porque los 30 genéricos no traen esa etiqueta; no se deduce geografía.
- Si una imagen falla (404): se retira la `<img>`, se ve el azul marino del sistema (nunca icono roto), un `console.warn` deja la traza y no hay reintentos.

## Diseño
- Alto mínimo 208 px a 1440; con comparación, 168 px (no se duplican banners: el comparado conserva su tarjeta y sus datos; su franja de color sigue sobre la imagen).
- `object-fit: cover`, punto focal por imagen en `FOCO` (vacío por ahora). Sin blur ni filtros sobre la imagen.
- Degradado azul marino a la izquierda (92 % → 78 % → 28 % → 0 %) más un refuerzo suave abajo. Nombre en Montserrat blanco; metadatos en Geist dentro de una única píldora semisólida (el único vidrio del banner), con degradación para `prefers-reduced-transparency` y `prefers-contrast: more`.
- La imagen aparece con un fundido de 240 ms sobre el azul marino (sin parpadeo blanco); sin movimiento decorativo. La entrada de la vista sigue siendo la del sistema de movimiento.

## Pendientes editoriales (no decididos aquí)
1. **Etiqueta de «ilustración».** Las imágenes son ilustraciones generadas con IA y el catálogo avisa de que la exactitud geográfica no está verificada. No se ha añadido ninguna etiqueta; si se quiere visibilizar, hace falta texto aprobado. Hoy la imagen es decorativa (`alt=""`).
2. **Provisionales:** revisar y aprobar los 6 (se copian al repositorio, que es público, pero no se muestran).
3. **Genéricos con posible lectura geográfica:** `generico_25` muestra el mar y una costa, y `generico_30` un puente de piedra con iglesia al atardecer. Con la asignación actual pueden tocar a un municipio de interior o a uno que se reconozca. Decisión pendiente: excluirlos (`GENERICOS_EXCLUIDOS`) o dejarlos.
4. **Encuadre:** en Bilbao el nombre cae sobre el puente de La Salve y en Getxo el Puente Colgante queda bajo el degradado. Se puede mover el punto focal (`FOCO`) si se quiere.
5. Los identificados se llaman «banners de tanda anterior; exactitud geográfica no verificada» en `MANIFEST.json`.

## Pruebas (`_qa/qa-banners.js`, 46)
Registro (22 códigos reales), 52 archivos con respuesta 200, determinismo y reparto de genéricos, y los casos de la tabla del encargo (Bilbao con texto idéntico al original, Getxo sin recargar, Gernika-Lumo, Urduña / Orduña, genérico estable, provisional → genérico, Bilbao–Barakaldo, cambio rápido de tres, selector, imagen rota, rutas bajo subruta), geometría (alto, ancho idéntico al de las tarjetas, sin scroll horizontal, nombre largo), tipografía, vidrio acotado, carga (solo las visitadas) y **legibilidad medida sobre los píxeles de las 46 imágenes que pueden salir**: nombre ≥ 9,9:1 y metadatos ≥ 12:1 en el peor caso. Pasan a 1440 y a 1280.
