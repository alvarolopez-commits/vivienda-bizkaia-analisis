# STATE_AND_URL · Estado compartido y direcciones

**Sprint 03 · Explorador de Medidas · PROPUESTA pendiente de autorizar antes de integrarse.**
Código: `sprint-03/medidas/js/estado-app.js` (estado, lectura y escritura de direcciones) y `js/main.js` (`render()`, único punto que pinta).

## 1. Estado único

```text
            ┌───────────────────────── S ─────────────────────────┐
 criterios  │ f = { linea, mecanismo, decide, papel, ya }          │──┐
 pesos      │ w = { evidencia, viabilidad, plazo, coste, alcance } │  │
 selección  │ sel = [0 a 3 ids]                                     │  ├─▶ render() ─▶ Plano · Matriz · contador · chips
 panel      │ focus = id | null                                     │  │            ─▶ bandeja · panel contextual
 vista      │ mode, rep (plano | matriz), ficha, cmp, ent           │──┘            ─▶ URL (replaceState)
            └───────────────────────────────────────────────────────┘
```

Plano, Matriz, bandeja y panel **no tienen estado propio**: leen `S`. En la web original, el Plano tenía su `st`, la Matriz su `state` y el selector de comparación sus tres `select`, sin relación.

## 2. Tabla de estado: filtro → fuente → vistas afectadas → defecto → URL

| Estado | Qué es (fuente) | Vistas que lo usan | Defecto | Parámetro de URL |
|---|---|---|---|---|
| `f.linea` | `medida.linea` | Plano · Matriz | todas | `linea=oferta` |
| `f.mecanismo` | `medida.mecanismo` | Plano · Matriz | todos | `mec=limita` |
| `f.decide` | `medida.decide` incluye | Plano · Matriz | cualquiera | `dec=ayuntamiento` |
| `f.papel` | `medida.papel_bm30.papel` | Plano · Matriz | cualquiera | `bm30=facilita` |
| `f.ya` | `viabilidad === "instrumento_existente"` | Plano · Matriz | no | `ya=1` |
| `w` (5 pesos 0 a 3) | pesos del lector | **solo Matriz** (orden y nota) | 0,0,0,0,0 = sin nota ni orden | `w=0,2,0,0,3` (solo si hay alguno) |
| `sel` (0 a 3) | medidas para comparar | Explorar · ficha · bandeja · Comparar | vacío | `sel=M01,M06` |
| `rep` | Plano o Matriz | Explorar | plano | `rep=matriz` |
| `ent.tab`, `ent.linea`, `ent.lineaD` | pestaña y línea de Entender | Entender | cadena, primera línea, «Todas» | `tab=decide`, `l=…`, `ld=…` |
| `focus` | medida abierta en el panel | Explorar (panel, aro, fila) | ninguna | **no va en la URL** (es una vista efímera) |
| Modo | explorar · entender · comparar · alternativas · ficha | todas | explorar | en la ruta (ver §3) |

**Decisión que conviene validar:** los cinco criterios son *propiedades de cada medida* y se evalúan con el mismo predicado en las dos vistas, así que se aplican a ambas. El Plano original solo tenía línea y «aplicable ya»; la Matriz original, línea, mecanismo, quién decide y papel de BM30. Aquí **todos valen para los dos** (el Plano atenúa las medidas que no cumplen, sin mover ni una coordenada). «Aplicable ya» pasa a la Matriz con su mismo predicado (30 de 34).
**No se unifican** Cadena y Quién decide con estos filtros: su dato no lo permite sin validarlo (conservan su selector de línea original).

## 3. Direcciones

La **ruta** conserva exactamente el significado de la web original; el **contexto** de exploración va en la query.

