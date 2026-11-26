import { Router } from "express";
import { ImagenController } from "../controllers/imagen.controller.js";
import {
  uploadMultipleImages,
  uploadSingleImage,
} from "../middleware/upload.middleware.js";
import { validateParams } from "../middleware/schemaValid.middleware.js";
import { strictRateLimiter } from "../utils/rateLimit.js";
import { idParamSchema } from "../validations/name.validation.js";

const router = Router();
const controller = new ImagenController();

router.post("/upload", strictRateLimiter, uploadSingleImage, controller.uploadSingle);
router.post(
  "/upload-multiple",
  strictRateLimiter,
  uploadMultipleImages,
  controller.uploadMultiple,
);
router.get("/", controller.getAll);
router.delete("/cleanup-orphans", strictRateLimiter, controller.cleanupOrphans);
router.get("/:id", validateParams(idParamSchema), controller.getById);
router.delete("/:id", validateParams(idParamSchema), controller.delete);

export default router;
