import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { UserRepository } from "../repositories/user.repository";
import { LoginParams, LoginResponse } from "../types/auth.types";
import { AppError } from "../utils/app-error";

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async me(userId: number) {
    const user = await this.userRepository.findByIdSafe(userId);

    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return user;
  }

  async login(payload: LoginParams): Promise<LoginResponse> {
    if (!payload.nombre || !payload.password) {
      throw new AppError("nombre y password son obligatorios", 400);
    }

    const user = await this.userRepository.findByNombre(payload.nombre);

    if (!user) {
      throw new AppError("Credenciales invalidas", 401);
    }

    if (!user.password || typeof user.password !== "string") {
      throw new AppError(
        "El usuario no tiene password configurada en base de datos",
        500,
      );
    }

    const isValidPassword = await bcrypt.compare(payload.password, user.password);

    if (!isValidPassword) {
      throw new AppError("Credenciales invalidas", 401);
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new AppError("JWT_SECRET no esta definida en variables de entorno", 500);
    }

    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre,
      },
      jwtSecret,
      { expiresIn: "12h" },
    );

    return {
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
      },
    };
  }
}
