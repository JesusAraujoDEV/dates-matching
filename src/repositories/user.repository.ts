import { User } from "../generated/prisma/client";

import { prisma } from "../config/prisma";

export class UserRepository {
  async findByNombre(nombre: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { nombre },
    });
  }

  async findAllSafe(): Promise<Array<Pick<User, "id" | "nombre" | "telefono">>> {
    return prisma.user.findMany({
      select: {
        id: true,
        nombre: true,
        telefono: true,
      },
      orderBy: { id: "asc" },
    });
  }

  async findByIdSafe(
    id: number,
  ): Promise<Pick<User, "id" | "nombre" | "telefono"> | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        telefono: true,
      },
    });
  }
}
