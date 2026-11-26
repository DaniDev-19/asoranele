import type { NextFunction, Request, Response } from "express";
import { UnidadModel } from "../models/Unidad.model.js";
import { NotFoundError } from "../middleware/globalError.middleware.js";
import type {
  DeleteManyInput,
  NameCreated,
  NameUpdated,
  PaginationQuery,
} from "../validations/name.validation.js";

export class UnidadController {
  constructor(
    private readonly unidadModel: UnidadModel = new UnidadModel(),
  ) { }

  /**
   * GET /api/v1/unidades
   * Lista unidades con paginación y búsqueda opcional
   */
  getAllPagination = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { page, limit, search } = req.query as unknown as PaginationQuery;

      const result = await this.unidadModel.findPaginated({
        page,
        limit,
        search,
      });

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
   * GET /api/v1/unidades/all
   * Lista completa de unidades sin paginar 
   */
  getAll = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const unidades = await this.unidadModel.findAll("asc");

      res.status(200).json({
        status: "success",
        data: unidades,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/unidades/with-count
   * Lista unidades con el conteo de artículos asociados
   */
  getAllWithCount = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const unidades = await this.unidadModel.findAllWithCount("asc");

      res.status(200).json({
        status: "success",
        data: unidades,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/unidades/:id
   * Obtiene el detalle de una unidad específica
   */
  getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params["id"]);
      const unidad = await this.unidadModel.findById(id);

      if (!unidad) {
        throw new NotFoundError("Unidad de medida");
      }

      res.status(200).json({
        status: "success",
        data: unidad,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/unidades
   * Registra una nueva unidad
   */
  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const body = req.body as NameCreated;
      const newUnidad = await this.unidadModel.create(body);

      res.status(201).json({
        status: "success",
        message: "Unidad creada exitosamente.",
        data: newUnidad,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/unidades/:id
   * Actualiza el nombre de una unidad existente
   */
  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params["id"]);
      const body = req.body as NameUpdated;

      const exists = await this.unidadModel.exists(id);
      if (!exists) {
        throw new NotFoundError("Unidad de medida");
      }

      const updatedUnidad = await this.unidadModel.update(id, body);

      res.status(200).json({
        status: "success",
        message: "Unidad actualizada exitosamente.",
        data: updatedUnidad,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/unidades/:id
   * Elimina una unidad individual
   */
  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params["id"]);

      const exists = await this.unidadModel.exists(id);
      if (!exists) {
        throw new NotFoundError("Unidad de medida");
      }

      await this.unidadModel.delete(id);

      res.status(200).json({
        status: "success",
        message: "Unidad eliminada exitosamente.",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/unidades/batch
   * Elimina un conjunto de unidades en bloque
   */
  deleteMany = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { ids } = req.body as DeleteManyInput;
      const result = await this.unidadModel.deleteMany(ids);

      res.status(200).json({
        status: "success",
        message: `${result.count} unidades eliminadas exitosamente.`,
        data: {
          deletedCount: result.count,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
