import { Router } from "express";
import { ItemController } from "../controllers/item.controller.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/schemaValid.middleware.js";
import { uploadExcelFile } from "../middleware/upload.middleware.js";
import { strictRateLimiter } from "../utils/rateLimit.js";
import { idParamSchema } from "../validations/name.validation.js";
import {
  createItemSchema,
  deleteManyItemsSchema,
  itemQuerySchema,
  updateItemSchema,
  updateItemStatusSchema,
} from "../validations/item.validation.js";

const router = Router();
const controller = new ItemController();

// 1. Rutas fijas (deben ir antes de las rutas con :id)
router.get("/", validateQuery(itemQuerySchema), controller.getAllPagination);
router.get("/all", controller.getAll);
router.get("/stats", controller.getStats);
router.get("/export/excel", controller.exportExcel);
router.post("/import/excel", strictRateLimiter, uploadExcelFile, controller.importExcel);
router.get("/export/pdf", controller.exportCatalogPdf);
router.delete("/batch", validateBody(deleteManyItemsSchema), controller.deleteMany);

// 2. Rutas con parámetro dinámico :id
router.get("/:id/pdf", validateParams(idParamSchema), controller.getItemPdf);
router.get("/:id", validateParams(idParamSchema), controller.getById);
router.post("/", validateBody(createItemSchema), controller.create);
router.put(
  "/:id",
  validateParams(idParamSchema),
  validateBody(updateItemSchema),
  controller.update,
);
router.patch(
  "/:id/status",
  validateParams(idParamSchema),
  validateBody(updateItemStatusSchema),
  controller.updateStatus,
);
router.delete("/:id", validateParams(idParamSchema), controller.delete);

export default router;
