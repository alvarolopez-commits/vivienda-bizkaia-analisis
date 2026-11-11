// Banners de la cabecera municipal: qué imagen va con cada municipio. Solo configuración; no toca datos ni textos.
//
// Las imágenes son ILUSTRACIONES generadas con IA (img/municipios/MANIFEST.json): no son fotografías documentales de la localidad y el
// nombre del archivo no prueba exactitud geográfica. Por eso:
//   · IDENTIFICADOS: el banner nombrado de ese municipio (16).
//   · PROVISIONALES: propuestas pendientes de revisión editorial; NO se usan mientras no tengan `approved: true` (decisión explícita).
//   · GENERICOS: 30 escenas sin localidad concreta, compartidas por el resto; la asignación es determinista a partir del código INE.
// Las claves son los códigos INE que ya usa la aplicación (store.municipios); cada uno se comprobó contra app/original/data/municipios.json
// por coincidencia exacta del nombre normalizado (no por parecido): véase docs/diseno/BANNERS_MUNICIPIOS.md.

const BASE = new URL("../../img/municipios/", import.meta.url);   // relativa a este módulo: válida en GitHub Pages bajo subruta y con cualquier #hash

export const IDENTIFICADOS = {
  "48020": "bilbao.webp",
  "48013": "barakaldo.webp",
  "48044": "getxo.webp",
  "48078": "portugalete.webp",
  "48082": "santurtzi.webp",
  "48046": "gernika_lumo.webp",   // Gernika-Lumo
  "48017": "bermeo.webp",
  "48057": "lekeitio.webp",
  "48068": "mundaka.webp",
  "48031": "elantxobe.webp",
  "48073": "ondarroa.webp",
  "48090": "balmaseda.webp",
  "48074": "orduna.webp",         // Urduña / Orduña
  "48077": "plentzia.webp",
  "48043": "gorliz.webp",
  "48012": "bakio.webp",
};

// Provisionales: disponibles pero desactivados. Para activar uno, el equipo editorial pone approved: true.
export const PROVISIONALES = {
  "48003": { archivo: "amorebieta_etxano.webp", approved: false },
  "48036": { archivo: "galdakao.webp", approved: false },
  "48069": { archivo: "mungia.webp", approved: false },
  "48089": { archivo: "urduliz.webp", approved: false },
  "48085": { archivo: "sopela.webp", approved: false },
  "48096": { archivo: "zalla.webp", approved: false },
};

export const GENERICOS = Array.from({ length: 30 }, (_, i) => `generico_${String(i + 1).padStart(2, "0")}.webp`);

// Fondos genéricos que no se usan (editorial). Vacío por defecto: véase «pendientes» en docs/diseno/BANNERS_MUNICIPIOS.md.
export const GENERICOS_EXCLUIDOS = [];

// Punto focal por imagen (object-position) cuando el centro no encuadra bien. Los originales no se tocan. Ej.: { "bilbao.webp": "50% 40%" }
export const FOCO = {};

// FNV-1a de 32 bits sobre el código: estable, sin Math.random, sin estado y sin depender del orden de la lista de municipios.
function hash(texto) {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}

/** Fondo genérico estable para un código INE. */
export function genericoDe(code) {
  const pool = GENERICOS.filter((f) => !GENERICOS_EXCLUIDOS.includes(f));
  return pool[hash(String(code)) % pool.length];
}

/** Qué banner corresponde a un municipio: { src, archivo, tipo: "identificado" | "provisional" | "generico", foco }. */
export function bannerDe(code) {
  const id = IDENTIFICADOS[code];
  if (id) return { src: new URL(`identificados/${id}`, BASE).href, archivo: id, tipo: "identificado", foco: FOCO[id] ?? "center" };
  const pr = PROVISIONALES[code];
  if (pr?.approved === true) return { src: new URL(`provisionales/${pr.archivo}`, BASE).href, archivo: pr.archivo, tipo: "provisional", foco: FOCO[pr.archivo] ?? "center" };
  const g = genericoDe(code);
  return { src: new URL(`genericos/${g}`, BASE).href, archivo: g, tipo: "generico", foco: FOCO[g] ?? "center" };
}
