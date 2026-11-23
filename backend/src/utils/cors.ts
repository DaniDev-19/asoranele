import "dotenv/config";

export const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim()).filter((origin) => origin.length > 0) ?? [],
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
