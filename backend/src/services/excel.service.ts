import ExcelJS from "exceljs";
import type { PrismaClient } from "../generated/prisma/client.js";
import type { ItemWithRelations } from "../models/Item.model.js";

export interface ImportResult {
  totalRows: number;
  imported: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

/**
 * Servicio de Exportación e Importación de Archivos Excel
 * Utiliza ExcelJS con estilos corporativos y validaciones de datos.
 */
export class ExcelService {
  /**
   * Exporta un listado de artículos a un archivo Excel (.xlsx) en memoria
   */
  public static async exportItemsToBuffer(
    items: ItemWithRelations[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Asoranele Platform";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Artículos", {
      views: [{ showGridLines: true }],
    });

    // Definición de columnas
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Nombre del Artículo", key: "name", width: 35 },
      { header: "Precio (USD)", key: "price", width: 16 },
      { header: "Estado", key: "status", width: 16 },
      { header: "Categoría", key: "categoria", width: 22 },
      { header: "Unidad", key: "unidad", width: 18 },
      { header: "Descripción", key: "description", width: 45 },
      { header: "N° Imágenes", key: "imagesCount", width: 14 },
    ];

    // Estilo del encabezado
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E3A8A" }, // Azul marino corporativo
      };
      cell.font = {
        name: "Calibri",
        size: 11,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // Carga de filas de datos
    for (const item of items) {
      const row = worksheet.addRow({
        id: item.id,
        name: item.name ?? "Sin nombre",
        price: item.price ? Number(item.price) : 0,
        status: (item.status || "disponible").toUpperCase(),
        categoria: item.categoria?.name ?? "Sin categoría",
        unidad: item.unidad?.name ?? "Sin unidad",
        description: item.description ?? "",
        imagesCount: item.item_image?.length ?? 0,
      });

      row.height = 20;

      // Formato para la celda de precio
      const priceCell = row.getCell("price");
      priceCell.numFmt = '"$"#,##0.00';
      priceCell.alignment = { horizontal: "right", vertical: "middle" };

      // Centrar columnas clave
      row.getCell("id").alignment = { horizontal: "center", vertical: "middle" };
      row.getCell("status").alignment = { horizontal: "center", vertical: "middle" };
      row.getCell("imagesCount").alignment = { horizontal: "center", vertical: "middle" };
    }

    // Auto-ajustar bordes
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });
    });

    const uint8Array = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8Array);
  }

  /**
   * Importa artículos masivamente desde un archivo Excel subido
   */
  public static async importItemsFromBuffer(
    buffer: Buffer,
    db: PrismaClient,
  ): Promise<ImportResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error("El archivo Excel no contiene ninguna hoja válida.");
    }

    const errors: Array<{ row: number; error: string }> = [];
    let imported = 0;
    const totalRows = worksheet.rowCount - 1; // Descontar cabecera

    // Cache local de categorías y unidades para minimizar queries
    const categoriasMap = new Map<string, number>();
    const unidadesMap = new Map<string, number>();

    const existingCategorias = await db.categoria.findMany();
    for (const c of existingCategorias) {
      if (c.name) categoriasMap.set(c.name.toLowerCase().trim(), c.id);
    }

    const existingUnidades = await db.unidad.findMany();
    for (const u of existingUnidades) {
      if (u.name) unidadesMap.set(u.name.toLowerCase().trim(), u.id);
    }

    // Iterar filas a partir de la 2da fila
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);

      // Si la fila está vacía, continuar
      if (!row.hasValues) continue;

      try {
        const rawName = row.getCell(2).text?.trim();
        const rawPrice = row.getCell(3).value;
        const rawStatus = row.getCell(4).text?.trim().toLowerCase() || "disponible";
        const rawCategoria = row.getCell(5).text?.trim();
        const rawUnidad = row.getCell(6).text?.trim();
        const rawDescription = row.getCell(7).text?.trim() || null;

        if (!rawName || rawName.length < 2) {
          throw new Error("El nombre del artículo es obligatorio y debe tener al menos 2 caracteres.");
        }

        const price = Number(rawPrice);
        if (Number.isNaN(price) || price < 0) {
          throw new Error("El precio debe ser un número mayor o igual a 0.");
        }

        // Resolver Categoría (existente o crear sobre la marcha)
        let categoria_id: number | null = null;
        if (rawCategoria) {
          const catKey = rawCategoria.toLowerCase();
          if (categoriasMap.has(catKey)) {
            categoria_id = categoriasMap.get(catKey)!;
          } else {
            const newCat = await db.categoria.create({
              data: { name: rawCategoria },
            });
            categoriasMap.set(catKey, newCat.id);
            categoria_id = newCat.id;
          }
        }

        // Resolver Unidad (existente o crear sobre la marcha)
        let unidad_id: number | null = null;
        if (rawUnidad) {
          const unKey = rawUnidad.toLowerCase();
          if (unidadesMap.has(unKey)) {
            unidad_id = unidadesMap.get(unKey)!;
          } else {
            const newUn = await db.unidad.create({
              data: { name: rawUnidad },
            });
            unidadesMap.set(unKey, newUn.id);
            unidad_id = newUn.id;
          }
        }

        const validStatus = ["disponible", "agotado", "inactivo", "descontinuado"].includes(
          rawStatus,
        )
          ? rawStatus
          : "disponible";

        await db.item.create({
          data: {
            name: rawName,
            price,
            status: validStatus,
            description: rawDescription,
            categoria_id,
            unidad_id,
          },
        });

        imported++;
      } catch (err: any) {
        errors.push({
          row: rowNumber,
          error: err.message || "Error desconocido al procesar la fila.",
        });
      }
    }

    return {
      totalRows: Math.max(0, totalRows),
      imported,
      failed: errors.length,
      errors,
    };
  }
}
