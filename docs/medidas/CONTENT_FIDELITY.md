# CONTENT_FIDELITY · De dónde sale cada dato y cada texto

**Sprint 03 · Explorador de Medidas · 10-11-2026.** Trazabilidad campo a campo: lo que se muestra → archivo y propiedad de origen. Cuando el texto no es de la web original, está marcado `data-propuesta` (PROPUESTA_MICROCOPY) y listado en §5.

**Regla aplicada:** los datos y los textos largos salen literales de `data/medidas.json` e `ideas.json` (sha256 idéntico a la web servida: `c5e4f30d…0e9a` y `fbebc803…4852`). Los textos de interfaz que existían en la web se reutilizan tal cual y se comprueban contra el código servido (`_qa/regresion.py`, 37 literales). Ninguna cifra de los datos está escrita en el código.

## 1. Cabecera y bloques

| Se muestra | Origen |
|---|---|
| «Las medidas, con los mismos criterios» | `index.js` (`head`) |
| «**30 de 34** se pueden aplicar ya, sin cambiar ninguna ley. Ninguna tiene una nota única: cada criterio se ve aparte.» | `index.js`; `30` = medidas con `viabilidad === "instrumento_existente"`, `34` = `medidas.length` (calculados) |
| «Evidencia y plazo» y su frase (2 de evidencia alta…, 18 de corto plazo, 13…) | `index.js::planoSub` (copiada), contada con los datos; comprobada idéntica a la original |
| «Todas, criterio a criterio» / «Filtra o da peso a lo que te importa: la tabla se ordena.» | `index.js` |
| «De cada problema a qué vigilar» / «Elige una línea de actuación. Pasa por una medida para ver su cadena.» | `index.js` |
| «Quién decide cada medida» / «Del Estado a los ayuntamientos, y qué puede hacer BM30 en cada una.» | `index.js` |
| «Dos o tres, lado a lado», «Medidas lado a lado», «Cambia la comparación», «Compárala con otras», «← Todas las medidas», «Medida 1», «Y una tercera», «Ninguna», «Comparar» | `index.js`, `ficha.js` |
| «Las alternativas estudiadas» / «Ideas que se analizaron y por qué no están entre las 34.» | `index.js` |

## 2. Plano

| Elemento | Origen |
|---|---|
| Posición (fila = `evidencia`, columna = `plazo`) | `medida.evidencia`, `medida.plazo` (geometría de `burbujas.js`, copiada) |
| Tamaño | `medida.municipios.plan + probada + piloto` (sin repetidos) → `municipios.json[c].poblacion` / `meta.poblacion_total` |
| Color | `LINE_COLORS[medida.linea]` (**importado** de `burbujas.js`, no redefinido) |
| Número dentro | `medida.id` (solo si el radio lo permite, como en el original) |
| Etiqueta accesible | «M06 Nombre: evidencia media, plazo corto» (`nombre`, `evidencia`, `plazo` del JSON) |
| Leyenda de líneas | `meta`: `medidas.lineas[k].split(":")[0]` (igual que el filtro original) |

## 3. Matriz (las 12 columnas de `matriz.js`)

| Columna | Origen |
|---|---|
| Orden | Calculado (`ordered`), «1.º», solo con pesos |
| Medida | `id` + `nombre`; «Evaluada, no se propone» si `en_plan === false` |
| Línea | `LINE_SHORT[linea]`; al pasar el ratón, `lineas[linea]` |
| Cómo actúa | `MECH_SHORT[mecanismo]`; `mecanismos[mecanismo]` |
| Evidencia | `evidencia` |
| Magnitud documentada | `magnitud.tipo` («Efecto medido» / «Resultado») + `magnitud.texto`; «Sin evaluar» si no hay (17 de 34) |
| Se aplica | `SHORT.viabilidad[viabilidad]` («Ya», «Norma vasca o foral», «Ley estatal») |
| Plazo, Coste público | `SHORT.plazo`, `SHORT.coste` |
| Población donde hace falta | `reach()` × 100 en %; «No se propone» (M33, M34) o «Ningún municipio» |
| Quién decide | `decide[]` → `medidas.decide` |
| Papel de BM30 | `papeles_bm30[papel_bm30.papel]` |
| *(nuevas, fuera de las 12)* casilla «Comparar» y «Nota (0 a 1)» | Estado de selección; `scorer()` (la nota ya existía en el código, solo ordenaba; ahora se enseña solo con pesos) |

Nombres cortos y literales de columna: copiados de `matriz.js` sin cambios (comprobado fila a fila contra la matriz original, ver `REGRESSION_RESULTS.md`).

## 4. Panel contextual y ficha completa

| Campo | Origen | Comentario |
|---|---|---|
| ID, nombre | `id`, `nombre` | |
| 12 criterios (Línea … Quién paga) | `criteria()` **de `ficha.js` original, importada** | Valores comprobados iguales en las 34 fichas |
| **Qué hace** | `que_hace` | Panel: extracto `first()` (2 frases) + «Leer más» → texto íntegro. Ficha completa: íntegro |
| **Si ha funcionado** | `evidencia_detalle` | ídem |
| **Qué puede hacer BM30** | `papel_bm30.por_que` | Literal, sin acortar |
| **Qué vigilar** | `kpi` | Literal, sin `watch()` |
| Riesgos | `riesgos` | La ficha original **no** lo mostraba; el campo existe en las 34 |
| Fuentes | `fuentes[]` (115 URL en total) | Enlaces; el texto del enlace es el dominio (como en Alternativas) |
| Mapa de estado y leyenda | `municipios.json[c].estado_medidas` + `medidas.estado` | `stateMap()` de `ficha.js`, copiada sin cambios |
| «Estado comprobado el 27 de octubre de 2026» | `medidas.estado.comprobado_el` | |
| «Sin evaluar» / «Ningún municipio» (valores ausentes) | `criteria()` original | Una medida sin `magnitud` dice «Sin evaluar», **nunca 0**. Si faltara un texto largo: «Sin dato» |

