import { NextFunction, Request, Response } from "express";

import { TmdbService } from "../services/tmdb.service";

export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

  searchMovies = async (
    req: Request<Record<string, never>, unknown, unknown, { query?: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> => {
    try {
      const query = req.query.query ?? "";
      const movies = await this.tmdbService.searchMovies(query);
      return res.status(200).json(movies);
    } catch (error) {
      return next(error);
    }
  };
}
