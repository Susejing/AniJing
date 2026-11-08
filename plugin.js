// AniJing v0.1.0 «Hola mundo» — anime puro para Kino.
// Fuente: AnimeAV1 (https://animeav1.com), su API interna __data.json para metadatos y
// episodios, y su reproductor Zilla (HLS) para la reproducción. Los ref son «av1:<slug>»
// (serie o película) y «av1:<slug>:<número>» (episodio). El esqueleto de fuentes aisladas
// se tomó como patrón del plugin comunitario YojaTV (GPL-3.0); este código también es GPL-3.0.
//
// HONESTO v0.1.0: solo se reproduce lo que AnimeAV1 sirve directo (Zilla/HLS o un archivo
// .m3u8/.mp4 contundente). Los reproductores que necesitan extractor (VOE, MP4Upload, Mega)
// llegan en la 0.2, y más fuentes después.

const VERSION = '0.1.0';
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

/* ---------- tarjetas del catálogo HTML de AnimeAV1 ----------
 * Cada tarjeta es un enlace a /media/<slug> con su <h3> de título y, cuando la portada
 * no es perezosa, el <img> en la misma ventana. v0.1.0 lista todo como «series»: el
 * catálogo mezcla películas y el HTML no las distingue en la tarjeta.
 */
function tarjetasAv1(html) {
  const items = [];
  const vistos = new Set();
  const re = /href="\/media\/([^"\/?#]+)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const slug = m[1];
    if (vistos.has(slug)) continue;
    const ventana = html.slice(m.index, m.index + 700);
    const t = /<h3[^>]*>([^<]+)<\/h3>/.exec(ventana) || /alt="Portada de ([^"]+)"/.exec(ventana);
    if (!t || !limpio(t[1])) continue;
    const posterM = /<img[^>]+(?:data-src|src)="([^"]+)"/.exec(ventana);
    let poster = posterM ? posterM[1] : null;
    if (poster && poster.indexOf('//') === 0) poster = 'https:' + poster;
    else if (poster && poster.indexOf('/') === 0) poster = BASE + poster;
    vistos.add(slug);
    const item = {
      id: slug,
      ref: 'av1:' + slug,
      title: limpio(t[1]) || slugATitulo(slug),
      kind: 'series'
    };
    if (poster && poster.indexOf('http') === 0) item.poster = poster;
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
    const r = await traer(BASE + '/catalogo?search=' + encodeURIComponent(q));
    if (!r.ok) throw new Error('AnimeAV1 respondió ' + r.status);
    return tarjetasAv1(r.text);
  },

  async portada() {
    const r = await traer(BASE + '/catalogo');
    if (!r.ok) throw new Error('AnimeAV1 respondió ' + r.status);
    return { id: 'av1-catalogo', title: 'AnimeAV1 · Catálogo', ref: 'av1-catalogo', items: tarjetasAv1(r.text).slice(0, 30) };
  },

  async hoja(cursor) {
    const pagina = Math.max(1, parseInt(String(cursor || '1'), 10) || 1);
    const r = await traer(BASE + '/catalogo?page=' + pagina);
    if (!r.ok) throw new Error('AnimeAV1 respondió ' + r.status);
    const items = tarjetasAv1(r.text);
    return { items: items, next: items.length >= 12 ? String(pagina + 1) : undefined };
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
    if (!media || !Array.isArray(media.episodes)) return { episodes: [] };
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
      return { items: [], fallo: true };
    }
  }));
  const salida = [];
  const vistos = new Set();
  let fallos = 0;
  for (const rta of respuestas) {
    if (rta.fallo) fallos++;
    for (const it of rta.items || []) {
      if (!it || !it.ref || vistos.has(it.ref)) continue;
      vistos.add(it.ref);
      salida.push(it);
    }
  }
  if (!salida.length && fallos === fuentes.length) {
    throw kino.error('unavailable', 'ninguna fuente respondió', {
      userMessage: 'Ninguna fuente de anime respondió la búsqueda'
    });
  }
  return salida.slice(0, MAX_ITEMS);
}

async function home() {
  const filas = [];
  for (const f of Object.values(FUENTES)) {
    try {
      const fila = await f.portada();
      if (fila && Array.isArray(fila.items) && fila.items.length) filas.push(fila);
    } catch (e) {
      log('portada falló en ' + f.id, (e && e.message) || String(e));
    }
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
