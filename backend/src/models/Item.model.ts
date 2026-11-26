import type { Prisma, PrismaClient, item } from "../generated/prisma/client.js";
import { prisma as defaultPrisma } from "../config/db.js";
import { ImageStorageService } from "../services/image_r2.service.js";
import type { PaginatedResult } from "../types/pagination.js";
import type {
  CreateItemInput,
  ItemQueryParams,
  ItemStatus,
  UpdateItemInput,
} from "../validations/item.validation.js";


export const itemIncludeRelations = {
  categoria: true,
  unidad: true,
  item_image: {
    include: {
      imagen: true,
    },
    orderBy: {
      orden: "asc" as const,
    },
  },
} satisfies Prisma.itemInclude;

export type ItemWithRelations = Prisma.itemGetPayload<{
  include: typeof itemIncludeRelations;
}>;


export class ItemModel {
  constructor(private readonly db: PrismaClient = defaultPrisma) { }

  /**
   * Obtiene todos los artículos con relaciones básicas
   */
  async findAll(): Promise<ItemWithRelations[]> {
    return this.db.item.findMany({
      include: itemIncludeRelations,
      orderBy: { id: "desc" },
    });
  }

  /**
   * Búsqueda paginada con filtros combinados
   */
  async findPaginated(
    options: ItemQueryParams,
  ): Promise<PaginatedResult<ItemWithRelations>> {
    const MAX_LIMIT = 100;
    const page = Math.max(1, Math.floor(options.page ?? 1));
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Math.floor(options.limit ?? 10)),
    );
    const skip = (page - 1) * limit;

    const where: Prisma.itemWhereInput = {};
    const andConditions: Prisma.itemWhereInput[] = [];

    if (options.search) {
      const rawSearch = options.search.trim();
      const terms = rawSearch.split(/\s+/).filter(Boolean);

      if (terms.length > 0) {
        andConditions.push(
          ...terms.map((term) => ({
            OR: [
              { name: { contains: term, mode: "insensitive" as const } },
              { description: { contains: term, mode: "insensitive" as const } },
            ],
          })),
        );
      }
    }

    if (options.categoria_id) {
      andConditions.push({ categoria_id: options.categoria_id });
    }

    if (options.unidad_id) {
      andConditions.push({ unidad_id: options.unidad_id });
    }

    if (options.status) {
      andConditions.push({ status: options.status });
    }

    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      const priceFilter: Prisma.DecimalNullableFilter = {};
      if (options.minPrice !== undefined) {
        priceFilter.gte = options.minPrice;
      }
      if (options.maxPrice !== undefined) {
        priceFilter.lte = options.maxPrice;
      }
      andConditions.push({ price: priceFilter });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const sortBy = options.sortBy ?? "id";
    const orderDirection = options.orderDirection ?? "desc";

    const [data, totalItems] = await Promise.all([
      this.db.item.findMany({
        where,
        take: limit,
        skip,
        orderBy: [{ [sortBy]: orderDirection }],
        include: itemIncludeRelations,
      }),
      this.db.item.count({ where }),
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
   * Obtiene un artículo por ID con sus relaciones 
   */
  async findById(id: number): Promise<ItemWithRelations | null> {
    return this.db.item.findUnique({
      where: { id },
      include: itemIncludeRelations,
    });
  }

  /**
   * Verifica existencia rápida por ID
   */
  async exists(id: number): Promise<boolean> {
    const count = await this.db.item.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Crea un artículo y opcionalmente vincula sus imágenes mediante transacción
   */
  async create(data: CreateItemInput): Promise<ItemWithRelations> {
    return this.db.$transaction(async (tx) => {
      const newItem = await tx.item.create({
        data: {
          name: data.name.trim(),
          price: data.price,
          description: data.description?.trim() ?? null,
          status: data.status,
          categoria_id: data.categoria_id ?? null,
          unidad_id: data.unidad_id ?? null,
        },
      });

      if (data.image_ids && data.image_ids.length > 0) {
        const itemImagesData = data.image_ids.map((imagen_id, index) => ({
          item_id: newItem.id,
          imagen_id,
          orden: index + 1,
        }));

        await tx.item_image.createMany({
          data: itemImagesData,
        });
      }

      return tx.item.findUniqueOrThrow({
        where: { id: newItem.id },
        include: itemIncludeRelations,
      });
    });
  }

  /**
   * Actualiza los datos de un artículo y gestiona la sincronización de imágenes
   */
  async update(id: number, data: UpdateItemInput): Promise<ItemWithRelations> {
    return this.db.$transaction(async (tx) => {
      const updateData: Prisma.itemUpdateInput = {};

      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.price !== undefined) updateData.price = data.price;
      if (data.description !== undefined)
        updateData.description = data.description?.trim() ?? null;
      if (data.status !== undefined) updateData.status = data.status;

      if (data.categoria_id !== undefined) {
        updateData.categoria = data.categoria_id
          ? { connect: { id: data.categoria_id } }
          : { disconnect: true };
      }

      if (data.unidad_id !== undefined) {
        updateData.unidad = data.unidad_id
          ? { connect: { id: data.unidad_id } }
          : { disconnect: true };
      }

      await tx.item.update({
        where: { id },
        data: updateData,
      });

      // Sincronizar imágenes y limpiar huérfanas desasociadas del storage físico y BD
      if (data.image_ids !== undefined) {
        const previousImages = await tx.item_image.findMany({
          where: { item_id: id },
          select: { imagen_id: true },
        });

        const newImageIdsSet = new Set(data.image_ids);
        const removedImageIds = previousImages
          .map((p) => p.imagen_id)
          .filter((imgId) => !newImageIdsSet.has(imgId));

        await tx.item_image.deleteMany({
          where: { item_id: id },
        });

        if (data.image_ids.length > 0) {
          const itemImagesData = data.image_ids.map((imagen_id, index) => ({
            item_id: id,
            imagen_id,
            orden: index + 1,
          }));

          await tx.item_image.createMany({
            data: itemImagesData,
          });
        }

        // Limpiar del storage físico y BD las imágenes que ya no pertenezcan a ningún otro artículo
        for (const orphanId of removedImageIds) {
          const linksCount = await tx.item_image.count({
            where: { imagen_id: orphanId },
          });

          if (linksCount === 0) {
            const orphanRecord = await tx.imagen.findUnique({
              where: { id: orphanId },
            });
            if (orphanRecord?.url) {
              await ImageStorageService.deleteImage(orphanRecord.url);
            }
            await tx.imagen.delete({
              where: { id: orphanId },
            });
          }
        }
      }

      return tx.item.findUniqueOrThrow({
        where: { id },
        include: itemIncludeRelations,
      });
    });
  }

  /**
   * Actualiza únicamente el estado de un artículo
   */
  async updateStatus(
    id: number,
    status: ItemStatus,
  ): Promise<ItemWithRelations> {
    return this.db.item.update({
      where: { id },
      data: { status },
      include: itemIncludeRelations,
    });
  }

  /**
   * Obtiene métricas agregadas de artículos para paneles y dashboards
   */
  async getStats() {
    const [total, byStatus, withoutCategory, withoutUnit] = await Promise.all([
      this.db.item.count(),
      this.db.item.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      this.db.item.count({ where: { categoria_id: null } }),
      this.db.item.count({ where: { unidad_id: null } }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const group of byStatus) {
      statusCounts[group.status] = group._count._all;
    }

    return {
      total,
      disponibles: statusCounts["disponible"] ?? 0,
      agotados: statusCounts["agotado"] ?? 0,
      inactivos: statusCounts["inactivo"] ?? 0,
      descontinuados: statusCounts["descontinuado"] ?? 0,
      sinCategoria: withoutCategory,
      sinUnidad: withoutUnit,
    };
  }

  /**
   * Elimina un artículo por su ID y limpia sus imágenes huérfanas de R2 o Local
   */
  async delete(id: number): Promise<item> {
    return this.db.$transaction(async (tx) => {
      // 1. Obtener imágenes vinculadas antes de eliminar
      const linkedImages = await tx.item_image.findMany({
        where: { item_id: id },
        select: { imagen_id: true },
      });

      // 2. Eliminar el artículo (la BD cascade eliminará los vínculos en item_image)
      const deletedItem = await tx.item.delete({
        where: { id },
      });

      // 3. Limpiar del almacenamiento físico y de la BD las imágenes que no use otro artículo
      for (const { imagen_id } of linkedImages) {
        const remainingLinks = await tx.item_image.count({
          where: { imagen_id },
        });

        if (remainingLinks === 0) {
          const imgRecord = await tx.imagen.findUnique({
            where: { id: imagen_id },
          });
          if (imgRecord?.url) {
            await ImageStorageService.deleteImage(imgRecord.url);
          }
          await tx.imagen.delete({
            where: { id: imagen_id },
          });
        }
      }

      return deletedItem;
    });
  }

  /**
   * Elimina múltiples artículos en lote y limpia sus imágenes huérfanas
   */
  async deleteMany(ids: number[]): Promise<Prisma.BatchPayload> {
    return this.db.$transaction(async (tx) => {
      const linkedImages = await tx.item_image.findMany({
        where: { item_id: { in: ids } },
        select: { imagen_id: true },
      });

      const deleteBatch = await tx.item.deleteMany({
        where: { id: { in: ids } },
      });

      const imageIdsToCheck = [
        ...new Set(linkedImages.map((l) => l.imagen_id)),
      ];

      for (const imagen_id of imageIdsToCheck) {
        const remainingLinks = await tx.item_image.count({
          where: { imagen_id },
        });

        if (remainingLinks === 0) {
          const imgRecord = await tx.imagen.findUnique({
            where: { id: imagen_id },
          });
          if (imgRecord?.url) {
            await ImageStorageService.deleteImage(imgRecord.url);
          }
          await tx.imagen.delete({
            where: { id: imagen_id },
          });
        }
      }

      return deleteBatch;
    });
  }
}


export { ItemModel as ItemService };
