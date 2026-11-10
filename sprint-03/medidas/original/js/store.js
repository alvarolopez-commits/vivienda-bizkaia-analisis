// Acceso comodo a los datos exportados por analysis/exportar_web.py. La web no recalcula nada.

export function createStore(data, load) {
  const munis = data.municipios;
  const codes = Object.keys(munis).sort((a, b) => munis[a].nombre.localeCompare(munis[b].nombre, "es"));
  const measures = Object.fromEntries(data.medidas.medidas.map((m) => [m.id, m]));
  const typeKeys = Object.keys(data.meta.tipos);
  let sections = null;

  return {
    ...data,
    codes,
    measures,
    typeKeys,
    fuentes: data.meta.fuentes,
    problemName: (p) => data.meta.problemas[p]?.nombre || p,
    typeName: (t) => data.meta.tipos[t] || t,
    muniName: (c) => (Object.hasOwn(munis, c) ? munis[c].nombre : c),
    /** Las 928 secciones se cargan solo cuando una vista las necesita (unos 870 KB). */
    sections: async () => {
      sections ??= load("secciones.geojson").catch((err) => { sections = null; throw err; }); // se puede reintentar
      return sections;
    },
  };
}
