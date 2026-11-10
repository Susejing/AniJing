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
// v0.6.3 «El juicio de los embeds» — la 0.6.2 en el teléfono dejó un
// solo gran problema: LOS VIDEOS NO REPRODUCEN en ninguna de las
// cuatro fuentes nuevas (los catálogos y los pósters ya funcionan).
// La captura del navegador oculto es inestable porque los players no
// arrancan solos: hay que TOCAR la opción. La cura no es esperar, es
// leer los EMBEDS que el HTML crudo sí trae — cada fuente con su
// camino propio, aprendido de los addons que ya los resuelven:
// OtakusTV guarda sus opciones en el select #ssel y cada una abre por
// /play-video?id=<value>, que responde un JSON con la URL del embed
// de verdad (filemoon, byse, doodstream…). EstrenosAnime esconde su
// multiserver en el iframe de div.player-frame; adentro cada opción
// abre con go_to_player('URL'). AnimeOnline es Dooplay: cada opción
// de ul#playeroptionsul (data-post, data-nume, data-type) pregunta
// al endpoint wp-json/dooplayer, cuyo embed_url puede ser un server
// directo o el multiserver saidochesto.top, que a su vez lista sus
// hosters por idioma. AnimeYT esconde sus players tras el contenedor
// mytsumi.com, que solo entrega botones data-player-url si se le pide
// con open=1 — por eso el sondeo de antes salía siempre vacío. Nuevo
// extractor WolfStream (su archivo anda en un script de sources), el
// iframe perezoso (data-src) también se lee, y la captura del
// navegador queda de pura red de seguridad con el Referer de cada
// fuente. Nada de milagros: si una puerta cambia, el mensaje sigue
// siendo honesto.
//
// v0.6.4 «El juicio de los embeds, segunda vista» — la 0.6.3 llegó al
// teléfono y el veredicto fue claro: los catálogos y los pósters ya
// funcionan, pero los videos seguían sin abrir — las puertas copiadas
// de los addons de referencia ya no son las puertas de hoy. Esta vez
// el diagnóstico se hizo con sondas de cabeceras de navegador de
// verdad contra el HTML crudo de cada fuente, y cada fuente contó su
// propia historia. OtakusTV ya no trae el select #ssel: las opciones
// del capítulo viajan en data-dwn, una lista de pares [etiqueta,
// enlace] (byse, doodstream, voe, mixdrop, mp4upload) que se cosecha
// tal cual, convirtiendo el enlace pelado de mp4upload a su forma
// embed-. EstrenosAnime se reconstruyó tipo Aniwatch: el episodio ya
// no trae el multiserver en un iframe — sus servidores se piden por
// AJAX (episode/servers → episode/sources) y el multiserver nuevo
// (multiserver.sbs) entrega cada opción CIFRADA (U2FsdGVkX1…), pero
// la clave no la esconde: su propia página trae un endpoint
// (embed/api/decrypt-stream) que devuelve el enlace en claro a quien
// se lo pregunte por POST; el plugin le pregunta y listo, sin AES en
// el cliente. AnimeYT tenía el contenedor mytsumi bien identificado
// desde la 0.6.3, pero la URL se cazaba con el ampersand numérico
// sin decodificar (&#038;) y el contenedor la rechazaba: ahora la
// URL viaja limpia. AnimeOnline reproducía pero enseñaba tarjetas
// grises: los enlaces del menú de la plantilla cumplen el mismo
// patrón que las tarjetas de verdad y llegan antes en el HTML, así
// que ganaban el dedupe — ahora un ancla sin imagen cerca no es
// tarjeta, es menú. Y el anuncio de wingsmob ya no puede colarse
// por la captura de respaldo.
//
// v0.6.5 «La cosecha fina» — la 0.6.4 llegó al teléfono y el balance
// fue bueno: ya se reproduce en casi todo, pero quedaron tres
// detalles finos y una petición de cosecha. Los pósters grises de
// EstrenosAnime e IvAnime tenían dos culpables: rutas RELATIVAS
// (/uploads/anime/… sin protocolo, que Kino no dibuja) y atributos
// src de relleno (no_poster.jpg, anime.png) que el plugin tomaba por
// póster de verdad — ahora las rutas se cosen con la base de su
// fuente y los rellenos se descartan. Los pósters grises de
// AnimeOnline tenían otro dueño: la mitad de sus carátulas vive en
// image.tmdb.org, un host que el manifiesto no conocía (ya lo
// conoce). Y el «se queda cargando» de AnimeYT era el botón Omega:
// un .mp4 de archive.org que contesta 403 intermitente — los
// directos de mytsumi ahora van al fondo del reparto y los
// extractores de verdad (Ok.ru, Filemoon) se prueban primero. La
// cosecha: cada fuente estrenó rieles nuevos (Películas y
// Actualizados en EstrenosAnime, En emisión/Audio Latino/Películas
// en AnimeOnline, Emisión/Directorio/Últimos en IvAnime) y como el
// estado de la pantalla tiene un tope de 64 KB, con muchas filas
// cada riel muestra 8 tarjetas en vez de 12.
//
// v0.6.6 «El remiendo» — la 0.6.5 nunca llegó a cargar en el
// teléfono: Kino compila el plugin como módulo y un módulo no permite
// declarar dos veces el mismo nombre — el absolutizar de las
// utilidades y su gemelo nuevo junto a los conversores se pisaban y
// Hermes lo dijo sin rodeos: «invalid redefinition of global
// identifier in module code». El banco no lo cazó porque new
// Function no es un módulo y perdona lo que un módulo no perdona.
// La cura es una sola declaración, la de siempre, que une todos los
// casos: protocolo relativo, absoluta, barra inicial contra el origen
// de la base y relativa contra su directorio. Nada más cambia: la
// cosecha fina queda como estaba, ahora sí cosida.
//
// v0.6.7 «La segunda vista» — el teléfono probó la cosecha y dos
// fuentes volvieron a toser. AnimeYT no abría ni un video: el
// remiendo de la 0.6.5 mandó los directos al fondo, tras los
// extractores, y en el teléfono Ok.ru y Filemoon fallan LENTO
// (la captura interna de Filemoon se toma sus ~25 segundos), así
// que el tiempo del resolve se agotaba antes de llegar al directo
// y la pantalla se quedaba cargando para siempre. El directo
// vuelve al FRENTE, pero ya no a ciegas: antes de entregarlo se
// le pide un Range de 2 bytes y si su 403 intermitente aparece,
// cae en segundos y el reparto sigue con los extractores. Y sus
// películas por fin existen: las fichas /pelicula/ traen sus
// obras con póster y su página de reproducción es la propia
// /<id>/anime/<slug>/, sin «-capitulo-N», con el player a bordo.
// AnimeOnline estrenó secciones pero con tos: la fila
// «Películas» salía vacía (sus tarjetas enlazan fichas
// /pelicula/ que el patrón no conocía), el «No se pudo abrir
// este episodio» se cura cayendo a la ficha de película cuando
// la página /episodio/ no existe, y los pósters siguen grises en
// el teléfono aunque las sondas los vean sanos en ww4 — se dejó
// un rastro en el log con la URL exacta que el sitio entrega,
// para mirar lo mismo que ve el teléfono. Y los http:// se suben
// a https:// en absolutizar: una imagen en claro la app la pinta
// gris.
//
// v0.6.8 «La mudanza» — la 0.6.7 reprodujo en AnimeYT pero
// AnimeOnline se quedó mudo: ni catálogo vivo ni episodios. La
// culpa no era del plugin sino del sitio: AnimeOnline SE MUDÓ
// de ww3 a ww4 — ww3.animeonline.ninja sirve ahora la página de
// aterrizaje de otro sitio y a cada camino del viejo responde
// sin catálogo, mientras que el AnimeOnline de verdad vive en
// ww4 (la ventanita lo probaba: sus portadas cargaban allí en
// color, y el catálogo del teléfono era el rescate de la
// ventanita — lo vivo nunca llegó). BASE_AON se muda a ww4 (el
// manifiesto ya lo conocía desde la 0.6.5) y la galleta
// cf_clearance ganada en la ventanita es de ww4: ahora casa
// con la base y el catálogo, las fichas, los episodios y el
// dooplay vuelven a contestar. Los pósters de ww4 siguen en
// manos del Cloudflare del sitio (la app los pide sin galleta
// y él la cierra); el rastro del log queda por si hace falta.

// v0.6.9 «El cambiazo» — AnimeOnline se despide: el sitio mudó dos
// veces en dos semanas (ww3, ww4), su Cloudflare cerró la puerta al
// catálogo y a los episodios, y las portadas grises nunca se curaron —
// de nada sirve una fuente que no funciona. En su lugar entran dos
// veteranas: AnimeJara (la de siempre, animejara.com, puerta
// henaojara2.com) con sus tarjetas de póster hj, sus temporadas en
// pestañas (los episodios se sintetizan como /episode/<slug>-1x2/) y
// su multiserver streamhj.top que lista filemoon, uqload, vidhide,
// voe, lulustream, streamtape y mp4upload con idiomas (japonés,
// latino, castellano); y VerAnime (veranime.ninja), un Dooplay de
// manual con pósters de tmdb, episodios /ver/<slug>-episodio-N/ y su
// player por el endpoint wp-json/dooplayer/v2 con multiserver
// darkanimes.com. La ventanita de la revisión de Cloudflare se
// retira con AnimeOnline: ninguna fuente viva la pide hoy.

// v0.6.10 «El 404 mentiroso» — AnimeJara sirve sus páginas de episodio
// con estado HTTP 404 y el contenido completo adentro: el catálogo y
// las fichas cargaban, pero el resolve moría al abrir cualquier
// capítulo porque nadie mira el cuerpo cuando el estado miente. Ahora
// la página del episodio y los embeds de streamhj se leen con
// cuerpoSiempre y se validan por contenido (un 404 de verdad no trae
// «const enlaces» ni «streamhj»). VerAnime, que en el teléfono no
// aparecía, gana respaldo: si su género de catálogo viene vacío o no
// responde, se prueba la home del sitio, y cada paso queda en el log
// con estado y tamaño para que la próxima captura diga la verdad.

// v0.6.11 «La lista completa» — el menú de fuentes de Kino corta en 8
// entradas y no se desplaza: con diez fuentes, VerAnime e IvAnime
// quedaban debajo del corte, invisibles (el teléfono lo confirmó con
// captura). El selector se dibuja ahora en el propio lienzo: una fila
// por fuente, tan larga como haga falta, y el botón de arriba lo abre
// y lo cierra. El catálogo de AnimeJara gana paginación (?page=N,
// aprendida de sonda) y su hoja deja de tragarse los «multi» de la
// página del episodio: eran landings de streamhj que la captura
// perseguía 20 segundos cada uno para no pescar nada — tres veces lo
// demostró el teléfono; fuera, que los embeds ya traen los hosters.
//
// v0.6.12 «La puerta del player» — el teléfono destapó dos fuentes
// rotas y un anuncio con suerte. VerAnime cargaba pero su API v2
// responde 200 con el cuerpo VACÍO: el embed de verdad sale del POST
// admin-ajax del tema (action doo_player_ajax), y su darkanimes.com es
// un multiserver-pro que cifra cada botón — base64 de la URL XORada
// con la pk que su propia API entrega en claro. Y cuando lo único que
// la captura pesca es publicidad (el wingsmob de siempre, 450×450),
// elegirMedia ya no cae al anuncio por descarte: fallo honesto. En
// IvAnime los capítulos viven en /ver/<epslug>-episodio-N con un
// epslug que NO es el de la serie; la ficha solo enseña el «Ver
// ahora» del primero, así que el total se averigua con búsqueda
// binaria sobre su 404 de verdad (de verdad: probado). Sus pósters
// de la home, grisísimos, estaban a más de 1500 letras del ancla:
// la ventana de la mirada hacia atrás crece a 3500 y el relleno
// anime.png no cuenta.
//
// v0.6.13 «El escaparate» — VerAnime cargaba y reproducía, pero su
// Inicio era una fila sola. Sus géneros viven en /genero/<slug>/ y
// la sonda los verificó uno a uno: accion (36 páginas), comedia (39),
// fantasia (40), aventura (32), drama (26) y romance (19), todos con
// paginación /genero/<slug>/page/N/ — la portada se llena con un riel
// por género y su «Ver más» pagina de verdad. Y el gris de IvAnime:
// las imágenes de los héroes de su home viajan TODAS JUNTAS al
// principio del HTML, a miles de letras de su ancla, así que ninguna
// ventana las alcanzaba; pero su URL lleva el slug de la serie
// (portada/<base>-portada-<numero>.jpg): el póster se busca por
// nombre, verificado contra el HTML real. Sus lecturas ganan tiempo
// (13 s) y bitácora con estado y tamaño, que el teléfono manda.
//
// v0.6.14 «La ventana ancha» — el teléfono dejó la lista: VerAnime ya
// reproduce y trae sus siete rieles; IvAnime es el que cojea. Sus
// tarjetas de /emision y /animes son anclas «card-wrap» con TODO
// dentro (div, imagen, insignias, título) y cierran a ~1600 letras
// del href: la ventana de 900 las dejaba fuera y las filas salían
// vacías. La ventana del ancla crece a 3000 y el riel de la home gana
// las series de sus listados (la home real trae 19 anclas). HONESTO:
// los pósters de IvAnime siguen grises POR DECISIÓN DEL SITIO: sus
// imágenes responden 403 a todo cliente que no sea un navegador
// (probado con y sin Referer, y también vía el proxy i0.wp.com, que
// también recibe 403) — las URLs que arma el plugin son las correctas
// y cargarán el día que el sitio suelte el bloqueo; títulos, fichas,
// capítulos y reproducción van de sobra. Y si /emision o /animes
// algún día sale vacía con el olor a Cloudflare en el log, es el
// reto del sitio, no del plugin: la bitácora lo cuenta.
//
// v0.6.15 «La imagen presentada» — el teléfono pidió el truco de
// MangaTrack para los pósters grises de IvAnime, y la sonda v35
// encontró la llave: sus imágenes responden 403 al desnudo pero 200
// CON PRESENTACIÓN (el Referer del propio sitio más un UA de
// navegador; el UA solo no basta) — el mismo muro de Mangas.in y
// ManhwaWeb que la casa ya venció en su día. Kino pide los pósters
// del catálogo sin Referer y por eso salían grises; la cura es la
// capability «imageSource» (apiVersion 13): los items de IvAnime
// llevan su póster como {source:'plugin', handle:<la URL>} y Kino
// le pide los bytes al plugin, que baja la imagen con presentación
// y se la sirve en base64; Kino la cachea por handle (la misma
// imagen no se baja dos veces). El espejo .top no comparte assets
// (404) y el proxy wsrv tampoco pasa (400): la única puerta es
// presentarse como el propio sitio. HONESTO: la primera vez que
// aparece una fila sus pósters tardan un segundo en llenarse (Kino
// los pide en serie), y si el sitio vuelve a cerrar la llave el
// placeholder gris vuelve sin romper nada; en biblioteca e
// historial la referencia se guarda tal cual (un título guardado en
// otro dispositivo muestra el placeholder y ya).
//
// v0.6.16 «La imagen confesante» — la 0.6.15 llegó al teléfono, los
// rieles de IvAnime llenaron y la reproducción siguió fina, pero
// los pósters siguieron grises… y el log no dijo NI UNA línea de
// imágenes: nadie contaba la verdad. Esta versión convierte el
// export image en un testigo: cada póster que Kino pide se anota
// en la bitácora — servido con sus KB y su mime, o el porqué
// honesto de su fallo: si el muro no cedió (con su status), si
// llegó HTML en vez de imagen, o si pesa más del tope de 256 KB
// que Kino acepta por póster. Así el próximo log del teléfono
// señala al culpable entre los tres sospechosos: un Kino que
// nunca llama (cero líneas de póster en el log), un muro que no
// cede ante la red del teléfono (líneas con status 403), o unas
// portadas demasiado grandes (líneas de tope rebasado). El corte
// además es limpio: maxBytes (apiVersion 14) detiene la descarga
// en el tope en vez de bajar entera una imagen que Kino rechazaría
// igual, y las fichas y capítulos siguen intactos pase lo que
// pase.

//
// v0.6.17 «La ventanilla del lienzo» — el teléfono confesó en la
// 0.6.16: Kino SÍ pide los pósters, el muro SÍ cede ante su red
// (ni un 403), y las pantallas nativas de Kino (secciones, fichas,
// búsqueda) pintan. Quedaban dos grises con dueño. UNO: el INICIO
// — el lienzo no habla con el imageSource; sus rieles titleRail
// reciben las referencias de póster y este Kino las pinta grises
// (el log lo probó: los mismos handles ya servidos y cacheados en
// las secciones seguían grises en el Inicio). La cura es la
// ventanilla que MangaTrack usa desde siempre: los rieles de
// IvAnime se dibujan a mano — cada tarjeta es un nodo Image que
// lleva SU PROPIA presentación (Referer + User-Agent, los
// «headers» del Image del lienzo, Kino 0.9.83+) dentro de un
// scroll horizontal, con su «Ver más» y su tap a la ficha; las
// demás fuentes siguen con su titleRail nativo, que nunca falló.
// DOS: las PORTADAS grandes (333-374 KB) que rebasan el tope de
// 256 KB de Kino — con su mensajito rojo por cada negativa — y
// las que ya ni existen (404). El propio sitio regaló el
// respaldo: cada portada vive también en su versión pulgar, con
// el MISMO número en el nombre y cuatro veces más chica (sonda
// v37: verificada en los tres pósters que el teléfono rechazó —
// y los pulgares de las portadas 404 también viven). Cuando una
// portada no cabe o ni existe, se prueba su pulgar derivado y se
// sirve ese; solo si el pulgar tampoco existe, el placeholder
// honesto. Y honesto de nuevo: si el Kino es anterior a 0.9.83,
// los headers del lienzo se ignoran y las tarjetas pintan sus
// imágenes sin presentación (grises otra vez, sin romper nada);
// un riel recién abierto tarda unos segundos en llenarse. Y de
// paso, una astilla vieja de la 0.6.1 que nadie había visto
// porque los rieles no pasan por ahí: los resultados de BÚSQUEDA
// de IvAnime llevaban su ref con doble dos puntos (un slice de
// menos al re-etiquetar las tarjetas que casan con el patrón de
// AnimeYT) y al abrirlos partirRef los botaba; ya cosen como
// cualquier otra ref de la casa.

// v0.6.18 «El póster que espera» — la 0.6.17 en el teléfono contó
// una verdad incómoda: el Inicio dibujó sus rieles a mano con sus
// títulos y su «Ver más», pero las imágenes ni grises quedaron —
// solo letras. El contrato leído a fondo lo explica: los
// «headers» del Image del lienzo pertenecen a la PRÓXIMA Kino
// (la 0.9.83 provisional, «imágenes que necesitan un Referer») —
// el teléfono de hoy los ignora y pide la portada desnuda; el
// muro contesta 403 y la caja queda vacía (y el imageSource no
// ayuda: la guía lo dice claro, sus referencias solo sirven a
// las tarjetas NATIVAS de Kino, nunca al lienzo de la pantalla).
// Mientras esa versión llega, la caja espera con dignidad: cada
// Image lleva su «fallback» — el nodo que el contrato dibuja
// dentro de la caja cuando la imagen falla (desde Kino 0.9.74)
// — con su Icon y el nombre de la fuente sobre la superficie de
// Kino, tal como lo pinta la galería oficial. Y los headers se
// quedan donde están, porque el día que el teléfono se ponga la
// 0.9.83 las portadas del Inicio pintarán solas, sin tocar el
// plugin. Lo demás queda como la 0.6.17 lo dejó: el respaldo
// del pulgar para las portadas grandes, la búsqueda de IvAnime
// que ya abre sus resultados y la bitácora que confiesa póster
// por póster.

