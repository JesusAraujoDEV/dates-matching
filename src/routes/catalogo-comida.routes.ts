import { Router } from "express";

import { CatalogoComidaController } from "../controllers/catalogo-comida.controller";
import { CatalogoComidaRepository } from "../repositories/catalogo-comida.repository";
import { CatalogoComidaService } from "../services/catalogo-comida.service";

const catalogoComidaRepository = new CatalogoComidaRepository();
const catalogoComidaService = new CatalogoComidaService(catalogoComidaRepository);
const catalogoComidaController = new CatalogoComidaController(catalogoComidaService);

const catalogoComidaRouter = Router();

catalogoComidaRouter.get("/", catalogoComidaController.findAll);
catalogoComidaRouter.get("/:id", catalogoComidaController.findById);
catalogoComidaRouter.post("/", catalogoComidaController.create);
catalogoComidaRouter.put("/:id", catalogoComidaController.update);
catalogoComidaRouter.delete("/:id", catalogoComidaController.delete);

export { catalogoComidaRouter };
