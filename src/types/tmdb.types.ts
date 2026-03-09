export interface TmdbMovieSummary {
  tmdb_id: number;
  titulo: string;
  poster_url: string | null;
  descripcion: string;
}

export interface TmdbSearchQuery {
  query: string;
}

export interface TmdbMovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  runtime: number | null;
  genres: Array<{ id: number; name: string }>;
}
