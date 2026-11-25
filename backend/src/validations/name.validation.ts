import { z } from "zod";

export const nameSchemaCreated = z.object({
  name: z
    .string({
      error: "Error el nombre debe tener una cadena texto valida",
    })
    .trim()
    .nonempty("El nombre es obligatorio")
    .min(2, "El campo debe tener minimo 2 caracteres")
    .max(250, "El campo debe tener maximo 250 caracteres"),
});

export const nameSchemaUpdated = z.object({
  name: z
    .string({
      error: "Error el nombre debe tener una cadena texto valida",
    })
    .trim()
    .nonempty("El nombre es obligatorio")
    .min(2, "El campo debe tener minimo 2 caracteres")
    .max(250, "El campo debe tener maximo 250 caracteres"),
});

export const deleteManySchema = z.object({
  ids: z
    .array(z.number().int().positive())
    .min(1, "Debes enviar al menos un ID")
    .max(50, "No puedes eliminar más de 50 categorías por solicitud")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "No repitas IDs",
    }),
});


export type DeleteManyInput = z.infer<typeof deleteManySchema>;
export type NameCreated = z.infer<typeof nameSchemaCreated>;
export type NameUpdated = z.infer<typeof nameSchemaUpdated>;
