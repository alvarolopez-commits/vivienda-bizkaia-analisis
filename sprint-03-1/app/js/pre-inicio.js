// Se ejecuta al principio de la carga (script clásico, sin esperar a los módulos): marca la página como «inicio» si la dirección es la raíz
// (vacía, «#» o «#inicio»). Así el hero se pinta desde el primer fotograma y las direcciones directas (#situacion/…, #municipios/…) no lo muestran
// ni un instante. La lógica completa está en inicio.js.
if (/^#?(inicio)?$/.test(location.hash)) document.documentElement.classList.add("con-inicio");
