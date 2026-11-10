// El territorio en 3D: los 113 municipios, que se levantan según el indicador elegido (receta 1 de «Diseño Web y
// Gráficos/recetas», la misma base que la web de resumen). La escena de la portada y el mapa vivo mueven solo números en
// el estado de cada territorio (state); el bucle de dibujo los lee en cada fotograma. Si no hay WebGL, queda el mapa en SVG.
// El mapa se centra en el bloque que lo enmarca (frame): en la portada, el bloque azul noche de la derecha, que se abre.
import { reduced } from "../comun.js";
import { projection, rings, svgMap } from "../mapa.js";
import { INDICADORES } from "./indicadores.js";

const DIM = "#3a3658", HERO = "#c9d6e2", HMAX = 16;
const STILL = matchMedia("(prefers-reduced-motion: reduce)");

/** Estado inicial: cam = posición entre las cámaras fijas; w0 = la portada y w1..w5 = cada indicador; bias = el mapa se aparta a la derecha. */
export const newState = () => ({ cam: 0, w0: 1, w1: 0, w2: 0, w3: 0, w4: 0, w5: 0, bias: 0, label: -1, labelOp: 0 });

function colours(THREE, m, maxPop) {
  // en reposo, un relieve suave con la población de cada municipio (el más poblado, el más alto)
  const c = [new THREE.Color(HERO)], hgt = [0.6 + 3.4 * Math.sqrt(m.poblacion / maxPop)];
  for (const ind of INDICADORES) {
    const x = ind.valor(m);
    c.push(new THREE.Color(x ? ind.color(x.v) : DIM));
    hgt.push(x ? Math.max(0.15, ind.altura(x.v) * HMAX) : 0.15);
  }
  return { c, hgt };
}

/** Monta el territorio en host, movido por state (el mismo objeto que anima la escena). Devuelve false si cae al mapa en SVG. */
export async function territory(host, geo, munis, { frame = host, label = null, keys = null, state = newState() } = {}) {
  const flat = () => host.replaceChildren(svgMap(geo, () => ({ fill: HERO }), { stroke: "#221e41", label: "Mapa de los 113 municipios de Bizkaia" }));
  let THREE, renderer;
  try { THREE = await import("../../vendor/three/three.module.min.js"); renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { flat(); return false; }
  renderer.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); renderer.setAnimationLoop(null); flat(); });
  const { P } = projection(geo);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 1, 4000);
  camera.up.set(0, 0, 1);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x221e41, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(-60, -90, 140); scene.add(sun);
  const meshes = [], centroid = {}, maxPop = Math.max(...Object.values(munis).map((m) => m.poblacion));
  for (const f of geo.features) {
    const m = munis[f.properties.code];
    if (!m) continue;
    const shapes = rings(f.geometry).map((poly) => {
      const s = new THREE.Shape(poly[0].map((c) => new THREE.Vector2(...P(c))));
      for (const hole of poly.slice(1)) s.holes.push(new THREE.Path(hole.map((c) => new THREE.Vector2(...P(c)))));
      return s;
    });
    const geom = new THREE.ExtrudeGeometry(shapes, { depth: 1, bevelEnabled: false });
    const mesh = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color: HERO, roughness: 0.88, metalness: 0 }));
    for (const poly of rings(f.geometry)) {
      mesh.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(poly[0].map((c) => new THREE.Vector3(...P(c), 1.001))),
        new THREE.LineBasicMaterial({ color: 0x221e41, transparent: true, opacity: 0.55 })));
    }
    geom.computeBoundingBox();
    const bb = geom.boundingBox;
    centroid[f.properties.code] = [(bb.min.x + bb.max.x) / 2, (bb.min.y + bb.max.y) / 2];
    mesh.userData = { code: f.properties.code, ...colours(THREE, m, maxPop) };
    mesh.scale.z = 0.6;
    scene.add(mesh); meshes.push(mesh);
  }
  draw({ THREE, host, frame, renderer, scene, camera, meshes, centroid, state, label, keys, munis });
  return true;
}

