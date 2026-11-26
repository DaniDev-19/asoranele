import PDFDocument from "pdfkit";
import type { ItemWithRelations } from "../models/Item.model.js";
import type { tasa_cambio } from "../generated/prisma/client.js";

/**
 * Servicio de Generación de Documentos PDF Oficiales
 * Diseñado con PDFKit para fichas técnicas y catálogos de productos.
 */
export class PdfService {
  /**
   * Genera la Ficha Técnica de un artículo individual con sus conversiones de moneda
   */
  public static async generateItemPdf(
    item: ItemWithRelations,
    tasa?: tasa_cambio | null,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        info: {
          Title: `Ficha Técnica - ${item.name || "Artículo"}`,
          Author: "Asoranele Platform",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err: Error) => reject(err));

      const priceUsd = item.price ? Number(item.price) : 0;
      const bcvRate = tasa?.dolar_bcv ? Number(tasa.dolar_bcv) : null;
      const parRate = tasa?.dolar_paralelo ? Number(tasa.dolar_paralelo) : null;

      // --- ENCABEZADO ---
      doc
        .rect(40, 40, 515, 60)
        .fill("#1E3A8A"); // Azul institucional

      doc
        .fillColor("#FFFFFF")
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("ASORANELE PLATFORM", 55, 52, { align: "left" });

      doc
        .fontSize(10)
        .font("Helvetica")
        .text("FICHA TÉCNICA DE PRODUCTO / COTIZACIÓN", 55, 75, { align: "left" });

      doc
        .fontSize(8)
        .fillColor("#E2E8F0")
        .text(`Generado: ${new Date().toLocaleString("es-VE")}`, 380, 75, {
          align: "right",
          width: 160,
        });

      // --- NOMBRE Y ESTADO DEL PRODUCTO ---
      doc.moveDown(3);
      doc
        .fillColor("#0F172A")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(item.name || "Sin nombre", 40, 120);

      const statusColor =
        item.status === "disponible"
          ? "#16A34A"
          : item.status === "agotado"
          ? "#DC2626"
          : "#64748B";

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor(statusColor)
        .text(`ESTADO: ${(item.status || "DISPONIBLE").toUpperCase()}`, 40, 142);

      // --- LÍNEA DIVISORIA ---
      doc
        .strokeColor("#E2E8F0")
        .lineWidth(1)
        .moveTo(40, 160)
        .lineTo(555, 160)
        .stroke();

      // --- BLOQUE DE PRECIOS Y DIVISAS ---
      doc
        .rect(40, 175, 515, 80)
        .fillAndStroke("#F8FAFC", "#CBD5E1");

      doc
        .fillColor("#1E3A8A")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("VALORACIÓN COMERCIAL", 55, 185);

      doc
        .fillColor("#0F172A")
        .fontSize(20)
        .font("Helvetica-Bold")
        .text(`$${priceUsd.toFixed(2)} USD`, 55, 205);

      if (bcvRate) {
        const bsBcv = (priceUsd * bcvRate).toFixed(2);
        doc
          .fillColor("#334155")
          .fontSize(11)
          .font("Helvetica")
          .text(`Bs. ${bsBcv} (Tasa BCV: ${bcvRate.toFixed(2)})`, 240, 202);
      }

      if (parRate) {
        const bsPar = (priceUsd * parRate).toFixed(2);
        doc
          .fillColor("#64748B")
          .fontSize(10)
          .font("Helvetica")
          .text(`Bs. ${bsPar} (Tasa Paralelo/USDT: ${parRate.toFixed(2)})`, 240, 222);
      }

      // --- ESPECIFICACIONES TÉCNICAS (TABLA) ---
      let y = 275;
      doc
        .fillColor("#1E3A8A")
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("DETALLES Y CLASIFICACIÓN", 40, y);

      y += 20;

