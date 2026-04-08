"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface PreviewPanelProps {
  previews: string[];
}

export function PreviewPanel({ previews }: PreviewPanelProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">{previews.length} image(s) selected</p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {previews.map((src, idx) => (
          <div
            key={idx}
            className="relative shrink-0 cursor-pointer group"
            onClick={() => setSelectedIndex(idx)}
          >
            <img
              src={src}
              alt={`Preview ${idx + 1}`}
              className="w-20 h-20 object-cover rounded-md border border-slate-200 hover:border-slate-400 transition"
            />
          </div>
        ))}
      </div>
      
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previews[selectedIndex]}
              alt="Full preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {previews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition ${
                    idx === selectedIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}