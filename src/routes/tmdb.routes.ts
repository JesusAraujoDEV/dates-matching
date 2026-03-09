import { Router } from "express";

import { TmdbController } from "../controllers/tmdb.controller";
import { TmdbService } from "../services/tmdb.service";

const tmdbService = new TmdbService();
const tmdbController = new TmdbController(tmdbService);

const tmdbRouter = Router();

tmdbRouter.get("/search", tmdbController.searchMovies);

export { tmdbRouter };
