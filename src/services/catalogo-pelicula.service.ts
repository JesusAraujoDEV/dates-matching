import { CatalogoPelicula } from "../generated/prisma/client";
import { CatalogoPeliculaRepository } from "../repositories/catalogo-pelicula.repository";
import {
  CreateCatalogoPeliculaParams,
  FindAllCatalogoPeliculaParams,
  UpdateCatalogoPeliculaParams,
} from "../types/catalogo-pelicula.types";
import { AppError } from "../utils/app-error";

export class CatalogoPeliculaService {
  constructor(
    private readonly catalogoPeliculaRepository: CatalogoPeliculaRepository,
  ) {}

  async findAll(params?: FindAllCatalogoPeliculaParams): Promise<CatalogoPelicula[]> {
    return this.catalogoPeliculaRepository.findAll(params?.active);
  }

  async findById(id: number): Promise<CatalogoPelicula> {
    const pelicula = await this.catalogoPeliculaRepository.findById(id);

    if (!pelicula) {
      throw new AppError("La pelicula no existe en el catalogo", 404);
    }

    return pelicula;
  }

  async create(payload: CreateCatalogoPeliculaParams): Promise<CatalogoPelicula> {
    if (!payload.titulo || !payload.poster_url) {
      throw new AppError("titulo y poster_url son obligatorios", 400);
    }

    const normalizedTmdbId =
      payload.tmdb_id === null || payload.tmdb_id === undefined
        ? undefined
        : String(payload.tmdb_id);

    return this.catalogoPeliculaRepository.create({
      titulo: payload.titulo,
      poster_url: payload.poster_url,
      tmdb_id: normalizedTmdbId,
      isActive: payload.isActive,
    });
  }

  async update(payload: UpdateCatalogoPeliculaParams): Promise<CatalogoPelicula> {
    const pelicula = await this.catalogoPeliculaRepository.findById(payload.id);

    if (!pelicula) {
      throw new AppError("La pelicula no existe en el catalogo", 404);
    }

    if (
      payload.titulo === undefined &&
      payload.tmdb_id === undefined &&
      payload.poster_url === undefined &&
      payload.isActive === undefined
    ) {
      throw new AppError("Debes enviar al menos un campo para actualizar", 400);
    }

    return this.catalogoPeliculaRepository.update(payload.id, {
      titulo: payload.titulo,
      tmdb_id:
        payload.tmdb_id === undefined
          ? undefined
          : payload.tmdb_id === null
            ? null
            : String(payload.tmdb_id),
      poster_url: payload.poster_url,
      isActive: payload.isActive,
    });
  }

  async toggleActive(id: number): Promise<CatalogoPelicula> {
    const pelicula = await this.catalogoPeliculaRepository.findById(id);

    if (!pelicula) {
      throw new AppError("La pelicula no existe en el catalogo", 404);
    }

    return this.catalogoPeliculaRepository.toggleActive(id, !pelicula.isActive);
  }

  async delete(id: number): Promise<CatalogoPelicula> {
    const pelicula = await this.catalogoPeliculaRepository.findById(id);

    if (!pelicula) {
      throw new AppError("La pelicula no existe en el catalogo", 404);
    }

    return this.catalogoPeliculaRepository.delete(id);
  }
}
