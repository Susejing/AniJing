# AniJing

AniJing — el anime con la firma de Susejing. Plugin de anime puro para [Kino](https://kinotvapp.github.io/): catálogo, búsqueda, episodios y reproducción, todo en español.

Su nombre une «anime» con la terminación «jing» de su autor.

## Qué hace (v0.2.0)

- **home** — siete filas: últimos episodios (con su número y captura), últimos agregados, populares, mejor puntuados, películas, acción y fantasía, todas con carátula y fondo.
- **search** — busca en el catálogo de AnimeAV1, con carátulas; si Kino conoce el título original o alternativos, también los prueba.
- **browse** — «Ver más» de cada fila, página por página.
- **episodes** — los episodios de cada serie, con captura, sinopsis, géneros, año, nota y el id de MyAnimeList (que otros plugins de la familia, como AniTrack, pueden aprovechar).
- **details** — la ficha completa de cada serie con su carátula.
- **resolve** — reproduce el HLS directo de AnimeAV1 (Zilla), con las demás copias etiquetadas como alternativas.

Honesto: esta versión reproduce solo los reproductores directos (HLS). Los que
necesitan extractor (VOE, MP4Upload) y más fuentes (MonosChinos, LataAnime) llegan en las
siguientes versiones.

## Instalación

En Kino: Ajustes → Plugins → «+» y escribe:

```
Susejing/AniJing
```

## Licencia

GPL-3.0. El esqueleto de fuentes aisladas se tomó como patrón del plugin comunitario
YojaTV (GPL-3.0); este código es nuevo y también libre.
