import "dotenv/config";
import type { HelmetOptions } from "helmet";

export const helmetConfig: HelmetOptions = {
  crossOriginEmbedderPolicy: process.env.NODE_ENV === "production",
};