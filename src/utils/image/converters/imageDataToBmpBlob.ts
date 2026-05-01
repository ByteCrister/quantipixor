/**
 * Converts an RGBA {@link ImageData} object into a 24-bit uncompressed Windows BMP blob.
 *
 * The BMP format used is:
 * - 24 bits per pixel (8 bits per channel: B, G, R)
 * - rows stored bottom‑up (last row first in the file)
 * - no compression (BI_RGB)
 * - 4‑byte row alignment (each row is padded to a multiple of 4 bytes)
 *
 * **Important:** The source RGBA data is used directly; the alpha channel is completely
 * ignored. If you need solid, opaque pixels you should composite the image onto a white
 * (or other solid) background **before** calling this function.
 *
 * @param imageData - The source pixel data with dimensions `width`/`height` and an
 *                    RGBA `data` buffer.
 * @returns A `Blob` of MIME type `"image/bmp"` containing the valid BMP file.
 */
export function imageDataToBmpBlob(imageData: ImageData): Blob {
  const { width: w, height: h, data } = imageData;

  // Each pixel uses 3 bytes (B, G, R). Rows must be padded to a multiple of 4 bytes.
  const rowStride = Math.ceil((w * 3) / 4) * 4; // row size in bytes (with padding)
  const pixelBytes = rowStride * h; // total pixel array size
  const fileSize = 14 + 40 + pixelBytes; // header + DIB header + pixels

  const buf = new ArrayBuffer(fileSize);
  const u8 = new Uint8Array(buf); // byte‑wise access for the pixel data
  const dv = new DataView(buf);   // for writing multi‑byte integers in little‑endian

  // ── BITMAPFILEHEADER (14 bytes) ──────────────────────────────────
  u8[0] = 0x42; // 'B'
  u8[1] = 0x4d; // 'M'
  dv.setUint32(2, fileSize, true);  // bfSize (file size)
  dv.setUint32(6, 0, true);         // bfReserved1 & bfReserved2
  dv.setUint32(10, 54, true);       // bfOffBits – offset to pixel array

  // ── BITMAPINFOHEADER (40 bytes) ──────────────────────────────────
  dv.setUint32(14, 40, true);        // biSize of this header
  dv.setInt32(18, w, true);          // biWidth
  dv.setInt32(22, h, true);          // biHeight – positive means bottom‑up
  dv.setUint16(26, 1, true);         // biPlanes (must be 1)
  dv.setUint16(28, 24, true);        // biBitCount (24 bits per pixel, no alpha)
  dv.setUint32(30, 0, true);         // biCompression (BI_RGB = 0)
  dv.setUint32(34, pixelBytes, true);// biSizeImage – may be 0 for BI_RGB, but we set it
  dv.setInt32(38, 0, true);          // biXPelsPerMeter
  dv.setInt32(42, 0, true);          // biYPelsPerMeter
  dv.setUint32(46, 0, true);         // biClrUsed (0 = use full palette for 8‑bit, irrelevant here)
  dv.setUint32(50, 0, true);         // biClrImportant

  // ── Pixel data: bottom‑up, BGR order ────────────────────────────
  let offset = 54; // past the two headers
  for (let fileY = 0; fileY < h; fileY++) {
    // The file stores rows bottom‑up, so the first file row corresponds
    // to the last image row.
    const imageY = h - 1 - fileY;

    for (let x = 0; x < w; x++) {
      const i = (imageY * w + x) * 4; // index in the RGBA array
      // BMP expects B, G, R (little‑endian pixel). We ignore alpha (data[i+3]).
      u8[offset++] = data[i + 2]!; // Blue
      u8[offset++] = data[i + 1]!; // Green
      u8[offset++] = data[i]!;     // Red
    }

    // Row padding: each row must end on a 4‑byte boundary.
    const rowPad = rowStride - w * 3; // bytes to pad (0…3)
    for (let p = 0; p < rowPad; p++) {
      u8[offset++] = 0;
    }
  }

  // Return the complete BMP as a Blob with the appropriate MIME type.
  return new Blob([buf], { type: "image/bmp" });
}