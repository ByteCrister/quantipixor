"use client";

import { CropSettings } from "@/types";
import SliderField from "./SliderField";

export default function CropControls({
    crop,
    setCrop,
  }: {
    crop: CropSettings;
    setCrop: React.Dispatch<React.SetStateAction<CropSettings>>;
  }) {
    return (
      <div className="space-y-2 rounded-xl border border-black/8 p-3 dark:border-white/10">
        <p className="text-xs font-semibold text-[#141414]/70 dark:text-white/70">
          Crop controls
        </p>
        <SliderField
          label={`Crop zoom (${crop.zoom.toFixed(2)}x)`}
          value={crop.zoom}
          min={1}
          max={3}
          step={0.05}
          onChange={(value) => setCrop((prev) => ({ ...prev, zoom: value }))}
        />
        <SliderField
          label={`Pan X (${crop.offsetX}%)`}
          value={crop.offsetX}
          min={-50}
          max={50}
          step={1}
          onChange={(value) => setCrop((prev) => ({ ...prev, offsetX: value }))}
        />
        <SliderField
          label={`Pan Y (${crop.offsetY}%)`}
          value={crop.offsetY}
          min={-50}
          max={50}
          step={1}
          onChange={(value) => setCrop((prev) => ({ ...prev, offsetY: value }))}
        />
        <SliderField
          label={`Crop size (${crop.frameSize}%)`}
          value={crop.frameSize}
          min={40}
          max={100}
          step={1}
          onChange={(value) => setCrop((prev) => ({ ...prev, frameSize: value }))}
        />
      </div>
    );
  }