import {
  CatalogoPelicula,
  Prisma,
} from "../generated/prisma/client";

import { prisma } from "../config/prisma";

export class CatalogoPeliculaRepository {
  async findAll(active?: boolean): Promise<CatalogoPelicula[]> {
    return prisma.catalogoPelicula.findMany({
      where: active === undefined ? undefined : { isActive: active },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: number): Promise<CatalogoPelicula | null> {
    return prisma.catalogoPelicula.findUnique({ where: { id } });
  }

  async create(data: Prisma.CatalogoPeliculaCreateInput): Promise<CatalogoPelicula> {
    return prisma.catalogoPelicula.create({ data });
  }

  async update(
    id: number,
    data: Prisma.CatalogoPeliculaUpdateInput,
  ): Promise<CatalogoPelicula> {
    return prisma.catalogoPelicula.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<CatalogoPelicula> {
    return prisma.catalogoPelicula.delete({ where: { id } });
  }

  async toggleActive(id: number, isActive: boolean): Promise<CatalogoPelicula> {
    return prisma.catalogoPelicula.update({
      where: { id },
      data: { isActive },
    });
  }
}
