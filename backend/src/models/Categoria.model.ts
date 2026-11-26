import type { categoria, Prisma, PrismaClient } from "../generated/prisma/client.js";
import { prisma as defaultPrisma } from "../config/db.js";
import type {
  NameCreated,
  NameUpdated,
} from "../validations/name.validation.js";
import type {
  FindPaginatedOptions,
  PaginatedResult,
} from "../types/pagination.js";

export class CategoriaModel {
  constructor(private readonly db: PrismaClient = defaultPrisma) { }

  /**
   * Obtiene todas las categorías ordenadas alfabéticamente
   */
  async findAll(direction: "asc" | "desc" = "asc"): Promise<categoria[]> {
    return this.db.categoria.findMany({
      orderBy: { name: direction },
    });
  }

  /**
   * Obtiene todas las categorías incluyendo el conteo de artículos asociados
   */
  async findAllWithCount(direction: "asc" | "desc" = "asc") {
    return this.db.categoria.findMany({
      orderBy: { name: direction },
      include: {
        _count: {
          select: { item: true },
        },
      },
    });
  }

  /**
   * Búsqueda paginada y filtrada por coincidencia insensible a mayúsculas/minúsculas.
   * Ejecuta la consulta de datos y el conteo en paralelo para máxima eficiencia.
   */
  async findPaginated(
    options: FindPaginatedOptions = {},
  ): Promise<PaginatedResult<categoria>> {
    const MAX_LIMIT = 100;
    const page = Math.max(1, Math.floor(options.page ?? 1));
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Math.floor(options.limit ?? 10)),
    );
    const rawSearch = options.search?.trim();
    const terms = rawSearch ? rawSearch.split(/\s+/).filter(Boolean) : [];
    const skip = (page - 1) * limit;

    const where: Prisma.categoriaWhereInput =
      terms.length > 0
        ? {
          AND: terms.map((term) => ({
            name: {
              contains: term,
              mode: "insensitive" as const,
            },
          })),
        }
        : {};

    const [data, totalItems] = await Promise.all([
      this.db.categoria.findMany({
        where,
        take: limit,
        skip,
        orderBy: [{ name: "asc" }, { id: "asc" }],
      }),
      this.db.categoria.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Busca una categoría por su ID primario
   */
  async findById(id: number): Promise<categoria | null> {
    return this.db.categoria.findUnique({
      where: { id },
    });
  }

  /**
   * Busca una categoría por su nombre exacto 
   */
  async findByName(name: string): Promise<categoria | null> {
    return this.db.categoria.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
      },
    });
  }

  /**
   * Verificación ultrarrápida de existencia de registro
   */
  async exists(id: number): Promise<boolean> {
    const count = await this.db.categoria.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Crea una nueva categoría
   */
  async create(data: NameCreated): Promise<categoria> {
    return this.db.categoria.create({
      data: {
        name: data.name.trim(),
      },
    });
  }

  /**
   * Actualiza el nombre de una categoría existente
   */
  async update(id: number, data: NameUpdated): Promise<categoria> {
    return this.db.categoria.update({
      where: { id },
      data: {
        name: data.name.trim(),
      },
    });
  }

  /**
   * Elimina una categoría por su ID
   */
  async delete(id: number): Promise<categoria> {
    return this.db.categoria.delete({
      where: { id },
    });
  }

  /**
   * Elimina múltiples categorías en lote según lista de IDs
   */
  async deleteMany(ids: number[]): Promise<Prisma.BatchPayload> {
    return this.db.categoria.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }
}

export { CategoriaModel as CategoriaService };
