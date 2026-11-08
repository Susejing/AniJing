// AniJing — anime puro para Kino: catálogo, búsqueda, fichas, episodios y reproducción
// desde AnimeAV1, con la sinopsis, los géneros y el id de MyAnimeList de cada serie.
// Repositorio: https://github.com/Susejing/AniJing
//
// Copyright (C) 2026 Susejing
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.
//
// AniJing v0.2.0 «Con carátulas» — anime puro para Kino.
// Fuente: AnimeAV1 (https://animeav1.com): TODO por su API interna __data.json (catálogo,
// búsqueda, fichas y episodios) y su reproductor Zilla (HLS) para la reproducción. Las
// carátulas, fondos y capturas viven en el CDN de la propia fuente (cdn.animeav1.com, ya
// cubierto por el host comodín *.animeav1.com). Los ref son «av1:<slug>» (serie o
// película) y «av1:<slug>:<número>» (episodio). El esqueleto de fuentes aisladas se tomó
// como patrón del plugin comunitario YojaTV (GPL-3.0); este código también es GPL-3.0.
//
// HONESTO: solo se reproduce lo que AnimeAV1 sirve directo (Zilla/HLS o un .m3u8/.mp4
// contundente). Los reproductores que necesitan extractor (VOE, MP4Upload, Mega) llegan
// en la 0.3, más fuentes después.

const VERSION = '0.2.0';
const BASE = 'https://animeav1.com';
const CDN = 'https://cdn.animeav1.com';
const REFERER = BASE + '/';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const FETCH_TIMEOUT_MS = 10000;
const MAX_ITEMS = 40;
const FILAS_EN_PARALELO = 4;

/* ---------- utilidades ---------- */

function log(...args) {
  try { kino.log('[AniJing v' + VERSION + ']', ...args); } catch {}
}

