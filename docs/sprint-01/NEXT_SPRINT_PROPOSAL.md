# NEXT_SPRINT_PROPOSAL · Propuesta para el Sprint 02 (no implementada)

**No se avanza sin revisar los resultados del Sprint 01.** Todo lo siguiente es una propuesta reversible.

## Decisiones previas que necesita el Sprint 02

| # | Decisión | Quién | Efecto |
|---|---|---|---|
| 1 | ¿Se conserva la escena de scroll de la portada (A) o se prueba B? | Autor (`OPEN_QUESTIONS A3`) | Si no hay validación, solo se sigue con A |
| 2 | ¿Se levanta la restricción de «tokens neutrales» para B y se aplica un sistema visual propio de Astara? | Usuario | El usuario ha pedido una pasada de diseño más moderna y aireada con el sistema de `BRAND/EL UNICO Y MEJOR SISTEMA DE DISEÑO`; el documento del sprint exigía tokens neutrales «hasta tener referencias» |
| 3 | ¿Se trabaja sobre el cliente servido (como en A) o se espera al repositorio real? | Usuario | Sin el repositorio fuente, todo es prototipo |

## Opción 1 · Si el autor valida conservar la escena (A)

1. Llevar al repositorio real los 27 cambios de `index.html` y los dos ficheros nuevos, en una rama, con las pruebas de `_qa/` como criterio de aceptación.
2. Probar con rueda de ratón y teclado real el límite de scroll de Lenis (observación de `QA_RESULTS §6`).
3. Medir con lector de pantalla y en dispositivos reales.

## Opción 2 · Si el autor valida B

1. Sustituir en B los dos bloques de demostración por los originales (siete tipos y fotos).
2. Decidir qué pasa con la escena y el 3D de portada (conservarlos como cabecera opcional).
3. Mantener los colores de cada indicador.

## Pasada de diseño (a petición del usuario) · HECHA en B v2 (ver `WIREFRAME_B.md`)

Aplicar el flujo de `impeccable` (`shape` → `typeset` → `layout` → `polish`) a **B**, con más aire y menos peso visual, sin cambiar un solo dato:

- Una escala tipográfica y de espaciado clara, con la tipografía de Astara en lugar de la del sistema.
- Menos bordes y tarjetas; jerarquía por tamaño y espacio.
- Un único momento de movimiento.
- Criterio de aceptación: la línea base (`baseline.mjs`) sigue en 20 de 20 y la QA de cabecera sigue sin desbordes a 1440, 1024, 768, 375 y 320 px.

## No incluido en el Sprint 02

Acceso, Medidas, Normas y Método; estados jurídicos; BM30; parametrizar los límites del 30 % y los 10 años; textos estáticos de Método.
