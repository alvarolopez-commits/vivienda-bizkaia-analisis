# TO_BE_SITEMAP — propuesta (`PROPUESTA_UX`)

Seis vistas, sin séptimo módulo. Etiquetas, orden y URLs son los observados; no se renombra nada.

```text
ANÁLISIS Y MEDIDAS · WEB INTERACTIVA
│  Cabecera: marca · Situación | Municipios | Acceso | Medidas | Normas | Método   · [Radar] [Resumen] (externos, aparte)
│
├── #situacion   Portada + bloque único «Cada municipio, con su dato»: cinco problemas · mapa · ficha rápida
│                (Alternativa B con «El mapa» fusionado; decidido; ver UX_AUDIT §3)
│                + lista «Los 113 municipios, de más a menos» sincronizada con el problema elegido
├── #municipios  Selector + ficha (#municipios/<INE>) + comparar            — 113 fichas
├── #acceso      Escalera · Prueba tus supuestos · Mapa «¿Hasta dónde llega mi hogar?»
├── #medidas     Explorar (burbujas, tabla) → Matriz M01–M34 → Comparar
├── #normas      Matriz 15 × 4 niveles · Cronología
└── #metodo      Cómo se ha hecho · Palabras clave · Fuentes
```

**Cambios respecto a la web actual (todos de presentación):**
1. Las seis vistas visibles en la cabecera en escritorio (hoy detrás de «Menú»); Método incluido.
2. Radar y Resumen separados visualmente de las vistas, con el mismo tratamiento.
3. Entrada a las herramientas desde el inicio de Situación (hoy a 7.244 px).
4. Medidas con pasos Explorar → Matriz → Comparar y filtros activos visibles.

**Alcance:** solo escritorio; móvil aplazado por decisión del usuario (2026-11-10).

**No cambia:** anclas, `#municipios/<INE>`, contenidos, fórmulas, IDs M01–M34, textos, datos.
**Excepción aceptada:** con la alternativa B de Situación, la escena anclada de la portada deja de existir como tal (pendiente de validación editorial).
