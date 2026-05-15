"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCopy,
  CloudUpload,
  Download,
  ImageIcon,
  Loader2,
  RefreshCw,
  Scissors,
  Sparkles,
} from "lucide-react";

import { getEffectiveImageMime } from "@/const/image-extensions.const";
import { formatBytes } from "@/utils/image/compressors/formatBytes";
import { probeCanvasMime } from "@/utils/image/converters/probeCanvasMime";
import { imageDataToBmpBlob } from "@/utils/image/converters/imageDataToBmpBlob";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";
import type { CropSettings } from "@/types/index.types";
import cropImageFromPreview from "@/components/global/image-cropper/cropImageFromPreview";
import CropImage from "@/components/global/image-cropper/CropImage";
import { withExtension } from "@/components/image/batch-compressor/loadImage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ---------------------------------------------------------------------------
// Output types: JPEG/PNG/WebP/AVIF via canvas.toBlob; BMP via software encoder
// ---------------------------------------------------------------------------

type OutputMime =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/avif"
  | "image/bmp";

const OUTPUT_FORMAT_DEFS: readonly {
  label: string;
  mime: OutputMime;
  extension: string;
}[] = [
  { label: "JPEG", mime: "image/jpeg", extension: "jpg" },
  { label: "PNG", mime: "image/png", extension: "png" },
  { label: "WebP", mime: "image/webp", extension: "webp" },
  { label: "AVIF", mime: "image/avif", extension: "avif" },
  { label: "BMP (24-bit)", mime: "image/bmp", extension: "bmp" },
] as const;

/**
 * Raster inputs the user may load. Decoding depends on the browser; unsupported
 * files fail with a clear canvas/load error.
 */
const ALLOWED_INPUT_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/jfif",
  "image/png",
  "image/apng",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/x-ms-bmp",
  "image/avif",
  "image/tiff",
  "image/x-tiff",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "image/ico",
  "image/svg+xml",
] as const;

const ALLOWED_INPUT_SET = new Set<string>(
  ALLOWED_INPUT_MIMES.map((m) => m.toLowerCase()),
);

/** For `<input accept>` — MIME tokens plus common extensions */
const INPUT_ACCEPT = [
  ...ALLOWED_INPUT_MIMES,
  ".jpg",
  ".jpeg",
  ".jfif",
  ".png",
  ".apng",
  ".webp",
  ".gif",
  ".bmp",
  ".avif",
  ".tiff",
  ".tif",
  ".ico",
  ".svg",
].join(",");

const INPUT_FORMAT_LABELS: Record<string, string> = {
  "image/jpeg": "JPEG",
  "image/jpg": "JPEG",
  "image/pjpeg": "JPEG",
  "image/jfif": "JPEG",
  "image/png": "PNG",
  "image/apng": "APNG",
  "image/webp": "WebP",
  "image/gif": "GIF",
  "image/bmp": "BMP",
  "image/x-ms-bmp": "BMP",
  "image/avif": "AVIF",
  "image/tiff": "TIFF",
  "image/x-tiff": "TIFF",
  "image/x-icon": "ICO",
  "image/vnd.microsoft.icon": "ICO",
  "image/ico": "ICO",
  "image/svg+xml": "SVG",
};

function labelForMime(mime: string | null): string {
  if (!mime) return "—";
  const base = mime.split(";")[0]?.trim().toLowerCase() ?? mime;
  return INPUT_FORMAT_LABELS[base] ?? base.split("/")[1]?.toUpperCase() ?? base;
}

/**
 * If the source already matches an output type, hide that target so the user
 * picks a real conversion.
 */
