import { pipeline, env, type ProgressInfo } from "@huggingface/transformers";
import type {
    BgRemovalWorkerRequest,
    BgRemovalWorkerResponse,
} from "./bgRemoval.types";

if (env.backends?.onnx?.wasm) {
    // ✅ 1. Configure ONNX Runtime to use specific, compatible file URLs
    env.backends.onnx.wasm.wasmPaths = {
        // The main .wasm file for the CPU backend (multithreaded)
        wasm: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/ort-wasm-simd-threaded.wasm",
        // The corresponding JavaScript loader for the .wasm file
        mjs: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/ort-wasm-simd-threaded.mjs",
    }; env.backends.onnx.wasm.numThreads = 1;
}


type Segmenter = (image: string) => Promise<Array<{ mask?: string }>>;

let segmenter: Segmenter | null = null;

async function loadModel() {
    if (segmenter) return segmenter;

    self.postMessage({ type: 'loading', status: 'Loading background removal model...' });

    segmenter = (await pipeline("image-segmentation", "Xenova/modnet", {
        progress_callback: (progress: ProgressInfo) => {
            self.postMessage({ type: "loadingProgress", progress } satisfies BgRemovalWorkerResponse);
        },
    })) as unknown as Segmenter;

    self.postMessage({ type: 'loadingComplete' });
    return segmenter;
}

async function resizeImage(img: ImageBitmap, maxSize = 1024) {
    let width = img.width;
    let height = img.height;

    if (width > maxSize || height > maxSize) {
        if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
        } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
        }
    }

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get 2D context');
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
}

async function processImage(imageData: ArrayBuffer, mimeType: string) {
    const blob = new Blob([imageData], { type: mimeType });
    const sourceBitmap = await createImageBitmap(blob);

    // Resize for model (max 1024px)
    const resizedCanvas = await resizeImage(sourceBitmap, 1024);
    const resizedBlob = await resizedCanvas.convertToBlob({ type: 'image/png' });
    const resizedUrl = URL.createObjectURL(resizedBlob);

    const segmenter = await loadModel();
    const result = await segmenter(resizedUrl);
    URL.revokeObjectURL(resizedUrl);

    const mask = result[0]?.mask;
    if (!mask) throw new Error('No mask generated');

    // Load mask as ImageBitmap
    const maskResponse = await fetch(mask);
    const maskBlob = await maskResponse.blob();
    const maskBitmap = await createImageBitmap(maskBlob);

    // Apply mask to original image
    const originalCanvas = new OffscreenCanvas(sourceBitmap.width, sourceBitmap.height);
    const origCtx = originalCanvas.getContext('2d')!;
    origCtx.drawImage(sourceBitmap, 0, 0);

    const maskCanvas = new OffscreenCanvas(sourceBitmap.width, sourceBitmap.height);
    const maskCtx = maskCanvas.getContext('2d')!;
    maskCtx.drawImage(maskBitmap, 0, 0, sourceBitmap.width, sourceBitmap.height);
    const maskData = maskCtx.getImageData(0, 0, sourceBitmap.width, sourceBitmap.height);

    const resultCanvas = new OffscreenCanvas(sourceBitmap.width, sourceBitmap.height);
    const resultCtx = resultCanvas.getContext('2d')!;
    resultCtx.drawImage(sourceBitmap, 0, 0);
    const imageDataObj = resultCtx.getImageData(0, 0, sourceBitmap.width, sourceBitmap.height);
    const pixels = imageDataObj.data;

    for (let i = 0; i < pixels.length; i += 4) {
        const maskValue = maskData.data[i] / 255;
        pixels[i + 3] = Math.round(pixels[i + 3] * maskValue);
    }
    resultCtx.putImageData(imageDataObj, 0, 0);

    const resultBlob = await resultCanvas.convertToBlob({ type: 'image/png' });
    return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(resultBlob);
    });
}

self.onmessage = async (e: MessageEvent<BgRemovalWorkerRequest>) => {
    const { id, type, imageData, mimeType } = e.data;

    if (type === 'removeBackground') {
        try {
            const resultBase64 = await processImage(imageData, mimeType);
            self.postMessage({ id, type: "success", resultBase64 } satisfies BgRemovalWorkerResponse);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Background removal failed";
            const name = error instanceof Error ? error.name : "";
            const isOutOfMemory = message.toLowerCase().includes("memory") || name === "AbortError";
            self.postMessage({
                id,
                type: "error",
                error: message,
                isOutOfMemory,
            } satisfies BgRemovalWorkerResponse);
        }
    }
};