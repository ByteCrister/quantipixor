import { getEffectiveImageMime } from "@/const/image-extensions.const";

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Determines the best canvas output MIME for a given source image MIME.
 *
 * The logic:
 * - WebP sources: keep as WebP.
 * - JPEG‑family sources (including pjpeg, jfif): use JPEG.
 * - Everything else (PNG, APNG, BMP, GIF, TIFF, HEIC, AVIF, ICO, SVG, etc.)
 *   is treated as the PNG‑family, meaning `compressImage` will later decide
 *   whether JPEG, WebP, or original is best based on alpha transparency.
 *
 * @param sourceMime - The MIME type of the original file (may contain charset info).
 * @returns The target canvas output MIME: `'image/jpeg'`, `'image/webp'`, or `'image/png'`.
 */
function canvasOutputMime(
  sourceMime: string,
): "image/jpeg" | "image/webp" | "image/png" {
  const m = sourceMime.toLowerCase().split(";")[0]?.trim() ?? sourceMime;
  if (m === "image/webp") return "image/webp";
  if (
    m === "image/jpeg" ||
    m === "image/jpg" ||
    m === "image/pjpeg" ||
    m === "image/jfif"
  ) {
    return "image/jpeg";
  }
  // PNG, APNG, BMP, GIF, TIFF, HEIC, AVIF, ICO, SVG → handled as PNG-family
  return "image/png";
}

/**
 * Promisified version of `canvas.toBlob`. Always resolves with a valid Blob
 * or rejects if `toBlob` returns null (e.g., unsupported MIME).
 *
 * @param canvas - The source canvas.
 * @param mime - Desired output MIME type (e.g. `'image/webp'`).
 * @param quality - Quality factor 0‑1 (ignored for lossless formats).
 * @returns Promise resolving to the encoded Blob.
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error(`canvas.toBlob returned null for ${mime}`)),
      mime,
      quality,
    );
  });
}

/**
 * Performs a quick check for alpha transparency by sampling a small region
 * (up to 128×128 pixels) from the canvas.
 *
 * @param ctx - The 2D context of the canvas.
 * @param width - Full canvas width.
 * @param height - Full canvas height.
 * @returns `true` if any sampled pixel has an alpha value less than 255;
 *          `false` otherwise (including when sampling is impossible).
 */
function hasAlphaChannel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): boolean {
  // Clamp sampling area to avoid performance issues with huge canvases.
  const sw = Math.min(width, 128);
  const sh = Math.min(height, 128);
  try {
    const { data } = ctx.getImageData(0, 0, sw, sh);
    // Alpha is every 4th byte (indices 3, 7, 11, …)
    for (let i = 3; i < data.length; i += 4) {
      if (data[i]! < 255) return true;
    }
  } catch {
    // If getImageData fails (e.g., tainted canvas), assume no alpha.
    return false;
  }
  return false;
}

/**
 * Given a list of candidate Blobs and a reference file size, returns the
 * smallest Blob that is strictly smaller than the reference, or `null`
 * if none qualifies.
 *
 * @param candidates - List of compressed Blobs to compare.
 * @param referenceSize - The original file size in bytes.
 * @returns The winning Blob or null.
 */
