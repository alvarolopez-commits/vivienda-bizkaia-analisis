// Municipios · explorador de fichas. El contenido (cifras, problemas, hogares, evolución, barrios y plan) lo dibuja el renderizador ORIGINAL
// (app/original/js/municipios); aquí se le da la composición del sistema de diseño: cabecera con buscador y selectores en una barra de
// vidrio, perfil y bloques en superficies sólidas, e índice interno fijo con los bloques originales. Rutas: #municipios, #municipios/INE
// y #municipios/INE-INE (comparar), las mismas de la web publicada.
import { renderMunicipios } from "../../original/js/municipios/index.js";
import { parseHash } from "../../original/js/rutas.js";
import { el } from "../../original/js/ui.js";
import { cifrasPlanas, envolver, lupa, norm } from "../lectura.js";

export function montar(raiz, { store }) {
  const lec = envolver(raiz, { clase: "v-municipios", indice: "lateral", dibujar: (c) => renderMunicipios(c, store), herramientas: (c) => { const n = c.querySelector(".eligen"); n.classList.add("vidrio"); return n; } });

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
  lec.nodos.herr.prepend(el("label", { class: "buscar-lec vidrio" }, [el("span", { class: "sr-only", text: "Buscar municipio" }), lupa(), campo, lista]));

  const mostrar = (primera) => {
    lec.vista.show?.(parseHash(location.hash).sub);
    cifrasPlanas(lec.nodos.contenido);
    // el nombre de cada municipio es el titular de su perfil (el original lo dibuja con un <p>): se anuncia como encabezado
    lec.nodos.contenido.querySelectorAll(".muni-nombre").forEach((n) => { n.setAttribute("role", "heading"); n.setAttribute("aria-level", "2"); });
    lec.actualizarIndice();
    if (!primera) window.scrollTo(0, 0);
  };
  mostrar(true);
  return { alCambiarDireccion: () => mostrar(false), desmontar: () => lec.desmontar() };
}