// v0.6.19 «El patrón del pintor» — el diagnóstico de la 0.6.18 quedó
// corto y se corrige aquí mismo: los «headers» del Image del lienzo
// NO pertenecen a una Kino futura — la 0.9.83 lleva días en la calle
// (y la 0.9.84 salió hoy): el pintor de Kino ya sabe presentarse, y
// el teléfono de la persona lo prueba cada vez que MangaTrack pinta
// Mangas.in con su Referer. Entonces ¿por qué el Inicio de la 0.6.17
// quedó en letras? La caja: el Image del riel no llevaba ancho
// propio, y un hueco sin ancho dentro del scroll horizontal no ocupa
// lugar — con el muro negándole la portada, la caja quedaba en cero
// y ni el gris ni el fallback tenían dónde dibujarse. La cura es el
// patrón que el teléfono ya pinta: el posterCard de MangaTrack — el
// ancho viaja EN la imagen (120), la tarjeta es un Card flush de
// Kino con el tap, el título al pie con su aire, y el fallback de
// siempre para el día gris. Los headers se quedan tal cual: son la
// presentación que la 0.9.83 ya honra.
//
// v0.6.20 «El pasaporte del título» — la 0.6.19 pintó las portadas
// del Inicio (el teléfono lo confesó con sus capturas: IvAnime por
// fin a color) pero el toque en las tarjetas murió con «No se pudo
// abrir este título». La regla del contrato (ui.md, go.title): un
// título que ESTÁ en el lienzo (titleCard, riel o grid) se abre con
// ese mismo item; un título que NO lo está — y un Card pintado a
// mano no lo es — necesita su PASAPORTE completo: ref, kind, id y
// title. El go de la 0.6.19 viajaba solo con ref y kind: Kino no
// podía abrir lo que no identifica. La cura: el tap del riel y el
// botón del destacado llevan las cuatro señas, y el destacado gana
// su id propio. El «Ver más» sigue bien: go.browse pide ref y
// title, y los lleva de fábrica.
//
// v0.6.21 «El póster de la ficha» — la 0.6.20 abrió los animes desde
// el Inicio, pero la ficha llegaba SIN póster (gris) mientras la
// misma serie abierta desde la sección sí lo traía: la sección le
// da a Kino el póster del item, y el Inicio tiene que pedirlo a
// details(). La sonda v38 midió la ficha real de IvAnime y la
// confesión: NO trae og:image (solo site_name, título y descripción)
// — el detalle de la 0.6.15 esperaba un og que no existe y la ficha
// viajaba desnuda. El póster vivo de la página es el PULGAR del
// héroe (/assets/thumbs/imagen/…jpg.webp, 40–90 KB, siempre bajo el
// tope de 256 KB de Kino). La cosecha va en orden: og:image por si
// un día aparece (en cualquiera de los dos órdenes de atributos), el
// pulgar del héroe, y de último una portada grande. La sinopsis se
// ancla al h1: el primer <p> con cuerpo DESPUÉS del título.
//
// v0.6.29 «El bibliotecario» — el usuario echó de menos títulos: la
// búsqueda de «grisaia no kajitsu» no lo encontró y en la web sí
// está (sonda v51: el ?s= de WordPress SÍ lo lista y azTarjetas
// peina esa página bien — el fallo del teléfono fue de la petición
// viva, así que la búsqueda gana un espejo de rescate). Pero la
// queja de fondo era CIERTA: az publica 1831 fichas (wp-json
// X-WP-Total, sonda v51) y el plugin solo enseñaba 7 filas de
// género (~140 tarjetas). La cura: el REST API de WordPress está
// ABIERTO (wp-json/wp/v2/posts con slug y título, orderby=title
// A-Z, 40 por página, 46 páginas) → nueva fila «Directorio A-Z»
// que pagina el catálogo COMPLETO de az; los géneros crecen de 7
// a 17 (escolar, harem, misterio, aventura, sobrenatural, ciencia
// ficción, mecha, superpoderes, psicológico y deportes — az tiene
// 44); y las tarjetas de búsqueda/género leen el kind de verdad
// del <li> (tipo-pelicula → película). Sin hosts nuevos: wp-json
// vive en www.az-animex.com, ya aprobado.
//
// v0.6.28 «El archivista» — el teléfono dio el visto bueno a la 0.6.27
// (Monogatari reproduce vía rentry) y el usuario pidió la búsqueda
// general: la sonda v49 recorrió ~140 fichas de az y las clasificó.
// Resultado: multilink (22%) y rentry ya funcionan; el resto vive
// tras TeraBox (API con muro de login: errno 140 en todos los
// dominios — se descartó tras luchar), el Server Az (AList con
// invitados desactivados: 401 «Guest user is disabled» — es el
// servicio premium de az), MultiUp (espejos de descarga premium,
// nada reproducible), FireLoad (YetiShare con lista AJAX de
// parámetros esquivos) o Filemoon suelto. La excepción dorada:
// MEDIAFIRE — las fichas viejas (2021–2023, como Bakemonogatari)
// enlazan una carpeta cuya API PÚBLICA lista los .mp4 por episodio
// sin pedir cuenta, y la página de cada archivo trae el enlace
// directo download####.mediafire.com en crudo (v50): carpeta →
// get_content → página del archivo → .mp4 directo. Y el aviso honesto
// ahora reconoce TODOS los mensajeros no soportados (TeraBox,
// Server Az, Filemoon suelto, MultiUp, FireLoad) en vez de fingir
// «sin descargas». mediafire.com entra al manifest: Kino pedirá
// re-aprobación una vez al actualizar.
//
// v0.6.27 «El mensajero» — el teléfono juzgó la 0.6.26 y dio su
// veredicto: «Todas» cargó, az reproduce… pero algunas fichas nuevas
// (Monogatari Second Season, Kimi no Koto ga Daidaidaidaidaisuki)
// caían con «ficha sin descargas». La sonda v48 halló al culpable: az
// cambió de mensajero — las fichas de oct 2026+ ya no traen el botón
// mirrored.to/multilinks/ en crudo; su «Mirrored» apunta a un paste de
// rentry.co que lista los files/<FID>/…mp4_links de siempre, uno por
// episodio (26 en Monogatari). Misma cadena después del paste, otro
// cartero: se lee rentry crudo primero y el espejo r.jina como respaldo.
// Y las fichas que solo ofrecen TeraBox o el Server Az (app JavaScript,
// ilegible sin navegador) ahora lo DICEN en el mensaje honesto en vez
// de fingir «sin descargas». rentry.co entra al manifest: Kino pedirá
// re-aprobación una vez al actualizar.
//
// v0.6.26 «Sesenta y no una» — la 0.6.25 murió en el teléfono: al
// actualizar, NADA cargó y el log confesó con la firma exacta:
// «too many requests in one call (at most 60)». Kino limita las
// peticiones por llamada (60) y la fan-out de «Todas» ya venía
// rozando el tope (54 peticiones en la 0.6.24: cada portada
// consultaba TODAS sus filas aunque «Todas» solo muestra el
// núcleo); Az-Animex sumó 7 más y el aviso llegó: van, iva y az
// contestaron status 0 (kino.fetch se negó), los pósters de IvAnime
// estallaron con el mismo mensaje y la pantalla quedó en rojo.
// Cura: en «Todas» (y en el home() de Kino) cada fuente consulta
// SOLO su núcleo — las filas que de verdad se muestran ahí: 37
// peticiones en vez de 61. Las secciones individuales siguen
// trayendo sus rieles completos (van con sus 15, az con sus 7 — cada
// una sola bajo el tope). Queda la deuda anotada: mc, lat, otv y
// ayt arman sus filas en tareas ansiosas (IIFE) y aún pagan un
// puñado de fetches de más en «Todas» — con 37 de holgura no
// aprieta, pero si las fuentes siguen creciendo habrá que
// reestructurarlas al patrón de defs.
//
// v0.6.25 «El tesoro de las nubes» — «integra az-animex.com y
// dw-anime.net… ver la manera de reproducir los vídeos así sea por
// la nube o algún truco». Las sondas v40–v47 midieron los dos:
// dw-anime quedó DESCARTADO — es puro sitio de descargas y sus
// fichas (paste → wp-safelink → MediaFire/Mega) terminan SIEMPRE en
// .RAR comprimidos: la cadena se resuelve pero el archivo final no
// es video reproducible. Az-Animex sí entra completa: es un
// WordPress cuyos episodios son .mp4 sueltos subidos a mirrored.to,
// y mirrored los replica a nubes de STREAMING que este plugin ya
// sabe abrir (Voe 156, StreamTape 149, StreamWish 168, LuluStream
// 177, Byse 165…). La cadena verificada: ficha → multilinks/<id> →
// /files/<FID>/…mp4_links (uno por episodio) → enlace ?hash=…&dl=0
// → tabla getlink/<FID>/<hostid>/?hid=…&tid=… → getlink responde 200
// con el href DIRECTO al embed de la nube → extractor de siempre.
// Gotchas que dejaron las sondas: el multilink y la tabla del
// ?hash= se sirven con JavaScript (el HTML crudo no trae los
// enlaces) — esos pasos caen al espejo de lectura r.jina.ai, que
// renderiza el JS y devuelve la página en texto; el directorio y el
// home de az son también JS — las filas viven de los géneros
// (/genero/<slug>/, WordPress puro que pagina /page/N/ — 66 páginas
// en acción) y de la búsqueda ?s=. El póster de las cards viaja en
// el <a> de la figura (img de /uploads/ con alt), el de la ficha en
// og:image. Y hosts nuevos en el manifest (az-animex, mirrored.to,
// r.jina.ai): Kino pedirá re-aprobación al actualizar — normal.
//
// v0.6.24 «El escaparate lleno» — «la fuente no muestra todo lo que
// tiene». Las sondas v39/v39b/v39c recorrieron cada sitio buscando
// páginas vivas y cómo paginan, y esta versión cuelga lo encontrado:
//   AnimeJara: +Acción/Romance/Comedia/Drama (/genero/<slug>/, paginado
//     en /genero/<slug>/page/N/ estilo WordPress).
//   MonosChinos: +Acción/Comedia (/genero/<slug> con ?p=N, reusando
//     mcSiguientePagina).
//   LataAnime: +En emisión (/emision), +Directorio (/animes), +Acción
//     y +Comedia (/genero/<slug> con ?p=N; el directorio NO pagina —
//     ?page= y ?pag= devuelven lo mismo, así que es una hoja honesta
//     de una sola página).
//   IvAnime: +Acción/Romance/Comedia (/genero/<slug> con ?p=N) y el
//     DIRECTORIO ahora pagina con ?p=N (el «catálogo incompleto» de
//     siempre: !page= no existe, ?p= sí y trae títulos distintos).
//   AnimeYT: «Películas» apunta a /pelicula/ de verdad (el
//     ?tipo=pelicula era ignorado y mostraba series), +Ranking,
//     +Temporada de otoño, +Acción.
//   VerAnime: +Películas (/pelicula/, paginado con «Página X de Y») y
//     7 géneros verificados (shounen, seinen, isekai, mecha, misterio,
//     psicologico, sobrenatural).
//   EstrenosAnime: +OVAs, +Especiales, +En emisión (una página por
//     hoja, honesto: /tipo/OVA/page/2/ responde 404).
//   OtakusTV y AnimeAV1: sin páginas nuevas reales — no se tocan.
// En «Todas» solo entra el núcleo de cada fuente; los rieles nuevos
// viven en su sección propia. Y lección de la 0.6.23: un global, un
// nombre — nada de helpers duplicados.

// v0.6.23 «Sin dobleces» — la 0.6.22 nunca cargó en el teléfono:
// «El plugin no carga: invalid redefinition of global identifier».
// La causa: la cosecha nueva se declaró como ivaPosterDe… y la
// 0.6.13 ya tenía un ivaPosterDe global (el buscador de pósters por
// nombre de los rieles). El motor del banco deja ganar a la última
// declaración y el banco pasó 43/43; el motor del teléfono (Hermes)
// no tolera un global declarado dos veces y ni siquiera cargó el
// archivo. Cura: la vieja se renombra a ivaPosterPorNombre (un
// global, un nombre) y el banco gana un vigía que escanea el
// maestro buscando declaraciones duplicadas — este disparo no
// vuelve a pasar verde.

// v0.6.22 «La ficha en pie» — la 0.6.21 vistió el details() y el
// teléfono confesó con su log que no bastó: al abrir la ficha desde
// el Inicio, episodes() corrió («iva: … -> N capítulos») pero ni
// una línea de image() — Kino nunca pidió el póster del detalle.
// El contrato tiene la puerta que faltaba: el póster de una ficha
// también vive en episodes().series (KinoSeriesInfo: poster acepta
// la referencia servida, como overview) — y episodes() es el
// llamado que el log PROBÓ que Kino hace en cada ficha. La misma
// cosecha del 0.6.21 ahora sirve a los dos caminos,
// sacada de la misma página que episodios ya baja: sin fetch
// extra. Y el detalle gana bitácora — un export sin línea en el
// log es indistinguible de un export muerto.

const VERSION = '0.6.29';
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

/* v0.6.3: las URLs que llegan dentro de JSON y atributos vienen escapadas
 * (&amp; de HTML, \/ de JSON); un toque y quedan listas para fetch. */
