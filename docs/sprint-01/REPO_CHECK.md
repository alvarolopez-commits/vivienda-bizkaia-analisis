# REPO_CHECK · Paso 0 del Sprint 01

**Fecha:** 2026-11-10 · Todo `VERIFICADO` con comandos ejecutados salvo indicación.

## Qué repositorio hay montado

| Dato | Valor |
|---|---|
| Carpeta | `D:\Dropbox\MATERIAL ALVARO ASTARA INTELLIGENCE\2026\RESEARCH\13 VIVIENDA EN BIZKAIA` |
| Remoto | `https://github.com/alvarolopez-commits/vivienda-bizkaia-analisis` (privado) |
| Naturaleza | **Repositorio de rediseño y prototipo, no el fuente del producto publicado** (coincide con `docs/audit/REPO_OVERVIEW.md §0`) |
| Commit base | `398f251` en `main` («Prototipo de Situación en estilo dashboard PCI, con auditoría y notas») |
| Rama de trabajo | `ux/sprint-01-nav-situacion`, creada en local desde `main`. **Sin commits ni push.** El usuario pidió no incorporar aún `docs/audit/` |
| Estado del árbol | Modificados: `.claude/launch.json`, `.gitignore`. Sin seguimiento: `docs/audit/`, `docs/sprint-01/`, `docs/REGRESSION_BASELINE.md`, `sprint-01/` |

## Qué código existe realmente

| Elemento | Existe | Dónde |
|---|---|---|
| Código fuente de la aplicación (pipeline, `analysis/`) | **No** | — |
| Código cliente de la aplicación tal como la sirve la web | **Sí, como copia** | `sprint-01/preview-a/` (66 ficheros; sha256 en `sprint-01/_qa/original-hashes.json`) |
| Prototipo de Situación en estilo PCI (sprint anterior) | Sí | `prototipo-situacion/` |
| Tests originales (`tests/test_calculo_acceso.py`, `tests/test_rutas.py`…) | **No** | El código los cita; no están |
| `package.json`, `vercel.json`, historial de producción | **No** | — |
| Copia antigua de octubre | Fuera del repo | `DCI research vivienda/vizcaya-vivienda-main` (no corresponde a la web publicada) |

## Herramientas disponibles para pruebas

Node v24.14.0 y Python 3.14.6; navegador integrado con emulación de ancho. No hay pruebas automatizadas en el repo: las de este sprint se escribieron en `sprint-01/_qa/`.

## Conclusión

Se trabaja **en el repositorio de rediseño**, en la rama aislada, sin fingir una migración: la opción A es una copia local del cliente servido con cambios mínimos y la opción B es un prototipo propio. No se ha tocado producción ni se ha desplegado nada.