      const details = [
        { label: "ID de Registro", value: `#${item.id}` },
        { label: "Categoría", value: item.categoria?.name || "Sin categoría" },
        { label: "Unidad de Medida", value: item.unidad?.name || "Unidad estándar" },
        { label: "Imágenes Vinculadas", value: `${item.item_image?.length || 0} archivo(s)` },
      ];

      for (let i = 0; i < details.length; i++) {
        const d = details[i]!;
        const rowY = y + i * 22;

        doc
          .rect(40, rowY, 515, 22)
          .fill(i % 2 === 0 ? "#F1F5F9" : "#FFFFFF");

        doc
          .fillColor("#475569")
          .fontSize(9)
          .font("Helvetica-Bold")
          .text(d.label, 50, rowY + 6);

        doc
          .fillColor("#0F172A")
          .fontSize(9)
          .font("Helvetica")
          .text(d.value, 200, rowY + 6);
      }

      // --- DESCRIPCIÓN ---
      y += details.length * 22 + 25;
      doc
        .fillColor("#1E3A8A")
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("DESCRIPCIÓN DEL ARTÍCULO", 40, y);

      y += 18;
      doc
        .fillColor("#334155")
        .fontSize(9.5)
        .font("Helvetica")
        .text(
          item.description || "No se ha proporcionado una descripción detallada para este producto.",
          40,
          y,
          { width: 515, align: "justify", lineGap: 3 },
        );

      // --- PIE DE PÁGINA ---
      doc
        .fontSize(8)
        .fillColor("#94A3B8")
        .text(
          "Asoranele Platform © Documento generado electrónicamente. Precios sujetos a variaciones cambiarias.",
          40,
          780,
          { align: "center", width: 515 },
        );

      doc.end();
    });
  }

  /**
   * Genera un catálogo tabulado en PDF de múltiples artículos
   */
  public static async generateCatalogPdf(
    items: ItemWithRelations[],
    tasa?: tasa_cambio | null,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err: Error) => reject(err));

      const bcvRate = tasa?.dolar_bcv ? Number(tasa.dolar_bcv) : null;

      // Encabezado
      doc
        .rect(40, 40, 515, 45)
        .fill("#1E3A8A");

      doc
        .fillColor("#FFFFFF")
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("CATÁLOGO OFICIAL DE ARTÍCULOS - ASORANELE", 55, 55);

      let currentY = 100;

      // Encabezado de tabla
      doc.rect(40, currentY, 515, 20).fill("#334155");
      doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold");
      doc.text("ID", 45, currentY + 6);
      doc.text("NOMBRE", 80, currentY + 6);
      doc.text("PRECIO ($)", 270, currentY + 6);
      doc.text("PRECIO (BS)", 340, currentY + 6);
      doc.text("CATEGORÍA", 415, currentY + 6);
      doc.text("ESTADO", 495, currentY + 6);

      currentY += 20;

      for (let i = 0; i < items.length; i++) {
        const item = items[i]!;

        // Nueva página si se acerca al final
        if (currentY > 740) {
          doc.addPage();
          currentY = 50;
        }

        const priceUsd = item.price ? Number(item.price) : 0;
        const priceBs = bcvRate ? (priceUsd * bcvRate).toFixed(2) : "N/D";

        doc
          .rect(40, currentY, 515, 18)
          .fill(i % 2 === 0 ? "#F8FAFC" : "#FFFFFF");

        doc.fillColor("#0F172A").fontSize(8).font("Helvetica");
        doc.text(String(item.id), 45, currentY + 5);
        doc.text((item.name || "").substring(0, 32), 80, currentY + 5);
        doc.text(`$${priceUsd.toFixed(2)}`, 270, currentY + 5);
        doc.text(`Bs. ${priceBs}`, 340, currentY + 5);
        doc.text((item.categoria?.name || "N/A").substring(0, 16), 415, currentY + 5);
        doc.text(item.status.substring(0, 10).toUpperCase(), 495, currentY + 5);

        currentY += 18;
      }

      doc.end();
    });
  }
}
