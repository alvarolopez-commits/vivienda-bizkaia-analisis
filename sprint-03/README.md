# Sprint 03 · Explorador de Medidas · PROTOTIPO (solo escritorio)

Una experiencia de exploración para `#medidas`: **Explorar** (Plano y Matriz con criterios comunes), **Entender** (Cadena y Quién decide), **Comparar** (2 o 3 medidas, con bandeja y panel contextual) y **Alternativas**. Prototipo aislado: no modifica la web publicada ni se despliega. **Móvil: no se ha trabajado ni probado** (aplazado).

## Abrirlo

Doble clic en `Abrir Sprint 03.bat`, o desde la carpeta del proyecto:

```bash
python sprint-03/servidor.py
```

Después abrir http://localhost:4178/medidas/

- Direcciones que se pueden abrir directamente:
  - `#medidas` (Explorar)
  - `#medidas/M06` (ficha)
  - `#medidas/M01-M06-M20` (comparar)
  - `#medidas/alternativas`
  - `#medidas?vista=entender`
  - `#medidas?rep=matriz&w=3,2,0,0,1` (Matriz con pesos)
- Parámetros de ayuda: `?limpio` oculta la etiqueta de prototipo, `?marcar` resalta los textos propuestos y `?abrir=M10` abre el panel de esa medida al cargar (para capturas).
- Referencia: 1440 × 900. También se ha comprobado a 1280 px de ancho.

## Pruebas

```bash
python -I sprint-03/_qa/regresion.py
```
```bash
node sprint-03/_qa/rutas.mjs
```
Las de navegador (`_qa/qa-equivalencia.js` y `_qa/qa-flujos.js`) se ejecutan desde la consola con el prototipo abierto; el detalle está en `docs/medidas/REGRESSION_RESULTS.md`.

Las pruebas solo necesitan lo que está en el repositorio: `medidas/original/` y el manifiesto de hashes `sprint-01/_qa/original-hashes.json`. La copia completa de la web (`sprint-01/_original-servido/`, 5 MB) no se sube y aquí no hace falta.

## Qué hay aquí

| Ruta | Qué es |
|---|---|
| `medidas/index.html`, `medidas/css/` | La página y su estilo (provisional) |
| `medidas/js/main.js` | Montaje: datos, router, criterios, bandeja, panel, vistas |
| `medidas/js/estado-app.js` | Estado único y serialización de la URL |
| `medidas/js/calculo.js` | Copia **literal** de las funciones privadas del original (pesos, nota, orden, geometría del plano, `first`, `watch`, `chain`, `deciders`) |
| `medidas/js/plano.js`, `matriz-vista.js`, `entender.js`, `comparar.js`, `detalle.js` | Los componentes |
| `medidas/original/` | **18 ficheros copiados byte a byte** de la web servida (módulos y JSON). No se editan |
| `_qa/` | Pruebas (`regresion.py`, `rutas.mjs`, `qa-equivalencia.js`, `qa-flujos.js`), `caracterizacion.json` y `hechos.py` |
| `servidor.py` | Servidor local en 127.0.0.1:4178, sin caché |

Documentación en `docs/medidas/`: `AS_IS_TO_BE.md`, `STATE_AND_URL.md`, `CONTENT_FIDELITY.md`, `REGRESSION_RESULTS.md`, `UX_DECISIONS.md` y `capturas/`.

## Real y prototipo

- **Real (original sin cambios):** datos, fórmulas, pesos, orden, textos de sección, criterios, diagramas, alternativas y mapa de estado.
- **Prototipo funcional:** estado compartido, criterios comunes, bandeja, panel contextual, comparador con textos largos, modos y URL con contexto.
- **Provisional:** el diseño visual.
