import { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/app-error";

export const errorHandlerMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  // Log estructurado para diagnosticar fallos reales en produccion
  // eslint-disable-next-line no-console
  console.error("[ERROR]", {
    name: error instanceof Error ? error.name : "UnknownError",
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  if (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    "message" in error &&
    typeof (error as { statusCode?: unknown }).statusCode === "number" &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return res
      .status((error as { statusCode: number }).statusCode)
      .json({ error: (error as { message: string }).message });
  }

  return res.status(500).json({ error: "Error interno del servidor" });
};