function smallest(candidates: Blob[], referenceSize: number): Blob | null {
  let best: Blob | null = null;
  for (const b of candidates) {
    if (b.size < referenceSize && (best === null || b.size < best.size)) {
      best = b;
    }
  }
  return best;
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Compresses an image file using the Canvas API while guaranteeing the output
 * is never larger than the original.
 *
 * **Guarantees:**
 * 1. The returned Blob is **never** larger than the original file.
 *    If every encoding attempt produces a file larger than the original,
 *    the original file bytes are returned unchanged.
 *
 * 2. For PNG‑family sources (including BMP, GIF, TIFF, etc.):
 *    - If the image has **no transparency**, both JPEG (on white background)
 *      and WebP are tried; the smallest result is returned.
 *    - If the image **has transparency**, only WebP is tried (since JPEG
 *      cannot represent alpha). The result is returned only if it is smaller.
 *    This ensures opaque PNGs (photos, screenshots mistakenly saved as PNG)
 *    receive maximal compression.
 *
 * 3. For JPEG and WebP sources: re‑encoded at the requested quality.
 *    The new version replaces the original only if it is strictly smaller
 *    (avoids inflating already highly compressed files).
 *
 * @param file - The original image File object (from input or drag-and-drop).
 * @param quality - Compression quality (0‑1). For JPEG/WebP, passed directly
 *                  to the encoder. Ignored for PNG (lossless).
 * @returns A Promise resolving to the compressed (or original) Blob.
 */
export async function compressImage(
  file: File,
  quality: number,
): Promise<Blob> {
  // ── 1. Determine source MIME type ──────────────────────────────────────────
  // Try to get a canonical MIME from our extension‑based map; fall back to
  // the browser‑reported type, or assume PNG if completely unknown.
  const sourceMime =
    getEffectiveImageMime(file) ??
    (file.type?.trim()
      ? (file.type.split(";")[0]?.trim() ?? file.type)
      : "image/png");

  const outMime = canvasOutputMime(sourceMime);

  // Helper to return the original file bytes with the correct MIME.
  // Used when no compression strategy beats the original size.
  const keepOriginal = (): Blob => file.slice(0, file.size, sourceMime);

  // ── 2. Load the image into a DOM Image element ─────────────────────────────
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new window.Image();
    const url = URL.createObjectURL(file);
    el.onload = () => {
      URL.revokeObjectURL(url);
      resolve(el);
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    el.src = url;
  });

  // ── 3. Draw the image onto an off‑screen canvas at its natural size ────────
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2D canvas context");

  ctx.drawImage(img, 0, 0);

  // ── 4. PNG‑family sources: multi‑strategy compression ──────────────────────
  if (outMime === "image/png") {
    const transparent = hasAlphaChannel(ctx, canvas.width, canvas.height);

    if (transparent) {
      // Transparency detected → only WebP is safe (lossy WebP preserves alpha).
      // WebP often achieves 3‑5× smaller files than PNG for similar quality.
      const webpBlob = await canvasToBlob(canvas, "image/webp", quality);
      return smallest([webpBlob], file.size) ?? keepOriginal();
    }

    // No transparency → try both WebP and JPEG on a white matte background.
    // For JPEG we must composite onto white to avoid unintended artifacts
    // (the original canvas may have an implicit black background).
    const jpgCanvas = document.createElement("canvas");
    jpgCanvas.width = canvas.width;
    jpgCanvas.height = canvas.height;
    const jpgCtx = jpgCanvas.getContext("2d");
    if (!jpgCtx)
      throw new Error("Failed to get 2D canvas context for JPEG pass");
    jpgCtx.fillStyle = "#ffffff";
    jpgCtx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
    jpgCtx.drawImage(canvas, 0, 0); // paint original image on top

    const [webpBlob, jpegBlob] = await Promise.all([
      canvasToBlob(canvas, "image/webp", quality),
      canvasToBlob(jpgCanvas, "image/jpeg", quality),
    ]);

    return smallest([webpBlob, jpegBlob], file.size) ?? keepOriginal();
  }

  // ── 5. JPEG / WebP sources: simple re‑encode ───────────────────────────────
  // For JPEG output, again we draw on white to avoid any stray alpha left
  // by the browser's internal decoding.
  if (outMime === "image/jpeg") {
    const jpgCanvas = document.createElement("canvas");
    jpgCanvas.width = canvas.width;
    jpgCanvas.height = canvas.height;
    const jpgCtx = jpgCanvas.getContext("2d");
    if (!jpgCtx)
      throw new Error("Failed to get 2D canvas context for JPEG pass");
    jpgCtx.fillStyle = "#ffffff";
    jpgCtx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
    jpgCtx.drawImage(canvas, 0, 0);

    const compressed = await canvasToBlob(jpgCanvas, "image/jpeg", quality);
    return smallest([compressed], file.size) ?? keepOriginal();
  }

  // WebP source → re‑encode as WebP directly.
  const compressed = await canvasToBlob(canvas, "image/webp", quality);
  return smallest([compressed], file.size) ?? keepOriginal();
}
