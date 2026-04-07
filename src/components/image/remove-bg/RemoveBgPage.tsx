"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CropSettings } from "@/types";
import { formatBytes } from "@/utils/image/compressors/formatBytes";
import { validateImage } from "@/utils/image/compressors/validation";
import { compressImage } from "@/utils/image/compressors/compress";
import cropImageFromPreview from "../batch-compressor/cropImageFromPreview";
import CropOverlay from "../batch-compressor/CropOverlay";
import CropControls from "../batch-compressor/CropControls";
import { withExtension } from "../batch-compressor/loadImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  CloudUpload,
  Download,
  Eraser,
  ImageIcon,
  Loader2,
  RefreshCw,
  Scissors,
} from "lucide-react";
import OutOfMemoryDialog from "./OutOfMemoryDialog";

// Allowed image formats and size limit
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 5;
const COMPRESSION_QUALITY = 0.85;

// Helper to get file extension from mime type
function getExtensionFromMime(mimeType: string): string {
    switch (mimeType) {
        case "image/jpeg":
            return ".jpg";
        case "image/png":
            return ".png";
        case "image/webp":
            return ".webp";
        default:
            return "";
    }
}

export default function RemoveBgPage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isCropEnabled, setIsCropEnabled] = useState(false);
  const [crop, setCrop] = useState<CropSettings>({
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    frameSize: 92,
  });
  const [isOutOfMemoryDialogOpen, setIsOutOfMemoryDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const resetCrop = useCallback(() => {
    setCrop({ zoom: 1, offsetX: 0, offsetY: 0, frameSize: 92 });
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const setPreviewObjectUrl = useCallback((url: string | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = url;
    setPreviewUrl(url);
  }, []);

  const processFile = useCallback(
    (file: File, options?: { silent?: boolean }) => {
      const validation = validateImage(file, {
        allowedFormats: ALLOWED_MIME_TYPES,
        maxFileSizeMB: MAX_FILE_SIZE_MB,
        baseName: "image",
        batchSize: 1,
        quality: COMPRESSION_QUALITY,
      });
      if (!validation.valid) {
        const msg = validation.error || "Invalid file";
        setError(msg);
        toast({ variant: "error", title: "Unsupported file", message: msg });
        return;
      }

      const nextUrl = URL.createObjectURL(file);
      setPreviewObjectUrl(nextUrl);
      setOriginalFile(file);
      setResultImageUrl(null);
      setError(null);
      resetCrop();
      setIsCropEnabled(false);

      if (!options?.silent) {
        toast({
          variant: "success",
          title: "Image loaded",
          message: `${file.name} · ${formatBytes(file.size)} ready for background removal.`,
        });
      }
    },
    [resetCrop, setPreviewObjectUrl],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleApplyCrop = async () => {
    if (!isCropEnabled) {
      toast({
        variant: "info",
        title: "Enable crop first",
        message: "Turn on crop mode, then apply crop.",
      });
      return;
    }
    if (!previewUrl || !originalFile || isLoading) return;
    const previousFile = originalFile;
    try {
      const croppedBlob = await cropImageFromPreview(previewUrl, originalFile.name, crop);
      const ext = croppedBlob.type === "image/png" ? "png" : "jpg";
      const croppedFile = new File([croppedBlob], withExtension(originalFile.name, ext), {
        type: croppedBlob.type,
      });

      processFile(croppedFile, { silent: true });
      toast({
        variant: "success",
        title: "Crop applied",
        message: "Preview updated before background removal.",
        action: {
          label: "Undo",
          onClick: () => {
            processFile(previousFile, { silent: true });
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
    }
  };

  // const handleRemoveBackground = async () => {
  //   if (!previewUrl || !originalFile) {
  //     setError("Select an image first.");
  //     return;
  //   }

  //   setIsLoading(true);
  //   setError(null);
  //   setResultImageUrl(null);

  //   try {
  //     const workingFile = isCropEnabled
  //       ? new File(
  //           [await cropImageFromPreview(previewUrl, originalFile.name, crop)],
  //           originalFile.name,
  //           { type: originalFile.type || "image/jpeg" },
  //         )
  //       : originalFile;
  //     const compressedBlob = await compressImage(workingFile, COMPRESSION_QUALITY);
  //     const fileToSend = new File([compressedBlob], workingFile.name, {
  //       type: compressedBlob.type,
  //     });

  //     const apiUrl = process.env.NEXT_PUBLIC_FAST_API_URL;
  //     const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  //     if (!apiUrl) throw new Error("Missing NEXT_PUBLIC_FAST_API_URL");
  //     if (!apiKey) throw new Error("Missing NEXT_PUBLIC_API_KEY");

  //     const formData = new FormData();
  //     formData.append("files", fileToSend);
  //     const response = await fetch(`${apiUrl}/remove-bg`, {
  //       method: "POST",
  //       headers: { Authorization: `Bearer ${apiKey}` },
  //       body: formData,
  //     });

  //     if (!response.ok) {
  //       throw new Error(`API error (${response.status})`);
  //     }

  //     const data = await response.json();
  //     const result = data.results?.[0];
  //     if (!result?.base64 || result.error) {
  //       throw new Error(result?.error || "Background removal failed");
  //     }

  //     setResultImageUrl(result.base64);
  //     toast({
  //       variant: "success",
  //       title: "Background removed",
  //       message: "Your image is ready for download.",
  //     });
  //   } catch (err) {
  //     const message = err instanceof Error ? err.message : "Unknown error occurred";
  //     setError(message);
  //     toast({ variant: "error", title: "Remove background failed", message });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleRemoveBackground = async () => {
    if (!previewUrl || !originalFile) {
      setError("Select an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImageUrl(null);

    setIsOutOfMemoryDialogOpen(true);
    setIsLoading(false);
  };

  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
  };

  const handleDownload = () => {
    if (!resultImageUrl) return;
    const base64Data = resultImageUrl.split(",")[1];
    const mimeType = resultImageUrl.split(";")[0].split(":")[1];
    const extension = getExtensionFromMime(mimeType);
    const fileName = `bg-removed-${Date.now()}${extension}`;
    const blob = base64ToBlob(base64Data, mimeType);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ variant: "info", title: "Download", message: `${fileName} saved.` });
  };

  const handleReset = () => {
    setOriginalFile(null);
    setPreviewObjectUrl(null);
    setResultImageUrl(null);
    setError(null);
    resetCrop();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <>
      <section className="relative w-full overflow-x-clip">
        <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/3 rounded-full bg-[#1856FF]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-32 h-56 w-56 translate-x-1/4 rounded-full bg-[#3A344E]/15 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
          <div className="relative mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="secondary" className="font-mono text-[10px] tracking-[0.16em]">
              Image tools
            </Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#141414] dark:text-white md:text-4xl">
              Background <span className="text-[#1856FF]">remover</span>
            </h1>
            <p className="mt-2 max-w-2xl text-[#141414]/70 dark:text-white/65">
              Upload, crop, remove background, then download a clean cutout.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Local crop</Badge>
            <Badge variant={isCropEnabled ? "default" : "secondary"} className="gap-1.5">
              <CheckCircle2 className="size-3" />
              Crop {isCropEnabled ? "On" : "Off"}
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px]">
              JPEG · PNG · WebP
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px]">
              Max {MAX_FILE_SIZE_MB}MB
            </Badge>
          </div>
        </div>

        <Card className="mb-6 border-black/6 dark:border-white/10">
          <CardContent className="p-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "rounded-3xl border-2 border-dashed p-8 text-center transition-all",
                isDragging
                  ? "border-[#1856FF] bg-[#1856FF]/8 shadow-[0_0_0_4px_rgba(24,86,255,0.12)]"
                  : "border-[#3A344E]/20 bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] backdrop-blur-md dark:border-white/10",
              )}
            >
              <input
                ref={fileInputRef}
                id="remove-bg-upload"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="sr-only"
                disabled={isLoading}
              />
              <CloudUpload className="mx-auto size-12 text-[#1856FF] opacity-90" strokeWidth={1.25} />
              <label htmlFor="remove-bg-upload" className="mt-4 block cursor-pointer">
                <span className="inline-flex items-center justify-center rounded-full bg-[#1856FF] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0E4ADB]">
                  Choose image
                </span>
              </label>
              <p className="mt-3 text-sm text-[#141414]/65 dark:text-white/55">
                Drag and drop or browse an image
              </p>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-6 rounded-2xl border border-[#EA2143]/30 bg-[#EA2143]/10 px-4 py-3 text-sm text-[#EA2143]">
            {error}
          </div>
        )}

        {originalFile && previewUrl && (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <Card className="border-black/6 dark:border-white/10">
              <CardContent className="p-5">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[#141414] dark:text-white">
                  <ImageIcon className="size-5 text-[#1856FF]" />
                  Source preview
                </h2>
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#3A344E]/5 dark:bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt={originalFile.name}
                    className="h-full w-full object-contain"
                    style={{
                      transform: `translate(${crop.offsetX}%, ${crop.offsetY}%) scale(${crop.zoom})`,
                    }}
                  />
                  {isCropEnabled && <CropOverlay crop={crop} />}
                </div>
                <p className="mt-3 text-xs text-[#141414]/55 dark:text-white/55">
                  {originalFile.name} · {formatBytes(originalFile.size)}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                variant={isCropEnabled ? "default" : "outline"}
                className="w-full"
                onClick={() => setIsCropEnabled((v) => !v)}
                disabled={isLoading}
              >
                <Scissors className="size-4" />
                {isCropEnabled ? "Disable crop mode" : "Enable crop mode"}
              </Button>
              {isCropEnabled && <CropControls crop={crop} setCrop={setCrop} />}
              <Button variant="outline" className="w-full" onClick={resetCrop} disabled={isLoading}>
                <RefreshCw className="size-4" />
                Reset crop
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => void handleApplyCrop()}
                disabled={isLoading || !isCropEnabled}
              >
                <Scissors className="size-4" />
                Apply crop
              </Button>
              <Button className="w-full" onClick={() => void handleRemoveBackground()} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Removing background...
                  </>
                ) : (
                  <>
                    <Eraser className="size-4" />
                    Remove background
                  </>
                )}
              </Button>
              <Button variant="ghost" className="w-full" onClick={handleReset} disabled={isLoading}>
                Select new image
              </Button>
            </div>
          </div>
        )}

          {resultImageUrl && (
            <Card className="mt-6 border-black/6 dark:border-white/10">
              <CardContent className="p-5">
                <h3 className="mb-3 text-lg font-semibold text-[#141414] dark:text-white">Result</h3>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-xs overflow-hidden rounded-xl border border-black/8 bg-white p-2 dark:border-white/10 dark:bg-black/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resultImageUrl} alt="Background removed result" className="h-auto w-full object-contain" />
                  </div>
                  <Button onClick={handleDownload}>
                    <Download className="size-4" />
                    Download image
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Separate dialog for out-of-memory error */}
      <OutOfMemoryDialog 
        open={isOutOfMemoryDialogOpen} 
        onClose={() => setIsOutOfMemoryDialogOpen(false)} 
      />
      </>
  );
}