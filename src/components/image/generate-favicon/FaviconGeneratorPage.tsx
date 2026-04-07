"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  CloudUpload,
  ImageIcon,
  Loader2,
  Sparkles,
  ZoomIn,
} from "lucide-react";

import { validateImage } from "@/utils/image/compressors/validation";
import { formatBytes } from "@/utils/image/compressors/formatBytes";
import type { CompressionConfig } from "@/types";
import { getCroppedImg } from "@/utils/image/favicons/cropImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";

const DEFAULT_CONFIG: CompressionConfig = {
  allowedFormats: ["image/png", "image/jpeg", "image/webp", "image/jpg"],
  maxFileSizeMB: 10,
  batchSize: 10,
  baseName: "favicon",
  quality: 0.2,
};

const FILE_ACCEPT = "image/png,image/jpeg,image/webp,image/jpg";

/** JSON body shape returned by `/api/v1/generate-favicon` on error. */
type GenerateFaviconsErrorJson = {
  error?: string;
};

function parseGenerateFaviconsErrorJson(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) return undefined;
  const rec = data as GenerateFaviconsErrorJson;
  return typeof rec.error === "string" ? rec.error : undefined;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Something went wrong.";
}

export default function FaviconGeneratorPage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const applyFile = useCallback((file: File) => {
    const validation = validateImage(file, DEFAULT_CONFIG);
    if (!validation.valid) {
      setError(validation.error ?? "Invalid file");
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    setError(null);
    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setImageUrl(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    applyFile(file);
    e.target.value = "";
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleGenerate = async () => {
    if (!originalFile || !imageUrl || !croppedAreaPixels) {
      setError("Adjust the crop, then try again.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const croppedBlob = await getCroppedImg(imageUrl, croppedAreaPixels);

      const formData = new FormData();
      formData.append("image", croppedBlob, "cropped.png");

      const response = await fetch("/api/v1/generate-favicon", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = "Generation failed";
        try {
          const data: unknown = await response.json();
          message = parseGenerateFaviconsErrorJson(data) ?? message;
        } catch {
          /* non-JSON body */
        }
        throw new Error(message);
      }

      const zipBlob = await response.blob();
      const downloadUrl = URL.createObjectURL(zipBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = "favicons.zip";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);

      toast({
        variant: "success",
        title: "Ready",
        message: "favicons.zip downloaded — unpack and copy icons into your site root.",
      });
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };

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
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  };

  const canGenerate = Boolean(originalFile && croppedAreaPixels && !isGenerating);

  return (
    <section className="relative w-full overflow-x-clip">
      <div
        className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/3 rounded-full bg-[#1856FF]/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-32 h-56 w-56 translate-x-1/4 rounded-full bg-[#3A344E]/15 blur-3xl"
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <Badge variant="secondary" className="font-mono text-[10px] tracking-[0.16em]">
            Image tools
          </Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#141414] dark:text-white md:text-4xl">
            Favicon{" "}
            <span className="bg-linear-to-r from-[#1856FF] to-[#3A344E] bg-clip-text text-transparent dark:from-[#a5c4ff] dark:to-white/90">
              generator
            </span>
          </h1>
          <p className="mt-2 max-w-xl text-[#141414]/70 dark:text-white/65">
            Upload artwork, crop to a square, then download a ZIP with standard PNG sizes,
            a multi-size .ico, web manifest, and browserconfig — all processed locally in
            your browser until you generate the pack.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success" className="gap-1.5">
            <CheckCircle2 className="size-3" aria-hidden />
            Private
          </Badge>
          <Badge variant="outline" className="font-mono text-[10px]">
            Max {DEFAULT_CONFIG.maxFileSizeMB} MB
          </Badge>
        </div>
      </motion.div>

      <div className="mb-6 flex flex-wrap gap-2">
        {["PNG 16–512", "Apple touch", "favicon.ico", "site.webmanifest", "browserconfig"].map(
          (label) => (
            <Badge key={label} variant="secondary" className="font-normal">
              {label}
            </Badge>
          ),
        )}
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
              id="favicon-file-upload"
              type="file"
              accept={FILE_ACCEPT}
              onChange={handleFileSelect}
              className="sr-only"
            />
            <CloudUpload
              className="mx-auto size-12 text-[#1856FF] opacity-90"
              strokeWidth={1.25}
              aria-hidden
            />
            <label
              htmlFor="favicon-file-upload"
              className="mt-4 block cursor-pointer"
            >
              <span className="inline-flex items-center justify-center rounded-full bg-[#1856FF] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_-6px_rgba(24,86,255,0.55)] ring-1 ring-white/20 transition hover:bg-[#0E4ADB] dark:ring-white/10">
                Choose image
              </span>
            </label>
            <p className="mt-3 text-sm text-[#141414]/65 dark:text-white/55">
              PNG, JPEG, or WebP · or drag and drop here
            </p>
          </div>

          {originalFile && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#1856FF]/15 bg-[#1856FF]/5 px-4 py-3 text-sm text-[#141414]/80 dark:border-[#1856FF]/25 dark:text-white/75">
              <ImageIcon className="size-4 shrink-0 text-[#1856FF]" aria-hidden />
              <span className="min-w-0 truncate font-mono text-xs">
                {originalFile.name}
              </span>
              <span className="shrink-0 text-[#3A344E]/80 dark:text-white/50">
                ({formatBytes(originalFile.size)})
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {imageUrl && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-6 overflow-hidden"
        >
          <Card className="overflow-hidden border-black/6 dark:border-white/10">
            <CardContent className="space-y-4 p-0">
              <div className="relative h-[min(22rem,70vw)] w-full bg-[#3A344E]/5 dark:bg-white/5 sm:h-96">
                <Cropper
                  image={imageUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="space-y-2 px-4 pb-4 sm:px-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#141414] dark:text-white">
                  <ZoomIn className="size-4 text-[#1856FF]" aria-hidden />
                  Zoom
                </div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer accent-[#1856FF]"
                  aria-valuemin={1}
                  aria-valuemax={3}
                  aria-valuenow={zoom}
                  aria-label="Crop zoom"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          size="lg"
          disabled={!canGenerate}
          onClick={() => void handleGenerate()}
          className="w-full sm:w-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden />
              Generating…
            </>
          ) : (
            <>
              <Archive className="size-5" aria-hidden />
              Generate & download ZIP
            </>
          )}
        </Button>
        <p className="text-center text-xs text-[#141414]/50 dark:text-white/45 sm:text-left">
          <Sparkles className="mr-1 inline size-3.5 text-[#1856FF]" aria-hidden />
          Square crop keeps icons sharp at every size.
        </p>
      </div>
      </div>
    </section>
  );
}