function desescapar(u) {
  return String(u || '').replace(/&amp;/g, '&').replace(/\\\//g, '/');
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

/* Une los cuatro casos: protocolo relativo (//…), absoluta, barra
 * inicial (contra el ORIGEN de la base) y relativa de verdad (contra
 * el directorio de la base — los saltos window.location de las
 * fuentes usan esa forma). */
function absolutizar(u, base) {
  const s = String(u || '').trim();
  if (!s) return '';
  if (s.indexOf('//') === 0) return 'https:' + s;
  /* v0.6.7: los http:// se suben a https:// — las imágenes en claro se
   * quedan grises en la app aunque el sitio las sirva. */
  if (/^http:\/\//i.test(s)) return 'https:' + s.slice(5);
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

/* v0.6.12: el multiserver-pro (darkanimes.com y familia) no trae las
 * URLs de sus botones en claro: data-url es el base64 de la URL XORada
 * byte a byte con la clave pk (ASCII), y esa pk la entrega su propia
 * API en claro dentro de {"pk":"..."}. Decodificado y verificado con
 * cuatro muestras de sonda (gupload.site, filelions.top, streamwish.top,
 * uqload.cx). */
function descifrarMsp(valor, pk) {
  try {
    const bytes = b64Bytes(String(valor || ''));
    const clave = String(pk || '');
    if (!bytes.length || !clave.length) return '';
    let r = '';
    for (let i = 0; i < bytes.length; i++) {
      r += String.fromCharCode(bytes[i] ^ clave.charCodeAt(i % clave.length));
    }
    return /^https?:\/\//i.test(r) ? r : '';
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
  /* v0.6.4: body JSON (el endpoint de descifre del multiserver de
   * EstrenosAnime lo pide así: {encrypted: …} con Content-Type json). */
  if (o.json !== undefined) {
    opts.method = 'POST';
    opts.body = { json: o.json };
    cabeceras['Content-Type'] = 'application/json';
  }
  try {
    const r = await kino.fetch(url, opts);
    const bien = !!(r && r.ok);
    /* v0.6.10 «El 404 mentiroso»: AnimeJara sirve sus páginas de
     * episodio con estado 404 y todo el contenido adentro; con
     * cuerpoSiempre se lee el cuerpo aunque el estado no sea 200 y
     * cada quien valida lo que recibió por contenido. */
    if (!bien && o.cuerpoSiempre !== true) return { ok: false, status: r ? r.status : 0, url: url, text: '' };
    const t = r && typeof r.text === 'function' ? await r.text() : String((r && r.text) || '');
    return { ok: bien, status: r ? r.status : 0, url: url, text: t };
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
const ANUNCIO_RE = /doubleclick|googlesyndication|adserver|\/ads?[\/._-]|propeller|adsterra|popads|popunder|exoclick|juicyads|hilltop|clickadu|trafficjunky|adnetwork|monetiz|teaser|vignette|pre-?roll|-banner[._\/]|wingsmob/i;

function esManifiesto(url, mime) {
  return /\.m3u8(?:[?#]|$)/i.test(String(url || '')) || /\.mpd(?:[?#]|$)/i.test(String(url || '')) || /mpegurl|dash/i.test(String(mime || ''));
}

function elegirMedia(lista) {
  const grupo = (lista || []).filter((x) => x && x.url);
  const buenas = grupo.filter((x) => !ANUNCIO_RE.test(x.url));
  /* v0.6.12: si TODO lo pescado es anuncio, NADA. Antes el reparto
   * caía al grupo completo por descarte y el teléfono terminó
   * reproduciendo el anuncio de wingsmob (450×450, bitrate 107) como
   * si fuera el capítulo de VerAnime. Un fallo honesto es mejor que
   * una publicidad que no se puede ver. */
  if (!buenas.length) return null;
  const man = buenas.filter((x) => esManifiesto(x.url, x.mime));
  if (man.length) return man[0];
  const vid = buenas.filter((x) => /\.(?:mp4|webm|mkv|mov)(?:[?#]|$)/i.test(x.url) || /^video\//i.test(String(x.mime || '')));
  if (vid.length) return vid[0];
  return buenas[0];
}

async function capturar(url, etiqueta, refBase) {
  const ref = (refBase || BASE_AV1) + '/';
  const ms = Math.max(6000, Math.min(20000, queda() - 2000));
  let pagina;
  try {
    pagina = await kino.browser.capture(url, { timeoutMs: ms, headers: { Referer: ref } });
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
      const pagina2 = await kino.browser.capture(url, { timeoutMs: ms2, captureAll: true, headers: { Referer: ref } });
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
  streamwish: 'StreamWish', lulu: 'LuluStream', vidhide: 'Vidhide', wolfstream: 'WolfStream',
  multi: 'Multiserver', generic: 'Servidor'
};

const TIPO_ORDEN = {
  zilla: 1, directo: 2, voe: 3, upnshare: 4, mixdrop: 5, mp4upload: 6, uqload: 7,
  yourupload: 8, streamtape: 9, okru: 10, savefiles: 11, dood: 12, hexload: 13,
  lulu: 14, streamwish: 15, vidhide: 16, filemoon: 17, wolfstream: 18,
  multi: 19, generic: 20
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
  if (/vidhide|streamhide|filelions/i.test(nu)) return 'vidhide';
  if (/savefiles?|streamhls/i.test(nu)) return 'savefiles';
  if (/hexload/i.test(nu)) return 'hexload';
  if (/streamwish|obeywish|\bwish\b|embedwish|hlswish|awish/i.test(nu)) return 'streamwish';
  if (/yourupload|gupload/i.test(nu)) return 'yourupload';
  if (/streamtape/i.test(nu)) return 'streamtape';
  if (/wolfstream/i.test(nu)) return 'wolfstream';
  /* v0.6.0: los agregadores propios (saidochesto y compañía) se abren con el
     navegador oculto: la captura pesca el video aunque el player no se deje
     leer. v0.6.9: streamhj.top (el multiserver de AnimeJara) es de la familia. */
  if (/saidochesto\.?top|multiserver|streamhj\.top/i.test(nu)) return 'multi';
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
  /* v0.6.12: YourUpload anda también como gupload.site (el multiserver
   * de VerAnime lo sirve): el Referer ya no es fijo sino el origen del
   * embed, que es el que el espejo espera ver. */
  const origen = origenDe(u) || 'https://www.yourupload.com';
  const pagina = await traer(u, { headers: { Referer: origen + '/' }, timeoutMs: 10000 });
  if (!pagina.ok) throw new Error('YourUpload HTTP ' + pagina.status);
  const html = pagina.text;
  const m = /<meta[^>]+og:video["'][^>]*content=["']([^"']+)["']/i.exec(html) ||
    /<meta[^>]+content=["']([^"']+)["'][^>]+og:video["']/i.exec(html) ||
    /file\s*:\s*["'](https?:\/\/[^"']+)["']/i.exec(html);
  if (!m) throw new Error('YourUpload sin video');
  const url = decHtml(String(m[1]).replace(/\\\//g, '/').replace(/\\u0026/gi, '&'));
  if (!/^https?:\/\//i.test(url)) throw new Error('YourUpload con URL rara');
  return { url: url, mime: 'video/mp4', headers: { Referer: origen + '/', 'User-Agent': UA }, expiresInSeconds: 1800 };
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

/* v0.6.3: WolfStream expone su archivo en un script de sources, al estilo
 * jwplayer ({file:"…"}): basta leerlo del HTML. */
async function exWolfstream(u) {
  const origen = origenDe(u) || 'https://wolfstream.com';
  const pagina = await traer(u, { headers: { Referer: origen + '/', 'User-Agent': UA }, timeoutMs: 10000 });
  if (!pagina.ok || !pagina.text) throw new Error('wolfstream no respondió');
  const fm = /\{file:\s*["']([^"']+)["']/.exec(pagina.text) ||
    /sources\s*:\s*\[[\s\S]{0,200}?file:\s*["']([^"']+)["']/i.exec(pagina.text);
  if (!fm) throw new Error('wolfstream sin archivo');
  let url = desescapar(fm[1]);
  if (url.indexOf('//') === 0) url = 'https:' + url;
  if (!/^https?:\/\//i.test(url)) throw new Error('wolfstream con archivo raro');
  return { url: url, mime: mimeDe(url), headers: { Referer: origen + '/', 'User-Agent': UA }, expiresInSeconds: 3600 };
}

async function exMulti(u) {
  if (!puedeCapturar()) throw new Error('Multiserver sin navegador oculto');
  return await capturar(u, 'Multiserver');
}

const EXTRACTORES = {
  voe: exVoe, mp4upload: exMp4Upload, mixdrop: exMixdrop, uqload: exUqload,
  streamtape: exStreamtape, yourupload: exYourUpload, upnshare: exUpnshare,
  dood: exDood, okru: exOkru, hexload: exHexload, savefiles: exSavefiles,
  filemoon: exFilemoon, streamwish: exGenerico, lulu: exGenerico, vidhide: exGenerico,
  wolfstream: exWolfstream, multi: exMulti, generic: exGenerico
};

async function abrirServidor(server) {
  if (server.directo) {
    /* v0.6.7: el directo marcado fondo se verifica ANTES de entregarlo:
     * un Range de 2 bytes responde en segundos y destapa aquí, en el
     * resolve, el 403 intermitente del Omega (archive.org) que antes
     * solo se veía dentro del reproductor colgado. Si no responde, se
     * descarta y el reparto cae a los extractores. */
    if (server.fondo === true) {
      const vf = await traer(server.directo.url, {
        headers: Object.assign({ Range: 'bytes=0-1' }, server.directo.headers || {}),
        timeoutMs: 8000
      });
      if (!vf.ok || (vf.status && vf.status >= 400)) {
        throw kino.error('unavailable', 'el directo no respondió (status ' + (vf.status || 0) + ')', {
          userMessage: 'El video directo de este capítulo está caído ahora mismo. Vuelve a abrirlo y elige otro servidor del menú Servidor.'
        });
      }
    }
    return server.directo;
  }
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
    /* v0.6.7: un directo marcado fondo (el Omega de mytsumi, un
     * archive.org con su 403 intermitente) va PRIMERO, detrás solo
     * del preferido, y antes de entregarlo lo verifica abrirServidor
     * con un Range de 2 bytes: si está caído se descarta en segundos
     * y el reparto sigue con los extractores. En la 0.6.5/0.6.6 iba
     * al final tras ok.ru y filemoon, que en el teléfono fallan
     * lento (la captura de filemoon tarda ~25 s): el tiempo del
     * resolve se agotaba antes de llegar al directo y no abría
     * nada. */
    const oa = servers[a].fondo === true ? 1 : (TIPO_ORDEN[servers[a].tipo] || 20);
    const ob = servers[b].fondo === true ? 1 : (TIPO_ORDEN[servers[b].tipo] || 20);
    return pa - pb || oa - ob || a - b;
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

  async portada(solo) {
    let defs = [
      { id: 'av1-row-eps', titulo: 'Últimos episodios', ref: 'av1-ultimos-eps', episodios: true },
      { id: 'av1-latest', titulo: 'Últimos agregados', ref: 'av1-latest', params: { orden: 'latest_added' } },
      { id: 'av1-populares', titulo: 'Populares', ref: 'av1-populares', params: { orden: 'popular' } },
      { id: 'av1-score', titulo: 'Mejor puntuados', ref: 'av1-score', params: { orden: 'score' } },
      { id: 'av1-peliculas', titulo: 'Películas', ref: 'av1-peliculas', params: { categoria: 'pelicula' } },
      { id: 'av1-gen-accion', titulo: 'Acción', ref: 'av1-gen:accion', params: { genero: 'accion' } },
      { id: 'av1-gen-fantasia', titulo: 'Fantasía', ref: 'av1-gen:fantasia', params: { genero: 'fantasia' } }
    ];
    /* v0.6.26: en «Todas» (y el home de Kino) solo se consulta el
     * núcleo — Kino limita las peticiones por llamada (60) y la
     * fan-out completa de las diez fuentes lo reventaba (la 0.6.25
     * murió así en el teléfono). */
    if (solo === true) {
      const nucleo = NUCLEO_TODAS.av1;
      if (nucleo) defs = defs.filter(function (d) { return nucleo.indexOf(d.id) >= 0; });
    }
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
      })(),
      /* v0.6.24: géneros verificados por sonda v39 (/genero/accion y
       * /genero/comedia responden 200 con tarjetas y paginan con ?p=N). */
      (async () => {
        const pagina = await traerMc('/genero/accion', 9000);
        const items = mcTarjetas(pagina.text).slice(0, 20);
        return items.length ? { id: 'mc-genero-accion', title: 'Acción · MonosChinos', ref: 'mc-genero-accion', items: items } : null;
      })(),
      (async () => {
        const pagina = await traerMc('/genero/comedia', 9000);
        const items = mcTarjetas(pagina.text).slice(0, 20);
        return items.length ? { id: 'mc-genero-comedia', title: 'Comedia · MonosChinos', ref: 'mc-genero-comedia', items: items } : null;
      })()
    ];
    const rtas = await Promise.all(tareas.map((t) => t.catch((e) => { log('mc fila', (e && e.message) || e); return null; })));
    const filas = [];
    for (const fila of rtas) if (fila) filas.push(fila);
    return filas;
  },

  async hoja(ref, cursor) {
    const pag = parseInt(String(cursor || '1'), 10) || 1;
    const num = pag > 1 ? pag : 1;
    let base = null;
    if (ref === 'mc-emision') base = '/emision';
    else if (ref === 'mc-animes') base = '/animes';
    else if (ref.indexOf('mc-genero-') === 0) base = '/genero/' + ref.slice('mc-genero-'.length);
    if (!base) return null;
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
      })(),
      /* v0.6.24: filas nuevas verificadas por sonda v39 — /emision y
       * /animes responden 200 (una sola página: ?page= y ?pag= son
       * ignoradas) y los géneros pagan con ?p=N. */
      (async () => {
        const pagina = await traerLat('/emision', 9000);
        const items = latTarjetas(pagina.text).slice(0, 20);
        return items.length ? { id: 'lat-emision', title: 'En emisión · LataAnime', ref: 'lat-emision', items: items } : null;
      })(),
      (async () => {
        const pagina = await traerLat('/animes', 9000);
        const items = latTarjetas(pagina.text).slice(0, 20);
        return items.length ? { id: 'lat-animes', title: 'Directorio · LataAnime', ref: 'lat-animes', items: items } : null;
      })(),
      (async () => {
        const pagina = await traerLat('/genero/accion', 9000);
        const items = latTarjetas(pagina.text).slice(0, 20);
        return items.length ? { id: 'lat-genero-accion', title: 'Acción · LataAnime', ref: 'lat-genero-accion', items: items } : null;
      })(),
      (async () => {
        const pagina = await traerLat('/genero/comedia', 9000);
        const items = latTarjetas(pagina.text).slice(0, 20);
        return items.length ? { id: 'lat-genero-comedia', title: 'Comedia · LataAnime', ref: 'lat-genero-comedia', items: items } : null;
      })()
    ];
    const rtas = await Promise.all(tareas.map((t) => t.catch((e) => { log('lat fila', (e && e.message) || e); return null; })));
    const filas = [];
    for (const fila of rtas) if (fila) filas.push(fila);
    return filas;
  },

  async hoja(ref, cursor) {
    let camino = null;
    let paginado = false; /* v0.6.24: solo los géneros pagan (?p=N verificado) */
    if (ref === 'lat-novedades') camino = '/';
    else if (ref === 'lat-latino') camino = '/buscar?q=latino';
    else if (ref === 'lat-castellano') camino = '/buscar?q=castellano';
    else if (ref === 'lat-emision') camino = '/emision';
    else if (ref === 'lat-animes') camino = '/animes';
    else if (ref.indexOf('lat-genero-') === 0) { camino = '/genero/' + ref.slice('lat-genero-'.length); paginado = true; }
    if (!camino) return null;
    const pag = parseInt(String(cursor || '1'), 10) || 1;
    const num = paginado && pag > 1 ? pag : 1;
    const pagina = await traerLat(camino + (paginado && num > 1 ? '?p=' + num : ''), 12000);
    if (!pagina.ok) {
      /* v0.6.24: fin de riel callado — si un género ya no tiene página
       * N, la hoja se cierra sin escándalo (la fila no murió: llegó al
       * final de su catálogo). */
      if (paginado && num > 1) return { items: [], next: null };
      throw kino.error('unavailable', 'LataAnime no respondió (status ' + pagina.status + ')', {
        userMessage: 'LataAnime no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    const items = latTarjetas(pagina.text).slice(0, 60);
    let next = null;
    if (paginado && items.length >= 20) next = String(num + 1);
    return { items: items, next: next };
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
  /* v0.6.3: el iframe perezoso (data-src) también cuenta; algunos players
   * (OtakusTV de vieja escuela, mytsumi) cargan así. */
  const ifRe = /<iframe\b[^>]*?\b(?:data-src|src)\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = ifRe.exec(texto))) candidatos.push({ url: desescapar(m[1]), nombre: '' });
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
  const propios = /(animejara\.com|henaojara2\.com|veranime\.ninja|otakustv2?\.com|otakustv\.net|animeyt\.(?:cc|one|org)|estrenosanime\.net|ivanime\.(?:top|buzz))/i;
  for (let i = 0; i < candidatos.length; i++) {
    const c = candidatos[i];
    let u = desescapar(String(c.url || '').trim());
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
 * episodio entero con el navegador oculto — con el Referer de SU fuente,
 * que algunos players miran quién los manda (v0.6.3). */
async function probarConCaptura(epUrl, servers, idx, refDe, etiqueta, refBase) {
  try {
    return await probarServidores(servers, idx, refDe);
  } catch (e) {
    if (puedeCapturar() && queda() > 8000) {
      try {
        const st = await capturar(epUrl, etiqueta, refBase);
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
    /* v0.6.5: el src de las tarjetas de EstrenosAnime es el genérico
     * «no_poster.jpg» y el de IvAnime un anime.png de relleno: un
     * atributo así no es póster, es su ausencia. */
    if (m && !/^data:/i.test(m[1]) && !/no_poster|capblank|placeholder/i.test(m[1])) {
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

/* v0.6.5: los pósters de los listados traen rutas RELATIVAS — se cosen
 * con la base de su fuente en cada llamada (eas/ayt/jara/van/iva), con el
 * absolutizar único de las utilidades. v0.6.6: la 0.6.5 declaró esa
 * función DOS veces (la vieja de utilidades y una nueva junto a los
 * conversores) y Kino compila el plugin como módulo, que no permite
 * redefinir un identificador global: la 0.6.5 no cargó en el teléfono
 * («invalid redefinition of global identifier»). Esta versión deja una
 * sola declaración, la de siempre, que une todos los casos. */

/* v0.6.3: el contenedor mytsumi.com de AnimeYT esconde los players tras un
 * open=1: solo con ese toque entrega botones data-player-url con los
 * enlaces de verdad (y hasta archivos directos .mp4/.m3u8). Sin él la
 * página sale vacía — por eso el sondeo de la 0.6.1 nunca encontraba
 * nada en el teléfono. */
async function aytSondearMytsumi(html) {
  const texto = String(html || '');
  const candidatos = [];
  const vistosUrl = {};
  /* la URL del contenedor puede andar suelta en el JS de la página o
   * dentro de un iframe perezoso; se caza en ambos sitios. */
  const myRe = /https?:\/\/(?:www\.)?mytsumi\.com\/[^"'\s<>]+/gi;
  let m;
  while ((m = myRe.exec(texto)) && candidatos.length < 2) {
    /* v0.6.4: la URL viene con el ampersand numérico (&#038;) y el
     * contenedor rechaza la que no esté limpia — de ahí el vacío del
     * sondeo en la 0.6.3 del teléfono. */
    const u = decHtml(m[0]);
    if (vistosUrl[u]) continue;
    vistosUrl[u] = true;
    candidatos.push(u);
  }
  const ifRe = /<iframe\b[^>]*?\b(?:data-src|src)\s*=\s*["']([^"']*mytsumi[^"']*)["'][^>]*>/gi;
  while ((m = ifRe.exec(texto)) && candidatos.length < 2) {
    let u = desescapar(decHtml(m[1]).trim());
    if (u.indexOf('//') === 0) u = 'https:' + u;
    if (!/^https?:\/\//i.test(u) || vistosUrl[u]) continue;
    vistosUrl[u] = true;
    candidatos.push(u);
  }
  const servers = [];
  const vistos = {};
  const agregar = function (u, nombre, directo, ref) {
    if (!u || u === 'about:blank') return;
    if (u.indexOf('//') === 0) u = 'https:' + u;
    if (!/^https?:\/\//i.test(u)) return;
    if (/\.(?:jpe?g|png|webp|gif)(?:$|\?)/i.test(u)) return;
    if (directo || /\.(?:mp4|m3u8)(?:$|\?)/i.test(u)) {
      /* v0.6.4: los botones de descarga de mytsumi traen depósitos de
       * archivos (mediafire, terabox, gofile…) cuyos enlaces terminan en
       * .mp4 pero son PÁGINAS, no vídeos: no son directos reproducibles. */
      if (/mediafire|terabox|gofile|fireload|1fichier|vikingfile|mega\.nz/i.test(u)) return;
      const clave = 'dir|' + u;
      if (vistos[clave]) return;
      vistos[clave] = true;
      /* v0.6.7: estos directos (el Omega de archive.org y parientes)
       * siguen marcados fondo — pero ya no significa «al final»,
       * sino «verificar antes de aceptar»: intermitentemente
       * responden 403 al reproducir, así que el reparto les pide un
       * Range de 2 bytes primero y van delante de los extractores. */
      servers.push({
        nombre: nombre || 'Directo', url: u, tipo: 'directo', fondo: true,
        directo: { url: u, mime: mimeDe(u), headers: { Referer: ref, 'User-Agent': UA } }
      });
      return;
    }
    const tipo = detectarTipo(nombre, u);
    if (!tipo || tipo === 'generic') return;
    const clave = tipo + '|' + u;
    if (vistos[clave]) return;
    vistos[clave] = true;
    servers.push({ nombre: nombre, url: u, tipo: tipo });
  };
  for (const u of candidatos) {
    if (queda() < 6000) break;
    const abierta = u + (u.indexOf('?') >= 0 ? '&' : '?') + 'open=1';
    try {
      const r = await traer(abierta, { headers: { Referer: u, 'User-Agent': UA }, timeoutMs: 9000 });
      if (!r.ok || !r.text) continue;
      const botonRe = /<button\b[^>]*\bdata-player-url\s*=\s*["']([^"']+)["'][^>]*>/gi;
      while ((m = botonRe.exec(r.text))) {
        const etiqueta = /\bdata-player-label\s*=\s*["']([^"']{0,40})["']/i.exec(m[0]);
        const esVideo = /\bdata-player-kind\s*=\s*["']video["']/i.test(m[0]);
        agregar(desescapar(m[1]), etiqueta ? etiqueta[1] : '', esVideo, abierta);
      }
      const dlRe = /<a\b[^>]*mytsumi-download-button[^>]*>/gi;
      while ((m = dlRe.exec(r.text))) {
        const href = /\bhref\s*=\s*["']([^"']+)["']/i.exec(m[0]);
        const tt = /\btitle\s*=\s*["']([^"']{0,40})["']/i.exec(m[0]);
        if (href) agregar(desescapar(href[1]), tt ? tt[1] : '', /\.(?:mp4|m3u8)(?:$|\?)/i.test(href[1]), abierta);
      }
      if (servers.length) log('sondeo mytsumi:', u, '->', servers.length, 'servidores');
    } catch (e) {
      log('sondeo mytsumi falló:', u, (e && e.message) || e);
    }
  }
  /* v0.6.7: los directos de aquí (el Omega de archive.org) van PRIMERO
   * en la lista: el reparto los verifica con un Range y, si responden,
   * son lo más rápido que hay; si su 403 intermitente aparece, caen en
   * segundos y los extractores siguen detrás. En la 0.6.5/0.6.6 iban
   * al final y en el teléfono el resolve moría antes de tocarlos. */
  servers.sort(function (a, b) {
    const oa = a.tipo === 'directo' ? 0 : (TIPO_ORDEN[a.tipo] || 20);
    const ob = b.tipo === 'directo' ? 0 : (TIPO_ORDEN[b.tipo] || 20);
    return oa - ob;
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

/* v0.6.4: el select #ssel desapareció del capítulo: ahora las opciones
 * viajan en data-dwn, una lista de pares [etiqueta, enlace] con los
 * servidores del episodio (byse, doodstream, voe, mixdrop, mp4upload…).
 * Se cosecha tal cual; mp4upload viene con el enlace pelado (solo el
 * id) y se convierte a su forma embed-, los desconocidos con /f|file/
 * pasan a su forma /e/ y caen al genérico. El #ssel de la escuela
 * vieja queda de respaldo por si vuelve. */
async function otvServersDe(html) {
  const texto = String(html || '');
  const servers = [];
  const vistos = {};
  const agregar = function (nombre, u, permitirGeneric) {
    if (!u) return;
    u = desescapar(decHtml(String(u)));
    if (u.indexOf('//') === 0) u = 'https:' + u;
    if (!/^https?:\/\//i.test(u)) return;
    if (/\.(?:jpe?g|png|webp|gif)(?:$|\?)/i.test(u)) return;
    /* mp4upload pelado (solo el id): su reproductor vive en embed-<id>.html */
    const mp = /^https?:\/\/(?:www\.)?mp4upload\.com\/([a-z0-9]+)\/?$/i.exec(u);
    if (mp) u = 'https://www.mp4upload.com/embed-' + mp[1] + '.html';
    const tipo = detectarTipo(nombre, u);
    if (!tipo) return;
    if (tipo === 'generic') {
      if (!permitirGeneric) return;
      u = u.replace(/\/(?:f|file)\//i, '/e/');
    }
    const clave = tipo + '|' + u;
    if (vistos[clave]) return;
    vistos[clave] = true;
    servers.push({ nombre: String(nombre || '').replace(/\s+/g, ' ').trim() || 'Servidor', url: u, tipo: tipo });
  };
  /* la lista de enlaces del capítulo, de fábrica en el propio HTML */
  const dwnM = /\bdata-dwn\s*=\s*["']([^"']+)["']/i.exec(texto);
  if (dwnM) {
    const lista = decHtml(dwnM[1]);
    const parRe = /\[\s*"([^"]*)"\s*,\s*"(https?:[^"]+)"\s*\]/g;
    let m;
    let n = 0;
    while ((m = parRe.exec(lista)) && n < 10) {
      agregar(m[1], m[2], true);
      n++;
    }
    if (servers.length) {
      log('otv: ' + servers.length + ' enlaces en data-dwn');
      return servers;
    }
  }
  /* respaldo: el select #ssel de la escuela vieja, por si vuelve */
  const selM = /<select\b[^>]*\bid\s*=\s*["']ssel["'][^>]*>([\s\S]*?)<\/select>/i.exec(texto);
  if (!selM) return servers;
  const opciones = [];
  const opRe = /<option\b[^>]*\bvalue\s*=\s*["']([^"']+)["'][^>]*>([^<]{0,60})</gi;
  let m;
  while ((m = opRe.exec(selM[1])) && opciones.length < 12) {
    const id = m[1].trim();
    if (id) opciones.push({ id: id, nombre: m[2].replace(/\s+/g, ' ').trim() });
  }
  if (!opciones.length) return servers;
  log('otv: ' + opciones.length + ' opciones en #ssel');
  /* en lotes paralelos de cinco: son hasta doce consultas chiquitas y el
   * presupuesto del resolve no perdona las colas largas */
  for (let i = 0; i < opciones.length; i += 5) {
    if (queda() < 6000) break;
    const lote = opciones.slice(i, i + 5);
    const rtas = await Promise.all(lote.map(function (o) {
      return traer(BASE_OTV + '/play-video?id=' + encodeURIComponent(o.id), {
        headers: {
          Referer: BASE_OTV + '/',
          'X-Requested-With': 'XMLHttpRequest',
          Accept: 'application/json, text/javascript, */*; q=0.01'
        },
        timeoutMs: 6000
      });
    }));
    for (let j = 0; j < rtas.length; j++) {
      const r = rtas[j];
      if (!r.ok || !r.text) continue;
      const um = /["']url["']\s*:\s*["']([^"']+)["']/.exec(r.text);
      if (!um) continue;
      agregar(lote[j].nombre, um[1], false);
    }
  }
  return servers;
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
    /* v0.6.4: primero los enlaces de data-dwn (la puerta nueva del
     * capítulo) — los embeds de verdad sin tocar nada; si la puerta
     * cambia, quedan los iframes legibles y la captura del navegador
     * oculto. */
    const servers = (await otvServersDe(r.text)).concat(servidoresDePagina(r.text));
    return await probarConCaptura(BASE_OTV + '/ver/' + slug + '-' + num, servers, idx, function (i) {
      return 'otv:' + slug + ':' + num + ':' + i;
    }, 'OtakusTV', BASE_OTV);
  }
});

/* ---------- fuente: AnimeYT (animeyt.cc) ---------- */

const BASE_AYT = 'https://animeyt.cc';

function aytTarjetas(html) {
  /* v0.6.7: las películas de AnimeYT viven en fichas /pelicula/<slug>/ y
   * sus listados (la fila «Películas», la búsqueda) las traen así; con
   * el patrón de solo /tv|anime/ la fila salía vacía en el teléfono. */
  const re = /<a\b[^>]*href\s*=\s*["'][^"']*\/(?:tv|anime|pelicula)\/([^"\/?#]+)[^>]*>([\s\S]{0,900}?)<\/a>/gi;
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
    /* v0.6.5: pósters con ruta relativa, cosidos con la base. */
    if (poster) item.poster = absolutizar(poster, BASE_AYT);
    const ym = /\b(19\d{2}|20\d{2})\b/.exec(ventana);
    if (ym) item.year = ym[1];
    items.push(item);
  }
  return items;
}

/* v0.6.7: las fichas de AnimeYT pueden ser de serie (/tv/<slug>/) o de
 * película (/pelicula/<slug>/): la fila «Películas» y la búsqueda traen
 * de las dos clases, así que se prueba primero la de serie y, si el
 * sitio no la conoce, la de película. Devuelve la respuesta que tenga
 * cuerpo (o la primera, para que el error hable de la serie). */
async function aytFichaDe(slug) {
  const r = await traer(BASE_AYT + '/tv/' + slug, { headers: { Referer: BASE_AYT + '/' }, timeoutMs: 10000 });
  if (r.ok && r.text) return r;
  const p = await traer(BASE_AYT + '/pelicula/' + slug + '/', { headers: { Referer: BASE_AYT + '/' }, timeoutMs: 10000 });
  return (p.ok && p.text) ? p : r;
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
      /* v0.6.24: el ?tipo=pelicula era papel — el sitio lo ignora y
       * mostraba series; /pelicula/ es la página real (sonda v39: 200
       * con tarjetas de película). */
      (async () => {
        const r = await traer(BASE_AYT + '/pelicula/', { headers: { Referer: BASE_AYT + '/' }, timeoutMs: 9000 });
        const items = aytTarjetas(r.text).slice(0, 20);
        return items.length ? { id: 'ayt-peliculas', title: 'Películas · AnimeYT', ref: 'ayt-peliculas', items: items } : null;
      })(),
      (async () => {
        const r = await traer(BASE_AYT + '/ranking/', { headers: { Referer: BASE_AYT + '/' }, timeoutMs: 9000 });
        const items = aytTarjetas(r.text).slice(0, 20);
        return items.length ? { id: 'ayt-ranking', title: 'Ranking · AnimeYT', ref: 'ayt-ranking', items: items } : null;
      })(),
      (async () => {
        const r = await traer(BASE_AYT + '/temporada/otono-2026/', { headers: { Referer: BASE_AYT + '/' }, timeoutMs: 9000 });
        const items = aytTarjetas(r.text).slice(0, 20);
        return items.length ? { id: 'ayt-temporada', title: 'Temporada de otoño · AnimeYT', ref: 'ayt-temporada', items: items } : null;
      })(),
      (async () => {
        const r = await traer(BASE_AYT + '/genero/accion/', { headers: { Referer: BASE_AYT + '/' }, timeoutMs: 9000 });
        const items = aytTarjetas(r.text).slice(0, 20);
        return items.length ? { id: 'ayt-genero-accion', title: 'Acción · AnimeYT', ref: 'ayt-genero-accion', items: items } : null;
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
    let paginado = false;
    if (ref === 'ayt-latest') { camino = '/tv/' + (num > 1 ? 'page/' + num + '/' : ''); paginado = true; }
    /* v0.6.24: /pelicula/ pagina con /pelicula/page/N/ (sonda v39:
     * página 2 responde 200 con títulos distintos). Ranking, temporada
     * y género son de una sola página — page/2 devuelve lo mismo y no
     * se inventa paginación. */
    else if (ref === 'ayt-peliculas') { camino = '/pelicula/' + (num > 1 ? 'page/' + num + '/' : ''); paginado = true; }
    else if (ref === 'ayt-ranking') camino = '/ranking/';
    else if (ref === 'ayt-temporada') camino = '/temporada/otono-2026/';
    else if (ref === 'ayt-genero-accion') camino = '/genero/accion/';
    if (!camino) return null;
    const r = await traer(BASE_AYT + camino, { headers: { Referer: BASE_AYT + '/' }, timeoutMs: 10000 });
    if (!r.ok) {
      if (paginado && num > 1) return { items: [], next: null };
      throw kino.error('unavailable', 'AnimeYT no respondió (status ' + r.status + ')', {
        userMessage: 'AnimeYT no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    const items = aytTarjetas(r.text);
    if (!items.length) return { items: [], next: null };
    return { items: items.slice(0, 30), next: paginado ? String(num + 1) : null };
  },

  async detalle(slug) {
    const r = await aytFichaDe(slug);
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
    const r = await aytFichaDe(slug);
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
      /* v0.6.7: sin anclas -capitulo-N esta ficha puede ser una
       * PELÍCULA: su página de reproducción es la propia
       * /<id>/anime/<slug>/ que enlaza la ficha (el «1 publicados»
       * de la web), y se lista como único episodio. */
      const reM = /href\s*=\s*["'][^"']*\/(\d+)\/anime\/([^"\/?#]+)\/["']/i;
      if (reM.test(r.text)) {
        return {
          series: { title: slugATitulo(slug) },
          episodes: [{ season: 1, number: 1, ref: 'ayt:' + slug + ':1', title: 'Película' }]
        };
      }
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
     * con el enlace justo del capítulo pedido. v0.6.7: la ficha puede ser
     * de serie o de película (aytFichaDe prueba las dos). */
    const ficha = await aytFichaDe(slug);
    const re = new RegExp('href\\s*=\\s*["\'][^"\']*\\/(\\d+)\\/anime\\/([^"\\/?#]+)-capitulo-' + num, 'i');
    const am = ficha.ok ? re.exec(ficha.text) : null;
    let epUrl = '';
    if (am) {
      epUrl = BASE_AYT + '/' + am[1] + '/anime/' + am[2] + '-capitulo-' + num;
    } else {
      /* v0.6.7: sin ancla de capítulo puede ser una PELÍCULA: su página
       * de reproducción es la propia /<id>/anime/<slug>/ de la ficha,
       * sin «-capitulo-N». */
      const reM = /href\s*=\s*["'][^"']*\/(\d+)\/anime\/([^"\/?#]+)\/["']/i;
      const mm = ficha.ok ? reM.exec(ficha.text) : null;
      if (mm) epUrl = BASE_AYT + '/' + mm[1] + '/anime/' + mm[2] + '/';
    }
    if (!epUrl) {
      throw kino.error('not_found', 'AnimeYT: capítulo no hallado', {
        userMessage: 'No se halló el enlace de este capítulo en AnimeYT.'
      });
    }
    const r = await traer(epUrl, { headers: { Referer: BASE_AYT + '/' }, timeoutMs: 10000 });
    if (!r.ok || !r.text) {
      throw kino.error('not_found', 'AnimeYT no entregó el capítulo', {
        userMessage: 'No se pudo abrir este capítulo en AnimeYT.'
      });
    }
    const servers = servidoresDePagina(r.text);
    /* v0.6.3: los players viven en el contenedor mytsumi, que solo entrega
     * sus botones data-player-url si se le pide con open=1 (el sondeo de
     * la 0.6.1 pedía la página sin ese toque y salía vacío). Si ni así
     * aparecen, probarConCaptura cae a la captura del navegador. */
    const extra = await aytSondearMytsumi(r.text);
    const todos = servers.concat(extra);
    return await probarConCaptura(epUrl, todos, idx, function (i) {
      return 'ayt:' + slug + ':' + num + ':' + i;
    }, 'AnimeYT', BASE_AYT);
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
     * del sitio; si no está dentro, se mira hacia atrás.
     * v0.6.5: sus imágenes son rutas relativas (/uploads/anime/…): se
     * cosen con la base o Kino las deja grises. */
    let poster = posterEnVentana(ventana);
    if (!poster) poster = posterAntesDe(String(html || ''), m.index);
    if (poster) item.poster = absolutizar(poster, BASE_EAS);
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
    /* v0.6.1: en el feed la imagen va ANTES del ancla del episodio.
     * v0.6.5: rutas relativas cosidas con la base. */
    let poster = posterEnVentana(ventana);
    if (!poster) poster = posterAntesDe(String(html || ''), m.index);
    if (poster) {
      poster = absolutizar(poster, BASE_EAS);
      item.backdrop = poster;
      item.poster = poster;
    }
    items.push(item);
  }
  return items;
}

const EAS_AJAX = {
  Referer: BASE_EAS + '/',
  'X-Requested-With': 'XMLHttpRequest',
  Accept: 'application/json, text/javascript, */*; q=0.01'
};

/* v0.6.4: el multiserver nuevo (multiserver.sbs) entrega cada opción
 * CIFRADA (U2FsdGVkX1…, un blob de CryptoJS), pero la clave no se
 * esconde: su propia página pregunta por POST a embed/api/decrypt-stream
 * y el servidor responde el enlace en claro. Aquí se cosechan las
 * opciones (li con go_to_player) y, si vienen cifradas, se le pregunta
 * al mismo endpoint que usa la página. El go_to_player('URL') en claro
 * de la escuela vieja también se acepta, por si conviven. */
async function easMulti(link) {
  const origen = origenDe(link) || 'https://multiserver.sbs';
  const r = await traer(link, { headers: { Referer: BASE_EAS + '/', 'User-Agent': UA }, timeoutMs: 9000 });
  if (!r.ok || !r.text) return [];
  const servers = [];
  const vistos = {};
  const agregar = function (nombre, u, idioma) {
    if (!u) return;
    if (u.indexOf('//') === 0) u = 'https:' + u;
    if (!/^https?:\/\//i.test(u)) return;
    if (/\.(?:jpe?g|png|webp|gif)(?:$|\?)/i.test(u)) return;
    const tipo = detectarTipo(nombre, u);
    if (!tipo) return;
    const clave = tipo + '|' + u;
    if (vistos[clave]) return;
    vistos[clave] = true;
    servers.push({ nombre: String(nombre || '').replace(/\s+/g, ' ').trim(), url: u, tipo: tipo, idioma: String(idioma || '') });
  };
  const items = [];
  let m;
  const liRe = /<li\b[^>]*onclick\s*=\s*["']\s*go_to_player(?:Vast|)?\(\s*['"]([^'"]+)['"]/gi;
  while ((m = liRe.exec(r.text)) && items.length < 14) {
    const resto = r.text.slice(m.index, m.index + 400);
    const etiqueta = /<span>([^<]{0,60})<\/span>/i.exec(resto);
    const idioma = /<p>([^<]{0,60})<\/p>/i.exec(resto);
    items.push({ dato: m[1], nombre: etiqueta ? etiqueta[1] : '', idioma: idioma ? idioma[1] : '' });
  }
  if (!items.length) {
    const gpRe = /go_to_player(?:Vast|)?\(\s*['"](https?:\/\/[^'"]+)['"]/gi;
    while ((m = gpRe.exec(r.text)) && items.length < 14) {
      items.push({ dato: m[1], nombre: '', idioma: '' });
    }
  }
  const cifrados = [];
  for (const it of items) {
    const dato = desescapar(it.dato);
    if (/^https?:\/\//i.test(dato)) {
      agregar(it.nombre, dato, it.idioma);
    } else {
      cifrados.push({ dato: dato, nombre: it.nombre, idioma: it.idioma });
    }
  }
  /* los blobs cifrados se preguntan en lotes paralelos de cinco */
  for (let i = 0; i < cifrados.length; i += 5) {
    if (queda() < 5000) break;
    const lote = cifrados.slice(i, i + 5);
    const rtas = await Promise.all(lote.map(function (it) {
      return traer(origen + '/embed/api/decrypt-stream', {
        json: { encrypted: it.dato },
        headers: { Referer: link, Origin: origen, Accept: 'application/json' },
        timeoutMs: 6000
      });
    }));
    for (let j = 0; j < rtas.length; j++) {
      const rr = rtas[j];
      if (!rr.ok || !rr.text) continue;
      let enlace = '';
      try {
        const dj = JSON.parse(rr.text);
        if (dj && typeof dj.url === 'string') enlace = dj.url;
      } catch (e) {}
      if (!enlace) {
        const um = /["']url["']\s*:\s*["']([^"']+)["']/.exec(rr.text);
        if (um) enlace = um[1];
      }
      if (!enlace) continue;
      agregar(lote[j].nombre, desescapar(enlace), lote[j].idioma);
    }
  }
  /* el doblado y el castellano van primero, que es lo que se busca */
  servers.sort(function (a, b) {
    const la = /latino|castellano/i.test(a.idioma) ? 0 : 1;
    const lb = /latino|castellano/i.test(b.idioma) ? 0 : 1;
    return la - lb || (TIPO_ORDEN[a.tipo] || 20) - (TIPO_ORDEN[b.tipo] || 20);
  });
  return servers;
}

/* v0.6.3 (de respaldo): el multiserver de EstrenosAnime vivía en el
 * iframe de div.player-frame con go_to_player('URL') en claro. */
async function easServersDeViejo(texto) {
  let destino = '';
  let m;
  const frRe = /<iframe\b[^>]*?\b(?:data-src|src)\s*=\s*["']([^"']+)["'][^>]*>/gi;
  while ((m = frRe.exec(texto))) {
    let u = desescapar(m[1].trim());
    if (u.indexOf('//') === 0) u = 'https:' + u;
    if (!/^https?:\/\//i.test(u)) continue;
    const antes = texto.slice(Math.max(0, m.index - 300), m.index);
    if (/player-frame/.test(antes)) { destino = u; break; }
  }
  if (!destino) return [];
  log('eas: multiserver en', destino);
  const servers = [];
  const vistos = {};
  try {
    const r = await traer(destino, { headers: { Referer: BASE_EAS + '/', 'User-Agent': UA }, timeoutMs: 9000 });
    if (!r.ok || !r.text) return [];
    const gpRe = /go_to_player(?:Vast|)?\(\s*['"]([^'"]+)['"]/gi;
    while ((m = gpRe.exec(r.text))) {
      let u = desescapar(m[1]);
      if (u.indexOf('//') === 0) u = 'https:' + u;
      if (!/^https?:\/\//i.test(u)) continue;
      const tipo = detectarTipo('', u);
      if (!tipo || tipo === 'generic') continue;
      const clave = tipo + '|' + u;
      if (vistos[clave]) continue;
      vistos[clave] = true;
      servers.push({ nombre: '', url: u, tipo: tipo });
    }
    /* por si monta las opciones con onclick al estilo saidochesto */
    if (!servers.length) {
      const odRe = /\(\s*['"](https?:\/\/[^'"]+)['"]\s*\)/gi;
      while ((m = odRe.exec(r.text))) {
        let u = desescapar(m[1]);
        const tipo = detectarTipo('', u);
        if (!tipo || tipo === 'generic') continue;
        const clave = tipo + '|' + u;
        if (vistos[clave]) continue;
        vistos[clave] = true;
        servers.push({ nombre: '', url: u, tipo: tipo });
      }
    }
  } catch (e) {
    log('multiserver de EstrenosAnime falló', (e && e.message) || String(e));
  }
  return servers;
}

/* v0.6.4: EstrenosAnime se reconstruyó tipo Aniwatch y el iframe del
 * multiserver desapareció: el capítulo trae un div con data-epid, sus
 * servidores se piden por AJAX (/ajax/v2/episode/servers), cada opción
 * abre por /ajax/v2/episode/sources y el enlace que devuelve puede ser
 * un servidor directo o el multiserver nuevo, cuyas opciones se
 * descifran preguntándole a su propio endpoint. El iframe viejo queda
 * de respaldo por si vuelve. */
async function easServersDe(html) {
  const texto = String(html || '');
  const wm = /\bdata-epid\s*=\s*["'](\d+)["']/i.exec(texto);
  if (!wm) return easServersDeViejo(texto);
  const servers = [];
  const vistos = {};
  const agregar = function (u, tipo, nombre) {
    const clave = tipo + '|' + u;
    if (vistos[clave]) return;
    vistos[clave] = true;
    servers.push({ nombre: String(nombre || ''), url: u, tipo: tipo });
  };
  const r = await traer(BASE_EAS + '/ajax/v2/episode/servers?episodeId=' + wm[1], { headers: EAS_AJAX, timeoutMs: 9000 });
  if (!r.ok || !r.text) return easServersDeViejo(texto);
  /* la respuesta es JSON con el html adentro (y las comillas escapadas):
   * se parsea de verdad, no se caza a regex sobre el crudo */
  let plano = r.text;
  try {
    const j = JSON.parse(r.text);
    if (j && typeof j.html === 'string' && j.html) plano = j.html;
  } catch (e) {}
  const ids = [];
  let m;
  const itRe = /\bdata-type\s*=\s*["']embed["'][^>]*\bdata-id\s*=\s*["'](\d+)["']/g;
  const itRe2 = /\bdata-id\s*=\s*["'](\d+)["'][^>]*\bdata-type\s*=\s*["']embed["']/g;
  while ((m = itRe.exec(plano)) && ids.length < 4) ids.push(m[1]);
  if (!ids.length) {
    while ((m = itRe2.exec(plano)) && ids.length < 4) ids.push(m[1]);
  }
  if (!ids.length) return [];
  log('eas: ' + ids.length + ' opciones por AJAX');
  const rtas = await Promise.all(ids.map(function (id) {
    return traer(BASE_EAS + '/ajax/v2/episode/sources?id=' + id, { headers: EAS_AJAX, timeoutMs: 9000 });
  }));
  const multis = [];
  for (let i = 0; i < rtas.length; i++) {
    const rr = rtas[i];
    if (!rr.ok || !rr.text) continue;
    let enlace = '';
    try {
      const sj = JSON.parse(rr.text);
      if (sj && typeof sj.link === 'string') enlace = sj.link;
    } catch (e) {}
    if (!enlace) {
      const lm = /["']link["']\s*:\s*["']([^"']+)["']/.exec(rr.text);
      if (lm) enlace = lm[1];
    }
    if (!enlace) continue;
    let u = desescapar(enlace);
    if (u.indexOf('//') === 0) u = 'https:' + u;
    if (!/^https?:\/\//i.test(u)) continue;
    if (/multiserver|saidochesto/i.test(u)) {
      if (!vistos['multi|' + u]) {
        vistos['multi|' + u] = true;
        multis.push(u);
      }
    } else {
      const tipo = detectarTipo('', u);
      if (!tipo) continue;
      agregar(u, tipo, '');
    }
  }
  for (const u of multis) {
    if (queda() < 8000) break;
    try {
      const extra = await easMulti(u);
      for (const s of extra) agregar(s.url, s.tipo, s.nombre);
    } catch (e) {
      log('multiserver de EstrenosAnime falló', (e && e.message) || String(e));
    }
  }
  servers.sort(function (a, b) {
    return (TIPO_ORDEN[a.tipo] || 20) - (TIPO_ORDEN[b.tipo] || 20);
  });
  return servers;
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

  async portada(solo) {
    let defs = [
      { id: 'eas-eps', titulo: 'Últimos episodios · EstrenosAnime', ref: 'eas-eps', camino: '/ultimo-episodios', eps: true },
      { id: 'eas-sub', titulo: 'Sub español · EstrenosAnime', ref: 'eas-sub', camino: '/ultimo-subtitulado' },
      { id: 'eas-lat', titulo: 'Latino · EstrenosAnime', ref: 'eas-lat', camino: '/ultimo-latino' },
      { id: 'eas-popular', titulo: 'Popular · EstrenosAnime', ref: 'eas-popular', camino: '/popular' },
      /* v0.6.5: dos riel más para que la sección no se sienta vacía. */
      { id: 'eas-peliculas', titulo: 'Películas · EstrenosAnime', ref: 'eas-peliculas', camino: '/tipo/Pelicula' },
      { id: 'eas-actualizados', titulo: 'Actualizados · EstrenosAnime', ref: 'eas-actualizados', camino: '/ultimo-actualizado' },
      /* v0.6.24: páginas verificadas por sonda v39c — /tipo/OVA,
       * /tipo/Especial y /estado/En+Emision responden 200 con fichas
       * (hrefs relativos /anime/<slug>, que easFichas ya entiende).
       * /tipo/OVA/page/2/ responde 404: una página por hoja, honesto. */
      { id: 'eas-ova', titulo: 'OVAs · EstrenosAnime', ref: 'eas-ova', camino: '/tipo/OVA' },
      { id: 'eas-especial', titulo: 'Especiales · EstrenosAnime', ref: 'eas-especial', camino: '/tipo/Especial' },
      { id: 'eas-emision', titulo: 'En emisión · EstrenosAnime', ref: 'eas-emision', camino: '/estado/En+Emision' }
    ];
    /* v0.6.26: en «Todas» solo se consulta el núcleo (tope de Kino:
     * 60 peticiones por llamada — la 0.6.25 lo reventó). */
    if (solo === true) {
      const nucleo = NUCLEO_TODAS.eas;
      if (nucleo) defs = defs.filter(function (d) { return nucleo.indexOf(d.id) >= 0; });
    }
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
    else if (ref === 'eas-peliculas') camino = '/tipo/Pelicula';
    else if (ref === 'eas-actualizados') camino = '/ultimo-actualizado';
    else if (ref === 'eas-ova') camino = '/tipo/OVA';
    else if (ref === 'eas-especial') camino = '/tipo/Especial';
    else if (ref === 'eas-emision') camino = '/estado/En+Emision';
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
    /* v0.6.4: los servidores se piden por AJAX y el multiserver nuevo
     * suelta sus opciones por su propio endpoint de descifre — sin
     * tocar nada. Si la puerta cambia, queda la captura del episodio. */
    const servers = (await easServersDe(r.text)).concat(servidoresDePagina(r.text));
    return await probarConCaptura(epUrl, servers, idx, function (i) {
      return 'eas:' + slug + ':' + num + ':' + i;
    }, 'EstrenosAnime', BASE_EAS);
  }
});

/* ---------- fuente: AnimeJara (henaojara2.com -> animejara.com) ---------- */

/* v0.6.9 «El cambiazo»: entra AnimeJara (el animejara.com de siempre,
 * conocido por su puerta henaojara2.com). Sus tarjetas enlazan fichas
 * /anime/<slug> y el póster de verdad vive DENTRO del ancla, después
 * de las banderitas de idioma (img japones.png y compañía): se reconoce
 * por su dominio hj.animejara.com, no por ser el primer img. Las fichas
 * traen pestañas de temporada («data-season» + «N episodios») y los
 * episodios siguen el patrón /episode/<slug>-<temporada>x<numero>/; el
 * player de cada episodio es un multiserver propio (streamhj.top) que
 * lista sus hosters en onclick playVideo('URL'). */
const BASE_JARA = 'https://animejara.com';

function jaraTarjetas(html) {
  const re = /<a\b[^>]*href\s*=\s*["'][^"']*\/anime\/([^"\/?#]+)[^>]*>([\s\S]{0,1600}?)<\/a>/gi;
  const items = [];
  const vistos = new Set();
  let m;
  while ((m = re.exec(String(html || ''))) && items.length < 40) {
    const slug = m[1];
    if (!slug || vistos.has(slug)) continue;
    const ventana = m[2];
    /* El póster de verdad es el img de hj.animejara.com; las banderitas
     * de idioma (wp-content/uploads) también son img dentro del ancla y
     * llegan primero: se saltan. */
    let poster = '';
    let titulo = '';
    const imgRe = /<img\b([^>]*)>/gi;
    let im;
    while ((im = imgRe.exec(ventana))) {
      const attrs = im[1];
      const src = /src\s*=\s*["']([^"']+)["']/i.exec(attrs);
      if (!src) continue;
      if (/hj\.animejara\.com/i.test(src[1])) {
        poster = src[1];
        const alt = /alt\s*=\s*["']([^"']{2,})["']/i.exec(attrs);
        if (alt) titulo = decHtml(alt[1]);
        break;
      }
    }
    /* v0.6.11: las tarjetas del catálogo (anime-grid) traen la ficha
     * completa en el atributo data-anime — un JSON con «titulo» y
     * «poster» vestido de &quot; y barras escapadas — y su imagen puede
     * quedar fuera de la ventana del ancla: si el img hj no apareció,
     * se lee el data-anime del propio ancla. Sin esto, del catálogo
     * solo se parseaba el top-10 lateral (Death Note y compañía). */
    if (!poster) {
      const da = /data-anime="([^"]*)"/i.exec(m[0]) || /data-anime='([^']*)'/i.exec(m[0]);
      if (da) {
        const json = da[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        const pm = /"poster"\s*:\s*"([^"]+)"/i.exec(json);
        if (pm) poster = pm[1].replace(/\\\//g, '/');
        const tm = /"titulo"\s*:\s*"([^"]+)"/i.exec(json);
        if (tm) {
          titulo = decHtml(tm[1].replace(/\\u([0-9a-fA-F]{4})/g, function (x, h) {
            return String.fromCharCode(parseInt(h, 16));
          }));
        }
      }
    }
    if (!poster) continue;
    vistos.add(slug);
    if (!titulo || titulo.length < 2) titulo = slugATitulo(slug);
    items.push({
      id: 'jara-' + slug,
      ref: 'jara:' + slug,
      title: titulo.slice(0, 200),
      poster: absolutizar(poster, BASE_JARA),
      kind: 'series'
    });
  }
  return items;
}

registrarFuente({
  id: 'jara',
  etiqueta: 'AnimeJara',

  async buscar(q) {
    const texto = String(q || '').trim().slice(0, 100);
    if (texto.length < 2) return [];
    try {
      const r = await traer(BASE_JARA + '/?s=' + encodeURIComponent(texto), { headers: { Referer: BASE_JARA + '/' }, timeoutMs: 10000 });
      if (!r.ok) return [];
      const items = jaraTarjetas(r.text).slice(0, 25);
      for (const it of items) it.badges = ['AnimeJara'];
      return items;
    } catch (e) {
      log('jara buscar', (e && e.message) || String(e));
      return [];
    }
  },

  async portada(solo) {
    let defs = [
      { id: 'jara-emision', titulo: 'En emisión · AnimeJara', ref: 'jara-emision', camino: '/emision' },
      { id: 'jara-catalogo', titulo: 'Catálogo · AnimeJara', ref: 'jara-catalogo', camino: '/catalogo' },
      /* v0.6.24: géneros verificados por sonda v39 — todos responden
       * 200 y pagan con /genero/<slug>/page/N/ (estilo WordPress). */
      { id: 'jara-genero-accion', titulo: 'Acción · AnimeJara', ref: 'jara-genero-accion', camino: '/genero/accion' },
      { id: 'jara-genero-romance', titulo: 'Romance · AnimeJara', ref: 'jara-genero-romance', camino: '/genero/romance' },
      { id: 'jara-genero-comedia', titulo: 'Comedia · AnimeJara', ref: 'jara-genero-comedia', camino: '/genero/comedia' },
      { id: 'jara-genero-drama', titulo: 'Drama · AnimeJara', ref: 'jara-genero-drama', camino: '/genero/drama' }
    ];
    /* v0.6.26: en «Todas» solo se consulta el núcleo (tope de Kino:
     * 60 peticiones por llamada — la 0.6.25 lo reventó). */
    if (solo === true) {
      const nucleo = NUCLEO_TODAS.jara;
      if (nucleo) defs = defs.filter(function (d) { return nucleo.indexOf(d.id) >= 0; });
    }
    const rtas = await Promise.all(defs.map(async (def) => {
      try {
        const r = await traer(BASE_JARA + def.camino, { headers: { Referer: BASE_JARA + '/' }, timeoutMs: 10000 });
        if (!r.ok) return null;
        const items = jaraTarjetas(r.text).slice(0, 20);
        return items.length ? { id: def.id, title: def.titulo, ref: def.ref, items: items } : null;
      } catch (e) {
        log('jara fila «' + def.titulo + '» falló', (e && e.message) || String(e));
        return null;
      }
    }));
    const filas = [];
    for (const fila of rtas) if (fila) filas.push(fila);
    return filas;
  },

  async hoja(ref, cursor) {
    const caminos = {
      'jara-emision': '/emision',
      'jara-catalogo': '/catalogo',
      'jara-genero-accion': '/genero/accion',
      'jara-genero-romance': '/genero/romance',
      'jara-genero-comedia': '/genero/comedia',
      'jara-genero-drama': '/genero/drama'
    };
    const camino = caminos[ref];
    if (!camino) return null;
    /* v0.6.11: el catálogo pagina con ?page=N — aprendido de sonda: la
     * página 2 responde 200 con títulos distintos; ?pagina=N se ignora
     * y /catalogo/page/2/ miente con su 404-con-contenido. Mientras una
     * página traiga un buen puñado de tarjetas, hay siguiente.
     * v0.6.24: los géneros pagan con /genero/<slug>/page/N/ (sonda v39:
     * WordPress de verdad, página 2 con primer item distinto). Y ojo:
     * las 404 de AnimeJara traen ~100 anclas de anime (la barra lateral
     * popular) — por eso una página de error se corta por ESTADO, no
     * por contenido. */
    const pag = parseInt(cursor, 10);
    const num = Number.isFinite(pag) && pag > 1 ? pag : 1;
    const esGenero = ref.indexOf('jara-genero-') === 0;
    let url;
    if (num > 1 && ref === 'jara-catalogo') url = BASE_JARA + camino + '?page=' + num;
    else if (num > 1 && esGenero) url = BASE_JARA + camino + '/page/' + num + '/';
    else url = BASE_JARA + camino;
    const r = await traer(url, { headers: { Referer: BASE_JARA + '/' }, timeoutMs: 12000 });
    if (!r.ok) {
      /* fin de riel callado: el género llegó a su última página y el
       * sitio contestó 404 — la hoja se cierra sin escándalo. */
      if (num > 1 && esGenero) return { items: [], next: null };
      throw kino.error('unavailable', 'AnimeJara no respondió (status ' + r.status + ')', {
        userMessage: 'AnimeJara no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    const items = jaraTarjetas(r.text).slice(0, 60);
    let next = null;
    if ((ref === 'jara-catalogo' || esGenero) && items.length >= 12) next = String(num + 1);
    return { items: items, next: next };
  },

  async detalle(slug) {
    const r = await traer(BASE_JARA + '/anime/' + slug, { headers: { Referer: BASE_JARA + '/' }, timeoutMs: 10000 });
    if (!r.ok || !r.text) return null;
    const serie = { title: slugATitulo(slug) };
    const h = /<h1[^>]*>([\s\S]{1,300}?)<\/h1>/i.exec(r.text);
    if (h) serie.title = limpio(h[1]) || serie.title;
    const og = /property=["']og:image["'][^>]*content=["']([^"']+)["']/i.exec(r.text);
    if (og) serie.poster = og[1].indexOf('//') === 0 ? 'https:' + og[1] : og[1];
    if (!serie.poster) {
      const pj = /hj\.animejara\.com\/api-web\/img\/[^"'\s>]+/i.exec(r.text);
      if (pj) serie.poster = 'https://' + pj[0];
    }
    const sinM = /<p[^>]*>([\s\S]{30,600}?)<\/p>/i.exec(r.text);
    if (sinM) serie.overview = limpio(sinM[1]).slice(0, 400);
    return serie;
  },

  async episodios(slug) {
    const r = await traer(BASE_JARA + '/anime/' + slug, { headers: { Referer: BASE_JARA + '/' }, timeoutMs: 12000 });
    if (!r.ok || !r.text) {
      throw kino.error('unavailable', 'AnimeJara no entregó la serie', {
        userMessage: 'AnimeJara no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    /* Los episodios se SINTETIZAN desde las pestañas de temporada: cada
     * «data-season="N"» trae su «M episodios» cerca y los enlaces reales
     * siguen /episode/<slug>-N×M/ sin excepción (la ficha los carga por
     * JavaScript, así que no hay anclas que leer). */
    const texto = r.text;
    const pares = [];
    const tabRe = /data-season=["'](\d+)["']/g;
    let tm;
    while ((tm = tabRe.exec(texto)) && pares.length < 40) {
      const seg = texto.slice(tm.index + tm[0].length, tm.index + tm[0].length + 4000);
      const sm = /(\d+)\s*episodios/i.exec(seg);
      if (sm) pares.push({ season: parseInt(tm[1], 10), count: parseInt(sm[1], 10) });
    }
    if (!pares.length) {
      /* sin pestañas: la cabecera de la ficha dice «N Episodios» */
      const cm = /(\d+)\s*episodios/i.exec(texto);
      if (cm) pares.push({ season: 1, count: Math.min(parseInt(cm[1], 10), 200) });
    }
    if (!pares.length) {
      throw kino.error('not_found', 'AnimeJara: 0 capítulos', {
        userMessage: 'No se pudieron leer los capítulos de esta serie en AnimeJara.'
      });
    }
    const lista = [];
    for (const par of pares) {
      const total = Math.min(par.count, 400);
      for (let n = 1; n <= total; n++) {
        lista.push({
          season: par.season,
          number: n,
          ref: 'jara:' + slug + '-' + par.season + 'x' + n + ':' + n,
          title: 'Episodio ' + n
        });
      }
    }
    return { series: { title: slugATitulo(slug) }, episodes: lista };
  },

  async resolver(epslug, n, idx) {
    const epUrl = BASE_JARA + '/episode/' + epslug + '/';
    /* v0.6.10: AnimeJara sirve esta página con estado 404 y el contenido
     * completo adentro (título, enlaces, iframe): se lee el cuerpo igual
     * y se valida por contenido — un 404 de verdad no trae «enlaces» ni
     * «streamhj», y esos sí se quedan en el error honesto. */
    const r = await traer(epUrl, { headers: { Referer: BASE_JARA + '/' }, timeoutMs: 10000, cuerpoSiempre: true });
    if (!r.text || !/const\s+enlaces|streamhj\.top/i.test(r.text)) {
      throw kino.error('not_found', 'AnimeJara no entregó el episodio', {
        userMessage: 'No se pudo abrir este episodio en AnimeJara.'
      });
    }
    /* El player vive en streamhj.top: la página trae el array «enlaces»
     * (un embed por idioma; japonés, latino, castellano) y su botón
     * correspondiente con el nombre del idioma. Cada embed lista sus
     * hosters en onclick playVideo('URL'). */
    let embeds = [];
    const enlacesM = /const\s+enlaces\s*=\s*\[([\s\S]{0,4000}?)\]/.exec(r.text);
    if (enlacesM) {
      const uRe = /["']([^"']+)["']/g;
      let um;
      while ((um = uRe.exec(enlacesM[1])) && embeds.length < 4) {
        let u = um[1].replace(/\\\//g, '/').replace(/&#0?38;/g, '&');
        if (/streamhj\.top/i.test(u)) embeds.push(u);
      }
    }
    if (!embeds.length) {
      const ifM = /<iframe\b[^>]*src\s*=\s*["']([^"']*streamhj\.top[^"']*)["']/i.exec(r.text);
      if (ifM) embeds.push(ifM[1].replace(/&#0?38;/g, '&'));
    }
    const idiomas = [];
    const idRe = /lang-name["'][^>]*>([^<]{2,20})</gi;
    let idm;
    while ((idm = idRe.exec(r.text)) && idiomas.length < 4) idiomas.push(limpio(idm[1]));
    const servers = [];
    const vistos = {};
    for (let e = 0; e < embeds.length; e++) {
      if (queda() < 12000) break;
      let txtEmb = '';
      try {
        const re2 = await traer(embeds[e], { headers: { Referer: BASE_JARA + '/', 'User-Agent': UA }, timeoutMs: 9000, cuerpoSiempre: true });
        if (re2.text) txtEmb = re2.text;
      } catch (e2) {
        log('embed de AnimeJara falló', (e2 && e2.message) || String(e2));
      }
      if (!txtEmb) continue;
      const sufijo = (embeds.length > 1 && idiomas[e]) ? ' · ' + idiomas[e] : '';
      const pvRe = /playVideo\((?:&quot;|["'])(https?:\/\/(?:[^"'<&]|\&(?!quot;))+)/gi;
      let pm;
      while ((pm = pvRe.exec(txtEmb))) {
        const u = desescapar(pm[1]);
        const tipo = detectarTipo('', u);
        if (!tipo || tipo === 'generic' || tipo === 'multi') continue;
        const clave = tipo + '|' + u;
        if (vistos[clave]) continue;
        vistos[clave] = true;
        servers.push({ nombre: '', url: u, tipo: tipo, sufijo: sufijo });
      }
      log('jara embed ' + (e + 1) + ' de ' + embeds.length + ': ' + servers.length + ' servidores');
    }
    /* v0.6.11: los «multi» que la página trae de propina (los iframes de
     * streamhj) son landings, no reproductores: cada captura se come 20 s
     * y nunca pesca nada (el teléfono lo demostró tres veces seguidas).
     * Los embeds ya entregaron los hosters de verdad; los multis fuera. */
    const todos = servers.concat(servidoresDePagina(r.text).filter(function (s) { return s.tipo !== 'multi'; }));
    return await probarConCaptura(epUrl, todos, idx, function (i) {
      return 'jara:' + epslug + ':' + (n || 1) + ':' + i;
    }, 'AnimeJara', BASE_JARA);
  }
});

/* ---------- fuente: VerAnime (veranime.ninja, tema Dooplay) ---------- */

/* v0.6.9 «El cambiazo»: entra VerAnime, un Dooplay de los de siempre:
 * tarjetas /anime/<slug>/ con pósters de tmdb, fichas con temporadas y
 * anclas /ver/<slug>-episodio-N/. OJO: sus atributos van con comillas
 * simples (li data-post='…'), por eso los greques dobles no los veían.
 * El player se sirve por el endpoint wp-json/dooplayer/v2/<post>/<tipo>/
 * <nume> y su multiserver es darkanimes.com, pariente del saidochesto:
 * lista sus hosters en onclick('URL'). */
const BASE_VAN = 'https://veranime.ninja';

function vanTarjetas(html) {
  const re = /<a\b[^>]*href\s*=\s*["'][^"']*\/(?:anime|pelicula)\/([^"\/?#]+)[^>]*>([\s\S]{0,900}?)<\/a>/gi;
  const items = [];
  const indice = {};
  let m;
  while ((m = re.exec(String(html || ''))) && items.length < 40) {
    const slug = m[1];
    if (!slug) continue;
    let poster = posterEnVentana(m[2]);
    if (!poster) poster = posterAntesDe(String(html || ''), m.index);
    if (!poster) continue;
    poster = absolutizar(poster, BASE_VAN);
    let titulo = '';
    const h = /<h[1-6][^>]*>([\s\S]{1,200}?)<\/h[1-6]>/i.exec(m[2]);
    if (h) titulo = limpio(h[1]);
    if (!titulo) {
      const al = /alt\s*=\s*["']([^"']{2,})["']/i.exec(m[2]);
      if (al) titulo = decHtml(al[1]);
    }
    if (!titulo) {
      /* el ancla del h3 trae el título como texto pelado (Dooplay:
       * <h3><a href>Título</a></h3>) */
      const tx = limpio(m[2].replace(/<[^>]+>/g, ' '));
      if (tx.length >= 2 && tx.length <= 200) titulo = tx;
    }
    const esPelicula = /\/pelicula\//.test(m[0]);
    const existe = indice[slug];
    if (!existe) {
      if (!titulo || titulo.length < 2) titulo = slugATitulo(slug);
      const item = {
        id: 'van-' + slug,
        ref: 'van:' + slug,
        title: titulo.slice(0, 200),
        poster: poster,
        kind: esPelicula ? 'movie' : 'series'
      };
      indice[slug] = item;
      items.push(item);
    } else if (titulo && titulo.length >= 2) {
      /* el ancla del h3 llega después del ancla del póster: mejora el
       * título que el primer ancla no traía */
      existe.title = titulo.slice(0, 200);
      if (esPelicula) existe.kind = 'movie';
    }
  }
  return items;
}

async function vanFicha(slug) {
  const a = await traer(BASE_VAN + '/anime/' + slug + '/', { headers: { Referer: BASE_VAN + '/' }, timeoutMs: 10000 });
  if (a.ok && a.text) return a;
  const o = await traer(BASE_VAN + '/online/' + slug + '/', { headers: { Referer: BASE_VAN + '/' }, timeoutMs: 10000 });
  if (o.ok && o.text) return o;
  const p = await traer(BASE_VAN + '/pelicula/' + slug + '/', { headers: { Referer: BASE_VAN + '/' }, timeoutMs: 10000 });
  return p;
}

/* El dooplayer de VerAnime: cada li (con comillas simples o dobles) trae
 * data-post, data-nume y data-type. v0.6.12: la API v2 REST responde 200
 * con el cuerpo VACÍO (la sonda lo probó con todas sus variantes) — el
 * tema usa la puerta admin-ajax: POST a /wp-admin/admin-ajax.php con
 * action doo_player_ajax y {post, nume, type}, que sí devuelve el
 * {"embed_url":...}. El embed de darkanimes.com es un multiserver-pro:
 * botones msp-server con data-url cifrado (base64 de la URL XORada con
 * la pk de su API) repartidos en listas por idioma (data-lang 1 Latino,
 * 2 Castellano, 3 Subtitulado). */
async function vanServersDe(html) {
  const texto = String(html || '');
  const servers = [];
  const vistos = {};
  const opciones = [];
  const liRe = /<li\b[^>]*>[\s\S]{0,400}?<\/li>/gi;
  let m;
  while ((m = liRe.exec(texto)) && opciones.length < 8) {
    const tag = m[0];
    if (!/dooplay_player_option/.test(tag)) continue;
    const post = /\bdata-post\s*=\s*["']([^"']+)["']/i.exec(tag);
    const nume = /\bdata-nume\s*=\s*["']([^"']+)["']/i.exec(tag);
    const tipo = /\bdata-type\s*=\s*["']([^"']+)["']/i.exec(tag);
    const sv = /class\s*=\s*["'][^"']*server[^"']*["'][^>]*>([^<]{0,50})</i.exec(tag);
    if (!post || !nume) continue;
    opciones.push({
      post: post[1], nume: nume[1], tipo: tipo ? tipo[1] : 'tv',
      nombre: sv ? sv[1].replace(/\s+/g, ' ').trim() : ''
    });
  }
  if (!opciones.length) return servers;
  log('van: ' + opciones.length + ' opciones de player');
  for (const o of opciones) {
    if (queda() < 6000) break;
    let embed = '';
    /* v0.6.12: la puerta buena es el admin-ajax del tema; la v2 queda
     * de respaldo por si el sitio vuelve a ella. */
    try {
      const r = await traer(BASE_VAN + '/wp-admin/admin-ajax.php', {
        metodo: 'POST',
        form: { action: 'doo_player_ajax', post: o.post, nume: o.nume, type: o.tipo },
        headers: { Referer: BASE_VAN + '/', 'User-Agent': UA, 'X-Requested-With': 'XMLHttpRequest' },
        timeoutMs: 8000
      });
      if (r.ok && r.text) {
        const em = /["']embed_url["']\s*:\s*["']([^"']+)["']/.exec(r.text);
        if (em) embed = desescapar(em[1]).replace(/\\\//g, '/');
        else log('van doo_player_ajax: status ' + r.status + ', ' + r.text.length + ' letras sin embed_url');
      } else {
        log('van doo_player_ajax: status ' + (r ? r.status : 'null') + (r && r.text ? ', ' + r.text.length + ' letras' : ''));
      }
    } catch (e) {
      log('van doo_player_ajax falló', (e && e.message) || String(e));
    }
    if (!embed) {
      try {
        const r = await traer(BASE_VAN + '/wp-json/dooplayer/v2/' + encodeURIComponent(o.post) +
          '/' + encodeURIComponent(o.tipo) + '/' + encodeURIComponent(o.nume),
          { headers: { Referer: BASE_VAN + '/', 'User-Agent': UA }, timeoutMs: 8000 });
        if (!r.ok || !r.text) continue;
        const em = /["']embed_url["']\s*:\s*["']([^"']+)["']/.exec(r.text);
        if (em) embed = desescapar(em[1]).replace(/\\\//g, '/');
      } catch (e) { continue; }
    }
    if (!embed) continue;
    if (embed.indexOf('//') === 0) embed = 'https:' + embed;
    if (!/^https?:\/\//i.test(embed)) continue;
    if (/darkanimes\.com|saidochesto|multiserver|streamhj\.top/i.test(embed)) {
      /* multiserver-pro: los botones traen data-url cifrado y la clave
       * vive en la API que anuncia el div #msp (data-api). Respaldos:
       * el onclick('URL') de siempre y, si nada, fuera. */
      try {
        const r2 = await traer(embed, { headers: { Referer: BASE_VAN + '/', 'User-Agent': UA }, timeoutMs: 9000 });
        if (!r2.ok || !r2.text) { log('van multiserver: status ' + r2.status); continue; }
        let pk = '';
        const apiM = /data-api\s*=\s*["']([^"']+)["']/i.exec(r2.text);
        if (apiM) {
          try {
            const r3 = await traer(apiM[1], { headers: { Referer: origenDe(embed) + '/', 'User-Agent': UA }, timeoutMs: 8000 });
            if (r3.ok && r3.text) {
              const pkM = /["']pk["']\s*:\s*["']([^"']+)["']/.exec(r3.text);
              if (pkM) pk = pkM[1];
              else log('van API del multiserver: sin pk (' + r3.text.length + ' letras)');
            } else {
              log('van API del multiserver: status ' + (r3 ? r3.status : 'null'));
            }
          } catch (e3) {
            log('van API del multiserver falló', (e3 && e3.message) || String(e3));
          }
        }
        let sacados = 0;
        if (pk) {
          const ulRe = /<ul\b[^>]*msp-list[^>]*data-lang\s*=\s*["'](\d+)["'][^>]*>([\s\S]*?)<\/ul>/gi;
          let ul;
          while ((ul = ulRe.exec(r2.text)) && sacados < 12) {
            const suf = ul[1] === '2' ? ' · CASTELLANO' : ul[1] === '3' ? ' · SUBTITULADO' : ' · LATINO';
            const liRe2 = /<li\b[^>]*>[\s\S]*?<\/li>/gi;
            let li;
            while ((li = liRe2.exec(ul[2])) && sacados < 12) {
              const du = /data-url\s*=\s*["']([^"']+)["']/i.exec(li[0]);
              if (!du) continue;
              const u = descifrarMsp(du[1], pk);
              if (!u) continue;
              const nomM = /msp-server-name[^>]*>([^<]{1,60})</i.exec(li[0]);
              const tipo = detectarTipo(nomM ? nomM[1] : '', u);
              if (!tipo || tipo === 'generic' || tipo === 'multi') continue;
              const clave = tipo + '|' + u;
              if (vistos[clave]) continue;
              vistos[clave] = true;
              servers.push({ nombre: (nomM ? limpio(nomM[1]) : ''), url: u, tipo: tipo, sufijo: suf });
              sacados++;
            }
          }
        }
        if (!sacados) {
          /* respaldo viejo: onclick('URL') a lo saidochesto */
          const odRe = /\(\s*['"](https?:\/\/[^'"]+)['"]\s*\)/gi;
          while ((m = odRe.exec(r2.text))) {
            const u = desescapar(m[1]);
            const tipo = detectarTipo('', u);
            if (!tipo || tipo === 'generic' || tipo === 'multi') continue;
            const clave = tipo + '|' + u;
            if (vistos[clave]) continue;
            vistos[clave] = true;
            servers.push({ nombre: '', url: u, tipo: tipo });
            sacados++;
          }
        }
        log('van multiserver: ' + sacados + ' servidores');
      } catch (e) {
        log('multiserver de VerAnime falló', (e && e.message) || String(e));
      }
    } else {
      const tipo = detectarTipo(o.nombre, embed);
      if (!tipo || tipo === 'generic') continue;
      const clave = tipo + '|' + embed;
      if (vistos[clave]) continue;
      vistos[clave] = true;
      servers.push({ nombre: o.nombre, url: embed, tipo: tipo });
    }
  }
  return servers;
}

registrarFuente({
  id: 'van',
  etiqueta: 'VerAnime',

  async buscar(q) {
    const texto = String(q || '').trim().slice(0, 100);
    if (texto.length < 2) return [];
    try {
      const r = await traer(BASE_VAN + '/?s=' + encodeURIComponent(texto), { headers: { Referer: BASE_VAN + '/' }, timeoutMs: 10000 });
      if (!r.ok) return [];
      const items = vanTarjetas(r.text).slice(0, 25);
      for (const it of items) it.badges = ['VerAnime'];
      return items;
    } catch (e) {
      log('van buscar', (e && e.message) || String(e));
      return [];
    }
  },

  async portada(solo) {
    /* v0.6.13 «El escaparate»: el Inicio de VerAnime crece — el riel
     * «Anime» de siempre más un riel por género, verificados por sonda
     * uno a uno (accion 36 páginas, comedia 39, fantasia 40, aventura
     * 32, drama 26, romance 19; shonen/escolar/peliculas NO existen y
     * se quedan fuera). Cada riel trae 20 tarjetas y su «Ver más»
     * pagina en /genero/<slug>/page/N/. */
    let defs = [
      { id: 'van-anime', titulo: 'Anime · VerAnime', ref: 'van-anime', genero: 'ver-anime' },
      { id: 'van-genero-accion', titulo: 'Acción · VerAnime', ref: 'van-genero-accion', genero: 'accion' },
      { id: 'van-genero-aventura', titulo: 'Aventura · VerAnime', ref: 'van-genero-aventura', genero: 'aventura' },
      { id: 'van-genero-fantasia', titulo: 'Fantasía · VerAnime', ref: 'van-genero-fantasia', genero: 'fantasia' },
      { id: 'van-genero-comedia', titulo: 'Comedia · VerAnime', ref: 'van-genero-comedia', genero: 'comedia' },
      { id: 'van-genero-drama', titulo: 'Drama · VerAnime', ref: 'van-genero-drama', genero: 'drama' },
      { id: 'van-genero-romance', titulo: 'Romance · VerAnime', ref: 'van-genero-romance', genero: 'romance' },
      /* v0.6.24 «El escaparate lleno»: la sonda v39b listó los 60
       * géneros vivos del sitio — estos 7 respondieron 200 con
       * tarjetas (shounen/escolar/peliculas ya se sabía que NO: los
       * slugs del dump son los buenos). */
      { id: 'van-genero-shounen', titulo: 'Shounen · VerAnime', ref: 'van-genero-shounen', genero: 'shounen' },
      { id: 'van-genero-seinen', titulo: 'Seinen · VerAnime', ref: 'van-genero-seinen', genero: 'seinen' },
      { id: 'van-genero-isekai', titulo: 'Isekai · VerAnime', ref: 'van-genero-isekai', genero: 'isekai' },
      { id: 'van-genero-mecha', titulo: 'Mecha · VerAnime', ref: 'van-genero-mecha', genero: 'mecha' },
      { id: 'van-genero-misterio', titulo: 'Misterio · VerAnime', ref: 'van-genero-misterio', genero: 'misterio' },
      { id: 'van-genero-psicologico', titulo: 'Psicológico · VerAnime', ref: 'van-genero-psicologico', genero: 'psicologico' },
      { id: 'van-genero-sobrenatural', titulo: 'Sobrenatural · VerAnime', ref: 'van-genero-sobrenatural', genero: 'sobrenatural' },
      /* v0.6.24: /pelicula/ responde 200 con tarjetas de película
       * (vanTarjetas ya las marca kind 'movie' y vanFicha rebota a
       * /pelicula/<slug>/) y pagina con «Página X de Y» igual que los
       * géneros. */
      { id: 'van-peliculas', titulo: 'Películas · VerAnime', ref: 'van-peliculas', camino: '/pelicula/' }
    ];
    /* v0.6.26: en «Todas» solo se consulta el núcleo (tope de Kino:
     * 60 peticiones por llamada — la 0.6.25 lo reventó). */
    if (solo === true) {
      const nucleo = NUCLEO_TODAS.van;
      if (nucleo) defs = defs.filter(function (d) { return nucleo.indexOf(d.id) >= 0; });
    }
    const rtas = await Promise.all(defs.map(async (def) => {
      try {
        const destino = def.camino || ('/genero/' + def.genero + '/');
        const r = await traer(BASE_VAN + destino, { headers: { Referer: BASE_VAN + '/' }, timeoutMs: 11000, cuerpoSiempre: true });
        let items = r && r.ok ? vanTarjetas(r.text).slice(0, 20) : [];
        /* v0.6.10 conservada: SOLO el riel «Anime» conserva su respaldo
         * en la home del sitio — es el género maestro; los demás viven
         * o mueren por su género, con bitácora honesta. */
        if (!items.length && def.ref === 'van-anime') {
          try {
            const h = await traer(BASE_VAN + '/', { headers: { Referer: BASE_VAN + '/' }, timeoutMs: 10000, cuerpoSiempre: true });
            if (h.ok) items = vanTarjetas(h.text).slice(0, 20);
            if (!items.length && h.text) {
              log('van home: status ' + h.status + ', ' + h.text.length + ' letras, 0 tarjetas');
            }
          } catch (e2) {
            log('van home falló', (e2 && e2.message) || String(e2));
          }
        }
        if (!items.length) {
          if (r && r.text) {
            log('van fila «' + def.genero + '»: status ' + r.status + ', ' + r.text.length + ' letras, 0 tarjetas' +
              (/cloudflare|just a moment|cf-chl/i.test(r.text) ? ' (huele a reto de Cloudflare)' : ''));
          } else {
            log('van fila «' + def.genero + '» no respondió (status ' + (r ? r.status : 'null') + ')');
          }
        }
        return items.length ? { id: def.id, title: def.titulo, ref: def.ref, items: items } : null;
      } catch (e) {
        log('van fila «' + def.titulo + '» falló', (e && e.message) || String(e));
        return null;
      }
    }));
    const filas = [];
    for (const fila of rtas) if (fila) filas.push(fila);
    return filas;
  },

  async hoja(ref, cursor) {
    /* v0.6.13: cada riel de género abre su propio /genero/<slug>/ y
     * pagina con /genero/<slug>/page/N/ (verificado por sonda: la
     * página 2 responde 200 con 69 anclas, igual que la 1).
     * v0.6.24: «Películas» hace lo propio con /pelicula/ (sonda v39:
     * página 2 con «Página X de Y» y tarjetas distintas). */
    let base = null;
    if (ref === 'van-peliculas') base = '/pelicula';
    else if (ref === 'van-anime') base = '/genero/ver-anime';
    else if (ref.indexOf('van-genero-') === 0) base = '/genero/' + ref.slice('van-genero-'.length);
    if (!base) return null;
    const pagina = parseInt(cursor, 10);
    const num = Number.isFinite(pagina) && pagina > 1 ? pagina : 1;
    const camino = num > 1 ? base + '/page/' + num + '/' : base + '/';
    const r = await traer(BASE_VAN + camino, { headers: { Referer: BASE_VAN + '/' }, timeoutMs: 12000 });
    if (!r.ok) {
      throw kino.error('unavailable', 'VerAnime no respondió (status ' + r.status + ')', {
        userMessage: 'VerAnime no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    const items = vanTarjetas(r.text).slice(0, 60);
    let next = null;
    const pg = /P[áa]gina\s+(\d+)\s+de\s+(\d+)/i.exec(r.text);
    if (pg && parseInt(pg[1], 10) < parseInt(pg[2], 10)) next = String(parseInt(pg[1], 10) + 1);
    return { items: items, next: next };
  },

  async detalle(slug) {
    const r = await vanFicha(slug);
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
    const r = await vanFicha(slug);
    if (!r.ok || !r.text) {
      throw kino.error('unavailable', 'VerAnime no entregó la serie', {
        userMessage: 'VerAnime no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    /* Dooplay de siempre: cada li de temporada trae «numerando» (temp -
     * número) y el ancla /ver/<slug>-episodio-N/. */
    const texto = r.text;
    const vistos = new Set();
    const lista = [];
    const liRe = /<li\b[^>]*>[\s\S]{0,700}?<\/li>/gi;
    let m;
    while ((m = liRe.exec(texto)) && lista.length < 400) {
      const tag = m[0];
      const em = /href\s*=\s*["'][^"']*\/ver\/([^"'\/?#]+)-episodio-(\d+)\/?["']/i.exec(tag);
      if (!em) continue;
      const epslug = em[1] + '-episodio-' + em[2];
      const num = parseInt(em[2], 10);
      if (vistos.has(epslug) || num < 1 || num > 9999) continue;
      vistos.add(epslug);
      let season = 1;
      const nm = /(\d+)\s*-\s*(\d+)/.exec(limpio(tag));
      if (nm && parseInt(nm[2], 10) === num) season = parseInt(nm[1], 10);
      lista.push({ season: season, number: num, ref: 'van:' + epslug + ':' + num, title: 'Episodio ' + num });
    }
    if (!lista.length) {
      /* sin anclas de episodio puede ser una PELÍCULA: su ficha trae el
       * dooplayer a cuestas y se lista como único episodio. */
      if (/dooplay_player_option/.test(texto)) {
        return {
          series: { title: slugATitulo(slug) },
          episodes: [{ season: 1, number: 1, ref: 'van:' + slug + ':1', title: 'Película' }]
        };
      }
      throw kino.error('not_found', 'VerAnime: 0 capítulos', {
        userMessage: 'No se pudieron leer los capítulos de esta serie en VerAnime.'
      });
    }
    lista.sort(function (a, b) { return a.season - b.season || a.number - b.number; });
    return { series: { title: slugATitulo(slug) }, episodes: lista };
  },

  async resolver(epslug, n, idx) {
    let epUrl = BASE_VAN + '/ver/' + epslug + '/';
    let r = await traer(epUrl, { headers: { Referer: BASE_VAN + '/', 'User-Agent': UA }, timeoutMs: 10000 });
    /* si la página de episodio no existe, puede ser una PELÍCULA: su
     * ficha lleva el dooplayer a cuestas. */
    if (!r.ok || !r.text) {
      const p = await vanFicha(epslug);
      if (p.ok && p.text) {
        r = p;
        epUrl = p.url || epUrl;
      }
    }
    if (!r.ok || !r.text) {
      throw kino.error('not_found', 'VerAnime no entregó el episodio', {
        userMessage: 'No se pudo abrir este episodio en VerAnime.'
      });
    }
    const servers = (await vanServersDe(r.text)).concat(servidoresDePagina(r.text));
    return await probarConCaptura(epUrl, servers, idx, function (i) {
      return 'van:' + epslug + ':' + (n || 1) + ':' + i;
    }, 'VerAnime', BASE_VAN);
  }
});

/* ---------- fuente: IvAnime (ivanime.buzz, espejo de ivanime.top) ---------- */

const BASE_IVA = 'https://ivanime.buzz';
/* v0.6.12: el epslug de los capítulos de IvAnime NO es el slug de la
 * serie (la ficha de «…-sub-espanol» enlaza /ver/… SIN el sufijo): el
 * prefijo real se aprende en episodios() y se guarda aquí para que
 * resolver() no vuelva a leer la ficha. */
const IVA_EPS = {};

/* v0.6.13: el póster del héroe de IvAnime se llama como su serie: las
 * URLs de /portada/ llevan el nombre dentro
 * (.../portada/to-aru-anbu-no-item-portada-123.jpg, y a veces sin el
 * «-portada»: tokyo-…-hen-123.jpg — sondeo v31, los dos casos). Con
 * las imágenes de todos los héroes amontonadas a miles de letras de
 * sus anclas, ninguna ventana las alcanza; buscar por nombre sí.
 * v0.6.23 «Sin dobleces»: renombrada — la 0.6.22 declaró su cosecha
 * con el MISMO nombre (ivaPosterDe) y el motor del teléfono (Hermes)
 * no carga un global declarado dos veces («invalid redefinition of
 * global identifier»); el motor del banco deja ganar a la última y
 * el duplicado pasó 43/43. Un global, un nombre. */
function ivaPosterPorNombre(html, slug) {
  const s = String(slug || '');
  if (!s) return '';
  const bases = [s];
  const corto = s.replace(/-(?:sub-)?(?:espanol|castellano|latino)$/i, '');
  if (corto && corto !== s) bases.push(corto);
  const texto = String(html || '');
  for (let i = 0; i < bases.length; i++) {
    try {
      const re = new RegExp('https?:\\/\\/[^\\s\\x27"<>]*\\/portada\\/[^\\s\\x27"<>]*' + bases[i] + '-[^\\s\\x27"<>]*?\\.(?:jpe?g|png|webp)', 'i');
      const m = re.exec(texto);
      if (m) return m[0];
    } catch (e) {}
  }
  return '';
}

/* v0.6.15: el póster de IvAnime viaja como referencia propia
 * ({source:'plugin', handle:<URL>}): Kino le pide los bytes al
 * plugin, que baja la imagen con presentación (Referer + UA, la
 * llave que la sonda v35 encontró: desnudo 403, con Referer 200).
 * Las imágenes de otros hosts viajan peladas como siempre. */
function ivaRefDe(url) {
  const u = String(url || '');
  if (u.indexOf('https://ivanime.buzz/') !== 0) return u || undefined;
  return { source: 'plugin', handle: u };
}

/* v0.6.22 «La ficha en pie»: Kino llama a episodes() en CADA ficha
 * (el log del teléfono lo confiesa: «iva: <slug> -> N capítulos») y
 * el contrato documenta que el póster de una ficha también vive en
 * episodes().series (KinoSeriesInfo: poster acepta la referencia
 * servida, igual que overview). La ficha abierta desde el Inicio
 * llega fría — sin el póster del item — y si ni details() ni su
 * póster pintan, episodes().series es la fuente que Kino SÍ consulta.
 * La cosecha (misma página que episodios ya baja, sin fetch extra):
 * og:image por si un día aparece (la sonda v38 probó que hoy NO
 * existe, en cualquiera de los dos órdenes de atributos), el PULGAR
 * del héroe (/assets/thumbs/imagen/…, 40–90 KB, bajo el tope), y de
 * último una portada grande. */
function ivaPosterDe(html) {
  const texto = String(html || '');
  const og = /property=["']og:image["'][^>]*content=["']([^"']+)["']/i.exec(texto) ||
    /content=["']([^"']+)["'][^>]*property=["']og:image["']/i.exec(texto);
  if (og) {
    const u = og[1].indexOf('//') === 0 ? 'https:' + og[1] : og[1];
    return u || null;
  }
  const pul = /https?:\/\/ivanime\.buzz\/assets\/thumbs\/imagen\/[a-z0-9-]+\.jpe?g(?:\.webp)?/i.exec(texto);
  if (pul) return pul[0];
  const por = /https?:\/\/ivanime\.buzz\/assets\/img\/serie\/portada\/[a-z0-9-]+\.jpe?g/i.exec(texto);
  return por ? por[0] : null;
}

/* La sinopsis de la ficha vive en el primer <p> con cuerpo DESPUÉS
 * del h1 (antes del título hay menús y avisos que también usan <p>). */
function ivaSinopsisDe(html) {
  const texto = String(html || '');
  const h = /<h1[^>]*>([\s\S]{1,300}?)<\/h1>/i.exec(texto);
  const zona = h ? texto.slice(h.index) : texto;
  const sinM = /<p[^>]*>([\s\S]{30,600}?)<\/p>/i.exec(zona);
  return sinM ? limpio(sinM[1]).slice(0, 400) : null;
}

function ivaTarjetas(html) {
  /* v0.6.14: las tarjetas de /emision y /animes son anclas «card-wrap»
   * que llevan TODO dentro (div, imagen, insignias y título) y su
   * cierre </a> cae a ~1600 letras del href — la ventana de 900 las
   * dejaba fuera y las filas salían vacías. La ventana crece a 3000
   * (sonda v33: la longitud del ancla real); en la home los héroes
   * cierran pronto y siguen casando igual. */
  const re = /<a\b[^>]*href\s*=\s*["'][^"']*\/anime\/([^"\/?#]+)[^>]*>([\s\S]{0,3000}?)<\/a>/gi;
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
    /* v0.6.5: el src de sus tarjetas es un anime.png de relleno y el
     * póster de verdad vive en data-src: se mira primero en la ventana
     * con los criterios de siempre y hacia atrás, y se cose con la
     * base porque a veces llega relativo. */
    let poster = posterEnVentana(ventana);
    if (!poster) poster = posterAntesDe(String(html || ''), m.index);
    if (!poster) {
      /* v0.6.12: en la home las tarjetas son los héroes del slider: la
       * imagen vive lejos del ancla (después del título, los géneros y
       * la sinopsis; la sonda la midió a ~1200–2000 letras). Se mira
       * 3500 letras atrás por la última imagen con extensión, y el
       * anime.png de relleno, logos, iconos y botones de play no
       * cuentan. */
      const antes = String(html || '').slice(Math.max(0, m.index - 3500), m.index);
      const urls = antes.match(/https?:\/\/[^\s"'<>]+\.(?:jpe?g|png|webp)(?:\?[^\s"'<>]*)?/gi) || [];
      for (let k = urls.length - 1; k >= 0; k--) {
        if (!/\/img\/anime\.png|logo|icon|playbtn/i.test(urls[k])) { poster = urls[k]; break; }
      }
    }
    if (!poster) {
      /* v0.6.13: en la home de IvAnime las imágenes de los héroes
       * viven TODAS JUNTAS al principio del HTML, a miles de letras de
       * sus anclas — pero cada URL lleva el nombre de la serie en
       * /portada/: se busca por nombre en toda la página (sondeo v31,
       * verificado con y sin el «-portada» en el nombre del archivo). */
      poster = ivaPosterPorNombre(String(html || ''), slug);
    }
    /* v0.6.15: el póster va como referencia servida por el plugin —
     * Kino pide los bytes con nuestra presentación y lo cachea. */
    if (poster) item.poster = ivaRefDe(absolutizar(poster, BASE_IVA));
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
          /* v0.6.17: el slice era de 3 y las refs de aquí llevan el
           * prefijo de 4 letras («iva:», «ayt:») — los resultados de
           * búsqueda salían con doble dos puntos y partirRef los
           * botaba al abrirlos. Astilla vieja de la 0.6.1, curada. */
          const ref = 'iva:' + String(it.ref || '').slice(4);
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

  async portada(solo) {
    /* v0.6.5: la sección se llena con tres rieles (en emisión,
     * directorio y últimos agregados) traídos en paralelo. */
    let defs = [
      { id: 'iva-emision', titulo: 'En emisión · IvAnime', ref: 'iva-emision', camino: '/emision' },
      { id: 'iva-directorio', titulo: 'Directorio · IvAnime', ref: 'iva-directorio', camino: '/animes' },
      { id: 'iva-nuevos', titulo: 'Últimos agregados · IvAnime', ref: 'iva-nuevos', camino: '/' },
      /* v0.6.24: géneros verificados por sonda v39c — responden 200 y
       * pagan con ?p=N (igual que el directorio). */
      { id: 'iva-genero-accion', titulo: 'Acción · IvAnime', ref: 'iva-genero-accion', camino: '/genero/accion' },
      { id: 'iva-genero-romance', titulo: 'Romance · IvAnime', ref: 'iva-genero-romance', camino: '/genero/romance' },
      { id: 'iva-genero-comedia', titulo: 'Comedia · IvAnime', ref: 'iva-genero-comedia', camino: '/genero/comedia' }
    ];
    /* v0.6.26: en «Todas» solo se consulta el núcleo (tope de Kino:
     * 60 peticiones por llamada — la 0.6.25 lo reventó). */
    if (solo === true) {
      const nucleo = NUCLEO_TODAS.iva;
      if (nucleo) defs = defs.filter(function (d) { return nucleo.indexOf(d.id) >= 0; });
    }
    const rtas = await Promise.all(defs.map(async (def) => {
      try {
        /* v0.6.13: las páginas de IvAnime son pesadas (la home pasa de
         * 100 KB) y en el teléfono 9 s se quedaban cortos: la espera
         * crece, el cuerpo se lee aunque el estado mienta y cada fila
         * vacía deja bitácora con estado y tamaño — el log dirá qué
         * pasó (reto, vacío o red). */
        const r = await traer(BASE_IVA + def.camino, { headers: { Referer: BASE_IVA + '/' }, timeoutMs: 13000, cuerpoSiempre: true });
        const items = ivaTarjetas(r.text).slice(0, 20);
        if (!items.length && r.text) {
          log('iva fila «' + def.camino + '»: status ' + r.status + ', ' + r.text.length + ' letras, 0 tarjetas' +
            (/cloudflare|just a moment|cf-chl/i.test(r.text) ? ' (huele a reto de Cloudflare)' : ''));
        } else if (!items.length) {
          log('iva fila «' + def.camino + '» no respondió (status ' + (r ? r.status : 'null') + ')');
        }
        return items.length ? { id: def.id, title: def.titulo, ref: def.ref, items: items } : null;
      } catch (e) {
        log('iva fila «' + def.titulo + '» falló', (e && e.message) || String(e));
        return null;
      }
    }));
    const filas = [];
    for (const fila of rtas) if (fila) filas.push(fila);
    return filas;
  },

  async hoja(ref, cursor) {
    /* v0.6.5: cada riel abre su propio camino.
     * v0.6.24 «El escaparate lleno»: la sonda v39c probó la paginación
     * de IvAnime y la encontró: /animes?p=2 responde 200 con títulos
     * DISTINTOS (!page= no existe; ?p= sí). El directorio y los géneros
     * pagan con ?p=N; /emision y la home no (página 2 idéntica) y
     * quedan de una página, honesto. Fin de riel callado: si una
     * página N ya no existe, la hoja se cierra sin escándalo. */
    const caminos = {
      'iva-emision': '/emision',
      'iva-directorio': '/animes',
      'iva-nuevos': '/',
      'iva-genero-accion': '/genero/accion',
      'iva-genero-romance': '/genero/romance',
      'iva-genero-comedia': '/genero/comedia'
    };
    const camino = caminos[ref];
    if (!camino) return null;
    const paginado = ref === 'iva-directorio' || ref.indexOf('iva-genero-') === 0;
    const pag = parseInt(String(cursor || '1'), 10) || 1;
    const num = paginado && pag > 1 ? pag : 1;
    const r = await traer(BASE_IVA + camino + (paginado && num > 1 ? '?p=' + num : ''), { headers: { Referer: BASE_IVA + '/' }, timeoutMs: 12000 });
    if (!r.ok) {
      if (paginado && num > 1) return { items: [], next: null };
      throw kino.error('unavailable', 'IvAnime no respondió (status ' + r.status + ')', {
        userMessage: 'IvAnime no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    const items = ivaTarjetas(r.text).slice(0, 60);
    let next = null;
    if (paginado && items.length >= 20) next = String(num + 1);
    return { items: items, next: next };
  },

  async detalle(slug) {
    const r = await traer(BASE_IVA + '/anime/' + slug + '/', { headers: { Referer: BASE_IVA + '/' }, timeoutMs: 10000 });
    if (!r.ok || !r.text) return null;
    const serie = { title: slugATitulo(slug) };
    const h = /<h1[^>]*>([\s\S]{1,300}?)<\/h1>/i.exec(r.text);
    if (h) serie.title = limpio(h[1]) || serie.title;
    /* v0.6.21: la sonda v38 midió la ficha real y NO trae og:image.
     * v0.6.22: la cosecha vive en ivaPosterDe (compartida con
     * episodios) y el detalle deja bitácora — un export sin línea
     * en el log es indistinguible de un export muerto. */
    const poster = ivaPosterDe(r.text);
    if (poster) serie.poster = ivaRefDe(poster);
    const sin = ivaSinopsisDe(r.text);
    if (sin) serie.overview = sin;
    log('iva ficha «' + slug + '»: ' + (poster ? 'póster (' + poster.split('/').pop() + ')' : 'sin póster') + (sin ? ' + sinopsis' : ' sin sinopsis'));
    return serie;
  },

  async episodios(slug) {
    const r = await traer(BASE_IVA + '/anime/' + slug + '/', { headers: { Referer: BASE_IVA + '/' }, timeoutMs: 10000 });
    if (!r.ok || !r.text) {
      throw kino.error('unavailable', 'IvAnime no entregó la serie', {
        userMessage: 'IvAnime no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    /* v0.6.12: los capítulos viven en /ver/<epslug>-episodio-N SIN
     * barra final, y el epslug no es el slug de la serie (la ficha de
     * «…-sub-espanol» enlaza /ver/… sin el sufijo). La ficha solo
     * enseña el «Ver ahora» del primer capítulo: de ahí sale el
     * prefijo, y el total se averigua preguntando (un capítulo que no
     * existe da un 404 DE VERDAD, probado por sonda). */
    const em = /href\s*=\s*["'][^"']*\/ver\/([^"'\/?#]+)-episodio-(\d+)/i.exec(r.text);
    if (!em) {
      throw kino.error('not_found', 'IvAnime: 0 capítulos', {
        userMessage: 'No se pudieron leer los capítulos de esta serie en IvAnime.'
      });
    }
    const prefijo = em[1];
    IVA_EPS[slug] = prefijo;
    async function ivaExisteCap(n) {
      try {
        const p = await traer(BASE_IVA + '/ver/' + prefijo + '-episodio-' + n,
          { headers: { Referer: BASE_IVA + '/' }, timeoutMs: 7000 });
        return !!(p && p.ok && p.text && /data-player|Cap\u00edtulo/i.test(p.text));
      } catch (e) { return false; }
    }
    /* sondeo exponencial hacia arriba y búsqueda binaria fina: una
     * serie de 24 cuesta ~6 lecturas, una de 200 ~16. Techo 2000. */
    let total = parseInt(em[2], 10) || 1;
    let salto = 1;
    while (total + salto <= 2000) {
      if (await ivaExisteCap(total + salto)) { total += salto; salto *= 2; }
      else break;
    }
    if (salto > 1) {
      let a = total + 1;
      let b = Math.min(total + salto - 1, 2000);
      while (a <= b) {
        const mid = Math.floor((a + b) / 2);
        if (await ivaExisteCap(mid)) { a = mid + 1; total = mid; }
        else { b = mid - 1; }
      }
    }
    log('iva: ' + slug + ' -> ' + total + ' capítulos (prefijo ' + prefijo + ')');
    const lista = [];
    for (let n = 1; n <= total; n++) {
      lista.push({ season: 1, number: n, ref: 'iva:' + slug + ':' + n, title: 'Episodio ' + n });
    }
    /* v0.6.22 «La ficha en pie»: Kino llama a episodes() en CADA
     * ficha — el póster y la sinopsis viajan también aquí, cosechados
     * de la MISMA página que ya se bajó para contar los capítulos
     * (sin fetch extra). La ficha fría — abierta desde el Inicio,
     * sin el póster del item — se viste sola: KinoSeriesInfo
     * documenta poster (referencia servida incluida) y overview. */
    const serie = { title: slugATitulo(slug) };
    const poster = ivaPosterDe(r.text);
    if (poster) serie.poster = ivaRefDe(poster);
    const sin = ivaSinopsisDe(r.text);
    if (sin) serie.overview = sin;
    if (poster) log('iva ficha «' + slug + '»: póster en episodes().series (' + poster.split('/').pop() + ')');
    return { series: serie, episodes: lista };
  },

  async resolver(slug, n, idx) {
    const num = n || 1;
    /* v0.6.12: el epslug real (aprendido en episodios(); si el módulo
     * se acaba de recargar, se relee de la ficha). La URL sin barra
     * final: con la barra el sitio también sirve, pero la buena es la
     * que enseña su propio HTML. */
    let prefijo = IVA_EPS[slug];
    if (!prefijo) {
      const r0 = await traer(BASE_IVA + '/anime/' + slug + '/', { headers: { Referer: BASE_IVA + '/' }, timeoutMs: 10000 });
      const em = r0.ok && r0.text ? /href\s*=\s*["'][^"']*\/ver\/([^"'\/?#]+)-episodio-(\d+)/i.exec(r0.text) : null;
      if (!em) {
        throw kino.error('not_found', 'IvAnime no entregó el episodio', {
          userMessage: 'No se pudo abrir este episodio en IvAnime.'
        });
      }
      prefijo = em[1];
      IVA_EPS[slug] = prefijo;
    }
    const epUrl = BASE_IVA + '/ver/' + prefijo + '-episodio-' + num;
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
    }, 'IvAnime', BASE_IVA);
  }
});

/* ---------- fuente: Az-Animex (www.az-animex.com, descargas vía mirrored.to) ---------- */

const BASE_AZ = 'https://www.az-animex.com';
/* Espejo de lectura: renderiza el JavaScript de mirrored.to (el
 * multilink y la tabla del ?hash= no existen en el HTML crudo) y
 * devuelve la página en texto plano. */
const AZ_JINA = 'https://r.jina.ai/';
/* Los hostid de mirrored.to con su nube (sonda v47: el ?hash= lista
 * 8 nubes, todas «streamable» menos Buzzheavier). El orden es el
 * orden de preferencia del resolve. */
const AZ_HOST_NOMBRE = {
  '156': 'Voe', '149': 'StreamTape', '168': 'StreamWish', '177': 'LuluStream',
  '165': 'Byse', '191': 'VikingFile', '137': 'GoFile', '172': 'Buzzheavier'
};
const AZ_HOST_PREF = ['156', '149', '168', '177', '165', '191', '137', '172'];
/* El multilink se consulta en episodios() y otra vez en resolver():
 * cache corto (10 minutos), como IVA_EPS. */
const AZ_EPS = {};

function azTarjetas(html) {
  const texto = String(html || '');
  const items = [];
  const vistos = new Set();
  /* Fase a: las cards del query loop (géneros) — el <a> de la figura
   * trae el póster (img de /wp-content/uploads/) y el título en el
   * alt (sonda v46: «<figure…><a href=…><img… src=…/106565l.jpg…
   * alt="Gleipnir"»). */
  const reA = /<a href="(https:\/\/www\.az-animex\.com\/([a-z0-9-]+)\/?)"[^>]*>\s*<img\b[^>]*?\bsrc="([^"]+)"[^>]*?\balt="([^"]{0,200})"/gi;
  let m;
  while ((m = reA.exec(texto)) && items.length < 40) {
    const slug = m[2];
    if (!slug || vistos.has(slug) || !/\/uploads\//i.test(m[3])) continue;
    vistos.add(slug);
    items.push({
      id: 'az-' + slug,
      ref: 'az:' + slug,
      title: (decHtml(m[4]).trim() || slugATitulo(slug)).slice(0, 200),
      poster: m[3],
      kind: azKindCerca(texto, m.index)
    });
  }
  if (items.length) return items;
  /* Fase b: listados donde el ancla solo lleva el título (la búsqueda
   * renderiza el h2 entradas-titulo): el póster más cercano hacia
   * atrás, como en EstrenosAnime. */
  const reB = /entradas-titulo[^>]*>\s*<a href="(https:\/\/www\.az-animex\.com\/([a-z0-9-]+)\/?)"[^>]*>([^<]{1,200})<\/a>/gi;
  while ((m = reB.exec(texto)) && items.length < 40) {
    const slug = m[2];
    if (!slug || vistos.has(slug)) continue;
    vistos.add(slug);
    const poster = posterAntesDe(texto, m.index);
    items.push({
      id: 'az-' + slug,
      ref: 'az:' + slug,
      title: (decHtml(m[3]).trim() || slugATitulo(slug)).slice(0, 200),
      poster: poster ? absolutizar(poster, BASE_AZ) : '',
      kind: azKindCerca(texto, m.index)
    });
  }
  return items;
}

/* v0.6.29 «El bibliotecario»: el catálogo COMPLETO de az por el
 * REST API de WordPress — 1831 fichas ordenadas A-Z, 40 por
 * página (sonda v51: el endpoint es público y no pide cuenta;
 * los títulos viajan en title.rendered y a veces traen corchetes
 * promocionales como «[Oshi no Ko]» que se pelan igual que el
 * h1 de la ficha). Sin póster: la API no lo trae y la ficha
 * viste el suyo al abrirse. */
async function azDirectorio(pag) {
  const num = Number.isFinite(pag) && pag > 0 ? pag : 1;
  const url = BASE_AZ + '/wp-json/wp/v2/posts?per_page=40&orderby=title&order=asc&page=' + num + '&_fields=slug,title';
  const r = await traer(url, { headers: { Referer: BASE_AZ + '/', Accept: 'application/json,*/*' }, timeoutMs: 12000 });
  if (!r.ok || !r.text) return { items: [], next: null };
  let j = null;
  try { j = JSON.parse(r.text); } catch (e) { j = null; }
  if (!Array.isArray(j)) return { items: [], next: null };
  const items = [];
  const vistos = new Set();
  for (const p of j) {
    const slug = p && p.slug;
    if (!slug || vistos.has(slug)) continue;
    const tit = limpio((p.title && p.title.rendered) || '').replace(/^\[/, '').replace(/\]\s*$/, '').trim();
    vistos.add(slug);
    items.push({
      id: 'az-' + slug,
      ref: 'az:' + slug,
      title: (tit || slugATitulo(slug)).slice(0, 200),
      kind: 'series'
    });
  }
  /* X-WP-Total es 1831 (46 páginas de 40): mientras la página
   * venga llena, hay más biblioteca detrás. */
  return { items: items, next: items.length >= 40 ? String(num + 1) : null };
}

/* v0.6.29: el kind de verdad vive en la clase del <li> que
 * envuelve la tarjeta (tipo-pelicula / tipo-serie / tipo-
 * especial, sonda v51) — se mira el li más cercano hacia atrás
 * para no mancharse con la tarjeta vecina. */
function azKindCerca(texto, indice) {
  const li = texto.lastIndexOf('<li ', indice);
  if (li < 0) return 'series';
  const seg = texto.slice(li, indice);
  if (/tipo-pelicula/.test(seg)) return 'movie';
  return 'series';
}

/* v0.6.29: el espejo de lectura devuelve markdown — las tarjetas
 * llegan como [Título](https://www.az-animex.com/<slug>/) y se
 * filtran los caminos que no son fichas (géneros, feeds, páginas
 * del sitio, imágenes). Es el bote salvavidas de la búsqueda
 * cuando el ?s= crudo no llega al teléfono. */
function azTarjetasJina(texto) {
  const t = String(texto || '');
  const items = [];
  const vistos = new Set();
  const ajenos = /\/(genero|feed|tag|category|author|page|wp-content|wp-json|wp-admin|wp-login|acerca-de|preguntas-frecuentes|registrarse|comentarios|search|sitemap)/i;
  const re = /\[([^\][\n]{1,200})\]\((https:\/\/www\.az-animex\.com\/([a-z0-9-]+)\/?)\)/gi;
  let m;
  while ((m = re.exec(t)) && items.length < 40) {
    const slug = m[3];
    if (!slug || vistos.has(slug) || ajenos.test(m[2])) continue;
    vistos.add(slug);
    const tit = limpio(m[1]).trim();
    items.push({
      id: 'az-' + slug,
      ref: 'az:' + slug,
      title: (tit || slugATitulo(slug)).slice(0, 200),
      poster: '',
      kind: 'series'
    });
  }
  return items;
}

/* El espejo de lectura con un reinterno: el gratis a veces se queda
 * sin aliento (la sonda v44 lo vio devolver 0 bytes). */
async function azJina(url) {
  for (let i = 0; i < 2; i++) {
    const r = await traer(AZ_JINA + url, { timeoutMs: 24000 });
    if (r.ok && r.text && r.text.length > 200) return r.text;
  }
  return '';
}

/* Los episodios de una colección: cada files/<FID>/<nombre>.mp4_links
 * es un episodio. El nombre trae el número («…_-_01_[BD]…»). */
function azEpsDeTexto(texto) {
  const lista = [];
  const vistos = new Set();
  const re = /files\/([A-F0-9]{8})\/(\S{1,300}?\.mp4)_links/g;
  let m;
  while ((m = re.exec(String(texto || '')))) {
    if (vistos.has(m[1])) continue;
    vistos.add(m[1]);
    const nm = /_-_(\d{1,4})(?=[_.\[])/.exec(m[2]);
    lista.push({ fid: m[1], nombre: m[2], num: nm ? parseInt(nm[1], 10) : 0 });
  }
  lista.sort(function (a, b) { return a.num - b.num; });
  for (let i = 0; i < lista.length; i++) if (!lista[i].num) lista[i].num = i + 1;
  return lista;
}

/* v0.6.28 «El archivista»: la API pública de carpetas de MediaFire
 * lista los archivos de una carpeta compartida sin pedir cuenta
 * (sonda v50: files[].filename + links.normal_download por episodio,
 * .mp4 con número « - 01 [»; chunk_size 100 con total_chunks por si
 * la serie es larga). */
async function azMfEpis(folderKey) {
  const lista = [];
  const vistos = new Set();
  let chunk = 1;
  while (chunk <= 6) {
    const url = 'https://www.mediafire.com/api/1.4/folder/get_content.php?folder_key=' + folderKey +
      '&content_type=files&response_format=json&chunk_size=100&chunk_number=' + chunk;
    const r = await traer(url, { headers: { Referer: 'https://www.mediafire.com/' }, timeoutMs: 15000 });
    if (!r.ok) break;
    let j = null;
    try { j = JSON.parse(r.text); } catch (e) { j = null; }
    const fc = j && j.response && j.response.folder_content;
    const files = (fc && fc.files) || [];
    for (const f of files) {
      if (!f || !f.filename || !/\.mp4$/i.test(f.filename)) continue;
      const dl = f.links && f.links.normal_download;
      if (!dl || vistos.has(dl)) continue;
      vistos.add(dl);
      const nm = /[-_ ]0*(\d{1,4})\s*\[/.exec(f.filename) || /[-_ ]0*(\d{1,4})(?:[-_.\s]|$)/.exec(f.filename) || /(\d{1,4})/.exec(f.filename);
      lista.push({ num: nm ? parseInt(nm[1], 10) : 0, mf: dl });
    }
    const total = parseInt(fc && fc.total_chunks, 10) || 1;
    if (chunk >= total || !files.length) break;
    chunk++;
  }
  lista.sort(function (a, b) { return a.num - b.num; });
  for (let i = 0; i < lista.length; i++) if (!lista[i].num) lista[i].num = i + 1;
  return lista;
}

/* La cosecha completa de una serie: ficha → multilink → episodios.
 * Devuelve { lista, serie } con la serie vestida (título, póster y
 * sinopsis leídos de la ficha: lección de la 0.6.22, episodes() es
 * quien viste la ficha en Kino). */
async function azEpsDe(slug) {
  const cache = AZ_EPS[slug];
  if (cache && Date.now() - cache.t < 600000) return cache;
  const r = await traer(BASE_AZ + '/' + slug + '/', { headers: { Referer: BASE_AZ + '/' }, timeoutMs: 12000 });
  if (!r.ok || !r.text) {
    throw kino.error('not_found', 'Az-Animex no entregó la ficha', {
      userMessage: 'No se pudo abrir esta ficha en Az-Animex.'
    });
  }
  const serie = { title: slugATitulo(slug) };
  const h = /<h1[^>]*>([\s\S]{1,300}?)<\/h1>/i.exec(r.text);
  if (h) serie.title = limpio(h[1]).replace(/^\[/, '').replace(/\]\s*$/, '').trim() || serie.title;
  const og = /property=["']og:image["'][^>]*content=["']([^"']+)["']/i.exec(r.text);
  if (og) serie.poster = og[1].indexOf('//') === 0 ? 'https:' + og[1] : og[1];
  const sin = /post-excerpt__excerpt">\s*<p>([\s\S]{30,2000}?)<\/p>/i.exec(r.text) || /<p[^>]*>([\s\S]{80,1500}?)<\/p>/i.exec(r.text);
  if (sin) serie.overview = limpio(sin[1]).slice(0, 400);
  /* v0.6.25: el mensajero clásico — el botón «Mirrored» de la ficha
   * apunta a mirrored.to/multilinks/<id> y allí vive la lista. */
  let mensajero = '';
  const ml = /mirrored\.to\/multilinks\/([a-z0-9]+)/i.exec(r.text);
  if (ml) mensajero = 'https://www.mirrored.to/multilinks/' + ml[1];
  let lista = azEpsDeTexto(r.text);
  if (!lista.length && mensajero) {
    const crudo = await traer(mensajero, { timeoutMs: 12000 });
    if (crudo.ok) lista = azEpsDeTexto(crudo.text);
  }
  if (!lista.length && mensajero) lista = azEpsDeTexto(await azJina(mensajero));
  /* v0.6.27: las fichas nuevas (oct 2026+) mandan el «Mirrored» a un
   * paste de rentry.co con los files/<FID>/…mp4_links de siempre, uno
   * por episodio — mismo formato, otro mensajero (sonda v48). */
  if (!lista.length) {
    const rn = /rentry\.co\/([a-z0-9]+)/i.exec(r.text);
    if (rn) {
      mensajero = 'https://rentry.co/' + rn[1];
      const pr = await traer(mensajero, { timeoutMs: 15000 });
      if (pr.ok) lista = azEpsDeTexto(pr.text);
      if (!lista.length) lista = azEpsDeTexto(await azJina(mensajero));
    }
  }
  /* v0.6.28: fichas viejas (2021–2023) mandan a una CARPETA de
   * MediaFire — su API pública lista los .mp4 por episodio (v50). */
  let tipo = 'mirrored';
  if (!lista.length) {
    const mf = /mediafire\.com\/folder\/([a-z0-9]+)/i.exec(r.text);
    if (mf) {
      const eps = await azMfEpis(mf[1]);
      if (eps.length) { lista = eps; tipo = 'mf'; }
    }
  }
  if (!lista.length) {
    if (mensajero) {
      throw kino.error('not_found', 'Az-Animex: 0 episodios', {
        userMessage: 'No se pudieron leer los episodios de esta serie en Az-Animex.'
      });
    }
    /* v0.6.28: el inventario de la sonda v49 — si la ficha solo
     * ofrece mensajeros que AniJing no sabe abrir, se dice la
     * verdad con sus nombres (TeraBox, Server Az, Filemoon suelto,
     * MultiUp, FireLoad), no un «sin descargas» falso. */
    if (/terabox\.com\//i.test(r.text) || /dire\.az-animex\.com\//i.test(r.text) ||
        /filemoon\.to\/f\//i.test(r.text) || /multiup\.io\//i.test(r.text) ||
        /fireload\.com\/folder\//i.test(r.text)) {
      throw kino.error('not_found', 'Az-Animex: solo nubes no soportadas', {
        userMessage: 'Esta ficha solo publica descargas en servicios que AniJing todavía no sabe abrir (TeraBox, el Server Az premium de Az-Animex, Filemoon suelto, MultiUp o FireLoad).'
      });
    }
    throw kino.error('not_found', 'Az-Animex: ficha sin descargas', {
      userMessage: 'Esta ficha de Az-Animex todavía no tiene descargas publicadas.'
    });
  }
  const datos = { t: Date.now(), lista: lista, serie: serie, tipo: tipo };
  AZ_EPS[slug] = datos;
  return datos;
}

/* El enlace ?hash=…&dl=0 vive en la página del _links (v47: crudo y
 * todo, no hace falta espejo). */
function azHashDe(texto) {
  const m = /https:\/\/www\.mirrored\.to\/files\/[A-F0-9]{8}\/?\?hash=[a-f0-9]{16,40}&dl=\d/.exec(String(texto || ''));
  return m ? m[0] : '';
}

/* La tabla de nubes: getlink/<FID>/<hostid>/?hid=…&tid=… — en el
 * HTML crudo la tabla es JavaScript, así que aquí casi siempre
 * contesta el espejo. */
function azGetlinksDe(texto) {
  const out = {};
  const re = /getlink\/([A-F0-9]{8})\/(\d+)\/\?hid=([^&\s"'<>)]+)&tid=([a-f0-9]{16,40})/g;
  let m;
  while ((m = re.exec(String(texto || '')))) {
    if (!out[m[2]]) {
      out[m[2]] = 'https://www.mirrored.to/getlink/' + m[1] + '/' + m[2] + '/?hid=' + m[3] + '&tid=' + m[4];
    }
  }
  return out;
}

/* El getlink responde 200 con el href DIRECTO al embed de la nube
 * (v47: «Your VoeSx Link» con href="https://voe.sx/gxht97leny2i"). */
function azEmbedEn(html) {
  const propios = /mirrored\.to|x\.com|twitter|facebook|google|cloudflare/i;
  const re = /href="(https?:\/\/[^"]{6,300})"/gi;
  let m;
  while ((m = re.exec(String(html || '')))) {
    const u = desescapar(m[1]);
    if (propios.test(u)) continue;
    if (detectarTipo('', u) !== 'generic') return u;
  }
  return '';
}

registrarFuente({
  id: 'az',
  etiqueta: 'Az-Animex',

  async buscar(q) {
    const texto = String(q || '').trim().slice(0, 100);
    if (texto.length < 2) return [];
    try {
      let items = [];
      const url = BASE_AZ + '/?s=' + encodeURIComponent(texto);
      const r = await traer(url, { headers: { Referer: BASE_AZ + '/' }, timeoutMs: 12000 });
      if (r.ok) items = azTarjetas(r.text).slice(0, 25);
      else log('az buscar: el ?s= no llegó (status ' + r.status + ') — probando el espejo');
      /* v0.6.29: si la página viva falló o no traía tarjetas (muro,
       * timeout, vacío), el espejo de lectura rescata la búsqueda. */
      if (!items.length) {
        try { items = azTarjetasJina(await azJina(url)).slice(0, 25); } catch (e2) { }
      }
      for (const it of items) it.badges = ['Az-Animex'];
      return items;
    } catch (e) {
      log('az buscar', (e && e.message) || String(e));
      return [];
    }
  },

  async portada(solo) {
    /* El directorio-anime/ y el home de az son JavaScript puro (sonda
     * v46: cero entradas en el HTML crudo) — las filas viven de los
     * géneros, WordPress de verdad que pagina /page/N/ (66 páginas
     * en acción, v43). v0.6.29: el wp-json trae el catálogo COMPLETO
     * (1831 fichas A-Z, sonda v51) → fila «Directorio A-Z» arriba;
     * y los géneros crecen de 7 a 17 (az tiene 44, sonda v51). */
    let defs = [
      { id: 'az-directorio', titulo: 'Directorio A-Z · Az-Animex', ref: 'az-directorio' },
      { id: 'az-genero-accion', titulo: 'Acción · Az-Animex', ref: 'az-genero-accion', camino: '/genero/accion' },
      { id: 'az-genero-comedia', titulo: 'Comedia · Az-Animex', ref: 'az-genero-comedia', camino: '/genero/comedia' },
      { id: 'az-genero-escolar', titulo: 'Escolar · Az-Animex', ref: 'az-genero-escolar', camino: '/genero/escolar' },
      { id: 'az-genero-romance', titulo: 'Romance · Az-Animex', ref: 'az-genero-romance', camino: '/genero/romance' },
      { id: 'az-genero-drama', titulo: 'Drama · Az-Animex', ref: 'az-genero-drama', camino: '/genero/drama' },
      { id: 'az-genero-shounen', titulo: 'Shounen · Az-Animex', ref: 'az-genero-shounen', camino: '/genero/shounen' },
      { id: 'az-genero-seinen', titulo: 'Seinen · Az-Animex', ref: 'az-genero-seinen', camino: '/genero/seinen' },
      { id: 'az-genero-fantasia', titulo: 'Fantasía · Az-Animex', ref: 'az-genero-fantasia', camino: '/genero/fantasia' },
      { id: 'az-genero-harem', titulo: 'Harem · Az-Animex', ref: 'az-genero-harem', camino: '/genero/harem' },
      { id: 'az-genero-misterio', titulo: 'Misterio · Az-Animex', ref: 'az-genero-misterio', camino: '/genero/misterio' },
      { id: 'az-genero-aventura', titulo: 'Aventura · Az-Animex', ref: 'az-genero-aventura', camino: '/genero/aventura' },
      { id: 'az-genero-sobrenatural', titulo: 'Sobrenatural · Az-Animex', ref: 'az-genero-sobrenatural', camino: '/genero/sobrenatural' },
      { id: 'az-genero-ciencia-ficcion', titulo: 'Ciencia ficción · Az-Animex', ref: 'az-genero-ciencia-ficcion', camino: '/genero/ciencia-ficcion' },
      { id: 'az-genero-mecha', titulo: 'Mecha · Az-Animex', ref: 'az-genero-mecha', camino: '/genero/mecha' },
      { id: 'az-genero-superpoderes', titulo: 'Superpoderes · Az-Animex', ref: 'az-genero-superpoderes', camino: '/genero/superpoderes' },
      { id: 'az-genero-psicologico', titulo: 'Psicológico · Az-Animex', ref: 'az-genero-psicologico', camino: '/genero/psicologico' },
      { id: 'az-genero-deportes', titulo: 'Deportes · Az-Animex', ref: 'az-genero-deportes', camino: '/genero/deportes' }
    ];
    /* v0.6.26: en «Todas» solo se consulta el núcleo (tope de Kino:
     * 60 peticiones por llamada — la 0.6.25 lo reventó). */
    if (solo === true) {
      const nucleo = NUCLEO_TODAS.az;
      if (nucleo) defs = defs.filter(function (d) { return nucleo.indexOf(d.id) >= 0; });
    }
    const rtas = await Promise.all(defs.map(async (def) => {
      try {
        /* v0.6.29: el directorio A-Z vive del wp-json, no de una
         * página de género — primera página (A y B), el resto
         * en el «Ver más» con su cursor. */
        if (def.id === 'az-directorio') {
          const d = await azDirectorio(1);
          return d.items.length ? { id: def.id, title: def.titulo, ref: def.ref, items: d.items.slice(0, 20) } : null;
        }
        const r = await traer(BASE_AZ + def.camino + '/', { headers: { Referer: BASE_AZ + '/' }, timeoutMs: 12000 });
        if (!r.ok) return null;
        const items = azTarjetas(r.text).slice(0, 20);
        return items.length ? { id: def.id, title: def.titulo, ref: def.ref, items: items } : null;
      } catch (e) {
        log('az fila «' + def.titulo + '» falló', (e && e.message) || String(e));
        return null;
      }
    }));
    const filas = [];
    for (const fila of rtas) if (fila) filas.push(fila);
    return filas;
  },

  async hoja(ref, cursor) {
    /* v0.6.29: el directorio A-Z pagina el catálogo completo con
     * su cursor propio (40 por página, 46 páginas en total). */
    if (ref === 'az-directorio') {
      const pag = parseInt(cursor, 10);
      const num = Number.isFinite(pag) && pag > 1 ? pag : 1;
      const d = await azDirectorio(num);
      return { items: d.items, next: d.next };
    }
    const m = /^az-genero-([a-z-]+)$/.exec(ref);
    if (!m) return null;
    const camino = '/genero/' + m[1] + '/';
    const pag = parseInt(cursor, 10);
    const num = Number.isFinite(pag) && pag > 1 ? pag : 1;
    const url = num > 1 ? BASE_AZ + camino + 'page/' + num + '/' : BASE_AZ + camino;
    const r = await traer(url, { headers: { Referer: BASE_AZ + '/' }, timeoutMs: 12000 });
    if (!r.ok) {
      /* fin de riel callado: pasado el último /page/N/ el género 404ea. */
      if (num > 1) return { items: [], next: null };
      throw kino.error('unavailable', 'Az-Animex no respondió (status ' + r.status + ')', {
        userMessage: 'Az-Animex no respondió. Revisa tu conexión o inténtalo en un rato.'
      });
    }
    const items = azTarjetas(r.text).slice(0, 60);
    let next = null;
    if (items.length >= 12) next = String(num + 1);
    return { items: items, next: next };
  },

  async detalle(slug) {
    const r = await traer(BASE_AZ + '/' + slug + '/', { headers: { Referer: BASE_AZ + '/' }, timeoutMs: 12000 });
    if (!r.ok || !r.text) return null;
    const serie = { title: slugATitulo(slug) };
    const h = /<h1[^>]*>([\s\S]{1,300}?)<\/h1>/i.exec(r.text);
    if (h) serie.title = limpio(h[1]).replace(/^\[/, '').replace(/\]\s*$/, '').trim() || serie.title;
    const og = /property=["']og:image["'][^>]*content=["']([^"']+)["']/i.exec(r.text);
    if (og) serie.poster = og[1].indexOf('//') === 0 ? 'https:' + og[1] : og[1];
    const sin = /post-excerpt__excerpt">\s*<p>([\s\S]{30,2000}?)<\/p>/i.exec(r.text) || /<p[^>]*>([\s\S]{80,1500}?)<\/p>/i.exec(r.text);
    if (sin) serie.overview = limpio(sin[1]).slice(0, 400);
    return serie;
  },

  async episodios(slug) {
    const datos = await azEpsDe(slug);
    const lista = [];
    for (const e of datos.lista) {
      lista.push({ season: 1, number: e.num, ref: 'az:' + slug + ':' + e.num, title: 'Episodio ' + e.num });
    }
    return { series: datos.serie, episodes: lista };
  },

  async resolver(slug, n, idx) {
    const num = n || 1;
    const datos = await azEpsDe(slug);
    let ep = null;
    for (const e of datos.lista) if (e.num === num) ep = e;
    if (!ep) {
      throw kino.error('not_found', 'Az-Animex: episodio ' + num + ' no existe', {
        userMessage: 'Ese episodio no está publicado en Az-Animex.'
      });
    }
    /* v0.6.28 «El archivista»: carpeta MediaFire — la página del
     * archivo trae el enlace directo al .mp4 en crudo (v50), sin
     * espejos ni bailes de cifrado. */
    if (datos.tipo === 'mf') {
      const rmf = await traer(ep.mf, { headers: { Referer: 'https://www.mediafire.com/' }, timeoutMs: 15000 });
      const dl = rmf.ok ? (String(rmf.text).match(/https:\/\/download[a-z0-9]*\.mediafire\.com\/[^"'<>\s]+/) || [])[0] : '';
      if (!dl) {
        throw kino.error('not_found', 'Az-Animex: enlace MediaFire agotado', {
          userMessage: 'El enlace de MediaFire de este episodio no entregó la descarga. Inténtalo en un rato.'
        });
      }
      return { url: dl, label: 'MediaFire' };
    }
    /* 1. la página del episodio suelta el enlace ?hash=… (crudo, v47). */
    const flUrl = 'https://www.mirrored.to/files/' + ep.fid + '/' + ep.nombre + '_links';
    let hashUrl = '';
    const fl = await traer(flUrl, { timeoutMs: 15000 });
    if (fl.ok) hashUrl = azHashDe(fl.text);
    if (!hashUrl) hashUrl = azHashDe(await azJina(flUrl));
    if (!hashUrl) {
      throw kino.error('not_found', 'Az-Animex: enlaces agotados', {
        userMessage: 'Los enlaces de este episodio caducaron en las nubes. Vuelve a abrirlo en un rato.'
      });
    }
    /* 2. la tabla de nubes — JavaScript en el crudo, el espejo la ve. */
    let getlinks = {};
    const hp = await traer(hashUrl, { timeoutMs: 15000 });
    if (hp.ok) getlinks = azGetlinksDe(hp.text);
    if (!Object.keys(getlinks).length) getlinks = azGetlinksDe(await azJina(hashUrl));
    if (!Object.keys(getlinks).length) {
      throw kino.error('not_found', 'Az-Animex: sin nubes', {
        userMessage: 'Este episodio no tiene nubes disponibles ahora mismo.'
      });
    }
    /* 3. cada getlink esconde el href al embed de su nube; se abren
     * en orden de preferencia hasta juntar un buen puñado. */
    const servers = [];
    let capturaUrl = '';
    for (const id of AZ_HOST_PREF) {
      const gl = getlinks[id];
      if (!gl) continue;
      if (!capturaUrl) capturaUrl = gl;
      if (servers.length >= 4) break;
      const r = await traer(gl, { timeoutMs: 15000 });
      if (!r.ok) continue;
      const embed = azEmbedEn(r.text);
      if (!embed) continue;
      const tipo = detectarTipo(AZ_HOST_NOMBRE[id] || '', embed);
      if (!tipo || tipo === 'generic') continue;
      servers.push({ nombre: AZ_HOST_NOMBRE[id] || ('Nube ' + id), url: embed, tipo: tipo });
    }
    if (!servers.length && capturaUrl && puedeCapturar()) {
      /* ni un embed legible: el navegador oculto renderiza el
       * getlink (countdown incluido) y pesca el video. */
      servers.push({ nombre: 'Az-Animex', url: capturaUrl, tipo: 'multi' });
    }
    if (!servers.length) {
      throw kino.error('not_found', 'Az-Animex: nubes ilegibles', {
        userMessage: 'No se pudieron leer las nubes de este episodio. Inténtalo en un rato.'
      });
    }
    return await probarConCaptura(capturaUrl || servers[0].url, servers, idx, function (i) {
      return 'az:' + slug + ':' + num + ':' + i;
    }, 'Az-Animex', BASE_AZ);
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
      return await f.portada(true);
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
  { id: 'jara', nombre: 'AnimeJara' },
  { id: 'van', nombre: 'VerAnime' },
  { id: 'iva', nombre: 'IvAnime' },
  { id: 'az', nombre: 'Az-Animex' }
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
          id: 'av1-' + m.slug,
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
  /* v0.6.24: MonosChinos y LataAnime ganan núcleo — con sus rieles
   * nuevos ya no caben todos en «Todas»; quedan el par esencial. */
  mc: ['mc-emision', 'mc-animes'],
  lat: ['lat-novedades', 'lat-emision'],
  otv: ['otv-emision', 'otv-eps', 'otv-animes'],
  ayt: ['ayt-latest', 'ayt-peliculas'],
  eas: ['eas-eps', 'eas-sub', 'eas-lat', 'eas-popular'],
  jara: ['jara-emision', 'jara-catalogo'],
  van: ['van-anime', 'van-peliculas'],
  iva: ['iva-emision', 'iva-directorio'],
  /* v0.6.25: Az-Animex entra con el par de géneros esencial.
   * v0.6.29: y el Directorio A-Z — el catálogo entero a la vista. */
  az: ['az-genero-accion', 'az-genero-comedia', 'az-directorio']
};

async function cargarPantalla(fuente) {
  let filas = [];
  if (fuente === 'todas') {
    const fuentes = Object.values(FUENTES);
    const rtas = await Promise.all(fuentes.map(async (f) => {
      try {
        return await f.portada(true);
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
  /* v0.6.5: con las secciones llenas el estado de la pantalla crece y
   * Kino la guarda con un tope de 64 KB: cuando hay muchas filas, cada
   * riel muestra 8 tarjetas en vez de 12 para que «Todas» no desborde. */
  const porRiel = filas.length > 18 ? 8 : 12;
  const fuera = [];
  for (const fila of filas) {
    const items = (fila.items || []).slice(0, porRiel).map(compactarItem);
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
  /* v0.6.11 «La lista completa»: el menú nativo de Kino corta en 8
   * entradas y no se desplaza — con diez fuentes, VerAnime e IvAnime
   * quedaban debajo del corte, invisibles. El selector se dibuja aquí,
   * en el propio lienzo, donde la lista es tan larga como haga falta. */
  if (state.elegirFuentes === true) {
    const actual = fuenteValida(state.fuente) || 'todas';
    for (const x of FUENTES_PANTALLA) {
      cuerpo.push({
        type: 'Text',
        text: (x.id === actual ? '✓ ' : '') + x.nombre,
        style: 'h3',
        onTap: { event: 'elegirFuente', arg: x.id }
      });
    }
    cuerpo.push({ type: 'Button', labelText: 'Cancelar', onPressed: 'cerrarFuentes', alignSelf: 'center' });
  } else if (state.errorPantalla === true) {
    cuerpo.push({ type: 'errorState', title: 'No se pudo cargar', text: 'Ninguna fuente respondió. Revisa tu conexión y vuelve a probar.' });
    cuerpo.push({ type: 'Button', labelText: 'Reintentar', onPressed: 'recargar', alignSelf: 'center' });
  } else if (filas && !filas.length) {
    cuerpo.push({ type: 'emptyState', title: 'Nada por ahora', text: 'Esta fuente no trajo nada en este momento. Prueba con otra o vuelve más tarde.', icon: 'movie' });
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
      /* v0.6.20: el go.title del destacado también viaja con su
       * pasaporte completo (id + title) — un botón no es un item
       * del lienzo y Kino necesita las señas para abrirlo. */
      heroNodo.buttons = [{ type: 'ElevatedButton', labelText: 'Ver la serie', onPressed: { go: { title: { ref: hero.ref, kind: 'series', id: String(hero.id || hero.ref), title: String(hero.title || '') } } } }];
      cuerpo.push(heroNodo);
    }
    const rielDe = function (fila) {
      /* v0.6.17 «La ventanilla del lienzo»: el titleRail nativo está
       * bien para las fuentes sin muro, pero el lienzo de este Kino no
       * habla con el imageSource — las referencias {source:'plugin'}
       * que las pantallas nativas sirven sin problema en el Inicio se
       * pintan grises. Los rieles de IvAnime se dibujan a mano: cada
       * tarjeta lleva un nodo Image con su propia presentación (los
       * «headers» del lienzo, Kino 0.9.83+, el truco de MangaTrack),
       * el título al pie, su tap a la ficha, y el riel entero en un
       * scroll horizontal con su «Ver más». Si algo no cuadra, se
       * cae al titleRail de siempre.
       * v0.6.18 «El póster que espera»: cada Image ganó su
       * «fallback» (desde Kino 0.9.74) para el día en que la imagen
       * no pueda llegar. v0.6.19 «El patrón del pintor»: el ancho
       * viaja EN la imagen (120) y la tarjeta es un Card flush —
       * el patrón del posterCard de MangaTrack, probado en el
       * teléfono con la 0.9.83, donde los headers ya viven.
       * v0.6.20 «El pasaporte del título»: un Card pintado a mano
       * no es un titleCard del lienzo, así que su go.title necesita
       * las cuatro señas (ref, kind, id, title) — sin ellas el
       * toque muere con «No se pudo abrir este título». */
      const primero = fila.items && fila.items[0] ? fila.items[0] : null;
      const esIva = !!(primero && primero.poster && typeof primero.poster === 'object' && primero.poster.source === 'plugin' && String(primero.poster.handle || '').indexOf('https://ivanime.buzz/') === 0);
      if (!esIva) {
        const riel = { type: 'titleRail', title: fila.title, items: fila.items };
        if (fila.ref) riel.ref = fila.ref;
        return riel;
      }
      const tarjetas = [];
      const items = fila.items || [];
      for (let i = 0; i < items.length && tarjetas.length < 12; i++) {
        const it = items[i];
        const u = it && it.poster && typeof it.poster === 'object' && it.poster.source === 'plugin' ? String(it.poster.handle || '') : '';
        if (u.indexOf('https://ivanime.buzz/') !== 0) continue;
        const tarjeta = {
          /* v0.6.19 «El patrón del pintor»: el ancho viaja EN la
           * imagen (el posterCard de MangaTrack, probado en el
           * teléfono con la 0.9.83): sin él, un Image dentro del
           * scroll horizontal no ocupa lugar y la caja queda en
           * cero. El Card flush de Kino lleva el tap y el título
           * vive al pie con su aire. */
          type: 'Card', flush: true,
          /* v0.6.20 «El pasaporte del título»: el go de un título
           * que no es titleCard del lienzo viaja con sus cuatro
           * señas (ref, kind, id, title) — la regla de ui.md; con
           * solo ref y kind Kino contesta «No se pudo abrir este
           * título», como el teléfono confesó de la 0.6.19. */
          onTap: { go: { title: {
            ref: String(it.ref || ''),
            kind: it.kind === 'movie' ? 'movie' : 'series',
            id: String(it.id || it.ref || ''),
            title: String(it.title || '')
          } } },
          children: [
            {
              type: 'Image', url: u, width: 120, aspect: '2:3',
              alt: String(it.title || ''), altEn: String(it.title || ''),
              headers: { Referer: 'https://ivanime.buzz/', 'User-Agent': UA },
              fallback: {
                type: 'Column', padding: 16, crossAxisAlignment: 'center',
                children: [{ type: 'Icon', name: 'movie', color: 'muted' }]
              }
            },
            { type: 'Text', text: String(it.title || ''), style: 'caption', maxLines: 2, padding: 8 }
          ]
        };
        tarjetas.push(tarjeta);
      }
      if (!tarjetas.length) {
        const riel = { type: 'titleRail', title: fila.title, items: fila.items };
        if (fila.ref) riel.ref = fila.ref;
        return riel;
      }
      const cabecera = [{ type: 'Text', text: String(fila.title || ''), style: 'h3', flex: 1 }];
      if (fila.ref) {
        cabecera.push({
          type: 'TextButton',
          labelText: 'Ver más',
          onPressed: { go: { browse: { ref: String(fila.ref), title: String(fila.title || '') } } }
        });
      }
      return {
        type: 'Column',
        gap: 8,
        children: [
          { type: 'Row', children: cabecera },
          {
            type: 'SingleChildScrollView',
            direction: 'horizontal',
            children: [{ type: 'Row', gap: 8, children: tarjetas }]
          }
        ]
      };
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
      return { state: { fuente: fuente, errorPantalla: true } };
    }
  }
  /* v0.6.9: «revisionAon» se retira junto a AnimeOnline; si un estado
   * viejo de la pantalla lo manda, se recarga sin ventanitas. */
  if (nombre === 'revisionAon') {
    return { toast: 'AnimeOnline ya no está en AniJing. Elige otra fuente.' };
  }
  if (nombre === 'fuentes') {
    /* v0.6.11: ya no es el menú nativo (corta en 8) sino el selector del
     * lienzo: el botón de arriba lo abre y lo cierra. */
    const ns = Object.assign({}, state);
    ns.elegirFuentes = !ns.elegirFuentes;
    return { state: ns };
  }
  if (nombre === 'cerrarFuentes') {
    const ns = Object.assign({}, state);
    ns.elegirFuentes = false;
    return { state: ns };
  }
  if (nombre === 'elegirFuente') {
    const nueva = fuenteValida(ev.arg) || 'todas';
    try {
      kino.storage.set(CLAVE_FUENTE_PANTALLA, nueva);
    } catch (eS) {
      log('no se pudo guardar la fuente', (eS && eS.message) || String(eS));
    }
    try {
      const datos = await cargarPantalla(nueva);
      const rta = { state: { fuente: nueva, filas: datos.filas, hero: datos.hero, errorPantalla: false, elegirFuentes: false } };
      const nom = FUENTES_PANTALLA.filter((x) => x.id === nueva)[0];
      if (nom) rta.toast = nom.nombre;
      return rta;
    } catch (err) {
      log('cargar «' + nueva + '» falló', (err && err.message) || String(err));
      return { state: { fuente: nueva, errorPantalla: true, elegirFuentes: false } };
    }
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
      const rta = { state: { fuente: nueva, filas: datos.filas, hero: datos.hero, errorPantalla: false, elegirFuentes: false } };
      const nom = FUENTES_PANTALLA.filter((x) => x.id === nueva)[0];
      if (nom) rta.toast = nom.nombre;
      return rta;
    } catch (err) {
      log('cargar «' + nueva + '» falló', (err && err.message) || String(err));
      return { state: { fuente: nueva, errorPantalla: true, elegirFuentes: false } };
    }
  }
  return null;
}

async function image(arg) {
  /* v0.6.16 «La imagen confesante»: Kino pide por este export los
   * bytes de los pósters de IvAnime (capability imageSource, la
   * apiVersion 13). El handle es la URL de la imagen, estable por
   * serie (su nombre lleva el slug y su número), sin secretos. La
   * sonda v35 midió el muro: desnudo 403, con UA solo 403, con
   * Referer del propio sitio 200 — así que aquí se va con
   * presentación. Y desde la 0.6.16 cada llamada deja su línea en
   * la bitácora: los pósters que salen y los que no, con el
   * porqué — porque en el teléfono de la 0.6.15 salieron grises y
   * el silencio del log no dejaba saber si Kino no llamaba, si el
   * muro no cedía ante su red, o si pesaban de más. Kino cachea
   * cada handle una vez y no re-pide; un fallo aquí es honesto:
   * Kino muestra el placeholder y pone el handle cinco minutos en
   * cuarentena, y la ficha y los capítulos siguen intactos. */
  const handle = arg && arg.handle ? String(arg.handle) : '';
  if (handle.indexOf('https://ivanime.buzz/') !== 0) {
    throw kino.error('not_found', 'imagen que no es de IvAnime');
  }
  const nombre = handle.split('/').pop() || handle;
  let r = null;
  try {
    r = await kino.fetch(handle, {
      headers: { Referer: 'https://ivanime.buzz/', 'User-Agent': UA },
      timeoutMs: 9000,
      maxBytes: 262145
    });
  } catch (eF) {
    log('iva póster «' + nombre + '»: ni siquiera llegó (' + ((eF && eF.message) || String(eF)) + ')');
    throw kino.error('unavailable', 'IvAnime no entregó la imagen');
  }
  /* v0.6.17 unificado: la portada puede fallar porque pese más del
   * tope de Kino (256 KB) o porque ya ni exista (404) — y en ambos
   * casos el sitio guarda la misma imagen en su versión pulgar,
   * con el mismo número en el nombre y cuatro veces más chica. Se
   * prueba ese antes de rendirse: un póster chico vale más que un
   * gris y que un mensajito rojo. */
  if (!r || r.status !== 200 || r.truncated === true) {
    let servido = null;
    let pulgar = handle.replace('/assets/img/serie/portada/', '/assets/thumbs/imagen/');
    pulgar = pulgar.replace('-portada-', '-');
    pulgar = pulgar.replace('.jpg', '.jpg.webp');
    if (pulgar !== handle && pulgar.indexOf('/assets/thumbs/imagen/') >= 0) {
      let r2 = null;
      try {
        r2 = await kino.fetch(pulgar, {
          headers: { Referer: 'https://ivanime.buzz/', 'User-Agent': UA },
          timeoutMs: 9000,
          maxBytes: 262145
        });
      } catch (eF2) { r2 = null; }
      if (r2 && r2.status === 200 && r2.truncated !== true) {
        let bytes2 = '';
        try { bytes2 = r2.base64(); } catch (eB2) { bytes2 = ''; }
        const ct2 = ((r2.headers && (r2.headers['content-type'] || r2.headers['Content-Type'])) || '');
        if (bytes2 && !/text\/html/i.test(ct2)) {
          let mime2 = 'image/webp';
          if (/png/i.test(ct2)) mime2 = 'image/png';
          else if (/jpeg/i.test(ct2)) mime2 = 'image/jpeg';
          const kb2 = Math.round((bytes2.length * 3 / 4) / 102.4) / 10;
          log('iva póster «' + nombre + '»: la portada falló — servido su pulgar («' + (pulgar.split('/').pop() || pulgar) + '», ' + kb2 + ' KB)');
          servido = { bytes: bytes2, mime: mime2 };
        }
      }
      if (!servido) {
        log('iva póster «' + nombre + '»: la portada falló y su pulgar derivado tampoco llegó (status ' + (r2 && r2.status) + ')');
      }
    }
    if (servido) return servido;
    if (!r) {
      log('iva póster «' + nombre + '»: ni siquiera llegó — placeholder honesto');
      throw kino.error('unavailable', 'IvAnime no entregó la imagen');
    }
    log('iva póster «' + nombre + '»: status ' + r.status + (r.truncated ? ' (pesa más del tope de Kino, 256 KB)' : ' (el muro no cedió)') + ' — placeholder honesto');
    throw kino.error('unavailable', 'la imagen no llegó (status ' + r.status + (r.truncated ? ', demasiado grande' : '') + ')');
  }
  const ct = ((r.headers && (r.headers['content-type'] || r.headers['Content-Type'])) || '');
  if (/text\/html/i.test(ct)) {
    log('iva póster «' + nombre + '»: llegó HTML en vez de imagen (el muro)');
    throw kino.error('unavailable', 'IvAnime contestó con su muro, no con la imagen');
  }
  let bytes = '';
  try { bytes = r.base64(); } catch (eB) { bytes = ''; }
  if (!bytes) {
    log('iva póster «' + nombre + '»: llegó 200 pero sin bytes');
    throw kino.error('unavailable', 'IvAnime no entregó los bytes del póster');
  }
  let mime = 'image/jpeg';
  if (/webp/i.test(ct)) mime = 'image/webp';
  else if (/png/i.test(ct)) mime = 'image/png';
  else if (/\.webp(\?|$)/i.test(handle)) mime = 'image/webp';
  else if (/\.png(\?|$)/i.test(handle)) mime = 'image/png';
  const kb = Math.round((bytes.length * 3 / 4) / 102.4) / 10;
  log('iva póster servido «' + nombre + '»: ' + kb + ' KB, ' + mime);
  return { bytes: bytes, mime: mime };
}

export { search, home, browse, episodes, details, resolve, screen, screenEvent, image };
