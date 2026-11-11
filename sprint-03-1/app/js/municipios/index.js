// Municipios · explorador de fichas. El contenido (cifras, problemas, hogares, evolución, barrios y plan) lo dibuja el renderizador ORIGINAL
// (app/original/js/municipios); aquí se le da la composición del sistema de diseño: cabecera con buscador y selectores en una barra de
// vidrio, perfil y bloques en superficies sólidas, e índice interno fijo con los bloques originales. Rutas: #municipios, #municipios/INE
// y #municipios/INE-INE (comparar), las mismas de la web publicada.
import { renderMunicipios } from "../../original/js/municipios/index.js";
import { parseHash } from "../../original/js/rutas.js";
import { el } from "../../original/js/ui.js";
import { cifrasPlanas, envolver, lupa, norm } from "../lectura.js";
import { bannerDe } from "./imagenes.js";
import { fijar, filaContexto } from "../contexto.js";
import { componerComparacion } from "./comparador.js";
import { botonInfo, descHogares, descMunicipal } from "../info-dato.js";
import { botonExportar, prepararImpresion } from "../exportar.js";
import { DOTS } from "../../original/js/municipios/puntos.js";

export function montar(raiz, { store }) {
  const lec = envolver(raiz, { clase: "v-municipios", indice: "lateral", dibujar: (c) => renderMunicipios(c, store), herramientas: (c) => c.querySelector(".eligen") });
  lec.nodos.herr.classList.add("vidrio");   // la barra entera (buscador + selectores) es el material de vidrio

  // buscador de municipios: escribe y elige; lleva a la misma dirección que los selectores de siempre (no cambia ningún dato)
  const lista = el("datalist", { id: "muni-lista" }, store.codes.map((c) => el("option", { value: store.municipios[c].nombre })));
  const campo = el("input", { id: "muni-buscar", type: "search", list: "muni-lista", placeholder: "Buscar municipio", autocomplete: "off", spellcheck: "false", "data-propuesta": "" });
  const ir = () => {
    const q = norm(campo.value.trim());
    if (!q) return;
    const code = store.codes.find((c) => norm(store.municipios[c].nombre) === q) ?? store.codes.find((c) => norm(store.municipios[c].nombre).startsWith(q));
    if (!code) return;
    const [, b] = (parseHash(location.hash).sub ?? "").split("-");
    campo.value = "";
    location.hash = `#municipios/${code}${b && b !== code && Object.hasOwn(store.municipios, b) ? `-${b}` : ""}`;
  };
  campo.addEventListener("change", ir);
  campo.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); ir(); } });
  lec.nodos.herr.prepend(el("div", { class: "elige-muni" }, [el("label", { for: "muni-buscar", text: "Buscar municipio" }), el("span", { class: "buscar-lec" }, [lupa(), campo, lista])]));

  // Banner de la cabecera de cada municipio (el primario y, si hay comparación, también el comparado). El texto sigue siendo el del renderizador
  // original, que no se toca: aquí solo se le añade la imagen detrás. La imagen se crea de cero en cada ficha (las cabeceras se redibujan), así que un
  // cambio rápido de municipio nunca deja una imagen de otro.
  const banner = () => {
    const codes = [raiz.querySelector("#muni-a")?.value, raiz.querySelector("#muni-b")?.value].filter(Boolean);
    lec.nodos.contenido.querySelectorAll(".cabeceras .muni-cab").forEach((cab, i) => {
      const code = codes[i];
      if (!cab || !code || cab.classList.contains("muni-banner")) return;
      const b = bannerDe(code);
      cab.classList.add("muni-banner");
      cab.dataset.banner = b.tipo;
      const foto = el("img", { class: "muni-foto", src: b.src, alt: "", decoding: "async", fetchpriority: "high", "aria-hidden": "true" });
      foto.style.objectPosition = b.foco;
      foto.addEventListener("load", () => foto.classList.add("lista"), { once: true });
      foto.addEventListener("error", () => { console.warn(`Banner no disponible (${b.archivo}); se muestra el fondo del sistema.`); foto.remove(); cab.dataset.banner = "sin-imagen"; }, { once: true });
      cab.prepend(foto, el("span", { class: "muni-velo", "aria-hidden": "true" }));
    });
  };

  const mostrar = (primera) => {
    lec.vista.show?.(parseHash(location.hash).sub);
    raiz.querySelector(".ficha")?.classList.remove("cmp");   // el mismo contenedor sirve a la ficha individual y a la comparación
    banner();
    { const A = raiz.querySelector("#muni-a")?.value, B = raiz.querySelector("#muni-b")?.value; if (A && B) componerComparacion({ raiz, store, A, B }); }   // comparación: composición analítica (js/municipios/comparador.js)
    // exportación: «Exportar a PDF» en la comparación (junto a Intercambiar y Ver solo…) y en la ficha individual (en una fila propia bajo el encabezado)
    { const acc = lec.nodos.contenido.querySelector(".cmp-acciones");
      if (acc) acc.append(botonExportar(store));
      else lec.nodos.contenido.querySelector(".cabeceras")?.after(el("div", { class: "cmp-acciones", role: "group", "aria-label": "Acciones de la ficha" }, [botonExportar(store)])); }
    // contexto de investigación: el municipio principal y el comparado; y los saltos a Situación, Acceso y Medidas con este municipio
    fijar({ muni: raiz.querySelector("#muni-a")?.value || null, muniB: raiz.querySelector("#muni-b")?.value || null });
    (lec.nodos.contenido.querySelector(".cmp-acciones") ?? lec.nodos.contenido.querySelector(".cabeceras"))?.after(filaContexto("municipios", { clase: "en-municipios" }));
    // información del dato: un botón «i» en cada uno de los 13 indicadores y en «Alquilar y comprar»
    lec.nodos.contenido.querySelectorAll(".filas-ind > li").forEach((li, i) => {
      const [key, label] = DOTS[i] ?? [];
      if (key) li.querySelector(".nombre-ind")?.append(" ", botonInfo(() => descMunicipal(store, key, label), { etiqueta: `Información sobre el indicador: ${label}`, clase: "en-fila" }));
    });
    { const cab = lec.nodos.contenido.querySelector("#hogares .sec-cab");
      if (cab) cab.append(botonInfo(() => descHogares(store, cab.querySelector(".sub")?.textContent ?? null), { etiqueta: "Información sobre alquilar y comprar: fuentes, periodo y naturaleza del precio", clase: "en-seccion" })); }
    cifrasPlanas(lec.nodos.contenido);
    // el nombre de cada municipio es el titular de su perfil (el original lo dibuja con un <p>): se anuncia como encabezado
    lec.nodos.contenido.querySelectorAll(".muni-nombre").forEach((n) => { n.setAttribute("role", "heading"); n.setAttribute("aria-level", "2"); });
    lec.actualizarIndice();
    if (!primera) window.scrollTo(0, 0);
  };
  mostrar(true);
  if (new URLSearchParams(location.search).has("imprimir")) prepararImpresion(store);   // ?imprimir=1: deja la ficha ya preparada (cabecera y pie de impresión) para generar el PDF desde línea de órdenes
  return { alCambiarDireccion: () => mostrar(false), desmontar: () => lec.desmontar() };
}
