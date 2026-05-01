/**
 * Probes whether the browser’s `canvas.toBlob` method can successfully encode an image
 * in the given MIME format.
 *
 * It creates an off‑screen canvas, fills it with a known color, and then attempts to
 * call `toBlob` with the specified MIME type. If the resulting blob is non‑null and has
 * a positive size, the MIME type is considered supported.
 *
 * @param mime - The MIME type to test, e.g. `"image/webp"` or `"image/jpeg"`.
 * @param quality - Optional encoder quality (0‑1), passed through to `toBlob` (ignored
 *                  for lossless formats like PNG).
 * @returns A Promise that resolves to `true` if the format is supported, `false` otherwise.
 */
export function probeCanvasMime(
  mime: string,
  quality?: number,
): Promise<boolean> {
  return new Promise((resolve) => {
    // If the Document object isn’t available (e.g., running in a non‑browser
    // environment), we can’t create a canvas. Report the format as unsupported.
    if (typeof document === "undefined") {
      resolve(false);
      return;
    }

    // Create a tiny 2×2 pixel canvas – just enough to exercise the encoder.
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      // No 2D context means we can’t draw; treat the MIME as unsupported.
      resolve(false);
      return;
    }

    // Draw a recognizable solid color (this exact value doesn’t matter,
    // we only need a non‑empty image to feed the encoder).
    ctx.fillStyle = "#7a8fb8"; // a bluish‑gray
    ctx.fillRect(0, 0, 2, 2);

    // Try to encode the canvas content as the requested MIME type.
    canvas.toBlob(
      (blob) => {
        // If we get a non‑null blob with actual content, the format works.
        // Some browsers may return null for unsupported types (e.g., image/webp
        // in older Safari) or return a zero‑length blob.
        resolve(blob !== null && blob.size > 0);
      },
      mime,
      quality,
    );
  });
}