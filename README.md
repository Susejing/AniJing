# AniJing

AniJing — el anime con la firma de Susejing. Plugin de anime puro para [Kino](https://kinotvapp.github.io/): catálogo, búsqueda, episodios y reproducción, todo en español.

Su nombre une «anime» con la terminación «jing» de su autor.

ros.
- **IvAnime** — en emisión, directorio (paginado con `?p=N` — el catálogo completo, ya sin recorte), últimos agregados y los géneros Acción, Romance y Comedia; vive en el espejo .buzz (el .com es descargas), con Voe, MP4Upload, Dood, MixDrop, Lulu y más cubiertos. Sus capítulos viven en `/ver/<epslug>-episodio-N` con un epslug que no es el de la serie; la ficha solo enseña el «Ver ahora» del primero, así que el total se cuenta con búsqueda binaria sobre su 404 de verdad. Sus pósters de verdad viajan en `data-src` (el `src` es un anime.png de relleno) y los de los héroes de la home se hallan por su nombre: la portada lleva el slug de la serie (`…/portada/<slug>-…jpg`).
- **Az-Animex** — el tesoro de las nubes (az-animex.com): cada episodio es un `.mp4` suelto subido a mirrored.to, que lo replica a nubes de streaming que AniJing ya sabe abrir (Voe, StreamTape, StreamWish, LuluStream, Byse…). La cadena completa: ficha → multilinks → `files/<FID>/…mp4_links` (un enlace por episodio) → página `?hash=` → tabla de getlinks por nube → cada getlink esconde el href directo al embed → extractor de siempre. Los pasos que mirrored.to sirve con JavaScript (el multilink y la tabla del `?hash=`) se leen a través del espejo r.jina.ai, que renderiza el JS y devuelve la página en texto. Sus filas viven de los géneros (Acción, Comedia, Romance, Drama, Shounen, Seinen y Fantasía — WordPress puro que pagina `/page/N/` hasta 66 páginas) y de la búsqueda `?s=`, porque su directorio y su home son también JavaScript. dw-anime, el otro candidato, quedó descartado con honestidad: todo su catálogo son `.RAR` de MediaFire/Mega, no video reproducible.
- **BeatZ-Anime** — el almacén BD (beatz-anime.net, la descarga de OneFansub): catálogo de series BD 1080p **subtituladas** servido por la API JSON de su propio OpenList (`bz.beatz-anime.net/api/fs/list`), fichas con póster y sinopsis de la web (`/bd/<slug>.html`), episodios numerados desde el nombre de archivo (`[BeatZ-Anime] Serie - 01 [BDRip 1080p HEVC-10bits FLAC].mkv`) y reproducción por **descarga directa**: `/d/<ruta>/<archivo>` responde 206 con rangos de bytes, sin login ni captcha (sonda v78). Nada de nubes de terceros: el almacén es suyo.

Todas las filas llevan su «Ver más».

**La búsqueda** consulta todas las fuentes a la vez y marca de dónde viene cada resultado; **los episodios** se leen de la fuente elegida. La pantalla usa el detalle, los episodios y los extractores del catálogo: tocar una tarjeta abre la serie, igual que siempre.

**Reproducción**: Zilla y enlaces directos de AnimeAV1, más extractores de servidores: Voe (con su baile de cifrado), MP4Upload, MixDrop, Uqload, YourUpload, StreamTape, UPNShare (API cifrada con AES), Doodstream, Ok.ru, Hexload, SaveFiles, StreamWish, Filemoon y WolfStream. Las fuentes entregan sus embeds de verdad sin esperar al navegador: cada una con su camino propio (la lista `data-dwn` de OtakusTV, el `open=1` de mytsumi con la URL ya limpia, el AJAX y el descifre del multiserver de EstrenosAnime, los `playVideo('URL')` del streamhj de AnimeJara y el admin-ajax `doo_player_ajax` con su multiserver-pro descifrado de VerAnime). La captura del navegador oculto queda de red de seguridad — con el Referer de cada fuente, descartando las URLs de anuncios y prefiriendo los manifiestos (m3u8/mpd); si lo pescado no es un manifiesto, una segunda pasada más larga recoge también las peticiones de la página. Al abrir un episodio se prueban los servidores en orden (el preferido primero) y el resto queda en el menú «Servidor»; si un servidor cambia su baile, ese falla con un mensaje honesto y quedan los demás.

## Instalación

En Kino: Ajustes → Plugins → «+» y escribe:

```
Susejing/AniJing
```

Esta versión pide los mismos dos permisos de siempre — abrir páginas web ocultas para encontrar el video y conectarse a cualquier servidor público para el stream — más los hosts de la familia TeraBox y de FireLoad (para sus ventanillas y sus descargas), así que Kino pedirá re-aprobación una vez al actualizar. Las ventanillas de TeraBox y FireLoad son ventanas de navegador que solo se abren cuando tú tocas su botón en los ajustes del plugin, que ves y manejas tú (nunca solas ni escondidas); lo que tecles adentro jamás pasa por el plugin — Kino guarda la sesión sellada. La pantalla propia no pide ningún permiso nuevo, pero sí un Kino reciente (0.9.81 o mayor, el de la barrita única): con uno más viejo la app pedirá actualizarse antes de instalar esta versión.

## Licencia

GPL-3.0 © 2026 Susejing. Los algoritmos de decodificación (el baile de Voe, el packer p.a.c.k.e.r, el AES de UPNShare) son reimplementaciones propias de patrones públicos de la comunidad Kino; no se copió código de otros plugins.
