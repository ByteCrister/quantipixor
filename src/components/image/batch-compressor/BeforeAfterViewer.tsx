"use client";

import Image from "next/image";
import React, { useCallback } from "react";

export default function BeforeAfterViewer({
    beforeUrl,
    afterUrl,
    split,
    zoom,
    origin,
    enableWheelZoom,
    onZoomChange,
    onOriginChange,
    onSplitChange,
  }: {
    beforeUrl: string;
    afterUrl: string | null;
    split: number; // 0-100, percentage of top (original) height
    zoom: number;
    origin: { x: number; y: number };
    enableWheelZoom: boolean;
    onZoomChange: (nextZoom: number) => void;
    onOriginChange: (origin: { x: number; y: number }) => void;
    onSplitChange: (split: number) => void;
  }) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
  
    const handleWheelZoom = useCallback(
      (event: React.WheelEvent<HTMLDivElement>) => {
        if (!enableWheelZoom) return;
        const host = containerRef.current;
        if (!host) return;
        event.preventDefault();
        const rect = host.getBoundingClientRect();
        const cursorX = ((event.clientX - rect.left) / rect.width) * 100;
        const cursorY = ((event.clientY - rect.top) / rect.height) * 100;
        onOriginChange({
          x: Math.max(0, Math.min(100, cursorX)),
          y: Math.max(0, Math.min(100, cursorY)),
        });
        const delta = event.deltaY < 0 ? 0.14 : -0.14;
        const nextZoom = Math.max(1, Math.min(4, Number((zoom + delta).toFixed(2))));
        onZoomChange(nextZoom);
      },
      [enableWheelZoom, onOriginChange, onZoomChange, zoom]
    );
  
    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        let newSplit = ((e.clientY - rect.top) / rect.height) * 100;
        newSplit = Math.min(100, Math.max(0, newSplit));
        onSplitChange(newSplit);
      },
      [isDragging, onSplitChange]
    );
  
    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);
  
    React.useEffect(() => {
      if (isDragging) {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("mouseup", handleMouseUp);
        };
      }
    }, [isDragging, handleMouseMove, handleMouseUp]);
  
    if (!afterUrl) return null;
  
    const topHeight = `${split}%`;
    const bottomHeight = `${100 - split}%`;
  
    return (
      <div
        ref={containerRef}
        onWheel={handleWheelZoom}
        className="relative h-full w-full"
      >
        {/* Original image (top) */}
        <div
          className="absolute top-0 left-0 w-full overflow-hidden"
          style={{ height: topHeight }}
        >
          <Image
            src={beforeUrl}
            alt="Original (before compression)"
            fill
            className="object-contain"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: `${origin.x}% ${origin.y}%`,
            }}
            unoptimized
          />
        </div>
  
        {/* Compressed image (bottom) */}
        <div
          className="absolute bottom-0 left-0 w-full overflow-hidden"
          style={{ height: bottomHeight }}
        >
          <Image
            src={afterUrl}
            alt="Compressed (after)"
            fill
            className="object-contain"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: `${origin.x}% ${origin.y}%`,
            }}
            unoptimized
          />
        </div>
  
        {/* Draggable horizontal divider line */}
        <div
          className="absolute left-0 w-full cursor-row-resize bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.18)]"
          style={{ top: `calc(${split}% - 2px)`, height: "4px" }}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-1 shadow-md">
            <span className="text-xs text-gray-700">⋮</span>
          </div>
        </div>
      </div>
    );
  }