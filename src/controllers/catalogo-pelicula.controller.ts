import { NextFunction, Request, Response } from "express";

import { CatalogoPeliculaService } from "../services/catalogo-pelicula.service";
import {
  CreateCatalogoPeliculaBody,
  UpdateCatalogoPeliculaBody,
} from "../types/catalogo-pelicula.types";
import { AppError } from "../utils/app-error";
import { ensureRequestBody, parseNumericId } from "../utils/request-helpers";

export class CatalogoPeliculaController {
  constructor(private readonly catalogoPeliculaService: CatalogoPeliculaService) {}

  findAll = async (
    req: Request<Record<string, never>, unknown, unknown, { active?: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const { active } = req.query;

      if (active === "all" || active === undefined) {
        const peliculas = await this.catalogoPeliculaService.findAll();
        return res.status(200).json(peliculas);
      }

      if (active !== "true" && active !== "false") {
        throw new AppError("active debe ser true, false o all", 400);
      }

      const peliculas = await this.catalogoPeliculaService.findAll({
        active: active === "true",
      });
      return res.status(200).json(peliculas);
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
      const pelicula = await this.catalogoPeliculaService.findById(id);
      return res.status(200).json(pelicula);
    } catch (error) {
      return next(error);
    }
  };

  create = async (
    req: Request<Record<string, never>, unknown, CreateCatalogoPeliculaBody>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      ensureRequestBody(req.body);
      const pelicula = await this.catalogoPeliculaService.create(req.body);
      return res.status(201).json(pelicula);
    } catch (error) {
      return next(error);
    }
  };

  update = async (
    req: Request<{ id: string }, unknown, UpdateCatalogoPeliculaBody>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const id = parseNumericId(req.params.id, "id");
      ensureRequestBody(req.body);
      const pelicula = await this.catalogoPeliculaService.update({
        id,
        ...req.body,
      });

      return res.status(200).json(pelicula);
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
      await this.catalogoPeliculaService.delete(id);
      return res.status(200).json({ message: "Pelicula eliminada correctamente" });
    } catch (error) {
      return next(error);
    }
  };

  toggleActive = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const id = parseNumericId(req.params.id, "id");
      const pelicula = await this.catalogoPeliculaService.toggleActive(id);
      return res.status(200).json(pelicula);
    } catch (error) {
      return next(error);
    }
  };
}
