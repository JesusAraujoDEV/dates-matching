import { NextFunction, Request, Response } from "express";

export const loggerMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const logPayload = {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
  };

  // eslint-disable-next-line no-console
  console.log("[HTTP REQUEST]", logPayload);

  next();
};
