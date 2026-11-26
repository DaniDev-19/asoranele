import { z } from "zod";

export const itemStatusEnum = z.enum(
  ["disponible", "agotado", "inactivo", "descontinuado"],
  {
    message: "El estado debe ser: disponible, agotado, inactivo o descontinuado",
  },
);

export const createItemSchema = z.object({
  name: z
    .string({ message: "El nombre es obligatorio" })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(350, "El nombre no puede exceder los 350 caracteres"),
  price: z.coerce
    .number({ message: "El precio debe ser un número válido" })
    .min(0, "El precio no puede ser negativo"),
  description: z
    .string()
    .trim()
    .max(5000, "La descripción no puede exceder 5000 caracteres")
    .nullish(),
  status: itemStatusEnum.default("disponible"),
  categoria_id: z.coerce
    .number()
    .int("El ID de categoría debe ser un entero")
    .positive("El ID de categoría debe ser positivo")
    .nullish(),
  unidad_id: z.coerce
    .number()
    .int("El ID de unidad debe ser un entero")
    .positive("El ID de unidad debe ser positivo")
    .nullish(),
  image_ids: z
    .array(z.number().int().positive("Los IDs de imágenes deben ser enteros positivos"))
    .max(10, "No se pueden asociar más de 10 imágenes por artículo")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "No se permiten IDs de imágenes duplicados",
    })
    .optional(),
});

export const updateItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(350, "El nombre no puede exceder los 350 caracteres")
    .optional(),
  price: z.coerce
    .number({ message: "El precio debe ser un número válido" })
    .min(0, "El precio no puede ser negativo")
    .optional(),
  description: z
    .string()
    .trim()
    .max(5000, "La descripción no puede exceder 5000 caracteres")
    .nullish(),
  status: itemStatusEnum.optional(),
  categoria_id: z.coerce
    .number()
    .int("El ID de categoría debe ser un entero")
    .positive("El ID de categoría debe ser positivo")
    .nullish(),
  unidad_id: z.coerce
    .number()
    .int("El ID de unidad debe ser un entero")
    .positive("El ID de unidad debe ser positivo")
    .nullish(),
  image_ids: z
    .array(z.number().int().positive("Los IDs de imágenes deben ser enteros positivos"))
    .max(10, "No se pueden asociar más de 10 imágenes por artículo")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "No se permiten IDs de imágenes duplicados",
    })
    .optional(),
});

export const itemQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  categoria_id: z.coerce.number().int().positive().optional(),
  unidad_id: z.coerce.number().int().positive().optional(),
  status: itemStatusEnum.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.enum(["id", "name", "price", "status"]).default("id"),
  orderDirection: z.enum(["asc", "desc"]).default("desc"),
});

export const deleteManyItemsSchema = z.object({
  ids: z
    .array(z.number().int().positive("Los IDs deben ser enteros positivos"))
    .min(1, "Debes enviar al menos un ID")
    .max(50, "No puedes eliminar más de 50 artículos por solicitud")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "No repitas IDs de artículos",
    }),
});

export const updateItemStatusSchema = z.object({
  status: itemStatusEnum,
});

export type ItemStatus = z.infer<typeof itemStatusEnum>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type UpdateItemStatusInput = z.infer<typeof updateItemStatusSchema>;
export type ItemQueryParams = z.infer<typeof itemQuerySchema>;
export type DeleteManyItemsInput = z.infer<typeof deleteManyItemsSchema>;
