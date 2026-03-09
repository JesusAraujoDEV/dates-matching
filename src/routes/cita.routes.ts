import { Router } from "express";

import { CitaController } from "../controllers/cita.controller";
import { CitaRepository } from "../repositories/cita.repository";
import { CitaService } from "../services/cita.service";

const citaRepository = new CitaRepository();
const citaService = new CitaService(citaRepository);
const citaController = new CitaController(citaService);

const citaRouter = Router();

citaRouter.post("/:id/voto", citaController.emitirVotoFinal);

export { citaRouter };
