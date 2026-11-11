// Metodo y fuentes: palabras clave, como se hace cada calculo, sus limites, las fuentes y la revision de los datos.
import { glossary } from "./glosario.js";
import { el, es, extLink, pill } from "./ui.js";

const REVIEW = [
  ["Ingresos por edad", "Eustat da los hogares de cada edad por franjas de ingresos calculadas para todo el País Vasco, y por error se estaban usando las franjas de Bizkaia. Corregido: los ingresos medios de cada edad suben entre 500 y 1.100 € al año."],
  ["Viviendas turísticas inscritas", "En el registro del Gobierno Vasco hay 2.688, no 2.687: dos viviendas sin número de registro eran dos pisos distintos y se contaban como uno. (El INE, que cuenta anuncios en internet, da otra cifra.)"],
  ["Caída de los contratos de alquiler", "Los datos de 2025 no están completos. Ahora una caída fuerte solo cuenta si aparece también entre 2022 y 2024: solo se mantiene en Sestao."],
  ["Limitar las viviendas turísticas en el plan general", "La medida puntuaba alto en ciudades con muy pocas viviendas turísticas, solo porque se habían inscrito muchas en poco tiempo. Ahora solo cuenta donde el INE mide de verdad una concentración."],
  ["Parte de los ingresos que se va en el alquiler", "Ahora se usan el alquiler y los ingresos del mismo año, 2024. Leioa y Urduliz, que estaban justo en el límite, dejan de marcar «alquiler caro»."],
  ["Textos de las fichas de medidas", "Ocho textos puestos al día con el BOE y el BOPV: el índice de referencia del alquiler rige desde el 21/04/2026; Basauri es zona tensionada (BOE de 29/07/2026); Gaztelagun es de 18 a 35 años; las 7.000 viviendas son un objetivo del Plan Integral, no del decreto; el aval tiene un precio máximo de 340.000 €; Bilbao prevé cobrar el canon de vivienda deshabitada en 2027; el dato de Gipuzkoa es de un solo trimestre, y no se sabe en qué unidad está la cifra de Bilbao para las viviendas turísticas."],
  ["Orden de una lista", "Una lista cambiaba de orden cada vez que se hacía el cálculo; ya no."],
];

const CHANGES_25 = [
  ["Cada municipio tiene su plan.", "Antes la propuesta se resumía por tipo de municipio y casi todas las medidas salían con «hace falta en el 100 %». Ahora cada uno de los 113 tiene su plan de medidas prioritarias, con las cifras que lo justifican, quién aplicaría cada medida y dónde."],
  ["El tipo ya no decide las medidas.", "Las condiciones de algunas medidas (solo en pueblos, no en municipios turísticos) se miraban con el tipo. Ahora se miran con los datos del propio municipio."],
  ["24 pueblos pequeños estaban mal agrupados.", "La regla de «municipios en crecimiento» iba antes que la del tamaño, y en un pueblo de 300 habitantes 30 viviendas nuevas ya son un 10 % más. Entraban incluso pueblos que pierden población. Ahora esa regla pide al menos 3.000 habitantes y, si solo crecen las viviendas, que no baje la población. Por eso, por ejemplo, Errigoiti recibía medidas pensadas para ciudades (el programa de vivienda vacía Bizigune o la oficina de barrio) y no las de los pueblos."],
  ["El esfuerzo del alquiler se medía con ingresos demasiado altos.", "Se usaba la renta media de todas las familias, también las propietarias, y el punto medio entre antes y después de impuestos. Así parecía que en ningún municipio el alquiler pasaba del 30 % de los ingresos. Ahora se usa lo que gana cada tramo de hogares después de impuestos: un hogar de ingresos bajos pasa del 30 % en casi todos los municipios con dato. «Alquiler caro» se marca ahora con el hogar de ingresos bajos (que es quien más alquila) frente al resto de municipios, o con el de ingresos medios si pasa del 30 %."],
  ["La demanda se mide con hogares.", "«La población crece más que las viviendas» comparaba habitantes con viviendas, sin contar que cada vez vive menos gente en cada casa, y con periodos distintos. Ahora compara hogares con viviendas entre 2014 y 2024."],
  ["Barrios que cambian mucho.", (store) => { const j = store.meta.secciones_poblacion_cambia; return `Si la población de un barrio cambia más de un ${es(j.limite)} % entre 2019 y 2024, no se compara su renta de esos dos años para la señal de expulsión: puede que no sea la misma gente o que hayan cambiado sus límites. Pasa en ${es(j.total)} barrios de Bizkaia (${es(j.bilbao)} de ellos en Bilbao).`; }],
  ["Diseño.", "Colores de los tipos que se distinguen también con daltonismo, leyendas alineadas y tarjetas que ya no se quedan en blanco al bajar deprisa."],
];

