import JSZip from 'jszip';
import { ImageItem, CompressionConfig } from '@/types';
import { mimeToOutputExtension } from '@/const/image-extensions';

/**
 * Generates a ZIP archive containing all successfully compressed images.
 *
 * The archive is structured into sequential **batches** (folders) based on
 * `config.batchSize`. Each batch contains up to `batchSize` images, named
 * with the pattern:
 * ```
 * batch-{batchIndex}/{baseName}-{sequence}.{ext}
 * ```
 * Only images with `status === 'completed'` and a valid `compressedBlob` are included.
 *
 * @param images - Array of image processing items (some may have failed).
 * @param config - Compression configuration (batch size, base file name).
 * @returns A Promise resolving to a Blob of the generated ZIP file.
 */
export async function generateImagesZip(
    images: ImageItem[],
    config: CompressionConfig
): Promise<Blob> {
    const zip = new JSZip();
    const batchSize = Math.max(1, config.batchSize);
    const baseName = config.baseName.trim() || 'image';

    for (let i = 0; i < images.length; i++) {
        const image = images[i];

        // Skip images that were not processed successfully or lack a compressed result.
        if (!image.compressedBlob || image.status !== 'completed') continue;

        // Determine which batch this image belongs to (1‑based).
        const batchIndex = Math.floor(i / batchSize) + 1;
        // Sequential number within the batch (1‑based).
        const sequenceWithinBatch = (i % batchSize) + 1;

        // Derive the file extension from the compressed blob's MIME type.
        const mimeType = image.compressedBlob.type;
        const extension = mimeToOutputExtension(mimeType);

        const fileName = `${baseName}-${sequenceWithinBatch}.${extension}`;
        const folderPath = `batch-${batchIndex}`;

        // Add the compressed blob to the ZIP under the appropriate folder.
        zip.file(`${folderPath}/${fileName}`, image.compressedBlob);
    }

    // Generate the ZIP as a Blob (ideal for download prompts).
    return await zip.generateAsync({ type: 'blob' });
}