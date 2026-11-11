# Sprint 03.1 · Aplicación integrada (Situación + Medidas) · PROTOTIPO de escritorio

Una sola aplicación local donde **Situación** (Living Atlas, Sprint 02) y **Medidas** (Explorador, Sprint 03) comparten marco, datos y sistema tipográfico. Situación y Medidas se abren siempre aquí, nunca en la web antigua; Municipios, Acceso, Normas y Método abren la «versión actual» publicada y se marcan con ↗. No publicado. **Móvil: no se ha trabajado.**

## Abrirla

```bash
python sprint-03-1/servidor.py
```

Después abrir http://localhost:4179/ (o doble clic en `Abrir Sprint 03.1.bat`).

| Dirección | Qué abre |
|---|---|
| `#situacion/alquiler/48020` | Living Atlas, Alquiler, Bilbao |
| `#medidas` | Explorador de Medidas |
| `#medidas?rep=matriz&w=3,2,0,0,1` | Matriz con sus pesos |
| `#medidas/M01-M06` | Comparar dos medidas |

`?limpio` oculta la etiqueta de prototipo; `?abrir=M10` abre la ficha de esa medida (solo para capturas); `?marcar` resalta los textos propuestos.

## Cómo está hecha

- **Un marco** (`app/index.html`, `css/marco.css`): cabecera, menú, pie, tokens.
- **Un router** (`app/js/app.js`): una sola vista montada a la vez; al cambiar se desmonta la anterior (oyentes y DOM) y se activa solo la hoja de estilos de la nueva. La navegación está serializada: dos montajes nunca se solapan.
- **Un almacén de datos** (`app/js/datos.js`): el `createStore` original, cargado una vez y compartido.
- **Una hoja tipográfica** (`app/css/typography.css`): fuente de verdad de las familias.
- Las vistas son los `main.js` de los sprints convertidos en `montar()` (ver `tools/convertir_vistas.py`): cambia de dónde salen el almacén y el DOM, no la lógica.
- `app/original/`: 20 ficheros copiados byte a byte de la web servida (módulos y JSON).

## Pruebas

```bash
python -I sprint-03-1/_qa/integridad.py
```
Las de navegador (`_qa/qa-navegacion.js`, `qa-situacion.js`, `qa-equivalencia.js`, `qa-flujos.js`, `qa-tipografia.js`) se ejecutan desde la consola con la app abierta; el servidor local las sirve en `/_qa/`. Detalle y resultados en `docs/continuidad/TIPOGRAFIA_APLICADA.md`.

## Medidas: una sola composición

Escenario (Plano o Matriz) + panel lateral persistente con la ficha y la lista de las medidas a la vista, filtros en una cinta superior y bandeja de comparación flotante. Ya no hay variantes `?diseno=`. Descripción, pruebas y decisiones en `docs/continuidad/PROPUESTAS_MEDIDAS_A_B.md` (histórico) y `docs/continuidad/COMPOSICION_UNICA.md`.

Los enlaces a Municipios, Acceso, Normas, Método, Resumen y Radar abren la **versión actual publicada en una pestaña nueva** (marca ↗): así esta pestaña conserva siempre el prototipo.
