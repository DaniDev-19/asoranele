import type { PrismaClient } from "../generated/prisma/client.js";
import type { NameCreated, NameUpdated, DeleteManyInput } from "../validations/name.validation.js";

export class CategoriaService {
    constructor(private readonly db: PrismaClient) {}

    findAll() {
        return this.db.categoria.findMany({
            orderBy: { name: "desc" }
        });
    };

    findById (id: number) {
        return this.db.categoria.findUnique({
            where: { id }
        });
    };

    create(data: NameCreated) {
        return this.db.categoria.create({
            data
        });
    };

    update(id: number, data: NameUpdated ) {
        return this.db.categoria.update({
            where: { id }, data
        });
    };

    delete(id: number) {
        return this.db.categoria.delete({
            where: { id }
        });
    };

    deleteMany (ids: number[]) {
        return this.db.categoria.deleteMany({
            where: { id: {in: ids } },
        });
    }
}