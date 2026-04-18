// src/app/api/v1/ocr/hf-gemma/route.ts
import { HfInference } from '@huggingface/inference';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/checkRateLimit'; // adjust import path as needed

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

export async function POST(req: NextRequest) {
    try {
        // ─────────────────────────────────────────────────────────────
        // Rate Limiting
        // ─────────────────────────────────────────────────────────────
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || req.headers.get('x-real-ip')
            || 'unknown';

        // Check both minute and hour limits
        const [minuteAllowed, hourAllowed] = await Promise.all([
            checkRateLimit("ocr", ip, 'minute'),
            checkRateLimit("ocr", ip, 'hour'),
        ]);

        if (!minuteAllowed || !hourAllowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Rate limit exceeded. Please try again later.'
                },
                { status: 429 }
            );
        }

        // ─────────────────────────────────────────────────────────────
        // Original OCR logic
        // ─────────────────────────────────────────────────────────────
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const langs = (formData.get('langs') as string) || 'eng';

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No image file provided' },
                { status: 400 }
            );
        }

        const languageHint = langs.split('+').join(', ');
        const prompt = `You are an advanced OCR and document formatter. Extract ALL text from the provided image. 

Requirements:
- Preserve the exact text content, including punctuation, line breaks, and indentation.
- Reconstruct the document's logical structure (headings, paragraphs, lists, tables).
- Output the result as clean, semantic HTML.
- For plain text extraction, also provide a plain text version (without HTML tags) as a separate field.
- The document may contain text in: ${languageHint}. Treat all languages equally.

Respond with a JSON object containing two fields:
{
  "html": "<html string with semantic tags (h1, p, ul, li, table, etc.)>",
  "plainText": "plain text version"
}

Do not include any additional commentary. Output only valid JSON.`;

        const response = await hf.imageToText({
            model: process.env.HF_OCR_MODEL_NAME,
            inputs: file,
            parameters: {
                prompt: prompt,
                max_new_tokens: 4096,
                temperature: 0.1,
            },
        });

        const rawOutput = response.generated_text;
        if (!rawOutput) {
            throw new Error('Model returned empty response');
        }

        let parsed: { html?: string; plainText?: string };
        try {
            const jsonString = rawOutput.replace(/```json|```/g, '').trim();
            parsed = JSON.parse(jsonString);
        } catch (parseError) {
            console.error('Failed to parse model output as JSON:', rawOutput);
            parsed = {
                html: `<pre>${rawOutput.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`,
                plainText: rawOutput,
            };
        }

        return NextResponse.json({
            success: true,
            html: parsed.html || '',
            plainText: parsed.plainText || '',
        });
    } catch (error: any) {
        console.error('Hugging Face OCR error:', error);
        let errorMessage = 'OCR processing failed';
        if (error.message?.includes('quota')) {
            errorMessage = 'Hugging Face API quota exceeded. Please try again later.';
        } else if (error.message?.includes('timeout')) {
            errorMessage = 'Request timed out. The image may be too large or complex.';
        }
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}