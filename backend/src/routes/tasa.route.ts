import { Router } from "express";
import { TasaController } from "../controllers/tasa.controller.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/schemaValid.middleware.js";
import { strictRateLimiter } from "../utils/rateLimit.js";
import { idParamSchema } from "../validations/name.validation.js";
import {
  convertQuerySchema,
  createTasaSchema,
  tasaPaginationQuerySchema,
} from "../validations/tasa.validation.js";

const router = Router();
const controller = new TasaController();

// Consulta de tasa vigente
router.get("/latest", controller.getLatest);
router.get("/current", controller.getLatest);

// Utilidad de conversión entre divisas
router.get("/convert", validateQuery(convertQuerySchema), controller.convert);

// Histórico de tasas
router.get(
  "/history",
  validateQuery(tasaPaginationQuerySchema),
  controller.getHistory,
);

// Sincronización automática con DolarAPI (protegida por rate limit estricto)
router.post("/sync", strictRateLimiter, controller.sync);

// Registro manual de tasas
router.post("/", validateBody(createTasaSchema), controller.createManual);

// Consulta por ID (con parámetro dinámico al final para evitar colisiones)
router.get("/:id", validateParams(idParamSchema), controller.getById);

export default router;
