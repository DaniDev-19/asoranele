import { Router } from "express";
import { CategoriaController } from "../controllers/categoria.controller.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/schemaValid.middleware.js";
import {
  deleteManySchema,
  idParamSchema,
  nameSchemaCreated,
  nameSchemaUpdated,
  paginationQuerySchema,
} from "../validations/name.validation.js";

const router = Router();
const controller = new CategoriaController();

router.get("/", validateQuery(paginationQuerySchema), controller.getAllPagination);
router.get("/all", controller.getAll);
router.get("/with-count", controller.getAllWithCount);

router.delete("/batch", validateBody(deleteManySchema), controller.deleteMany);

router.post("/", validateBody(nameSchemaCreated), controller.create);
router.get("/:id", validateParams(idParamSchema), controller.getById);
router.put("/:id", validateParams(idParamSchema), validateBody(nameSchemaUpdated), controller.update);
router.delete("/:id", validateParams(idParamSchema), controller.delete);

export default router;
