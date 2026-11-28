/**
 * Pre-comprime una imagen en el navegador a WebP antes de enviarla al backend.
 * Reduce el peso de fotos grandes (ej. 10MB -> ~250KB) para evitar timeouts en Cloudflare.
 */
export async function compressImageToWebp(
  file: File,
  maxDimension = 1600,
  quality = 0.82,
): Promise<File> {
  // Si no es imagen o ya es WebP pequeño (< 300KB), retornar tal cual
  if (!file.type.startsWith('image/') || (file.type === 'image/webp' && file.size < 300 * 1024)) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const compressedFile = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(compressedFile.size < file.size ? compressedFile : file);
        },
        'image/webp',
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
