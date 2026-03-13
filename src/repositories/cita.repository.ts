import { Cita, Prisma, User } from "../generated/prisma/client";

import { prisma } from "../config/prisma";

export class CitaRepository {
  async findAll(): Promise<Cita[]> {
    return prisma.cita.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: number): Promise<Cita | null> {
    return prisma.cita.findUnique({ where: { id } });
  }

  async findByFechaRange(
    fechaStart: Date,
    fechaEnd: Date,
  ): Promise<Cita | null> {
    return prisma.cita.findFirst({
      where: {
        fecha: {
          gte: fechaStart,
          lt: fechaEnd,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findUserById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async updateVote(id: number, data: Prisma.CitaUpdateInput): Promise<Cita> {
    return prisma.cita.update({
      where: { id },
      data,
    });
  }

  async create(data: Prisma.CitaCreateInput): Promise<Cita> {
    return prisma.cita.create({ data });
  }

  async update(id: number, data: Prisma.CitaUpdateInput): Promise<Cita> {
    return prisma.cita.update({
      where: { id },
      data,
    });
  }

  async finalize(id: number, data: Prisma.CitaUpdateInput): Promise<Cita> {
    return prisma.cita.update({
      where: { id },
      data: {
        ...data,
        estado: "finalizada",
      },
    });
  }

  async delete(id: number): Promise<Cita> {
    return prisma.cita.delete({ where: { id } });
  }
}
