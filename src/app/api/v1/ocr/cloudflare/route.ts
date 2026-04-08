// app/api/v1/ocr/cloudflare/route.ts

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// ===== CONFIGURATION =====
const MAX_IMAGE_SIZE_MB = 5;
const TIMEOUT_MS = 15000;
const MAX_MODEL_TEXT_CHARS = 200_000;

// ===== ENVIRONMENT VARIABLES =====
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

type ApiResponse = ApiErrorResponse | ApiSuccessResponse;

// ===== HELPERS =====
function jsonError(
    code: string,
    error: string,
    status: number,
    retryAfterSeconds?: number
) {
    return NextResponse.json(
        {
            success: false,
            code,
            error,
            ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
        } as ApiErrorResponse,
        {
            status,
            headers: retryAfterSeconds
                ? { "Retry-After": String(retryAfterSeconds) }
                : undefined,
        }
    );
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function clampText(s: string): string {
    if (s.length <= MAX_MODEL_TEXT_CHARS) return s;
    return s.slice(0, MAX_MODEL_TEXT_CHARS) + "\n…[truncated]";
}

function stripCodeFences(s: string): string {
    // Common failure mode: model wraps JSON in ```json ... ```
    const trimmed = s.trim();
    if (!trimmed.startsWith("```")) return s;
    return trimmed.replace(/^```[a-zA-Z]*\s*/m, "").replace(/```$/m, "").trim();
}

function parseRetryAfterSeconds(headerValue: string | null): number | undefined {
    if (!headerValue) return undefined;
    const seconds = Number.parseInt(headerValue, 10);
    if (Number.isFinite(seconds) && seconds >= 0) return seconds;
    return undefined;
}

type CloudflareUpstreamError = Error & {
    status?: number;
    retryAfterSeconds?: number;
    responseText?: string;
};

async function compressImage(file: File): Promise<Buffer> {
    const buffer = Buffer.from(await file.arrayBuffer());
    return sharp(buffer)
        .resize(800, 800, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 60 })
        .toBuffer();
}

// ===== CLOUDFLARE AI VISION CALL =====
async function callCloudflareVision(
    imageBuffer: Buffer
): Promise<{ html: string; plainText: string }> {
    const imageBase64 = imageBuffer.toString("base64");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
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
                                { type: "image", image: imageBase64 },
                                {
                                    type: "text",
                                    text: "Extract all text from this image. Return ONLY valid JSON with fields 'html' (formatted as HTML) and 'plainText' (raw text). Do not add any extra commentary.",
                                },
                            ],
                        },
                    ],
                    max_tokens: 2048,
                    temperature: 0,
                }),
                signal: controller.signal,
            }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = clampText(await response.text());
            const retryAfterSeconds = parseRetryAfterSeconds(
                response.headers.get("retry-after")
            );

            const errorObj: CloudflareUpstreamError = new Error(
                `Cloudflare AI error (${response.status})`
            );
            errorObj.status = response.status;
            errorObj.retryAfterSeconds = retryAfterSeconds;
            errorObj.responseText = errorText;
            throw errorObj;
        }

        const data = (await response.json()) as { result?: { response?: string } };
        const rawText = clampText(data.result?.response || "");

        // Attempt to extract JSON from the model's response
        const cleaned = stripCodeFences(rawText);
        let parsedJson: unknown = null;
        try {
            // First, try the whole response as JSON
            parsedJson = JSON.parse(cleaned);
        } catch {
            // Otherwise, find the first JSON object or array
            const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (jsonMatch) {
                try {
                    parsedJson = JSON.parse(jsonMatch[0]);
                } catch {
                    // fallback to plain text
                }
            }
        }

        if (parsedJson && typeof parsedJson === "object") {
            const obj = parsedJson as Partial<{ html: unknown; plainText: unknown }>;
            return {
                html:
                    typeof obj.html === "string"
                        ? obj.html
                        : `<pre>${escapeHtml(
                              typeof obj.plainText === "string" ? obj.plainText : rawText
                          )}</pre>`,
                plainText: typeof obj.plainText === "string" ? obj.plainText : rawText,
            };
        }

        // Final fallback: return raw text as both HTML (escaped) and plain
        return {
            html: `<pre>${escapeHtml(rawText)}</pre>`,
            plainText: rawText,
        };
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

// ===== MAIN HANDLER =====
export async function POST(req: NextRequest) {
    try {
        // 1. Validate environment
        if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
            return jsonError(
                "MISSING_CONFIG",
                "Cloudflare Account ID or API Token is missing",
                500
            );
        }

        // 2. Parse and validate file
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return jsonError("NO_FILE", "No file provided", 400);
        }
        if (!file.type.startsWith("image/")) {
            return jsonError("INVALID_TYPE", "Only image files are allowed", 415);
        }
        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            return jsonError(
                "FILE_TOO_LARGE",
                `File exceeds ${MAX_IMAGE_SIZE_MB}MB limit`,
                413
            );
        }

        // 3. Compress the image once
        const compressedBuffer = await compressImage(file);

        // 4. Call Cloudflare AI
        const result = await callCloudflareVision(compressedBuffer);

        // 5. Return success
        return NextResponse.json({
            success: true,
            ...result,
        } as ApiResponse);
    } catch (err) {
        console.error("Cloudflare OCR error:", err);

        // Handle rate‑limit errors (429) specially
        if (err instanceof Error && "status" in err) {
            const e = err as CloudflareUpstreamError;
            if (e.status === 429) {
            return jsonError(
                "RATE_LIMITED",
                e.responseText || "Cloudflare AI rate limit exceeded",
                429,
                e.retryAfterSeconds
            );
            }
            if (e.status === 401 || e.status === 403) {
                return jsonError(
                    "UPSTREAM_AUTH",
                    "Cloudflare AI rejected the request. Check CLOUDFLARE_ACCOUNT_ID/CLOUDFLARE_API_TOKEN.",
                    502
                );
            }
            if (typeof e.status === "number" && e.status >= 400 && e.status < 600) {
                return jsonError(
                    "UPSTREAM_ERROR",
                    e.responseText || `Cloudflare AI error (${e.status})`,
                    502
                );
            }
        }

        // Timeout errors
        if (err instanceof Error && err.name === "AbortError") {
            return jsonError("TIMEOUT", "Request to Cloudflare AI timed out", 504);
        }

        // Generic internal error
        return jsonError(
            "SERVER_ERROR",
            err instanceof Error ? err.message : "Internal server error",
            500
        );
    }
}