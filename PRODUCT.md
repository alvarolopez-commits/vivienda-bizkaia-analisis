# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

HTML, CSS y JS sin framework (elegido por el usuario el 2026-11-10; es el mismo enfoque que usa hoy la web publicada, que carga GSAP y Lenis desde `/vendor/`). Despliegue previsto como sitio estático; el destino concreto no está decidido.

## Users

- Lector principal (según el PRD local del 21 de octubre de 2026, por confirmar con el autor): la persona que tiene que decidir qué medidas de vivienda proponer en Bizkaia. Necesita las conclusiones primero y poder bajar al detalle solo si quiere.
- Técnicos que preparan esas decisiones y quieren saber qué encaja en cada municipio.
- Cualquier persona que quiera comprobar de dónde sale una cifra.

## Product Purpose

La web «Análisis y medidas» de Vivienda en Bizkaia presenta, con datos oficiales de 2024 y 2025, dónde falla el acceso a la vivienda en los 113 municipios, a quién afecta y qué se puede hacer. Tiene seis vistas: Situación, Municipios, Acceso, Medidas, Normas y Método. Éxito: el lector encuentra la herramienta que necesita, entiende lo que ve y puede interactuar con toda la información original sin perder contexto.

## Positioning

Cada cifra declara si es «Cálculo propio», «Aproximación» o dato oficial y cita sus fuentes; las causas se presentan como hipótesis que dicen en qué dato se apoyan; las 34 medidas se comparan con los mismos criterios. Es una herramienta de análisis e interpretación, no un observatorio de seguimiento (eso es el Radar) ni una presentación de highlights (eso es el Resumen).

## Operating Context

- Forma parte de un ecosistema de tres productos separados: esta web de análisis, el Radar (https://vizcaya-vivienda.vercel.app/) y el Resumen (https://vivienda-bizkaia-presentacion.vercel.app/). Se enlazan entre sí; no se fusionan.
- Autor y responsable de contenido según el PRD local: Ángel. Cualquier cambio editorial requiere su aprobación.
- El repositorio de la web publicada no se ha recibido. Existe una copia local antigua (26 de octubre) en `DCI research vivienda/vizcaya-vivienda-main`, que no corresponde a la web actual.

## Capabilities and Constraints

- Contenido bloqueado: textos, títulos, cifras, fuentes, unidades, fechas y créditos son del autor original. El microcopy de interfaz nuevo se etiqueta para aprobación.
- Lógica bloqueada: fórmulas de calculadoras, filtros, valores por defecto, mapas y comparadores no se modifican.
- Anclas y URLs: se conservan `#situacion`, `#municipios`, `#acceso`, `#medidas`, `#normas`, `#metodo` y `#municipios/<INE>`.
- Sin datos inventados: si un dato falta, se dice «no documentado en origen».
- «BM30» aparece en la web y su significado no está documentado: no se expande.
- Alcance actual: solo escritorio; móvil aplazado por decisión del usuario.
- Sin raya larga en los textos y con lenguaje llano (regla del PRD local).
- Indefinido: marca final y referencias visuales de Astara más allá de lo que ya usa la web; vigencia jurídica de las normas a 2 de noviembre de 2026.

## Brand Commitments

- El usuario quiere el diseño de Astara Intelligence, como el resto de sus productos.
- El usuario designó `D:\Dropbox\MATERIAL ALVARO ASTARA INTELLIGENCE\BRAND\EL UNICO Y MEJOR SISTEMA DE DISEÑO` como el sistema de diseño a usar (herramientas impeccable y taste-skill). Decidió explícitamente no usar `BRAND\DCI DESIGN SYSTEM` para esta versión.
- No se atribuye autoría a Astara ni se modifican créditos originales.

## Evidence on Hand

- Web publicada: https://vizcaya-vivienda-analisis.vercel.app/
- Auditoría de la web publicada (verificada sobre el código servido): `docs/audit/` (solo local).
- Brief de arquitectura: `01_WEB_INTERACTIVA_ARCHITECTURE_v0_2.md` (en Descargas).
- Repositorio real de la web: `DATA/vizcaya-vivienda-main/` (solo local; `web-analisis/` es idéntico a lo publicado).
- Ausencias que no se deben inventar: definición de BM30 y decisiones editoriales del autor.

## Product Principles

1. El contenido original manda: la interfaz lo ordena, nunca lo reescribe.
2. Cada cifra conserva su procedencia y su etiqueta a la vista.
3. El lector llega a la herramienta que busca sin recorrer páginas de scroll.
4. Lo nuevo se marca como nuevo y espera aprobación; lo observado se distingue de lo verificado.

## Accessibility & Inclusion

Objetivo WCAG 2.2 AA según el brief: contraste, teclado completo con foco visible, no depender solo del color, respetar `prefers-reduced-motion`.
