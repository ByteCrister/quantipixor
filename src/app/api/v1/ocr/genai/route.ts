import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";

// ===== CONFIG =====
const MAX_IMAGE_SIZE_MB = 5;
const TIMEOUT_MS = 15000;

// ===== API KEYS =====
const apiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
].filter((key): key is string => !!key);

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

function parseQuotaError(
  err: unknown,
): { message: string; retryAfterSeconds?: number } | null {
  const rawMessage =
    err instanceof Error ? err.message : typeof err === "string" ? err : "";

  // Gemini SDK often embeds a JSON object in the error message.
  const jsonStart = rawMessage.indexOf("{");
  if (jsonStart !== -1) {
    try {
      const parsed = JSON.parse(rawMessage.slice(jsonStart)) as {
        error?: {
          code?: number;
          status?: string;
          message?: string;
          details?: Array<{ retryDelay?: string }>;
        };
      };
      const code = parsed.error?.code;
      const status = parsed.error?.status;
      if (code === 429 || status === "RESOURCE_EXHAUSTED") {
        const msg = parsed.error?.message || "Quota/rate limit exceeded.";
        const retryDelay = parsed.error?.details?.find(
          (d) => typeof d.retryDelay === "string",
        )?.retryDelay;
        const retryAfterSeconds =
          typeof retryDelay === "string" && retryDelay.endsWith("s")
            ? Number.parseInt(retryDelay.slice(0, -1), 10)
            : undefined;
        return {
          message: msg,
          retryAfterSeconds: Number.isFinite(retryAfterSeconds)
            ? retryAfterSeconds
            : undefined,
        };
      }
    } catch {
      // ignore parse errors
    }
  }

  if (
    rawMessage.includes("RESOURCE_EXHAUSTED") ||
    rawMessage.toLowerCase().includes("quota") ||
    rawMessage.includes("429")
  ) {
    return { message: rawMessage };
  }

  return null;
}

// ===== IMAGE COMPRESSION (RUN ONCE) =====
async function compressImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const compressed = await sharp(buffer)
    .resize(800, 800, { fit: "inside", withoutEnlargement: true }) // smaller = cheaper
    .jpeg({ quality: 60 }) // aggressive compression
    .toBuffer();

  return compressed.toString("base64");
}

// ===== GEMINI CALL =====
async function callGemini(base64: string, apiKey: string) {
  const genAI = new GoogleGenAI({ apiKey });

  const timeoutPromise = new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error("Gemini request timed out"));
    }, TIMEOUT_MS);
  });

  try {
    const res = await Promise.race([
      genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        // model: "gemini-2.0-flash",
        // model: "gemini-2.0-flash-lite",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Extract text from this image and return JSON:
                {
                  "html": "...",
                  "plainText": "..."
                }`,
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      }),
      timeoutPromise,
    ]);

    const text = res.text;
    if (!text) throw new Error("Empty response");

    try {
      const parsed = JSON.parse(text);
      return {
        html: parsed.html || `<pre>${parsed.plainText || text}</pre>`,
        plainText: parsed.plainText || text,
      };
    } catch {
      return { html: `<pre>${text}</pre>`, plainText: text };
    }
  } catch (err) {
    throw err;
  }
}

// ===== MAIN HANDLER =====
export async function POST(req: NextRequest) {
  try {
    if (!apiKeys.length) {
      return jsonError("NO_KEYS", "No API keys configured", 500);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return jsonError("NO_FILE", "File missing", 400);

    if (!file.type.startsWith("image/")) {
      return jsonError("INVALID_TYPE", "Only image allowed", 415);
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      return jsonError("FILE_TOO_LARGE", "Max 5MB allowed", 413);
    }

    // ✅ COMPRESS ONCE
    const base64 = await compressImage(file);

    let lastError: unknown = null;

    // ✅ TRY EACH KEY ONLY ONCE
    for (const key of apiKeys) {
      try {
        const result = await callGemini(base64, key);

        return NextResponse.json({
          success: true,
          ...result,
        } as ApiSuccessResponse);
      } catch (err) {
        lastError = err;

        // ✅ ONLY SWITCH KEY IF QUOTA ERROR
        const quota = parseQuotaError(err);
        if (quota) {
          continue;
        }

        // ❌ Stop retrying for other errors
        console.error("Non-quota error:", err);
        break;
      }
    }

    const quota = parseQuotaError(lastError);
    if (quota) {
      return jsonError(
        "QUOTA_EXHAUSTED",
        "Gemini quota is exhausted/disabled for this API key/project. Enable billing or use a key with available quota. " +
        quota.message,
        429,
        quota.retryAfterSeconds,
      );
    }

    return jsonError(
      "GEMINI_FAILED",
      lastError instanceof Error ? lastError.message : "All keys failed",
      502,
    );
  } catch (err) {
    console.error("Server error:", err);
    return jsonError("SERVER_ERROR", "Internal error", 500);
  }
}