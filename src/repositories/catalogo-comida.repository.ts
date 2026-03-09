import {
  CatalogoComida,
  Prisma,
} from "../generated/prisma/client";

import { prisma } from "../config/prisma";

export class CatalogoComidaRepository {
  async findAll(): Promise<CatalogoComida[]> {
    return prisma.catalogoComida.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: number): Promise<CatalogoComida | null> {
    return prisma.catalogoComida.findUnique({ where: { id } });
  }

  async create(data: Prisma.CatalogoComidaCreateInput): Promise<CatalogoComida> {
    return prisma.catalogoComida.create({ data });
  }

  async update(
    id: number,
    data: Prisma.CatalogoComidaUpdateInput,
  ): Promise<CatalogoComida> {
    return prisma.catalogoComida.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<CatalogoComida> {
    return prisma.catalogoComida.delete({ where: { id } });
  }
}
