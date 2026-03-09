export interface CreateCatalogoPeliculaBody {
  titulo: string;
  tmdb_id?: string;
  poster_url: string;
}

export interface UpdateCatalogoPeliculaBody {
  titulo?: string;
  tmdb_id?: string | null;
  poster_url?: string;
}

export interface CreateCatalogoPeliculaParams {
  titulo: string;
  tmdb_id?: string;
  poster_url: string;
}

export interface UpdateCatalogoPeliculaParams {
  id: number;
  titulo?: string;
  tmdb_id?: string | null;
  poster_url?: string;
}
