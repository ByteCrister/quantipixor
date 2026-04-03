// hooks/useImageCompressor.ts
import { useImageCompressorStore } from '@/store/imageCompressorStore';
import { useShallow } from 'zustand/react/shallow';

// Selector hooks for optimized re-renders
export const useImages = () => useImageCompressorStore((state) => state.images);
export const useConfig = () => useImageCompressorStore((state) => state.config);
export const useIsCompressing = () =>
    useImageCompressorStore((state) => state.isCompressing);
export const useUploadStats = () =>
    useImageCompressorStore((state) => state.uploadStats);
export const useIsDownloading = () =>
    useImageCompressorStore((state) => state.isDownloading);

export const useCompressionProgress = () =>
    useImageCompressorStore((state) => state.compressionProgress);

// Derived selectors
export const useCompletedImagesCount = () =>
    useImageCompressorStore(
        useShallow((state) => state.images.filter((img) => img.status === 'completed').length)
    );

export const usePendingImagesCount = () =>
    useImageCompressorStore(
        useShallow((state) => state.images.filter((img) => img.status === 'pending').length)
    );

export const useErrorImagesCount = () =>
    useImageCompressorStore(
        useShallow((state) => state.images.filter((img) => img.status === 'error').length)
    );

export const useTotalCompressedSize = () =>
    useImageCompressorStore(
        useShallow((state) =>
            state.images
                .filter((img) => img.compressedBlob)
                .reduce((total, img) => total + (img.compressedBlob?.size || 0), 0)
        )
    );