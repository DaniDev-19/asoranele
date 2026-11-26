import type { RequestHandler } from "express";
import type { ZodType } from "zod";

/**
 * Validador genérico para el cuerpo de la petición (req.body)
 */
export const validateBody = <T extends ZodType>(
  schema: T,
): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    next(result.error);
    return;
  }

  req.body = result.data;
  next();
};

/**
 * Validador para los parámetros de ruta (req.params)
 * Convierte strings como ":id" a los tipos definidos (ej. número entero)
 */
export const validateParams = <T extends ZodType>(
  schema: T,
): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse(req.params);

  if (!result.success) {
    next(result.error);
    return;
  }

  req.params = result.data as Record<string, string>;
  next();
};

/**
 * Validador para los parámetros de consulta (req.query)
 * Sanitiza y castea query params de paginación y búsqueda
 */
export const validateQuery = <T extends ZodType>(
  schema: T,
): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    next(result.error);
    return;
  }

  req.query = result.data as Record<string, any>;
  next();
};
