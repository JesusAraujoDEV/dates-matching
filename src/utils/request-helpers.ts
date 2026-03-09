import { AppError } from "./app-error";

export const parseNumericId = (value: string, fieldName: string): number => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    throw new AppError(`${fieldName} debe ser numerico`, 400);
  }

  return parsed;
};
