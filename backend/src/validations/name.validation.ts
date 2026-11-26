import { z } from "zod";

export const nameSchemaCreated = z.object({
  name: z
    .string({
      message: "El nombre debe ser una cadena de texto válida",
    })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(250, "El nombre no puede exceder los 250 caracteres"),
});

export const nameSchemaUpdated = z.object({
  name: z
    .string({
      message: "El nombre debe ser una cadena de texto válida",
    })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(250, "El nombre no puede exceder los 250 caracteres"),
});

export const deleteManySchema = z.object({
  ids: z
    .array(z.number().int().positive("Los IDs deben ser enteros positivos"))
    .min(1, "Debes enviar al menos un ID")
    .max(50, "No puedes eliminar más de 50 registros por solicitud")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "No se permiten IDs duplicados en la lista",
    }),
});

export const idParamSchema = z.object({
  id: z.coerce
    .number({ message: "El parámetro ID debe ser un número válido" })
    .int("El ID debe ser un número entero")
    .positive("El ID debe ser mayor a 0"),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1, "La página mínima es 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "El límite mínimo es 1")
    .max(100, "El límite máximo es 100")
    .default(10),
  search: z.string().trim().optional(),
});

export type DeleteManyInput = z.infer<typeof deleteManySchema>;
export type NameCreated = z.infer<typeof nameSchemaCreated>;
export type NameUpdated = z.infer<typeof nameSchemaUpdated>;
export type IdParam = z.infer<typeof idParamSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
