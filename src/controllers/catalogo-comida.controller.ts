import { NextFunction, Request, Response } from "express";

import { CatalogoComidaService } from "../services/catalogo-comida.service";
import {
  CreateCatalogoComidaBody,
  UpdateCatalogoComidaBody,
} from "../types/catalogo-comida.types";
import { parseNumericId } from "../utils/request-helpers";

export class CatalogoComidaController {
  constructor(private readonly catalogoComidaService: CatalogoComidaService) {}

  findAll = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const comidas = await this.catalogoComidaService.findAll();
      return res.status(200).json(comidas);
    } catch (error) {
      return next(error);
    }
  };

  findById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const id = parseNumericId(req.params.id, "id");
      const comida = await this.catalogoComidaService.findById(id);
      return res.status(200).json(comida);
    } catch (error) {
      return next(error);
    }
  };

  create = async (
    req: Request<Record<string, never>, unknown, CreateCatalogoComidaBody>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const comida = await this.catalogoComidaService.create(req.body);
      return res.status(201).json(comida);
    } catch (error) {
      return next(error);
    }
  };

  update = async (
    req: Request<{ id: string }, unknown, UpdateCatalogoComidaBody>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const id = parseNumericId(req.params.id, "id");
      const comida = await this.catalogoComidaService.update({ id, ...req.body });
      return res.status(200).json(comida);
    } catch (error) {
      return next(error);
    }
  };

  delete = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const id = parseNumericId(req.params.id, "id");
      await this.catalogoComidaService.delete(id);
      return res.status(200).json({ message: "Comida eliminada correctamente" });
    } catch (error) {
      return next(error);
    }
  };
}