| Dirección | Modo | Notas |
|---|---|---|
| `#medidas` | Explorar | Plano por defecto |
| `#medidas/M06` | Ficha completa | Igual que hoy; cualquier M01 a M34 |
| `#medidas/M01-M06`, `#medidas/M01-M06-M20` | Comparar (2 o 3) | Sin repetidas, como mucho tres, ids no válidos ignorados (mismo parser que `index.js`) |
| `#medidas/alternativas` | Alternativas | |
| `#medidas?vista=entender&tab=decide&ld=oferta` | Entender | **Nueva** |
| `#medidas?vista=comparar` | Selector de comparación | **Nueva**; con una medida elegida, `#medidas/Mxx` sería su ficha, por eso se usa la query |
| `#medidas/M06?linea=oferta&w=0,2,0,0,0&rep=matriz&sel=M01,M06` | Ficha con su contexto | Cualquier ruta admite la query |

Reglas: solo se escribe lo que **no** es el valor por defecto; los valores no válidos (`linea=inventada`, `w=9,9,9,9,9`, `sel=M99`) se ignoran sin error; la selección en una comparación es lo que se compara (los ids de la ruta mandan sobre `sel`).

### Compatibilidad con el router original

`rutas.js` (original) hace `hash.replace(/^#/, "").split("?")[0].split("/")`: **corta la query antes de interpretar nada**. Por eso `#medidas?linea=oferta` y `#medidas/M06?…` se entienden igual que sin query. Está probado con el `rutas.js` **servido, sin cambios** (`_qa/rutas.mjs`, 19 PASS):
- 7 rutas × 6 formas de query dan el mismo `{view, sub}` y la misma redirección que sin query.
- `#ideas`, `#compra`, `#resumen`, `#municipio/48020` siguen redirigiendo igual, y `#ideas?rep=matriz` sigue yendo a `#medidas/alternativas`.
- **Pendiente de comprobar en la integración real:** `main.js` y `index.js::show(sub)` del original solo reciben `sub`; no leen la query, así que **no hay ningún cambio de comportamiento para las direcciones existentes**. Falta verificar lo que no se ve desde el cliente (por ejemplo, reglas de Vercel que reescriban rutas).

## 4. Cómo se escribe el historial

| Acción | Efecto |
|---|---|
| Cambiar un criterio, un peso, Plano/Matriz, abrir o cerrar el panel, añadir o quitar de la bandeja | `replaceState` de la dirección actual (no llena el historial) |
| Cambiar de modo, abrir la ficha completa, abrir una comparación, quitar una medida de la comparación | `location.hash = …` (entrada nueva) |
| **Atrás** | Vuelve a la entrada anterior con su query: la exploración se restaura (probado: filtros, pesos, selección y `rep`) |

Todo enlace interno a `#medidas…` se resuelve al hacer clic **con el contexto actual** (`document.addEventListener("click")` en `main.js`); un clic con modificador o botón central abre la dirección tal cual, sin contexto.

## 5. Reglas de selección y filtrado (todas comprobadas)

1. El encabezado dice «**N de 34** medidas», con `N` del conjunto filtrado; nunca da a entender que se borran medidas.
2. Con cero resultados: «0 de 34 medidas», un texto que lo explica y «Quitar filtros». Probado con una combinación real sin resultados.
3. La bandeja admite de 1 a 3 sin duplicar. Con tres, «añadir» se deshabilita (con motivo visible, `title` y aviso) en el panel y en la Matriz.
4. Un filtro que oculta una medida elegida **no la quita**: la bandeja la marca «fuera de los criterios activos», su burbuja sigue clicable (atenuada) y su panel lo dice.
5. Abrir una ficha y volver restaura la exploración (ver §4).
6. Cambiar de Plano a Matriz no reinicia nada. Con pesos activos en el Plano se avisa de que solo afectan a la Matriz.
7. `0,0,0,0,0` = **sin nota ni orden**: la Matriz vuelve exactamente al orden original por línea e ID.
8. Round-trip de URL: `toHash → fromHash` devuelve el mismo estado en 150 estados aleatorios.
