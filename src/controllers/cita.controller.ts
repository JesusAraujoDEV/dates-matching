import { Request, Response } from "express";

import { CitaService } from "../services/cita.service";
import { EmitirVotoFinalBody } from "../types/cita.types";
import { AppError } from "../utils/app-error";

export class CitaController {
  constructor(private readonly citaService: CitaService) {}

  emitirVotoFinal = async (
    req: Request<{ id: string }, unknown, EmitirVotoFinalBody>,
    res: Response,
  ): Promise<Response> => {
    try {
      const citaId = Number(req.params.id);
      const { usuarioId, pelicula, comida } = req.body;

      if (!Number.isInteger(citaId)) {
        throw new AppError("El id de la cita debe ser numerico", 400);
      }

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
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      return res.status(500).json({ error: "Error interno del servidor" });
    }
  };
}
