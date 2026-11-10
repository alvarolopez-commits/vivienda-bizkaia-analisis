# Sprint 01 · Navegación y Situación

Dos propuestas para evaluar la experiencia, sin tocar producción.

## Cómo verlas

**Opción rápida (Windows):** doble clic en `Abrir Sprint 01.bat`. Arranca un servidor local y abre http://localhost:4176/.

**A mano:**
```bash
python -m http.server 4176 --bind 127.0.0.1
```
desde esta carpeta (`sprint-01`) y abre http://localhost:4176/.

La página de inicio compara **A y B juntas** y deja elegir el tamaño (1440, 1024, 768, 375 y 320 px). También se abren por separado:

| Dirección | Qué es |
|---|---|
| http://localhost:4176/ | Comparador A y B, escritorio y móvil |
| http://localhost:4176/preview-a/ | **Opción A**: la web original con navegación nueva |
| http://localhost:4176/preview-b/ | **Opción B**: prototipo «herramienta primero» |

Añade `#marcar` a la dirección de A o B para ver rodeado en naranja lo nuevo, y `?limpio` para ocultar la etiqueta de prototipo. Sin servidor (doble clic en un `index.html`) no cargan los datos.

## Qué es funcional y qué es prototipo

| Pieza | Estado |
|---|---|
| **A**: las seis vistas, Municipios, Acceso (calculadora), Medidas, Normas y Método, el 3D y la escena de portada | **Funcional y original**: es la web publicada ejecutándose en local, sin cambios en sus datos, fórmulas ni textos |
| **A**: cabecera de seis vistas, Resumen y Radar, menú con «Otros productos», barra interna de Situación | **Prototipo funcional** (nuevo) |
| **B**: selector de problema, mapa 2D/3D, ficha, lista de 113, filtro por tipo, cartas | **Prototipo funcional** con datos y lógica originales |
| **B**: cabecera y menú | **Prototipo funcional** (nuevo) |
| **B**: «Siete tipos de municipio» | **Demostración rotulada**, sin contenido |
| **B**: enlaces a Municipios, Acceso, Medidas, Normas, Método, Resumen y Radar | Llevan a la web publicada |

## Comprobar que nada protegido cambió

```bash
node _qa/baseline.mjs
```
Ejecuta 20 comprobaciones (recuentos, la calculadora original, cobertura y que A solo cambia `index.html`). Resultados y límites en `../docs/sprint-01/QA_RESULTS.md`.

## Carpetas

`preview-a/` · `preview-b/` · `_qa/` (pruebas) · `_original-servido/` (copia íntegra de la web, solo local, fuera de git) · documentación en `../docs/sprint-01/`.
