"use client";

import React, { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Archive,
  CheckCircle2,
  CloudUpload,
  FileWarning,
  HardDrive,
  Images,
  Loader2,
  Eye,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  FILE_INPUT_ACCEPT,
  SUPPORTED_EXTENSIONS_LABEL_SHORT,
} from "@/const/image-extensions";
import {
  MAX_IMAGES_PER_UPLOAD,
  MAX_TOTAL_IMAGES,
} from "@/const/imageCompressorLimits";
import {
  useImages,
  useConfig,
  useIsCompressing,
  useUploadStats,
  useIsDownloading,
  useCompletedImagesCount,
  usePendingImagesCount,
  useErrorImagesCount,
  useCompressionProgress,
} from "@/hooks/useImageCompressor";
import { useImageCompressorStore } from "@/store/imageCompressorStore";
import { toast } from "@/store/toastStore";
import { formatBytes } from "@/utils/image/compressors/formatBytes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BatchActionConfirmDialog,
  type BatchConfirmAction,
} from "./BatchActionConfirmDialog";
import { cn } from "@/lib/utils";
import type { ImageItem } from "@/types";
import ImagePreviewDialog from "./ImagePreviewDialog";
import { Field, IndeterminateBar, inputClass, ProgressBar, StatCard } from "./loadImage";

