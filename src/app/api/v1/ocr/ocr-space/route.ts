// app/api/ocr/ocr-space/route.ts
import { OcrApiResponse, OcrSuccessResponse } from "@/types/ocr-space";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// ===== CONFIG =====
const MAX_IMAGE_SIZE_MB = 5;
const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY;

// ===== TYPES =====
type ApiErrorResponse = {
    success: false;
    code: string;
    error: string;
    retryAfterSeconds?: number;
};

type ApiSuccessResponse = {
    success: true;
    html: string;
    plainText: string;
};

// ===== HELPER: Convert plain text to beautiful HTML =====
function formatTextToHtml(text: string): string {
    if (!text) return "<p>No text extracted</p>";

    // Escape HTML special characters
    const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    // Split into paragraphs by double newlines, preserve single line breaks inside paragraphs
    const paragraphs = escaped.split(/\n\s*\n/);
    const formatted = paragraphs
        .map(para => {
            if (!para.trim()) return "";
            // Replace single newlines with <br> inside the paragraph
            const withBreaks = para.replace(/\n/g, "<br>");
            return `<p>${withBreaks}</p>`;
        })
        .filter(p => p)
        .join("\n");

    return formatted || `<p>${escaped.replace(/\n/g, "<br>")}</p>`;
}

// ===== IMAGE COMPRESSION =====
async function compressImageToJpeg(file: File): Promise<Buffer> {
    const buffer = Buffer.from(await file.arrayBuffer());
    return await sharp(buffer)
        .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 75, progressive: true })
        .toBuffer();
}

// ===== OCR.Space API CALL with language support =====
async function callOcrSpace(
    imageBuffer: Buffer,
    filename: string,
    langParam: string   // e.g. "eng" or "ben+eng"
): Promise<{ plainText: string; processingTimeMs: number }> {
    if (!OCR_SPACE_API_KEY) {
        throw new Error("OCR_SPACE_API_KEY not configured");
    }

    const formData = new FormData();
    formData.append("apikey", OCR_SPACE_API_KEY);
    formData.append("language", langParam);
    formData.append("isOverlayRequired", "false");
    formData.append("detectOrientation", "true");
    formData.append("scale", "true");
    formData.append("OCREngine", "2");   // 2 = Tesseract (good for mixed content)

    const blob = new Blob([new Uint8Array(imageBuffer)], { type: "image/jpeg" });
    formData.append("file", blob, filename.replace(/\.[^/.]+$/, "") + ".jpg");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch(process.env.OCR_SPACE_API_URL as string, {
            method: "POST",
            body: formData,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`OCR.Space HTTP ${response.status}: ${response.statusText}`);
        }

        const data = (await response.json()) as OcrApiResponse;

        if (data.IsErroredOnProcessing || data.OCRExitCode !== 1) {
            const errorMsg = Array.isArray(data.ErrorMessage)
                ? data.ErrorMessage.join(", ")
                : "Unknown OCR error";
            throw new Error(`OCR processing failed: ${errorMsg}`);
        }

        const successData = data as OcrSuccessResponse;
        if (!successData.ParsedResults || successData.ParsedResults.length === 0) {
            throw new Error("No parsed results returned");
        }

        const plainText = successData.ParsedResults[0].ParsedText?.trim() || "";
        const processingTimeMs = parseInt(successData.ProcessingTimeInMilliseconds, 10) || 0;

        return { plainText, processingTimeMs };
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

// ===== MAIN HANDLER =====
export async function POST(req: NextRequest) {
    try {
        if (!OCR_SPACE_API_KEY) {
            return NextResponse.json(
                { success: false, code: "NO_API_KEY", error: "OCR_SPACE_API_KEY is not configured" },
                { status: 500 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        if (!file) {
            return NextResponse.json(
                { success: false, code: "NO_FILE", error: "File missing. Use key 'file'" },
                { status: 400 }
            );
        }

        // Validate file type & size
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { success: false, code: "INVALID_TYPE", error: "Only image files are allowed" },
                { status: 415 }
            );
        }
        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            return NextResponse.json(
                { success: false, code: "FILE_TOO_LARGE", error: `Max file size is ${MAX_IMAGE_SIZE_MB}MB` },
                { status: 413 }
            );
        }

        // --- Language handling ---
        // Frontend sends "langs" as a string (e.g. "eng+ben") or undefined.
        const langs = formData.get("langs") as string | null;
        let langParam = "eng";   // default
        if (langs && langs.trim()) {
            // OCR.Space expects language codes joined by '+'
            langParam = langs.replace(/[,\s]+/g, "+").toLowerCase();
            // Basic validation: only allow known language codes (optional)
            if (!/^[a-z]{3}(\+[a-z]{3})*$/.test(langParam)) {
                langParam = "eng";
            }
        }

        // Compress image
        let imageBuffer: Buffer;
        try {
            imageBuffer = await compressImageToJpeg(file);
        } catch (err) {
            console.error("Image compression failed:", err);
            return NextResponse.json(
                { success: false, code: "COMPRESSION_FAILED", error: "Failed to process image" },
                { status: 500 }
            );
        }

        // Call OCR.Space
        let ocrResult: { plainText: string; processingTimeMs: number };
        try {
            ocrResult = await callOcrSpace(imageBuffer, file.name, langParam);
        } catch (err) {
            console.error("OCR.Space error:", err);
            const errorMsg = err instanceof Error ? err.message : "OCR service failed";

            if (errorMsg.includes("limit") || errorMsg.includes("quota") || errorMsg.includes("rate")) {
                return NextResponse.json(
                    { success: false, code: "QUOTA_EXHAUSTED", error: "Daily request limit reached. Try tomorrow." },
                    { status: 429 }
                );
            }
            if (errorMsg.includes("timeout")) {
                return NextResponse.json(
                    { success: false, code: "TIMEOUT", error: "OCR service timed out. Try a smaller/clearer image." },
                    { status: 504 }
                );
            }
            return NextResponse.json(
                { success: false, code: "OCR_FAILED", error: errorMsg },
                { status: 502 }
            );
        }

        // Build beautiful HTML
        const html = formatTextToHtml(ocrResult.plainText);

        return NextResponse.json({
            success: true,
            html,
            plainText: ocrResult.plainText,
        } as ApiSuccessResponse);
    } catch (err) {
        console.error("Server error:", err);
        return NextResponse.json(
            { success: false, code: "SERVER_ERROR", error: "Internal server error" },
            { status: 500 }
        );
    }
}