const CHANGES_NOV = [
  ["Dos webs con una función cada una.", "Esta web sirve para decidir (análisis y medidas) y el radar, la otra web, para vigilar. Pasan al radar las alertas de Prevención, las peticiones de datos y Trabajadores 2035 (ahora «Horizonte 2035»). Las direcciones de antes llevan a su sitio nuevo."],
  ["Resumen ejecutivo.", "Las 9 conclusiones se agrupan en 5 problemas, cada uno con su evidencia, sus causas probables escritas como hipótesis, a quién afecta, sus líneas de actuación y qué vigilar. La tarjeta destacada es ahora la idea central."],
  ["Siete medidas nuevas.", "Ceder suelo público a empresas o cooperativas para alquiler asequible (M28), que la vivienda protegida de venta vuelva a ser rentable para las empresas (M29), licencias más rápidas (M30), vivienda para trabajadores con las empresas (M31) y crecer donde hay transporte y empleo (M32). La deducción del IRPF por compra (M33) y la rebaja del impuesto de transmisiones (M34) se evalúan con los mismos criterios, pero no se proponen. Cambian los planes de 10 municipios."],
  ["Evidencia de M10.", "Pasa de «media-alta» a «alta»: hay evaluaciones de impacto en Auckland, en ciudades de Estados Unidos y en Helsinki."],
  ["Matriz de medidas.", "Cada medida con los mismos criterios, más quién decide, el papel que podría tener BM30 (propuesta, por validar), a quién beneficia, quién paga y la magnitud documentada."],
  ["Oferta en cada municipio.", "Lo que permiten construir los planes municipales y el ritmo de construcción de la última década, en la ficha y en el mapa."],
  ["Ideas.", "Las ideas estudiadas pasan a Medidas, como «alternativas estudiadas». Cuatro se han convertido en medidas y hay una nueva: la hipoteca inversa."],
];

const CHANGES_27 = [
  ["Dos decretos estatales de octubre de 2026.", "El BOE del 7/10/2026 publicó los Reales Decretos-ley 28/2026 (contratos de alquiler de 5 años con indemnización si el dueño no renueva, desde el 15/11/2026) y 29/2026 (reglas para el alquiler de temporada y por habitaciones, subidas limitadas al 2 % en zona tensionada hasta 2027, préstamo estatal «TU CASA» para la entrada, nuevos recargos del IBI de la ley estatal). Las fichas M01, M02, M12, M15, M16, M19, M21, M24 y M26 y el glosario lo recogen. Ningún cálculo cambia. (El 29/2026 sustituye al Real Decreto-ley 26/2026, de 29 de septiembre, que el Congreso no convalidó.)"],
  ["Los dos decretos, pendientes de convalidar.", "A 2/11/2026 ninguno de los dos estaba convalidado: con las Cortes disueltas, lo tiene que hacer la Diputación Permanente del Congreso en los 30 días siguientes a su publicación. El 29/2026 se aplica desde el 8/10/2026 y el 28/2026 solo entraría en vigor el 15/11/2026 si se convalida; si no, decaen. Las fichas y el glosario lo dicen así desde el 2/11/2026, en vez de darlos por hechos."],
  ["La medida M15 ya se puede aplicar.", "Controlar la temporada y las habitaciones necesitaba una ley estatal, y ahora existe. Su viabilidad pasa a «se puede aplicar ya» y su estado por municipio, de «hace falta una norma nueva» a «no consta». Solo cambia el plan de Gernika-Lumo, donde M15 entra entre las prioritarias y el seguro contra impagos (M24, ya en uso en toda Bizkaia) pasa a «otras que encajan»."],
  ["El IBI de Bizkaia es foral.", "Los recargos del IBI que sube la ley estatal (hasta el 100 % en vacías y el 150 % en turísticas de zonas tensionadas) no se aplican en Bizkaia hasta que las Juntas Generales los adopten. Las fichas M21 y M26 lo avisan."],
  ["Erandio, en trámite.", "Pidió ser zona tensionada y el Gobierno Vasco lo tramita (prensa, septiembre de 2026): sale como «en preparación» y «por confirmar» en la tabla «¿Ya se aplica?»."],
  ["Alokaplus, sin orden publicada.", "La ficha M24 ya no da por hecha su entrada en vigor en noviembre: a 27/10/2026 su orden no estaba en el BOPV."],
  ["Comprobado el 27/10/2026.", "BOE (resolución trimestral de zonas tensionadas: Sopela y Urduliz siguen pendientes), BOPV y las fuentes de las fichas."],
];

