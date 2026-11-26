import type { PrismaClient, imagen } from "../generated/prisma/client.js";
import { prisma as defaultPrisma } from "../config/db.js";
import { ImageStorageService } from "../services/image_r2.service.js";

export class ImagenModel {
  constructor(private readonly db: PrismaClient = defaultPrisma) { }

  /**
   * Obtiene imágenes paginadas
   */
  async findPaginated(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [data, totalItems] = await Promise.all([
      this.db.imagen.findMany({
        take: limit,
        skip,
        orderBy: { id: "desc" },
      }),
      this.db.imagen.count(),
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
   * Busca una imagen por ID
   */
  async findById(id: number): Promise<imagen | null> {
    return this.db.imagen.findUnique({
      where: { id },
    });
  }

  /**
   * Registra una nueva imagen en la base de datos
   */
  async create(url: string, alt_text?: string | null): Promise<imagen> {
    return this.db.imagen.create({
      data: {
        url,
        alt_text: alt_text?.trim() ?? null,
      },
    });
  }

  /**
   * Elimina la imagen del storage físico y de la base de datos
   */
  async delete(id: number): Promise<imagen> {
    const img = await this.findById(id);

    if (img?.url) {
      await ImageStorageService.deleteImage(img.url);
    }

    return this.db.imagen.delete({
      where: { id },
    });
  }

  /**
   * Limpieza de seguridad: Elimina imágenes huérfanas (que no están asociadas a ningún artículo)
   * Tanto de Cloudflare R2 / Local como de la base de datos para no embasurar almacenamiento.
   */
  async cleanupOrphanImages(): Promise<{ deletedCount: number }> {
    // Buscar imágenes que no tengan ningún vínculo en la tabla item_image
    const orphanImages = await this.db.imagen.findMany({
      where: {
        item_image: {
          none: {},
        },
      },
    });

    if (orphanImages.length === 0) {
      return { deletedCount: 0 };
    }

    // 1. Eliminar archivos del almacenamiento físico en paralelo
    await Promise.all(
      orphanImages.map((img) => ImageStorageService.deleteImage(img.url)),
    );

    // 2. Eliminar registros de la base de datos
    const orphanIds = orphanImages.map((img) => img.id);
    const deleteResult = await this.db.imagen.deleteMany({
      where: {
        id: { in: orphanIds },
      },
    });

    return { deletedCount: deleteResult.count };
  }
}
