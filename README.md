# AniJing

AniJing — el anime con la firma de Susejing. Plugin de anime puro para [Kino](https://kinotvapp.github.io/): catálogo, búsqueda, episodios y reproducción, todo en español.

Su nombre une «anime» con la terminación «jing» de su autor.

## Qué hace (v0.6.3 «El juicio de los embeds»)

**Pantalla propia de Inicio**: al abrir AniJing no verás la interfaz genérica, sino su propia portada estilo MangaTrack: una barrita única arriba (flechita para salir, lupa para buscar y el botón de fuentes), un anime destacado que rota por día con su fondo y botón directo a la serie, y los rieles de contenido con su «Ver más». El selector de fuentes cambia el contenido al toque y recuerda tu elección; mientras carga se ven esqueletos con la forma del contenido, y si una fuente no responde, un aviso honesto con su «Reintentar» (nunca una pantalla en blanco).

**Orden por secciones**: en «Todas», cada fuente ocupa su propia sección con un encabezado grande y sus rieles debajo — nada de filas revueltas: el scroll se lee por partes. Tocar el nombre de una fuente la muestra sola. Cada fuente aporta su núcleo a «Todas»; el resto de sus filas vive en su sección propia.

**Ocho fuentes**:

- **AnimeAV1** — catálogo con carátulas, fichas con sinopsis, géneros, año, nota y el id de MyAnimeList; en «Todas» aporta su núcleo (últimos episodios, últimos agregados, populares, mejor puntuados).
- **MonosChinos** — en emisión y animes completos, con sus películas y especiales.
- **LataAnime** — novedades y anime en latino y en castellano.
- **OtakusTV** — directorio de animes con pósters propios, en emisión y últimos episodios; sus opciones de reproducción (filemoon, byse, doodstream, lulustream, vidhide, uqload, mp4upload) salen de su select `#ssel` por `/play-video`, que responde la URL del embed de verdad.
- **AnimeYT** — catálogo con películas y buscador propio; sus players viven en el contenedor mytsumi.com, que entrega sus botones `data-player-url` cuando se le pide con `open=1` (ok.ru, Filemoon y hasta archivos directos).
- **EstrenosAnime** — últimos episodios, sub y latino; sin buscador de texto propio, se admite con honestidad (la búsqueda global sigue con las demás fuentes). Su multiserver se lee del iframe de `player-frame` y cada opción abre con `go_to_player('URL')`.
- **AnimeOnline** — género de anime y fichas de temporadas; es un sitio Dooplay: cada opción de `playeroptionsul` pregunta al endpoint `wp-json/dooplayer` y su multiserver (saidochesto.top) lista los hosters por idioma. Su puerta la guarda Cloudflare: si pide su revisión de seguridad, la pantalla de la fuente ofrece un botón «Pasar la revisión» que abre una ventanita de navegador real, la revisión se pasa con un toque y el catálogo queda abierto.
- **IvAnime** — en emisión; vive en el espejo .buzz (el .com es descargas), con Voe y MP4Upload cubiertos.

Todas las filas llevan su «Ver más».

**La búsqueda** consulta todas las fuentes a la vez y marca de dónde viene cada resultado; **los episodios** se leen de la fuente elegida. La pantalla usa el detalle, los episodios y los extractores del catálogo: tocar una tarjeta abre la serie, igual que siempre.

**Reproducción**: Zilla y enlaces directos de AnimeAV1, más extractores de servidores: Voe (con su baile de cifrado), MP4Upload, MixDrop, Uqload, YourUpload, StreamTape, UPNShare (API cifrada con AES), Doodstream, Ok.ru, Hexload, SaveFiles, StreamWish, Filemoon y WolfStream. Las cuatro fuentes nuevas ya entregan sus embeds de verdad sin esperar al navegador: cada una con su camino propio (el select de OtakusTV, el `open=1` de mytsumi, el `go_to_player` de EstrenosAnime y el endpoint Dooplay de AnimeOnline). La captura del navegador oculto queda de red de seguridad — con el Referer de cada fuente, descartando las URLs de anuncios y prefiriendo los manifiestos (m3u8/mpd); si lo pescado no es un manifiesto, una segunda pasada más larga recoge también las peticiones de la página. Al abrir un episodio se prueban los servidores en orden (el preferido primero) y el resto queda en el menú «Servidor»; si un servidor cambia su baile, ese falla con un mensaje honesto y quedan los demás.

**Ajustes del plugin**: idioma preferido (sub/dob, solo AnimeAV1) y servidor preferido.

Honesto: Mega y Netu quedan fuera (van cifrados o piden captcha). AnimoraTV bloquea hasta a los lectores externos y LocuraAnime es un sitio de descargas, así que ninguna entró. Si un episodio no trae ningún servidor reproducible, se muestra un aviso claro en lugar de un error seco.

## v0.6.3 «El juicio de los embeds»

La 0.6.2 dejó un solo gran problema: los catálogos y los pósters ya funcionaban, pero **los videos no reproducían** en ninguna de las cuatro fuentes nuevas. La captura del navegador oculto es inestable porque los players no arrancan solos — hay que tocar la opción. La cura no es esperar: es leer los embeds que el HTML crudo sí trae. **OtakusTV**: las opciones del select `#ssel` abren por `/play-video?id=`, que responde un JSON con el embed de verdad (el mismo atajo que usan los bots de descarga desde hace años). **EstrenosAnime**: su multiserver vive en el iframe de `player-frame` y cada opción abre con `go_to_player('URL')`. **AnimeOnline**: el patrón Dooplay — cada `li` de `playeroptionsul` (data-post, data-nume, data-type) pregunta al endpoint `wp-json/dooplayer`, cuyo embed puede ser un server directo o el multiserver saidochesto.top, que lista sus hosters por idioma. **AnimeYT**: el contenedor mytsumi.com solo entrega sus botones `data-player-url` si se le pide con `open=1` — por eso el sondeo anterior salía siempre vacío. Además: nuevo extractor WolfStream, los iframes perezosos (`data-src`) también se leen, la captura lleva el Referer de cada fuente, y los pósters de AnimeOnline usan la misma caza libre que arregló las demás fuentes.

## v0.6.2 «El juicio del anuncio»

La 0.6.1 volvió al teléfono y este juicio enseñó tres cosas. **OtakusTV**: la captura pescó el video del anuncio pre-roll («BONUS») en vez del capítulo — ahora la captura mira la URL antes de abrir la boca: descarta las redes de anuncios, prefiere los manifiestos HLS del capítulo y, si no hay manifiesto, una segunda pasada más larga con `captureAll` recoge también las peticiones de la página. **EstrenosAnime**: los pósters de «Últimos episodios» seguían grises porque las insignias SUB/EP alejan la imagen del enlace — la ventana hacia atrás crece a 1500 caracteres y, si el atributo de la imagen no se reconoce, se caza cualquier URL de imagen con extensión (srcset y compañía); AnimeYT recibe la misma ventana hacia atrás en sus tarjetas. **AnimeOnline**: su filtro de seguridad (Cloudflare) le cierra la puerta a la petición del plugin y eso se veía como un «Nada por ahora» falso — ahora se detecta la revisión y se dice la verdad, con un botón «Pasar la revisión» en la pantalla de la fuente: una ventanita de navegador real que la persona pasa una vez; la galleta de acceso y el disfraz del navegador que la ganó viajan desde entonces con cada petición, y el catálogo de la página cargada queda de respaldo mientras arranca.

## v0.6.1 «La compostura»

La 0.6.0 salió al teléfono y el teléfono mandó: cuatro reparaciones hechas con las capturas en la mano. **OtakusTV**: su página de episodio carga los reproductores con JavaScript (opciones sin URLs legibles), así que ya no hay guard que impida la captura — el navegador oculto abre el reproductor por defecto. **AnimeYT**: los pósters vienen en atributos de carga perezosa (ahora se leen) y sus reproductores se esconden tras un contenedor propio (mytsumi.com) que ahora se sondea para cosechar los servidores de adentro. **EstrenosAnime**: en sus listados la imagen va antes del enlace; ahora se mira también hacia atrás y las filas ya no quedan grises. **AnimeOnline**: las tarjetas del directorio enlazan a `/anime/<slug>/`, camino que ahora se acepta en ficha, episodios y portada (con respaldo en la home del sitio). IvAnime recibe el mismo ajuste del guard. Nada de promesas vacías: si un episodio no abre, cae a la captura y, si aún no, mensaje honesto.

## Instalación

En Kino: Ajustes → Plugins → «+» y escribe:

```
Susejing/AniJing
```

Esta versión pide los mismos dos permisos de siempre — abrir páginas web ocultas para encontrar el video y conectarse a cualquier servidor público para el stream — más uno nuevo y honesto: la **ventanita de revisión** de AnimeOnline, una ventana de navegador que solo se abre cuando tú tocas «Pasar la revisión», que ves y manejas tú (nunca sola ni escondida). La pantalla propia no pide ningún permiso nuevo, pero sí un Kino reciente (0.9.81 o mayor, el de la barrita única): con uno más viejo la app pedirá actualizarse antes de instalar esta versión.

## Licencia

GPL-3.0 © 2026 Susejing. Los algoritmos de decodificación (el baile de Voe, el packer p.a.c.k.e.r, el AES de UPNShare) son reimplementaciones propias de patrones públicos de la comunidad Kino; no se copió código de otros plugins.
