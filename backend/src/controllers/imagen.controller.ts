import type { NextFunction, Request, Response } from "express";
import { ImagenModel } from "../models/Imagen.model.js";
import { ImageStorageService } from "../services/image_r2.service.js";
import { AppError, NotFoundError } from "../middleware/globalError.middleware.js";

export class ImagenController {
  constructor(private readonly imagenModel: ImagenModel = new ImagenModel()) { }

  uploadSingle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError("No se ha proporcionado ningún archivo de imagen.", 400, "MISSING_FILE");
      }

      const altText = (req.body?.alt_text as string) || req.file.originalname;
      const stored = await ImageStorageService.uploadImage(req.file, "items");
      const imagenRecord = await this.imagenModel.create(stored.url, altText);

      res.status(201).json({
        status: "success",
        message: "Imagen subida exitosamente.",
        data: {
          ...imagenRecord,
          storageProvider: stored.provider,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/images/upload-multiple
   * Sube hasta 5 imágenes simultáneamente
   */
  uploadMultiple = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;

      if (!files || files.length === 0) {
        throw new AppError("Debes enviar al menos un archivo de imagen.", 400, "MISSING_FILES");
      }

      const uploadPromises = files.map(async (file) => {
        const stored = await ImageStorageService.uploadImage(file, "items");
        return this.imagenModel.create(stored.url, file.originalname);
      });

      const uploadedImages = await Promise.all(uploadPromises);

      res.status(201).json({
        status: "success",
        message: `${uploadedImages.length} imágenes subidas exitosamente.`,
        data: uploadedImages,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/images
   * Obtiene la galería de imágenes paginada
   */
  getAll = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await this.imagenModel.findPaginated(page, limit);

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
   * GET /api/v1/images/:id
   */
  getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const imagen = await this.imagenModel.findById(id);

      if (!imagen) {
        throw new NotFoundError("Imagen");
      }

      res.status(200).json({
        status: "success",
        data: imagen,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/images/:id
   */
  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const exists = await this.imagenModel.findById(id);

      if (!exists) {
        throw new NotFoundError("Imagen");
      }

      await this.imagenModel.delete(id);

      res.status(200).json({
        status: "success",
        message: "Imagen eliminada exitosamente del almacenamiento y la base de datos.",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/images/cleanup-orphans
   * Limpia todas las imágenes huérfanas que no están vinculadas a ningún artículo
   */
  cleanupOrphans = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.imagenModel.cleanupOrphanImages();

      res.status(200).json({
        status: "success",
        message: `${result.deletedCount} imágenes huérfanas eliminadas exitosamente del almacenamiento.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
