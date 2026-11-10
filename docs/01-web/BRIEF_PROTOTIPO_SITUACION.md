# BRIEF · Prototipo de Situación (escritorio)

**Estado:** propuesta pendiente de aprobación. No se construye nada hasta que el usuario la apruebe.
**Etiquetas:** `DECIDIDO` (lo dijo el usuario) · `MI_CRITERIO` (lo decido yo, revisable) · `PENDIENTE`.

## 1. Qué se construye y para qué
Un **prototipo navegable de la vista Situación** de «Análisis y medidas», solo escritorio, que demuestra la Alternativa B con «El mapa» fusionado y la lista de los 113 sincronizada. Sirve para que el usuario y el autor vean la mejora de jerarquía y navegación con el sistema de diseño elegido. **No sustituye a la web publicada y no es la migración fiel** (esa exige el repo). `DECIDIDO`

## 2. Objetivos
- Las cinco problemáticas a la vista a la vez, con su mapa al lado.
- Un único selector de problema que gobierna mapa, ficha rápida y lista de 113.
- Las seis vistas visibles en la cabecera; Radar y Resumen como enlaces externos separados.
- Acceso temprano a Municipios, Acceso, Medidas y Normas.
- Textos y cifras literales de la web publicada. `DECIDIDO`

## 3. No objetivos y antiobjetivos
- No se tocan las otras cinco vistas (solo enlaces de cabecera que apuntan a la web publicada).
- No móvil. `DECIDIDO`
- No se rehacen ni se inventan datos, cálculos, mapas de otros temas ni capas: ver §6.
- No se publica ni se despliega.
- **Fallo aunque funcione:** que el prototipo se lea como producto final, o que algún texto o cifra difiera del original.

## 4. Decisiones ya tomadas
- Alternativa B: cinco problemas junto al mapa, se retira el scroll anclado de 3.072 px. `DECIDIDO`
- Fusión de «El mapa» con ese bloque; las cinco pestañas de tema las sustituye la lista. `DECIDIDO`
- Lista «Los 113 municipios» sincronizada; sus pestañas propias desaparecen como control. `DECIDIDO`
- Stack: HTML, CSS y JS sin framework. `DECIDIDO`
- Sistema de diseño: la carpeta `BRAND\EL UNICO Y MEJOR SISTEMA DE DISEÑO` (impeccable, taste-skill), no DCI. `DECIDIDO`

## 5. Identidad visual
- **Mi lectura (`MI_CRITERIO`):** como no existen tokens de Astara dentro de esa carpeta, el mundo visual es el que ya tiene la web publicada, que impeccable trata como identidad establecida (se hereda, no se reinventa): azul noche #221e41, azul #1a4d7a, celeste #8bcdff, rosa y gris azulado, con Montserrat y Playfair Display para cifras. Esos colores coinciden con los de DCI, lo que apunta a que ya es Astara. No está verificado en código.
- Impeccable lista Playfair Display entre las tipografías «por defecto»; la mantengo solo porque es la actual y es lo que el autor reconoce. `MI_CRITERIO`
- El trabajo de impeccable aporta el **proceso** (brief, suelo de calidad, detector de defectos), no una identidad nueva.
- Modo de superficie: **Operate** (el lector explora y consulta). `MI_CRITERIO`

## 6. Contenido y datos del prototipo
- **Literales** copiados de la web publicada (título, entradilla, cinco problemas, «Cada municipio, con su dato», ficha rápida, nota de fuente, filtros, filas de la lista).
- **Datos del mapa y de las listas:** el prototipo necesita valores por municipio. Dos opciones: (a) extraerlos de la web publicada, que expone sus datos en el cliente; (b) limitarse a un subconjunto real, por ejemplo los 35 municipios con dato de alquiler que la web ya muestra. Prefiero **(a)**, siempre trazados y sin modificar. `PENDIENTE`: confirmar que está permitido reutilizar esos ficheros de datos para un prototipo interno.
- Si falta algún valor, se muestra «no documentado en origen», nunca un cero.
- Cualquier dato de relleno llevaría la etiqueta «DEMO, NO REAL» y no pasa de desarrollo.

## 7. Interacción
- Elegir problema (lista de 5): cambia capa del mapa, ficha rápida y lista de 113, en un solo estado.
- Tocar un municipio en el mapa o elegirlo en «Otro municipio»: actualiza la ficha rápida y resalta su fila.
- Conmutador 2D/3D del mapa; filtros por tipo de municipio; «Ficha →» y «Ver su ficha →» llevan a `#municipios/<INE>` de la web publicada.
- Teclado completo con foco visible; `prefers-reduced-motion` respetado.

## 8. Entregables
- Carpeta `prototipo-situacion/` (HTML, CSS, JS, datos) dentro de este proyecto.
- `docs/01-web/PROTOTIPO_NOTAS.md`: qué es literal, qué es nuevo, qué falta del repo.
- Pasada de verificación: capturas a 1280 px y detector de impeccable; diferencias con el original listadas.

## 9. Lo que queda al constructor
Estructura interna de ficheros, formas de dibujar el mapa 2D/3D (reutilizando la geometría publicada o una simplificada), detalles de espaciado y movimiento, siempre dentro de §3 y §5.

## 10. Riesgos conocidos
- Retirar el scroll anclado puede no gustar al autor: validación editorial pendiente.
- Sin el repo no se confirman fórmulas ni la lógica de capas; el prototipo reproduce lo visible.
- El mapa 3D puede ser costoso de replicar: puedo empezar con 2D y dejar 3D como segundo paso. `MI_CRITERIO`
