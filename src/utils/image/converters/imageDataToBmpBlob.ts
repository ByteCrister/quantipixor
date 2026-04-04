/**
 * Encode RGBA ImageData as a 24-bit uncompressed Windows BMP (BGR, bottom-up rows).
 * Composite onto a white background before calling if you need opaque pixels.
 */
export function imageDataToBmpBlob(imageData: ImageData): Blob {
  const { width: w, height: h, data } = imageData;
  const rowStride = Math.ceil((w * 3) / 4) * 4;
  const pixelBytes = rowStride * h;
  const fileSize = 14 + 40 + pixelBytes;
  const buf = new ArrayBuffer(fileSize);
  const u8 = new Uint8Array(buf);
  const dv = new DataView(buf);

  // BITMAPFILEHEADER
  u8[0] = 0x42; // 'B'
  u8[1] = 0x4d; // 'M'
  dv.setUint32(2, fileSize, true);
  dv.setUint32(6, 0, true);
  dv.setUint32(10, 54, true);

  // BITMAPINFOHEADER
  dv.setUint32(14, 40, true);
  dv.setInt32(18, w, true);
  dv.setInt32(22, h, true);
  dv.setUint16(26, 1, true);
  dv.setUint16(28, 24, true);
  dv.setUint32(30, 0, true);
  dv.setUint32(34, pixelBytes, true);
  dv.setInt32(38, 0, true);
  dv.setInt32(42, 0, true);
  dv.setUint32(46, 0, true);
  dv.setUint32(50, 0, true);

  let offset = 54;
  for (let fileY = 0; fileY < h; fileY++) {
    const imageY = h - 1 - fileY;
    for (let x = 0; x < w; x++) {
      const i = (imageY * w + x) * 4;
      u8[offset++] = data[i + 2]!;
      u8[offset++] = data[i + 1]!;
      u8[offset++] = data[i]!;
    }
    const rowPad = rowStride - w * 3;
    for (let p = 0; p < rowPad; p++) {
      u8[offset++] = 0;
    }
  }

  return new Blob([buf], { type: "image/bmp" });
}
