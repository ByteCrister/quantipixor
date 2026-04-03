import JSZip from 'jszip';
import { ImageItem, CompressionConfig } from '@/types';
import { mimeToOutputExtension } from '@/const/image-extensions';

export async function generateImagesZip(
    images: ImageItem[],
    config: CompressionConfig
): Promise<Blob> {
    const zip = new JSZip();
    const batchSize = Math.max(1, config.batchSize);
    const baseName = config.baseName.trim() || 'image';

    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (!image.compressedBlob || image.status !== 'completed') continue;

        const batchIndex = Math.floor(i / batchSize) + 1;
        const sequenceWithinBatch = (i % batchSize) + 1;

        const mimeType = image.compressedBlob.type;
        const extension = mimeToOutputExtension(mimeType);

        const fileName = `${baseName}-${sequenceWithinBatch}.${extension}`;
        const folderPath = `batch-${batchIndex}`;

        zip.file(`${folderPath}/${fileName}`, image.compressedBlob);
    }

    return await zip.generateAsync({ type: 'blob' });
}