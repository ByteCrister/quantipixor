import { CompressionConfig } from "@/types";
import { getEffectiveImageMime, SUPPORTED_MIME_TYPES } from "@/const/image-extensions";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImage(file: File, config: CompressionConfig): ValidationResult {
  const allowed = new Set(config.allowedFormats);
  const effective = getEffectiveImageMime(file);

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
