import axios, { AxiosInstance } from "axios";

import {
  TmdbMovieDetails,
  TmdbMovieSummary,
} from "../types/tmdb.types";
import { AppError } from "../utils/app-error";

const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export class TmdbService {
  private readonly client: AxiosInstance;

  constructor() {
    const token = process.env.TMDB_ACCESS_TOKEN;

    if (!token) {
      throw new Error("TMDB_ACCESS_TOKEN no esta definida en variables de entorno");
    }

    this.client = axios.create({
      baseURL: TMDB_API_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      timeout: 10000,
    });
  }

  async searchMovies(query: string): Promise<TmdbMovieSummary[]> {
    if (!query?.trim()) {
      throw new AppError("El parametro query es obligatorio", 400);
    }

    try {
      const { data } = await this.client.get<{ results: Array<any> }>(
        "/search/movie",
        {
          params: {
            query: query.trim(),
            language: "es-ES",
          },
        },
      );

      return (data.results || []).map((movie) => ({
        tmdb_id: movie.id,
        titulo: movie.title,
        poster_url: movie.poster_path
          ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
          : null,
        descripcion: movie.overview ?? "",
      }));
    } catch {
      throw new AppError("Error consultando TMDB (search/movie)", 502);
    }
  }

  async getMovieDetails(id: number): Promise<TmdbMovieDetails> {
    if (!Number.isInteger(id)) {
      throw new AppError("id de pelicula invalido", 400);
    }

    try {
      const { data } = await this.client.get<TmdbMovieDetails>(`/movie/${id}`, {
        params: {
          language: "es-ES",
        },
      });

      return data;
    } catch {
      throw new AppError("Error consultando TMDB (movie/{id})", 502);
    }
  }
}
