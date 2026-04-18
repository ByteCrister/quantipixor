/**
 * Applies an alpha mask to the original image and returns a data URL of the transparent PNG.
 * @param originalFile - The original image file
 * @param maskBlob - The grayscale mask blob (white = keep, black = remove)
 */
export async function applyMaskToImage(originalFile: File, maskBlob: Blob): Promise<string> {
  // Load original image
  const originalBitmap = await createImageBitmap(originalFile);
  // Load mask image
  const maskBitmap = await createImageBitmap(maskBlob);

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = originalBitmap.width;
  canvas.height = originalBitmap.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  if (!ctx) throw new Error('Could not get canvas context');

  // Draw original image
  ctx.drawImage(originalBitmap, 0, 0);

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Create a temporary canvas to get mask pixel data
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = maskBitmap.width;
  maskCanvas.height = maskBitmap.height;
  const maskCtx = maskCanvas.getContext('2d');
  if (!maskCtx) throw new Error('Could not get mask context');
  maskCtx.drawImage(maskBitmap, 0, 0);
  const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;

  // Apply mask as alpha channel
  for (let i = 0; i < data.length; i += 4) {
    // Map coordinates (assume same dimensions; if not, scaling would be needed)
    const maskIndex = i;
    // Use red channel of mask as alpha (grayscale, so R=G=B)
    const alpha = maskData[maskIndex] ?? 255;
    data[i + 3] = alpha;
  }

  ctx.putImageData(imageData, 0, 0);

  // Return as PNG data URL
  return canvas.toDataURL('image/png');
}