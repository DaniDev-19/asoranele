import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import express from "express";
import { corsOptions } from "./utils/cors.js";
import { helmetConfig } from "./utils/helmet.js";
import {
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
} from "./middleware/globalError.middleware.js";

const app = express();
const serverName = process.env.SERVER_NAME || "Asoranele PlatForm";

app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet(helmetConfig));
app.use(morgan("dev"));
app.use(requestIdMiddleware);



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

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
