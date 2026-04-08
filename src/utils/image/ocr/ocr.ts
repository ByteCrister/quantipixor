// utils/image/ocr/ocr.ts
import { buildLangString, LanguageCode } from "@/const/languages";
import Tesseract from "tesseract.js";

export interface WordWithBBox {
  text: string;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  confidence: number;
}

export interface LineWithLayout {
  text: string;
  words: WordWithBBox[];
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  confidence: number;
}

export interface OCRResult {
  imageIndex: number;
  lines: LineWithLayout[];
  rawText: string;
  pageDimensions: {
    width: number;
    height: number;
  };
}

type OCRProgress = { status: string; progress: number };

const OCR_CDN_OPTIONS: Array<Partial<Tesseract.WorkerOptions>> = [
  // Project Naptha hosts canonical tesseract traineddata files.
  {
    workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@v5.1.1/dist/worker.min.js",
    corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.1.1",
    langPath: "https://tessdata.projectnaptha.com/4.0.0",
  },
  // Fast tessdata mirror on jsDelivr GitHub CDN.
  {
    workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@v5.1.1/dist/worker.min.js",
    corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.1.1",
    langPath: "https://cdn.jsdelivr.net/gh/tesseract-ocr/tessdata_fast@4.1.0",
  },
  // Unpkg fallback for worker/core with canonical tessdata source.
  {
    workerPath: "https://unpkg.com/tesseract.js@5.1.1/dist/worker.min.js",
    corePath: "https://unpkg.com/tesseract.js-core@5.1.1",
    langPath: "https://tessdata.projectnaptha.com/4.0.0",
  },
];

async function recognizeWithFallback(
  imageUrl: string,
  langString: string,
  onProgress?: (progress: OCRProgress) => void,
) {
  let lastError: unknown = null;
  for (const workerOptions of OCR_CDN_OPTIONS) {
    try {
      return await Tesseract.recognize(imageUrl, langString, {
        ...workerOptions,
        logger: (m) => {
          if (m.status === "recognizing text") {
            onProgress?.({
              status: `OCR: ${Math.round(m.progress * 100)}%`,
              progress: 30 + m.progress * 60,
            });
          }
        },
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `OCR resources could not be loaded from fallback sources. Check network/CDN access and try again. ${lastError instanceof Error ? lastError.message : ""}`.trim(),
  );
}

export async function processImagesWithOCR(
  files: File[],
  languageCodes: LanguageCode[],
  onProgress?: (imageIndex: number, progress: { status: string; progress: number }) => void
): Promise<OCRResult[]> {
  const results: OCRResult[] = [];
  const langString = buildLangString(languageCodes);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imageUrl = URL.createObjectURL(file);
    
    onProgress?.(i, { status: "Loading image...", progress: 0 });
    
    // Create image element to get dimensions
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = imageUrl;
    });
    
    onProgress?.(i, { status: "Running OCR...", progress: 30 });
    
    const result = await recognizeWithFallback(imageUrl, langString, (progressInfo) =>
      onProgress?.(i, progressInfo),
    );
    
    onProgress?.(i, { status: "Processing layout...", progress: 95 });
    
    // Extract lines with bounding boxes
    const lines: LineWithLayout[] = [];
    const blocks = result.data.blocks ?? [];
    for (const block of blocks) {
      for (const paragraph of block.paragraphs ?? []) {
        for (const line of paragraph.lines ?? []) {
          const words: WordWithBBox[] = (line.words || []).map((word) => ({
            text: word.text,
            bbox: {
              x0: word.bbox.x0,
              y0: word.bbox.y0,
              x1: word.bbox.x1,
              y1: word.bbox.y1,
            },
            confidence: word.confidence,
          }));

          lines.push({
            text: line.text,
            words,
            bbox: {
              x0: line.bbox.x0,
              y0: line.bbox.y0,
              x1: line.bbox.x1,
              y1: line.bbox.y1,
            },
            confidence: line.confidence,
          });
        }
      }
    }
    
    results.push({
      imageIndex: i,
      lines,
      rawText: result.data.text,
      pageDimensions: {
        width: img.width,
        height: img.height,
      },
    });
    
    URL.revokeObjectURL(imageUrl);
    onProgress?.(i, { status: "Complete", progress: 100 });
  }
  
  return results;
}