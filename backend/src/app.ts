import path from "node:path";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import express from "express";
import { corsOptions } from "./utils/cors.js";
import { helmetConfig } from "./utils/helmet.js";
import { globalRateLimiter } from "./utils/rateLimit.js";
import {
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
} from "./middleware/globalError.middleware.js";

import categoriaRoutes from "./routes/categoria.route.js";
import unidadRoutes from "./routes/unidad.route.js";
import itemRoutes from "./routes/item.route.js";
import tasaRoutes from "./routes/tasa.route.js";
import imagenRoutes from "./routes/imagen.route.js";

const app = express();
const serverName = process.env.SERVER_NAME || "Asoranele PlatForm";

// Soporte para proxies inversos (Cloudflare / Nginx / Load Balancer)
app.set("trust proxy", 1);

app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet(helmetConfig));
app.use(morgan("dev"));
app.use(requestIdMiddleware);
app.use(globalRateLimiter);

// Servir archivos estáticos locales de imágenes
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  const start = performance.now();
  const timestamp = new Date().toISOString();
  const processingTime = `${(performance.now() - start).toFixed(2)} ms`;

  res.status(200).json({
    status: "ok",
    message: `Servidor ${serverName} funcionando correctamente`,
    timestamp,
    processingTime,
  });
});

app.use("/api/v1/categorias", categoriaRoutes);
app.use("/api/v1/unidades", unidadRoutes);
app.use("/api/v1/items", itemRoutes);
app.use("/api/v1/tasas", tasaRoutes);
app.use("/api/v1/images", imagenRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
