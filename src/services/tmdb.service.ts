import axios, { AxiosInstance, isAxiosError } from "axios";

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
            language: "en-EN",
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
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response) {
          // Log para depuracion detallada de TMDB en terminal
          // eslint-disable-next-line no-console
          console.error("TMDB search/movie error response:", error.response.data);

          const tmdbMessage = this.extractTmdbMessage(error.response.data);
          throw new AppError(
            `Error consultando TMDB (search/movie): ${tmdbMessage}`,
            error.response.status || 500,
          );
        }

        throw new AppError(
          `Error consultando TMDB (search/movie): ${error.message}`,
          500,
        );
      }

      throw new AppError("Error interno consultando TMDB (search/movie)", 500);
    }
  }

  async getMovieDetails(id: number): Promise<TmdbMovieDetails> {
    if (!Number.isInteger(id)) {
      throw new AppError("id de pelicula invalido", 400);
    }

    try {
      const { data } = await this.client.get<TmdbMovieDetails>(`/movie/${id}`, {
        params: {
          language: "en-EN",
        },
      });

      return data;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response) {
          // Log para depuracion detallada de TMDB en terminal
          // eslint-disable-next-line no-console
          console.error("TMDB movie/{id} error response:", error.response.data);

          const tmdbMessage = this.extractTmdbMessage(error.response.data);
          throw new AppError(
            `Error consultando TMDB (movie/{id}): ${tmdbMessage}`,
            error.response.status || 500,
          );
        }

        throw new AppError(
          `Error consultando TMDB (movie/{id}): ${error.message}`,
          500,
        );
      }

      throw new AppError("Error interno consultando TMDB (movie/{id})", 500);
    }
  }

  private extractTmdbMessage(payload: unknown): string {
    if (!payload || typeof payload !== "object") {
      return "TMDB devolvio una respuesta sin detalle";
    }

    const maybePayload = payload as { status_message?: unknown; message?: unknown };

    if (typeof maybePayload.status_message === "string") {
      return maybePayload.status_message;
    }

    if (typeof maybePayload.message === "string") {
      return maybePayload.message;
    }

    return "TMDB devolvio una respuesta sin status_message";
  }
}
