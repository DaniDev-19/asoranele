import { randomUUID } from "node:crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError } from "zod";

import { Prisma } from "../generated/prisma/client.js";

type ErrorDetails = {
  fields?: Array<{ field: string; message: string }>;
  stack?: string;
};

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_ERROR",
    isOperational = true,
  ) {
    super(message);
    this.name = new.target.name;
    this.statusCode =
      Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599
        ? statusCode
        : 500;
    this.code = code;
    this.isOperational = isOperational;
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Recurso") {
    super(`${resource} no encontrado.`, 404, "NOT_FOUND");
  }
}

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const requestId = randomUUID();
  req.headers["x-request-id"] = requestId;
  res.setHeader("x-request-id", requestId);
  next();
}

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    status: "error",
    code: "ROUTE_NOT_FOUND",
    message: `No existe la ruta ${req.method} ${req.originalUrl}.`,
  });
};

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  const isProduction = process.env.NODE_ENV === "production";
  let statusCode = 500;
  let code = "INTERNAL_ERROR";
  let message = "Error interno del servidor.";
  let details: ErrorDetails | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.isOperational
      ? err.message
      : isProduction
        ? "Error interno del servidor."
        : err.message;
  } else if (err instanceof ZodError) {
    statusCode = 422;
    code = "VALIDATION_ERROR";
    message = "Los datos enviados no son válidos.";
    details = {
      fields: err.issues.map((issue) => ({
        field: issue.path.length ? issue.path.join(".") : "body",
        message: issue.message,
      })),
    };
  } else if (
    err instanceof SyntaxError &&
    "body" in err &&
    "status" in err &&
    err.status === 400
  ) {
    statusCode = 400;
    code = "INVALID_JSON";
    message = "El cuerpo de la solicitud contiene JSON inválido.";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        statusCode = 409;
        code = "UNIQUE_CONSTRAINT";
        message = "Ya existe un registro con esos datos.";
        break;
      case "P2025":
        statusCode = 404;
        code = "NOT_FOUND";
        message = "El registro solicitado no existe.";
        break;
      case "P2003":
        statusCode = 409;
        code = "FOREIGN_KEY_CONSTRAINT";
        message =
          "No se puede completar la operación porque el recurso está relacionado con otro registro.";
        break;
      case "P2014":
        statusCode = 409;
        code = "RELATION_CONSTRAINT";
        message =
          "La operación viola una relación entre categorías, unidades, imágenes o artículos.";
        break;
      default:
        code = "DATABASE_ERROR";
        message = isProduction
          ? "No fue posible procesar los datos."
          : err.message;
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    code = "DATABASE_VALIDATION_ERROR";
    message = "Los datos no son válidos para la operación solicitada.";
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    code = "DATABASE_CONNECTION_ERROR";
    message = "No fue posible conectar con la base de datos.";
  } else if (err instanceof Error) {
    code = "INTERNAL_ERROR";
    message = isProduction
      ? "Error interno del servidor."
      : err.message;
  }

  if (!isProduction) {
    if (err instanceof Error) {
      details = details ? { ...details } : {};
      if (err.stack) {
        details.stack = err.stack;
      }
    }
  }

  const requestId = req.headers["x-request-id"];
  if (typeof requestId === "string") {
    res.setHeader("x-request-id", requestId);
  }

  console.error("[ERROR_HANDLER]", {
    requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    code,
    message: err instanceof Error ? err.message : message,
  });

  res.status(statusCode).json({
    status: "error",
    code,
    message,
    ...(details ? { details } : {}),
  });
}
