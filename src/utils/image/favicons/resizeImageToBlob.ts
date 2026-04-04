/**
 * Resize an image blob to exact dimensions using canvas.
 * Returns a PNG blob (quality parameter ignored for PNG).
 */
export async function resizeImageToBlob(
    blob: Blob,
    width: number,
    height: number
  ): Promise<Blob> {
    const img = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, width, height);
    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png');
    });
  }