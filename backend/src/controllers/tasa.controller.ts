import type { NextFunction, Request, Response } from "express";
import { TasaModel } from "../models/Tasa.model.js";
import { NotFoundError } from "../middleware/globalError.middleware.js";
import type {
  ConvertQueryInput,
  CreateTasaInput,
  TasaPaginationQuery,
} from "../validations/tasa.validation.js";

export class TasaController {
  constructor(private readonly tasaModel: TasaModel = new TasaModel()) { }

  /**
   * GET /api/v1/tasas/latest (o /current)
   * Obtiene la tasa activa más reciente
   */
  getLatest = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const tasa = await this.tasaModel.getLatest();

      if (!tasa) {
        throw new NotFoundError("Tasa de cambio");
      }

      res.status(200).json({
        status: "success",
        data: tasa,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/tasas/:id
   * Obtiene una tasa histórica específica por su ID
   */
  getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params["id"]);
      const tasa = await this.tasaModel.findById(id);

      if (!tasa) {
        throw new NotFoundError("Tasa de cambio");
      }

      res.status(200).json({
        status: "success",
        data: tasa,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/tasas/sync
   * Fuerza la sincronización inmediata con DolarAPI y guarda el registro en BD
   */
  sync = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const nuevaTasa = await this.tasaModel.syncFromDolarApi();

      res.status(201).json({
        status: "success",
        message: "Tasas de cambio sincronizadas exitosamente desde DolarAPI.",
        data: nuevaTasa,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/tasas/history
   * Obtiene el histórico paginado de tasas registradas
   */
  getHistory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = req.query as unknown as TasaPaginationQuery;
      const result = await this.tasaModel.findPaginated(query);

      res.status(200).json({
        status: "success",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/tasas
   * Permite el ingreso manual de tasas por parte del administrador
   */
  createManual = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const body = req.body as CreateTasaInput;
      const nuevaTasa = await this.tasaModel.create(body);

      res.status(201).json({
        status: "success",
        message: "Tasa registrada manualmente con éxito.",
        data: nuevaTasa,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/tasas/convert?amount=100&from=USD
   * Convierte un monto a todas las tasas vigentes
   */
  convert = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { amount, from } = req.query as unknown as ConvertQueryInput;
      const conversion = await this.tasaModel.convert(amount, from);

      res.status(200).json({
        status: "success",
        data: conversion,
      });
    } catch (error) {
      next(error);
    }
  };
}
