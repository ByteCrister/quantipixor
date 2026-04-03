/**
 * Raster & common image extensions the app accepts.
 * Decoding still depends on the browser; unsupported files fail at compress with a clear error.
 */
export enum IMAGE_EXTENSIONS {
  JPG = "jpg",
  JPEG = "jpeg",
  JFIF = "jfif",
  PJPEG = "pjpeg",
  PNG = "png",
  APNG = "apng",
  WEBP = "webp",
  GIF = "gif",
  BMP = "bmp",
  SVG = "svg",
  ICO = "ico",
  CUR = "cur",
  AVIF = "avif",
  TIFF = "tiff",
  TIF = "tif",
  HEIC = "heic",
  HEIF = "heif",
}

/** MIME → canonical extension we store for that type. */
export const MIME_TO_EXTENSION: Record<string, IMAGE_EXTENSIONS> = {
  "image/jpeg": IMAGE_EXTENSIONS.JPEG,
  "image/jpg": IMAGE_EXTENSIONS.JPG,
  "image/pjpeg": IMAGE_EXTENSIONS.PJPEG,
  "image/png": IMAGE_EXTENSIONS.PNG,
  "image/apng": IMAGE_EXTENSIONS.APNG,
  "image/webp": IMAGE_EXTENSIONS.WEBP,
  "image/gif": IMAGE_EXTENSIONS.GIF,
  "image/bmp": IMAGE_EXTENSIONS.BMP,
  "image/x-ms-bmp": IMAGE_EXTENSIONS.BMP,
  "image/svg+xml": IMAGE_EXTENSIONS.SVG,
  "image/x-icon": IMAGE_EXTENSIONS.ICO,
  "image/vnd.microsoft.icon": IMAGE_EXTENSIONS.ICO,
  "image/ico": IMAGE_EXTENSIONS.ICO,
  "image/avif": IMAGE_EXTENSIONS.AVIF,
  "image/tiff": IMAGE_EXTENSIONS.TIFF,
  "image/x-tiff": IMAGE_EXTENSIONS.TIFF,
  "image/heic": IMAGE_EXTENSIONS.HEIC,
  "image/heif": IMAGE_EXTENSIONS.HEIF,
  "image/heic-sequence": IMAGE_EXTENSIONS.HEIC,
  "image/heif-sequence": IMAGE_EXTENSIONS.HEIF,
};

/** Extension → primary MIME (used when `File.type` is empty). */
export const EXTENSION_TO_MIME: Record<IMAGE_EXTENSIONS, string> = {
  [IMAGE_EXTENSIONS.JPG]: "image/jpeg",
  [IMAGE_EXTENSIONS.JPEG]: "image/jpeg",
  [IMAGE_EXTENSIONS.JFIF]: "image/jpeg",
  [IMAGE_EXTENSIONS.PJPEG]: "image/jpeg",
  [IMAGE_EXTENSIONS.PNG]: "image/png",
  [IMAGE_EXTENSIONS.APNG]: "image/apng",
  [IMAGE_EXTENSIONS.WEBP]: "image/webp",
  [IMAGE_EXTENSIONS.GIF]: "image/gif",
  [IMAGE_EXTENSIONS.BMP]: "image/bmp",
  [IMAGE_EXTENSIONS.SVG]: "image/svg+xml",
  [IMAGE_EXTENSIONS.ICO]: "image/x-icon",
  [IMAGE_EXTENSIONS.CUR]: "image/x-icon",
  [IMAGE_EXTENSIONS.AVIF]: "image/avif",
  [IMAGE_EXTENSIONS.TIFF]: "image/tiff",
  [IMAGE_EXTENSIONS.TIF]: "image/tiff",
  [IMAGE_EXTENSIONS.HEIC]: "image/heic",
  [IMAGE_EXTENSIONS.HEIF]: "image/heif",
};

export const SUPPORTED_EXTENSIONS = Object.values(IMAGE_EXTENSIONS);

/**
 * Accepted MIME strings (all keys + unique output MIMEs).
 */
export const SUPPORTED_MIME_TYPES = Array.from(
  new Set([...Object.keys(MIME_TO_EXTENSION), ...Object.values(EXTENSION_TO_MIME)]),
);

/** `<input accept="…" />` — MIME list plus extension tokens for picky browsers / OS. */
export const FILE_INPUT_ACCEPT = [
  ...SUPPORTED_MIME_TYPES,
  ...SUPPORTED_EXTENSIONS.map((ext) => `.${ext}`),
].join(",");

/**
 * Human-readable list for UI (long formats trimmed with ellipsis in footer copy).
 */
export const SUPPORTED_EXTENSIONS_LABEL = SUPPORTED_EXTENSIONS.map((e) =>
  e.toUpperCase(),
).join(", ");

/** Shorter chip text */
export const SUPPORTED_EXTENSIONS_LABEL_SHORT = `${SUPPORTED_EXTENSIONS.slice(0, 8).map((e) => e.toUpperCase()).join(", ")}, … (+${Math.max(0, SUPPORTED_EXTENSIONS.length - 8)} more)`;

export function getExtensionFromFilename(filename: string): IMAGE_EXTENSIONS | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  const values = Object.values(IMAGE_EXTENSIONS) as string[];
  if (values.includes(ext)) return ext as IMAGE_EXTENSIONS;
  return null;
}

export function getExtensionFromMime(mimeType: string): IMAGE_EXTENSIONS | null {
  const key = mimeType.trim().toLowerCase();
  if (MIME_TO_EXTENSION[key]) return MIME_TO_EXTENSION[key];
  const base = key.split(";")[0]?.trim();
  if (base && MIME_TO_EXTENSION[base]) return MIME_TO_EXTENSION[base];
  return null;
}

/**
 * Effective MIME for validation when `file.type` is missing (common on some systems).
 */
export function getEffectiveImageMime(file: File): string | null {
  const raw = file.type?.trim().toLowerCase();
  if (raw) {
    const base = raw.split(";")[0]?.trim() ?? raw;
    if (MIME_TO_EXTENSION[base] || SUPPORTED_MIME_TYPES.includes(base)) {
      return EXTENSION_TO_MIME[MIME_TO_EXTENSION[base]!] ?? base;
    }
    if (SUPPORTED_MIME_TYPES.includes(raw)) return raw;
  }
  const ext = getExtensionFromFilename(file.name);
  if (!ext) return null;
  return EXTENSION_TO_MIME[ext];
}

/**
 * True if this file is allowed (by MIME or by extension).
 */
export function isAllowedImageFile(file: File, allowedMimeSet: Set<string>): boolean {
  const mime = getEffectiveImageMime(file);
  if (!mime) return false;
  const base = mime.split(";")[0]?.trim() ?? mime;
  return allowedMimeSet.has(mime) || allowedMimeSet.has(base);
}

export function mimeToOutputExtension(mimeType: string): string {
  const ext = getExtensionFromMime(mimeType.trim().toLowerCase());
  if (!ext) return IMAGE_EXTENSIONS.PNG;
  if (
    ext === IMAGE_EXTENSIONS.JPEG ||
    ext === IMAGE_EXTENSIONS.JPG ||
    ext === IMAGE_EXTENSIONS.JFIF ||
    ext === IMAGE_EXTENSIONS.PJPEG
  ) {
    return IMAGE_EXTENSIONS.JPG;
  }
  if (ext === IMAGE_EXTENSIONS.TIF) return IMAGE_EXTENSIONS.TIFF;
  return ext;
}