const LIMITS = (store) => {
  const munis = Object.values(store.municipios);
  const reg = munis.filter((m) => m.compra.fuente_precio === "Registradores").length;
  const est = munis.filter((m) => m.compra.fuente_precio?.startsWith("Estim")).length;
  return [
    ["No hay precio de compra en todo Bizkaia.", `Los Registradores publican el precio de ${reg} municipios, Bilbao incluido, y de los ${store.acceso.bilbao_barrios.length} barrios de Bilbao. En otros ${est} se estima con el valor de tasación. En el resto, sobre todo pueblos, solo se puede decir qué precio podría pagar cada hogar según sus ingresos.`],
    ["Los ingresos llegan a 2024 y los precios, a 2025.", "Es lo último que se ha publicado. Si los ingresos han subido desde 2024, el esfuerzo real es algo menor que el calculado."],
    ["Los impuestos se descuentan igual a todos los hogares de un municipio.", "Se usa la proporción media entre ingresos antes y después de impuestos. Los hogares de ingresos bajos pagan algo menos de lo que se descuenta y los de ingresos altos, algo más."],
    ["El riesgo de pobreza se mide con el umbral de España.", "El INE lo calcula con lo que gana el hogar del medio de España, que gana menos que el del País Vasco. Con un umbral vasco saldría más alto; para comparar municipios entre sí sirve igual."],
    ["Un barrio de esta web es una sección censal.", `Es la zona más pequeña con estadísticas y no siempre coincide con un barrio con nombre: la mitad tiene ${es(store.meta.secciones_mediana_viviendas)} viviendas o menos. El INE cuenta las viviendas turísticas con las secciones de 2021 y Eustat las viviendas con las de 2024; ${store.prevencion.secciones_a_revisar_por_seccionado.length} secciones han cambiado de límites entre una fecha y otra y se marcan para revisar.`],
    ["Las viviendas turísticas del INE son anuncios.", "El INE las cuenta en las plataformas de internet; no es el registro oficial. Por eso se dan las dos cifras."],
    ["No se publican por municipio los datos de grandes propietarios ni de alquiler de temporada.", "Los pedimos al Gobierno Vasco: las peticiones y su estado están en el radar. Sin ellos, las medidas sobre esos temas se valoran con menos información."],
    ["El impacto de cada medida en Bizkaia casi nunca se conoce.", "Por eso la matriz no lleva una nota: enseña cada criterio por separado y la magnitud solo donde una evaluación o un programa la ha medido."],
    ["La propuesta de medidas es para discutir.", "Los límites (desde qué parte de la población se propone una medida, qué evidencia cuenta como probada) son criterios nuestros, explícitos y discutibles. Si se cambian, cambia la propuesta: por eso se enseñan todas sus partes."],
    ["En los pueblos falta el precio de compra.", "Por eso las medidas para comprar salen allí como «a valorar si se confirma el problema»: no es que no hagan falta, es que no se puede saber. El precio orientativo de su área funcional se enseña, pero no cuenta."],
    ["El alquiler de los pueblos es aproximado.", "Se mide con la media de los municipios pequeños de su comarca, la misma para todos ellos. Un pueblo concreto puede estar por encima o por debajo."],
  ];
};

