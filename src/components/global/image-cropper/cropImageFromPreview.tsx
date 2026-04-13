"use client";

import { CropSettings } from "@/types";
import loadImage, { pickCanvasMimeFromName } from "../../image/batch-compressor/loadImage";

export default async function cropImageFromPreview(
  previewUrl: string,
  originalName: string,
  crop: CropSettings,
) {
  const img = await loadImage(previewUrl);
  const canvas = document.createElement("canvas");
  const baseSize = 1000;
  const containerSize = baseSize;
  const frameSize = containerSize * (crop.frameSize / 100);
  const frameLeft = (containerSize - frameSize) / 2;
  const frameTop = (containerSize - frameSize) / 2;

  const imageRatio = img.naturalWidth / img.naturalHeight;
  // Mirror object-contain inside a square container.
  const baseRenderWidth = imageRatio >= 1 ? containerSize : containerSize * imageRatio;
  const baseRenderHeight = imageRatio >= 1 ? containerSize / imageRatio : containerSize;
  const renderWidth = baseRenderWidth * crop.zoom;
  const renderHeight = baseRenderHeight * crop.zoom;
  const shiftX = (crop.offsetX / 100) * containerSize;
  const shiftY = (crop.offsetY / 100) * containerSize;
  const imgLeft = containerSize / 2 - renderWidth / 2 + shiftX;
  const imgTop = containerSize / 2 - renderHeight / 2 + shiftY;

  const sx = ((frameLeft - imgLeft) / renderWidth) * img.naturalWidth;
  const sy = ((frameTop - imgTop) / renderHeight) * img.naturalHeight;
  const sw = (frameSize / renderWidth) * img.naturalWidth;
  const sh = (frameSize / renderHeight) * img.naturalHeight;

  const clampedSx = Math.max(0, sx);
  const clampedSy = Math.max(0, sy);
  const clampedSw = Math.max(1, Math.min(img.naturalWidth - clampedSx, sw));
  const clampedSh = Math.max(1, Math.min(img.naturalHeight - clampedSy, sh));

  canvas.width = Math.round(clampedSw);
  canvas.height = Math.round(clampedSh);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.drawImage(
    img,
    clampedSx,
    clampedSy,
    clampedSw,
    clampedSh,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const mimeType = pickCanvasMimeFromName(originalName);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not generate cropped image"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      0.92,
    );
  });
}