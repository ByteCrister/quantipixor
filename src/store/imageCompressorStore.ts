// store/imageCompressorStore.ts
import { create } from 'zustand';
import { nanoid } from 'nanoid';
import {
    ImageCompressorStore,
    ImageItem,
    CompressionConfig,
    UploadStats,
} from '@/types';
import { computeFileHash } from '@/utils/image/compressors/hash';
import { validateImage } from '@/utils/image/compressors/validation';
import { compressImage } from '@/utils/image/compressors/compress';
import { generateImagesZip } from '@/utils/image/compressors/zipGenerator';
import { SUPPORTED_MIME_TYPES } from '@/const/image-extensions';
import {
    MAX_IMAGES_PER_UPLOAD,
    MAX_TOTAL_IMAGES,
} from '@/const/imageCompressorLimits';

const DEFAULT_CONFIG: CompressionConfig = {
    baseName: 'image',
    batchSize: 10,
    quality: 0.7,
    maxFileSizeMB: 15,
    allowedFormats: [...SUPPORTED_MIME_TYPES],
};

export const useImageCompressorStore = create<ImageCompressorStore>(
    (set, get) => ({
        // State
        images: [],
        config: DEFAULT_CONFIG,
        isCompressing: false,
        uploadStats: null,
        isDownloading: false,
        compressionProgress: null,

        // Actions
        addFiles: async (files: File[]) => {
            const { images, config } = get();
            const existingHashes = new Set(images.map((img) => img.hash));

            const roomInQueue = MAX_TOTAL_IMAGES - images.length;
            let truncatedCount = 0;
            let filesToConsider = files;

            if (roomInQueue <= 0) {
                truncatedCount = files.length;
                filesToConsider = [];
            } else {
                const maxThisBatch = Math.min(MAX_IMAGES_PER_UPLOAD, roomInQueue);
                if (files.length > maxThisBatch) {
                    truncatedCount = files.length - maxThisBatch;
                    filesToConsider = files.slice(0, maxThisBatch);
                }
            }

            let addedCount = 0;
            let duplicateCount = 0;
            let invalidCount = 0;

            const newImages: ImageItem[] = [];

            for (const file of filesToConsider) {
                const validation = validateImage(file, config);
                if (!validation.valid) {
                    invalidCount++;
                    console.warn(`Invalid file ${file.name}: ${validation.error}`);
                    continue;
                }

                const hash = await computeFileHash(file);

                if (existingHashes.has(hash)) {
                    duplicateCount++;
                    continue;
                }

                existingHashes.add(hash);
                const previewUrl = URL.createObjectURL(file);

                const newImage: ImageItem = {
                    id: nanoid(),
                    file,
                    originalName: file.name,
                    hash,
                    status: 'pending',
                    size: file.size,
                    mimeType: file.type,
                    previewUrl,
                };

                newImages.push(newImage);
                addedCount++;
            }

            const stats: UploadStats = {
                addedCount,
                duplicateCount,
                invalidCount,
                lastUploadTimestamp: Date.now(),
                ...(truncatedCount > 0 ? { truncatedCount } : {}),
            };

            set((state) => ({
                images: [...state.images, ...newImages],
                uploadStats: stats,
            }));

            return stats;
        },

        removeImage: (id: string) => {
            set((state) => {
                const imageToRemove = state.images.find((img) => img.id === id);
                if (imageToRemove?.previewUrl) {
                    URL.revokeObjectURL(imageToRemove.previewUrl);
                }
                return {
                    images: state.images.filter((img) => img.id !== id),
                };
            });
        },

        restoreImageAt: (item: ImageItem, index: number) => {
            set((state) => {
                if (state.images.length >= MAX_TOTAL_IMAGES) return state;
                const previewUrl = URL.createObjectURL(item.file);
                const restored: ImageItem = { ...item, previewUrl };
                const next = [...state.images];
                const i = Math.min(Math.max(0, index), next.length);
                next.splice(i, 0, restored);
                return { images: next };
            });
        },

        clearAll: () => {
            set((state) => {
                state.images.forEach((img) => {
                    if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
                });
                return { images: [], compressionProgress: null };
            });
        },

        resetForRecompress: () => {
            set((state) => ({
                images: state.images.map((img) => ({
                    ...img,
                    status: 'pending',
                    compressedBlob: undefined,
                    error: undefined,
                })),
                compressionProgress: null,
                uploadStats: null,
                isCompressing: false,
                isDownloading: false,
            }));
        },

        setBaseName: (name: string) => {
            set((state) => ({
                config: { ...state.config, baseName: name || 'image' },
            }));
        },

        setBatchSize: (size: number) => {
            const batchSize = Math.max(1, Math.min(100, size));
            set((state) => ({
                config: { ...state.config, batchSize },
            }));
        },

        setQuality: (quality: number) => {
            const clampedQuality = Math.min(0.8, Math.max(0.2, quality));
            set((state) => ({
                config: { ...state.config, quality: clampedQuality },
            }));
        },

        setAllowedFormats: (formats: string[]) => {
            set((state) => ({
                config: { ...state.config, allowedFormats: formats },
            }));
        },

        compressAll: async () => {
            const { images, config, isCompressing } = get();
            if (isCompressing) return;

            const pendingImages = images.filter((img) => img.status === 'pending');
            if (pendingImages.length === 0) return;

            const total = pendingImages.length;
            set({
                isCompressing: true,
                compressionProgress: { done: 0, total },
            });

            let done = 0;
            for (const image of pendingImages) {
                try {
                    set((state) => ({
                        images: state.images.map((img) =>
                            img.id === image.id ? { ...img, status: 'processing' } : img
                        ),
                    }));

                    const compressedBlob = await compressImage(image.file, config.quality);

                    done += 1;
                    set((state) => ({
                        images: state.images.map((img) =>
                            img.id === image.id
                                ? {
                                    ...img,
                                    status: 'completed',
                                    compressedBlob,
                                }
                                : img
                        ),
                        compressionProgress: { done, total },
                    }));
                } catch (error) {
                    done += 1;
                    set((state) => ({
                        images: state.images.map((img) =>
                            img.id === image.id
                                ? {
                                    ...img,
                                    status: 'error',
                                    error: error instanceof Error ? error.message : 'Compression failed',
                                }
                                : img
                        ),
                        compressionProgress: { done, total },
                    }));
                }
            }

            set({ isCompressing: false, compressionProgress: null });
        },

        downloadAsZip: async () => {
            const { isDownloading, compressAll } = get();

            if (isDownloading) return false;

            const hasPending = get().images.some((img) => img.status === 'pending');
            if (hasPending) {
                await compressAll();
            }

            const { images, config } = get();
            const completedImages = images.filter(
                (img) => img.status === 'completed' && img.compressedBlob
            );

            if (completedImages.length === 0) {
                console.warn('No compressed images to download');
                return false;
            }

            set({ isDownloading: true });

            try {
                const zipBlob = await generateImagesZip(completedImages, config);
                const url = URL.createObjectURL(zipBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `compressed-images-${Date.now()}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                return true;
            } catch (error) {
                console.error('Failed to generate ZIP:', error);
                return false;
            } finally {
                set({ isDownloading: false });
            }
        },

        resetStore: () => {
            set((state) => {
                state.images.forEach((img) => {
                    if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
                });
                return {
                    images: [],
                    config: DEFAULT_CONFIG,
                    isCompressing: false,
                    uploadStats: null,
                    isDownloading: false,
                    compressionProgress: null,
                };
            });
        },
    })
);