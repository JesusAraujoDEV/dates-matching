import { CatalogoComida } from "../generated/prisma/client";
import { CatalogoComidaRepository } from "../repositories/catalogo-comida.repository";
import {
  CreateCatalogoComidaParams,
  UpdateCatalogoComidaParams,
} from "../types/catalogo-comida.types";
import { AppError } from "../utils/app-error";

export class CatalogoComidaService {
  constructor(private readonly catalogoComidaRepository: CatalogoComidaRepository) {}

  async findAll(): Promise<CatalogoComida[]> {
    return this.catalogoComidaRepository.findAll();
  }

  async findById(id: number): Promise<CatalogoComida> {
    const comida = await this.catalogoComidaRepository.findById(id);

    if (!comida) {
      throw new AppError("La comida no existe en el catalogo", 404);
    }

    return comida;
  }

  async create(payload: CreateCatalogoComidaParams): Promise<CatalogoComida> {
    if (!payload.nombre || !payload.descripcion) {
      throw new AppError("nombre y descripcion son obligatorios", 400);
    }

    return this.catalogoComidaRepository.create(payload);
  }

  async update(payload: UpdateCatalogoComidaParams): Promise<CatalogoComida> {
    const comida = await this.catalogoComidaRepository.findById(payload.id);

    if (!comida) {
      throw new AppError("La comida no existe en el catalogo", 404);
    }

    if (
      payload.nombre === undefined &&
      payload.descripcion === undefined &&
      payload.imagen_url === undefined
    ) {
      throw new AppError("Debes enviar al menos un campo para actualizar", 400);
    }

    return this.catalogoComidaRepository.update(payload.id, {
      nombre: payload.nombre,
      descripcion: payload.descripcion,
      imagen_url: payload.imagen_url,
    });
  }

  async delete(id: number): Promise<CatalogoComida> {
    const comida = await this.catalogoComidaRepository.findById(id);

    if (!comida) {
      throw new AppError("La comida no existe en el catalogo", 404);
    }

    return this.catalogoComidaRepository.delete(id);
  }
}
