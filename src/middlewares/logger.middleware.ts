import { NextFunction, Request, Response } from "express";

type LogBody = Record<string, unknown>;

const sanitizeBody = (body: unknown): unknown => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return body;
  }

  const clonedBody: LogBody = { ...(body as LogBody) };

  if ("password" in clonedBody) {
    clonedBody.password = "***";
  }

  return clonedBody;
};

export const loggerMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const logPayload = {
    method: req.method,
    url: req.originalUrl,
    body: sanitizeBody(req.body),
  };

  // eslint-disable-next-line no-console
  console.log("[HTTP REQUEST]", logPayload);

  next();
};
