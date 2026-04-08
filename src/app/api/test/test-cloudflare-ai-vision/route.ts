import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// ===== CONFIG =====
const MAX_IMAGE_SIZE_MB = 5;
// const TIMEOUT_MS = 15000;

// ===== CLOUDFLARE AI SETUP =====
// These must be set in your .env.local file:
// CLOUDFLARE_ACCOUNT_ID=your-account-id
// CLOUDFLARE_API_TOKEN=your-api-token
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

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

// ===== HELPERS =====
function jsonError(code: string, error: string, status: number, retryAfterSeconds?: number) {
    return NextResponse.json(
        {
            success: false,
            code,
            error,
            ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
        } as ApiErrorResponse,
        {
            status,
            headers: retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : undefined,
        }
    );
}

async function compressImage(file: File): Promise<Buffer> {
    const buffer = Buffer.from(await file.arrayBuffer());
    return sharp(buffer)
        .resize(800, 800, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 60 })
        .toBuffer();
}

// ===== CLOUDFLARE VISION CALL (Llama 3.2 Vision) =====
async function callCloudflareVision(imageBuffer: Buffer): Promise<{ html: string; plainText: string }> {
    const imageBase64 = imageBuffer.toString("base64");

    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.2-11b-vision-instruct`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${CF_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "image",
                                image: imageBase64,
                            },
                            {
                                type: "text",
                                text: "Extract all text from this image. Return ONLY valid JSON with fields 'html' (formatted as HTML) and 'plainText' (raw text). Do not add any extra commentary.",
                            },
                        ],
                    },
                ],
                max_tokens: 1024,
                temperature: 0,
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudflare AI error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as { result?: { response?: string } };
    const rawText = data.result?.response || "";

    // Try to parse JSON from the response
    try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                html: parsed.html || `<pre>${parsed.plainText || rawText}</pre>`,
                plainText: parsed.plainText || rawText,
            };
        }
    } catch {
        // fallback
    }

    // Fallback: return raw text as both HTML and plain
    return {
        html: `<pre>${rawText}</pre>`,
        plainText: rawText,
    };
}

// ===== MAIN HANDLER =====
export async function POST(req: NextRequest) {
    try {
        if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
            return jsonError("MISSING_CONFIG", "Cloudflare credentials missing", 500);
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) return jsonError("NO_FILE", "File missing", 400);
        if (!file.type.startsWith("image/")) return jsonError("INVALID_TYPE", "Only image allowed", 415);
        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            return jsonError("FILE_TOO_LARGE", "Max 5MB allowed", 413);
        }

        const compressedBuffer = await compressImage(file);
        const result = await callCloudflareVision(compressedBuffer);

        return NextResponse.json({
            success: true,
            ...result,
        } as ApiSuccessResponse);
    } catch (err) {
        console.error("Server error:", err);
        return jsonError(
            "SERVER_ERROR",
            err instanceof Error ? err.message : "Internal error",
            500
        );
    }
}