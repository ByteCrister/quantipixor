import { CompressionConfig } from "@/types/index.types";
import { getEffectiveImageMime, SUPPORTED_MIME_TYPES } from "@/const/image-extensions.const";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a single image file against the provided compression configuration.
 *
 * Checks:
 * 1. Whether the file’s MIME type (detected via extension/magic bytes) is in the
 *    allowed formats list.
 * 2. Whether the file size does not exceed `config.maxFileSizeMB` megabytes.
 *
 * @param file - The image file to validate.
 * @param config - Compression configuration containing allowed formats and size limit.
 * @returns An object with `valid: boolean` and an optional `error` description.
 */
export function validateImage(file: File, config: CompressionConfig): ValidationResult {
  const allowed = new Set(config.allowedFormats);
  const effective = getEffectiveImageMime(file);

  // If the effective MIME is null or not in the allowed set, the format is unsupported.
  if (!effective || !allowed.has(effective)) {
    return {
      valid: false,
      error: `Unsupported format: ${file.type || "(unknown type)"} for “${file.name}”. Use a common image type (${SUPPORTED_MIME_TYPES.length}+ MIME/extension pairs supported).`,
    };
  }

  const maxSizeBytes = config.maxFileSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB (max ${config.maxFileSizeMB}MB)`,
    };
  }

  return { valid: true };
}