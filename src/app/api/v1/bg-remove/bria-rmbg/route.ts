// src/app/api/v1/bg-remove/bria-rmbg/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Client } from "@gradio/client";
import { checkRateLimit } from "@/lib/checkRateLimit"; // adjust import path as needed

/**
 * POST /api/v1/bg-remove/bria-rmbg
 *
 * Removes the background from an uploaded image using the BRIA RMBG 2.0 model
 * hosted on Hugging Face via Gradio client.
 *
 * Rate Limiting:
 * - Per‑user limits are enforced using Redis atomic counters.
 * - Separate minute and hour buckets prevent abuse while allowing bursts.
 * - Limits are configurable via environment variables.
 *
 * @param request - NextRequest containing a multipart/form-data file field.
 * @returns PNG image with transparent background or appropriate error response.
 */
export async function POST(request: NextRequest) {
    // ----------------------------------------------------------------------
    // 1. Extract client identifier for rate limiting
    // ----------------------------------------------------------------------
    // Use X-Forwarded-For header if behind a proxy, fallback to direct IP.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';

    // In a production system with authentication, you would use the user ID here.
    const userId = `ip:${ip}`;

    // Purpose identifier used as part of the Redis key namespace.
    const purpose = "bg-remove";

    // ----------------------------------------------------------------------
    // 2. Apply rate limiting (minute and hour buckets)
    // ----------------------------------------------------------------------
    try {
        const [minuteAllowed, hourAllowed] = await Promise.all([
            checkRateLimit(purpose, userId, "minute"),
            checkRateLimit(purpose, userId, "hour"),
        ]);

        if (!minuteAllowed || !hourAllowed) {
            return NextResponse.json(
                {
                    error: "Rate limit exceeded. Please try again later.",
                    retryAfter: !minuteAllowed ? 60 : 3600, // seconds
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": (!minuteAllowed ? 60 : 3600).toString(),
                    },
                }
            );
        }
    } catch (rateLimitError) {
        // Fail‑open: log the error but continue processing the request.
        // This prevents Redis outages from blocking legitimate traffic.
        console.error(
            "[RateLimit] Error during rate limit check, failing open:",
            rateLimitError
        );
    }

    // ----------------------------------------------------------------------
    // 3. Process the background removal request
    // ----------------------------------------------------------------------
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "Missing required field: 'file'" },
                { status: 400 }
            );
        }

        // Convert uploaded file to a Blob for Gradio client compatibility.
        const buffer = Buffer.from(await file.arrayBuffer());
        const blob = new Blob([buffer], { type: file.type });

        // Connect to the Hugging Face Inference Endpoint via Gradio client.
        const client = await Client.connect(process.env.HF_RMBG_MODEL_NAME!, {
            token: process.env.HF_ACCESS_TOKEN as `hf_${string}`,
        });

        // Invoke the background removal endpoint.
        const result = (await client.predict("/remove_background", [blob])) as {
            data: [{ url: string } | Blob];
        };

        const output = result.data[0];
        let imageBuffer: ArrayBuffer;

        // The Gradio client may return either a file descriptor with a URL
        // or a Blob directly. Handle both cases gracefully.
        if (output && typeof output === "object" && "url" in output) {
            const imageResponse = await fetch(output.url);
            if (!imageResponse.ok) {
                throw new Error(
                    `Failed to fetch result image: ${imageResponse.statusText}`
                );
            }
            imageBuffer = await imageResponse.arrayBuffer();
        } else if (output instanceof Blob) {
            imageBuffer = await output.arrayBuffer();
        } else {
            throw new Error("Unexpected result format received from Gradio client.");
        }

        // Return the processed PNG image.
        return new NextResponse(new Uint8Array(imageBuffer), {
            headers: {
                "Content-Type": "image/png",
                // Optional: cache control for CDN / browser
                "Cache-Control": "public, max-age=86400",
            },
        });
    } catch (processingError) {
        // Log the full error for internal debugging.
        console.error("[Background Removal] Processing failed:", processingError);

        // Return a generic error to the client (avoid leaking internal details).
        return NextResponse.json(
            { error: "An internal error occurred while processing the image." },
            { status: 500 }
        );
    }
}