function block(title, nodes, id) {
  return el("section", { class: "method-block", id }, [el("h2", { text: title }), ...nodes]);
}

function sourcesList(store) {
  return el("div", { class: "sources" }, Object.values(store.fuentes).map((f) => el("div", { class: "source" }, [
    el("h3", { text: f.nombre }), extLink(f.url, f.url.replace(/^https:\/\/(www\.)?/, "").split("/")[0]),
  ])));
}

export function renderMetodo(root, store) {
  const s = store.acceso.supuestos;
  const p = store.meta.problemas;
  root.replaceChildren(el("div", { class: "method-wrap" }, [
    el("header", { class: "vista-cab" }, [el("h1", { text: "Cómo se ha hecho" }),
      el("p", { class: "sub", text: "Con datos oficiales descargados de sus fuentes y programas que se pueden volver a ejecutar para comprobar el resultado." })]),
    block("Palabras clave", [
      el("p", { text: "Todas las palabras técnicas, siglas y organismos que aparecen en la web, explicados." }),
      el("dl", { class: "glossary" }, glossary(store).flatMap(([t, d]) => [el("dt", { text: t }), el("dd", { text: d })])),
    ], "glosario"),
    block("Las etiquetas de cada cifra", [el("div", { class: "method-list" }, [
      el("div", { class: "method-item" }, [el("h3", {}, [pill("oficial")]), el("p", { text: "Cifra publicada tal cual por un organismo público." })]),
      el("div", { class: "method-item" }, [el("h3", {}, [pill("calculo")]), el("p", { text: "Una cuenta nuestra con datos oficiales: un porcentaje, una comparación o un límite." })]),
      el("div", { class: "method-item" }, [el("h3", {}, [pill("aproximacion")]), el("p", { text: "Una estimación con supuestos que se explican, cuando el dato exacto no se publica." })]),
    ])]),
    block("Tipos de municipio", [el("p", { text: "Los tipos sirven para resumir el diagnóstico, no para decidir medidas. Si un municipio cumple las condiciones de dos tipos, se queda en el que aparece antes en esta lista. Probamos también a que un programa agrupara los municipios solo con números (12 datos de cada uno): salían grupos peores y más difíciles de explicar." }),
      el("ul", { class: "limitations" }, store.typeKeys.map((k) => el("li", {}, [el("strong", { text: `${store.typeName(k)}. ` }), store.meta.reglas_tipos[k]])))]),
    block("Problemas", [el("p", { text: "Cuándo se dice que un municipio o un barrio tiene cada problema. Casi siempre se compara con el conjunto de Bizkaia." }),
      el("ul", { class: "limitations" }, Object.keys(p).map((k) => el("li", {}, [el("strong", { text: `${p[k].nombre}. ` }), p[k].regla])))]),
    block("Comprar una vivienda", [el("p", { text: `Precio que puede pagar un hogar: el de una vivienda cuya hipoteca (el banco presta el ${es(100 * s.financiacion)} % del precio, a ${s.plazos.join(" o ")} años, al ${es(s.tipo_hipoteca.media, 2)} % de interés) tenga una cuota que no pase del ${es(100 * s.tope_esfuerzo)} % de sus ingresos después de impuestos. Años ahorrando la entrada: la entrada es del ${es(100 * s.entrada[0])} al ${es(100 * s.entrada[1])} % del precio, y el hogar ahorra cada año del ${es(100 * s.ahorro[0])} al ${es(100 * s.ahorro[1])} % de sus ingresos después de impuestos. Los ingresos después de impuestos se calculan con la proporción entre ingresos antes y después de impuestos que publica Eustat para cada municipio.` })]),
    block("Cómo se comparan las medidas", [
      el("p", { text: "La matriz pone todas las medidas con los mismos criterios, cada uno por separado: evidencia (con la escala de abajo), magnitud documentada, si se puede aplicar ya, plazo, coste público, población de los municipios donde se propone, quién decide, papel de BM30, a quién beneficia y quién paga. No hay una nota que lo sume todo, porque el impacto de cada medida en Bizkaia casi nunca se conoce y una nota daría una precisión que no existe." }),
      el("p", { text: "Si el lector da peso a algunos criterios, la matriz se ordena así: cada criterio se pasa a una escala de 0 a 1 (por ejemplo, evidencia alta 1 y baja 0; coste bajo 1 y alto 0; la población, frente a la de la medida que más tiene) y se hace la media con los pesos elegidos. El orden refleja esas prioridades, no el impacto." }),
      el("p", { text: "Evidencia, de alta a baja. Alta: evaluaciones de impacto en varios sitios. Media-alta: una evaluación de impacto, o resultados medidos y coherentes en varios sitios. Media: resultados medidos sin evaluación de impacto. Media-baja: aplicada, pero sin resultados medidos o con resultados mixtos. Baja: sin un caso aplicado (todas las ideas propias), o con evaluaciones que no encuentran efecto." }),
    ]),
    block("Cómo se proponen las medidas", [
      el("p", { text: "Las medidas se proponen municipio a municipio y barrio a barrio, nunca por tipo de municipio. Para cada medida y cada municipio se responden dos preguntas por separado. ¿Hace falta aquí? Hace falta si el municipio tiene alguno de los problemas que ataca; si el problema está solo en algunos barrios, cuenta la parte de las viviendas que hay en ellos. ¿Ha funcionado en otros sitios? Es la evidencia, de alta a baja." }),
      el("p", { text: `Se propone una medida cuando hace falta en al menos el ${store.medidas.necesidad_minima} % del municipio. Va a «probadas» si su evidencia es ${store.medidas.evidencia_probada.map((e) => e.toLowerCase()).join(", ")}; si no, a «para probar con un piloto». Si solo haría falta por un problema que no se puede comprobar porque faltan datos (precio de compra o contratos de alquiler), va a «a valorar si se confirma el problema», y la web enseña las 3 primeras de ese grupo.` }),
      el("p", { text: `El plan de cada municipio tiene hasta ${store.medidas.plan_maximo} medidas: primero las probadas y después las de piloto. Dentro de cada grupo se ordenan por prioridad: cuánto hace falta, por cuánto se pasa el municipio del límite en su problema más intenso (justo en el límite cuenta 1; el doble, 2; como mucho 3), si ha funcionado en otros sitios, si se puede aplicar ya y cuánto tarda y cuesta. Así, dos municipios con los mismos problemas pero cifras distintas pueden tener otro orden.` }),
      el("p", { text: "Algunas medidas solo tienen sentido en ciertos municipios. Esas condiciones se miran con los datos del propio municipio, con estos perfiles:" }),
      el("ul", { class: "limitations" }, Object.entries(store.meta.reglas_perfiles).map(([k, t]) => el("li", {}, [el("strong", { text: `${store.meta.perfiles[k]}. ` }), t]))),
      el("p", { text: "En los barrios solo se proponen las medidas que se pueden aplicar a esa escala: rehabilitación, viviendas vacías, viviendas turísticas, vigilancia de expulsión, desahucios y ayudas al alquiler. Las medidas de prevención miran también señales de riesgo: barrios con riesgo de expulsión y municipios donde el desvío del alquiler solo aparece con el dato provisional." }),
    ]),
    block("Si cada medida ya se aplica (27/10/2026)", [
      el("p", { text: `Revisamos municipio a municipio si cada medida ya se aplica: la web del ayuntamiento (sus normas de impuestos y de vivienda), el Boletín Oficial de Bizkaia, el del País Vasco y la prensa. Se hizo en dos vueltas por comarcas y se cerró el ${store.medidas.estado.comprobado_el}. Cada casilla que dice que algo se aplica lleva su enlace; las que solo salen en prensa se marcan «por confirmar».` }),
      el("ul", { class: "limitations" }, Object.entries(store.medidas.estado.estados).map(([k, t]) => el("li", {}, [el("strong", { text: `${t}. ` }), {
        en_uso: "Se aplica en todo el municipio.", parcial: "Solo en una zona del municipio o para una parte de los casos.",
        en_preparacion: "Aprobada, pedida o anunciada con fecha, pero todavía no se aplica.",
        sin_uso: "La ley lo permite y hay una prueba de que ese ayuntamiento no lo hace (por ejemplo, su ordenanza del IBI vigente no tiene recargo).",
        no_consta: "No lo hemos encontrado. Es lo que sale por defecto: nunca se pone «no se usa» sin prueba.",
        nueva_norma: "Hoy no se puede aplicar en ningún municipio de Bizkaia sin una norma nueva.",
      }[k]]))),
      el("p", { text: "Las medidas del Gobierno Vasco (ayudas al alquiler, Bizigune, avales, vivienda protegida, el seguro contra impagos…) son iguales en todos los municipios y se marcan «en toda Bizkaia». La zona tensionada sale de la lista oficial del Gobierno Vasco y del BOE. En el plan de cada municipio, el estado cambia lo que se propone hacer: mantener lo que ya funciona, ampliar lo que se aplica en parte, activar lo que no se aplica o pedir la norma que falta. Un «hueco» es una medida del plan que no se aplica." }),
      el("p", {}, ["Con esta revisión cambian cuatro cosas del catálogo: hay cuatro medidas nuevas (el seguro contra impagos, la rebaja del IBI a quien cede su vivienda a Bizigune, el impuesto a las estancias turísticas y convertir lonjas en viviendas); el canon de vivienda deshabitada incluye el alquiler forzoso; y la compra pública de edificios, la rehabilitación de viviendas vacías en los pueblos y el alquiler de edificios municipales vacíos pasan a «se puede aplicar ya», porque ya hay ayuntamientos de Bizkaia que lo hacen. Por eso cambia el plan de 49 municipios. Las ideas que estudiamos y no proponemos están en ", el("a", { href: "#medidas/alternativas", text: "alternativas estudiadas" }), "."]),
    ]),
    block("Trabajadores 2035", [
      el("p", { text: "Estima cuántos trabajadores de fuera necesitará Bizkaia hasta 2035 y en qué municipios podrían vivir. Desde noviembre de 2026 está en el radar, pero su resultado sirve aquí para el resumen y para las medidas de la línea «más vivienda». Los supuestos (tres escenarios, personas por trabajador, trabajador tipo, umbrales de minutos y escalas de los ejes) están en un archivo aparte con su fuente y se explican en la propia pestaña. Los tiempos de viaje se calculan con horarios reales de Moveuskadi y el mapa de OpenStreetMap, con un programa de planificación de transporte (R5, de Conveyal)." }),
      el("ul", { class: "limitations" }, [
        ["Es un rango, no una previsión.", "El mínimo es el saldo migratorio que prevé Eustat y el máximo, el déficit de trabajadores que calcula Confebask (cifra de prensa; no tenemos el informe)."],
        ["Los tiempos son con los horarios de hoy.", "No están la línea 5 del metro ni ninguna obra prevista para 2035."],
        ["Un solo punto de salida por municipio.", "Es la media de sus barrios ponderada por viviendas. Donde la estación queda lejos de ese punto (Gernika, Busturia) el transporte público sale peor de lo real; el coche va sin tráfico."],
        ["Umbrales.", "Un puesto cuenta entero a menos de 45 minutos y la mitad entre 45 y 60. El alquiler y la hipoteca puntúan bien hasta el 20 % del sueldo, mal desde el 35 %. Así se separan los municipios donde un trabajador industrial puede vivir con holgura."],
        ["Usansolo no está en Udalplan 2023.", "No tiene dato de suelo por construir; su eje «vivienda al alcance» se calcula con el resto de partes."],
      ].map(([h, t]) => el("li", {}, [el("strong", { text: h }), ` ${t}`]))),
    ]),
    block("Datos aproximados (23/10/2026)", [
      el("p", { text: "Para que la falta de datos no deje sin respuesta a los pueblos, se usan dos estimaciones con fuentes oficiales, siempre marcadas como dato aproximado:" }),
      el("ul", { class: "limitations" }, [
        ["Alquiler por comarca.", store.meta.aproximados.alquiler],
        ["Precio de compra orientativo.", store.meta.aproximados.compra],
        ["Aviso en la medida M01.", store.meta.aproximados.m01],
      ].map(([h, t]) => el("li", {}, [el("strong", { text: h }), ` ${t}`]))),
      el("p", { text: "Con el alquiler estimado, 2 municipios más tienen «alquiler caro» y 9 más una subida por encima del límite de la ley, todos pueblos pequeños de Gran Bilbao. Las ayudas al alquiler (M03) y Bizigune (M04) dejan de estar «a valorar» fuera de las ciudades, y la M01 pasa a probada en los pueblos. El área funcional de cada municipio se ha comprobado con la superficie oficial de cada área (Udalplan 2023)." }),
    ]),
    block("Viviendas turísticas y alquiler", [el("ul", { class: "limitations" }, Object.values(store.prevencion.reglas).map((t) => el("li", { text: t })))]),
    block("Limitaciones", [el("ul", { class: "limitations" }, LIMITS(store).map(([h, t]) => el("li", {}, [el("strong", { text: h }), ` ${t}`])))]),
    block(`Revisión de los datos (${store.meta.fecha_revision.split("-").reverse().join("/")})`, [el("p", { text: "Se rehízo todo el cálculo desde los datos descargados y se comparó cada fuente con su publicación oficial: los precios de los Registradores cifra a cifra, los 9 recuentos de viviendas turísticas del INE, la población y los ingresos de Eustat, el interés de las hipotecas del INE y las normas citadas en el BOE y el BOPV. Errores corregidos:" }),
      el("ol", { class: "limitations review" }, REVIEW.map(([h, t]) => el("li", {}, [el("strong", { text: `${h}. ` }), t])))]),
    // fase 12: los cambios de cada fecha, juntos al final, para no mezclar la historia con la explicacion del metodo
    block("Historial de cambios", [
      el("h3", { class: "method-sub", text: "01/11/2026" }),
      el("ul", { class: "limitations" }, CHANGES_NOV.map(([h, t]) => el("li", {}, [el("strong", { text: h }), ` ${t}`]))),
      el("h3", { class: "method-sub", text: "27/10/2026" }),
      el("ul", { class: "limitations" }, CHANGES_27.map(([h, t]) => el("li", {}, [el("strong", { text: h }), ` ${t}`]))),
      el("h3", { class: "method-sub", text: "25/10/2026" }),
      el("ul", { class: "limitations" }, CHANGES_25.map(([h, t]) => el("li", {}, [el("strong", { text: h }), ` ${typeof t === "function" ? t(store) : t}`]))),
      el("h3", { class: "method-sub", text: "23/10/2026: cambios en la propuesta de medidas" }),
      el("ul", { class: "limitations" }, [
      ["Más fuentes de medidas.", "Antes solo se usaban casos de la recopilación Vivienda-Industria, de grandes ciudades. Ahora también programas aplicados en España, Euskadi y otros países, e ideas propias, y cada ficha dice de dónde sale. Hay 6 medidas nuevas, sobre todo para los pueblos."],
      ["Dos preguntas en vez de una puntuación.", "La antigua puntuación mezclaba si una medida hace falta con lo buena que es, y algunas medidas no podían sacar nota alta en ningún sitio. Ahora se enseñan por separado."],
      ["«Sin dato» no es «sin problema».", "Donde faltan datos, las medidas que dependen de ellos van a un grupo propio."],
      ["Medidas por barrio.", "Cada barrio con algún problema tiene su propia propuesta."],
      ["«Mucho alquiler» pasa a ser contexto.", "Ya no se enseña como problema."],
    ].map(([h, t]) => el("li", {}, [el("strong", { text: h }), ` ${t}`]))),
    ]),
    block("Fuentes", [sourcesList(store), el("p", { class: "note", text: "Las fuentes de cada medida están en su ficha. Solo se publican totales y porcentajes: el registro original de viviendas turísticas contiene datos personales (nombres y contactos) y no se publica." })]),
  ]));
  return {
    show: (sub) => {
      const target = sub && root.querySelector(`#${CSS.escape(sub)}`);
      if (target) requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
      else window.scrollTo(0, 0);
    },
  };
}