export default function BatchCompressor() {
  const images = useImages();
  const config = useConfig();
  const isCompressing = useIsCompressing();
  const isDownloading = useIsDownloading();
  const uploadStats = useUploadStats();
  const completedCount = useCompletedImagesCount();
  const pendingCount = usePendingImagesCount();
  const errorCount = useErrorImagesCount();
  const compressionProgress = useCompressionProgress();
  const [isDragging, setIsDragging] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<BatchConfirmAction | null>(
    null,
  );
  const [previewImageId, setPreviewImageId] = useState<string | null>(null);

  const {
    addFiles,
    compressAll,
    downloadAsZip,
    setBaseName,
    setBatchSize,
    setQuality,
    clearAll,
    resetForRecompress,
    removeImage,
    restoreImageAt,
    replaceImageWithCrop,
  } = useImageCompressorStore();
  const selectedImage = useMemo(
    () => images.find((item) => item.id === previewImageId) ?? null,
    [images, previewImageId],
  );


  const queueIsFull = images.length >= MAX_TOTAL_IMAGES;
  const slotsRemaining = Math.max(0, MAX_TOTAL_IMAGES - images.length);

  const stats = useMemo(() => {
    const totalImages = images.length;
    const totalOriginal = images.reduce((s, i) => s + i.size, 0);
    const completed = images.filter((i) => i.status === "completed" && i.compressedBlob);
    const totalCompressed = completed.reduce(
      (s, i) => s + (i.compressedBlob?.size ?? 0),
      0,
    );
    const originalForCompleted = completed.reduce((s, i) => s + i.size, 0);
    const avgCompressed =
      completed.length > 0 ? totalCompressed / completed.length : null;
    const savedBytes =
      completed.length > 0 ? Math.max(0, originalForCompleted - totalCompressed) : null;
    const savedPercent =
      originalForCompleted > 0 && savedBytes !== null
        ? Math.round((savedBytes / originalForCompleted) * 100)
        : null;

    return {
      totalImages,
      totalOriginal,
      totalCompressed,
      avgCompressed,
      savedBytes,
      savedPercent,
      completedCount: completed.length,
    };
  }, [images]);

  const compressionPercent = useMemo(() => {
    if (!compressionProgress || compressionProgress.total === 0) return 0;
    return Math.min(
      100,
      Math.round((compressionProgress.done / compressionProgress.total) * 100),
    );
  }, [compressionProgress]);

  const ingestFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (!files.length) return;
      const result = await addFiles(files);
      const parts: string[] = [];
      if (result.addedCount) parts.push(`+${result.addedCount} added`);
      if (result.duplicateCount) parts.push(`${result.duplicateCount} duplicates skipped`);
      if (result.invalidCount) parts.push(`${result.invalidCount} invalid`);
      if (result.truncatedCount) {
        parts.push(
          `${result.truncatedCount} skipped (max ${MAX_IMAGES_PER_UPLOAD}/add · ${MAX_TOTAL_IMAGES} total)`,
        );
      }
      const hasTruncation = (result.truncatedCount ?? 0) > 0;
      const queueRejected = hasTruncation && result.addedCount === 0 && files.length > 0;
      toast({
        variant: queueRejected
          ? "error"
          : hasTruncation
            ? "warning"
            : result.addedCount > 0
              ? result.invalidCount > 0
                ? "warning"
                : "success"
              : result.invalidCount > 0
                ? "error"
                : "info",
        title: "Upload",
        message: parts.length ? parts.join(" · ") : "No new files added.",
      });
    },
    [addFiles],
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) void ingestFiles(files);
    e.target.value = "";
  };

  const handleRemoveImage = useCallback(
    (image: ImageItem, index: number) => {
      if (isCompressing || isDownloading) return;
      const snapshot: ImageItem = { ...image };
      removeImage(image.id);
      toast({
        variant: "info",
        title: "Removed",
        message: `"${image.originalName}" removed from the queue.`,
        action: {
          label: "Undo",
          onClick: () => {
            restoreImageAt(snapshot, index);
          },
        },
      });
    },
    [isCompressing, isDownloading, removeImage, restoreImageAt],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (queueIsFull) {
      toast({
        variant: "warning",
        title: "Queue full",
        message: `Remove images or clear the queue — maximum ${MAX_TOTAL_IMAGES} images.`,
      });
      return;
    }
    const files = e.dataTransfer.files;
    if (files?.length) void ingestFiles(files);
  };

  const handleCompress = async () => {
    if (pendingCount === 0) return;
    await compressAll();
    const { images: next } = useImageCompressorStore.getState();
    const err = next.filter((i) => i.status === "error").length;
    const ok = next.filter((i) => i.status === "completed").length;
    toast({
      variant: err > 0 ? "warning" : "success",
      title: "Compression",
      message:
        err > 0
          ? `Finished: ${ok} OK, ${err} failed.`
          : `All ${ok} image${ok === 1 ? "" : "s"} compressed.`,
    });
  };

  const handleDownload = async () => {
    const ok = await downloadAsZip();
    toast({
      variant: ok ? "success" : "error",
      title: "Download",
      message: ok
        ? "ZIP saved — check your downloads folder."
        : "Could not create ZIP. Compress images first or try again.",
    });
  };

  const handleConfirmAction = (confirmed: BatchConfirmAction) => {
    if (confirmed === "clear") {
      clearAll();
      toast({
        variant: "info",
        title: "Cleared",
        message: "All images removed from the queue.",
      });
      return;
    }
    if (images.length === 0) return;
    resetForRecompress();
    toast({
      variant: "success",
      title: "Reset",
      message: `All ${images.length} image(s) are pending again — same files, ready to compress or download a new ZIP.`,
    });
  };

  return (
    <>
      <BatchActionConfirmDialog
        action={pendingConfirm}
        open={pendingConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setPendingConfirm(null);
        }}
        imageCount={images.length}
        onConfirm={handleConfirmAction}
      />
      <ImagePreviewDialog
        image={selectedImage}
        open={Boolean(selectedImage)}
        onOpenChange={(open) => {
          if (!open) setPreviewImageId(null);
        }}
        onApplyCrop={(payload) => {
          if (!selectedImage) return;
          const previousImage = {
            file: selectedImage.file,
            size: selectedImage.size,
            mimeType: selectedImage.mimeType,
          };
          replaceImageWithCrop(selectedImage.id, payload);
          toast({
            variant: "success",
            title: "Crop applied",
            message: `"${selectedImage.originalName}" updated and ready to compress.`,
            action: {
              label: "Undo",
              onClick: () => {
                const restoredPreviewUrl = URL.createObjectURL(previousImage.file);
                replaceImageWithCrop(selectedImage.id, {
                  file: previousImage.file,
                  previewUrl: restoredPreviewUrl,
                  size: previousImage.size,
                  mimeType: previousImage.mimeType,
                });
                toast({
                  variant: "info",
                  title: "Crop reverted",
                  message: `"${selectedImage.originalName}" restored to the previous version.`,
                });
              },
            },
          });
        }}
      />
      <section className="relative w-full overflow-x-clip">
        <div
          className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/3 rounded-full bg-[#1856FF]/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-32 h-56 w-56 translate-x-1/4 rounded-full bg-[#3A344E]/15 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">

        {/* Header */}
        <div className="relative mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="secondary" className="font-mono text-[10px] tracking-[0.16em]">
              Batch tools
            </Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#141414] dark:text-white md:text-4xl">
              Multi-image{" "}
              <span className="bg-linear-to-r from-[#1856FF] to-[#3A344E] bg-clip-text text-transparent dark:from-[#a5c4ff] dark:to-white/90">
                compressor
              </span>
            </h1>
            <p className="mt-2 max-w-xl text-[#141414]/70 dark:text-white/65">
              Glass-style workspace — local processing, clear progress, instant feedback.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success" className="gap-1.5">
              <CheckCircle2 className="size-3" aria-hidden />
              Private
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px]">
              Max {config.maxFileSizeMB} MB / file
            </Badge>
            <Badge
              variant={queueIsFull ? "warning" : "secondary"}
              className="font-mono text-[10px]"
            >
              Queue {images.length}/{MAX_TOTAL_IMAGES}
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px]">
              {MAX_IMAGES_PER_UPLOAD}/add
            </Badge>
          </div>
        </div>

        {/* Stats dashboard */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Images}
            label="Total images"
            value={String(stats.totalImages)}
            hint={`In queue · cap ${MAX_TOTAL_IMAGES}`}
          />
          <StatCard
            icon={HardDrive}
            label="Total size (original)"
            value={formatBytes(stats.totalOriginal)}
            hint="Sum of uploads"
          />
          <StatCard
            icon={Sparkles}
            label="Avg after compression"
            value={
              stats.avgCompressed != null ? formatBytes(stats.avgCompressed) : "—"
            }
            hint={
              stats.completedCount
                ? `Across ${stats.completedCount} done`
                : "Compress to calculate"
            }
          />
          <StatCard
            icon={Archive}
            label="Space saved"
            value={
              stats.savedBytes != null ? formatBytes(stats.savedBytes) : "—"
            }
            hint={
              stats.savedPercent != null
                ? `~${stats.savedPercent}% smaller (completed)`
                : "—"
            }
            accent="success"
          />
        </div>

        {/* Progress: compression */}
        {(isCompressing || compressionProgress) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 overflow-hidden"
          >
            <Card className="border-[#1856FF]/25 bg-[color-mix(in_srgb,var(--surface)_88%,#1856FF)] dark:border-[#1856FF]/30">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-[#141414] dark:text-white">
                    <Loader2 className="size-4 animate-spin text-[#1856FF]" aria-hidden />
                    Compressing…
                  </span>
                  {compressionProgress && (
                    <span className="font-mono text-xs text-[#3A344E] dark:text-white/60">
                      {compressionProgress.done} / {compressionProgress.total}
                    </span>
                  )}
                </div>
                <ProgressBar value={compressionPercent} tone="primary" />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Progress: ZIP */}
        {isDownloading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <Card className="border-[#3A344E]/25 dark:border-white/10">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#141414] dark:text-white">
                  <Loader2 className="size-4 animate-spin text-[#E89558]" aria-hidden />
                  Building ZIP archive…
                </div>
                <IndeterminateBar />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Config */}
        <Card className="mb-6 border-black/6 dark:border-white/10">
          <CardContent className="grid gap-6 p-6 md:grid-cols-3">
            <Field label="Base name" hint="Prefix in ZIP (e.g. photo → photo-1.jpg)">
              <input
                type="text"
                value={config.baseName}
                onChange={(e) => setBaseName(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Images per folder" hint="batch-1, batch-2, …">
              <input
                type="number"
                min={1}
                max={100}
                value={config.batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value, 10) || 1)}
                className={inputClass}
              />
            </Field>
            <Field
              label={`Quality — ${Math.round(config.quality * 100)}%`}
              hint="20% smaller files ↔ 80% higher quality"
            >
              <input
                type="range"
                min={20}
                max={80}
                value={config.quality * 100}
                onChange={(e) => setQuality(parseInt(e.target.value, 10) / 100)}
                className="h-2 w-full cursor-pointer accent-[#1856FF]"
              />
            </Field>
          </CardContent>
        </Card>

        {/* Drop zone */}
        <div
          onDragOver={queueIsFull ? undefined : handleDragOver}
          onDragLeave={queueIsFull ? undefined : handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative mb-6 rounded-3xl border-2 border-dashed p-10 text-center transition-all",
            queueIsFull && "opacity-75",
            isDragging && !queueIsFull
              ? "border-[#1856FF] bg-[#1856FF]/8 shadow-[0_0_0_4px_rgba(24,86,255,0.12)]"
              : "border-[#3A344E]/20 bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] backdrop-blur-md dark:border-white/10",
          )}
        >
          <input
            type="file"
            multiple
            accept={FILE_INPUT_ACCEPT}
            onChange={handleFileUpload}
            className="sr-only"
            id="file-upload"
            disabled={queueIsFull}
          />
          <CloudUpload
            className="mx-auto size-12 text-[#1856FF] opacity-90"
            strokeWidth={1.25}
            aria-hidden
          />
          <label
            htmlFor="file-upload"
            className={cn(
              "mt-4 block",
              queueIsFull ? "cursor-not-allowed" : "cursor-pointer",
            )}
          >
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold shadow-[0_10px_28px_-6px_rgba(24,86,255,0.55)] ring-1 ring-white/20 transition dark:ring-white/10",
                queueIsFull
                  ? "bg-[#3A344E]/40 text-white/70 ring-white/10"
                  : "bg-[#1856FF] text-white hover:bg-[#0E4ADB]",
              )}
            >
              {queueIsFull ? "Queue full" : "Select images"}
            </span>
          </label>
          <p className="mt-3 text-sm text-[#141414]/65 dark:text-white/55">
            {queueIsFull ? (
              <>
                Maximum {MAX_TOTAL_IMAGES} images — use{" "}
                <strong className="text-[#1856FF]">Reset</strong> to re-run the same
                set, or <strong className="text-[#EA2143]">Clear all</strong> to free slots.
              </>
            ) : (
              <>
                Up to {MAX_IMAGES_PER_UPLOAD} per add · {slotsRemaining} slot
                {slotsRemaining !== 1 ? "s" : ""} left · {SUPPORTED_EXTENSIONS_LABEL_SHORT}
              </>
            )}
          </p>
        </div>

        {uploadStats && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[#1856FF]/20 bg-[#1856FF]/6 px-4 py-3 text-sm dark:border-[#1856FF]/25">
            <FileWarning className="size-4 shrink-0 text-[#E89558]" aria-hidden />
            <span className="text-[#141414]/80 dark:text-white/75">
              Last upload:{" "}
              <strong className="text-[#141414] dark:text-white">{uploadStats.addedCount}</strong>{" "}
              added,{" "}
              <strong>{uploadStats.duplicateCount}</strong> duplicates,{" "}
              <strong className={uploadStats.invalidCount ? "text-[#EA2143]" : ""}>
                {uploadStats.invalidCount}
              </strong>{" "}
              invalid
              {(uploadStats.truncatedCount ?? 0) > 0 && (
                <>
                  ,{" "}
                  <strong className="text-[#E89558]">{uploadStats.truncatedCount}</strong> skipped
                  (limit)
                </>
              )}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Button size="lg" disabled={isCompressing || pendingCount === 0} onClick={() => void handleCompress()}>
            {isCompressing ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Compressing…
              </>
            ) : (
              <>
                <Sparkles className="size-5" />
                Compress all ({pendingCount})
              </>
            )}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            disabled={isDownloading || completedCount === 0}
            onClick={() => void handleDownload()}
          >
            {isDownloading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                ZIP…
              </>
            ) : (
              <>
                <Archive className="size-5" />
                Download ZIP ({completedCount})
              </>
            )}
          </Button>
          <Button
            size="lg"
            variant="outline"
            disabled={
              images.length === 0 || isCompressing || isDownloading
            }
            onClick={() => setPendingConfirm("reset")}
          >
            <RotateCcw className="size-5" aria-hidden />
            Reset
          </Button>
          <Button
            size="lg"
            variant="destructive"
            disabled={images.length === 0 || isCompressing || isDownloading}
            onClick={() => setPendingConfirm("clear")}
          >
            Clear all
          </Button>
        </div>

        {/* Summary chips */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Badge variant="default">Done: {completedCount}</Badge>
          <Badge variant="warning">Pending: {pendingCount}</Badge>
          {errorCount > 0 && (
            <Badge variant="secondary" className="border-[#EA2143]/30 text-[#EA2143]">
              Errors: {errorCount}
            </Badge>
          )}
        </div>

        {/* Image grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <Card
              key={image.id}
              className="overflow-hidden border-black/6 transition-shadow hover:shadow-[0_12px_40px_-16px_rgba(24,86,255,0.2)] dark:border-white/10"
            >
              <CardContent className="p-3">
                {image.previewUrl && (
                  <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-xl bg-[#3A344E]/5 dark:bg-white/5">
                    <Image
                      src={image.previewUrl}
                      alt={image.originalName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      unoptimized
                    />
                    {image.status === "processing" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#141414]/40 backdrop-blur-[2px]">
                        <Loader2 className="size-8 animate-spin text-white" aria-hidden />
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={isCompressing || isDownloading}
                      onClick={() => handleRemoveImage(image, index)}
                      className={cn(
                        "absolute right-2 top-2 flex size-9 items-center justify-center rounded-full border border-white/25 bg-[#141414]/55 text-white shadow-md backdrop-blur-sm transition",
                        "hover:bg-[#EA2143]/90 hover:border-white/40",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
                        (isCompressing || isDownloading) && "cursor-not-allowed opacity-40",
                      )}
                      aria-label={`Remove ${image.originalName}`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewImageId(image.id)}
                      className={cn(
                        "absolute bottom-2 right-2 flex size-9 items-center justify-center rounded-full border border-white/25 bg-[#141414]/55 text-white shadow-md backdrop-blur-sm transition",
                        "hover:bg-[#1856FF]/85 hover:border-white/40",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
                      )}
                      aria-label={`Preview ${image.originalName}`}
                    >
                      <Eye className="size-4" aria-hidden />
                    </button>
                  </div>
                )}
                <p className="truncate font-mono text-[10px] text-[#3A344E] dark:text-white/50">
                  {image.originalName}
                </p>
                <p className="mt-1 text-xs text-[#141414]/60 dark:text-white/55">
                  {formatBytes(image.size)}
                  {image.compressedBlob && (
                    <>
                      {" → "}
                      <span className="font-medium text-[#07CA6B]">
                        {formatBytes(image.compressedBlob.size)}
                      </span>
                    </>
                  )}
                </p>
                <p className="mt-1 text-xs">
                  <span
                    className={cn(
                      "font-semibold",
                      image.status === "completed" && "text-[#07CA6B]",
                      image.status === "error" && "text-[#EA2143]",
                      image.status === "processing" && "text-[#E89558]",
                      image.status === "pending" && "text-[#141414]/55 dark:text-white/45",
                    )}
                  >
                    {image.status}
                  </span>
                </p>
                {image.error && (
                  <p className="mt-1 text-xs text-[#EA2143]">{image.error}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {images.length === 0 && (
          <p className="py-12 text-center text-sm text-[#141414]/50 dark:text-white/45">
            No images yet — upload to see stats and progress.
          </p>
        )}
        </div>
      </section>
    </>
  );
}
