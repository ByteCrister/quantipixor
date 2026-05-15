import { NextResponse } from 'next/server';
import type { OcrApiResponse, OcrSuccessResponse } from '@/types/ocr-space.types';

// Request body type
interface OcrRequest {
    imageBase64: string;      // Base64 string (with or without data:image/png;base64, prefix)
    filename?: string;        // Optional, defaults to 'image.png'
    language?: string;        // Optional, defaults to 'eng'
}

// Response type
interface ApiResponse {
    success: boolean;
    text?: string;
    error?: string;
    processingTime?: string;
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
    const apiKey = process.env.OCR_SPACE_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { success: false, error: 'OCR_SPACE_API_KEY is not configured' },
            { status: 500 }
        );
    }

    try {
        // Parse request body
        const body = await request.json() as OcrRequest;
        const { imageBase64, filename = 'image.png', language = 'eng' } = body;

        if (!imageBase64) {
            return NextResponse.json(
                { success: false, error: 'Missing imageBase64 in request body' },
                { status: 400 }
            );
        }

        // Convert base64 to buffer
        let base64Data = imageBase64;
        let contentType = 'image/png'; // default

        // Remove data URL prefix if present (e.g., "data:image/png;base64,")
        if (base64Data.includes(',')) {
            const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
                contentType = matches[1]; // e.g., image/png, image/jpeg
                base64Data = matches[2];
            } else {
                // Fallback: split by comma
                const parts = base64Data.split(',');
                base64Data = parts[parts.length - 1];
            }
        }

        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Prepare form data for OCR.Space
        const formData = new FormData();
        formData.append('apikey', apiKey);
        formData.append('language', language);
        formData.append('isOverlayRequired', 'false');
        formData.append('detectOrientation', 'true');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2');

        // Create blob and append as file
        const blob = new Blob([imageBuffer], { type: contentType });
        formData.append('file', blob, filename);

        // Send to OCR.Space API
        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: `OCR.Space API returned ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json() as OcrApiResponse;

        // Check OCR processing errors
        if (data.IsErroredOnProcessing || data.OCRExitCode !== 1) {
            const errorMessage = Array.isArray(data.ErrorMessage)
                ? data.ErrorMessage.join(', ')
                : 'Unknown OCR error';
            return NextResponse.json(
                { success: false, error: `OCR failed: ${errorMessage}` },
                { status: 422 }
            );
        }

        const successData = data as OcrSuccessResponse;
        if (!successData.ParsedResults?.length) {
            return NextResponse.json(
                { success: false, error: 'No parsed results' },
                { status: 422 }
            );
        }

        const extractedText = successData.ParsedResults[0].ParsedText?.trim() || '';

        return NextResponse.json({
            success: true,
            text: extractedText,
            processingTime: successData.ProcessingTimeInMilliseconds,
        });

    } catch (error) {
        console.error('OCR API error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { success: false, error: `Request failed: ${errorMessage}` },
            { status: 500 }
        );
    }
}