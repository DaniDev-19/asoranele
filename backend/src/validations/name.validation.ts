import { z } from "zod";

const nameSchemaCreated = z.object({
    name: z.string({
        error: "Error el nombre debe tener una cadena texto valida"}).nonempty("El nombre es obligatorio").min(2, "El campo debe tener minimo 2 caracteres").max(250, "El campo debe tener maximo 250 caracteres")
});

export type Name = z.infer<typeof nameSchemaCreated>;