/** El bucle de dibujo: la cámara entre posiciones fijas, la mezcla de colores y alturas, y la etiqueta del municipio destacado. */
function draw({ THREE, host, frame, renderer, scene, camera, meshes, centroid, state: S, label, keys, munis }) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const [bx, by] = centroid["48020"], [mx, my] = centroid["48068"];
  const KEYS = keys?.(V, centroid) ?? [[V(0, -70, 132), V(-4, 2, 0)], [V(0, -112, 90), V(-2, 6, 0)], [V(bx + 10, by - 44, 36), V(bx, by + 2, 3)],
    [V(64, -90, 80), V(2, 4, 0)], [V(mx - 8, my - 64, 30), V(mx - 6, my + 1, 4)], [V(-56, -96, 86), V(2, 2, 0)]];
  const smooth = (t) => t * t * (3 - 2 * t);
  const pos = new THREE.Vector3(), tgt = new THREE.Vector3(), off = new THREE.Vector3(), tmp = new THREE.Vector3();
  const byCode = Object.fromEntries(meshes.map((m) => [m.userData.code, m]));
  // el municipio destacado de cada indicador: el de valor más alto
  const top = INDICADORES.map((ind) => Object.keys(munis).filter((c) => byCode[c] && ind.valor(munis[c]))
    .sort((a, b) => ind.valor(munis[b]).v - ind.valor(munis[a]).v)[0]);
  let w = 0, h = 0, visible = true;
  const resize = () => { w = host.clientWidth; h = host.clientHeight; if (w && h) { renderer.setSize(w, h, false); camera.aspect = w / h; } };
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver((entries) => { visible = entries.at(-1).isIntersecting; }).observe(host);
  resize();
  const clock = new THREE.Clock();
  const tick = () => {
    if (!visible || !w) return;
    // el centro y el tamaño del bloque que enmarca el mapa, dentro del lienzo
    const hr = host.getBoundingClientRect(), fr = frame.getBoundingClientRect();
    // con la tarjeta de un paso a la izquierda (bias), el mapa se centra en el hueco que queda a su derecha
    const freeW = fr.width * (1 - 0.38 * S.bias);
    const cx = fr.left + fr.width / 2 - hr.left + S.bias * 0.19 * hr.width, cy = fr.top + fr.height / 2 - hr.top;
    const fit = Math.min(2.8, Math.max(1, (hr.width / Math.max(1, freeW)) * 0.62, (hr.height / Math.max(1, fr.height)) * 0.9));
    camera.setViewOffset(w, h, w / 2 - cx, h / 2 - cy, w, h);
    camera.updateProjectionMatrix();
    const portrait = fr.width / fr.height < 1.25 ? Math.max(1, Math.min(2.4, 0.82 / (fr.width / fr.height))) : 1;
    const k = Math.max(0, Math.min(KEYS.length - 1, S.cam)), i = Math.min(KEYS.length - 2, Math.floor(k)), f = smooth(k - i);
    pos.lerpVectors(KEYS[i][0], KEYS[i + 1][0], f); tgt.lerpVectors(KEYS[i][1], KEYS[i + 1][1], f);
    off.subVectors(pos, tgt).multiplyScalar(fit * portrait);
    if (!STILL.matches && !reduced()) off.applyAxisAngle(camera.up, Math.sin(clock.getElapsedTime() * 0.18) * 0.06);
    camera.position.copy(tgt).add(off); camera.lookAt(tgt);
    const wts = [S.w0, S.w1, S.w2, S.w3, S.w4, S.w5], sum = wts.reduce((a, b) => a + b, 0) || 1;
    for (const m of meshes) {
      const u = m.userData, col = m.material.color;
      let z = 0; col.setRGB(0, 0, 0);
      for (let j = 0; j < wts.length; j++) {
        if (!wts[j]) continue;
        const wj = wts[j] / sum, cj = u.c[j];
        z += u.hgt[j] * wj; col.r += cj.r * wj; col.g += cj.g * wj; col.b += cj.b * wj;
      }
      m.scale.z = Math.max(0.05, z);
    }
    if (label) {
      const li = Math.round(S.label);
      const code = li >= 0 ? top[li] : null;
      const mesh = code && byCode[code];
      if (!mesh || S.labelOp < 0.01) { label.style.opacity = 0; } else {
        const [x, y] = centroid[code];
        tmp.set(x, y, mesh.scale.z + 0.8).project(camera);
        if (label.dataset.code !== code) {
          const ind = INDICADORES[li];
          label.textContent = `${munis[code].nombre} ${ind.texto(ind.valor(munis[code]))}`;
          label.dataset.code = code;
        }
        label.style.opacity = tmp.z > 1 ? 0 : S.labelOp;
        label.style.transform = `translate(${(((tmp.x + 1) / 2) * w).toFixed(1)}px, ${(((1 - tmp.y) / 2) * h).toFixed(1)}px) translate(-50%, -140%)`;
      }
    }
    renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(tick);
}
