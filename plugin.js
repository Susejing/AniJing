// AniJing — anime puro para Kino: catálogo, búsqueda, fichas, episodios y reproducción
// desde AnimeAV1, MonosChinos y LataAnime, con extractores para todos sus servidores.
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
// AniJing v0.3.0 «Todos los servidores» — anime puro para Kino.
// Fuentes: AnimeAV1 (animeav1.com, todo por su API interna __data.json),
// MonosChinos (monoschinos.st) y LataAnime (latanime.org). Reproducción:
// Zilla y enlaces directos de AnimeAV1 más extractores compartidos para
// Voe, MP4Upload, MixDrop, Uqload, YourUpload, StreamTape, UPNShare,
// Doodstream, Ok.ru, Hexload, SaveFiles, StreamWish y Filemoon, con el
// navegador oculto de Kino como respaldo («browser»: true). Los ref son
// «av1:<slug>» (serie), «av1:<slug>:<n>» (episodio), «av1:<slug>:<n>:<i>»
// (servidor del menú), y lo mismo con «mc:» y «lat:».
//
// HONESTO: los algoritmos de decodificación (el baile F7 de Voe, el packer
// de Dean Edwards, el AES de UPNShare, el pass_md5 de Doodstream) son
// reimplementaciones propias de patrones públicos de la comunidad Kino;
// no se copió código de otros plugins. Mega y Netu quedan fuera: van
// cifrados o piden captcha. Si un servidor cambia su baile, ese servidor
// falla con mensaje honesto y quedan los demás en el menú Servidor.

// AniJing v0.4.0 «La pantalla propia» — el Inicio deja de ser el genérico:
// una pantalla de canvas completa estilo MangaTrack, con su barrita única
// (flechita para salir, lupa para buscar y el selector de fuentes), un
// destacado que rota por día (el featured de AnimeAV1) y los rieles de Home
// con su «Ver más». El selector de fuentes (Todas / AnimeAV1 / MonosChinos /
// LataAnime) cambia el contenido al toque y su elección se recuerda. La
// pantalla salta al detalle y a la búsqueda de Kino con go (title, search,
// close), así que el catálogo queda intacto: búsqueda global, fichas,
// episodios, resolve y los 13 extractores de la 0.3.0. Además «Ver más»
// para la fila de Últimos episodios (ref av1-ultimos-eps) y para las tres
// filas de LataAnime (novedades, en latino y en castellano), que antes no
// lo llevaban. La pantalla pide apiVersion 19 por la barrita única
// (mergeWithKinoBar); el selector y el destacado viven en el estado de la
// pantalla (tope 64 KB: 12 títulos por riel, sin sinopsis).
//
// AniJing v0.5.0 «El Inicio ordenado» — «Todas» deja de ser un revoltijo:
// cada fuente ocupa su propia sección con un encabezado grande arriba
// (AnimeAV1, MonosChinos, LataAnime; tocar el nombre pasa a ver solo esa
// fuente) y debajo solo sus rieles, sin el sufijo «· Fuente» que doblaba
// el nombre. En «Todas», AnimeAV1 aporta su núcleo (Últimos episodios,
// Últimos agregados, Populares y Mejor puntuados): sus otras filas
// (Películas, Acción, Fantasía) viven en su sección propia, al tocar su
// nombre. Las secciones dan aire entre bloques y el scroll se lee por
// partes, como el Inicio de MangaTrack: destacado, secciones, y cada
// riel con su «Ver más».

// v0.6.0 «La cosecha» — cinco fuentes nuevas se suman al agregador:
// OtakusTV (directorio en /animes, pósters derivables del slug,
// reproductores Filemoon/Byse/MP4Upload), AnimeYT (buscador propio /?s=,
// catálogo /tv/ con películas, ok.ru y filemoon), EstrenosAnime (listados
// de últimos episodios, sub y latino; sin buscador de texto propio, se
// dice con honestidad), AnimeOnline (género /genero/ver-anime, fichas
// temporada/online, episodios /episodio/) e IvAnime (vive en .buzz,
// porque .com es descargas). Las dos con multiserver propio caen a la
// captura del navegador oculto cuando el HTML no alcanza. La pantalla
// propia crece a 9 fuentes en su menú y «Todas» respira: cada fuente
// aporta su núcleo, el resto vive en su sección.

// v0.6.1 «La compostura» — la 0.6.0 salió al teléfono y el teléfono mandó:
// cuatro reparaciones. OtakusTV: su página de episodio carga los players
// con JavaScript (opciones sin URLs legibles), así que ya no hay guard que
// impida la captura: el navegador oculto abre el player por defecto.
// AnimeYT: los pósters vienen en atributos perezosos (data-lazy-src…) y
// sus players se esconden tras un contenedor propio (mytsumi.com) que
// ahora se sondea: se carga y se cosechan los servidores de adentro.
// EstrenosAnime: en sus listados la imagen va antes del ancla; ahora se
// mira también hacia atrás. AnimeOnline: las tarjetas del directorio
// enlazan a /anime/<slug>/, camino que ahora se acepta (ficha, episodios
// y portada con respaldo en la home). IvAnime: mismo guard fuera. Nada
// de mentiras: si un episodio no abre, cae a la captura y si aún no,
// mensaje honesto.
// v0.6.2 «El juicio del anuncio» — la 0.6.1 en el teléfono enseñó tres
// cosas: la captura de OtakusTV pescó el VIDEO DEL ANUNCIO en vez del
// capítulo (la publicidad pre-roll se interpone), así que la captura
// ahora elige con cabeza — primero los manifiestos (m3u8/mpd), nada de
// URLs de anuncios, y si lo pescado no es un manifiesto, una SEGUNDA
// pasada más larga con captureAll que recoge también las peticiones
// (el capítulo llega cuando el anuncio termina). EstrenosAnime: los
// pósters de «Últimos episodios» siguen grises porque las insignias
// SUB/EP alejan la imagen del ancla: la ventana hacia atrás crece a
// 1500 y si el atributo no se reconoce, se caza cualquier URL de imagen
// con extensión (srcset y compañía). AnimeYT: la misma ventana hacia
// atrás en sus tarjetas. AnimeOnline: su puerta la guarda Cloudflare
// y a la petición del plugin le cierra la cara — ahora se detecta la
// revisión y se dice la verdad, con un botón «Pasar la revisión» en
// la pantalla de la fuente: una ventanita de navegador de verdad que
// la persona pasa una vez; la galleta de acceso y el disfraz del
// navegador que la ganó viajan desde entonces con cada petición, y el
// catálogo de la página cargada se lee del HTML que la ventanita
// entrega (Kino lo da renderizado, hasta 2 millones de caracteres).

const VERSION = '0.6.2';
const BASE_AV1 = 'https://animeav1.com';
const CDN_AV1 = 'https://cdn.animeav1.com';
const BASE_MC = 'https://monoschinos.st';
const BASE_LAT = 'https://latanime.org';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const FETCH_MS = 10000;
const MAX_ITEMS = 40;
const FILAS_EN_PARALELO = 4;
const MIME_HLS = 'application/vnd.apple.mpegurl';

/* ---------- utilidades ---------- */

function log(...args) {
  try { kino.log('[AniJing v' + VERSION + ']', ...args); } catch (e) {}
}

