import type { NextFunction, Request, Response } from "express";
import { ItemModel } from "../models/Item.model.js";
import { CategoriaModel } from "../models/Categoria.model.js";
import { UnidadModel } from "../models/Unidad.model.js";
import { TasaModel } from "../models/Tasa.model.js";
import { ExcelService } from "../services/excel.service.js";
import { PdfService } from "../services/pdf.service.js";
import { prisma } from "../config/db.js";
import { AppError, NotFoundError } from "../middleware/globalError.middleware.js";
import type {
  CreateItemInput,
  DeleteManyItemsInput,
  ItemQueryParams,
  UpdateItemInput,
  UpdateItemStatusInput,
} from "../validations/item.validation.js";

export class ItemController {
  constructor(
    private readonly itemModel: ItemModel = new ItemModel(),
    private readonly categoriaModel: CategoriaModel = new CategoriaModel(),
    private readonly unidadModel: UnidadModel = new UnidadModel(),
    private readonly tasaModel: TasaModel = new TasaModel(),
  ) { }

  /**
   * GET /api/v1/items
   * Lista artículos con paginación, búsqueda amigable y filtros avanzados
   */
  getAllPagination = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = req.query as unknown as ItemQueryParams;
      const result = await this.itemModel.findPaginated(query);

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
   * GET /api/v1/items/all
   * Obtiene la lista completa de artículos sin paginar
   */
  getAll = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const items = await this.itemModel.findAll();

      res.status(200).json({
        status: "success",
        data: items,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/items/stats
   * Obtiene métricas agregadas de artículos para paneles y dashboards
   */
  getStats = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const stats = await this.itemModel.getStats();

      res.status(200).json({
        status: "success",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/items/:id/status
   * Actualiza atómicamente el estado de un artículo
   */
  updateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params["id"]);
      const body = req.body as UpdateItemStatusInput;

      const exists = await this.itemModel.exists(id);
      if (!exists) {
        throw new NotFoundError("Artículo");
      }

      const updatedItem = await this.itemModel.updateStatus(id, body.status);

      res.status(200).json({
        status: "success",
        message: "Estado del artículo actualizado exitosamente.",
        data: updatedItem,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/items/:id
   * Obtiene el detalle de un artículo con sus relaciones
   */
  getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params["id"]);
      const item = await this.itemModel.findById(id);

      if (!item) {
        throw new NotFoundError("Artículo");
      }

      res.status(200).json({
        status: "success",
        data: item,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/items
   * Crea un nuevo artículo previa verificación de relaciones foráneas
   */
  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const body = req.body as CreateItemInput;

      // Validación de integridad de Categoría
      if (body.categoria_id) {
        const categoriaExists = await this.categoriaModel.exists(
          body.categoria_id,
        );
        if (!categoriaExists) {
          throw new AppError(
            `La categoría con ID ${body.categoria_id} no existe.`,
            400,
            "INVALID_RELATION",
          );
        }
      }

      // Validación de integridad de Unidad
      if (body.unidad_id) {
        const unidadExists = await this.unidadModel.exists(body.unidad_id);
        if (!unidadExists) {
          throw new AppError(
            `La unidad con ID ${body.unidad_id} no existe.`,
            400,
            "INVALID_RELATION",
          );
        }
      }

      const newItem = await this.itemModel.create(body);

      res.status(201).json({
        status: "success",
        message: "Artículo creado exitosamente.",
        data: newItem,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/items/:id
   * Actualiza los datos de un artículo y sus relaciones
   */
  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params["id"]);
      const body = req.body as UpdateItemInput;

      const exists = await this.itemModel.exists(id);
      if (!exists) {
        throw new NotFoundError("Artículo");
      }

      if (body.categoria_id) {
        const categoriaExists = await this.categoriaModel.exists(
          body.categoria_id,
        );
        if (!categoriaExists) {
          throw new AppError(
            `La categoría con ID ${body.categoria_id} no existe.`,
            400,
            "INVALID_RELATION",
          );
        }
      }

      if (body.unidad_id) {
        const unidadExists = await this.unidadModel.exists(body.unidad_id);
        if (!unidadExists) {
          throw new AppError(
            `La unidad con ID ${body.unidad_id} no existe.`,
            400,
            "INVALID_RELATION",
          );
        }
      }

      const updatedItem = await this.itemModel.update(id, body);

      res.status(200).json({
        status: "success",
        message: "Artículo actualizado exitosamente.",
        data: updatedItem,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/items/:id
   * Elimina un artículo por su ID
   */
  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params["id"]);

      const exists = await this.itemModel.exists(id);
      if (!exists) {
        throw new NotFoundError("Artículo");
      }

      await this.itemModel.delete(id);

      res.status(200).json({
        status: "success",
        message: "Artículo eliminado exitosamente.",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/items/batch
   * Elimina un conjunto de artículos en bloque
   */
  deleteMany = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { ids } = req.body as DeleteManyItemsInput;
      const result = await this.itemModel.deleteMany(ids);

      res.status(200).json({
        status: "success",
        message: `${result.count} artículos eliminados exitosamente.`,
        data: {
          deletedCount: result.count,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/items/export/excel
   * Descarga el listado de artículos en formato Excel (.xlsx)
   */
  exportExcel = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const items = await this.itemModel.findAll();
      const buffer = await ExcelService.exportItemsToBuffer(items);

      const filename = `articulos_asoranele_${new Date().toISOString().split("T")[0]}.xlsx`;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );

      res.status(200).send(buffer);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/items/import/excel
   * Importa artículos masivamente desde un archivo Excel subido
   */
  importExcel = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError(
          "No se ha proporcionado ningún archivo Excel.",
          400,
          "MISSING_FILE",
        );
      }

      const report = await ExcelService.importItemsFromBuffer(
        req.file.buffer,
        prisma,
      );

      res.status(200).json({
        status: "success",
        message: `Importación finalizada. ${report.imported} artículos importados exitosamente.`,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/items/:id/pdf
   * Genera y descarga la Ficha Técnica oficial del artículo en PDF
   */
  getItemPdf = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params["id"]);
      const item = await this.itemModel.findById(id);

      if (!item) {
        throw new NotFoundError("Artículo");
      }

      // Obtener la tasa más reciente para calcular equivalencias en Bs y USD
      const tasa = await this.tasaModel.getLatest();
      const pdfBuffer = await PdfService.generateItemPdf(item, tasa);

      const filename = `ficha_tecnica_item_${item.id}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${filename}"`,
      );

      res.status(200).send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/items/export/pdf
   * Genera y descarga el catálogo completo de artículos en PDF
   */
  exportCatalogPdf = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const items = await this.itemModel.findAll();
      const tasa = await this.tasaModel.getLatest();
      const pdfBuffer = await PdfService.generateCatalogPdf(items, tasa);

      const filename = `catalogo_articulos_${new Date().toISOString().split("T")[0]}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${filename}"`,
      );

      res.status(200).send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };
}
