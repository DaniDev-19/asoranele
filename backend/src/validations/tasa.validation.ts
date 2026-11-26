import { z } from "zod";

export const createTasaSchema = z.object({
  dolar_bcv: z.coerce
    .number({ message: "El valor del Dólar BCV es obligatorio" })
    .positive("La tasa del Dólar BCV debe ser mayor a 0"),
  dolar_paralelo: z.coerce
    .number({ message: "El valor del Dólar Paralelo es obligatorio" })
    .positive("La tasa del Dólar Paralelo debe ser mayor a 0"),
  euro_bcv: z.coerce
    .number({ message: "El valor del Euro BCV es obligatorio" })
    .positive("La tasa del Euro BCV debe ser mayor a 0"),
  euro_paralelo: z.coerce
    .number({ message: "El valor del Euro Paralelo es obligatorio" })
    .positive("La tasa del Euro Paralelo debe ser mayor a 0"),
});

export const convertQuerySchema = z.object({
  amount: z.coerce
    .number({ message: "El monto debe ser un número válido" })
    .positive("El monto a convertir debe ser mayor a 0"),
  from: z.enum(["USD", "EUR", "VES"], {
    message: "La moneda de origen debe ser: USD, EUR o VES",
  }),
});

export const tasaPaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateTasaInput = z.infer<typeof createTasaSchema>;
export type ConvertQueryInput = z.infer<typeof convertQuerySchema>;
export type TasaPaginationQuery = z.infer<typeof tasaPaginationQuerySchema>;
