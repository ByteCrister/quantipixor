"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, ZoomIn, ZoomOut } from "lucide-react";

import type { CropSettings } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CropImageProps = {
  imageUrl: string;
  imageAlt?: string;
  crop: CropSettings;
  onCropChange: React.Dispatch<React.SetStateAction<CropSettings>>;
  minFrameSize?: number;
  maxFrameSize?: number;
  className?: string;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const MIN_OFFSET = -85;
const MAX_OFFSET = 85;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function baseContainSizePercent(imageRatio: number) {
  if (!Number.isFinite(imageRatio) || imageRatio <= 0) {
    return { width: 100, height: 100 };
  }
  return imageRatio >= 1
    ? { width: 100, height: 100 / imageRatio }
    : { width: 100 * imageRatio, height: 100 };
}

export default function CropImage({
  imageUrl,
  imageAlt = "Crop preview",
  crop,
  onCropChange,
  minFrameSize = 40,
  maxFrameSize = 100,
  className,
}: CropImageProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragStartRef = useRef<{ x: number; y: number; cropX: number; cropY: number } | null>(
    null,
  );
  const pinchStartRef = useRef<{ distance: number; zoom: number } | null>(null);
  const [imageRatio, setImageRatio] = useState(1);

  const frameStyle = useMemo(
    () => ({
      width: `${crop.frameSize}%`,
      height: `${crop.frameSize}%`,
      transform: "translate(-50%, -50%)",
    }),
    [crop.frameSize],
  );

  const updateCrop = (updater: (prev: CropSettings) => CropSettings) => {
    onCropChange((prev) => updater(prev));
  };

  const clampOffsets = useCallback((next: CropSettings) => {
    const contain = baseContainSizePercent(imageRatio);
    const renderWidth = contain.width * next.zoom;
    const renderHeight = contain.height * next.zoom;
    const maxX = Math.max(0, (renderWidth - next.frameSize) / 2);
    const maxY = Math.max(0, (renderHeight - next.frameSize) / 2);
    return {
      ...next,
      offsetX: clamp(next.offsetX, Math.max(MIN_OFFSET, -maxX), Math.min(MAX_OFFSET, maxX)),
      offsetY: clamp(next.offsetY, Math.max(MIN_OFFSET, -maxY), Math.min(MAX_OFFSET, maxY)),
    };
  }, [imageRatio]);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled || img.naturalWidth <= 0 || img.naturalHeight <= 0) return;
      setImageRatio(img.naturalWidth / img.naturalHeight);
    };
    img.src = imageUrl;
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  useEffect(() => {
    onCropChange((prev) => {
      const zoom = clamp(prev.zoom, MIN_ZOOM, MAX_ZOOM);
      return clampOffsets({ ...prev, zoom });
    });
  }, [imageRatio, onCropChange, clampOffsets]);

  const onWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    const delta = -event.deltaY;
    const factor = delta > 0 ? 0.12 : -0.12;
    updateCrop((prev) => {
      return clampOffsets({
        ...prev,
        zoom: clamp(prev.zoom + factor, MIN_ZOOM, MAX_ZOOM),
      });
    });
  };

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 1) {
      dragStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        cropX: crop.offsetX,
        cropY: crop.offsetY,
      };
      pinchStartRef.current = null;
      return;
    }

    if (pointersRef.current.size === 2) {
      const [first, second] = Array.from(pointersRef.current.values());
      pinchStartRef.current = { distance: distance(first, second), zoom: crop.zoom };
      dragStartRef.current = null;
    }
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const stage = stageRef.current;
    if (!stage) return;

    if (pointersRef.current.size === 2 && pinchStartRef.current) {
      const [first, second] = Array.from(pointersRef.current.values());
      const nextDistance = distance(first, second);
      const pinchStart = pinchStartRef.current;
      const ratio = nextDistance / Math.max(1, pinchStart.distance);
      updateCrop((prev) => {
        return clampOffsets({
          ...prev,
          zoom: clamp(pinchStart.zoom * ratio, MIN_ZOOM, MAX_ZOOM),
        });
      });
      return;
    }

    const dragStart = dragStartRef.current;
    if (!dragStart) return;
    const rect = stage.getBoundingClientRect();
    const dxPercent = ((event.clientX - dragStart.x) / rect.width) * 100;
    const dyPercent = ((event.clientY - dragStart.y) / rect.height) * 100;

    updateCrop((prev) =>
      clampOffsets({
        ...prev,
        offsetX: dragStart.cropX + dxPercent,
        offsetY: dragStart.cropY + dyPercent,
      }),
    );
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (event) => {
    pointersRef.current.delete(event.pointerId);

    if (pointersRef.current.size < 2) {
      pinchStartRef.current = null;
    }

    if (pointersRef.current.size === 1) {
      const [remainingPointer] = Array.from(pointersRef.current.values());
      dragStartRef.current = {
        x: remainingPointer.x,
        y: remainingPointer.y,
        cropX: crop.offsetX,
        cropY: crop.offsetY,
      };
      return;
    }

    if (pointersRef.current.size === 0) {
      dragStartRef.current = null;
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        ref={stageRef}
        className={cn(
          "relative mx-auto aspect-square w-full max-w-2xl overflow-hidden rounded-2xl",
          "border border-black/10 bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] shadow-[0_18px_48px_-26px_rgba(24,86,255,0.45)]",
          "touch-none dark:border-white/10 dark:bg-white/5",
        )}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- blob/object URL preview */}
        <img
          src={imageUrl}
          alt={imageAlt}
          className="h-full w-full object-contain select-none"
          draggable={false}
          style={{
            transform: `translate(${crop.offsetX}%, ${crop.offsetY}%) scale(${crop.zoom})`,
          }}
        />

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-black/28" />
          <div
            className="absolute left-1/2 top-1/2 overflow-hidden rounded-xl border border-white/95 shadow-[0_0_0_9999px_rgba(0,0,0,0.36)]"
            style={frameStyle}
          >
            <div className="absolute inset-0 border border-white/70" />
            <div className="absolute inset-x-0 top-1/3 border-t border-white/45" />
            <div className="absolute inset-x-0 top-2/3 border-t border-white/45" />
            <div className="absolute inset-y-0 left-1/3 border-l border-white/45" />
            <div className="absolute inset-y-0 left-2/3 border-l border-white/45" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-black/8 bg-black/2 p-3 dark:border-white/10 dark:bg-white/3">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              updateCrop((prev) => {
                return clampOffsets({
                  ...prev,
                  zoom: clamp(prev.zoom - 0.1, MIN_ZOOM, MAX_ZOOM),
                });
              })
            }
          >
            <ZoomOut className="size-4" />
            Zoom out
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              updateCrop((prev) => {
                return clampOffsets({
                  ...prev,
                  zoom: clamp(prev.zoom + 0.1, MIN_ZOOM, MAX_ZOOM),
                });
              })
            }
          >
            <ZoomIn className="size-4" />
            Zoom in
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              updateCrop((prev) => {
                return clampOffsets({
                  ...prev,
                  zoom: MIN_ZOOM,
                  offsetX: 0,
                  offsetY: 0,
                  frameSize: prev.frameSize,
                });
              })
            }
          >
            <RefreshCw className="size-4" />
            Reset position
          </Button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-[#141414]/70 dark:text-white/70">
            Zoom ({crop.zoom.toFixed(2)}x)
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.05}
              value={crop.zoom}
              onChange={(e) =>
                updateCrop((prev) => {
                  return clampOffsets({
                    ...prev,
                    zoom: clamp(Number(e.target.value), MIN_ZOOM, MAX_ZOOM),
                  });
                })
              }
              className="mt-1 h-2 w-full cursor-pointer accent-[#1856FF]"
            />
          </label>

          <label className="block text-xs font-semibold text-[#141414]/70 dark:text-white/70">
            Crop frame ({crop.frameSize}%)
            <input
              type="range"
              min={minFrameSize}
              max={maxFrameSize}
              step={1}
              value={crop.frameSize}
              onChange={(e) =>
                updateCrop((prev) => {
                  const frameSize = clamp(Number(e.target.value), minFrameSize, maxFrameSize);
                  return clampOffsets({
                    ...prev,
                    frameSize,
                    zoom: clamp(prev.zoom, MIN_ZOOM, MAX_ZOOM),
                  });
                })
              }
              className="mt-1 h-2 w-full cursor-pointer accent-[#1856FF]"
            />
          </label>
        </div>

        <p className="mt-3 text-xs text-[#141414]/60 dark:text-white/60">
          Desktop: hold <kbd className="rounded bg-black/8 px-1 py-0.5 dark:bg-white/10">Ctrl</kbd>{" "}
          + mouse wheel to zoom, drag with left click to move image. Mobile: pinch to zoom and drag to
          reposition.
        </p>
      </div>
    </div>
  );
}
