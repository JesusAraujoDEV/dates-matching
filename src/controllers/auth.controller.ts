import { NextFunction, Request, Response } from "express";

import { AuthService } from "../services/auth.service";
import { LoginBody } from "../types/auth.types";
import { AppError } from "../utils/app-error";
import { ensureRequestBody } from "../utils/request-helpers";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  me = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      if (!req.user?.id || !Number.isInteger(req.user.id)) {
        throw new AppError("Usuario autenticado no disponible", 401);
      }

      const user = await this.authService.me(req.user.id);
      return res.status(200).json(user);
    } catch (error) {
      return next(error);
    }
  };

  login = async (
    req: Request<Record<string, never>, unknown, LoginBody>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      ensureRequestBody(req.body, ["nombre", "password"]);
      const { nombre, password } = req.body;
      const result = await this.authService.login({ nombre, password });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };
}
