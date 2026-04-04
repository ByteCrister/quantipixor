/**
 * Whether `canvas.toBlob` can encode this MIME in the current browser.
 */
export function probeCanvasMime(
  mime: string,
  quality?: number,
): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve(false);
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve(false);
      return;
    }
    ctx.fillStyle = "#7a8fb8";
    ctx.fillRect(0, 0, 2, 2);
    canvas.toBlob(
      (blob) => resolve(blob !== null && blob.size > 0),
      mime,
      quality,
    );
  });
}
