import { Router } from "express";

import { CatalogoPeliculaController } from "../controllers/catalogo-pelicula.controller";
import { CatalogoPeliculaRepository } from "../repositories/catalogo-pelicula.repository";
import { CatalogoPeliculaService } from "../services/catalogo-pelicula.service";

const catalogoPeliculaRepository = new CatalogoPeliculaRepository();
const catalogoPeliculaService = new CatalogoPeliculaService(
  catalogoPeliculaRepository,
);
const catalogoPeliculaController = new CatalogoPeliculaController(
  catalogoPeliculaService,
);

const catalogoPeliculaRouter = Router();

catalogoPeliculaRouter.get("/", catalogoPeliculaController.findAll);
catalogoPeliculaRouter.get("/:id", catalogoPeliculaController.findById);
catalogoPeliculaRouter.post("/", catalogoPeliculaController.create);
catalogoPeliculaRouter.put("/:id", catalogoPeliculaController.update);
catalogoPeliculaRouter.patch("/:id/toggle", catalogoPeliculaController.toggleActive);
catalogoPeliculaRouter.delete("/:id", catalogoPeliculaController.delete);

export { catalogoPeliculaRouter };
