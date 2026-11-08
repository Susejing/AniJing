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
// AniJing v0.1.1 «El catálogo por la puerta de datos» — anime puro para Kino.
// Fuente: AnimeAV1 (https://animeav1.com): TODO por su API interna __data.json (catálogo,
// búsqueda, fichas y episodios) y su reproductor Zilla (HLS) para la reproducción. Los ref
// son «av1:<slug>» (serie o película) y «av1:<slug>:<número>» (episodio). El esqueleto de
// fuentes aisladas se tomó como patrón del plugin comunitario YojaTV (GPL-3.0); este
// código también es GPL-3.0.
//
// v0.1.0 rascaba el HTML del catálogo y las tarjetas no viven ahí: la página las pinta
// después con los datos de /catalogo/__data.json. Esta versión usa ese endpoint directo.
// HONESTO: solo se reproduce lo que AnimeAV1 sirve directo (Zilla/HLS o un .m3u8/.mp4
// contundente). Los reproductores que necesitan extractor (VOE, MP4Upload, Mega) llegan
// en la 0.2, más fuentes después, y los pósters de la cuadrícula con AniList (los datos de
// AnimeAV1 no los traen).

const VERSION = '0.1.1';
const BASE = 'https://animeav1.com';
const REFERER = BASE + '/';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const FETCH_TIMEOUT_MS = 10000;
const MAX_ITEMS = 40;

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
 * /catalogo/__data.json acepta ?search=<q> y ?page=<n> y devuelve {results, total,
 * pagination:{currentPage, recordsPerPage, totalPages, totalRecords}}. Cada resultado es
 * {id, title, synopsis, categoryId, slug, category:{name, malId}} — sin póster (esa es la
 * tarea de AniList en la 0.2). Las películas traen category.malId = "Movie".
 */
async function catalogoDatos(busqueda, pagina) {
  let camino = '/catalogo/__data.json';
  const params = [];
  if (busqueda) params.push('search=' + encodeURIComponent(busqueda));
  if (pagina && pagina > 1) params.push('page=' + pagina);
  if (params.length) camino += '?' + params.join('&');
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
  if (!slug) return null;
  const cat = res.category && typeof res.category === 'object' ? res.category : null;
  const item = {
    id: slug,
    ref: 'av1:' + slug,
    title: limpio(res.title) || slugATitulo(slug),
    kind: cat && cat.malId === 'Movie' ? 'movie' : 'series'
  };
  const sinopsis = limpio(res.synopsis);
  if (sinopsis) item.overview = sinopsis.slice(0, 250);
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

  async buscar(q) {
    const raiz = await catalogoDatos(q, 1);
    return itemsDeCatalogo(raiz).slice(0, MAX_ITEMS);
  },

  async portada() {
    const raiz = await catalogoDatos('', 1);
    return { id: 'av1-catalogo', title: 'AnimeAV1 · Catálogo', ref: 'av1-catalogo', items: itemsDeCatalogo(raiz) };
  },

  async hoja(cursor) {
    const pagina = Math.max(1, parseInt(String(cursor || '1'), 10) || 1);
    const raiz = await catalogoDatos('', pagina);
    const items = itemsDeCatalogo(raiz);
    let next = undefined;
    const pag = raiz.pagination && typeof raiz.pagination === 'object' ? raiz.pagination : null;
    if (pag && pag.currentPage < pag.totalPages) next = String(pag.currentPage + 1);
    else if (!pag && items.length >= 20) next = String(pagina + 1);
    return { items: items, next: next };
  },

  async detalle(slug) {
    const raiz = await datosDe('/media/' + slug + '/__data.json');
    const media = raiz && raiz.media && typeof raiz.media === 'object' ? raiz.media : null;
    if (!media || !media.title) return null;
    const out = { title: String(media.title) };
    if (media.poster && String(media.poster).indexOf('http') === 0) out.poster = String(media.poster);
    if (media.synopsis) out.overview = limpio(media.synopsis).slice(0, 400);
    if (media.startDate) out.year = String(media.startDate).slice(0, 4);
    if (Array.isArray(media.genres)) {
      const g = media.genres.map((x) => (x && x.name ? String(x.name) : '')).filter(Boolean);
      if (g.length) out.genres = g.slice(0, 6);
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
    const numeros = [];
    const vistos = new Set();
    for (const e of media.episodes) {
      const n = e && typeof e.number === 'number' ? e.number : 0;
      if (n >= 1 && n <= 99999 && !vistos.has(n)) { vistos.add(n); numeros.push(n); }
    }
    numeros.sort((a, b) => a - b);
    const serie = { title: String(media.title || slugATitulo(slug)) };
    if (media.poster && String(media.poster).indexOf('http') === 0) serie.poster = String(media.poster);
    if (media.synopsis) serie.overview = limpio(media.synopsis).slice(0, 400);
    return {
      series: serie,
      episodes: numeros.map((n) => ({
        season: 1,
        number: n,
        title: 'Episodio ' + n,
        ref: 'av1:' + slug + ':' + n
      }))
    };
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
  if (!q) return [];
  const fuentes = Object.values(FUENTES);
  const respuestas = await Promise.all(fuentes.map(async (f) => {
    try {
      return { items: await f.buscar(q), fallo: false };
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
      const fila = await f.portada();
      if (fila && Array.isArray(fila.items) && fila.items.length) filas.push(fila);
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
    if (ref === f.id + '-catalogo') return f.hoja(cursor);
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
