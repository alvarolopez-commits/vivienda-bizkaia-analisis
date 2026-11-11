# Sprint 03.1 · Aplicación integrada (Situación + Medidas) · PROTOTIPO de escritorio

Una sola aplicación local donde **Situación** (Living Atlas, Sprint 02) y **Medidas** (Explorador, Sprint 03) comparten marco, datos y sistema tipográfico. Todas las pestañas se abren aquí, con el mismo marco y la misma tipografía; Municipios, Acceso, Normas y Método son páginas «aún no rediseñadas» con enlace a la versión actual en pestaña nueva. Subido a la rama `ux/sprint-03-1-continuidad`. **Móvil: no se ha trabajado.**

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

Escenario (Plano o Matriz) + panel lateral fijo con la ficha y la lista de las medidas a la vista, filtros en una cinta superior y bandeja de comparación flotante. Documentación completa, pruebas y diferencias deliberadas en `docs/continuidad/COMPOSICION_UNICA.md`.

Design System (materiales L0/L1/L2, componentes, degradación): `docs/diseno/DESIGN_SYSTEM.md`.

## Estructura

```text
sprint-03-1/
  app/index.html          marco único (cabecera, menú, pie)
  app/css/                typography.css (familias) · tokens.css (tokens y materiales Liquid Glass) · marco.css · situacion.css · medidas.css · medidas-diseno.css
  app/js/app.js           router (una vista montada a la vez)
  app/js/situacion/       Living Atlas (Sprint 02)
  app/js/medidas/         Explorador (Sprint 03) + lista.js
  app/js/pendiente/       página «aún no rediseñada»
  app/original/           módulos y datos de la web servida (sin tocar)
  _qa/                    pruebas (navegador y integridad.py)
  tools/                  scripts de conversión usados (históricos)
```
