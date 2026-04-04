import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import JSZip from 'jszip';
import toIco from 'to-ico';

// Unique sizes needed for PNG files
const PNG_SIZES = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 48, name: 'favicon-48x48.png' },
    { size: 64, name: 'favicon-64x64.png' },
    { size: 128, name: 'favicon-128x128.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' },
    { size: 180, name: 'apple-touch-icon.png' },
];

// Unique sizes needed for ICO
const ICO_SIZES = [16, 32, 48, 64, 128, 256];

// Combine and deduplicate all needed sizes
const ALL_SIZES = [...new Set([...PNG_SIZES.map(s => s.size), ...ICO_SIZES])].sort((a,b) => a - b);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as Blob;
        if (!file) throw new Error('No image provided');

        // Validate file size and type: 10MB max
        if (file.size > 10 * 1024 * 1024) {
            throw new Error('Image too large (max 5MB)');
        }
        if (!file.type.startsWith('image/')) {
            throw new Error('Invalid file type');
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const zip = new JSZip();

        // 1. Generate resized PNG buffers for all needed sizes in parallel
        const resizePromises = ALL_SIZES.map(async (size) => {
            const resized = await sharp(buffer)
                .resize(size, size, {
                    fit: 'cover',
                    withoutEnlargement: true,   // don't upscale if original is smaller
                })
                .png()
                .toBuffer();
            return { size, buffer: resized };
        });

        const resizedBuffers = await Promise.all(resizePromises);
        const bufferMap = new Map(resizedBuffers.map(item => [item.size, item.buffer]));

        // 2. Add PNG files to ZIP (only those defined in PNG_SIZES)
        for (const { size, name } of PNG_SIZES) {
            const pngBuffer = bufferMap.get(size);
            if (pngBuffer) zip.file(name, pngBuffer);
        }

        // 3. Collect PNG buffers for ICO (only sizes defined in ICO_SIZES)
        const icoPngBuffers = ICO_SIZES.map(size => bufferMap.get(size)).filter((buf): buf is Buffer => buf !== undefined);
        if (icoPngBuffers.length) {
            const icoBuffer = await toIco(icoPngBuffers);
            zip.file('favicon.ico', icoBuffer);
        }

        // 4. Add web manifest
        const manifest = {
            name: 'My App',
            icons: PNG_SIZES.map(({ size, name }) => ({
                src: `/${name}`,
                sizes: `${size}x${size}`,
                type: 'image/png',
            })),
        };
        zip.file('site.webmanifest', JSON.stringify(manifest, null, 2));

        // 5. Add browserconfig.xml and mstile
        const browserConfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/mstile-150x150.png"/>
      <TileColor>#da532c</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
        zip.file('browserconfig.xml', browserConfig);

        // Generate 150×150 mstile (if not already present in PNG_SIZES, we add it)
        const mstileBuffer = await sharp(buffer).resize(150, 150).png().toBuffer();
        zip.file('mstile-150x150.png', mstileBuffer);

        // 6. Create ZIP and return
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        const zipUint8 = new Uint8Array(zipBuffer);

        return new NextResponse(zipUint8, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename="favicons.zip"',
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Generation failed' },
            { status: 500 }
        );
    }
}