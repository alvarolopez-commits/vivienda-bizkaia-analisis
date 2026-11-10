// QA del Sprint 01: mide la cabecera y los desbordes del ancho actual. Se llama desde la consola del navegador:
//   JSON.stringify(await (await import('/_qa/qa-header.js')).run())
export async function run() {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  await sleep(2200);
  const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
  const txt = (e) => e.textContent.replace(/\s+/g, " ").trim();
  const banda = document.querySelector(".banda");
  const sub = document.getElementById("sub-situacion");
  const root = document.documentElement;
  return {
    ancho: innerWidth,
    scrollHorizontal: root.scrollWidth > innerWidth + 1 && (root.scrollWidth - innerWidth) > 20,
    enlacesVistas: [...document.querySelectorAll(".capitulos a, nav.vistas a")].filter(vis).map(txt),
    productosExternos: [...banda.querySelectorAll(".otros-productos a")].filter(vis).map(txt),
    botonMenu: vis(document.querySelector(".menu-boton")),
    vistaActivaVisible: [...document.querySelectorAll(".vista-activa, .capitulo-vivo")].filter(vis).map(txt),
    ariaCurrentVisible: [...document.querySelectorAll("[aria-current=page]")].filter(vis).map(txt),
    bandaDesborda: banda.scrollWidth > banda.clientWidth + 1,
    fueraDeViewport: [...banda.querySelectorAll("a,button,p")].filter(vis).filter((e) => e.getBoundingClientRect().right > innerWidth + 1 || e.getBoundingClientRect().left < -1).map(txt),
    objetivosMenores36: [...banda.querySelectorAll("a,button")].filter(vis).filter((e) => e.getBoundingClientRect().height < 36).map((e) => `${txt(e)}:${Math.round(e.getBoundingClientRect().height)}px`),
    subNav: sub ? { visible: vis(sub), botones: [...sub.querySelectorAll("button")].map((b) => txt(b) + (b.getAttribute("aria-disabled") === "true" ? "(desactivado)" : "")) } : null,
  };
}
