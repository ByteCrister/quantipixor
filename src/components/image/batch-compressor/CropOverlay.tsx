"use client";

import { CropSettings } from "@/types";

export default function CropOverlay({ crop }: { crop: CropSettings }) {
    const framePercent = crop.frameSize;
    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/20" />
          <div
            className="absolute left-1/2 top-1/2 overflow-hidden rounded-md border border-white/95 shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]"
            style={{
              width: `${framePercent}%`,
              height: `${framePercent}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="absolute inset-0 border border-white/80" />
          </div>
        </div>
      </div>
    );
  }