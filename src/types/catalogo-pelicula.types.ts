export interface CreateCatalogoPeliculaBody {
  titulo: string;
  tmdb_id?: string | number | null;
  poster_url: string;
}

export interface UpdateCatalogoPeliculaBody {
  titulo?: string;
  tmdb_id?: string | number | null;
  poster_url?: string;
}

export interface CreateCatalogoPeliculaParams {
  titulo: string;
  tmdb_id?: string | number | null;
  poster_url: string;
}

export interface UpdateCatalogoPeliculaParams {
  id: number;
  titulo?: string;
  tmdb_id?: string | number | null;
  poster_url?: string;
}
