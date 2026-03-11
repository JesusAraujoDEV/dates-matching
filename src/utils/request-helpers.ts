import { AppError } from "./app-error";

export const parseNumericId = (value: string, fieldName: string): number => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    throw new AppError(`${fieldName} debe ser numerico`, 400);
  }

  return parsed;
};

export const ensureRequestBody = (
  body: unknown,
  requiredFields: string[] = [],
): void => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError("Faltan datos en la peticion", 400);
  }

  const bodyRecord = body as Record<string, unknown>;

  const missingFields = requiredFields.filter((field) => {
    const value = bodyRecord[field];
    return (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    );
  });

  if (missingFields.length > 0) {
    throw new AppError(
      `Faltan datos obligatorios: ${missingFields.join(", ")}`,
      400,
    );
  }
};
