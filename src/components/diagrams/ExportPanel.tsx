"use client";
// ─── src/components/diagrams/ExportPanel.tsx ─────────────────────────────────

import { useState } from "react";
import { Image as LucideImage, FileCode, Loader2, Check } from "lucide-react";
import { COLORS, ALPHA_LAYERS, BORDERS } from "@/styles/design-tokens";
import type { ExportFormat } from "@/types/diagram.types";
import { toast } from "@/store/toastStore";

interface ExportPanelProps {
  svgContent: string;
  diagramTitle: string;
}

const FORMATS: { id: ExportFormat; label: string; desc: string; icon: typeof LucideImage }[] = [
  { id: "svg", label: "SVG", desc: "Vector · lossless", icon: FileCode },
  { id: "png", label: "PNG", desc: "Raster · transparent", icon: LucideImage },
  { id: "jpg", label: "JPG", desc: "Raster · compressed", icon: LucideImage },
  { id: "webp", label: "WebP", desc: "Modern · small size", icon: LucideImage },
];

export function ExportPanel({ svgContent, diagramTitle }: ExportPanelProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [lastExported, setLastExported] = useState<ExportFormat | null>(null);

  const slug = diagramTitle.toLowerCase().replace(/\s+/g, "-");

  async function exportAs(format: ExportFormat) {
    if (!svgContent) {
      toast({ variant: "warning", message: "No diagram to export yet." });
      return;
    }
    setExporting(format);
    try {
      if (format === "svg") {
        const blob = new Blob([svgContent], { type: "image/svg+xml" });
        download(blob, `${slug}.svg`);
        return;
      }

      // ── High‑quality rasterisation ───────────────────────────
      const targetWidthPx = 2400;   // desired output width (adjust as needed)
      const targetHeightPx = 1600;  // will be overridden by aspect ratio if possible

      // Parse the SVG to get its original viewBox dimensions
      const viewBoxMatch = svgContent.match(/viewBox=["']([\d\.\s-]+)["']/);
      let ratio = 1;
      if (viewBoxMatch) {
        const parts = viewBoxMatch[1].trim().split(/\s+/);
        if (parts.length === 4) {
          const w = parseFloat(parts[2]);
          const h = parseFloat(parts[3]);
          if (w > 0 && h > 0) ratio = w / h;
        }
      }
      // Use a large fixed width – adjust to your needs (e.g., 1920 or 2400)
      const finalWidth = targetWidthPx;
      const finalHeight = ratio !== 1
        ? Math.round(finalWidth / ratio)
        : targetHeightPx;   // fallback if no viewBox was found

      // Create a temporary container to render the SVG at exact size
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = `${finalWidth}px`;
      container.style.height = `${finalHeight}px`;
      container.style.background = format === "jpg" ? "#FFFFFF" : "transparent";
      document.body.appendChild(container);

      // Insert the SVG into the container
      container.innerHTML = svgContent;
      const svgElem = container.querySelector("svg");
      if (svgElem) {
        svgElem.setAttribute("width", `${finalWidth}px`);
        svgElem.setAttribute("height", `${finalHeight}px`);
        svgElem.style.width = `${finalWidth}px`;
        svgElem.style.height = `${finalHeight}px`;
      }

      // Wait for layout / any fonts
      await new Promise((resolve) => requestAnimationFrame(resolve));

      // Use html-to-image or dom-to-image? Simpler: use Canvas from the container
      // For modern browsers, you can use svg-as-image trick, but this direct DOM method is cleaner.
      // Actually the easiest is to use a blob URL of the modified SVG, but we can also use html2canvas.
      // However, to avoid external libs, we'll do the data URL trick with the new inline size.

      // Better: serialize the modified SVG (with explicit width/height) and use Image.
      const modifiedSvg = container.innerHTML; // includes the updated attributes
      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(modifiedSvg)}`;
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = dataUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      const ctx = canvas.getContext("2d")!;
      if (format === "jpg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, finalWidth, finalHeight);
      }
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

      // Cleanup
      document.body.removeChild(container);

      const mimeMap: Record<string, string> = {
        png: "image/png",
        jpg: "image/jpeg",
        webp: "image/webp",
      };
      const quality = format === "jpg" ? 0.92 : 0.95;
      const outputDataUrl = canvas.toDataURL(mimeMap[format], quality);
      const blob = await (await fetch(outputDataUrl)).blob();
      download(blob, `${slug}.${format}`);

      setLastExported(format);
      toast({ variant: "success", title: "Exported!", message: `${slug}.${format} downloaded.` });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      toast({ variant: "error", title: "Export failed", message });
    } finally {
      setExporting(null);
      setTimeout(() => setLastExported(null), 2000);
    }
  }

  function download(blob: Blob, filename: string) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="p-4">
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-3"
        style={{ color: COLORS.neutral400 }}
      >
        Export As
      </p>
      <div className="grid grid-cols-2 gap-2">
        {FORMATS.map(({ id, label, desc, icon: Icon }) => {
          const isExporting = exporting === id;
          const isDone = lastExported === id;
          return (
            <button
              key={id}
              onClick={() => exportAs(id)}
              disabled={!!exporting || !svgContent}
              className="flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all duration-200"
              style={{
                background: isDone
                  ? "rgba(7,202,107,0.08)"
                  : ALPHA_LAYERS.surfaceSubtle,
                borderColor: isDone
                  ? BORDERS.success
                  : COLORS.neutral200,
                opacity: !!exporting && !isExporting ? 0.5 : 1,
                cursor: !!exporting ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (exporting) return;
                (e.currentTarget as HTMLElement).style.background = ALPHA_LAYERS.primarySubtle;
                (e.currentTarget as HTMLElement).style.borderColor = BORDERS.blue;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = isDone
                  ? "rgba(7,202,107,0.08)"
                  : ALPHA_LAYERS.surfaceSubtle;
                (e.currentTarget as HTMLElement).style.borderColor = isDone
                  ? BORDERS.success
                  : COLORS.neutral200;
              }}
            >
              <div className="flex items-center gap-2 w-full">
                {isExporting ? (
                  <Loader2 className="size-3.5 animate-spin" style={{ color: COLORS.primary }} />
                ) : isDone ? (
                  <Check className="size-3.5" style={{ color: COLORS.success }} />
                ) : (
                  <Icon className="size-3.5" style={{ color: COLORS.neutral500 }} />
                )}
                <span
                  className="text-sm font-bold"
                  style={{ color: isDone ? COLORS.success : COLORS.text }}
                >
                  .{label}
                </span>
              </div>
              <span className="text-xs" style={{ color: COLORS.neutral400 }}>
                {desc}
              </span>
            </button>
          );
        })}
      </div>

      {!svgContent && (
        <p
          className="mt-3 text-xs text-center"
          style={{ color: COLORS.neutral400 }}
        >
          Render a diagram to enable export
        </p>
      )}
    </div>
  );
}