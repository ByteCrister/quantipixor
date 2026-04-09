import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

// ============================================================================
// Constants & helpers (no changes from original)
// ============================================================================

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/x-ms-bmp",
  "image/tiff",
  "image/x-tiff",
  "image/avif",
]);
const MAX_FILE_MB = 5;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const OUTPUT_QUALITY = 100;

function outputFormatFromMime(mime: string): "jpeg" | "png" | "webp" {
  if (mime === "image/jpeg") return "jpeg";
  if (mime === "image/webp") return "webp";
  return "png";
}

type Segmenter = (image: string) => Promise<Array<{ mask: unknown }>>;

type MaskWithBuffer = {
  toBuffer: () => Promise<ArrayBuffer | Buffer | Uint8Array>;
};

type RawMaskLike = {
  data: ArrayLike<number>;
  width: number;
  height: number;
  channels?: number;
};

let cachedSegmenter: Segmenter | null = null;
let loadingSegmenter: Promise<Segmenter> | null = null;

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function hasToBuffer(mask: unknown): mask is MaskWithBuffer {
  return (
    typeof mask === "object" &&
    mask !== null &&
    "toBuffer" in mask &&
    typeof (mask as { toBuffer?: unknown }).toBuffer === "function"
  );
}

function hasRawMaskData(mask: unknown): mask is RawMaskLike {
  if (typeof mask !== "object" || mask === null) return false;
  const candidate = mask as Partial<RawMaskLike>;
  return (
    typeof candidate.width === "number" &&
    typeof candidate.height === "number" &&
    typeof candidate.data === "object" &&
    candidate.data !== null
  );
}

// ============================================================================
// Lazy loader for the segmentation pipeline (fixed WASM backend)
// ============================================================================

async function getSegmenter(): Promise<Segmenter> {
  if (cachedSegmenter) return cachedSegmenter;
  if (loadingSegmenter) return loadingSegmenter;

  loadingSegmenter = (async () => {
    // 1. CRITICAL: Force WASM priority BEFORE importing transformers
    // This overrides the default CPU native backend selection
    const { env } = await import("@huggingface/transformers");
    env.backends.onnx = { wasm: {} };  // Set backend to use WASM

    // 2. Other environment settings
    env.useBrowserCache = false;
    env.allowLocalModels = true;
    env.cacheDir = "/tmp/transformers_cache";

    // 3. Now import and create the pipeline (WASM will be used)
    const { pipeline } = await import("@huggingface/transformers");
    const instance = await pipeline("image-segmentation", "Xenova/modnet");
    
    cachedSegmenter = instance as unknown as Segmenter;
    return cachedSegmenter;
  })();

  const segmenter = await loadingSegmenter;
  loadingSegmenter = null;
  return segmenter;
}

// ============================================================================
// POST handler (unchanged except for the lazy segmenter)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    if (!(image instanceof File)) {
      return badRequest("No image provided");
    }
    if (!ALLOWED_MIME_TYPES.has(image.type)) {
      return badRequest(
        "Unsupported image type. Use JPEG, PNG, WebP, GIF, BMP, TIFF, or AVIF."
      );
    }
    if (image.size <= 0 || image.size > MAX_FILE_BYTES) {
      return badRequest(
        `Image size must be between 1 byte and ${MAX_FILE_MB} MB.`
      );
    }

    const originalBuffer = Buffer.from(await image.arrayBuffer());
    const originalMeta = await sharp(originalBuffer).metadata();
    const width = originalMeta.width;
    const height = originalMeta.height;
    if (!width || !height) {
      return badRequest("Could not read image dimensions.", 422);
    }

    const blob = new Blob([originalBuffer], { type: image.type });
    const imageBlobUrl = URL.createObjectURL(blob);

    const segmenter = await getSegmenter();
    const result = await (async () => {
      try {
        return await segmenter(imageBlobUrl);
      } finally {
        URL.revokeObjectURL(imageBlobUrl);
      }
    })();
    const maskImage = result[0]?.mask;
    if (!maskImage) return badRequest("No mask generated for image.", 500);

    let maskBuffer: Buffer;
    if (hasToBuffer(maskImage)) {
      const rawMaskBuffer = await maskImage.toBuffer();
      if (Buffer.isBuffer(rawMaskBuffer)) {
        maskBuffer = rawMaskBuffer;
      } else if (rawMaskBuffer instanceof ArrayBuffer) {
        maskBuffer = Buffer.from(rawMaskBuffer);
      } else {
        maskBuffer = Buffer.from(rawMaskBuffer.buffer);
      }
    } else if (typeof maskImage === "string") {
      const maskResponse = await fetch(maskImage);
      if (!maskResponse.ok) {
        return badRequest("Could not download generated mask.", 500);
      }
      maskBuffer = Buffer.from(await maskResponse.arrayBuffer());
    } else if (hasRawMaskData(maskImage)) {
      const channels = maskImage.channels === 4 ? 4 : 1;
      const total = maskImage.width * maskImage.height * channels;
      const raw = Uint8Array.from(maskImage.data as ArrayLike<number>).slice(
        0,
        total
      );
      maskBuffer = await sharp(Buffer.from(raw), {
        raw: { width: maskImage.width, height: maskImage.height, channels },
      })
        .png()
        .toBuffer();
    } else {
      return badRequest("Unsupported mask format from segmentation model.", 500);
    }

    const maskRaw = await sharp(maskBuffer)
      .resize(width, height)
      .ensureAlpha()
      .raw()
      .toBuffer();

    const originalRaw = await sharp(originalBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer();
    const rgba = Buffer.alloc(originalRaw.length);
    for (let i = 0; i < width * height; i++) {
      const p = i * 4;
      rgba[p] = originalRaw[p];
      rgba[p + 1] = originalRaw[p + 1];
      rgba[p + 2] = originalRaw[p + 2];
      rgba[p + 3] = maskRaw[p];
    }

    const outputFormat = outputFormatFromMime(image.type);
    const processor = sharp(rgba, {
      raw: { width, height, channels: 4 },
    });

    let finalImage: Buffer;
    let outputMime: string;
    if (outputFormat === "jpeg") {
      finalImage = await processor
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .jpeg({ quality: OUTPUT_QUALITY, mozjpeg: true })
        .toBuffer();
      outputMime = "image/jpeg";
    } else if (outputFormat === "webp") {
      finalImage = await processor
        .webp({
          quality: OUTPUT_QUALITY,
          alphaQuality: OUTPUT_QUALITY,
          effort: 4,
        })
        .toBuffer();
      outputMime = "image/webp";
    } else {
      finalImage = await processor.png({ compressionLevel: 9 }).toBuffer();
      outputMime = "image/png";
    }

    return NextResponse.json({
      resultBase64: `data:${outputMime};base64,${finalImage.toString("base64")}`,
    });
  } catch (error) {
    console.error("v1 remove-bg failed:", error);
    return NextResponse.json(
      { error: "Background removal failed. Try again with a smaller image." },
      { status: 500 }
    );
  }
}