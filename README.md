# AniJing

AniJing — el anime con la firma de Susejing. Plugin de anime puro para [Kino](https://kinotvapp.github.io/): catálogo, búsqueda, episodios y reproducción, todo en español.

Su nombre une «anime» con la terminación «jing» de su autor.

## Qué hace (v0.3.0 «Todos los servidores»)

**Tres fuentes**:

- **AnimeAV1** — catálogo con carátulas, siete filas de portada (últimos episodios con su número y captura, últimos agregados, populares, mejor puntuados, películas, acción y fantasía), fichas con sinopsis, géneros, año, nota y el id de MyAnimeList.
- **MonosChinos** — en emisión y animes completos, con sus películas y especiales.
- **LataAnime** — novedades y anime en latino y en castellano.

**La búsqueda** consulta las tres fuentes a la vez y marca de dónde viene cada resultado; **los episodios** se leen de la fuente elegida.

**Reproducción**: Zilla y enlaces directos de AnimeAV1, más 13 extractores de servidores: Voe (con su baile de cifrado), MP4Upload, MixDrop, Uqload, YourUpload, StreamTape, UPNShare (API cifrada con AES), Doodstream, Ok.ru, Hexload, SaveFiles, StreamWish y Filemoon. Al abrir un episodio se prueban en orden (el preferido primero) y el resto queda en el menú «Servidor»; si un servidor cambia su baile, ese falla con un mensaje honesto y quedan los demás.

**Ajustes del plugin**: idioma preferido (sub/dob, solo AnimeAV1) y servidor preferido.

Honesto: Mega y Netu quedan fuera (van cifrados o piden captcha). Si un episodio no trae ningún servidor reproducible, se muestra un aviso claro en lugar de un error seco.

## Instalación

En Kino: Ajustes → Plugins → «+» y escribe:

```
Susejing/AniJing
```

Esta versión pide dos permisos nuevos: abrir páginas web ocultas para encontrar el video (algunos servidores solo sueltan el enlace cargando su página) y conectarse a cualquier servidor público para el stream (los CDNs cambian de dominio a menudo).

## Licencia

GPL-3.0 © 2026 Susejing. Los algoritmos de decodificación (el baile de Voe, el packer p.a.c.k.e.r, el AES de UPNShare) son reimplementaciones propias de patrones públicos de la comunidad Kino; no se copió código de otros plugins.
