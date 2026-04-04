import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import JSZip from 'jszip';
import toIco from 'to-ico';

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

const ICO_SIZES = [16, 32, 48, 64, 128, 256];

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as Blob;
        if (!file) throw new Error('No image provided');

        const buffer = Buffer.from(await file.arrayBuffer());
        const zip = new JSZip();

        // 1. Generate all PNG icons
        for (const { size, name } of PNG_SIZES) {
            const resized = await sharp(buffer)
                .resize(size, size, { fit: 'cover' })
                .png()
                .toBuffer();
            zip.file(name, resized);
        }

        // 2. Generate PNGs for each ICO size
        const icoPngBuffers = await Promise.all(
            ICO_SIZES.map(async (size) => {
                return await sharp(buffer)
                    .resize(size, size, { fit: 'cover' })
                    .png()
                    .toBuffer();
            })
        );

        // 3. Combine PNGs into a single .ico file using to-ico
        const icoBuffer = await toIco(icoPngBuffers);
        zip.file('favicon.ico', icoBuffer);

        // 4. Add manifest and browserconfig
        const manifest = {
            name: 'My App',
            icons: PNG_SIZES.map(({ size, name }) => ({
                src: `/${name}`,
                sizes: `${size}x${size}`,
                type: 'image/png',
            })),
        };
        zip.file('site.webmanifest', JSON.stringify(manifest, null, 2));

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

        // 5. Generate 150x150 mstile
        const mstileBlob = await sharp(buffer).resize(150, 150).png().toBuffer();
        zip.file('mstile-150x150.png', mstileBlob);

        // 6. Create ZIP
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
        return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
    }
}