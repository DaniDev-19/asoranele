import type { Prisma, PrismaClient, unidad } from "../generated/prisma/client.js";
import { prisma as defaultPrisma } from "../config/db.js";
import type {
  NameCreated,
  NameUpdated,
} from "../validations/name.validation.js";
import type {
  FindPaginatedOptions,
  PaginatedResult,
} from "../types/pagination.js";

export class UnidadModel {
  constructor(private readonly db: PrismaClient = defaultPrisma) { }

  /**
   * Obtiene todas las unidades de medida ordenadas alfabéticamente
   */
  async findAll(direction: "asc" | "desc" = "asc"): Promise<unidad[]> {
    return this.db.unidad.findMany({
      orderBy: { name: direction },
    });
  }

  /**
   * Obtiene todas las unidades incluyendo el conteo de artículos vinculados
   */
  async findAllWithCount(direction: "asc" | "desc" = "asc") {
    return this.db.unidad.findMany({
      orderBy: { name: direction },
      include: {
        _count: {
          select: { item: true },
        },
      },
    });
  }

  /**
   * Búsqueda paginada y filtrada con conteo concurrente (Promise.all)
   */
  async findPaginated(
    options: FindPaginatedOptions = {},
  ): Promise<PaginatedResult<unidad>> {
    const MAX_LIMIT = 100;
    const page = Math.max(1, Math.floor(options.page ?? 1));
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Math.floor(options.limit ?? 10)),
    );
    const rawSearch = options.search?.trim();
    const terms = rawSearch ? rawSearch.split(/\s+/).filter(Boolean) : [];
    const skip = (page - 1) * limit;

    const where: Prisma.unidadWhereInput =
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
      this.db.unidad.findMany({
        where,
        take: limit,
        skip,
        orderBy: [{ name: "asc" }, { id: "asc" }],
      }),
      this.db.unidad.count({ where }),
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
   * Busca una unidad por su clave primaria ID
   */
  async findById(id: number): Promise<unidad | null> {
    return this.db.unidad.findUnique({
      where: { id },
    });
  }

  /**
   * Busca una unidad por su nombre exacto (case-insensitive)
   */
  async findByName(name: string): Promise<unidad | null> {
    return this.db.unidad.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
      },
    });
  }

  /**
   * Verifica la existencia de un ID sin cargar columnas innecesarias
   */
  async exists(id: number): Promise<boolean> {
    const count = await this.db.unidad.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Registra una nueva unidad de medida
   */
  async create(data: NameCreated): Promise<unidad> {
    return this.db.unidad.create({
      data: {
        name: data.name.trim(),
      },
    });
  }

  /**
   * Modifica el nombre de una unidad existente
   */
  async update(id: number, data: NameUpdated): Promise<unidad> {
    return this.db.unidad.update({
      where: { id },
      data: {
        name: data.name.trim(),
      },
    });
  }

  /**
   * Elimina una unidad por su ID
   */
  async delete(id: number): Promise<unidad> {
    return this.db.unidad.delete({
      where: { id },
    });
  }

  /**
   * Elimina múltiples unidades en una sola operación
   */
  async deleteMany(ids: number[]): Promise<Prisma.BatchPayload> {
    return this.db.unidad.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }
}

export { UnidadModel as UnidadServices };
