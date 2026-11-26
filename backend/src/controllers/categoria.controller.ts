import type { NextFunction, Request, Response } from "express";
import { CategoriaModel } from "../models/Categoria.model.js";
import { NotFoundError } from "../middleware/globalError.middleware.js";
import type {
  DeleteManyInput,
  NameCreated,
  NameUpdated,
  PaginationQuery,
} from "../validations/name.validation.js";

export class CategoriaController {
  constructor(
    private readonly categoriaModel: CategoriaModel = new CategoriaModel(),
  ) { }

  /**
   * GET /api/v1/categorias
   * Lista categorías con paginación y búsqueda opcional
   */
  getAllPagination = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { page, limit, search } = req.query as unknown as PaginationQuery;

      const result = await this.categoriaModel.findPaginated({
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
   * GET /api/v1/categorias/all
   * Obtiene la lista completa sin paginar
   */
  getAll = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const categorias = await this.categoriaModel.findAll("asc");

      res.status(200).json({
        status: "success",
        data: categorias,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/categorias/with-count
   * Obtiene las categorías incluyendo el conteo de artículos vinculados
   */
  getAllWithCount = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const categorias = await this.categoriaModel.findAllWithCount("asc");

      res.status(200).json({
        status: "success",
        data: categorias,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/categorias/:id
   * Obtiene una categoría específica por ID
   */
  getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params["id"]);
      const categoria = await this.categoriaModel.findById(id);

      if (!categoria) {
        throw new NotFoundError("Categoría");
      }

      res.status(200).json({
        status: "success",
        data: categoria,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/categorias
   * Crea una nueva categoría
   */
  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const body = req.body as NameCreated;
      const newCategoria = await this.categoriaModel.create(body);

      res.status(201).json({
        status: "success",
        message: "Categoría creada exitosamente.",
        data: newCategoria,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/categorias/:id
   * Actualiza el nombre de una categoría existente
   */
  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params["id"]);
      const body = req.body as NameUpdated;

      const exists = await this.categoriaModel.exists(id);
      if (!exists) {
        throw new NotFoundError("Categoría");
      }

      const updatedCategoria = await this.categoriaModel.update(id, body);

      res.status(200).json({
        status: "success",
        message: "Categoría actualizada exitosamente.",
        data: updatedCategoria,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/categorias/:id
   * Elimina una categoría por su ID
   */
  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params["id"]);

      const exists = await this.categoriaModel.exists(id);
      if (!exists) {
        throw new NotFoundError("Categoría");
      }

      await this.categoriaModel.delete(id);

      res.status(200).json({
        status: "success",
        message: "Categoría eliminada exitosamente.",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/categorias/batch
   * Elimina un conjunto de categorías en una sola operación
   */
  deleteMany = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { ids } = req.body as DeleteManyInput;
      const result = await this.categoriaModel.deleteMany(ids);

      res.status(200).json({
        status: "success",
        message: `${result.count} categorías eliminadas exitosamente.`,
        data: {
          deletedCount: result.count,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
