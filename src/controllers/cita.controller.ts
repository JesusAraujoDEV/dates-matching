import { NextFunction, Request, Response } from "express";

import { CitaService } from "../services/cita.service";
import {
  CreateCitaBody,
  EmitirVotoFinalBody,
  UpdateCitaBody,
} from "../types/cita.types";
import { AppError } from "../utils/app-error";
import { parseNumericId } from "../utils/request-helpers";

export class CitaController {
  constructor(private readonly citaService: CitaService) {}

  emitirVotoFinal = async (
    req: Request<{ id: string }, unknown, EmitirVotoFinalBody>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const citaId = parseNumericId(req.params.id, "id");
      const { usuarioId, pelicula, comida } = req.body;

      if (!Number.isInteger(usuarioId) || !pelicula || !comida) {
        throw new AppError(
          "Debes enviar usuarioId, pelicula y comida en el body",
          400,
        );
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
      const { fecha, tipo_cita, peliculas_match, comidas_match } = req.body;

      const cita = await this.citaService.create({
        fecha,
        tipo_cita,
        peliculas_match,
        comidas_match,
      });

      return res.status(201).json(cita);
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
}
