"use client";

import { useCallback } from "react";
import { Upload } from "lucide-react";

interface UploadZoneProps {
  onFilesAccepted: (files: File[]) => void;
}

export function UploadZone({ onFilesAccepted }: UploadZoneProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length) onFilesAccepted(files);
    },
    [onFilesAccepted]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length) onFilesAccepted(files);
    },
    [onFilesAccepted]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors cursor-pointer bg-slate-50"
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer block">
        <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
        <p className="text-slate-600">Drag & drop images here or click to browse</p>
        <p className="text-sm text-slate-400 mt-1">Supports PNG, JPG, JPEG, BMP, TIFF</p>
      </label>
    </div>
  );
}