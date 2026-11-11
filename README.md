# Vivienda en Bizkaia · Análisis y medidas (rediseño)

Rediseño de la web interactiva [vizcaya-vivienda-analisis.vercel.app](https://vizcaya-vivienda-analisis.vercel.app/) en el lenguaje visual de Astara Intelligence (Design System inspirado en Liquid Glass). Los textos, datos y cálculos son los de la web publicada; este repositorio solo cambia cómo se presentan. No sustituye a la web publicada. Solo escritorio.

## Estructura

| Carpeta | Qué hay |
|---|---|
| `sprint-03-1/` | **La aplicación integrada** (el nombre es el de la ruta publicada; no hay más prototipos). Ver `sprint-03-1/README.md` |
| `docs/diseno/` | Design System (`DESIGN_SYSTEM.md`) e informe de la intervención en curso |
| `docs/continuidad/` | Informes de tipografía y de la composición de Medidas, con las capturas finales |
| `docs/audit/` | Auditoría de la web publicada (solo local, no se sube) |
| `DATA/` | Repositorio real de la web publicada (solo local, no se sube). `web-analisis/` es idéntico a lo que sirve Vercel |
| `PRODUCT.md` | Contexto del producto |

El historial de git conserva los prototipos anteriores (Sprint 01, 02 y 03); ya no están en el árbol de trabajo.

## Verlo en local

```bash
python sprint-03-1/servidor.py
```

Abre http://localhost:4179/ (o doble clic en `sprint-03-1/Abrir Sprint 03.1.bat`).

## Comprobaciones

```bash
python -I sprint-03-1/_qa/integridad.py
```

Las pruebas de navegador (`sprint-03-1/_qa/*.js`) se ejecutan con la app abierta; ver `sprint-03-1/README.md`.
