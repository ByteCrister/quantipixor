/**
 * Resizes a source image blob to the exact given width and height,
 * returning a new PNG blob. The original image will be stretched/squashed
 * to fit exactly into the target dimensions—no cropping or letterboxing
 * is performed.
 *
 * @param blob - The original image blob (e.g., from a file input or fetch).
 * @param width - The desired output width in pixels.
 * @param height - The desired output height in pixels.
 * @returns A Promise that resolves with a Blob containing the resized image
 *          in PNG format. The PNG format is lossless; the quality parameter
 *          is not applicable here.
 */
export async function resizeImageToBlob(
  blob: Blob,
  width: number,
  height: number,
): Promise<Blob> {
  // 1. Decode the blob into an ImageBitmap.
  //    createImageBitmap is asynchronous and provides a lightweight,
  //    decodable image object directly usable with the canvas API.
  const img = await createImageBitmap(blob);

  // 2. Create an offscreen canvas at the target dimensions.
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  // 3. Obtain the 2D rendering context.
  const ctx = canvas.getContext("2d")!;

  // 4. Draw the entire source image onto the canvas, scaling it to exactly
  //    fill the target width and height. This will distort the image if the
  //    original aspect ratio does not match the target dimensions.
  ctx.drawImage(img, 0, 0, width, height);

  // 5. Convert the canvas content to a PNG blob.
  //    The MIME type 'image/png' ensures a lossless result; the optional
  //    quality parameter is ignored for PNG.
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b!), "image/png");
  });
}
