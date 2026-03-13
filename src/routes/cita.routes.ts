import { Router } from "express";

import { CitaController } from "../controllers/cita.controller";
import { CitaRepository } from "../repositories/cita.repository";
import { CitaService } from "../services/cita.service";

const citaRepository = new CitaRepository();
const citaService = new CitaService(citaRepository);
const citaController = new CitaController(citaService);

const citaRouter = Router();

citaRouter.get("/", citaController.findAll);
citaRouter.get("/:id", citaController.findById);
citaRouter.post("/", citaController.create);
citaRouter.put("/:id", citaController.updateResultadoManual);
citaRouter.post("/:id/voto", citaController.emitirVotoFinal);
citaRouter.delete("/:id", citaController.delete);

export { citaRouter };
