// types/index.ts
export type ImageStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface ImageItem {
    id: string;
    file: File;
    originalName: string;
    hash: string;
    status: ImageStatus;
    compressedBlob?: Blob;
    error?: string;
    previewUrl?: string;
    size: number;
    mimeType: string;
}

export interface CompressionConfig {
    baseName: string;
    batchSize: number;
    quality: number; // 0.2 - 0.8
    maxFileSizeMB: number;
    allowedFormats: string[];
}

export interface UploadStats {
    addedCount: number;
    duplicateCount: number;
    invalidCount: number;
    lastUploadTimestamp: number;
    /** Files not processed this round (per-upload cap or queue full). */
    truncatedCount?: number;
}

export interface CompressionProgress {
    done: number;
    total: number;
}

export interface ImageCompressorState {
    images: ImageItem[];
    config: CompressionConfig;
    isCompressing: boolean;
    uploadStats: UploadStats | null;
    isDownloading: boolean;
    compressionProgress: CompressionProgress | null;
}

export interface ImageCompressorActions {
    addFiles: (files: File[]) => Promise<UploadStats>;
    removeImage: (id: string) => void;
    clearAll: () => void;
    /** Same files stay in the queue; clears compression results so you can compress/download again. */
    resetForRecompress: () => void;
    setBaseName: (name: string) => void;
    setBatchSize: (size: number) => void;
    setQuality: (quality: number) => void;
    setAllowedFormats: (formats: string[]) => void;
    compressAll: () => Promise<void>;
    downloadAsZip: () => Promise<boolean>;
    resetStore: () => void;
}

export type ImageCompressorStore = ImageCompressorState & ImageCompressorActions;