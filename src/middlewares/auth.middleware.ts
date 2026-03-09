import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { JwtPayloadUser } from "../types/auth.types";
import { AppError } from "../utils/app-error";

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Token no proporcionado", 401);
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new AppError("Formato de token invalido", 401);
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new AppError("JWT_SECRET no esta definida en variables de entorno", 500);
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload | string;

    if (typeof decoded === "string") {
      throw new AppError("Token invalido", 401);
    }

    req.user = {
      id: Number(decoded.id),
      nombre: String(decoded.nombre),
    } as JwtPayloadUser;

    return next();
  } catch (error) {
    return next(error);
  }
};
