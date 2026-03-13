import { NextFunction, Request, Response } from "express";

import { CitaService } from "../services/cita.service";
import {
  CreateCitaBody,
  EmitirVotoFinalBody,
  UpdateCitaBody,
} from "../types/cita.types";
import { AppError } from "../utils/app-error";
import { ensureRequestBody, parseNumericId } from "../utils/request-helpers";

export class CitaController {
  constructor(private readonly citaService: CitaService) {}

  emitirVotoFinal = async (
    req: Request<{ id: string }, unknown, EmitirVotoFinalBody>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const citaId = parseNumericId(req.params.id, "id");
      ensureRequestBody(req.body, ["usuarioId"]);
      const { usuarioId, pelicula, comida } = req.body;

      if (!Number.isInteger(usuarioId)) {
        throw new AppError("Debes enviar un usuarioId numerico en el body", 400);
      }

      const result = await this.citaService.emitirVotoFinal({
        citaId,
        usuarioId,
        pelicula,
        comida,
      });

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  findAll = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const citas = await this.citaService.findAll();
      return res.status(200).json(citas);
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
      const cita = await this.citaService.findById(id);
      return res.status(200).json(cita);
    } catch (error) {
      return next(error);
    }
  };

  create = async (
    req: Request<Record<string, never>, unknown, CreateCitaBody>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      ensureRequestBody(req.body, ["fecha", "tipo_cita", "peliculas", "comidas"]);

      if (!req.user?.nombre) {
        throw new AppError("Usuario autenticado no disponible", 401);
      }

      const { fecha, tipo_cita, peliculas, comidas } = req.body;

      if (!Array.isArray(peliculas) || !Array.isArray(comidas)) {
        throw new AppError("peliculas y comidas deben ser arrays", 400);
      }

      const cita = await this.citaService.create({
        fecha,
        tipo_cita,
        peliculas,
        comidas,
        userName: req.user.nombre,
      });

      return res.status(cita.created ? 201 : 200).json(cita.cita);
    } catch (error) {
      return next(error);
    }
  };

  updateResultadoManual = async (
    req: Request<{ id: string }, unknown, UpdateCitaBody>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const id = parseNumericId(req.params.id, "id");
      ensureRequestBody(req.body, ["resultado_pelicula", "resultado_comida"]);
      const { resultado_pelicula, resultado_comida } = req.body;

      const cita = await this.citaService.updateResultadoManual({
        id,
        resultado_pelicula,
        resultado_comida,
      });

      return res.status(200).json(cita);
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
      await this.citaService.delete(id);
      return res.status(200).json({ message: "Cita eliminada correctamente" });
    } catch (error) {
      return next(error);
    }
  };
}