**Verificado en las 34 fichas completas:** `que_hace`, `evidencia_detalle`, `papel_bm30.por_que`, `kpi`, `riesgos` y las 115 URL de fuentes aparecen **enteros y literales** (`_qa/qa-equivalencia.js`). La ficha original recortaba `que_hace` en **11** de 34 medidas y `evidencia_detalle` en **17** de 34.

## 5. Comparador, Entender y Alternativas

| Elemento | Origen |
|---|---|
| Filas de criterios (12) | `criteria()` original, por medida |
| Filas de texto largo | Los mismos cinco campos del §4; cada fila con extracto y «Ver completo» |
| «difieren» | Etiqueta factual: los valores de esa fila no coinciden. No hay ganadores, semáforos ni puntuación |
| Cadena y Quién decide | `chain()` y `deciders()` copiadas de `index.js`; **diagramas idénticos** a los originales (13 comprobados) |
| El problema | `meta.problemas[p].nombre` vía `store.problemName` |
| Qué vigilar (nodo) | `watch(kpi)` (como el original) **y**, bajo la cadena, `kpi` completo |
| Alternativas | `alternatives(store)` **original, importada**: las 4 ideas de `ideas.json` con motivo, «Qué es», «Qué podría resolver», «Dónde se usa», «Por qué no la proponemos» y fuentes. No entran en las 34, en la nota ni en el comparador |

## 6. Microcopy PROPUESTA (marcado `data-propuesta`; se ve con `?marcar` en la URL)

| Texto | Dónde |
|---|---|
| «Explorar», «Entender», «Comparar», «Alternativas» | Los cuatro modos (el brief los llama etiquetas UX propuestas) |
| «Criterios» · «Se aplican al Plano y a la Matriz.» | Barra lateral |
| «Hay pesos activos: afectan al orden de la Matriz.» | Plano con pesos |
| «Ninguna medida cumple a la vez todos los criterios activos. Las 34 siguen ahí: quita algún criterio para volver a verlas.» | Cero resultados |
| «N de 3 para comparar» · «Elige al menos dos.» · «Puedes añadir una tercera.» · «Máximo: quita una para añadir otra.» · «fuera de los criterios activos» | Bandeja |
| «Añadir a la comparación» · «Quitar de la comparación» · «Abrir ficha completa» · «Ya hay 3 medidas: quita una para añadir otra.» · «Esta medida queda fuera de los criterios activos.» · «Ver su cadena» · «Ver quién decide» | Panel y ficha |
| «Leer más» / «Leer menos» · «Riesgos» · «Fuentes» | Textos del panel |
| «Nota (0 a 1)» y su ayuda: «Depende de los pesos que has elegido; no mide el impacto de la medida» | Matriz con pesos |
| «Copiar enlace de la comparación» · «Enlace copiado» · «difieren» · «Ver completo» / «Ver menos» | Comparador |
| «Elige una segunda medida…» · «Elige dos o tres medidas para compararlas lado a lado…» | Selector de comparación |
| «El indicador completo de cada medida» | Cadena |
| Anuncios para lectores de pantalla («Añadida M06 a la comparación (2 de 3)», «Ficha de M10 abierta»…) | Región `aria-live` |

## 7. Campos de `medidas.json` que el explorador no muestra

`familia`, `origen`, `escala_barrio`, `problemas` (solo se usa en la Cadena), `quien`, `estado_bizkaia`, `usa_precio`, `factores`, `por_tipo`, `por_estado` (solo para el mapa de estado). Las secciones `escalas`, `grupos`, `origenes`, `perfiles`, `plan_maximo`, `magnitudes`, `necesidad_minima`, `evidencia_probada` y `formula` tampoco se usan. Ninguno se ha reinterpretado.

## 8. Advertencias de contenido NO auditado

- **BM30:** la sigla no se expande y no se le atribuye función. «El papel de BM30 es una propuesta nuestra, por validar» es **literal de `matriz.js`** y se conserva. La validación editorial sigue pendiente (sin texto nuevo en la web pública).
- **Textos largos (115 fuentes, 34 × 5 campos):** se comprueban por **igualdad con el JSON**, no por su exactitud factual. No se ha auditado su contenido.
- **Fuera de alcance:** el pipeline que genera `medidas.json` y `ideas.json` no se ha visto; la «comprobación» del 27 de octubre de 2026 es la que declara el propio JSON.
- **Rótulos «Evidencia: …»:** la escala está «escrita en Método» según la nota original; Método no se ha tocado ni revisado.
- **Orden editorial:** sin pesos se conserva el orden por línea y por ID. No se ha tocado ni valorado si es el definitivo (decisión del autor).
