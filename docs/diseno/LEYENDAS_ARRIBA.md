# Leyendas arriba del gráfico

Cambio pedido por el autor: las leyendas van **encima** de los mapas, no debajo, y el control de zoom (− +, Restablecer) pasa **debajo**.

- **Situación:** la leyenda (rampa de color, «Sin dato» y cobertura) está ahora dentro de la cabecera del lienzo, bajo el título del indicador y encima del mapa (`js/situacion/plantilla.html`, `css/situacion.css`). El lienzo pasa a columna: cabecera (título + leyenda) y, debajo, el mapa, que ocupa el resto. Los controles −/+/Restablecer van abajo a la derecha, sin tapar el mapa (el mapa deja 84 px libres por debajo).
- **Medidas, Plano:** la leyenda de las líneas de actuación va encima del Plano (`css/medidas-diseno.css`, solo CSS).
- Los mapas de barrios (Municipios) y de las fichas no llevan leyenda propia, por lo que no cambian.

Sin cambios en datos, textos, cálculos ni en el código original. `_qa/integridad.py` admite estos cambios de maquetación por selector, documentados. A cambio el mapa de Situación pierde unos 30 px de alto (la leyenda ocupa arriba lo que antes ocupaba abajo).

Pruebas a 1440×900: Situación 101/101, contraste 31/31, desborde 12/12, movimiento 27/27, equivalencia 30/30, flujos 74/74, diseños 33/33, integridad 21/21. A 1280, los cinco problemas sin solapes ni scroll horizontal.