function limpio(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugATitulo(slug) {
  return String(slug || '')
    .split(/[-_/]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function cover(id) {
  return CDN + '/covers/' + id + '.jpg';
}

function backdropDe(id) {
  return CDN + '/backdrops/' + id + '.jpg';
}

function captura(id, n) {
  return CDN + '/screenshots/' + id + '/' + n + '.jpg';
}

async function traer(url, timeoutMs) {
  try {
    const r = await kino.fetch(url, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'es-ES,es;q=0.9' },
      timeoutMs: Math.min(Number(timeoutMs) || FETCH_TIMEOUT_MS, 30000)
    });
    if (!r || !r.ok) return { ok: false, status: r ? r.status : 0, text: '' };
    const t = typeof r.text === 'function' ? await r.text() : String(r.text || '');
    return { ok: true, status: r.status, text: t };
  } catch (e) {
    return { ok: false, status: 0, text: '', error: e };
  }
}

function noRespondio(status) {
  throw kino.error('unavailable', 'AnimeAV1 no respondió (status ' + status + ')', {
    userMessage: 'AnimeAV1 no respondió. Revisa tu conexión o inténtalo en un rato.'
  });
}

/* ---------- lector del __data.json de AnimeAV1 ----------
 * El endpoint entrega {"nodes":[...]} y cada nodo es {"type":"data","data":[...]} con un
 * array plano donde los enteros DENTRO de objetos y arreglos son referencias a posiciones
 * de ese mismo array; los valores que llegan a la raíz del array son finales. Regla de un
 * salto: referencia → casilla del array (escalar final) o → objeto/arreglo cuyos enteros
 * vuelven a ser referencias. Una referencia fuera de rango se respeta como valor.
 */
function leerDataJson(texto) {
  let raiz;
  try { raiz = JSON.parse(texto); } catch { return null; }
  const nodos = raiz && Array.isArray(raiz.nodes) ? raiz.nodes : [];
  let plano = null;
  for (const n of nodos) {
    if (n && n.type === 'data' && Array.isArray(n.data) && n.data.length > 2) {
      if (!plano || n.data.length > plano.length) plano = n.data;
    }
  }
  if (!plano || !plano.length) return null;
  function casilla(i) {
    const v = plano[i];
    if (v === undefined) return i;
    if (Array.isArray(v) || (v && typeof v === 'object')) return profundo(v);
    return v;
  }
  function profundo(v) {
    if (typeof v === 'number') return casilla(v);
    if (Array.isArray(v)) return v.map(profundo);
    if (v && typeof v === 'object') {
      const o = {};
      for (const k of Object.keys(v)) o[k] = profundo(v[k]);
      return o;
    }
    return v;
  }
  const primero = plano[0];
  if (!(primero && typeof primero === 'object')) return null;
  return profundo(primero);
}

/* ---------- caché en memoria del runtime (sin almacenamiento persistente aún) ---------- */
const _datos = new Map();
async function datosDe(camino) {
  if (_datos.has(camino)) return _datos.get(camino);
  const r = await traer(BASE + camino);
  if (!r.ok) return null;
  const raiz = leerDataJson(r.text);
  if (!raiz) return null;
  if (_datos.size > 80) _datos.clear();
  _datos.set(camino, raiz);
  return raiz;
}

/* ---------- catálogo: la puerta de datos ----------
 * /catalogo/__data.json acepta ?search=<q>, ?order=<latest_added|popular|score>,
 * ?category=<pelicula|tv-anime|ova|especial|ona>, ?genre=<slug> y ?page=<n>, y devuelve
 * {results, total, pagination:{currentPage, recordsPerPage, totalPages, totalRecords}}.
 * Cada resultado es {id, title, synopsis, categoryId, slug, category:{name, malId}}.
 */
async function catalogoDatos(params, pagina) {
  const partes = [];
  const p = params || {};
  if (p.busqueda) partes.push('search=' + encodeURIComponent(p.busqueda));
  if (p.orden) partes.push('order=' + encodeURIComponent(p.orden));
  if (p.categoria) partes.push('category=' + encodeURIComponent(p.categoria));
  if (p.genero) partes.push('genre=' + encodeURIComponent(p.genero));
  const num = Math.max(1, parseInt(String(pagina || '1'), 10) || 1);
  if (num > 1) partes.push('page=' + num);
  const camino = '/catalogo/__data.json' + (partes.length ? '?' + partes.join('&') : '');
  const r = await traer(BASE + camino);
  if (!r.ok) {
    log('catálogo: AnimeAV1 respondió ' + r.status);
    noRespondio(r.status);
  }
  const raiz = leerDataJson(r.text);
  if (!raiz || !Array.isArray(raiz.results)) {
    log('catálogo: datos ilegibles');
    noRespondio(0);
  }
  return raiz;
}

function itemDeCatalogo(res) {
  const slug = String(res && res.slug ? res.slug : '').trim();
  if (!slug || !(res && res.id != null)) return null;
  const cat = res.category && typeof res.category === 'object' ? res.category : null;
  const item = {
    id: slug,
    ref: 'av1:' + slug,
    title: limpio(res.title) || slugATitulo(slug),
    kind: cat && cat.malId === 'Movie' ? 'movie' : 'series',
    poster: cover(res.id),
    backdrop: backdropDe(res.id)
  };
  const sinopsis = limpio(res.synopsis);
  if (sinopsis) item.overview = sinopsis.slice(0, 250);
  const anho = String(res.startDate || '').slice(0, 4);
  if (/^\d{4}$/.test(anho)) item.year = anho;
  return item;
}

function itemsDeCatalogo(raiz) {
  const items = [];
  const vistos = new Set();
  for (const res of raiz.results) {
    const item = itemDeCatalogo(res);
    if (!item || vistos.has(item.ref)) continue;
    vistos.add(item.ref);
    items.push(item);
  }
  return items;
}

/* ---------- registro de fuentes (el esqueleto del agregador) ----------
 * Cada fuente es un objeto aislado con su id y sus funciones; las exportaciones de Kino
 * reparten el trabajo entre todas las registradas y una que falla no tumba a las demás.
 */
const FUENTES = {};
function registrarFuente(f) { FUENTES[f.id] = f; }

/* ---------- fuente: AnimeAV1 ---------- */
registrarFuente({
  id: 'av1',
  etiqueta: 'AnimeAV1',

  async buscar(q, query) {
    // Probamos el texto de la persona y, si no suelta nada, los títulos que Kino conoce.
    const intentos = [];
    const meter = (s) => { const t = String(s || '').trim(); if (t && intentos.indexOf(t) === -1) intentos.push(t); };
    meter(q);
    if (query) {
      meter(query.originalTitle);
      for (const alt of (query.altTitles || []).slice(0, 5)) meter(alt);
    }
    for (const intento of intentos) {
      const raiz = await catalogoDatos({ busqueda: intento }, 1);
      let items = itemsDeCatalogo(raiz);
      if (!items.length) continue;
      if (query && (query.type === 'movie' || query.type === 'series')) {
        items = items.slice().sort((a, b) => (a.kind === query.type ? 0 : 1) - (b.kind === query.type ? 0 : 1));
      }
      return items.slice(0, MAX_ITEMS);
    }
    return [];
  },

  async portada() {
    const defs = [
      { id: 'av1-row-eps', titulo: 'Últimos episodios', ref: null, episodios: true },
      { id: 'av1-latest', titulo: 'Últimos agregados', ref: 'av1-latest', params: { orden: 'latest_added' } },
      { id: 'av1-populares', titulo: 'Populares', ref: 'av1-populares', params: { orden: 'popular' } },
      { id: 'av1-score', titulo: 'Mejor puntuados', ref: 'av1-score', params: { orden: 'score' } },
      { id: 'av1-peliculas', titulo: 'Películas', ref: 'av1-peliculas', params: { categoria: 'pelicula' } },
      { id: 'av1-gen-accion', titulo: 'Acción', ref: 'av1-gen:accion', params: { genero: 'accion' } },
      { id: 'av1-gen-fantasia', titulo: 'Fantasía', ref: 'av1-gen:fantasia', params: { genero: 'fantasia' } }
    ];
    const filas = [];
    for (let i = 0; i < defs.length; i += FILAS_EN_PARALELO) {
      const lote = defs.slice(i, i + FILAS_EN_PARALELO);
      const hechas = await Promise.all(lote.map(async (def) => {
        try {
          if (def.episodios) return await filaEpisodios(def);
          const raiz = await catalogoDatos(def.params, 1);
          const items = itemsDeCatalogo(raiz).slice(0, 20);
          if (!items.length) return null;
          return { id: def.id, title: def.titulo, ref: def.ref, items: items };
        } catch (e) {
          log('fila «' + def.titulo + '» falló', (e && e.message) || String(e));
          return null;
        }
      }));
      for (const fila of hechas) if (fila) filas.push(fila);
    }
    if (!filas.length) {
      throw kino.error('unavailable', 'AnimeAV1 no armó ninguna fila', {
        userMessage: 'AnimeAV1 no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    return filas;
  },

  async hoja(ref, cursor) {
    const params = paramsDeFila(ref);
    if (!params) return null;
    const raiz = await catalogoDatos(params, cursor);
    const items = itemsDeCatalogo(raiz);
    let next = undefined;
    const pag = raiz.pagination && typeof raiz.pagination === 'object' ? raiz.pagination : null;
    if (pag && pag.currentPage < pag.totalPages) next = String(pag.currentPage + 1);
    else if (!pag && items.length >= 20) next = String((Math.max(1, parseInt(String(cursor || '1'), 10) || 1)) + 1);
    return { items: items, next: next };
  },

  async detalle(slug) {
    const raiz = await datosDe('/media/' + slug + '/__data.json');
    const media = raiz && raiz.media && typeof raiz.media === 'object' ? raiz.media : null;
    if (!media || !media.title) return null;
    const out = { title: String(media.title) };
    if (media.id != null) {
      out.poster = cover(media.id);
    }
    if (media.synopsis) out.overview = limpio(media.synopsis).slice(0, 400);
    if (media.startDate) out.year = String(media.startDate).slice(0, 4);
    if (Array.isArray(media.genres)) {
      const g = media.genres.map((x) => (x && x.name ? String(x.name) : '')).filter(Boolean);
      if (g.length) out.genres = g.slice(0, 5);
    }
    if (typeof media.score === 'number' && media.score > 0 && media.score <= 10) {
      out.rating = Math.round(media.score * 100) / 100;
    }
    if (typeof media.malId === 'number' && media.malId > 0) out.ids = { mal: media.malId };
    return out;
  },

  async episodios(slug) {
    const raiz = await datosDe('/media/' + slug + '/__data.json');
    const media = raiz && raiz.media && typeof raiz.media === 'object' ? raiz.media : null;
    if (!media || !Array.isArray(media.episodes)) {
      throw kino.error('not_found', 'AnimeAV1 no entregó la serie', {
        userMessage: 'No se pudieron leer los episodios de esta serie en AnimeAV1'
      });
    }
    const mediaId = media.id != null ? media.id : null;
    const vistos = new Set();
    const episodios = [];
    for (const e of media.episodes) {
      const n = e && typeof e.number === 'number' ? e.number : 0;
      if (n < 1 || n > 99999 || vistos.has(n)) continue;
      vistos.add(n);
      let temporada = 1;
      if (e && typeof e.season === 'number' && e.season >= 1 && e.season <= 999) temporada = e.season;
      const ep = {
        season: temporada,
        number: n,
        title: (e && e.title && limpio(e.title)) || 'Episodio ' + n,
        ref: 'av1:' + slug + ':' + n
      };
      if (mediaId != null) ep.still = captura(mediaId, n);
      if (e && e.synopsis) ep.overview = limpio(e.synopsis).slice(0, 250);
      episodios.push(ep);
    }
    episodios.sort((a, b) => a.season - b.season || a.number - b.number);
    const serie = { title: String(media.title || slugATitulo(slug)) };
    if (mediaId != null) serie.poster = cover(mediaId);
    if (media.synopsis) serie.overview = limpio(media.synopsis).slice(0, 400);
    return { series: serie, episodes: episodios };
  },

  async resolver(slug, ep) {
    const n = ep || 1;
    const raiz = await datosDe('/media/' + slug + '/' + n + '/__data.json');
    if (!raiz) {
      throw kino.error('not_found', 'AnimeAV1 no entregó los datos del episodio', {
        userMessage: 'No se pudieron leer los datos de este episodio en AnimeAV1'
      });
    }
    // Los reproductores llegan agrupados por idioma: {"DUB":[{server,url}...], "SUB":[...]}
    const grupos = raiz.embeds && typeof raiz.embeds === 'object' ? raiz.embeds : {};
    const jugables = [];
    const vistos = new Set();
    for (const idioma of Object.keys(grupos)) {
      const lista = grupos[idioma];
      if (!Array.isArray(lista)) continue;
      for (const e of lista) {
        if (!e || typeof e.url !== 'string' || e.url.indexOf('http') !== 0) continue;
        let stream = null;
        const z = /https?:\/\/player\.zilla-networks\.com\/play\/([A-Za-z0-9_-]+)/.exec(e.url);
        if (z) {
          stream = { url: 'https://player.zilla-networks.com/m3u8/' + z[1], headers: { Referer: REFERER } };
        } else if (/\.m3u8(\?|$)/i.test(e.url)) {
          stream = { url: e.url, headers: { Referer: REFERER } };
        } else if (/\.mp4(\?|$)/i.test(e.url)) {
          stream = { url: e.url };
        }
        if (!stream || vistos.has(stream.url)) continue;
        vistos.add(stream.url);
        jugables.push({ url: stream.url, headers: stream.headers, etiqueta: String(e.server || 'Servidor') + ' (' + idioma + ')' });
      }
    }
    if (!jugables.length) {
      throw kino.error('unavailable', 'sin reproductor directo', {
        userMessage: 'Este episodio no tiene reproductor compatible todavía (VOE y MP4Upload llegan en la próxima versión)'
      });
    }
    const out = { url: jugables[0].url };
    if (jugables[0].headers) out.headers = jugables[0].headers;
    if (jugables.length > 1) {
      out.alternatives = jugables.slice(1, 6).map((c) => {
        const alt = { url: c.url, label: c.etiqueta };
        if (c.headers) alt.headers = c.headers;
        return alt;
      });
    }
    return out;
  }
});

/* ---------- filas del home ---------- */

async function filaEpisodios(def) {
  const datos = await datosDe('/__data.json');
  const lista = datos && Array.isArray(datos.latestEpisodes) ? datos.latestEpisodes : [];
  const items = [];
  const vistos = new Set();
  for (const e of lista) {
    const m = e && e.media;
    if (!m || m.id == null || !m.slug || !m.title) continue;
    if (vistos.has(m.slug)) continue;
    vistos.add(m.slug);
    const cat = m.category && typeof m.category === 'object' ? m.category : null;
    const item = {
      id: m.slug,
      ref: 'av1:' + m.slug,
      title: limpio(m.title),
      kind: cat && cat.malId === 'Movie' ? 'movie' : 'series',
      poster: cover(m.id)
    };
    if (typeof e.number === 'number' && e.number >= 1) {
      item.badges = ['EP ' + e.number];
      item.backdrop = captura(m.id, e.number);
    } else {
      item.backdrop = backdropDe(m.id);
    }
    if (m.synopsis) item.overview = limpio(m.synopsis).slice(0, 250);
    const anho = String(m.startDate || '').slice(0, 4);
    if (/^\d{4}$/.test(anho)) item.year = anho;
    if (m.mature === true) item.adult = true;
    items.push(item);
  }
  if (!items.length) return null;
  return { id: def.id, title: def.titulo, items: items.slice(0, 20) };
}

function paramsDeFila(ref) {
  const r = String(ref || '');
  if (r === 'av1-catalogo') return {};
  if (r === 'av1-latest') return { orden: 'latest_added' };
  if (r === 'av1-populares') return { orden: 'popular' };
  if (r === 'av1-score') return { orden: 'score' };
  if (r === 'av1-peliculas') return { categoria: 'pelicula' };
  if (r.indexOf('av1-gen:') === 0) return { genero: r.slice(8) };
  return null;
}

/* ---------- exportaciones de Kino (el abanico del agregador) ---------- */

function partirRef(ref) {
  const r = String(ref || '');
  if (r.indexOf('av1:') !== 0) return null;
  const resto = r.slice(4);
  const corte = resto.lastIndexOf(':');
  if (corte === -1) return { fuente: 'av1', slug: resto, ep: null };
  return { fuente: 'av1', slug: resto.slice(0, corte), ep: resto.slice(corte + 1) };
}

async function search(query) {
  const q = query && typeof query.q === 'string' ? query.q.trim() : '';
  if (!q && !(query && (query.originalTitle || (query.altTitles || []).length))) return [];
  const fuentes = Object.values(FUENTES);
  const respuestas = await Promise.all(fuentes.map(async (f) => {
    try {
      return { items: await f.buscar(q || (query && query.originalTitle), query), fallo: false };
    } catch (e) {
      log('buscar falló en ' + f.id, (e && e.message) || String(e));
      return { items: [], fallo: true, error: e };
    }
  }));
  const salida = [];
  const vistos = new Set();
  let fallos = 0;
  let ultimoError = null;
  for (const rta of respuestas) {
    if (rta.fallo) { fallos++; ultimoError = rta.error; }
    for (const it of rta.items || []) {
      if (!it || !it.ref || vistos.has(it.ref)) continue;
      vistos.add(it.ref);
      salida.push(it);
    }
  }
  if (fallos === fuentes.length) {
    if (ultimoError && ultimoError.userMessage) throw ultimoError;
    throw kino.error('unavailable', 'ninguna fuente respondió', {
      userMessage: 'Ninguna fuente de anime respondió la búsqueda'
    });
  }
  return salida.slice(0, MAX_ITEMS);
}

async function home() {
  const filas = [];
  const errores = [];
  for (const f of Object.values(FUENTES)) {
    try {
      const propias = await f.portada();
      for (const fila of propias) filas.push(fila);
    } catch (e) {
      log('portada falló en ' + f.id, (e && e.message) || String(e));
      errores.push(e);
    }
  }
  if (!filas.length && errores.length) {
    const e = errores[0];
    if (e && e.userMessage) throw e;
    throw kino.error('unavailable', 'ninguna fuente armó portada', {
      userMessage: 'AnimeAV1 no respondió. Revisa tu conexión o inténtalo en un rato.'
    });
  }
  return filas;
}

async function browse(ref, cursor) {
  for (const f of Object.values(FUENTES)) {
    if (String(ref).indexOf(f.id + '-') === 0) {
      const hoja = await f.hoja(ref, cursor);
      if (hoja) return hoja;
    }
  }
  throw kino.error('not_found', 'esa fila ya no existe');
}

async function episodes(ref) {
  const p = partirRef(ref);
  if (!p || !FUENTES[p.fuente]) throw kino.error('not_found', 'ref desconocido');
  return FUENTES[p.fuente].episodios(p.slug);
}

async function details(ref) {
  const p = partirRef(ref);
  if (!p || !FUENTES[p.fuente]) return null;
  try {
    return await FUENTES[p.fuente].detalle(p.slug);
  } catch (e) {
    log('detalle falló', (e && e.message) || String(e));
    return null;
  }
}

async function resolve(ref, options) {
  const p = partirRef(ref);
  if (!p || !FUENTES[p.fuente]) throw kino.error('not_found', 'ref desconocido');
  const n = p.ep ? parseInt(p.ep, 10) : 1;
  return FUENTES[p.fuente].resolver(p.slug, Number.isFinite(n) && n >= 1 ? n : 1);
}

export { search, home, browse, episodes, details, resolve };
