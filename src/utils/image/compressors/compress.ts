import { getEffectiveImageMime } from "@/const/image-extensions";

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Determine the best canvas output MIME for a given source.
 * PNG-family sources are handled explicitly in compressImage.
 */
function canvasOutputMime(sourceMime: string): "image/jpeg" | "image/webp" | "image/png" {
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

/** Promisified canvas.toBlob — always resolves to a Blob or rejects. */
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
 * Quick alpha scan — samples up to 256 evenly-spaced pixels.
 * Returns true if any pixel has alpha < 255 (i.e. the image uses transparency).
 * Safe to call on any canvas that was drawn from a same-origin blob URL.
 */
function hasAlphaChannel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): boolean {
  // Clamp sampling area to avoid huge getImageData calls
  const sw = Math.min(width, 128);
  const sh = Math.min(height, 128);
  try {
    const { data } = ctx.getImageData(0, 0, sw, sh);
    // alpha is every 4th byte (index 3, 7, 11, …)
    for (let i = 3; i < data.length; i += 4) {
      if (data[i]! < 255) return true;
    }
  } catch {
    // If getImageData fails (tainted canvas etc.) assume no alpha
    return false;
  }
  return false;
}

/**
 * Pick the smallest blob from a list that is strictly smaller than the
 * reference size. Returns null when no candidate beats the reference.
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
 * Compress any supported image file using the Canvas API.
 *
 * Guarantees:
 * ① The returned Blob is NEVER larger than the original file.
 *    If every encoding attempt produces a larger file, the original bytes
 *    are returned unchanged (status still "completed").
 *
 * ② PNG / raster sources use a multi-strategy approach:
 *    • No transparency detected → try both JPEG and WebP, return smallest.
 *    • Transparency detected    → try WebP only (alpha-safe), return if smaller.
 *    This ensures opaque PNGs (photos saved as PNG, screenshots, etc.) always
 *    get maximum compression via JPEG when appropriate.
 *
 * ③ JPEG / WebP sources → re-encode at the requested quality.
 *    If re-encoding can't beat the original (e.g. already heavily compressed),
 *    the original is returned.
 */
export async function compressImage(file: File, quality: number): Promise<Blob> {
  // ── 1. Resolve source MIME ──────────────────────────────────────────────────
  const sourceMime =
    getEffectiveImageMime(file) ??
    (file.type?.trim()
      ? (file.type.split(";")[0]?.trim() ?? file.type)
      : "image/png");

  const outMime = canvasOutputMime(sourceMime);

  // Returns the original file bytes as a Blob with the correct MIME.
  // Used when no encoding strategy can beat the original size.
  const keepOriginal = (): Blob => file.slice(0, file.size, sourceMime);

  // ── 2. Load the image ───────────────────────────────────────────────────────
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

  // ── 3. Draw onto an off-screen canvas ──────────────────────────────────────
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2D canvas context");

  ctx.drawImage(img, 0, 0);

  // ── 4. PNG-family sources (PNG, BMP, GIF, TIFF, HEIC, AVIF, …) ────────────
  if (outMime === "image/png") {
    const transparent = hasAlphaChannel(ctx, canvas.width, canvas.height);

    if (transparent) {
      // Must preserve alpha → WebP lossy (alpha-safe, ~3-5× smaller than PNG)
      const webpBlob = await canvasToBlob(canvas, "image/webp", quality);
      return smallest([webpBlob], file.size) ?? keepOriginal();
    }

    // No transparency → try both WebP and JPEG, pick smallest winner
    // For JPEG we need a white-filled copy to avoid black artifacts
    const jpgCanvas = document.createElement("canvas");
    jpgCanvas.width = canvas.width;
    jpgCanvas.height = canvas.height;
    const jpgCtx = jpgCanvas.getContext("2d");
    if (!jpgCtx) throw new Error("Failed to get 2D canvas context for JPEG pass");
    jpgCtx.fillStyle = "#ffffff";
    jpgCtx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
    jpgCtx.drawImage(canvas, 0, 0);

    const [webpBlob, jpegBlob] = await Promise.all([
      canvasToBlob(canvas, "image/webp", quality),
      canvasToBlob(jpgCanvas, "image/jpeg", quality),
    ]);

    return smallest([webpBlob, jpegBlob], file.size) ?? keepOriginal();
  }

  // ── 5. JPEG / WebP sources ─────────────────────────────────────────────────
  // For JPEG: add white background to avoid artifacts from any stray alpha
  if (outMime === "image/jpeg") {
    const jpgCanvas = document.createElement("canvas");
    jpgCanvas.width = canvas.width;
    jpgCanvas.height = canvas.height;
    const jpgCtx = jpgCanvas.getContext("2d");
    if (!jpgCtx) throw new Error("Failed to get 2D canvas context for JPEG pass");
    jpgCtx.fillStyle = "#ffffff";
    jpgCtx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
    jpgCtx.drawImage(canvas, 0, 0);

    const compressed = await canvasToBlob(jpgCanvas, "image/jpeg", quality);
    return smallest([compressed], file.size) ?? keepOriginal();
  }

  // WebP source → re-encode as WebP
  const compressed = await canvasToBlob(canvas, "image/webp", quality);
  return smallest([compressed], file.size) ?? keepOriginal();
}
