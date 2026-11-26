import multer from "multer";
import { AppError } from "./globalError.middleware.js";

// Almacenamiento en memoria para procesar buffers directamente
const storage = multer.memoryStorage();

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

const ALLOWED_EXCEL_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel",
];

/**
 * Middleware para subida de una sola imagen
 */
export const uploadSingleImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB máximo
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          "Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG o WEBP.",
          400,
          "INVALID_FILE_TYPE",
        ),
      );
    }
  },
}).single("image");

/**
 * Middleware para subida de múltiples imágenes (hasta 5 simultáneas)
 */
export const uploadMultipleImages = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          "Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG o WEBP.",
          400,
          "INVALID_FILE_TYPE",
        ),
      );
    }
  },
}).array("images", 5);

/**
 * Middleware para subida de archivo Excel (.xlsx / .xls)
 */
export const uploadExcelFile = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB máximo
  },
  fileFilter: (_req, file, cb) => {
    if (
      ALLOWED_EXCEL_TYPES.includes(file.mimetype) ||
      file.originalname.endsWith(".xlsx") ||
      file.originalname.endsWith(".xls")
    ) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          "Tipo de archivo no permitido. Solo se aceptan archivos Excel (.xlsx o .xls).",
          400,
          "INVALID_FILE_TYPE",
        ),
      );
    }
  },
}).single("file");