function decHtml(s) {
  return String(s || '')
    .replace(/&#(\d+);/g, function (m, n) { return String.fromCharCode(parseInt(n, 10)); })
    .replace(/&#x([0-9a-f]+);/gi, function (m, h) { return String.fromCharCode(parseInt(h, 16)); })
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

function limpio(s) {
  return decHtml(String(s || '').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

function slugATitulo(slug) {
  return String(slug || '')
    .split(/[-_/]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function origenDe(u) {
  const m = /^(https?:\/\/[^/?#]+)/i.exec(String(u || ''));
  return m ? m[1] : '';
}

function absolutizar(u, base) {
  const s = String(u || '').trim();
  if (!s) return '';
  if (s.indexOf('//') === 0) return 'https:' + s;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.charAt(0) === '/') return origenDe(base) + s;
  return base ? base.replace(/[^/]*$/, '') + s : s;
}

function mimeDe(url) {
  if (/\.m3u8/i.test(url)) return MIME_HLS;
  if (/\.mp4/i.test(url)) return 'video/mp4';
  return undefined;
}

/* base64 puro (sin atob/btoa del entorno) */
function b64Bytes(s) {
  s = String(s || '').replace(/-/g, '+').replace(/_/g, '/').replace(/[^A-Za-z0-9+/=]/g, '');
  while (s.length % 4) s += '=';
  const tbl = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const out = [];
  for (let i = 0; i < s.length; i += 4) {
    const a = tbl.indexOf(s.charAt(i));
    const b = tbl.indexOf(s.charAt(i + 1));
    const c = tbl.indexOf(s.charAt(i + 2));
    const d = tbl.indexOf(s.charAt(i + 3));
    out.push((a << 2) | (b >> 4));
    if (c >= 0) out.push(((b & 15) << 4) | (c >> 2));
    if (d >= 0) out.push(((c & 3) << 6) | d);
  }
  return out;
}

function utf8De(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; ) {
    const c = bytes[i++];
    if (c < 128) s += String.fromCharCode(c);
    else if (c < 224) s += String.fromCharCode(((c & 31) << 6) | (bytes[i++] & 63));
    else if (c < 240) s += String.fromCharCode(((c & 15) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63));
    else {
      const cp = ((c & 7) << 18) | ((bytes[i++] & 63) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63);
      const v = cp - 0x10000;
      s += String.fromCharCode(0xd800 + (v >> 10), 0xdc00 + (v & 1023));
    }
  }
  return s;
}

function b64Texto(s) {
  try { return utf8De(b64Bytes(s)); } catch (e) { return ''; }
}

function b64Latin1(s) {
  try {
    const bytes = b64Bytes(s);
    let out = '';
    for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
    return out;
  } catch (e) { return ''; }
}

async function traer(url, opciones) {
  const o = opciones || {};
  const cabeceras = Object.assign({
    'User-Agent': UA,
    'Accept-Language': 'es-ES,es;q=0.9',
    Accept: 'text/html,application/xhtml+xml,*/*'
  }, o.headers || {});
  const opts = {
    headers: cabeceras,
    timeoutMs: Math.min(Number(o.timeoutMs) || FETCH_MS, 30000)
  };
  if (o.metodo === 'POST') {
    opts.method = 'POST';
    opts.body = { form: o.form || {} };
  }
  try {
    const r = await kino.fetch(url, opts);
    if (!r || !r.ok) return { ok: false, status: r ? r.status : 0, url: url, text: '' };
    const t = typeof r.text === 'function' ? await r.text() : String(r.text || '');
    return { ok: true, status: r.status, url: r.url || url, text: t };
  } catch (e) {
    return { ok: false, status: 0, url: url, text: '', error: e };
  }
}

function noRespondio(status) {
  throw kino.error('unavailable', 'AnimeAV1 no respondió (status ' + status + ')', {
    userMessage: 'AnimeAV1 no respondió. Revisa tu conexión o inténtalo en un rato.'
  });
}

function configDe(clave) {
  try {
    if (kino.config && typeof kino.config.get === 'function') return kino.config.get(clave);
  } catch (e) {}
  try {
    if (kino.config && kino.config[clave] != null) return kino.config[clave];
  } catch (e) {}
  return '';
}

/* ---------- desempaquetador p.a.c.k.e.r ---------- */
/* Dean Edwards comprime JS en base 62 (0-9, a-z, A-Z); Number.toString solo
 * llega a 36, así que la conversión va a mano. */

function b62(n, a) {
  const d = n % a;
  const cabeza = n < a ? '' : b62(Math.floor(n / a), a);
  return cabeza + (d > 35 ? String.fromCharCode(d + 29) : d.toString(36));
}

function desempaquetarUno(payload, radix, count, wordsRaw) {
  const words = wordsRaw.split('|');
  const dic = {};
  for (let i = 0; i < count; i++) {
    const k = b62(i, radix);
    dic[k] = words[i] || k;
  }
  return payload.replace(/\b\w+\b/g, function (w) {
    return Object.prototype.hasOwnProperty.call(dic, w) ? dic[w] : w;
  });
}

function jsUnpack(origen) {
  const src = String(origen || '');
  const res = [
    /\}\s*\(\s*'((?:\\'|[^'])*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'((?:\\'|[^'])*)'\s*\.split\s*\(\s*'\|'\s*\)/g,
    /\}\s*\(\s*"((?:\\"|[^"])*)"\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*"((?:\\"|[^"])*)"\s*\.split\s*\(\s*"\|"\s*\)/g
  ];
  let out = '';
  for (let r = 0; r < res.length; r++) {
    const q = r === 0 ? "'" : '"';
    let m;
    while ((m = res[r].exec(src))) {
      try {
        const payload = m[1].split('\\' + q).join(q).replace(/\\\\/g, '\\');
        const words = m[4].split('\\' + q).join(q);
        out += '\n' + desempaquetarUno(payload, parseInt(m[2], 10), parseInt(m[3], 10), words);
      } catch (e) {}
    }
  }
  return out;
}

function desempaquetarTodo(html) {
  const primero = jsUnpack(html);
  if (!primero) return '';
  const segundo = jsUnpack(primero);
  return primero + (segundo ? '\n' + segundo : '');
}

function esUrlDeVideo(u) {
  const s = String(u || '');
  if (!/^https?:\/\//i.test(s)) return false;
  if (/doubleclick|googlesyndication|adserver|\/ads?\//i.test(s)) return false;
  if (/\.js(?:\?|$)|\.css(?:\?|$)|\.json(?:\?|$)|\/player\/videojs\//i.test(s)) return false;
  if (/\.(?:m3u8|mp4)(?:$|[?#])/i.test(s)) return true;
  if (/\/(?:hls|hls2|dash)\//i.test(s)) return true;
  if (/\/d\/[^/]+\/video\.mp4/i.test(s)) return true;
  return false;
}

function urlDeStream(html, base) {
  const src = String(html || '')
    .replace(/\\\//g, '/')
    .replace(/\\u0026/gi, '&')
    .replace(/&amp;/g, '&');
  const raiz = base || '';
  function fix(u) {
    u = String(u || '').replace(/\\/g, '').trim();
    if (u.indexOf('//') === 0) return 'https:' + u;
    if (u.charAt(0) === '/') return origenDe(raiz) + u;
    return u;
  }
  // mp4upload nuevo: https://a4.mp4upload.com:183/d/<token>/video.mp4 (antes que
  // los patrones genéricos, para no confundir «mp4» dentro del nombre del host).
  let m = /https?:\/\/[a-z0-9.-]+(?::\d+)?\/d\/[A-Za-z0-9]+\/video\.mp4/i.exec(src);
  if (m) return m[0];
  m = /MDCore\.wurl\s*=\s*["']([^"']+)["']/i.exec(src);
  if (m && esUrlDeVideo(fix(m[1]))) return fix(m[1]);
  m = /\bwurl\s*=\s*["']([^"']+)["']/i.exec(src);
  if (m && esUrlDeVideo(fix(m[1]))) return fix(m[1]);
  // StreamWish y familia: links = { "hls4": "...", "hls3": "...", "hls2": "..." }
  const hre = /["']hls[234]["']\s*:\s*["']([^"']+)["']/gi;
  let h;
  const hls = [];
  while ((h = hre.exec(src))) hls.push(fix(h[1]));
  for (let i = 0; i < hls.length; i++) if (esUrlDeVideo(hls[i])) return hls[i];
  // src: "https://.../video.mp4" (Video.js / player nuevo de Mp4Upload)
  m = /(?:src|file|source|video_url)\s*[:=]\s*["']((?:https?:)?\/\/[^"']+)["']/i.exec(src);
  if (m && esUrlDeVideo(fix(m[1]))) return fix(m[1]);
  const patrones = [
    /(?:file|src|source|video_url)["']?\s*[:=]\s*["']((?:https?:)?\/\/[^"'\s<>]+\/[^"'\s<>]*\.(?:m3u8|mp4)(?:\?[^"'\s<>]*)?)["']/i,
    /(?:file|src|source)["']?\s*[:=]\s*["'](\/[^"'\s<>]+\.m3u8[^"'\s<>]*)["']/i,
    /https?:\/\/[^"'\s<>]+\/[^"'\s<>]*\.m3u8(?:\?[^"'\s<>]*)?/i,
    /https?:\/\/[^"'\s<>]+\/[^"'\s<>]*\.mp4(?:\?[^"'\s<>]*)?/i,
    /["']((?:https?:)?\/\/[^"']+\/[^"']*\.m3u8(?:\?[^"']*)?)["']/i,
    /["']((?:https?:)?\/\/[^"']+\/[^"']*\.mp4(?:\?[^"']*)?)["']/i
  ];
  for (let i = 0; i < patrones.length; i++) {
    const re = new RegExp(patrones[i].source, 'gi');
    let mm;
    while ((mm = re.exec(src))) {
      const cand = fix(mm[1] || mm[0]);
      if (esUrlDeVideo(cand)) return cand;
    }
  }
  return '';
}

function borrado(html) {
  return /File Not Found|deleted|not found|removed|no (longer|existe)|expirad|Video not found/i.test(String(html || ''));
}

/* ---------- AES-128-CBC (UPNShare cifra el JSON de su API) ---------- */

const AES_SBOX_HEX = '637c777bf26b6fc53001672bfed7ab76ca82c97dfa5947f0add4a2af9ca472c0b7fd9326363ff7cc34a5e5f171d8311504c723c31896059a071280e2eb27b27509832c1a1b6e5aa0523bd6b329e32f8453d100ed20fcb15b6acbbe394a4c58cfd0efaafb434d338545f9027f503c9fa851a3408f929d38f5bcb6da2110fff3d2cd0c13ec5f974417c4a77e3d645d197360814fdc222a908846eeb814de5e0bdbe0323a0a4906245cc2d3ac629195e479e7c8376d8dd54ea96c56f4ea657aae08ba78252e1ca6b4c6e8dd741f4bbd8b8a703eb5664803f60e613557b986c11d9ee1f8981169d98e949b1e87e9ce5528df8ca1890dbfe6426841992d0fb054bb16';
const AES_SBOX = new Uint8Array(256);
const AES_INV = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
  AES_SBOX[i] = parseInt(AES_SBOX_HEX.substr(i * 2, 2), 16);
  AES_INV[AES_SBOX[i]] = i;
}
function aesMul(a, b) {
  let p = 0;
  while (b) {
    if (b & 1) p ^= a;
    a = ((a << 1) ^ (a & 0x80 ? 0x11b : 0)) & 0xff;
    b >>= 1;
  }
  return p;
}
const AES_M9 = new Uint8Array(256), AES_M11 = new Uint8Array(256), AES_M13 = new Uint8Array(256), AES_M14 = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
  AES_M9[i] = aesMul(i, 9);
  AES_M11[i] = aesMul(i, 11);
  AES_M13[i] = aesMul(i, 13);
  AES_M14[i] = aesMul(i, 14);
}
function aesExpandKey(key) {
  const w = new Uint8Array(176);
  w.set(key);
  let rcon = 1;
  for (let i = 16; i < 176; i += 4) {
    let t0 = w[i - 4], t1 = w[i - 3], t2 = w[i - 2], t3 = w[i - 1];
    if (i % 16 === 0) {
      const x = t0;
      t0 = AES_SBOX[t1] ^ rcon;
      t1 = AES_SBOX[t2];
      t2 = AES_SBOX[t3];
      t3 = AES_SBOX[x];
      rcon = ((rcon << 1) ^ (rcon & 0x80 ? 0x11b : 0)) & 0xff;
    }
    w[i] = w[i - 16] ^ t0;
    w[i + 1] = w[i - 15] ^ t1;
    w[i + 2] = w[i - 14] ^ t2;
    w[i + 3] = w[i - 13] ^ t3;
  }
  return w;
}
function aesDecryptBlock(w, input, out) {
  const s = new Uint8Array(16);
  const t = new Uint8Array(16);
  for (let i = 0; i < 16; i++) s[i] = input[i] ^ w[160 + i];
  for (let round = 9; round >= 0; round--) {
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) t[((c + r) % 4) * 4 + r] = s[c * 4 + r];
    for (let i = 0; i < 16; i++) s[i] = AES_INV[t[i]] ^ w[round * 16 + i];
    if (round > 0) {
      for (let c = 0; c < 4; c++) {
        const a0 = s[c * 4], a1 = s[c * 4 + 1], a2 = s[c * 4 + 2], a3 = s[c * 4 + 3];
        s[c * 4] = AES_M14[a0] ^ AES_M11[a1] ^ AES_M13[a2] ^ AES_M9[a3];
        s[c * 4 + 1] = AES_M9[a0] ^ AES_M14[a1] ^ AES_M11[a2] ^ AES_M13[a3];
        s[c * 4 + 2] = AES_M13[a0] ^ AES_M9[a1] ^ AES_M14[a2] ^ AES_M11[a3];
        s[c * 4 + 3] = AES_M11[a0] ^ AES_M13[a1] ^ AES_M9[a2] ^ AES_M14[a3];
      }
    }
  }
  out.set(s);
}
function aesDescifrarHex(hex, claveTexto, ivTexto) {
  const limpio_ = String(hex).trim();
  if (!/^[0-9a-fA-F]+$/.test(limpio_) || limpio_.length % 32 !== 0) throw new Error('no es AES-CBC hex');
  const data = new Uint8Array(limpio_.length / 2);
  for (let i = 0; i < data.length; i++) data[i] = parseInt(limpio_.substr(i * 2, 2), 16);
  const clave = new Uint8Array(16);
  for (let i = 0; i < 16; i++) clave[i] = claveTexto.charCodeAt(i) & 0xff;
  const iv = new Uint8Array(16);
  for (let i = 0; i < 16; i++) iv[i] = ivTexto.charCodeAt(i) & 0xff;
  const w = aesExpandKey(clave);
  let prev = iv;
  const out = new Uint8Array(data.length);
  const block = new Uint8Array(16);
  for (let off = 0; off < data.length; off += 16) {
    aesDecryptBlock(w, data.subarray(off, off + 16), block);
    for (let i = 0; i < 16; i++) out[off + i] = block[i] ^ prev[i];
    prev = data.subarray(off, off + 16);
  }
  const pad = out[out.length - 1];
  const fin = pad >= 1 && pad <= 16 ? out.length - pad : out.length;
  return utf8De(out.subarray(0, fin));
}

const UPN_CLAVE = 'kiemtienmua911ca';
const UPN_IV = '1234567890oiuytr';

/* ---------- navegador oculto de Kino (respaldo para lo que carga por JS) ---------- */

let CAP_OFF = false;

function puedeCapturar() {
  try {
    return !CAP_OFF && kino && typeof kino.browser === 'object' && kino.browser !== null && typeof kino.browser.capture === 'function';
  } catch (e) { return false; }
}

/* v0.6.2: la publicidad se interpone en el video (el anuncio pre-roll de
 * OtakusTV llegó a la boca de la captura). La cacería ahora mira la URL
 * antes de abrir la boca: las redes de anuncios se descartan y los
 * manifiestos (m3u8/mpd) ganan, que los capítulos de verdad casi siempre
 * son HLS; los mp4/webm vienen detrás. */
const ANUNCIO_RE = /doubleclick|googlesyndication|adserver|\/ads?[\/._-]|propeller|adsterra|popads|popunder|exoclick|juicyads|hilltop|clickadu|trafficjunky|adnetwork|monetiz|teaser|vignette|pre-?roll|-banner[._\/]/i;

function esManifiesto(url, mime) {
  return /\.m3u8(?:[?#]|$)/i.test(String(url || '')) || /\.mpd(?:[?#]|$)/i.test(String(url || '')) || /mpegurl|dash/i.test(String(mime || ''));
}

function elegirMedia(lista) {
  const grupo = (lista || []).filter((x) => x && x.url);
  const buenas = grupo.filter((x) => !ANUNCIO_RE.test(x.url));
  const fin = buenas.length ? buenas : grupo;
  if (!fin.length) return null;
  const man = fin.filter((x) => esManifiesto(x.url, x.mime));
  if (man.length) return man[0];
  const vid = fin.filter((x) => /\.(?:mp4|webm|mkv|mov)(?:[?#]|$)/i.test(x.url) || /^video\//i.test(String(x.mime || '')));
  if (vid.length) return vid[0];
  return fin[0];
}

async function capturar(url, etiqueta) {
  const ms = Math.max(6000, Math.min(20000, queda() - 2000));
  let pagina;
  try {
    pagina = await kino.browser.capture(url, { timeoutMs: ms, headers: { Referer: BASE_AV1 + '/' } });
  } catch (e) {
    const code = String((e && e.code) || '');
    if (code === 'not_allowed' || code === 'browser_unavailable') CAP_OFF = true;
    throw new Error(etiqueta + ': navegador oculto no disponible');
  }
  let pick = elegirMedia((pagina && pagina.media) || []);
  /* v0.6.2: si lo pescado no es un manifiesto (un anuncio mp4, por
   * ejemplo), segunda pasada más larga con captureAll: el video del
   * capítulo suele llegar cuando el anuncio termina, y la lista de
   * peticiones de la página expone lo demás que cargó. */
  if ((!pick || !esManifiesto(pick.url, pick.mime)) && queda() > 15000 && kino.browser && kino.browser.captureAll) {
    try {
      const ms2 = Math.min(25000, Math.max(6000, queda() - 2000));
      const pagina2 = await kino.browser.capture(url, { timeoutMs: ms2, captureAll: true, headers: { Referer: BASE_AV1 + '/' } });
      const pool = ((pagina2 && pagina2.media) || []).slice(0);
      const reqs = (pagina2 && pagina2.requests) || [];
      for (let i = 0; i < reqs.length; i++) {
        if (reqs[i] && reqs[i].url) pool.push({ url: reqs[i].url, headers: reqs[i].headers });
      }
      pick = elegirMedia(pool) || pick;
    } catch (e) {
      log('segunda captura falló', (e && e.message) || String(e));
    }
  }
  if (!pick) throw new Error(etiqueta + ': captura sin video');
  const origen = origenDe((pagina && pagina.finalUrl) || url);
  return {
    url: pick.url,
    mime: mimeDe(pick.url),
    headers: (pick.headers && Object.keys(pick.headers).length) ? pick.headers : { Referer: origen + '/', 'User-Agent': UA }
  };
}

/* ---------- presupuesto de tiempo de resolve ---------- */

let RESOLVE_T0 = 0;

function queda() {
  return (puedeCapturar() ? 60000 : 15500) - (Date.now() - RESOLVE_T0);
}

/* ---------- registro de tipos y extractores ---------- */

const TIPO_ETIQUETA = {
  zilla: 'Zilla', directo: 'Directo', voe: 'Voe', mp4upload: 'MP4Upload', mixdrop: 'MixDrop',
  uqload: 'Uqload', streamtape: 'StreamTape', yourupload: 'YourUpload', upnshare: 'UPNShare',
  dood: 'Doodstream', okru: 'Ok.ru', hexload: 'Hexload', savefiles: 'SaveFiles', filemoon: 'Filemoon',
  streamwish: 'StreamWish', lulu: 'LuluStream', vidhide: 'Vidhide', multi: 'Multiserver', generic: 'Servidor'
};

const TIPO_ORDEN = {
  zilla: 1, directo: 2, voe: 3, upnshare: 4, mixdrop: 5, mp4upload: 6, uqload: 7,
  yourupload: 8, streamtape: 9, okru: 10, savefiles: 11, dood: 12, hexload: 13,
  lulu: 14, streamwish: 15, vidhide: 16, filemoon: 17, multi: 18, generic: 20
};

function detectarTipo(nombre, url) {
  const n = String(nombre || '');
  const u = String(url || '');
  const nu = n + ' ' + u;
  if (/mega\.nz|\bmega\b|netu|hqq|waaw/i.test(nu)) return null;
  if (/mixdrop|mxdrop|mxcontent/i.test(nu)) return 'mixdrop';
  if (/mp4upload/i.test(nu)) return 'mp4upload';
  if (/lulu/i.test(nu)) return 'lulu';
  if (/uqload/i.test(nu)) return 'uqload';
  if (/upnshare|upn\.one/i.test(nu)) return 'upnshare';
  if (/(^|[^a-z])ok[\s._-]?ru\b|odnoklassniki|okcdn/i.test(nu)) return 'okru';
  if (/\bvoe\b|voe\.|voe-unblock|voeunblock/i.test(nu)) return 'voe';
  if (/dood|dsvplay|d-s\.io|ds2play|ds2video|playmogo|myvidplay|vide0\.net|d0+d\.com|dooo+d/i.test(nu)) return 'dood';
  if (/filemoon|byse|moonplayer|f16px/i.test(nu)) return 'filemoon';
  if (/vidhide|streamhide/i.test(nu)) return 'vidhide';
  if (/savefiles?|streamhls/i.test(nu)) return 'savefiles';
  if (/hexload/i.test(nu)) return 'hexload';
  if (/streamwish|obeywish|\bwish\b|embedwish|hlswish|awish/i.test(nu)) return 'streamwish';
  if (/yourupload/i.test(nu)) return 'yourupload';
  if (/streamtape/i.test(nu)) return 'streamtape';
  /* v0.6.0: los agregadores propios (saidochesto y compañía) se abren con el
     navegador oculto: la captura pesca el video aunque el player no se deje leer. */
  if (/saidochesto\.?top|multiserver/i.test(nu)) return 'multi';
  return 'generic';
}

/* --- Voe: el stream va cifrado en <script type="application/json"> (baile F7) --- */

function voeRot13(s) {
  return String(s || '').replace(/[A-Za-z]/g, function (c) {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

function voeF7(encoded) {
  try {
    let p = voeRot13(encoded);
    p = p.replace(/@\$/g, '').replace(/\^\^/g, '').replace(/~@/g, '')
      .replace(/%\?/g, '').replace(/\*~/g, '').replace(/!!/g, '').replace(/#&/g, '');
    p = b64Latin1(p);
    if (!p) return null;
    let s = '';
    for (let i = 0; i < p.length; i++) s += String.fromCharCode(p.charCodeAt(i) - 3);
    s = s.split('').reverse().join('');
    p = b64Latin1(s.replace(/^=+/, ''));
    if (!p || p.charAt(0) !== '{') return null;
    return JSON.parse(p);
  } catch (e) { return null; }
}

async function exVoe(u) {
  let url = String(u || '').trim();
  if (!url) throw new Error('Voe sin url');
  let html = '';
  let finalUrl = url;
  for (let salto = 0; salto < 3; salto++) {
    const pagina = await traer(url, { headers: { Accept: 'text/html,*/*' }, timeoutMs: 12000 });
    if (!pagina.ok) throw new Error('Voe HTTP ' + pagina.status);
    html = pagina.text;
    finalUrl = pagina.url || url;
    if (borrado(html)) throw new Error('Voe: video borrado');
    const m = /<script[^>]*type\s*=\s*["']application\/json["'][^>]*>([\s\S]*?)<\/script>/i.exec(html);
    if (m) {
      const raw = String(m[1] || '').trim();
      const arr = /^\s*\[\s*"([\s\S]*?)"\s*\]\s*$/.exec(raw);
      let encoded = '';
      if (arr) encoded = arr[1];
      else if (raw.charAt(0) === '"') { try { encoded = JSON.parse(raw); } catch (e) { encoded = raw.slice(1, -1); } }
      else encoded = raw.replace(/^\[\s*"/, '').replace(/"\s*\]$/, '');
      const data = encoded ? voeF7(encoded) : null;
      const fuente = data ? String(data.source || data.direct_access_url || '').trim() : '';
      if (/^https?:\/\//i.test(fuente)) {
        return { url: fuente, mime: mimeDe(fuente), headers: { Referer: origenDe(finalUrl) + '/', Origin: origenDe(finalUrl) + '/', 'User-Agent': UA } };
      }
    }
    const hls = /["']hls["']\s*:\s*["']([^"']+)["']/i.exec(html);
    if (hls) {
      let v = hls[1];
      if (v.indexOf('//') === 0) v = 'https:' + v;
      if (!/^https?:\/\//i.test(v)) v = b64Texto(v) || v;
      if (/^https?:\/\//i.test(v) && /\.m3u8/i.test(v)) {
        return { url: v, mime: MIME_HLS, headers: { Referer: origenDe(finalUrl) + '/', Origin: origenDe(finalUrl) + '/', 'User-Agent': UA } };
      }
    }
    const otra = urlDeStream(desempaquetarTodo(html), finalUrl) || urlDeStream(html, finalUrl);
    if (otra) return { url: otra, mime: mimeDe(otra), headers: { Referer: origenDe(finalUrl) + '/', 'User-Agent': UA } };
    const saltoM = /window\.location\.href\s*=\s*['"]([^'"]+)['"]/i.exec(html) ||
      /location\.replace\(\s*['"]([^'"]+)['"]/i.exec(html) ||
      /href\s*=\s*['"](https?:\/\/[^'"]+\/e\/[^'"]+)['"]/i.exec(html);
    if (!saltoM || !saltoM[1] || saltoM[1] === finalUrl) break;
    url = absolutizar(saltoM[1], finalUrl);
  }
  if (puedeCapturar() && queda() > 8000) {
    try { return await capturar(String(u), 'Voe'); } catch (e) { log('voe captura', (e && e.message) || e); }
  }
  throw new Error('Voe sin video');
}

/* --- MP4Upload: el .mp4 vive en el reproductor del embed --- */

async function exMp4Upload(u) {
  const idm = /(?:embed-|\/e\/)([a-z0-9]+)/i.exec(u);
  const destino = idm ? 'https://www.mp4upload.com/embed-' + idm[1] + '.html' : String(u);
  const pagina = await traer(destino, { headers: { Referer: 'https://www.mp4upload.com/' }, timeoutMs: 10000 });
  if (!pagina.ok) throw new Error('MP4Upload HTTP ' + pagina.status);
  const html = pagina.text.replace(/\\\//g, '/').replace(/\\u0026/gi, '&').replace(/&amp;/g, '&');
  const m = /https?:\/\/[a-z0-9.-]+(?::\d+)?\/d\/[A-Za-z0-9]+\/video\.mp4/i.exec(html) ||
    /src\s*:\s*["'](https?:\/\/[^"']+\.mp4[^"']*)["']/i.exec(html) ||
    /["']?file["']?\s*:\s*["'](https?:\/\/[^"']+)["']/i.exec(html) ||
    /<source[^>]+src\s*=\s*["'](https?:\/\/[^"']+)["']/i.exec(html);
  const file = m ? String(m[1] || m[0]) : '';
  if (!file) throw new Error('MP4Upload sin video');
  return { url: file, mime: 'video/mp4', headers: { Referer: 'https://www.mp4upload.com/', 'User-Agent': UA }, expiresInSeconds: 3600 };
}

/* --- MixDrop: packer p.a.c.k.e.r con MDCore.wurl --- */

async function exMixdrop(u) {
  const idm = /\/(?:e|f|file)\/([a-z0-9]+)/i.exec(u);
  if (!idm) throw new Error('MixDrop sin id');
  const origen = origenDe(u) || 'https://mixdrop.top';
  const pagina = await traer(origen + '/e/' + idm[1], { headers: { Referer: origen + '/' }, timeoutMs: 10000 });
  if (!pagina.ok) throw new Error('MixDrop HTTP ' + pagina.status);
  const desempacado = desempaquetarTodo(pagina.text);
  const src = desempacado || pagina.text;
  let m = /MDCore\.wurl\s*=\s*["']([^"']+)["']/i.exec(src) ||
    /MDCore\.furl\s*=\s*["']([^"']+)["']/i.exec(src) ||
    /\bwurl\s*=\s*["']([^"']+)["']/i.exec(src);
  let file = m ? m[1] : '';
  if (!file || !esUrlDeVideo(file.indexOf('//') === 0 ? 'https:' + file : file)) {
    file = urlDeStream(src, pagina.url || u);
  }
  if (!file) throw new Error(borrado(pagina.text) ? 'MixDrop: video borrado' : 'MixDrop sin video');
  if (file.indexOf('//') === 0) file = 'https:' + file;
  return { url: file, mime: mimeDe(file), headers: { Referer: origenDe(pagina.url || u) + '/', 'User-Agent': UA } };
}

/* --- Uqload: embed-<id>.html con el stream en el player --- */

async function exUqload(u) {
  let url = String(u);
  const m = /^(https?:\/\/[^/]+)\/(?!embed-)([a-z0-9]{8,16})(?:\.html)?$/i.exec(url);
  if (m) url = m[1] + '/embed-' + m[2] + '.html';
  const pagina = await traer(url, { headers: { Referer: origenDe(url) + '/' }, timeoutMs: 10000 });
  if (!pagina.ok) throw new Error('Uqload HTTP ' + pagina.status);
  const file = urlDeStream(desempaquetarTodo(pagina.text), pagina.url || url) || urlDeStream(pagina.text, pagina.url || url);
  if (!file) throw new Error(borrado(pagina.text) ? 'Uqload: video borrado' : 'Uqload sin video');
  return { url: file, mime: mimeDe(file), headers: { Referer: origenDe(pagina.url || url) + '/', 'User-Agent': UA } };
}

/* --- StreamTape: el enlace se arma con el baile de robotlink --- */

async function exStreamtape(u) {
  const pagina = await traer(u, { headers: { Referer: BASE_AV1 + '/' }, timeoutMs: 10000 });
  if (!pagina.ok) throw new Error('StreamTape HTTP ' + pagina.status);
  const html = pagina.text;
  const re = /getElementById\(\s*['"](?:robotlink|ideoolink|norobotlink)['"]\s*\)\.innerHTML\s*=\s*['"]([^'"]*)['"]\s*\+\s*\(\s*['"]([^'"]*)['"]\s*\)((?:\s*\.substring\(\s*\d+\s*\))*)/g;
  const candidatos = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    let cola = m[2];
    const cortes = m[3].match(/\d+/g) || [];
    for (let i = 0; i < cortes.length; i++) cola = cola.substring(Number(cortes[i]));
    const cabeza = m[1];
    candidatos.push((cabeza.indexOf('//') === 0 ? 'https:' : '') + cabeza + cola);
  }
  if (!candidatos.length) throw new Error(borrado(html) ? 'StreamTape: video borrado' : 'StreamTape sin video');
  return { url: candidatos[0], mime: 'video/mp4', headers: { 'User-Agent': UA }, expiresInSeconds: 900 };
}

/* --- YourUpload: og:video o file: --- */

async function exYourUpload(u) {
  const pagina = await traer(u, { headers: { Referer: 'https://www.yourupload.com/' }, timeoutMs: 10000 });
  if (!pagina.ok) throw new Error('YourUpload HTTP ' + pagina.status);
  const html = pagina.text;
  const m = /<meta[^>]+og:video["'][^>]*content=["']([^"']+)["']/i.exec(html) ||
    /<meta[^>]+content=["']([^"']+)["'][^>]+og:video["']/i.exec(html) ||
    /file\s*:\s*["'](https?:\/\/[^"']+)["']/i.exec(html);
  if (!m) throw new Error('YourUpload sin video');
  const url = decHtml(String(m[1]).replace(/\\\//g, '/').replace(/\\u0026/gi, '&'));
  if (!/^https?:\/\//i.test(url)) throw new Error('YourUpload con URL rara');
  return { url: url, mime: 'video/mp4', headers: { Referer: 'https://www.yourupload.com/', 'User-Agent': UA }, expiresInSeconds: 1800 };
}

/* --- UPNShare: API cifrada con AES-128-CBC --- */

async function exUpnshare(u) {
  const s = String(u || '');
  const id = (s.split('#')[1] || '').replace(/^\//, '');
  const origen = origenDe(s);
  if (!id || !origen) throw new Error('UPNShare sin id');
  const api = origen + '/api/v1/video?id=' + encodeURIComponent(id) + '&w=1920&h=1080&r=' + encodeURIComponent(origen + '/');
  const pagina = await traer(api, { headers: { Referer: origen + '/' }, timeoutMs: 12000 });
  if (!pagina.ok) throw new Error('UPNShare HTTP ' + pagina.status);
  const cuerpo = pagina.text.trim();
  let datos = null;
  if (cuerpo.charAt(0) === '{') {
    try { datos = JSON.parse(cuerpo); } catch (e) {}
  }
  if (!datos) {
    try { datos = JSON.parse(aesDescifrarHex(cuerpo, UPN_CLAVE, UPN_IV)); } catch (e) {}
  }
  const fuente = datos ? String(datos.source || '') : '';
  if (/^https?:\/\//i.test(fuente)) {
    return { url: fuente, mime: mimeDe(fuente), headers: { Referer: origen + '/', 'User-Agent': UA } };
  }
  throw new Error('UPNShare sin video');
}

/* --- Doodstream: pass_md5 + token --- */

function letrasAzar(n) {
  const abc = 'abcdefghijklmnopqrstuvwxyz';
  let s = '';
  try {
    for (let i = 0; i < n; i++) s += abc.charAt(Math.floor(Math.random() * 26));
  } catch (e) { s = 'abcdefghij'; }
  return s;
}

async function exDood(u) {
  const url = String(u).replace(/\/(?:d|download)\//, '/e/');
  const pagina = await traer(url, { headers: { Referer: origenDe(url) + '/' }, timeoutMs: 10000 });
  if (!pagina.ok) throw new Error('Dood HTTP ' + pagina.status);
  const html = pagina.text;
  if (borrado(html)) throw new Error('Dood: video borrado');
  const m = /\/pass_md5\/([^"'\s]+)/.exec(html);
  if (!m) throw new Error('Dood sin video');
  const origen = origenDe(pagina.url || url);
  const tokenPagina = await traer(origen + '/pass_md5/' + m[1], { headers: { Referer: pagina.url || url }, timeoutMs: 10000 });
  const tok = String(tokenPagina.text || '').trim();
  if (!tokenPagina.ok || !tok || tok.length > 500 || /<html|<!doctype/i.test(tok)) throw new Error('Dood sin token');
  const partes = m[1].split('/');
  const tm = /makePlay[\s\S]{0,300}?token=([A-Za-z0-9]+)/.exec(html);
  const token = (tm && tm[1]) || partes[partes.length - 1] || '';
  let file = tok + letrasAzar(10) + '?token=' + token + '&expiry=' + Date.now();
  const full = file.indexOf('http') === 0 ? file : origen + file;
  return { url: full, mime: 'video/mp4', headers: { Referer: origen + '/', 'User-Agent': UA } };
}

/* --- Ok.ru: metadata del player (data-options o embebida) --- */

function okruMeta(html) {
  const src = String(html || '');
  const m = /data-options=(?:"([^"]+)"|'([^']+)')/.exec(src);
  if (m) {
    try {
      const opts = JSON.parse(decHtml(m[1] || m[2]));
      const raw = opts && opts.flashvars && opts.flashvars.metadata;
      return typeof raw === 'string' ? JSON.parse(raw) : (raw || null);
    } catch (e) {}
  }
  const marcas = ['"metadata":"', '&quot;metadata&quot;:&quot;', 'metadata&quot;:'];
  for (let i = 0; i < marcas.length; i++) {
    const idx = src.indexOf(marcas[i]);
    if (idx < 0) continue;
    const ini = src.indexOf('{', idx);
    if (ini < 0) continue;
    let profundidad = 0;
    for (let j = ini; j < src.length && j < ini + 60000; j++) {
      const ch = src.charAt(j);
      if (ch === '{') profundidad++;
      else if (ch === '}') {
        profundidad--;
        if (profundidad === 0) {
          try {
            const blob = decHtml(src.slice(ini, j + 1).replace(/\\"/g, '"').replace(/\\\//g, '/'));
            return JSON.parse(blob);
          } catch (e) { break; }
        }
      }
    }
  }
  return null;
}

async function exOkru(u) {
  const id = (/ok\.ru\/(?:videoembed|video)\/(\d+)/i.exec(u) || /odnoklassniki\.ru\/(?:videoembed|video)\/(\d+)/i.exec(u) || [])[1];
  if (!id) throw new Error('Ok.ru sin id');
  const embed = 'https://ok.ru/videoembed/' + id;
  const pagina = await traer(embed, { headers: { Referer: BASE_MC + '/' }, timeoutMs: 12000 });
  let meta = pagina.ok ? okruMeta(pagina.text) : null;
  if (!meta) {
    const r = await traer('https://ok.ru/dk?cmd=videoPlayerMetadata', {
      metodo: 'POST',
      headers: {
        Referer: embed,
        Origin: 'https://ok.ru',
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: { mid: id },
      timeoutMs: 10000
    });
    const cuerpo = r.text.trim();
    if (r.ok && cuerpo.charAt(0) === '{') {
      try {
        const j = JSON.parse(cuerpo);
        if (!j.error) meta = j;
      } catch (e) {}
    }
  }
  if (!meta) throw new Error(pagina.ok && borrado(pagina.text) ? 'Ok.ru: video borrado' : 'Ok.ru sin video');
  if (meta.error || meta.status === 'error') throw new Error('Ok.ru: ' + String(meta.error || 'error'));
  const hls = meta.hlsManifestUrl || meta.ondemandHls || meta.hlsMasterPlaylistUrl;
  if (hls && /^https?:\/\//i.test(hls)) {
    return { url: hls, mime: MIME_HLS, headers: { Referer: 'https://ok.ru/', Origin: 'https://ok.ru/', 'User-Agent': UA } };
  }
  const rango = { mobile: 1, lowest: 2, low: 3, sd: 4, hd: 5, full: 6, quad: 7, ultra: 8 };
  const vids = (meta.videos || []).filter((v) => v && /^https?:\/\//i.test(v.url || ''));
  vids.sort((a, b) => (rango[b.name] || 0) - (rango[a.name] || 0));
  if (!vids.length) throw new Error('Ok.ru sin video');
  return { url: vids[0].url, mime: 'video/mp4', headers: { Referer: 'https://ok.ru/', Origin: 'https://ok.ru/', 'User-Agent': UA } };
}

/* --- Hexload: POST /download con JSON de respuesta --- */

async function exHexload(u) {
  const idm = /(?:embed-|\/e\/)([a-z0-9]+)/i.exec(u);
  if (!idm) throw new Error('Hexload sin id');
  const id = idm[1];
  const page = 'https://hexload.com/embed-' + id;
  const r = await traer('https://hexload.com/download', {
    metodo: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
      Referer: page,
      Origin: 'https://hexload.com'
    },
    form: { op: 'download3', id: id, ajax: '1', method_free: '1' },
    timeoutMs: 12000
  });
  if (!r.ok) throw new Error('Hexload HTTP ' + r.status);
  let datos = null;
  try { datos = JSON.parse(r.text); } catch (e) {}
  let file = datos && datos.result ? String(datos.result.url || '') : '';
  if (file && !/^https?:\/\//i.test(file)) {
    const d = b64Texto(file);
    if (/^https?:\/\//i.test(d)) file = d;
  }
  if (!/^https?:\/\//i.test(file)) {
    const pagina = await traer(page, { headers: { Referer: 'https://hexload.com/' }, timeoutMs: 10000 });
    file = urlDeStream(desempaquetarTodo(pagina.text) || pagina.text, page);
    if (!/^https?:\/\//i.test(file)) file = '';
  }
  if (!file) throw new Error('Hexload sin video');
  return { url: file, mime: mimeDe(file), headers: { Referer: page, 'User-Agent': UA } };
}

/* --- SaveFiles / streamhls: el manifiesto sale de POST /dl --- */

async function exSavefiles(u) {
  const s = String(u || '');
  const idm = /\/(?:e|v|f|d|embed)\/([A-Za-z0-9]+)/i.exec(s) || /\/([A-Za-z0-9]{8,20})(?:\/|$|\?)/.exec(s);
  const id = idm ? idm[1] : '';
  if (!id) throw new Error('SaveFiles sin id');
  const origen = origenDe(s) || 'https://streamhls.to';
  const ref = origen + '/';
  const pagina = await traer(origen + '/e/' + id, { headers: { Referer: BASE_MC + '/' }, timeoutMs: 10000 });
  if (pagina.ok && borrado(pagina.text)) throw new Error('SaveFiles: video borrado');
  let html = '';
  const r = await traer(origen + '/dl', {
    metodo: 'POST',
    headers: {
      Referer: ref,
      Origin: origen,
      Accept: 'text/html,application/xhtml+xml,*/*',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: { op: 'embed', file_code: id, auto: '0', referer: '' },
    timeoutMs: 10000
  });
  if (r.ok) html = r.text;
  let file = urlDeStream(html, origen) || urlDeStream(pagina.text, origen) ||
    urlDeStream(desempaquetarTodo(pagina.text + '\n' + html), origen);
  if (!file) throw new Error(borrado(pagina.text) || borrado(html) ? 'SaveFiles: video borrado' : 'SaveFiles sin video');
  if (file.indexOf('//') === 0) file = 'https:' + file;
  if (!/^https?:\/\//i.test(file)) throw new Error('SaveFiles con URL rara');
  return { url: file, mime: mimeDe(file), headers: { Referer: ref, 'User-Agent': UA } };
}

/* --- Filemoon / Byse: API del embed y navegador oculto --- */

async function exFilemoon(u) {
  const s = String(u || '').trim();
  const idm = /\/(?:e|eyi|d|download|v)\/([A-Za-z0-9]+)/i.exec(s);
  const id = idm ? idm[1] : '';
  const origen = origenDe(s);
  let objetivo = s.replace(/\/$/, '');
  if (id && origen) {
    const r = await traer(origen + '/api/videos/' + id + '/embed/details', {
      headers: { Referer: origen + '/e/' + id, Accept: 'application/json' },
      timeoutMs: 8000
    });
    const cuerpo = r.text.trim();
    if (r.ok && cuerpo.charAt(0) === '{') {
      try {
        const j = JSON.parse(cuerpo);
        if (j && j.embed_frame_url && /^https?:\/\//i.test(j.embed_frame_url)) objetivo = j.embed_frame_url;
      } catch (e) {}
    }
  }
  try {
    const pagina = await traer(objetivo, { headers: { Referer: (origen ? origen + '/' : 'https://filemoon.to/') }, timeoutMs: 10000 });
    const file = urlDeStream(desempaquetarTodo(pagina.text), pagina.url || objetivo) || urlDeStream(pagina.text, pagina.url || objetivo);
    if (file) {
      return { url: file, mime: mimeDe(file), headers: { Referer: origenDe(pagina.url || objetivo) + '/', 'User-Agent': UA } };
    }
  } catch (e) { log('filemoon embed', (e && e.message) || e); }
  if (puedeCapturar() && queda() > 8000) {
    return await capturar(objetivo, 'Filemoon');
  }
  throw new Error('Filemoon sin video');
}

/* --- Genérico (StreamWish, LuluStream, Vidhide y compañía): packer + patrones --- */

async function exGenerico(u) {
  const pagina = await traer(u, { headers: { Referer: origenDe(u) + '/' }, timeoutMs: 10000 });
  if (!pagina.ok) throw new Error('servidor HTTP ' + pagina.status);
  const html = pagina.text;
  if (html.length < 500 && /just a moment|cf-browser|challenge/i.test(html)) {
    throw new Error('bloqueado por Cloudflare');
  }
  const file = urlDeStream(desempaquetarTodo(html), pagina.url || u) || urlDeStream(html, pagina.url || u);
  if (!file) throw new Error(borrado(html) ? 'video borrado' : 'sin video');
  return { url: file, mime: mimeDe(file), headers: { Referer: origenDe(pagina.url || u) + '/', 'User-Agent': UA } };
}

/* --- Multiserver (saidochesto y parientes): opaco al rascado, se captura --- */

async function exMulti(u) {
  if (!puedeCapturar()) throw new Error('Multiserver sin navegador oculto');
  return await capturar(u, 'Multiserver');
}

const EXTRACTORES = {
  voe: exVoe, mp4upload: exMp4Upload, mixdrop: exMixdrop, uqload: exUqload,
  streamtape: exStreamtape, yourupload: exYourUpload, upnshare: exUpnshare,
  dood: exDood, okru: exOkru, hexload: exHexload, savefiles: exSavefiles,
  filemoon: exFilemoon, streamwish: exGenerico, lulu: exGenerico, vidhide: exGenerico,
  multi: exMulti, generic: exGenerico
};

async function abrirServidor(server) {
  if (server.directo) return server.directo;
  const fn = EXTRACTORES[server.tipo] || exGenerico;
  return await fn(server.url);
}

function etiquetaDe(server, todos) {
  const base = TIPO_ETIQUETA[server.tipo] || server.nombre || 'Servidor';
  let cuenta = 0;
  let pos = 0;
  for (const x of todos) {
    if (x.tipo === server.tipo) { cuenta++; if (x === server) pos = cuenta; }
  }
  const nombre = cuenta <= 1 ? base : base + ' ' + pos;
  return nombre + (server.sufijo || '');
}

/* El corazón del resolve: prueba los servidores en orden (el preferido primero)
 * y arma las alternativas como ref perezosas del menú Servidor. */
async function probarServidores(servers, idx, refDe) {
  if (idx != null && idx >= 0) {
    const server = servers[idx];
    if (!server) {
      throw kino.error('not_found', 'servidor ' + idx + ' no existe', {
        userMessage: 'Ese servidor ya no está en este capítulo. Vuelve a abrirlo.'
      });
    }
    const st = await abrirServidor(server);
    const out = { url: st.url, label: etiquetaDe(server, servers), expiresInSeconds: 1800 };
    if (st.mime) out.mime = st.mime;
    out.headers = st.headers || { Referer: origenDe(server.url) + '/', 'User-Agent': UA };
    return out;
  }
  const preferido = String(configDe('servidor') || 'auto');
  const orden = servers.map(function (s, i) { return i; }).sort(function (a, b) {
    const pa = servers[a].tipo === preferido ? 0 : 1;
    const pb = servers[b].tipo === preferido ? 0 : 1;
    return pa - pb || (TIPO_ORDEN[servers[a].tipo] || 20) - (TIPO_ORDEN[servers[b].tipo] || 20) || a - b;
  });
  const fallas = [];
  for (const i of orden) {
    if (queda() < 3000) { fallas.push('se acabó el tiempo'); break; }
    const server = servers[i];
    try {
      const st = await abrirServidor(server);
      const out = { url: st.url, label: etiquetaDe(server, servers), expiresInSeconds: 1800 };
      if (st.mime) out.mime = st.mime;
      out.headers = st.headers || { Referer: origenDe(server.url) + '/', 'User-Agent': UA };
      const alts = [];
      const usados = {};
      usados[i] = true;
      for (const j of orden) {
        if (usados[j] || alts.length >= 8) continue;
        alts.push({ label: etiquetaDe(servers[j], servers), ref: refDe(j) });
      }
      if (alts.length) out.alternatives = alts;
      log('resolve OK:', out.label, '+', alts.length, 'alternativas');
      return out;
    } catch (e) {
      const msj = (e && e.message) || String(e);
      fallas.push(etiquetaDe(server, servers) + ': ' + msj);
      log('servidor falló:', msj);
    }
  }
  throw kino.error('unavailable', 'ningún servidor (' + fallas.slice(0, 4).join('; ') + ')', {
    userMessage: 'Ningún servidor abrió el video. Prueba de nuevo más tarde o elige otro capítulo.'
  });
}

/* ---------- lector del __data.json de AnimeAV1 ---------- */

function leerDataJson(texto) {
  let raiz;
  try { raiz = JSON.parse(texto); } catch (e) { return null; }
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

/* ---------- caché en memoria del runtime ---------- */

const _datos = new Map();
async function datosDe(camino) {
  if (_datos.has(camino)) return _datos.get(camino);
  const r = await traer(BASE_AV1 + camino);
  if (!r.ok) return null;
  const raiz = leerDataJson(r.text);
  if (!raiz) return null;
  if (_datos.size > 80) _datos.clear();
  _datos.set(camino, raiz);
  return raiz;
}

/* ---------- catálogo de AnimeAV1 ---------- */

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
  const r = await traer(BASE_AV1 + camino);
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

function cover(id) {
  return CDN_AV1 + '/covers/' + id + '.jpg';
}

function backdropDe(id) {
  return CDN_AV1 + '/backdrops/' + id + '.jpg';
}

function captura(id, n) {
  return CDN_AV1 + '/screenshots/' + id + '/' + n + '.jpg';
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

/* ---------- registro de fuentes ---------- */

const FUENTES = {};
function registrarFuente(f) { FUENTES[f.id] = f; }

/* ---------- fuente: AnimeAV1 ---------- */

function idiomasPreferidos() {
  const c = String(configDe('idioma') || 'auto');
  if (c === 'sub') return ['SUB'];
  if (c === 'dub') return ['DUB'];
  if (c === 'dub-sub') return ['DUB', 'SUB'];
  return ['SUB', 'DUB'];
}

registrarFuente({
  id: 'av1',
  etiqueta: 'AnimeAV1',

  async buscar(q, query) {
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
      return items.slice(0, 20);
    }
    return [];
  },

  async portada() {
    const defs = [
      { id: 'av1-row-eps', titulo: 'Últimos episodios', ref: 'av1-ultimos-eps', episodios: true },
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
    if (ref === 'av1-ultimos-eps') {
      const items = await itemsUltimosEps();
      if (!items.length) return { items: [], next: null };
      return { items: items, next: null };
    }
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

  async resolver(slug, ep, idx) {
    const n = ep || 1;
    const raiz = await datosDe('/media/' + slug + '/' + n + '/__data.json');
    if (!raiz) {
      throw kino.error('not_found', 'AnimeAV1 no entregó los datos del episodio', {
        userMessage: 'No se pudieron leer los datos de este episodio en AnimeAV1'
      });
    }
    const grupos = raiz.embeds && typeof raiz.embeds === 'object' ? raiz.embeds : {};
    const servers = [];
    const vistosUrl = new Set();
    const preferidos = idiomasPreferidos();
    const estricto = preferidos.length === 1;
    const claves = [];
    for (const idioma of preferidos) {
      if (grupos[idioma]) claves.push(idioma);
    }
    if (!estricto) {
      for (const idioma of Object.keys(grupos)) {
        if (preferidos.indexOf(idioma) === -1) claves.push(idioma);
      }
    }
    for (const idioma of claves) {
      const lista = grupos[idioma];
      if (!Array.isArray(lista)) continue;
      for (const e of lista) {
        if (!e || typeof e.url !== 'string' || e.url.indexOf('http') !== 0) continue;
        if (vistosUrl.has(e.url)) continue;
        vistosUrl.add(e.url);
        const nombre = String(e.server || 'Servidor');
        const z = /https?:\/\/player\.zilla-networks\.com\/play\/([A-Za-z0-9_-]+)/.exec(e.url);
        let directo = null;
        let tipo = null;
        if (z) {
          tipo = 'zilla';
          directo = { url: 'https://player.zilla-networks.com/m3u8/' + z[1], mime: MIME_HLS, headers: { Referer: BASE_AV1 + '/' } };
        } else if (/\.m3u8(\?|$)/i.test(e.url)) {
          tipo = 'directo';
          directo = { url: e.url, mime: MIME_HLS, headers: { Referer: BASE_AV1 + '/' } };
        } else if (/\.mp4(\?|$)/i.test(e.url)) {
          tipo = 'directo';
          directo = { url: e.url, mime: 'video/mp4' };
        } else {
          tipo = detectarTipo(nombre, e.url);
        }
        if (!tipo) continue;
        servers.push({ nombre: nombre, url: e.url, tipo: tipo, directo: directo, sufijo: ' (' + idioma + ')' });
      }
    }
    if (!servers.length) {
      throw kino.error('not_found', 'AnimeAV1: sin reproductores', {
        userMessage: 'Este episodio no tiene reproductores en AnimeAV1.'
      });
    }
    return await probarServidores(servers, idx, function (i) {
      return 'av1:' + slug + ':' + n + ':' + i;
    });
  }
});

/* ---------- filas del home de AnimeAV1 ---------- */

async function itemsUltimosEps() {
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
  return items;
}

async function filaEpisodios(def) {
  const items = await itemsUltimosEps();
  if (!items.length) return null;
  const fila = { id: def.id, title: def.titulo, items: items.slice(0, 20) };
  if (def.ref) fila.ref = def.ref;
  return fila;
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

/* ---------- fuente: MonosChinos ---------- */

const MC_TIPO_RE = />\s*(Anime|Ova|OVA|Pel[ií]cula(?: 1080p)?|Especial|Corto|Ona|ONA|Donghua|Sin Censura|PREESTRENO|Audio Japon[eé]s)\s*</i;

function mcImagen(u) {
  const url = String(u || '');
  if (!url || /anime\.png|capblank|placeholder/i.test(url)) return '';
  let abs = url;
  if (!/^https?:\/\//i.test(abs)) abs = abs.charAt(0) === '/' ? BASE_MC + abs : BASE_MC + '/' + abs;
  abs = abs.replace(/[?#].*$/, '');
  let m = /\/assets\/thumbs\/imagen\/([^/]+)$/i.exec(abs);
  if (m) {
    let nombre = m[1].replace(/\.(webp|jpg|jpeg|png)$/i, '').replace(/\.(webp|jpg|jpeg|png)$/i, '');
    return BASE_MC + '/assets/img/serie/imagen/' + nombre + '.jpg';
  }
  m = /\/assets\/thumbs\/portada\/([^/]+)$/i.exec(abs);
  if (m) {
    let nombre = m[1].replace(/\.(webp|jpg|jpeg|png)$/i, '').replace(/\.(webp|jpg|jpeg|png)$/i, '');
    return BASE_MC + '/assets/img/serie/portada/' + nombre + '.jpg';
  }
  return abs.replace(/\.jpg\.webp$/i, '.jpg').replace(/\.webp$/i, '.jpg');
}

async function traerMc(camino, timeoutMs) {
  return await traer(BASE_MC + camino, { headers: { Referer: BASE_MC + '/' }, timeoutMs: timeoutMs || 10000 });
}

async function traerJsonMc(url) {
  const r = await traer(url, {
    headers: { Accept: 'application/json, */*', 'X-Requested-With': 'XMLHttpRequest', Referer: BASE_MC + '/' },
    timeoutMs: 10000
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const texto = r.text.trim();
  if (!texto || (texto.charAt(0) !== '{' && texto.charAt(0) !== '[')) throw new Error('respuesta no JSON');
  return JSON.parse(texto);
}

function mcTarjetas(html, opciones) {
  const peliculas = !!(opciones && opciones.peliculas);
  const items = [];
  const vistos = {};
  const re = /<article[\s\S]*?<\/article>/gi;
  let m;
  while ((m = re.exec(String(html || '')))) {
    const caja = m[0];
    const hm = /href=["']([^"']*\/anime\/([^"'\/?#]+))["']/i.exec(caja);
    if (!hm) continue;
    const slug = hm[2];
    if (!slug || vistos[slug]) continue;
    vistos[slug] = true;
    let titulo = '';
    const al = /alt=(?:"([^"]+)"|'([^']+)')/i.exec(caja);
    if (al) titulo = decHtml(al[1] || al[2]).replace(/\s+/g, ' ').trim();
    if (!titulo || /\.\.\.$/.test(titulo)) {
      const h3 = /<h3[^>]*>([^<]{2,220})/i.exec(caja);
      if (h3) {
        const t = decHtml(h3[1]).replace(/\s+/g, ' ').trim();
        if (t && !/\.\.\.$/.test(t)) titulo = t;
        else if (!titulo) titulo = t.replace(/\.\.\.$/, '').trim();
      }
    }
    if (!titulo || titulo.length < 2) titulo = slugATitulo(slug);
    titulo = titulo.replace(/\s*\.\.\.\s*$/, '').trim();
    let poster = '';
    const ds = /data-src=["']([^"']+)["']/i.exec(caja);
    if (ds) poster = mcImagen(ds[1]);
    const tm = MC_TIPO_RE.exec(caja);
    const ym = />\s*((?:19|20)\d{2})\s*</.exec(caja);
    const esPeli = peliculas || !!(tm && /^pel/i.test(tm[1]));
    const item = {
      id: 'mc-' + slug,
      ref: esPeli ? 'mc:' + slug + ':1' : 'mc:' + slug,
      title: titulo.slice(0, 200),
      kind: esPeli ? 'movie' : 'series'
    };
    if (poster) item.poster = poster;
    if (ym) item.year = ym[1];
    items.push(item);
  }
  return items;
}

function mcInfoSerie(html, slug) {
  const serie = { title: slugATitulo(slug) };
  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  if (h1) serie.title = limpio(h1[1]) || serie.title;
  const og = /property=["']og:image["'][^>]*content=["']([^"']+)["']/i.exec(html) ||
    /content=["']([^"']+)["'][^>]*property=["']og:image["']/i.exec(html);
  if (og) serie.poster = mcImagen(og[1]);
  if (!serie.poster) {
    const ds = /data-src=["']([^"']*\/assets\/(?:img|thumbs)\/[^"']+)["']/i.exec(html);
    if (ds) serie.poster = mcImagen(ds[1]);
  }
  const sin = /Sinopsis[\s\S]{0,300}<p[^>]*>([^<]{20,1500})<\/p>/i.exec(html);
  if (sin) serie.overview = decHtml(sin[1]).replace(/\s+/g, ' ').trim().slice(0, 2000);
  else {
    const ogd = /property=["']og:description["'][^>]*content=["']([^"']+)["']/i.exec(html);
    if (ogd) {
      const tx = decHtml(ogd[1]).replace(/^Ver[\s\S]*?MonosChinos\.?\s*/i, '').replace(/\s+/g, ' ').trim();
      if (tx.length >= 40) serie.overview = tx.slice(0, 2000);
    }
  }
  const ym = /(?:A[nñ]o|Estreno|Fecha|Emitido)[^0-9<]{0,60}((?:19|20)\d{2})/i.exec(html);
  if (ym) serie.year = ym[1];
  const generos = [];
  const gre = /\/genero\/([a-z0-9-]+)"/g;
  let g;
  while ((g = gre.exec(html)) && generos.length < 5) {
    if (generos.indexOf(g[1]) === -1) generos.push(g[1]);
  }
  if (generos.length) serie.genres = generos;
  return serie;
}

function mcSiguientePagina(html, pagina) {
  return new RegExp('[?&;]p=' + (pagina + 1) + '(?![0-9])').test(String(html || ''));
}

registrarFuente({
  id: 'mc',
  etiqueta: 'MonosChinos',

  async buscar(q) {
    const texto = String(q || '').trim().slice(0, 100);
    if (texto.length < 2) return [];
    try {
      const pagina = await traerMc('/buscar?q=' + encodeURIComponent(texto));
      const items = mcTarjetas(pagina.text).slice(0, 25);
      for (const it of items) it.badges = ['MonosChinos'];
      return items;
    } catch (e) {
      log('mc buscar', (e && e.message) || String(e));
      return [];
    }
  },

  async portada() {
    const tareas = [
      (async () => {
        const pagina = await traerMc('/emision', 9000);
        const items = mcTarjetas(pagina.text).slice(0, 20);
        return items.length ? { id: 'mc-emision', title: 'En emisión · MonosChinos', ref: 'mc-emision', items: items } : null;
      })(),
      (async () => {
        const pagina = await traerMc('/animes', 9000);
        const items = mcTarjetas(pagina.text).slice(0, 20);
        return items.length ? { id: 'mc-animes', title: 'Animes · MonosChinos', ref: 'mc-animes', items: items } : null;
      })()
    ];
    const rtas = await Promise.all(tareas.map((t) => t.catch((e) => { log('mc fila', (e && e.message) || e); return null; })));
    const filas = [];
    for (const fila of rtas) if (fila) filas.push(fila);
    return filas;
  },

  async hoja(ref, cursor) {
    const base = ref === 'mc-emision' ? '/emision' : (ref === 'mc-animes' ? '/animes' : null);
    if (!base) return null;
    const num = Math.max(1, parseInt(String(cursor || '1'), 10) || 1);
    const pagina = await traerMc(base + (num > 1 ? '?p=' + num : ''));
    const items = mcTarjetas(pagina.text);
    if (!items.length) return { items: [], next: null };
    const haySiguiente = mcSiguientePagina(pagina.text, num) || items.length >= 24;
    return { items: items.slice(0, 30), next: haySiguiente ? String(num + 1) : null };
  },

  async detalle(slug) {
    let pagina = await traerMc('/anime/' + slug);
    if (!pagina.ok) pagina = await traerMc('/anime/' + (/-sub-espanol$/.test(slug) ? slug.replace(/-sub-espanol$/, '') : slug + '-sub-espanol'));
    if (!pagina.ok || !pagina.text) return null;
    return mcInfoSerie(pagina.text, slug);
  },

  async episodios(slug) {
    let html = '';
    let ok = false;
    try {
      const pagina = await traerMc('/anime/' + slug);
      html = pagina.text;
      ok = pagina.ok;
    } catch (e) {}
    if (!ok) {
      const alt = /-sub-espanol$/i.test(slug) ? slug.replace(/-sub-espanol$/i, '') : slug + '-sub-espanol';
      try {
        const pagina = await traerMc('/anime/' + alt);
        html = pagina.text;
        ok = pagina.ok;
      } catch (e) {}
    }
    if (!ok || !html) {
      throw kino.error('unavailable', 'MonosChinos no entregó la serie', {
        userMessage: 'MonosChinos no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    const serie = mcInfoSerie(html, slug);
    const ajaxM = /data-ajax=["']([^"']+)["']/i.exec(html);
    if (!ajaxM) {
      throw kino.error('not_found', 'MonosChinos: sin data-ajax', {
        userMessage: 'No se pudieron leer los capítulos en MonosChinos.'
      });
    }
    const ajaxUrl = absolutizar(ajaxM[1], BASE_MC + '/anime/' + slug);
    let meta = null;
    try { meta = await traerJsonMc(ajaxUrl); } catch (e) { log('mc ajax', (e && e.message) || e); }
    const epsMeta = (meta && meta.eps) || [];
    const porPagina = parseInt((meta && meta.perpage) || '50', 10) || 50;
    const paginarUrl = (meta && meta.paginate_url) || '';
    const caps = [];
    if (paginarUrl && epsMeta.length) {
      const paginas = Math.min(10, Math.max(1, Math.ceil(epsMeta.length / porPagina)));
      for (let loteIni = 1; loteIni <= paginas; loteIni += 3) {
        const lote = [];
        for (let p = loteIni; p < loteIni + 3 && p <= paginas; p++) lote.push(p);
        const rtas = await Promise.all(lote.map(async (p) => {
          try {
            const jn = paginarUrl.indexOf('?') >= 0 ? '&' : '?';
            const data = await traerJsonMc(paginarUrl + jn + 'p=' + p);
            return (data && data.caps) || [];
          } catch (e) { return []; }
        }));
        for (const grupo of rtas) for (const c of grupo) caps.push(c);
      }
    }
    const lista = [];
    const vistos = new Set();
    const base = slug.replace(/-sub-espanol$/i, '');
    if (caps.length) {
      for (const c of caps) {
        const n = parseInt(c && c.episodio, 10);
        if (!n || vistos.has(n)) continue;
        vistos.add(n);
        let epSlug = base;
        const vm = /\/ver\/([A-Za-z0-9._~-]+)-episodio-(\d+)/.exec(String(c.url || ''));
        if (vm) epSlug = vm[1];
        lista.push({ season: 1, number: n, ref: 'mc:' + epSlug + ':' + n, title: 'Episodio ' + n });
      }
    } else {
      for (const e of epsMeta) {
        const n = parseInt(e && e.num, 10);
        if (!n || vistos.has(n)) continue;
        vistos.add(n);
        lista.push({ season: 1, number: n, ref: 'mc:' + base + ':' + n, title: 'Episodio ' + n });
      }
    }
    if (!lista.length) {
      throw kino.error('not_found', 'MonosChinos: 0 capítulos', {
        userMessage: 'Esta serie no tiene capítulos en MonosChinos.'
      });
    }
    lista.sort((a, b) => a.number - b.number);
    return { series: serie, episodes: lista };
  },

  async resolver(epSlug, n, idx) {
    const num = n || 1;
    const pagina = await traerMc('/ver/' + epSlug + '-episodio-' + num);
    if (!pagina.ok || !pagina.text) {
      throw kino.error('not_found', 'MonosChinos no entregó el capítulo', {
        userMessage: 'No se pudo abrir este capítulo en MonosChinos.'
      });
    }
    const servers = mcServidores(pagina.text);
    if (!servers.length) {
      throw kino.error('not_found', 'MonosChinos: sin servidores', {
        userMessage: 'Este capítulo no tiene servidores reproducibles en MonosChinos.'
      });
    }
    return await probarServidores(servers, idx, function (i) {
      return 'mc:' + epSlug + ':' + num + ':' + i;
    });
  }
});

function mcServidores(html) {
  const servers = [];
  const vistos = {};
  const re = /data-player=["']([^"']+)["'][^>]*>([^<]*)</gi;
  let x;
  while ((x = re.exec(String(html || '')))) {
    const url = b64Texto(x[1]).trim();
    if (!url || !/^https?:\/\//i.test(url)) continue;
    const nombre = String(x[2] || '').replace(/\s+/g, ' ').trim() || 'Servidor';
    const tipo = detectarTipo(nombre, url);
    if (!tipo) continue;
    const clave = tipo + '|' + url;
    if (vistos[clave]) continue;
    vistos[clave] = true;
    servers.push({ nombre: nombre, url: url, tipo: tipo });
  }
  servers.sort(function (a, b) {
    return (TIPO_ORDEN[a.tipo] || 20) - (TIPO_ORDEN[b.tipo] || 20);
  });
  return servers;
}

/* ---------- fuente: LataAnime ---------- */

async function traerLat(camino, timeoutMs) {
  return await traer(BASE_LAT + camino, { headers: { Referer: BASE_LAT + '/' }, timeoutMs: timeoutMs || 10000 });
}

function latAtributo(tag, nombre) {
  const re = new RegExp('\\b' + nombre + '\\s*=\\s*([\\"\'])(.*?)\\1', 'i');
  const m = re.exec(tag);
  return m ? (m[2] || '').trim() : '';
}

function latSrcset(valor) {
  if (!valor) return '';
  const partes = valor.split(',').map((p) => p.trim().split(/\s+/)[0]).filter(Boolean);
  return partes.length ? partes[partes.length - 1] : '';
}

function latImagen(bloque) {
  const tags = [];
  const tagRe = /<(?:img|source)\b[^>]*>/gi;
  let m;
  while ((m = tagRe.exec(String(bloque || '')))) tags.push(m[0]);
  const attrs = ['data-src', 'data-lazy-src', 'data-original', 'data-image', 'data-poster', 'data-url', 'data-srcset', 'srcset', 'src'];
  for (const tag of tags) {
    for (const nombre of attrs) {
      let cand = latAtributo(tag, nombre);
      if (nombre.indexOf('srcset') >= 0) cand = latSrcset(cand);
      if (!cand) continue;
      let u = cand.trim().replace(/&amp;/gi, '&');
      if (!u || /^(data:|blob:|javascript:)/i.test(u)) continue;
      if (u.indexOf('//') === 0) u = 'https:' + u;
      if (/^https?:\/\//i.test(u)) return u;
      if (u.charAt(0) === '/') return BASE_LAT + u;
    }
  }
  return '';
}

function latTarjetas(html) {
  const re = /<a\b[^>]*href\s*=\s*(["'])(?:https?:\/\/latanime\.org)?\/anime\/([^"'\s?#]+)/gi;
  const marcas = [];
  let m;
  while ((m = re.exec(String(html || '')))) {
    marcas.push({ slug: m[2], at: m.index, fin: re.lastIndex });
  }
  const out = [];
  const vistos = new Set();
  for (let i = 0; i < marcas.length && out.length < 30; i++) {
    const slug = marcas[i].slug;
    if (vistos.has(slug)) continue;
    vistos.add(slug);
    const desde = marcas[i].at;
    const hasta = i + 1 < marcas.length ? marcas[i + 1].at : Math.min(html.length, desde + 2500);
    const antes = html.slice(Math.max(marcas[i].fin, desde - 1500), desde);
    const trozo = html.slice(desde, hasta);
    const poster = latImagen(trozo) || latImagen(antes);
    const tituloM = /<strong\b[^>]*>([\s\S]*?)<\/strong>/i.exec(trozo) ||
      /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/i.exec(trozo) ||
      /title\s*=\s*(["'])(.*?)\1/i.exec(trozo);
    let titulo = tituloM ? limpio(tituloM[2] || tituloM[1] || '') : '';
    if (!titulo) titulo = slugATitulo(slug);
    const cuerpo = html.slice(marcas[i].fin, hasta);
    const anhoM = /\b(19\d{2}|20\d{2})\b/.exec(trozo);
    const esPeli = /\bpelicula\b/i.test(cuerpo);
    const item = {
      id: 'lat-' + slug,
      ref: esPeli ? 'lat:' + slug + ':1' : 'lat:' + slug,
      title: titulo.slice(0, 200),
      kind: esPeli ? 'movie' : 'series',
      badges: ['LataAnime']
    };
    if (poster) item.poster = poster;
    if (anhoM) item.year = anhoM[1];
    out.push(item);
  }
  return out;
}

registrarFuente({
  id: 'lat',
  etiqueta: 'LataAnime',

  async buscar(q, query) {
    const terminos = [];
    const meter = (s) => { const t = String(s || '').trim(); if (t && terminos.indexOf(t) === -1 && terminos.length < 2) terminos.push(t); };
    meter(q);
    if (query) meter(query.originalTitle);
    if (!terminos.length) return [];
    const rtas = await Promise.all(terminos.map(async (t) => {
      try {
        const pagina = await traerLat('/buscar?q=' + encodeURIComponent(t));
        return pagina.ok ? latTarjetas(pagina.text) : [];
      } catch (e) { return []; }
    }));
    const salida = [];
    const vistos = new Set();
    for (const items of rtas) {
      for (const it of items) {
        if (vistos.has(it.id)) continue;
        vistos.add(it.id);
        salida.push(it);
      }
    }
    return salida.slice(0, 25);
  },

  async portada() {
    const tareas = [
      (async () => {
        const pagina = await traerLat('/', 9000);
        const items = latTarjetas(pagina.text).slice(0, 20);
        return items.length ? { id: 'lat-novedades', title: 'Novedades · LataAnime', ref: 'lat-novedades', items: items } : null;
      })(),
      (async () => {
        const pagina = await traerLat('/buscar?q=latino', 9000);
        const items = latTarjetas(pagina.text).slice(0, 20);
        return items.length ? { id: 'lat-latino', title: 'En latino · LataAnime', ref: 'lat-latino', items: items } : null;
      })(),
      (async () => {
        const pagina = await traerLat('/buscar?q=castellano', 9000);
        const items = latTarjetas(pagina.text).slice(0, 20);
        return items.length ? { id: 'lat-castellano', title: 'En castellano · LataAnime', ref: 'lat-castellano', items: items } : null;
      })()
    ];
    const rtas = await Promise.all(tareas.map((t) => t.catch((e) => { log('lat fila', (e && e.message) || e); return null; })));
    const filas = [];
    for (const fila of rtas) if (fila) filas.push(fila);
    return filas;
  },

  async hoja(ref) {
    let camino = null;
    if (ref === 'lat-novedades') camino = '/';
    else if (ref === 'lat-latino') camino = '/buscar?q=latino';
    else if (ref === 'lat-castellano') camino = '/buscar?q=castellano';
    if (!camino) return null;
    const pagina = await traerLat(camino, 12000);
    if (!pagina.ok) {
      throw kino.error('unavailable', 'LataAnime no respondió (status ' + pagina.status + ')', {
        userMessage: 'LataAnime no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    const items = latTarjetas(pagina.text).slice(0, 60);
    return { items: items, next: null };
  },

  async detalle(slug) {
    const pagina = await traerLat('/anime/' + slug);
    if (!pagina.ok || !pagina.text) return null;
    return latInfoSerie(pagina.text, slug);
  },

  async episodios(slug) {
    const pagina = await traerLat('/anime/' + slug);
    if (!pagina.ok || !pagina.text) {
      throw kino.error('not_found', 'LataAnime no entregó la serie', {
        userMessage: 'No se pudo abrir esta serie en LataAnime.'
      });
    }
    const serie = latInfoSerie(pagina.text, slug);
    const lista = [];
    const vistos = new Set();
    const re = /<a\s+href="(?:https?:\/\/latanime\.org)?\/ver\/([^"\s]+)"[^>]*>([\s\S]*?)<\/a>/g;
    let m;
    while ((m = re.exec(pagina.text)) && lista.length < 3000) {
      const epM = /^(.*)-episodio-(\d+)$/.exec(m[1]);
      if (!epM || vistos.has(m[1])) continue;
      vistos.add(m[1]);
      const n = parseInt(epM[2], 10);
      if (!n) continue;
      const etiqueta = limpio(m[2]).slice(0, 200);
      const cola = /-\s*(cap[ií]tulo\s+\d+.*)$/i.exec(etiqueta);
      lista.push({
        season: 1,
        number: n,
        ref: 'lat:' + epM[1] + ':' + n,
        title: (cola ? cola[1] : etiqueta) || 'Episodio ' + n
      });
    }
    if (!lista.length) {
      throw kino.error('not_found', 'LataAnime: 0 capítulos', {
        userMessage: 'Esta serie no tiene capítulos en LataAnime.'
      });
    }
    lista.sort((a, b) => a.number - b.number);
    return { series: serie, episodes: lista };
  },

  async resolver(epSlug, n, idx) {
    const num = n || 1;
    let pagina = null;
    try {
      pagina = await traerLat('/ver/' + epSlug + '-episodio-' + num);
    } catch (e) {}
    if (!pagina || !pagina.ok) {
      try {
        pagina = await traerLat('/ver/' + epSlug);
      } catch (e) {}
    }
    if (!pagina || !pagina.ok || !pagina.text) {
      throw kino.error('not_found', 'LataAnime no entregó el capítulo', {
        userMessage: 'No se pudo abrir este capítulo en LataAnime.'
      });
    }
    const servers = latServidores(pagina.text);
    if (!servers.length) {
      throw kino.error('not_found', 'LataAnime: sin servidores', {
        userMessage: 'Este capítulo no tiene servidores reproducibles en LataAnime.'
      });
    }
    return await probarServidores(servers, idx, function (i) {
      return 'lat:' + epSlug + ':' + num + ':' + i;
    });
  }
});

function latInfoSerie(html, slug) {
  const serie = { title: slugATitulo(slug) };
  const h2 = /<h2>([^<]+)<\/h2>/.exec(html);
  if (h2) serie.title = limpio(h2[1]) || serie.title;
  const poster = latImagen(html);
  if (poster) serie.poster = poster;
  const overM = /<p class="my-2 opacity-75">([\s\S]*?)<\/p>/.exec(html);
  if (overM) serie.overview = limpio(overM[1]).slice(0, 2000);
  const generos = [];
  const gre = /\/genero\/([a-z0-9-]+)"/g;
  let g;
  while ((g = gre.exec(html)) && generos.length < 5) {
    const id = LAT_GENEROS[g[1]];
    if (id && generos.indexOf(id) === -1) generos.push(id);
  }
  if (generos.length) serie.genres = generos;
  const anhoM = /\b(19\d{2}|20\d{2})\b/.exec(serie.title || '');
  if (anhoM) serie.year = anhoM[1];
  return serie;
}

const LAT_GENEROS = {
  accion: 'accion', comedia: 'comedia', drama: 'drama', fantasia: 'fantasia',
  romance: 'romance', terror: 'terror', misterio: 'misterio',
  'ciencia-ficcion': 'ciencia-ficcion', deportes: 'deportes', musica: 'musica'
};

function latServidores(html) {
  const servers = [];
  const vistos = {};
  const re = /<a\b([^>]*data-player="([^"]+)"[^>]*)>([^<]*)<\/a>/g;
  let m;
  while ((m = re.exec(String(html || '')))) {
    if (!/play-video/.test(m[1])) continue;
    const url = b64Texto(m[2]).trim();
    if (!url || !/^https?:\/\//i.test(url)) continue;
    const nombre = String(m[3] || '').replace(/\s+/g, ' ').trim() || 'Servidor';
    const tipo = detectarTipo(nombre, url);
    if (!tipo) continue;
    const clave = tipo + '|' + url;
    if (vistos[clave]) continue;
    vistos[clave] = true;
    servers.push({ nombre: nombre, url: url, tipo: tipo });
  }
  servers.sort(function (a, b) {
    return (TIPO_ORDEN[a.tipo] || 20) - (TIPO_ORDEN[b.tipo] || 20);
  });
  return servers;
}

/* ---------- utilidades de las fuentes nuevas (v0.6.0) ---------- */

/* Saca reproductores de una página de episodio a lo defensivo: iframes con
 * src, data-player/data-link en base64 (el patrón de MonosChinos, LataAnime
 * y el tema Dooplay) y enlaces de embed. Los agregadores propios caen en
 * 'multi', que abre con el navegador oculto: la captura pesca el video
 * aunque el player no se deje leer. */
function servidoresDePagina(html) {
  const texto = String(html || '');
  const candidatos = [];
  const ifRe = /<iframe[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = ifRe.exec(texto))) candidatos.push({ url: m[1], nombre: '' });
  const dpRe = /\bdata-(?:player|link)\s*=\s*["']([^"']+)["']/gi;
  while ((m = dpRe.exec(texto))) {
    const dec = b64Texto(m[1]).trim();
    if (/^https?:\/\//i.test(dec) && !/\.(?:jpg|jpeg|png|webp|gif)(?:$|\?)/i.test(dec)) {
      candidatos.push({ url: dec, nombre: '' });
    }
  }
  const aRe = /<a\b[^>]*href\s*=\s*["']([^"']*(?:embed|\/e\/|player|videoembed)[^"']*)["'][^>]*>([^<]{0,50})</gi;
  while ((m = aRe.exec(texto))) candidatos.push({ url: m[1], nombre: m[2] });
  const servers = [];
  const vistos = {};
  const propios = /(animeonline\.ninja|otakustv2?\.com|otakustv\.net|animeyt\.(?:cc|one|org)|estrenosanime\.net|ivanime\.(?:top|buzz))/i;
  for (let i = 0; i < candidatos.length; i++) {
    const c = candidatos[i];
    let u = String(c.url || '').trim();
    if (u.indexOf('//') === 0) u = 'https:' + u;
    if (!/^https?:\/\//i.test(u)) continue;
    if (propios.test(u)) continue;
    const tipo = detectarTipo(c.nombre, u);
    if (!tipo) continue;
    if (tipo === 'generic' && !/embed|\/e\/|player|video|stream/i.test(u)) continue;
    const clave = tipo + '|' + u;
    if (vistos[clave]) continue;
    vistos[clave] = true;
    servers.push({ nombre: String(c.nombre || '').replace(/\s+/g, ' ').trim() || 'Servidor', url: u, tipo: tipo });
  }
  servers.sort(function (a, b) {
    return (TIPO_ORDEN[a.tipo] || 20) - (TIPO_ORDEN[b.tipo] || 20);
  });
  return servers;
}

/* El resolve de las fuentes nuevas: primero los servidores de verdad y, si
 * ninguno abre (o lo único que hay es un multiserver opaco), la captura del
 * episodio entero con el navegador oculto. */
async function probarConCaptura(epUrl, servers, idx, refDe, etiqueta) {
  try {
    return await probarServidores(servers, idx, refDe);
  } catch (e) {
    if (puedeCapturar() && queda() > 8000) {
      try {
        const st = await capturar(epUrl, etiqueta);
        const out = { url: st.url, label: etiqueta + ' (captura)', expiresInSeconds: 1800 };
        if (st.mime) out.mime = st.mime;
        out.headers = st.headers || { 'User-Agent': UA };
        log('resolve por captura:', etiqueta);
        return out;
      } catch (e2) {
        log('la captura del episodio falló', (e2 && e2.message) || e2);
      }
    }
    throw e;
  }
}

/* v0.6.1: el póster de una tarjeta puede venir en cualquier atributo de
 * carga perezosa; se prueban en orden de prioridad (los data- primero:
 * el src crudo suele ser un marcador de posición). */
function posterEnVentana(ventana) {
  const v = String(ventana || '');
  const atributos = ['data-lazy-src', 'data-src', 'data-original', 'data-litespeed-src', 'src'];
  for (let i = 0; i < atributos.length; i++) {
    const re = new RegExp('\\b' + atributos[i] + '\\s*=\\s*["\']([^"\']*(?:\\.jpe?g|\\.png|\\.webp)[^"\']*)["\']', 'i');
    const m = re.exec(v);
    if (m && !/^data:/i.test(m[1])) {
      return m[1].indexOf('//') === 0 ? 'https:' + m[1] : m[1];
    }
  }
  /* v0.6.2: último recurso — cualquier URL de imagen con extensión que
   * ande por la ventana, venga del atributo que venga (srcset, data-echo,
   * data-bg…): mejor un póster con acento raro que una tarjeta gris. */
  const libre = /https?:\/\/[^"'\s>]+?\.(?:jpe?g|png|webp)(?:\?[^"'\s>]*)?["'\s>]/i.exec(v);
  if (libre) return libre[0].replace(/["'\s>]+$/, '');
  return '';
}

/* v0.6.1: en algunos listados (EstrenosAnime) la imagen de la tarjeta va
 * ANTES del ancla, fuera de la ventana del <a>: se mira hacia atrás y se
 * toma el <img> más cercano. v0.6.2: la ventana crece a 1500 — en el feed
 * de episodios las insignias SUB/EP N alejan la imagen del ancla y con
 * 600 se quedaba fuera. */
function posterAntesDe(html, idx) {
  const antes = String(html || '').slice(Math.max(0, idx - 1500), idx);
  const tags = antes.match(/<img\b[^>]*>/gi) || [];
  for (let i = tags.length - 1; i >= 0; i--) {
    const p = posterEnVentana(tags[i]);
    if (p) return p;
  }
  return '';
}

/* v0.6.1: contenedores propios tipo mytsumi.com/container.php (AnimeYT):
 * un iframe que no parece player pero que adentro enlaza los servidores
 * de verdad (ok.ru, byse→filemoon…). Se sondea: se carga y se cosecha. */
async function sondearContenedores(html) {
  const texto = String(html || '');
  const candidatos = [];
  const ifRe = /<iframe[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = ifRe.exec(texto))) {
    let u = m[1].trim();
    if (u.indexOf('//') === 0) u = 'https:' + u;
    if (!/^https?:\/\//i.test(u)) continue;
    if (/(animeonline\.ninja|otakustv2?\.com|otakustv\.net|animeyt\.(?:cc|one|org)|estrenosanime\.net|ivanime\.(?:top|buzz)|saidochesto)/i.test(u)) continue;
    candidatos.push(u);
  }
  const servers = [];
  const vistos = {};
  let sondeos = 0;
  for (const u of candidatos) {
    if (sondeos >= 2 || queda() < 6000) break;
    if (detectarTipo('', u) !== 'generic') continue; /* ya es un player directo */
    sondeos++;
    try {
      const r = await traer(u, { headers: { Referer: BASE_AYT + '/', 'User-Agent': UA }, timeoutMs: 8000 });
      if (!r.ok || !r.text) continue;
      const dentro = servidoresDePagina(r.text);
      for (const s of dentro) {
        const clave = s.tipo + '|' + s.url;
        if (vistos[clave]) continue;
        vistos[clave] = true;
        servers.push(s);
      }
      if (dentro.length) log('sondeo de contenedor:', u, '->', dentro.length, 'servidores');
    } catch (e) {
      log('sondeo de contenedor falló:', u, (e && e.message) || e);
    }
  }
  servers.sort(function (a, b) {
    return (TIPO_ORDEN[a.tipo] || 20) - (TIPO_ORDEN[b.tipo] || 20);
  });
  return servers;
}

function sinAcentos(s) {
  return String(s || '').toLowerCase()
    .replace(/[áàäâ]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o').replace(/[úùüû]/g, 'u').replace(/ñ/g, 'n').trim();
}

function titulosParecen(q, titulo) {
  const a = sinAcentos(q);
  const b = sinAcentos(titulo);
  return a.length >= 2 && b.indexOf(a) >= 0;
}

/* ---------- fuente: OtakusTV (otakustv.net) ---------- */

const BASE_OTV = 'https://www.otakustv.net';

function otvPoster(slug, clase) {
  return 'https://www.otakustv.net/cdn/img/' + (clase === 'portada' ? 'portada' : 'anime') + '/' + slug + '.webp';
}

function otvTarjetas(html, clase) {
  const re = /<a\b[^>]*href\s*=\s*["'][^"']*\/anime\/([^"\/?#]+)[^>]*>([\s\S]{0,900}?)<\/a>/gi;
  const items = [];
  const vistos = new Set();
  let m;
  while ((m = re.exec(String(html || ''))) && items.length < 40) {
    const slug = m[1];
    if (!slug || vistos.has(slug)) continue;
    vistos.add(slug);
    const ventana = m[2];
    let titulo = '';
    const al = /alt\s*=\s*["']([^"']{2,})["']/i.exec(ventana);
    const tt = /title\s*=\s*["']([^"']{2,})["']/i.exec(ventana);
    if (tt) titulo = decHtml(tt[1]);
    else if (al) titulo = decHtml(al[1]);
    if (!titulo) {
      const h = /<h[1-6][^>]*>([^<]{2,})</i.exec(ventana);
      if (h) titulo = limpio(h[1]);
    }
    if (!titulo || titulo.length < 2) titulo = slugATitulo(slug);
    const item = {
      id: 'otv-' + slug,
      ref: 'otv:' + slug,
      title: titulo.slice(0, 200),
      kind: 'series',
      poster: otvPoster(slug, clase)
    };
    items.push(item);
  }
  return items;
}

/* Los episodios del Inicio: anclas /ver/<slug>-<n> con su capturita al lado. */
function otvEpisodiosDe(html) {
  const re = /<a\b[^>]*href\s*=\s*["'][^"']*\/ver\/([a-z0-9-]+)-(\d+)[^>]*>([\s\S]{0,600}?)<\/a>/gi;
  const items = [];
  const vistos = new Set();
  let m;
  while ((m = re.exec(String(html || ''))) && items.length < 25) {
    const slug = m[1];
    const n = parseInt(m[2], 10);
    if (!slug || !n || vistos.has(slug)) continue;
    vistos.add(slug);
    const ventana = m[3];
    const im = /\/cdn\/img\/episodios\/(\d+)-(\d+)\.webp/i.exec(ventana);
    const item = {
      id: 'otv-ep-' + slug,
      ref: 'otv:' + slug,
      title: slugATitulo(slug),
      kind: 'series',
      poster: otvPoster(slug, 'anime')
    };
    item.badges = ['EP ' + n];
    if (im) item.backdrop = 'https://www.otakustv.net/cdn/img/episodios/' + im[1] + '-' + im[2] + '.webp';
    items.push(item);
  }
  return items;
}

registrarFuente({
  id: 'otv',
  etiqueta: 'OtakusTV',

  /* Sin buscador público conocido (el ?s= lo ignora): se buscan las primeras
   * páginas del directorio y se filtra por título, sin acentos ni mayúsculas. */
  async buscar(q) {
    const texto = String(q || '').trim();
    if (texto.length < 2) return [];
    const paginas = await Promise.all([1, 2, 3, 4].map(async (p) => {
      try {
        const r = await traer(BASE_OTV + '/animes?pag=' + p, { headers: { Referer: BASE_OTV + '/' }, timeoutMs: 9000 });
        return r.ok ? otvTarjetas(r.text, 'anime') : [];
      } catch (e) { return []; }
    }));
    const out = [];
    const vistos = new Set();
    for (const items of paginas) {
      for (const it of items) {
        if (vistos.has(it.ref)) continue;
        vistos.add(it.ref);
        if (titulosParecen(texto, it.title)) {
          it.badges = ['OtakusTV'];
          out.push(it);
        }
      }
    }
    return out.slice(0, 25);
  },

  async portada() {
    const tareas = [
      (async () => {
        const r = await traer(BASE_OTV + '/animes-en-emision', { headers: { Referer: BASE_OTV + '/' }, timeoutMs: 9000 });
        const items = otvTarjetas(r.text, 'portada').slice(0, 20);
        return items.length ? { id: 'otv-emision', title: 'En emisión · OtakusTV', ref: 'otv-emision', items: items } : null;
      })(),
      (async () => {
        const r = await traer(BASE_OTV + '/', { headers: { Referer: BASE_OTV + '/' }, timeoutMs: 9000 });
        const items = otvEpisodiosDe(r.text).slice(0, 20);
        return items.length ? { id: 'otv-eps', title: 'Últimos episodios · OtakusTV', ref: 'otv-eps', items: items } : null;
      })(),
      (async () => {
        const r = await traer(BASE_OTV + '/animes?pag=1', { headers: { Referer: BASE_OTV + '/' }, timeoutMs: 9000 });
        const items = otvTarjetas(r.text, 'anime').slice(0, 20);
        return items.length ? { id: 'otv-animes', title: 'Directorio · OtakusTV', ref: 'otv-animes', items: items } : null;
      })()
    ];
    const rtas = await Promise.all(tareas.map((t) => t.catch((e) => { log('otv fila', (e && e.message) || e); return null; })));
    const filas = [];
    for (const fila of rtas) if (fila) filas.push(fila);
    return filas;
  },

  async hoja(ref, cursor) {
    const num = Math.max(1, parseInt(String(cursor || '1'), 10) || 1);
    if (ref === 'otv-emision') {
      const r = await traer(BASE_OTV + '/animes-en-emision', { headers: { Referer: BASE_OTV + '/' }, timeoutMs: 10000 });
      const items = otvTarjetas(r.text, 'portada').slice(0, 40);
      return { items: items, next: null };
    }
    if (ref === 'otv-eps') {
      const r = await traer(BASE_OTV + '/', { headers: { Referer: BASE_OTV + '/' }, timeoutMs: 10000 });
      const items = otvEpisodiosDe(r.text).slice(0, 40);
      return { items: items, next: null };
    }
    if (ref === 'otv-animes') {
      const r = await traer(BASE_OTV + '/animes?pag=' + num, { headers: { Referer: BASE_OTV + '/' }, timeoutMs: 10000 });
      const items = otvTarjetas(r.text, 'anime');
      if (!items.length) return { items: [], next: null };
      return { items: items.slice(0, 40), next: String(num + 1) };
    }
    return null;
  },

  async detalle(slug) {
    const r = await traer(BASE_OTV + '/anime/' + slug, { headers: { Referer: BASE_OTV + '/' }, timeoutMs: 10000 });
    if (!r.ok || !r.text) return null;
    const serie = { title: slugATitulo(slug) };
    const h = /<h1[^>]*>([\s\S]{1,300}?)<\/h1>/i.exec(r.text);
    if (h) serie.title = limpio(h[1]) || serie.title;
    const og = /property=["']og:image["'][^>]*content=["']([^"']+)["']/i.exec(r.text) ||
      /content=["']([^"']+)["'][^>]*property=["']og:image["']/i.exec(r.text);
    if (og) serie.poster = og[1];
    if (!serie.poster) serie.poster = otvPoster(slug, 'portada');
    const sinM = /<p[^>]*>([^<]{30,600})<\/p>/i.exec(r.text);
    if (sinM) serie.overview = limpio(sinM[1]).slice(0, 400);
    return serie;
  },

  async episodios(slug) {
    const r = await traer(BASE_OTV + '/anime/' + slug, { headers: { Referer: BASE_OTV + '/' }, timeoutMs: 10000 });
    if (!r.ok || !r.text) {
      throw kino.error('unavailable', 'OtakusTV no entregó la serie', {
        userMessage: 'OtakusTV no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    const re = /\/ver\/([a-z0-9-]+)-(\d+)/gi;
    const numeros = new Set();
    let m;
    while ((m = re.exec(r.text))) {
      if (m[1] === slug) numeros.add(parseInt(m[2], 10));
    }
    if (!numeros.size) {
      throw kino.error('not_found', 'OtakusTV: 0 capítulos', {
        userMessage: 'No se pudieron leer los capítulos de esta serie en OtakusTV.'
      });
    }
    const lista = [];
    for (const n of numeros) {
      if (n < 1 || n > 9999) continue;
      lista.push({ season: 1, number: n, ref: 'otv:' + slug + ':' + n, title: 'Episodio ' + n });
    }
    lista.sort((a, b) => a.number - b.number);
    return { series: { title: slugATitulo(slug) }, episodes: lista };
  },

  async resolver(slug, n, idx) {
    const num = n || 1;
    const r = await traer(BASE_OTV + '/ver/' + slug + '-' + num, { headers: { Referer: BASE_OTV + '/' }, timeoutMs: 10000 });
    if (!r.ok || !r.text) {
      throw kino.error('not_found', 'OtakusTV no entregó el episodio', {
        userMessage: 'No se pudo abrir este episodio en OtakusTV.'
      });
    }
    const servers = servidoresDePagina(r.text);
    /* v0.6.1: la página del episodio trae sus opciones (filemoon, byse,
     * uqload…) pero las carga con JavaScript: sin URLs legibles en el HTML.
     * Sin guard: con o sin servidores a la vista, probarConCaptura cae a
     * la captura del navegador oculto, que abre el player por defecto. */
    return await probarConCaptura(BASE_OTV + '/ver/' + slug + '-' + num, servers, idx, function (i) {
      return 'otv:' + slug + ':' + num + ':' + i;
    }, 'OtakusTV');
  }
});

/* ---------- fuente: AnimeYT (animeyt.cc) ---------- */

const BASE_AYT = 'https://animeyt.cc';

function aytTarjetas(html) {
  const re = /<a\b[^>]*href\s*=\s*["'][^"']*\/(?:tv|anime)\/([^"\/?#]+)[^>]*>([\s\S]{0,900}?)<\/a>/gi;
  const items = [];
  const vistos = new Set();
  let m;
  while ((m = re.exec(String(html || ''))) && items.length < 40) {
    const slug = m[1];
    if (!slug || /^(?:page|anime|tv|peliculas|movies)$/i.test(slug) || vistos.has(slug)) continue;
    vistos.add(slug);
    const ventana = m[2];
    let titulo = '';
    const al = /alt\s*=\s*["']([^"']{2,})["']/i.exec(ventana);
    const tt = /title\s*=\s*["']([^"']{2,})["']/i.exec(ventana);
    if (tt) titulo = decHtml(tt[1]);
    else if (al) titulo = decHtml(al[1]);
    if (!titulo) {
      const h = /<h[1-6][^>]*>([\s\S]{1,200}?)<\/h[1-6]>/i.exec(ventana);
      if (h) titulo = limpio(h[1]);
    }
    if (!titulo || titulo.length < 2) titulo = slugATitulo(slug);
    const item = {
      id: 'ayt-' + slug,
      ref: 'ayt:' + slug,
      title: titulo.slice(0, 200),
      kind: /pel[íi]cula|movie/i.test(ventana) ? 'movie' : 'series'
    };
    /* v0.6.1: póster con atributos de carga perezosa en orden de prioridad
     * (antes solo src|data-src y las tarjetas quedaban grises). v0.6.2:
     * si la imagen no vive dentro del ancla, se mira hacia atrás, que
     * algunos listados la dejan antes del <a>. */
    let poster = posterEnVentana(ventana);
    if (!poster) poster = posterAntesDe(String(html || ''), m.index);
    if (poster) item.poster = poster;
    const ym = /\b(19\d{2}|20\d{2})\b/.exec(ventana);
    if (ym) item.year = ym[1];
    items.push(item);
  }
  return items;
}

registrarFuente({
  id: 'ayt',
  etiqueta: 'AnimeYT',

  async buscar(q) {
    const texto = String(q || '').trim().slice(0, 100);
    if (texto.length < 2) return [];
    try {
      const r = await traer(BASE_AYT + '/?s=' + encodeURIComponent(texto), { headers: { Referer: BASE_AYT + '/' }, timeoutMs: 10000 });
      if (!r.ok) return [];
      const items = aytTarjetas(r.text).slice(0, 25);
      for (const it of items) it.badges = ['AnimeYT'];
      return items;
    } catch (e) {
      log('ayt buscar', (e && e.message) || String(e));
      return [];
    }
  },

  async portada() {
    const tareas = [
      (async () => {
        const r = await traer(BASE_AYT + '/tv/', { headers: { Referer: BASE_AYT + '/' }, timeoutMs: 9000 });
        const items = aytTarjetas(r.text).slice(0, 20);
        return items.length ? { id: 'ayt-latest', title: 'Últimos agregados · AnimeYT', ref: 'ayt-latest', items: items } : null;
      })(),
      (async () => {
        const r = await traer(BASE_AYT + '/tv/?tipo=pelicula', { headers: { Referer: BASE_AYT + '/' }, timeoutMs: 9000 });
        const items = aytTarjetas(r.text).slice(0, 20);
        return items.length ? { id: 'ayt-peliculas', title: 'Películas · AnimeYT', ref: 'ayt-peliculas', items: items } : null;
      })()
    ];
    const rtas = await Promise.all(tareas.map((t) => t.catch((e) => { log('ayt fila', (e && e.message) || e); return null; })));
    const filas = [];
    for (const fila of rtas) if (fila) filas.push(fila);
    return filas;
  },

  async hoja(ref, cursor) {
    const num = Math.max(1, parseInt(String(cursor || '1'), 10) || 1);
    let camino = null;
    if (ref === 'ayt-latest') camino = '/tv/' + (num > 1 ? 'page/' + num + '/' : '');
    else if (ref === 'ayt-peliculas') camino = '/tv/' + (num > 1 ? 'page/' + num + '/' : '') + '?tipo=pelicula';
    if (!camino) return null;
    const r = await traer(BASE_AYT + camino, { headers: { Referer: BASE_AYT + '/' }, timeoutMs: 10000 });
    if (!r.ok) {
      throw kino.error('unavailable', 'AnimeYT no respondió (status ' + r.status + ')', {
        userMessage: 'AnimeYT no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    const items = aytTarjetas(r.text);
    if (!items.length) return { items: [], next: null };
    return { items: items.slice(0, 30), next: String(num + 1) };
  },

  async detalle(slug) {
    const r = await traer(BASE_AYT + '/tv/' + slug, { headers: { Referer: BASE_AYT + '/' }, timeoutMs: 10000 });
    if (!r.ok || !r.text) return null;
    const serie = { title: slugATitulo(slug) };
    const h = /<h1[^>]*>([\s\S]{1,300}?)<\/h1>/i.exec(r.text);
    if (h) serie.title = limpio(h[1]) || serie.title;
    const og = /property=["']og:image["'][^>]*content=["']([^"']+)["']/i.exec(r.text);
    if (og) serie.poster = og[1].indexOf('//') === 0 ? 'https:' + og[1] : og[1];
    const sinM = /<p[^>]*>([\s\S]{30,600}?)<\/p>/i.exec(r.text);
    if (sinM) serie.overview = limpio(sinM[1]).slice(0, 400);
    return serie;
  },

  async episodios(slug) {
    const r = await traer(BASE_AYT + '/tv/' + slug, { headers: { Referer: BASE_AYT + '/' }, timeoutMs: 10000 });
    if (!r.ok || !r.text) {
      throw kino.error('unavailable', 'AnimeYT no entregó la serie', {
        userMessage: 'AnimeYT no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    /* Los episodios viven en /<id>/anime/<algo>-capitulo-N/ dentro de la ficha. */
    const re = /href\s*=\s*["'][^"']*\/(\d+)\/anime\/([^"\/?#]+)-capitulo-(\d+)/gi;
    const numeros = new Set();
    let m;
    while ((m = re.exec(r.text))) numeros.add(parseInt(m[3], 10));
    if (!numeros.size) {
      throw kino.error('not_found', 'AnimeYT: 0 capítulos', {
        userMessage: 'No se pudieron leer los capítulos de esta serie en AnimeYT.'
      });
    }
    const lista = [];
    for (const n of numeros) {
      if (n < 1 || n > 9999) continue;
      lista.push({ season: 1, number: n, ref: 'ayt:' + slug + ':' + n, title: 'Episodio ' + n });
    }
    lista.sort((a, b) => a.number - b.number);
    return { series: { title: slugATitulo(slug) }, episodes: lista };
  },

  async resolver(slug, n, idx) {
    const num = n || 1;
    /* La página del episodio lleva un id propio: se relee la ficha para dar
     * con el enlace justo del capítulo pedido. */
    const ficha = await traer(BASE_AYT + '/tv/' + slug, { headers: { Referer: BASE_AYT + '/' }, timeoutMs: 10000 });
    const re = new RegExp('href\\s*=\\s*["\'][^"\']*\\/(\\d+)\\/anime\\/([^"\\/?#]+)-capitulo-' + num, 'i');
    const am = ficha.ok ? re.exec(ficha.text) : null;
    if (!am) {
      throw kino.error('not_found', 'AnimeYT: capítulo no hallado', {
        userMessage: 'No se halló el enlace de este capítulo en AnimeYT.'
      });
    }
    const epUrl = BASE_AYT + '/' + am[1] + '/anime/' + am[2] + '-capitulo-' + num;
    const r = await traer(epUrl, { headers: { Referer: BASE_AYT + '/' }, timeoutMs: 10000 });
    if (!r.ok || !r.text) {
      throw kino.error('not_found', 'AnimeYT no entregó el capítulo', {
        userMessage: 'No se pudo abrir este capítulo en AnimeYT.'
      });
    }
    const servers = servidoresDePagina(r.text);
    /* v0.6.1: AnimeYT esconde sus players tras un contenedor propio
     * (mytsumi.com/container.php) que no parece player: se sondea ese
     * iframe y se cosechan los servidores de adentro. Sin guard: si ni
     * así aparecen, probarConCaptura cae a la captura del navegador. */
    const extra = await sondearContenedores(r.text);
    const todos = servers.concat(extra);
    return await probarConCaptura(epUrl, todos, idx, function (i) {
      return 'ayt:' + slug + ':' + num + ':' + i;
    }, 'AnimeYT');
  }
});

/* ---------- fuente: EstrenosAnime (estrenosanime.net) ---------- */

const BASE_EAS = 'https://estrenosanime.net';

/* Las tarjetas de los listados: anclas /anime/<slug> con su ventanita. */
function easFichas(html) {
  const re = /<a\b[^>]*href\s*=\s*["'][^"']*\/anime\/([^"\/?#]+)[^>]*>([\s\S]{0,900}?)<\/a>/gi;
  const items = [];
  const vistos = new Set();
  let m;
  while ((m = re.exec(String(html || ''))) && items.length < 40) {
    const slug = m[1];
    if (!slug || vistos.has(slug)) continue;
    vistos.add(slug);
    const ventana = m[2];
    let titulo = '';
    const al = /alt\s*=\s*["']([^"']{2,})["']/i.exec(ventana);
    const tt = /title\s*=\s*["']([^"']{2,})["']/i.exec(ventana);
    if (tt) titulo = decHtml(tt[1]);
    else if (al) titulo = decHtml(al[1]);
    if (!titulo) {
      const h = /<h[1-6][^>]*>([\s\S]{1,200}?)<\/h[1-6]>/i.exec(ventana);
      if (h) titulo = limpio(h[1]);
    }
    if (!titulo || titulo.length < 2) titulo = slugATitulo(slug);
    const item = {
      id: 'eas-' + slug,
      ref: 'eas:' + slug,
      title: titulo.slice(0, 200),
      kind: /pel[íi]cula|movie/i.test(ventana) ? 'movie' : 'series'
    };
    /* v0.6.1: la imagen de las tarjetas va ANTES del ancla en los listados
     * del sitio; si no está dentro, se mira hacia atrás. */
    let poster = posterEnVentana(ventana);
    if (!poster) poster = posterAntesDe(String(html || ''), m.index);
    if (poster) item.poster = poster;
    items.push(item);
  }
  return items;
}

/* El feed de últimos episodios: anclas /ver/<slug>/episodio-N. */
function easEpisodiosDe(html) {
  const re = /<a\b[^>]*href\s*=\s*["'][^"']*\/ver\/([^"\/?#]+)\/episodio-(\d+)[^>]*>([\s\S]{0,600}?)<\/a>/gi;
  const items = [];
  const vistos = new Set();
  let m;
  while ((m = re.exec(String(html || ''))) && items.length < 25) {
    const slug = m[1];
    const n = parseInt(m[2], 10);
    if (!slug || !n || vistos.has(slug)) continue;
    vistos.add(slug);
    const ventana = m[3];
    const item = {
      id: 'eas-ep-' + slug,
      ref: 'eas:' + slug,
      title: slugATitulo(slug),
      kind: 'series'
    };
    item.badges = ['EP ' + n];
    /* v0.6.1: en el feed la imagen va ANTES del ancla del episodio. */
    let poster = posterEnVentana(ventana);
    if (!poster) poster = posterAntesDe(String(html || ''), m.index);
    if (poster) {
      item.backdrop = poster;
      item.poster = poster;
    }
    items.push(item);
  }
  return items;
}

registrarFuente({
  id: 'eas',
  etiqueta: 'EstrenosAnime',

  /* HONESTO: el sitio no ofrece búsqueda de texto pública (su página de
   * filtro solo tiene géneros y estados); la búsqueda global de Kino sigue
   * cubriendo con las demás fuentes. */
  async buscar(q) {
    log('eas: sin buscador propio, la búsqueda global sigue con las demás fuentes');
    return [];
  },

  async portada() {
    const defs = [
      { id: 'eas-eps', titulo: 'Últimos episodios · EstrenosAnime', ref: 'eas-eps', camino: '/ultimo-episodios', eps: true },
      { id: 'eas-sub', titulo: 'Sub español · EstrenosAnime', ref: 'eas-sub', camino: '/ultimo-subtitulado' },
      { id: 'eas-lat', titulo: 'Latino · EstrenosAnime', ref: 'eas-lat', camino: '/ultimo-latino' },
      { id: 'eas-popular', titulo: 'Popular · EstrenosAnime', ref: 'eas-popular', camino: '/popular' }
    ];
    const rtas = await Promise.all(defs.map(async (def) => {
      try {
        const r = await traer(BASE_EAS + def.camino, { headers: { Referer: BASE_EAS + '/' }, timeoutMs: 9000 });
        const items = (def.eps ? easEpisodiosDe(r.text) : easFichas(r.text)).slice(0, 20);
        return items.length ? { id: def.id, title: def.titulo, ref: def.ref, items: items } : null;
      } catch (e) {
        log('eas fila «' + def.titulo + '» falló', (e && e.message) || String(e));
        return null;
      }
    }));
    const filas = [];
    for (const fila of rtas) if (fila) filas.push(fila);
    return filas;
  },

  async hoja(ref) {
    let camino = null;
    let eps = false;
    if (ref === 'eas-eps') { camino = '/ultimo-episodios'; eps = true; }
    else if (ref === 'eas-sub') camino = '/ultimo-subtitulado';
    else if (ref === 'eas-lat') camino = '/ultimo-latino';
    else if (ref === 'eas-popular') camino = '/popular';
    if (!camino) return null;
    const r = await traer(BASE_EAS + camino, { headers: { Referer: BASE_EAS + '/' }, timeoutMs: 12000 });
    if (!r.ok) {
      throw kino.error('unavailable', 'EstrenosAnime no respondió (status ' + r.status + ')', {
        userMessage: 'EstrenosAnime no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    const items = (eps ? easEpisodiosDe(r.text) : easFichas(r.text)).slice(0, 60);
    /* La paginación de sus listados no se pudo verificar: se entrega una
     * página por hoja, sin inventar ?page= que no existe. */
    return { items: items, next: null };
  },

  async detalle(slug) {
    const r = await traer(BASE_EAS + '/anime/' + slug, { headers: { Referer: BASE_EAS + '/' }, timeoutMs: 10000 });
    if (!r.ok || !r.text) return null;
    const serie = { title: slugATitulo(slug) };
    const h = /<h1[^>]*>([\s\S]{1,300}?)<\/h1>/i.exec(r.text);
    if (h) serie.title = limpio(h[1]) || serie.title;
    const og = /property=["']og:image["'][^>]*content=["']([^"']+)["']/i.exec(r.text);
    if (og) serie.poster = og[1].indexOf('//') === 0 ? 'https:' + og[1] : og[1];
    const sinM = /<p[^>]*>([\s\S]{30,600}?)<\/p>/i.exec(r.text);
    if (sinM) serie.overview = limpio(sinM[1]).slice(0, 400);
    return serie;
  },

  async episodios(slug) {
    const r = await traer(BASE_EAS + '/anime/' + slug, { headers: { Referer: BASE_EAS + '/' }, timeoutMs: 10000 });
    if (!r.ok || !r.text) {
      throw kino.error('unavailable', 'EstrenosAnime no entregó la serie', {
        userMessage: 'EstrenosAnime no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    const re = /\/ver\/([^"\/?#]+)\/episodio-(\d+)/gi;
    const numeros = new Set();
    let m;
    while ((m = re.exec(r.text))) {
      if (m[1] === slug) numeros.add(parseInt(m[2], 10));
    }
    if (!numeros.size) {
      throw kino.error('not_found', 'EstrenosAnime: 0 capítulos', {
        userMessage: 'No se pudieron leer los capítulos de esta serie en EstrenosAnime.'
      });
    }
    const lista = [];
    for (const n of numeros) {
      if (n < 1 || n > 9999) continue;
      lista.push({ season: 1, number: n, ref: 'eas:' + slug + ':' + n, title: 'Episodio ' + n });
    }
    lista.sort((a, b) => a.number - b.number);
    return { series: { title: slugATitulo(slug) }, episodes: lista };
  },

  async resolver(slug, n, idx) {
    const num = n || 1;
    const epUrl = BASE_EAS + '/ver/' + slug + '/episodio-' + num;
    const r = await traer(epUrl, { headers: { Referer: BASE_EAS + '/' }, timeoutMs: 10000 });
    if (!r.ok || !r.text) {
      throw kino.error('not_found', 'EstrenosAnime no entregó el episodio', {
        userMessage: 'No se pudo abrir este episodio en EstrenosAnime.'
      });
    }
    /* Su reproductor es un multiserver propio que carga por JavaScript; lo
     * que se deje leer se prueba, y si no, la captura del episodio entero. */
    const servers = servidoresDePagina(r.text);
    return await probarConCaptura(epUrl, servers, idx, function (i) {
      return 'eas:' + slug + ':' + num + ':' + i;
    }, 'EstrenosAnime');
  }
});

/* ---------- fuente: AnimeOnline (animeonline.ninja) ---------- */

const BASE_AON = 'https://ww3.animeonline.ninja';

/* v0.6.2 — la puerta de AnimeOnline la guarda Cloudflare: a la petición
 * del plugin le responde su página de revisión («Just a a moment…») en
 * vez del catálogo, y en el teléfono eso se veía como un «Nada por ahora»
 * falso. Ahora se detecta la revisión y se dice la verdad. La cura es la
 * ventanita de la pantalla de la fuente: la persona la pasa una vez, y la
 * galleta de acceso (cf_clearance) viaja desde entonces con cada
 * petición, amarrada al disfraz exacto del navegador que la ganó
 * (Cloudflare las ata juntas). Además la ventanita entrega el HTML de la
 * página ya cargada (renderizada, hasta 2M de caracteres): el catálogo
 * se lee de ahí y queda de respaldo un rato. */
function aonJson(clave, def) {
  try {
    const crudo = kino.storage.get(clave);
    if (!crudo) return def;
    const val = JSON.parse(crudo);
    return val === null || val === undefined ? def : val;
  } catch (e) { return def; }
}

function aonJsonSet(clave, val) {
  try { kino.storage.set(clave, JSON.stringify(val)); return true; } catch (e) { return false; }
}

function aonEsRevision(texto) {
  return /just a moment|cf-chl|checking your browser|attention required|security verification|cf_chl/i.test(String(texto || '').slice(0, 4000));
}

function aonHeaders() {
  const h = { Referer: BASE_AON + '/' };
  const g = aonJson('aonCookies', null);
  if (g && typeof g === 'object') {
    const par = [];
    for (const k in g) if (g[k]) par.push(k + '=' + g[k]);
    if (par.length) h.Cookie = par.join('; ');
    const ua = aonJson('aonUA', '');
    if (ua) h['User-Agent'] = ua;
  }
  return h;
}

async function aonTraer(camino, timeoutMs) {
  const r = await traer(BASE_AON + camino, { headers: aonHeaders(), timeoutMs: timeoutMs || 10000 });
  if (r.ok && aonEsRevision(r.text)) {
    log('aon: página de revisión en ' + camino);
    return { ok: false, status: 403, revision: true, url: r.url, text: '' };
  }
  return r;
}

function aonErrorRevision() {
  return kino.error('unavailable', 'AnimeOnline pide su revisión de seguridad', {
    userMessage: 'AnimeOnline pide pasar su revisión de seguridad (Cloudflare). En la pantalla de AniJing, elige la fuente AnimeOnline y toca «Pasar la revisión»: se abre una ventanita, se pasa con un toque y el catálogo queda abierto.'
  });
}

/* El catálogo rescatado de la ventanita vive 30 minutos: la galleta ya
 * viaja con las peticiones, esto es solo el colchón mientras arranca. */
function aonRescatados() {
  const r = aonJson('aonRescate', null);
  if (!r || !Array.isArray(r.items) || !r.items.length) return [];
  if (Date.now() - (r.ts || 0) > 1800000) return [];
  return r.items.slice(0, 20);
}

/* «Pasar la revisión»: la ventanita de navegador de verdad que la persona
 * ve y maneja (solo tras su toque, requisito de Kino). Recoge las galletas
 * de acceso, el disfraz del navegador que las ganó y el HTML renderizado
 * de la página del catálogo. */
async function aonPasarRevision() {
  if (!kino.visualBrowser || !kino.visualBrowser.available) return { st: 'sin-ventanita' };
  try {
    const r = await kino.visualBrowser.open({
      url: BASE_AON + '/genero/ver-anime/',
      title: 'AnimeOnline',
      collect: { cookies: ['cf_clearance', '__cf_bm'], html: true },
      userAgent: 'browser',
      timeoutMs: 120000
    });
    const st = (r && r.status) || 'sin-respuesta';
    const g = {};
    const crudas = r && r.cookies;
    if (typeof crudas === 'string' && crudas) {
      crudas.split(';').forEach(function (p) {
        const i = p.indexOf('=');
        if (i > 0) g[p.slice(0, i).trim()] = p.slice(i + 1).trim();
      });
    } else if (Array.isArray(crudas)) {
      crudas.forEach(function (c) {
        if (c && c.name && c.value !== undefined) g[String(c.name)] = String(c.value);
      });
    } else if (crudas && typeof crudas === 'object') {
      for (const k in crudas) g[k] = String(crudas[k]);
    }
    const nombres = Object.keys(g);
    const nHtml = (r && typeof r.html === 'string' && r.html.length) || 0;
    log('ventanita aon: ' + st + ', galletas ' + (nombres.length ? nombres.join(',') : 'ninguna') + ', html ' + nHtml + ' chars');
    if (st !== 'done') return { st: st };
    let rescate = 0;
    if (nombres.length) {
      aonJsonSet('aonCookies', g);
      if (r.userAgent) aonJsonSet('aonUA', r.userAgent);
    }
    if (nHtml > 500) {
      const items = aonTarjetas(r.html).slice(0, 20);
      if (items.length) {
        aonJsonSet('aonRescate', { ts: Date.now(), items: items });
        rescate = items.length;
      }
    }
    return { st: 'done', rescate: rescate };
  } catch (e) {
    log('ventanita aon falló', (e && e.message) || String(e));
    return { st: 'error' };
  }
}

/* Dooplay: las fichas pueden salir como /online/<slug>/ o como
 * /temporada/<slug>-temporada-N/; ambas se normalizan al slug base. */
function aonTarjetas(html) {
  /* v0.6.1: las tarjetas del directorio enlazan a /anime/<slug>/ (además
   * de las fichas /online/ y /temporada/ de siempre). */
  const re = /<a\b[^>]*href\s*=\s*["'][^"']*\/(?:online|temporada|anime)\/([^"\/?#]+)[^>]*>([\s\S]{0,900}?)<\/a>/gi;
  const items = [];
  const vistos = new Set();
  let m;
  while ((m = re.exec(String(html || ''))) && items.length < 40) {
    let slug = m[1];
    slug = slug.replace(/-temporada-\d+$/i, '');
    if (!slug || vistos.has(slug)) continue;
    vistos.add(slug);
    const ventana = m[2];
    let titulo = '';
    const al = /alt\s*=\s*["']([^"']{2,})["']/i.exec(ventana);
    const tt = /(?:oldtitle|title)\s*=\s*["']([^"']{2,})["']/i.exec(ventana);
    if (tt) titulo = decHtml(tt[1]);
    else if (al) titulo = decHtml(al[1]);
    if (!titulo) {
      const h = /<h[1-6][^>]*>([\s\S]{1,200}?)<\/h[1-6]>/i.exec(ventana);
      if (h) titulo = limpio(h[1]);
    }
    if (!titulo || titulo.length < 2) titulo = slugATitulo(slug);
    const item = {
      id: 'aon-' + slug,
      ref: 'aon:' + slug,
      title: titulo.slice(0, 200),
      kind: 'series'
    };
    const im = /(?:src|data-litespeed-src|data-src)\s*=\s*["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i.exec(ventana);
    if (im) item.poster = im[1].indexOf('//') === 0 ? 'https:' + im[1] : im[1];
    items.push(item);
  }
  return items;
}

async function aonPaginaDeSerie(slug) {
  /* La ficha de la temporada 1 manda; si no existe, la página /online/ y
   * por último la ficha /anime/ (v0.6.1: las tarjetas del directorio
   * enlazan ahí). v0.6.2: todas con galleta de acceso y revisión
   * honesta. */
  const t = await aonTraer('/temporada/' + slug + '-temporada-1/', 10000);
  if (t.ok && t.text) return t;
  const o = await aonTraer('/online/' + slug + '/', 10000);
  if (o.ok && o.text) return o;
  const a = await aonTraer('/anime/' + slug + '/', 10000);
  if (a.revision) throw aonErrorRevision();
  return a;
}

registrarFuente({
  id: 'aon',
  etiqueta: 'AnimeOnline',

  async buscar(q) {
    const texto = String(q || '').trim().slice(0, 100);
    if (texto.length < 2) return [];
    try {
      /* Dooplay busca en /?s=<q>; las fichas salen con sus enlaces de siempre. */
      const r = await aonTraer('/?s=' + encodeURIComponent(texto), 10000);
      if (!r.ok) return [];
      const items = aonTarjetas(r.text).slice(0, 25);
      for (const it of items) it.badges = ['AnimeOnline'];
      return items;
    } catch (e) {
      log('aon buscar', (e && e.message) || String(e));
      return [];
    }
  },

  async portada() {
    let items = [];
    let pideRevision = false;
    try {
      const r = await aonTraer('/genero/ver-anime/', 10000);
      if (r.revision) pideRevision = true;
      else if (r.ok) items = aonTarjetas(r.text).slice(0, 20);
    } catch (e) {
      log('aon fila', (e && e.message) || e);
    }
    /* v0.6.1: si el directorio no trajo nada, la home del tema Dooplay
     * también trae tarjetas de series. */
    if (!items.length && !pideRevision) {
      try {
        const r2 = await aonTraer('/', 10000);
        if (r2.revision) pideRevision = true;
        else if (r2.ok) items = aonTarjetas(r2.text).slice(0, 20);
      } catch (e) {
        log('aon fila home', (e && e.message) || e);
      }
    }
    /* v0.6.2: si Cloudflare pidió su revisión, se dice la verdad: la
     * ventanita de la pantalla la pasa y el catálogo queda abierto. Si
     * la persona ya la pasó y el catálogo rescatado vive aún, se usa:
     * la galleta viaja con las peticiones pero a veces el filtro tarda
     * en soltar la mano. */
    if (pideRevision) {
      const rescate = aonRescatados();
      if (rescate.length) return [{ id: 'aon-anime', title: 'Anime · AnimeOnline', ref: 'aon-anime', items: rescate }];
      throw aonErrorRevision();
    }
    if (!items.length) items = aonRescatados();
    if (items.length) return [{ id: 'aon-anime', title: 'Anime · AnimeOnline', ref: 'aon-anime', items: items }];
    return [];
  },

  async hoja(ref) {
    if (ref !== 'aon-anime') return null;
    const r = await aonTraer('/genero/ver-anime/', 12000);
    if (r.revision) {
      throw aonErrorRevision();
    }
    if (!r.ok) {
      throw kino.error('unavailable', 'AnimeOnline no respondió (status ' + r.status + ')', {
        userMessage: 'AnimeOnline no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    const items = aonTarjetas(r.text).slice(0, 60);
    return { items: items, next: null };
  },

  async detalle(slug) {
    const r = await aonPaginaDeSerie(slug);
    if (!r.ok || !r.text) return null;
    const serie = { title: slugATitulo(slug) };
    const h = /<h1[^>]*>([\s\S]{1,300}?)<\/h1>/i.exec(r.text);
    if (h) serie.title = limpio(h[1]) || serie.title;
    const og = /property=["']og:image["'][^>]*content=["']([^"']+)["']/i.exec(r.text);
    if (og) serie.poster = og[1].indexOf('//') === 0 ? 'https:' + og[1] : og[1];
    const sinM = /<p[^>]*>([\s\S]{30,600}?)<\/p>/i.exec(r.text);
    if (sinM) serie.overview = limpio(sinM[1]).slice(0, 400);
    return serie;
  },

  async episodios(slug) {
    const r = await aonPaginaDeSerie(slug);
    if (!r.ok || !r.text) {
      throw kino.error('unavailable', 'AnimeOnline no entregó la serie', {
        userMessage: 'AnimeOnline no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    /* Los episodios de Dooplay: anclas /episodio/<epslug>/ con el número en
     * la propia dirección (…-cap-9) o en la fila de la tabla. */
    const re = /href\s*=\s*["'][^"']*\/episodio\/([^"\/?#]+)/gi;
    const vistos = new Set();
    const lista = [];
    let m;
    let pos = 0;
    while ((m = re.exec(r.text))) {
      const epslug = m[1];
      if (vistos.has(epslug)) continue;
      vistos.add(epslug);
      pos++;
      const nm = /-(?:cap-?|episodio-?|ep-?)(\d+)$/i.exec(epslug);
      const n = nm ? parseInt(nm[1], 10) : pos;
      if (n < 1 || n > 9999) continue;
      lista.push({ season: 1, number: n, ref: 'aon:' + epslug + ':' + n, title: 'Episodio ' + n });
    }
    if (!lista.length) {
      throw kino.error('not_found', 'AnimeOnline: 0 capítulos', {
        userMessage: 'No se pudieron leer los capítulos de esta serie en AnimeOnline.'
      });
    }
    lista.sort((a, b) => a.number - b.number);
    return { series: { title: slugATitulo(slug) }, episodes: lista };
  },

  async resolver(epslug, n, idx) {
    const epUrl = BASE_AON + '/episodio/' + epslug + '/';
    const r = await aonTraer('/episodio/' + epslug + '/', 10000);
    if (r.revision) {
      throw aonErrorRevision();
    }
    if (!r.ok || !r.text) {
      throw kino.error('not_found', 'AnimeOnline no entregó el episodio', {
        userMessage: 'No se pudo abrir este episodio en AnimeOnline.'
      });
    }
    /* Su único streaming es el multiserver (saidochesto.top): la captura
     * del navegador oculto es la red de seguridad de siempre. */
    const servers = servidoresDePagina(r.text);
    return await probarConCaptura(epUrl, servers, idx, function (i) {
      return 'aon:' + epslug + ':' + (n || 1) + ':' + i;
    }, 'AnimeOnline');
  }
});

/* ---------- fuente: IvAnime (ivanime.buzz, espejo de ivanime.top) ---------- */

const BASE_IVA = 'https://ivanime.buzz';

function ivaTarjetas(html) {
  const re = /<a\b[^>]*href\s*=\s*["'][^"']*\/anime\/([^"\/?#]+)[^>]*>([\s\S]{0,900}?)<\/a>/gi;
  const items = [];
  const vistos = new Set();
  let m;
  while ((m = re.exec(String(html || ''))) && items.length < 40) {
    const slug = m[1];
    if (!slug || vistos.has(slug)) continue;
    vistos.add(slug);
    const ventana = m[2];
    let titulo = '';
    const al = /alt\s*=\s*["']([^"']{2,})["']/i.exec(ventana);
    const tt = /title\s*=\s*["']([^"']{2,})["']/i.exec(ventana);
    if (tt) titulo = decHtml(tt[1]);
    else if (al) titulo = decHtml(al[1]);
    if (!titulo) {
      const h = /<h[1-6][^>]*>([\s\S]{1,200}?)<\/h[1-6]>/i.exec(ventana);
      if (h) titulo = limpio(h[1]);
    }
    if (!titulo || titulo.length < 2) titulo = slugATitulo(slug);
    const item = {
      id: 'iva-' + slug,
      ref: 'iva:' + slug,
      title: titulo.slice(0, 200),
      kind: 'series'
    };
    const im = /(?:src|data-src)\s*=\s*["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i.exec(ventana);
    if (im) item.poster = im[1].indexOf('//') === 0 ? 'https:' + im[1] : im[1];
    items.push(item);
  }
  return items;
}

registrarFuente({
  id: 'iva',
  etiqueta: 'IvAnime',

  async buscar(q) {
    const texto = String(q || '').trim().slice(0, 100);
    if (texto.length < 2) return [];
    try {
      /* Se prueba el ?s= de siempre; si el sitio lo ignora, se filtra el
       * Inicio por título como plan B honesto. */
      const r = await traer(BASE_IVA + '/?s=' + encodeURIComponent(texto), { headers: { Referer: BASE_IVA + '/' }, timeoutMs: 10000 });
      if (r.ok) {
        /* v0.6.1: las anclas de IvAnime también casan con el patrón de
         * AnimeYT (ambos son /anime/<slug>/); esas tarjetas son de aquí:
         * se reetiquetan para no mandarlas al resolver equivocado. */
        const brutos = aytTarjetas(r.text).concat(ivaTarjetas(r.text)).slice(0, 40);
        const items = [];
        const vistos = new Set();
        for (const it of brutos) {
          const ref = 'iva:' + String(it.ref || '').slice(3);
          if (!ref || vistos.has(ref)) continue;
          vistos.add(ref);
          it.ref = ref;
          if (String(it.id || '').indexOf('ayt-') === 0) it.id = 'iva-' + String(it.id).slice(4);
          if (!titulosParecen(texto, it.title)) continue;
          items.push(it);
        }
        for (const it of items) it.badges = ['IvAnime'];
        if (items.length) return items.slice(0, 25);
      }
    } catch (e) {
      log('iva buscar', (e && e.message) || String(e));
    }
    try {
      const r2 = await traer(BASE_IVA + '/', { headers: { Referer: BASE_IVA + '/' }, timeoutMs: 10000 });
      const items = ivaTarjetas(r2.text).filter((it) => titulosParecen(texto, it.title));
      for (const it of items) it.badges = ['IvAnime'];
      return items.slice(0, 25);
    } catch (e2) {
      return [];
    }
  },

  async portada() {
    try {
      const r = await traer(BASE_IVA + '/', { headers: { Referer: BASE_IVA + '/' }, timeoutMs: 10000 });
      const items = ivaTarjetas(r.text).slice(0, 20);
      if (items.length) return [{ id: 'iva-emision', title: 'En emisión · IvAnime', ref: 'iva-emision', items: items }];
    } catch (e) {
      log('iva fila', (e && e.message) || e);
    }
    return [];
  },

  async hoja(ref) {
    if (ref !== 'iva-emision') return null;
    const r = await traer(BASE_IVA + '/', { headers: { Referer: BASE_IVA + '/' }, timeoutMs: 12000 });
    if (!r.ok) {
      throw kino.error('unavailable', 'IvAnime no respondió (status ' + r.status + ')', {
        userMessage: 'IvAnime no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    const items = ivaTarjetas(r.text).slice(0, 60);
    return { items: items, next: null };
  },

  async detalle(slug) {
    const r = await traer(BASE_IVA + '/anime/' + slug + '/', { headers: { Referer: BASE_IVA + '/' }, timeoutMs: 10000 });
    if (!r.ok || !r.text) return null;
    const serie = { title: slugATitulo(slug) };
    const h = /<h1[^>]*>([\s\S]{1,300}?)<\/h1>/i.exec(r.text);
    if (h) serie.title = limpio(h[1]) || serie.title;
    const og = /property=["']og:image["'][^>]*content=["']([^"']+)["']/i.exec(r.text);
    if (og) serie.poster = og[1].indexOf('//') === 0 ? 'https:' + og[1] : og[1];
    const sinM = /<p[^>]*>([\s\S]{30,600}?)<\/p>/i.exec(r.text);
    if (sinM) serie.overview = limpio(sinM[1]).slice(0, 400);
    return serie;
  },

  async episodios(slug) {
    const r = await traer(BASE_IVA + '/anime/' + slug + '/', { headers: { Referer: BASE_IVA + '/' }, timeoutMs: 10000 });
    if (!r.ok || !r.text) {
      throw kino.error('unavailable', 'IvAnime no entregó la serie', {
        userMessage: 'IvAnime no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    /* La ficha lista sus capítulos como anclas /ver/<slug>-<n>/. */
    const re = new RegExp('href\\s*=\\s*["\'][^"\']*\\/ver\\/' + slug + '-(\\d+)', 'gi');
    const numeros = new Set();
    let m;
    while ((m = re.exec(r.text))) numeros.add(parseInt(m[1], 10));
    if (!numeros.size) {
      throw kino.error('not_found', 'IvAnime: 0 capítulos', {
        userMessage: 'No se pudieron leer los capítulos de esta serie en IvAnime.'
      });
    }
    const lista = [];
    for (const n of numeros) {
      if (n < 1 || n > 9999) continue;
      lista.push({ season: 1, number: n, ref: 'iva:' + slug + ':' + n, title: 'Episodio ' + n });
    }
    lista.sort((a, b) => a.number - b.number);
    return { series: { title: slugATitulo(slug) }, episodes: lista };
  },

  async resolver(slug, n, idx) {
    const num = n || 1;
    const epUrl = BASE_IVA + '/ver/' + slug + '-' + num + '/';
    const r = await traer(epUrl, { headers: { Referer: BASE_IVA + '/' }, timeoutMs: 10000 });
    if (!r.ok || !r.text) {
      throw kino.error('not_found', 'IvAnime no entregó el episodio', {
        userMessage: 'No se pudo abrir este episodio en IvAnime.'
      });
    }
    const servers = servidoresDePagina(r.text);
    /* v0.6.1: mismo criterio que OtakusTV: sin guard, la captura del
     * navegador oculto queda como red de seguridad. */
    return await probarConCaptura(epUrl, servers, idx, function (i) {
      return 'iva:' + slug + ':' + num + ':' + i;
    }, 'IvAnime');
  }
});

/* ---------- exportaciones de Kino (el abanico del agregador) ---------- */

function partirRef(ref) {
  const r = String(ref || '');
  const corte = r.indexOf(':');
  if (corte < 2) return null;
  const fuente = r.slice(0, corte);
  const resto = r.slice(corte + 1);
  return { fuente: fuente, partes: resto.split(':') };
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
      userMessage: 'Ninguna fuente de anime respondió la búsqueda.'
    });
  }
  return salida.slice(0, MAX_ITEMS);
}

async function home() {
  const fuentes = Object.values(FUENTES);
  const errores = [];
  const rtas = await Promise.all(fuentes.map(async (f) => {
    try {
      return await f.portada();
    } catch (e) {
      log('portada falló en ' + f.id, (e && e.message) || String(e));
      errores.push(e);
      return null;
    }
  }));
  const filas = [];
  for (let i = 0; i < fuentes.length; i++) {
    if (rtas[i]) for (const fila of rtas[i]) filas.push(fila);
  }
  if (!filas.length && errores.length) {
    const e = errores[0];
    if (e && e.userMessage) throw e;
    throw kino.error('unavailable', 'ninguna fuente armó portada', {
      userMessage: 'Ninguna fuente respondió. Revisa tu conexión o inténtalo en un rato.'
    });
  }
  return filas;
}

async function browse(ref, cursor) {
  for (const f of Object.values(FUENTES)) {
    const hoja = await f.hoja(ref, cursor);
    if (hoja) return hoja;
  }
  throw kino.error('not_found', 'esa fila ya no existe');
}

async function episodes(ref) {
  const p = partirRef(ref);
  if (!p || !FUENTES[p.fuente] || !p.partes[0]) {
    throw kino.error('not_found', 'ref desconocida', {
      userMessage: 'Ese título ya no es válido. Búscalo de nuevo.'
    });
  }
  return FUENTES[p.fuente].episodios(p.partes[0]);
}

async function details(ref) {
  const p = partirRef(ref);
  if (!p || !FUENTES[p.fuente] || !p.partes[0]) return null;
  try {
    return await FUENTES[p.fuente].detalle(p.partes[0]);
  } catch (e) {
    log('detalle falló', (e && e.message) || String(e));
    return null;
  }
}

async function resolve(ref, options) {
  RESOLVE_T0 = Date.now();
  CAP_OFF = false;
  const p = partirRef(ref);
  if (!p || !FUENTES[p.fuente] || !p.partes[0]) {
    throw kino.error('not_found', 'ref inválida', {
      userMessage: 'Ese título ya no es válido. Búscalo de nuevo.'
    });
  }
  const f = FUENTES[p.fuente];
  const n = p.partes[1] !== undefined ? parseInt(p.partes[1], 10) : 1;
  const idx = p.partes[2] !== undefined ? parseInt(p.partes[2], 10) : null;
  return f.resolver(p.partes[0], Number.isFinite(n) && n >= 1 ? n : 1, Number.isFinite(idx) && idx >= 0 ? idx : null);
}

/* ---------- la pantalla propia (el Inicio de verdad, estilo MangaTrack) ---------- */

const CLAVE_FUENTE_PANTALLA = 'ajFuente';
const FUENTES_PANTALLA = [
  { id: 'todas', nombre: 'Todas las fuentes' },
  { id: 'av1', nombre: 'AnimeAV1' },
  { id: 'mc', nombre: 'MonosChinos' },
  { id: 'lat', nombre: 'LataAnime' },
  { id: 'otv', nombre: 'OtakusTV' },
  { id: 'ayt', nombre: 'AnimeYT' },
  { id: 'eas', nombre: 'EstrenosAnime' },
  { id: 'aon', nombre: 'AnimeOnline' },
  { id: 'iva', nombre: 'IvAnime' }
];

function fuenteValida(id) {
  const s = String(id || '');
  for (const x of FUENTES_PANTALLA) if (x.id === s) return s;
  return '';
}

function fuenteDePantalla(state) {
  const s = state && typeof state.fuente === 'string' ? fuenteValida(state.fuente) : '';
  if (s) return s;
  try {
    const g = kino.storage.get(CLAVE_FUENTE_PANTALLA);
    const v = g ? fuenteValida(String(g)) : '';
    if (v) return v;
  } catch (e) {}
  return 'todas';
}

function compactarItem(it) {
  const o = {
    id: String(it.id || it.ref),
    ref: String(it.ref || ''),
    title: String(it.title || '').slice(0, 200),
    kind: it.kind === 'movie' ? 'movie' : 'series'
  };
  if (it.poster) o.poster = it.poster;
  if (it.backdrop) o.backdrop = it.backdrop;
  if (it.year) o.year = it.year;
  if (Array.isArray(it.badges) && it.badges.length) o.badges = it.badges.slice(0, 2);
  if (it.adult === true) o.adult = true;
  return o;
}

async function heroDeAv1() {
  try {
    const datos = await datosDe('/__data.json');
    const feat = datos && Array.isArray(datos.featured) ? datos.featured : [];
    if (!feat.length) return null;
    const dia = Math.floor(Date.now() / 86400000);
    for (let i = 0; i < feat.length; i++) {
      const m = feat[(dia + i) % feat.length];
      if (m && m.slug && m.title && m.id != null) {
        return {
          ref: 'av1:' + m.slug,
          title: limpio(m.title).slice(0, 120),
          texto: m.synopsis ? limpio(m.synopsis).slice(0, 220) : 'Anime destacado de hoy en AnimeAV1.',
          imagen: backdropDe(m.id)
        };
      }
    }
  } catch (e) {
    log('el destacado falló', (e && e.message) || String(e));
  }
  return null;
}

function sinSufijoFuente(titulo, etiqueta) {
  const cola = ' · ' + etiqueta;
  if (titulo && titulo.length > cola.length && titulo.slice(titulo.length - cola.length) === cola) {
    return titulo.slice(0, titulo.length - cola.length);
  }
  return titulo;
}

/* v0.5.0 — en «Todas» cada fuente ocupa su sección: el encabezado nombra
   a la fuente (y se toca para verla sola) y el sufijo «· Fuente» se
   retira de los títulos (el nombre ya vive en el encabezado). AnimeAV1
   aporta su núcleo de cuatro filas; sus otras filas (Películas, Acción,
   Fantasía) se ven al tocar su nombre, en su propia sección. */
/* v0.6.0 — la cosecha: cinco fuentes nuevas (OtakusTV, AnimeYT,
   EstrenosAnime, AnimeOnline, IvAnime). En «Todas», cada fuente nueva
   aporta su núcleo (una o dos filas) y el resto vive en su sección
   propia, al tocar su nombre. Los multiservers propios (los «Multiserver»
   opacos que cargan por JavaScript) se abren con la captura del navegador
   oculto; la honestidad manda: sin reproductor legible, mensaje claro. */
const NUCLEO_TODAS = {
  av1: ['av1-row-eps', 'av1-latest', 'av1-populares', 'av1-score'],
  otv: ['otv-emision', 'otv-eps'],
  ayt: ['ayt-latest'],
  eas: ['eas-eps', 'eas-sub'],
  aon: ['aon-anime'],
  iva: ['iva-emision']
};

async function cargarPantalla(fuente) {
  let filas = [];
  if (fuente === 'todas') {
    const fuentes = Object.values(FUENTES);
    const rtas = await Promise.all(fuentes.map(async (f) => {
      try {
        return await f.portada();
      } catch (e) {
        log('portada de ' + f.id + ' falló', (e && e.message) || String(e));
        return null;
      }
    }));
    for (let i = 0; i < fuentes.length; i++) {
      if (!rtas[i]) continue;
      const f = fuentes[i];
      for (const fila of rtas[i]) {
        const nucleo = NUCLEO_TODAS[f.id];
        if (nucleo && nucleo.indexOf(fila.id) < 0) continue;
        filas.push({
          id: fila.id,
          title: sinSufijoFuente(fila.title, f.etiqueta),
          ref: fila.ref || null,
          fuente: f.id,
          items: fila.items || []
        });
      }
    }
    if (!filas.length) {
      throw kino.error('unavailable', 'ninguna fuente armó la portada', {
        userMessage: 'Ninguna fuente respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
  } else {
    const f = FUENTES[fuente];
    if (!f) return { filas: [], hero: null };
    filas = await f.portada();
    if (!Array.isArray(filas) || !filas.length) return { filas: [], hero: null };
    for (const fila of filas) {
      fila.title = sinSufijoFuente(fila.title, f.etiqueta);
      fila.fuente = f.id;
    }
  }
  const hero = fuente === 'todas' || fuente === 'av1' ? await heroDeAv1() : null;
  const fuera = [];
  for (const fila of filas) {
    const items = (fila.items || []).slice(0, 12).map(compactarItem);
    if (!items.length) continue;
    fuera.push({ id: fila.id, title: fila.title, ref: fila.ref || null, fuente: fila.fuente || '', items: items });
  }
  return { filas: fuera, hero: hero };
}

function esqueletoRiel() {
  const tarjetas = [];
  for (let i = 0; i < 4; i++) tarjetas.push({ type: 'Skeleton', shape: 'card', width: 96, height: 160 });
  return {
    type: 'Column', gap: 12, children: [
      { type: 'Skeleton', shape: 'line', width: 160, height: 24 },
      { type: 'Row', gap: 12, children: tarjetas }
    ]
  };
}

async function screen(arg) {
  const a = arg || {};
  const state = a.state && typeof a.state === 'object' ? a.state : {};
  const filas = Array.isArray(state.filas) ? state.filas : null;
  const hero = state.hero && state.hero.ref ? state.hero : null;
  const cuerpo = [];
  /* v0.6.2: botón de la ventanita de AnimeOnline (pasar la revisión de
   * Cloudflare con las manos de la persona; solo tras su toque). */
  const botonRevision = { type: 'ElevatedButton', labelText: 'Pasar la revisión de AnimeOnline', onPressed: 'revisionAon', alignSelf: 'center' };
  if (state.errorPantalla === true) {
    if (state.pideRevision === true) {
      cuerpo.push({ type: 'errorState', title: 'AnimeOnline pide su revisión', text: 'Su filtro de seguridad (Cloudflare) cerró la puerta a AniJing. Toca «Pasar la revisión»: se abre una ventanita, se pasa con un toque y el catálogo queda abierto.' });
      cuerpo.push(botonRevision);
    } else {
      cuerpo.push({ type: 'errorState', title: 'No se pudo cargar', text: 'Ninguna fuente respondió. Revisa tu conexión y vuelve a probar.' });
      cuerpo.push({ type: 'Button', labelText: 'Reintentar', onPressed: 'recargar', alignSelf: 'center' });
    }
  } else if (filas && !filas.length) {
    if (state.fuente === 'aon') {
      cuerpo.push({ type: 'emptyState', title: 'AnimeOnline no trajo nada', text: 'A veces es su filtro de seguridad. Toca «Pasar la revisión» para abrirlo con una ventanita; si sigue vacío, vuelve más tarde.', icon: 'movie' });
      cuerpo.push(botonRevision);
    } else {
      cuerpo.push({ type: 'emptyState', title: 'Nada por ahora', text: 'Esta fuente no trajo nada en este momento. Prueba con otra o vuelve más tarde.', icon: 'movie' });
    }
    cuerpo.push({ type: 'Button', labelText: 'Reintentar', onPressed: 'recargar', alignSelf: 'center' });
  } else if (!filas) {
    cuerpo.push({ type: 'Skeleton', shape: 'block', height: 240 });
    cuerpo.push(esqueletoRiel());
    cuerpo.push(esqueletoRiel());
    cuerpo.push(esqueletoRiel());
  } else {
    if (hero) {
      const heroNodo = { type: 'heroCard', title: hero.title, text: hero.texto };
      if (hero.imagen) heroNodo.image = hero.imagen;
      heroNodo.buttons = [{ type: 'ElevatedButton', labelText: 'Ver la serie', onPressed: { go: { title: { ref: hero.ref, kind: 'series' } } } }];
      cuerpo.push(heroNodo);
    }
    const rielDe = function (fila) {
      const riel = { type: 'titleRail', title: fila.title, items: fila.items };
      if (fila.ref) riel.ref = fila.ref;
      return riel;
    };
    if (state.fuente === 'todas') {
      /* v0.5.0 — «Todas» se lee por secciones: un encabezado por fuente
         (tocarlo pasa a esa fuente) y debajo sus rieles; cada bloque con
         su aire para que el scroll se lea por partes, no amontonado. */
      const bloques = [];
      const vistos = {};
      for (const fila of filas) {
        const fid = fila.fuente || 'av1';
        if (!vistos[fid]) {
          vistos[fid] = true;
          bloques.push({ fuente: fid, rieles: [] });
        }
        for (let b = 0; b < bloques.length; b++) {
          if (bloques[b].fuente === fid) bloques[b].rieles.push(rielDe(fila));
        }
      }
      for (const b of bloques) {
        const f = FUENTES[b.fuente];
        const hijos = [{
          type: 'Text',
          text: f ? f.etiqueta : b.fuente,
          style: 'h3',
          tooltip: 'Ver solo esta fuente',
          tooltipEn: 'Show this source only',
          onTap: { event: 'fuente', arg: b.fuente }
        }];
        for (const riel of b.rieles) hijos.push(riel);
        cuerpo.push({ type: 'Column', gap: 12, children: hijos });
      }
    } else {
      for (const fila of filas) cuerpo.push(rielDe(fila));
    }
  }
  return {
    type: 'Scaffold',
    appBar: {
      type: 'AppBar', dense: true, divider: false, mergeWithKinoBar: true,
      leading: { type: 'IconButton', icon: 'arrow_back', labelText: 'Cerrar', onPressed: { go: { close: true } } },
      title: 'AniJing',
      actions: [
        { type: 'IconButton', icon: 'search', labelText: 'Buscar', onPressed: { go: { search: { q: '' } } } },
        { type: 'IconButton', icon: 'tune', labelText: 'Elegir fuente', onPressed: 'fuentes' }
      ]
    },
    body: {
      type: 'SingleChildScrollView',
      children: [{
        type: 'Column',
        gap: 16,
        padding: { compact: 12, medium: 16, expanded: 24 },
        children: cuerpo
      }]
    }
  };
}

async function screenEvent(e) {
  const ev = e || {};
  const state = ev.state && typeof ev.state === 'object' ? ev.state : {};
  const nombre = String(ev.name || '');
  if (nombre === 'open' || nombre === 'recargar') {
    const fuente = fuenteDePantalla(state);
    try {
      const datos = await cargarPantalla(fuente);
      return { state: { fuente: fuente, filas: datos.filas, hero: datos.hero, errorPantalla: false } };
    } catch (err) {
      log('cargar la pantalla falló', (err && err.message) || String(err));
      /* v0.6.2: si lo que falló es la revisión de AnimeOnline, la pantalla
       * muestra el botón de la ventanita. */
      const pide = err && /revisi[oó]n de seguridad/i.test(String(err.userMessage || err.message || ''));
      return { state: { fuente: fuente, errorPantalla: true, pideRevision: pide } };
    }
  }
  /* v0.6.2 — «Pasar la revisión» (AnimeOnline): la ventanita de navegador
   * que la persona ve y maneja; solo tras su toque, requisito de Kino.
   * Al cerrar, la pantalla se recarga con la galleta ya en el bolsillo
   * y el catálogo rescatado de la página cargada. */
  if (nombre === 'revisionAon') {
    const rta = await aonPasarRevision();
    if (rta.st === 'sin-ventanita') {
      return { toast: 'Este Kino no tiene la ventanita de revisión. Actualiza Kino o vuelve más tarde.' };
    }
    if (rta.st === 'error') {
      return { toast: 'La ventanita no pudo abrirse. Vuelve a intentarlo.' };
    }
    try {
      const datos = await cargarPantalla('aon');
      return { state: { fuente: 'aon', filas: datos.filas, hero: datos.hero, errorPantalla: false }, toast: 'Revisión pasada: AnimeOnline abierto' };
    } catch (err) {
      log('recargar aon tras la revisión falló', (err && err.message) || String(err));
      return { state: { fuente: 'aon', errorPantalla: true }, toast: 'La revisión quedó pasada pero AnimeOnline no cargó. Reintenta.' };
    }
  }
  if (nombre === 'fuentes') {
    const fuente = fuenteDePantalla(state);
    const items = FUENTES_PANTALLA.map((x) => ({
      label: x.id === fuente ? '✓ ' + x.nombre : x.nombre,
      onTap: { event: 'fuente', arg: x.id }
    }));
    return { menu: { title: 'Elegir fuente', items: items } };
  }
  if (nombre === 'fuente') {
    const nueva = fuenteValida(ev.arg) || 'todas';
    try {
      kino.storage.set(CLAVE_FUENTE_PANTALLA, nueva);
    } catch (eS) {
      log('no se pudo guardar la fuente', (eS && eS.message) || String(eS));
    }
    try {
      const datos = await cargarPantalla(nueva);
      const rta = { state: { fuente: nueva, filas: datos.filas, hero: datos.hero, errorPantalla: false } };
      const nom = FUENTES_PANTALLA.filter((x) => x.id === nueva)[0];
      if (nom) rta.toast = nom.nombre;
      return rta;
    } catch (err) {
      log('cargar «' + nueva + '» falló', (err && err.message) || String(err));
      const pide = err && /revisi[oó]n de seguridad/i.test(String(err.userMessage || err.message || ''));
      return { state: { fuente: nueva, errorPantalla: true, pideRevision: pide } };
    }
  }
  return null;
}

export { search, home, browse, episodes, details, resolve, screen, screenEvent };
