import {
  getEffectiveImageMime,
  getExtensionFromMime,
} from "@/const/image-extensions";

/** Canvas can reliably re-encode as these; others are rasterized to PNG. */
function canvasOutputMime(sourceMime: string): string {
  const m = sourceMime.toLowerCase().split(";")[0]?.trim() ?? sourceMime;
  if (m === "image/webp") return "image/webp";
  if (m === "image/jpeg" || m === "image/jpg" || m === "image/pjpeg") {
    return "image/jpeg";
  }
  if (m === "image/png" || m === "image/apng") return "image/png";
  return "image/png";
}

export async function compressImage(file: File, quality: number): Promise<Blob> {
  const sourceMime =
    getEffectiveImageMime(file) ||
    (file.type?.trim() ? file.type.split(";")[0]?.trim() ?? file.type : "image/png");
  const outMime = canvasOutputMime(sourceMime);

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0);

      const useQuality =
        outMime === "image/jpeg" || outMime === "image/webp" ? quality : undefined;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(
              new Error(
                `Compression failed for ${getExtensionFromMime(sourceMime) ?? sourceMime}`,
              ),
            );
          }
        },
        outMime,
        useQuality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = url;
  });
}