function getExcludedOutputMime(sourceMime: string | null): OutputMime | null {
  if (!sourceMime) return null;
  const base = sourceMime.split(";")[0]?.trim().toLowerCase() ?? sourceMime;
  if (
    ["image/jpeg", "image/jpg", "image/pjpeg", "image/jfif"].includes(base)
  ) {
    return "image/jpeg";
  }
  if (["image/png", "image/apng"].includes(base)) {
    return "image/png";
  }
  if (base === "image/webp") {
    return "image/webp";
  }
  if (base === "image/avif") {
    return "image/avif";
  }
  if (base === "image/bmp" || base === "image/x-ms-bmp") {
    return "image/bmp";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Conversion + Base64
// ---------------------------------------------------------------------------

async function convertImageToFormat(
  file: File,
  targetMime: OutputMime,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      if (targetMime === "image/bmp") {
        const flat = document.createElement("canvas");
        flat.width = img.width;
        flat.height = img.height;
        const fctx = flat.getContext("2d");
        if (!fctx) {
          reject(new Error("Could not use canvas in this browser."));
          return;
        }
        fctx.fillStyle = "#ffffff";
        fctx.fillRect(0, 0, flat.width, flat.height);
        fctx.drawImage(img, 0, 0);
        try {
          const imageData = fctx.getImageData(0, 0, flat.width, flat.height);
          resolve(imageDataToBmpBlob(imageData));
        } catch {
          reject(
            new Error(
              "Could not build BMP (image may be too large or tainted).",
            ),
          );
        }
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not use canvas in this browser."));
        return;
      }

      ctx.drawImage(img, 0, 0);

      const useQuality =
        targetMime === "image/jpeg" ||
        targetMime === "image/webp" ||
        targetMime === "image/avif"
          ? quality ?? 0.92
          : undefined;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(
              new Error(
                `This browser cannot encode ${targetMime.split("/")[1]?.toUpperCase() ?? "that format"}. Try JPEG, PNG, WebP, or BMP.`,
              ),
            );
          }
        },
        targetMime,
        useQuality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          "Could not decode this image. Try another file or format.",
        ),
      );
    };

    img.src = url;
  });
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ImageConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(
    null,
  );
  const [detectedSourceMime, setDetectedSourceMime] = useState<string | null>(
    null,
  );
  const [selectedTargetFormat, setSelectedTargetFormat] =
    useState<OutputMime>("image/png");

  const [sourceDataUrl, setSourceDataUrl] = useState<string | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedPreviewUrl, setConvertedPreviewUrl] = useState<string | null>(
    null,
  );
  const [convertedDataUrl, setConvertedDataUrl] = useState<string | null>(null);

  const [includePrefix, setIncludePrefix] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropSettings>({
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    frameSize: 72,
  });

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalUrlRef = useRef<string | null>(null);
  const convertedUrlRef = useRef<string | null>(null);
  const loadGenerationRef = useRef(0);

  const [canvasAvifOk, setCanvasAvifOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void probeCanvasMime("image/avif", 0.8).then((ok) => {
      if (!cancelled) setCanvasAvifOk(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const outputFormats = useMemo(
    () =>
      OUTPUT_FORMAT_DEFS.filter(
        (f) => f.mime !== "image/avif" || canvasAvifOk,
      ),
    [canvasAvifOk],
  );

  const excludedOutputMime = getExcludedOutputMime(detectedSourceMime);
  const targetOptions = outputFormats.filter(
    (f) => f.mime !== excludedOutputMime,
  );

  useEffect(() => {
    if (!detectedSourceMime) return;
    const excluded = getExcludedOutputMime(detectedSourceMime);
    const available = outputFormats
      .filter((m) => m.mime !== excluded)
      .map((x) => x.mime);
    setSelectedTargetFormat((prev) =>
      available.includes(prev) ? prev : available[0] ?? "image/png",
    );
  }, [detectedSourceMime, outputFormats]);

  useEffect(() => {
    return () => {
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
      if (convertedUrlRef.current) URL.revokeObjectURL(convertedUrlRef.current);
    };
  }, []);

  useEffect(() => {
    setCrop({ zoom: 1, offsetX: 0, offsetY: 0, frameSize: 72 });
  }, [file?.name]);

  const processFile = useCallback((selectedFile: File, options?: { silentLoadedToast?: boolean }) => {
    const effectiveMime = getEffectiveImageMime(selectedFile);
    const normalizedBase = effectiveMime?.split(";")[0]?.trim().toLowerCase() ?? "";
    const allowed =
      effectiveMime &&
      (ALLOWED_INPUT_SET.has(normalizedBase) ||
        ALLOWED_INPUT_SET.has(effectiveMime.toLowerCase()));

    if (!allowed || !effectiveMime) {
      const msg = `Use a supported image type (e.g. ${[
        "JPEG",
        "PNG",
        "WebP",
        "GIF",
        "BMP",
        "AVIF",
        "TIFF",
        "ICO",
        "SVG",
      ].join(", ")}).`;
      setError(msg);
      toast({ variant: "error", title: "Unsupported file", message: msg });
      setFile(null);
      setOriginalPreviewUrl(null);
      setDetectedSourceMime(null);
      setSourceDataUrl(null);
      return;
    }

    if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
    if (convertedUrlRef.current) URL.revokeObjectURL(convertedUrlRef.current);
    originalUrlRef.current = null;
    convertedUrlRef.current = null;

    setConvertedBlob(null);
    setConvertedPreviewUrl(null);
    setConvertedDataUrl(null);
    setError(null);

    setFile(selectedFile);
    const preview = URL.createObjectURL(selectedFile);
    originalUrlRef.current = preview;
    setOriginalPreviewUrl(preview);
    setDetectedSourceMime(effectiveMime);

    const gen = ++loadGenerationRef.current;
    setSourceDataUrl(null);

    void blobToDataURL(selectedFile).then((dataUrl) => {
      if (gen !== loadGenerationRef.current) return;
      setSourceDataUrl(dataUrl);
    });

    if (!options?.silentLoadedToast) {
      toast({
        variant: "success",
        title: "Image loaded",
        message: `${selectedFile.name} · ${formatBytes(selectedFile.size)} — source Base64 is shown below.`,
      });
    }
  }, []);

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
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processFile(droppedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
    e.target.value = "";
  };

  const handleConvert = async () => {
    if (!file) {
      setError("Select an image first.");
      return;
    }

    const excluded = getExcludedOutputMime(detectedSourceMime);
    if (excluded && selectedTargetFormat === excluded) {
      setError("Choose a target format different from your source type.");
      toast({
        variant: "warning",
        title: "Invalid target",
        message: "Pick a format other than the uploaded image type.",
      });
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      const quality = 0.92;
      const converted = await convertImageToFormat(
        file,
        selectedTargetFormat,
        quality,
      );
      setConvertedBlob(converted);

      if (convertedUrlRef.current) URL.revokeObjectURL(convertedUrlRef.current);
      const newPreviewUrl = URL.createObjectURL(converted);
      convertedUrlRef.current = newPreviewUrl;
      setConvertedPreviewUrl(newPreviewUrl);

      const dataUrl = await blobToDataURL(converted);
      setConvertedDataUrl(dataUrl);

      toast({
        variant: "success",
        title: "Converted",
        message: `Output is ${labelForMime(selectedTargetFormat)} — Base64 updated below.`,
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Conversion failed.");
      setConvertedBlob(null);
      setConvertedPreviewUrl(null);
      setConvertedDataUrl(null);
      toast({
        variant: "error",
        title: "Conversion failed",
        message: err instanceof Error ? err.message : "Try another file or target.",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleApplyCrop = async () => {
    if (!file || !originalPreviewUrl || isCropping) return;
    const previousFile = file;
    try {
      setIsCropping(true);
      const blob = await cropImageFromPreview(originalPreviewUrl, file.name, crop);
      const ext = blob.type === "image/png" ? "png" : "jpg";
      const croppedFile = new File([blob], withExtension(file.name, ext), {
        type: blob.type,
      });
      processFile(croppedFile, { silentLoadedToast: true });
      setCropDialogOpen(false);
      toast({
        variant: "success",
        title: "Crop applied",
        message: "Image updated for conversion.",
        action: {
          label: "Undo",
          onClick: () => {
            processFile(previousFile, { silentLoadedToast: true });
            toast({
              variant: "info",
              title: "Crop reverted",
              message: "Restored the previous image.",
            });
          },
        },
      });
    } catch {
      toast({
        variant: "error",
        title: "Crop failed",
        message: "Could not crop this image. Try again.",
      });
    } finally {
      setIsCropping(false);
    }
  };

  const handleDownload = () => {
    if (!convertedBlob) {
      setError("Convert the image before downloading.");
      return;
    }
    const targetExt = outputFormats.find(
      (f) => f.mime === selectedTargetFormat,
    )?.extension;
    const originalName =
      file?.name?.split(".").slice(0, -1).join(".") || "image";
    const filename = `${originalName}_converted.${targetExt ?? "png"}`;
    const url = URL.createObjectURL(convertedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      variant: "info",
      title: "Download",
      message: `${filename} saved to your downloads folder.`,
    });
  };

  const copyToClipboard = async (data: string | null, kind: "source" | "output") => {
    if (!data) {
      toast({
        variant: "warning",
        title: "Nothing to copy",
        message:
          kind === "source"
            ? "Load an image first."
            : "Convert the image first.",
      });
      return;
    }
    const textToCopy = includePrefix
      ? data
      : data.split(",")[1] ?? "";
    if (!textToCopy) {
      setError("Invalid Base64 data.");
      return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        variant: "success",
        title: "Copied",
        message:
          kind === "source"
            ? "Source Base64 copied to clipboard."
            : "Converted Base64 copied to clipboard.",
      });
    } catch {
      setError("Clipboard permission denied.");
      toast({
        variant: "error",
        title: "Copy failed",
        message: "Allow clipboard access or copy manually from the field.",
      });
    }
  };

  const handleReset = () => {
    loadGenerationRef.current += 1;
    if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
    if (convertedUrlRef.current) URL.revokeObjectURL(convertedUrlRef.current);
    originalUrlRef.current = null;
    convertedUrlRef.current = null;
    setFile(null);
    setOriginalPreviewUrl(null);
    setConvertedBlob(null);
    setConvertedPreviewUrl(null);
    setSourceDataUrl(null);
    setConvertedDataUrl(null);
    setDetectedSourceMime(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const originalSize = file ? formatBytes(file.size) : null;
  const convertedSize = convertedBlob ? formatBytes(convertedBlob.size) : null;

  const displaySource = sourceDataUrl
    ? includePrefix
      ? sourceDataUrl
      : sourceDataUrl.split(",")[1] ?? ""
    : "";
  const displayConverted = convertedDataUrl
    ? includePrefix
      ? convertedDataUrl
      : convertedDataUrl.split(",")[1] ?? ""
    : "";

  const truncate = (s: string, max = 320) =>
    s.length > max ? `${s.slice(0, max)}… (${s.length} chars)` : s;

  return (
    <>
      <Toaster />
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="pr-8">{file?.name ?? "Crop image"}</DialogTitle>
            <DialogDescription>
              Adjust crop area before converting.
            </DialogDescription>
          </DialogHeader>
          {originalPreviewUrl ? (
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <div>
                <CropImage
                  imageUrl={originalPreviewUrl}
                  imageAlt={file?.name ?? "Crop preview"}
                  crop={crop}
                  onCropChange={setCrop}
                />
              </div>
              <div className="space-y-3 rounded-2xl border border-black/8 bg-black/2 p-3 dark:border-white/10 dark:bg-white/3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleApplyCrop()}
                  disabled={isCropping}
                  className="w-full justify-start"
                >
                  {isCropping ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Applying crop…
                    </>
                  ) : (
                    <>
                      <Scissors className="size-4" />
                      Apply crop
                    </>
                  )}
                </Button>
                <p className="text-xs text-[#141414]/60 dark:text-white/60">
                  Pinch on mobile or Ctrl + wheel on desktop for precise zoom.
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      <section className="relative w-full overflow-x-clip">
        <div
          className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/3 rounded-full bg-[#1856FF]/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-32 h-56 w-56 translate-x-1/4 rounded-full bg-[#3A344E]/15 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <Badge
              variant="secondary"
              className="font-mono text-[10px] tracking-[0.16em]"
            >
              Image tools
            </Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#141414] dark:text-white md:text-4xl">
              Image{" "}
              <span className="bg-linear-to-r from-[#1856FF] to-[#3A344E] bg-clip-text text-transparent dark:from-[#a5c4ff] dark:to-white/90">
                converter
              </span>
            </h1>
            <p className="mt-2 max-w-2xl text-[#141414]/70 dark:text-white/65">
              Load a raster or SVG, pick a target type different from the source,
              then download or copy Base64. Processing stays in your browser.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success" className="gap-1.5">
              <CheckCircle2 className="size-3" aria-hidden />
              Local
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px]">
              JPEG · PNG · WebP · BMP · AVIF†
            </Badge>
          </div>
        </motion.div>

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            "JPEG",
            "PNG",
            "WebP",
            "GIF",
            "BMP",
            "AVIF",
            "TIFF",
            "ICO",
            "SVG",
            "…",
          ].map((label) => (
            <Badge key={label} variant="secondary" className="font-normal">
              {label}
            </Badge>
          ))}
        </div>

        <Card className="mb-6 border-black/6 dark:border-white/10">
          <CardContent className="p-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative rounded-3xl border-2 border-dashed p-8 text-center transition-all",
                isDragging
                  ? "border-[#1856FF] bg-[#1856FF]/8 shadow-[0_0_0_4px_rgba(24,86,255,0.12)]"
                  : "border-[#3A344E]/20 bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] backdrop-blur-md dark:border-white/10",
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={INPUT_ACCEPT}
                onChange={handleFileInput}
                className="sr-only"
                id="converter-file-upload"
              />
              <CloudUpload
                className="mx-auto size-12 text-[#1856FF] opacity-90"
                strokeWidth={1.25}
                aria-hidden
              />
              <label
                htmlFor="converter-file-upload"
                className="mt-4 block cursor-pointer"
              >
                <span className="inline-flex items-center justify-center rounded-full bg-[#1856FF] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_-6px_rgba(24,86,255,0.55)] ring-1 ring-white/20 transition hover:bg-[#0E4ADB] dark:ring-white/10">
                  Choose image
                </span>
              </label>
              <p className="mt-3 text-sm text-[#141414]/65 dark:text-white/55">
                Drag and drop or browse · JPG, PNG, WebP, GIF, BMP, AVIF, TIFF, ICO, SVG…
              </p>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div
            className="mb-6 flex gap-3 rounded-2xl border border-[#EA2143]/30 bg-[color-mix(in_srgb,var(--surface)_92%,#EA2143)] px-4 py-3 dark:bg-[#EA2143]/12"
            role="alert"
          >
            <AlertCircle
              className="mt-0.5 size-5 shrink-0 text-[#EA2143]"
              aria-hidden
            />
            <p className="text-sm text-[#141414]/90 dark:text-white/90">{error}</p>
          </div>
        )}

        {file && originalPreviewUrl && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-black/6 dark:border-white/10">
                <CardContent className="p-5">
                  <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#141414] dark:text-white">
                    <ImageIcon className="size-5 text-[#1856FF]" aria-hidden />
                    Original
                  </h2>
                  <div className="flex justify-center rounded-2xl bg-[#3A344E]/5 p-3 dark:bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element -- blob preview */}
                    <img
                      src={originalPreviewUrl}
                      alt=""
                      className="max-h-64 max-w-full object-contain"
                    />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCropDialogOpen(true)}
                    >
                      <Scissors className="size-4" aria-hidden />
                      Crop image
                    </Button>
                  </div>
                  <dl className="mt-4 space-y-1 text-sm text-[#141414]/75 dark:text-white/70">
                    <div className="flex justify-between gap-2">
                      <dt className="text-[#3A344E]/80 dark:text-white/45">Name</dt>
                      <dd className="max-w-[65%] truncate font-mono text-xs">{file.name}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-[#3A344E]/80 dark:text-white/45">Size</dt>
                      <dd>{originalSize}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-[#3A344E]/80 dark:text-white/45">Detected</dt>
                      <dd>{labelForMime(detectedSourceMime)}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card className="border-black/6 dark:border-white/10">
                <CardContent className="space-y-4 p-5">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-[#141414] dark:text-white">
                    <Sparkles className="size-5 text-[#1856FF]" aria-hidden />
                    Convert to
                  </h2>
                  <p className="text-xs text-[#141414]/55 dark:text-white/45">
                    Target formats exclude your source type so you always pick a real
                    conversion.
                  </p>
                  <div>
                    <label
                      htmlFor="target-format"
                      className="mb-2 block text-sm font-semibold text-[#141414] dark:text-white"
                    >
                      Target format
                    </label>
                    <select
                      id="target-format"
                      className={cn(
                        "w-full rounded-xl border border-black/8 bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-3 py-2.5 text-sm text-[#141414] outline-none",
                        "focus:border-[#1856FF]/50 focus:ring-2 focus:ring-[#1856FF]/25",
                        "dark:border-white/10 dark:bg-white/4 dark:text-white",
                      )}
                      value={selectedTargetFormat}
                      onChange={(e) =>
                        setSelectedTargetFormat(e.target.value as OutputMime)
                      }
                    >
                      {targetOptions.map((fmt) => (
                        <option key={fmt.mime} value={fmt.mime}>
                          {fmt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    size="lg"
                    className="w-full"
                    disabled={isConverting || !file}
                    onClick={() => void handleConvert()}
                  >
                    {isConverting ? (
                      <>
                        <Loader2 className="size-5 animate-spin" aria-hidden />
                        Converting…
                      </>
                    ) : (
                      <>
                        <RefreshCw className="size-5" aria-hidden />
                        Convert
                      </>
                    )}
                  </Button>

                  {convertedPreviewUrl && convertedBlob && (
                    <div className="border-t border-black/6 pt-4 dark:border-white/10">
                      <h3 className="mb-2 font-medium text-[#141414] dark:text-white">
                        Output preview
                      </h3>
                      <div className="flex justify-center rounded-2xl bg-[#3A344E]/5 p-3 dark:bg-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={convertedPreviewUrl}
                          alt=""
                          className="max-h-48 max-w-full object-contain"
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-[#141414]/70 dark:text-white/65">
                        <span>Size: {convertedSize}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleDownload}
                        >
                          <Download className="size-4" aria-hidden />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-[#1856FF]/20 bg-[color-mix(in_srgb,var(--surface)_94%,#1856FF)] dark:border-[#1856FF]/25">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold text-[#141414] dark:text-white">
                    Source Base64
                  </h2>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[#141414]/80 dark:text-white/75">
                    <input
                      type="checkbox"
                      checked={includePrefix}
                      onChange={(e) => setIncludePrefix(e.target.checked)}
                      className="rounded border-[#3A344E]/30 accent-[#1856FF]"
                    />
                    Include{" "}
                    <code className="rounded bg-black/6 px-1.5 py-0.5 font-mono text-xs dark:bg-white/10">
                      data:image/…;base64,
                    </code>{" "}
                    prefix
                  </label>
                </div>
                <p className="text-xs text-[#141414]/55 dark:text-white/45">
                  Shown as soon as the file loads. Preview is truncated; full string is
                  copyable.
                </p>
                <div className="max-h-40 overflow-auto rounded-xl border border-black/8 bg-[color-mix(in_srgb,var(--surface)_96%,transparent)] p-3 font-mono text-[11px] leading-relaxed break-all text-[#141414]/85 dark:border-white/10 dark:bg-white/3 dark:text-white/85">
                  {sourceDataUrl ? truncate(displaySource) : (
                    <span className="text-[#141414]/45 dark:text-white/40">Reading file…</span>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={!sourceDataUrl}
                    onClick={() => void copyToClipboard(sourceDataUrl, "source")}
                  >
                    <ClipboardCopy className="size-4" aria-hidden />
                    Copy source
                  </Button>
                </div>
              </CardContent>
            </Card>

            {convertedDataUrl && (
              <Card className="border-black/6 dark:border-white/10">
                <CardContent className="space-y-4 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold text-[#141414] dark:text-white">
                      Converted Base64
                    </h2>
                  </div>
                  <div className="max-h-40 overflow-auto rounded-xl border border-black/8 bg-[color-mix(in_srgb,var(--surface)_96%,transparent)] p-3 font-mono text-[11px] leading-relaxed break-all text-[#141414]/85 dark:border-white/10 dark:bg-white/3 dark:text-white/85">
                    {truncate(displayConverted)}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        void copyToClipboard(convertedDataUrl, "output")
                      }
                    >
                      <ClipboardCopy className="size-4" aria-hidden />
                      Copy output
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {file && (
          <div className="mt-8 flex justify-center">
            <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
              Upload a different image
            </Button>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-[#141414]/45 dark:text-white/40">
          Input decoding depends on your browser. Targets: JPEG, PNG, WebP, and 24-bit BMP
          (always). AVIF appears when your browser supports{" "}
          <code className="rounded bg-black/5 px-1 font-mono dark:bg-white/10">
            canvas.toBlob(&quot;image/avif&quot;)
          </code>{" "}
          (common in Chromium).
        </p>
        </div>
      </section>
    </>
  );
}
