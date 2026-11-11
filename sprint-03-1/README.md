# Vivienda en Bizkaia · Análisis y medidas · aplicación integrada (escritorio)

Una sola aplicación con las **seis vistas** (Situación, Municipios, Acceso, Medidas, Normas y Método) en un mismo marco, con el mismo almacén de datos y el mismo Design System (Astara Intelligence × Liquid Glass). Los textos, datos y cálculos son los de la web publicada; aquí solo cambia cómo se presentan. No sustituye a la web publicada. **Móvil: no se ha trabajado.**

> El nombre de la carpeta (`sprint-03-1`) es el de la ruta ya publicada. No es un sprint nuevo ni un prototipo aparte.

## Abrirla

```bash
python sprint-03-1/servidor.py
```

Después abrir http://localhost:4179/ (o doble clic en `Abrir Sprint 03.1.bat`).

| Dirección | Qué abre |
|---|---|
| `#situacion/alquiler/48020` | Situación (Living Atlas), Alquiler, Bilbao |
| `#municipios`, `#municipios/48020`, `#municipios/48020-48013` | Municipios: ficha y comparación |
| `#acceso` | Acceso: alquiler, escalera, supuestos y alcance |
| `#medidas`, `#medidas?rep=matriz&w=3,2,0,0,1`, `#medidas/M01-M06` | Medidas: explorar, matriz con pesos, comparar |
| `#normas` | Normas: competencias y línea de tiempo |
| `#metodo`, `#metodo/glosario` | Método, glosario y fuentes |

Las direcciones de antes de la web publicada (`#compra`, `#diagnostico`, `#comparar/A-B`, `#ideas`…) se traducen con el mismo `rutas.js` original.

`?limpio` oculta la etiqueta de prototipo; `?abrir=M10` abre la ficha de esa medida (solo para capturas); `?marcar` resalta los textos propuestos que aún no ha aprobado el autor.

## Cómo está hecha

- **Un marco** (`app/index.html`, `css/marco.css`): cabecera, menú, pie.
- **Un router** (`app/js/app.js`): una sola vista montada a la vez; al cambiar se desmonta la anterior y se activa solo la hoja de estilos de la nueva.
- **Un almacén de datos** (`app/js/datos.js`): el `createStore` original, cargado una vez y compartido por las seis vistas.
- **Tipografía y tokens** (`css/typography.css`, `css/tokens.css`): única fuente de familias, colores de interfaz, radios, elevaciones y materiales L0/L1/L2.
- **Contenido original, composición propia**: Municipios, Acceso, Normas y Método dibujan su contenido con los renderizadores originales de la web publicada (`app/original/js`, copiados **byte a byte**); cada vista los monta en una composición propia con `app/js/lectura.js`. Situación y Medidas son los módulos de los sprints anteriores convertidos en `montar()`.
- `app/original/`: módulos y datos de la web publicada (sin tocar; los hashes están en `_qa/original-hashes.json`).

## Pruebas

```bash
python -I sprint-03-1/_qa/integridad.py        # originales idénticos, CSS solo de presentación, tokens
python -B sprint-03-1/_qa/acceso_vs_python.py  # calculo-acceso.js contra las fórmulas del análisis (necesita DATA/ y Node)
```

Las de navegador (`_qa/qa-*.js`: navegación, Situación, equivalencia, flujos, composición, `qa-vistas`, tipografía, contraste y desborde) se ejecutan desde la consola con la app abierta; el servidor local las sirve en `/_qa/`. Resultados y diferencias en `docs/diseno/`.

## Estructura

```text
sprint-03-1/
  app/index.html          marco único (cabecera, menú, pie)
  app/css/                typography · tokens · marco · lectura · una hoja por vista
  app/js/app.js           router (una vista montada a la vez)
  app/js/datos.js         almacén de datos único
  app/js/lectura.js       composición compartida de las vistas de consulta
  app/js/{situacion,medidas,municipios,acceso,normas,metodo}/   una carpeta por vista
  app/original/           módulos y datos de la web publicada (sin tocar)
  _qa/                    pruebas (navegador, integridad.py y acceso_vs_python.py)
```

Design System (materiales, componentes, degradación): `docs/diseno/DESIGN_SYSTEM.md`.
