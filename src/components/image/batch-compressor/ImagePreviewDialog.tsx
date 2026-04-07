"use client";

import { CropSettings, ImageItem } from "@/types";
import { useEffect, useState } from "react";
import cropImageFromPreview from "./cropImageFromPreview";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
import { withExtension } from "./loadImage";
import { toast } from "@/store/toastStore";
import BeforeAfterViewer from "./BeforeAfterViewer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, Scissors, ZoomIn } from "lucide-react";
import CropOverlay from "./CropOverlay";
import CropControls from "./CropControls";

export default function ImagePreviewDialog({
    image,
    open,
    onOpenChange,
    onApplyCrop,
  }: {
    image: ImageItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApplyCrop: (payload: {
      file: File;
      previewUrl: string;
      size: number;
      mimeType: string;
    }) => void;
  }) {
    const [crop, setCrop] = useState<CropSettings>({
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      frameSize: 72,
    });
    const [isCropping, setIsCropping] = useState(false);
    const [showCompare, setShowCompare] = useState(false);
    const [compareSplit, setCompareSplit] = useState(50);
    const [previewZoom, setPreviewZoom] = useState(1);
    const [compareOrigin, setCompareOrigin] = useState({ x: 50, y: 50 });
    const [isDesktopPointer, setIsDesktopPointer] = useState(false);
    const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  
    useEffect(() => {
      if (!image?.compressedBlob) {
        setCompressedUrl(null);
        return;
      }
      const url = URL.createObjectURL(image.compressedBlob);
      setCompressedUrl(url);
      return () => URL.revokeObjectURL(url);
    }, [image?.compressedBlob]);
  
    useEffect(() => {
      setCrop({ zoom: 1, offsetX: 0, offsetY: 0, frameSize: 72 });
      setShowCompare(false);
      setCompareSplit(50);
      setPreviewZoom(1);
      setCompareOrigin({ x: 50, y: 50 });
    }, [image?.id]);
  
    useEffect(() => {
      if (typeof window === "undefined") return;
      const media = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
      const sync = () => setIsDesktopPointer(media.matches);
      sync();
      media.addEventListener("change", sync);
      return () => media.removeEventListener("change", sync);
    }, []);
  
    const canCompare = Boolean(image?.compressedBlob && compressedUrl);
    const activeUrl = image?.previewUrl;
  
    const applyCrop = async () => {
      if (!image?.previewUrl) return;
      try {
        setIsCropping(true);
        const blob = await cropImageFromPreview(image.previewUrl, image.originalName, crop);
        const ext = blob.type === "image/png" ? "png" : "jpg";
        const nextFile = new File([blob], withExtension(image.originalName, ext), {
          type: blob.type,
        });
        const nextPreviewUrl = URL.createObjectURL(nextFile);
        onApplyCrop({
          file: nextFile,
          previewUrl: nextPreviewUrl,
          size: nextFile.size,
          mimeType: nextFile.type,
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
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="pr-8">{image?.originalName ?? "Preview"}</DialogTitle>
            <DialogDescription>
              Preview, crop, and compare compressed output.
            </DialogDescription>
          </DialogHeader>
  
          {!activeUrl ? null : (
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <div className="space-y-3">
                <div className="relative mx-auto aspect-square w-full max-w-2xl overflow-hidden rounded-2xl border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
                  {showCompare && canCompare ? (
                   <BeforeAfterViewer
                   beforeUrl={activeUrl}
                   afterUrl={compressedUrl}
                   split={compareSplit}
                   zoom={previewZoom}
                   origin={compareOrigin}
                   enableWheelZoom={isDesktopPointer}
                   onZoomChange={setPreviewZoom}
                   onOriginChange={setCompareOrigin}
                   onSplitChange={setCompareSplit}
                 />
                  ) : (
                    <>
                      <Image
                        src={activeUrl}
                        alt={image?.originalName ?? "Image preview"}
                        fill
                        className="object-contain"
                        style={{
                          transform: `translate(${crop.offsetX}%, ${crop.offsetY}%) scale(${crop.zoom * previewZoom})`,
                        }}
                        unoptimized
                      />
                      <CropOverlay crop={crop} />
                    </>
                  )}
                </div>
              </div>
  
              <div className="space-y-3 rounded-2xl border border-black/8 bg-black/2 p-3 dark:border-white/10 dark:bg-white/3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={applyCrop}
                  disabled={isCropping || showCompare}
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
                      Crop image
                    </>
                  )}
                </Button>
  
                <Button
                  type="button"
                  variant={showCompare ? "default" : "outline"}
                  onClick={() => setShowCompare((v) => !v)}
                  disabled={!canCompare}
                  className="w-full justify-start"
                >
                  <Eye className="size-4" />
                  Before and after
                </Button>
  
                <div className="space-y-2 rounded-xl border border-black/8 p-3 dark:border-white/10">
                  <p className="flex items-center gap-2 text-xs font-semibold text-[#141414]/70 dark:text-white/70">
                    <ZoomIn className="size-3.5" />
                    Preview zoom ({previewZoom.toFixed(2)}x)
                  </p>
                  {isDesktopPointer ? (
                    <p className="text-xs text-[#141414]/65 dark:text-white/60">
                      Use mouse wheel over preview to zoom at cursor position.
                    </p>
                  ) : (
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.05}
                      value={previewZoom}
                      onChange={(e) => setPreviewZoom(Number(e.target.value))}
                      className="h-2 w-full cursor-pointer accent-[#1856FF]"
                    />
                  )}
                </div>
  
                <CropControls crop={crop} setCrop={setCrop} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }