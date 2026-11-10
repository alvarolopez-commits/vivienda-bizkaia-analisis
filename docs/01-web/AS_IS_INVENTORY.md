# AS_IS_INVENTORY — Web interactiva «Análisis y medidas»

**Estado de evidencia de TODO este documento:** `OBSERVADO_EN_WEB_PENDIENTE_REPO`
**Fuente:** inspección de la web publicada https://vizcaya-vivienda-analisis.vercel.app/ el 2026-11-10 (navegador integrado, 1024×768 y 375×812). No hay acceso al repositorio. Nada de lo siguiente está verificado en código.
**Regla:** lo que no se ha visto se marca `NO_INSPECCIONADO`. «BM30» no se expande.

## 1. Stack y mecánica observados (indicios, no confirmación)

| Hecho observado | Evidencia |
|---|---|
| Una sola página con seis vistas conmutadas por ancla hash | enlaces `#situacion`, `#municipios`, `#acceso`, `#medidas`, `#normas`, `#metodo`; contenedores `view-situacion`, `view-municipios`, `view-acceso`… con `display:none` salvo el activo |
| Ficha de municipio por ancla con código INE | `#municipios/48020` (Bilbao), `#municipios/48044` (Getxo)… |
| Sin framework SPA detectable | no hay `__NEXT_DATA__`; scripts propios `js/main.js`, `js/js-on.js` |
| Librerías cargadas desde `/vendor/` | GSAP, ScrollTrigger, SplitText, Lenis (scroll suave), `vendor/taste/stage.js` y `base.js` |
| Mapa renderizado en canvas | 1 `<canvas>` en Situación; 15 `<svg>` |
| Tokens CSS en `:root` | `--noche #221e41`, `--claro #f2f4f6`, `--claro-suave #c3c7d9`, `--celeste #8bcdff`, `--rosa #f4a6a6`, `--rosa-fuerte #b4545b`, `--accent #1a4d7a`, `--radius 16px`, `--banda 56px` |
| Tipografías | Montserrat (texto y títulos), Playfair Display (cifras, `--font-num`) |
| Hay un segundo bloque `:root` con valores genéricos (`#fff`, `system-ui`) | posible hoja base sobrescrita; **pendiente repo** |
| Sin scroll horizontal a 375 px | `scrollWidth 375 = innerWidth 375` medido en `#medidas` y `#municipios` |

## 2. Vistas

### 2.1 Situación (`#situacion`) — altura total 8.432 px a 1024×768
| Sección (id) | Altura | Contenido observado |
|---|---|---|
| `portada` (hero, clase `scene`) | 3.072 px | Título «113 municipios, cinco problemas», entradilla, botón «Busca tu municipio» y, al hacer scroll, **mapa 3D extruido** con las cinco tarjetas de problema una tras otra (cifra, titular, descripción, «Cálculo propio» + fuentes, «En el mapa: …») |
| `frase-sec` | 286 px | Frase de tesis «Bizkaia necesita más vivienda asequible cerca del empleo…» y nota de método |
| `mapa` («El mapa») | 1.060 px | «Cada municipio, con su dato». Pestañas Alquiler/Entrada/Hogares/Turísticas/Vacías; conmutador 2D/3D; mapa; desplegable «Otro municipio»; cifra del municipio; enlace «Ver su ficha» |
| `lista` | 1.378 px | «Los 113 municipios, de más a menos» con pestañas por problema, filtros por tipo y lista «Ver los 35» |
| `tipos` | 1.447 px | «Siete tipos de municipio» con fotos y créditos |
| `pestanas` | 1.188 px | «Cada pregunta tiene su pestaña»: cuatro tarjetas hacia Municipios, Acceso, Medidas, Normas |
| pie | 478 px | enlaces a Resumen y Radar, Método y fuentes, créditos de imágenes |

Cinco problemas (orden y literales en la portada): 34 de 35 · 10,8 a 16,9 · 30.000 a 120.000 · 38 · 53 de 63. Titulares: *Alquilar se lleva más del 30 % de los ingresos bajos* / *Comprar: la barrera es ahorrar la entrada* / *Se construye poco para lo que viene* / *Viviendas turísticas: un problema de pocos barrios* / *Pueblos con viviendas vacías y edificios viejos*.

### 2.2 Municipios (`#municipios`, `#municipios/<INE>`)
Selector «Municipio» (113) y «Comparar con» (Ninguno + 113). Ficha: cabecera (comarca, habitantes, estado de zona tensionada), «Dato a dato» (13 indicadores con puesto y cuatro series de referencia), «Sus problemas» (9 bloques), «Alquilar y comprar, según los ingresos» (tabla 3 hogares), «Cómo ha cambiado» (series). `NO_INSPECCIONADO`: final de la ficha, modo comparar activo, fichas de otros municipios (no se asume que tengan las mismas variables).

### 2.3 Acceso (`#acceso`)
Titular con horquilla 10,8–16,9 años · gráfico de alquiler por municipio (35, ingresos bajos y medios) · «La escalera del acceso» (5 hogares × 4 pasos, con «Cabe / Depende / No cabe») · «Prueba tus supuestos» (selectores: Dónde, Hogar, Ahorro 10–30 %, Entrada 25–45 %, Interés 2,00/2,92/3,50/4,50 %, Plazo 20–35, Préstamo «TU CASA» Sí/No; salidas: años, % de ingresos, precio asequible; rejilla ahorro×entrada) · «¿Hasta dónde llega mi hogar?» (mapa con 5 hogares × 4 niveles de ahorro y recuento «0 de 113»).

### 2.4 Medidas (`#medidas`)
Burbujas evidencia×plazo (tamaño = población) con filtros por línea y «solo las que se pueden aplicar ya» · tabla «Todas, criterio a criterio» (filtros: Línea, Cómo actúa, Quién decide, Papel de BM30; «Ordenar según tus prioridades») · matriz M01–M34 (12 columnas) · «De cada problema a qué vigilar» (cadena problema→medida→qué vigilar) · «Quién decide cada medida» · comparador «Dos o tres, lado a lado» · «Las alternativas estudiadas» (I01, I04, I05, I08…). Los IDs M01–M34 son estables; hay 34 medidas, 2 marcadas «Evaluada, no se propone» (M33, M34).

### 2.5 Normas (`#normas`)
Matriz 15 instrumentos × 4 niveles (Decide / Aplica o lo pide / No interviene) con filtro por nivel · cronología 2015→2026 con dos hitos «Pendiente» · cifra «30 de 34 medidas» con enlace a Medidas. Estado fechado a 2 de noviembre de 2026.

### 2.6 Método (`#metodo`)
«Cómo se ha hecho» · «Palabras clave» (glosario de >40 términos). `NO_INSPECCIONADO`: texto posterior al glosario (se truncó la lectura), tabla de fuentes y programas reejecutables.

## 3. Enlaces externos
- Radar: https://vizcaya-vivienda.vercel.app/ (botón «Ver el radar» en cabecera y pie).
- Resumen: https://vizcaya-vivienda-resumen.vercel.app/ (pie).
- Imágenes de Wikimedia Commons con licencia CC (Zorrotzaurre, Santutxu, Mundaka, Elantxobe y otras en «Créditos de las imágenes»).

## 4. Lo que NO se ha podido saber
Significado de BM30 · si el estilo azul noche/celeste/rosa es marca Astara · fórmulas de las calculadoras (solo se han visto entradas y salidas) · origen de los datos en código · estados de error/vacío · accesibilidad real por teclado y lector de pantalla · rendimiento.
