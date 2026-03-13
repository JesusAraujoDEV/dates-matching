export interface CreateCatalogoPeliculaBody {
  titulo: string;
  tmdb_id?: string | number | null;
  poster_url: string;
  isActive?: boolean;
}

export interface UpdateCatalogoPeliculaBody {
  titulo?: string;
  tmdb_id?: string | number | null;
  poster_url?: string;
  isActive?: boolean;
}

export interface CreateCatalogoPeliculaParams {
  titulo: string;
  tmdb_id?: string | number | null;
  poster_url: string;
  isActive?: boolean;
}

export interface UpdateCatalogoPeliculaParams {
  id: number;
  titulo?: string;
  tmdb_id?: string | number | null;
  poster_url?: string;
  isActive?: boolean;
}

export interface FindAllCatalogoPeliculaParams {
  active?: boolean;
}
