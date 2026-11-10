// Sprint 02 · menú accesible (diálogo nativo) igual que en Sprint 01: foco restaurado al cerrar y cierre con Escape.
const menu = document.getElementById("menu");
const abrir = document.getElementById("menu-abrir");
abrir.addEventListener("click", () => { menu.showModal(); abrir.setAttribute("aria-expanded", "true"); document.documentElement.classList.add("modal"); });
menu.addEventListener("close", () => { abrir.setAttribute("aria-expanded", "false"); document.documentElement.classList.remove("modal"); abrir.focus(); });
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => menu.close()));
menu.addEventListener("click", (e) => { if (e.target === menu) menu.close(); });
const params = new URLSearchParams(location.search);
if (params.has("limpio")) document.querySelector(".proto-tag").hidden = true;
if (params.has("marcar")) document.documentElement.classList.add("marcar"); // contorno en los textos PROPUESTA_MICROCOPY
