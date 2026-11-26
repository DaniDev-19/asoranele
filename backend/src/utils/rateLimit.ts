import rateLimit from "express-rate-limit";

/**
 * Limitador global para la API general
 * Permite hasta 300 peticiones por ventana de 15 minutos por IP
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      status: "error",
      code: "TOO_MANY_REQUESTS",
      message:
        "Demasiadas solicitudes desde esta IP. Por favor, inténtelo de nuevo en 15 minutos.",
    });
  },
});

/**
 * Limitador estricto para operaciones costosas o de mutación frecuente
 * (subida de imágenes, sincronización con APIs externas, importaciones masivas)
 * Permite hasta 30 peticiones por ventana de 15 minutos
 */
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      status: "error",
      code: "TOO_MANY_REQUESTS",
      message:
        "Límite de operaciones alcanzado para esta acción. Por favor, espere 15 minutos.",
    });
  },
});
