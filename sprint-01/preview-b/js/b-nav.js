// Sprint 01 · Opción B: menú accesible (diálogo nativo), con foco restaurado al cerrar y cierre con Escape.
const menu = document.getElementById("menu");
const abrir = document.getElementById("menu-abrir");
abrir.addEventListener("click", () => { menu.showModal(); abrir.setAttribute("aria-expanded", "true"); document.documentElement.classList.add("modal"); });
menu.addEventListener("close", () => { abrir.setAttribute("aria-expanded", "false"); document.documentElement.classList.remove("modal"); abrir.focus(); });
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => menu.close()));
// pulsar fuera del panel cierra
menu.addEventListener("click", (e) => { if (e.target === menu) menu.close(); });
if (new URLSearchParams(location.search).has("limpio")) document.querySelector(".proto-tag").hidden = true;
const marcar = () => document.documentElement.classList.toggle("marcar", location.hash === "#marcar" || new URLSearchParams(location.search).has("marcar"));
marcar();
addEventListener("hashchange", marcar);
