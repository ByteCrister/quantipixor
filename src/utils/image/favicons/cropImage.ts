/**
 * Fetches an image from a given URL, crops it to the specified pixel rectangle,
 * and returns the result as a PNG Blob.
 *
 * @param imageSrc - The source URL of the image to be cropped. Must be a valid, accessible image URL.
 * @param pixelCrop - The cropping region defined in the original image's pixel coordinates.
 *                    It includes the top-left corner (x, y) and the dimensions (width, height).
 * @returns A Promise that resolves with a Blob containing the cropped image in PNG format.
 *          The blob will be of type 'image/png'.
 */
export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
): Promise<Blob> => {
  // 1. Fetch the remote image and convert it to a Blob.
  //    Then create an ImageBitmap from the blob. Using createImageBitmap is efficient
  //    because it decodes the image asynchronously and is ready for canvas drawing.
  const responseBlob = await fetch(imageSrc).then((r) => r.blob());
  const image = await createImageBitmap(responseBlob);

  // 2. Create an offscreen canvas with the exact dimensions of the cropped region.
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // 3. Get the 2D rendering context (non-null assertion because canvas always has one).
  const ctx = canvas.getContext("2d")!;

  // 4. Draw the cropped portion of the source image onto the canvas.
  //    Parameters:
  //    - Source image (ImageBitmap)
  //    - Source rectangle: (pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height)
  //      These coordinates are in the original image's pixel space.
  //    - Destination rectangle: (0, 0, pixelCrop.width, pixelCrop.height)
  //      We want the cropped part to fill the entire output canvas.
  ctx.drawImage(
    image,
    pixelCrop.x, // sx: X coordinate of the top-left corner of the source rect
    pixelCrop.y, // sy: Y coordinate of the top-left corner of the source rect
    pixelCrop.width, // sWidth: Width of the source rect to draw
    pixelCrop.height, // sHeight: Height of the source rect to draw
    0, // dx: X coordinate on the canvas where to place the top-left corner
    0, // dy: Y coordinate on the canvas where to place the top-left corner
    pixelCrop.width, // dWidth: Width to draw the image on the canvas (scale to fit)
    pixelCrop.height, // dHeight: Height to draw the image on the canvas (scale to fit)
  );

  // 5. Convert the canvas content to a PNG Blob and return it.
  //    Wrapping toBlob in a Promise because it is asynchronous.
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
};
