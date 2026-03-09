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
}
