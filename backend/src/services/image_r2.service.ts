import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import type { StoredImageResult } from "../types/images.js";

export class ImageStorageService {
  private static s3Client: S3Client | null = null;
  private static readonly LOCAL_UPLOADS_DIR = path.resolve(
    process.cwd(),
    "uploads",
    "images",
  );

  /**
   * Determina si Cloudflare R2 está correctamente configurado
   */
  private static isR2Configured(): boolean {
    const {
      R2_ACCOUNT_ID,
      R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY,
      R2_BUCKET_NAME,
      STORAGE_DRIVER,
    } = process.env;

    if (STORAGE_DRIVER?.toLowerCase() === "local") {
      return false;
    }

    return Boolean(
      R2_ACCOUNT_ID &&
      R2_ACCESS_KEY_ID &&
      R2_SECRET_ACCESS_KEY &&
      R2_BUCKET_NAME,
    );
  }

  /**
   * Obtiene o inicializa la instancia del cliente S3 para Cloudflare R2
   */
  private static getS3Client(): S3Client {
    if (!this.s3Client) {
      const accountId = process.env.R2_ACCOUNT_ID?.trim() || "";
      const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim() || "";
      const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim() || "";

      this.s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }

    return this.s3Client;
  }

  /**
   * Asegura que el directorio local de almacenamiento exista
   */
  private static async ensureLocalDirectory(): Promise<void> {
    await fs.mkdir(this.LOCAL_UPLOADS_DIR, { recursive: true });
  }

  /**
   * Optimiza y convierte cualquier buffer de imagen a formato WebP ligero
   * Redimensiona a un máximo de 1600x1600 (ideal para e-commerce) y reduce peso hasta en un 85%
   */
  public static async processAndConvertToWebp(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 80,
        effort: 4,
      })
      .toBuffer();
  }

  /**
   * Procesa, convierte a WebP y guarda una imagen en Cloudflare R2 o en disco local
   */
  public static async uploadImage(
    file: Express.Multer.File,
    folder = "items",
  ): Promise<StoredImageResult> {
    // Optimización y conversión a WebP
    const webpBuffer = await this.processAndConvertToWebp(file.buffer);
    const filename = `${randomUUID()}.webp`;
    const key = `${folder}/${filename}`;

    // Si Cloudflare R2 está configurado, almacenar en R2
    if (this.isR2Configured()) {
      const bucketName = process.env.R2_BUCKET_NAME || "";
      const publicDomain =
        process.env.R2_PUBLIC_DOMAIN?.replace(/\/$/, "") || "";

      const client = this.getS3Client();

      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: webpBuffer,
          ContentType: "image/webp",
        }),
      );

      const url = publicDomain
        ? `${publicDomain}/${key}`
        : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucketName}/${key}`;

      return {
        url,
        key,
        provider: "r2",
        originalName: file.originalname,
        format: "webp",
        sizeInBytes: webpBuffer.length,
      };
    }

    // 3. Modo Local (Fallback)
    await this.ensureLocalDirectory();
    const filePath = path.join(this.LOCAL_UPLOADS_DIR, filename);

    await fs.writeFile(filePath, webpBuffer);

    const serverUrl = process.env.APP_URL?.replace(/\/$/, "") || "";
    const relativeUrl = `/uploads/images/${filename}`;
    const url = serverUrl ? `${serverUrl}${relativeUrl}` : relativeUrl;

    return {
      url,
      key: filename,
      provider: "local",
      originalName: file.originalname,
      format: "webp",
      sizeInBytes: webpBuffer.length,
    };
  }

  /**
   * Elimina un archivo de imagen del almacenamiento físico (R2 o Local)
   */
  public static async deleteImage(keyOrUrl: string): Promise<boolean> {
    try {
      if (this.isR2Configured() && (keyOrUrl.includes("/") || keyOrUrl.startsWith("http"))) {
        const bucketName = process.env.R2_BUCKET_NAME || "";
        const client = this.getS3Client();

        let key = keyOrUrl;
        if (keyOrUrl.startsWith("http")) {
          key = new URL(keyOrUrl).pathname.replace(/^\//, "");
        }

        await client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
          }),
        );

        return true;
      }

      // Eliminar de disco local
      const filename = path.basename(keyOrUrl);
      const filePath = path.join(this.LOCAL_UPLOADS_DIR, filename);

      await fs.unlink(filePath);
      return true;
    } catch {
      // Si el archivo ya no existía en disco o R2, no lanzar error
      return false;
    }
  }
}
