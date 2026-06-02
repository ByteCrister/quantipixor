"use client";

import { useEffect, useRef, useState } from "react";
import {
    Download,
    ChevronDown,
    FileCode,
    Image as ImageIcon,
    Loader2,
    Check,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DropdownPortal } from "./DropdownPortal";
import type { DiagramEngine, ExportFormat } from "@/types/diagram.types";
import { toast } from "@/store/toastStore";

interface ExportMenuProps {
    svgContent: string;
    diagramTitle: string;
    sourceCode: string;
    engine: DiagramEngine;
}

const FORMATS: {
    id: ExportFormat;
    label: string;
    desc: string;
    icon: typeof ImageIcon;
}[] = [
    { id: "svg", label: "SVG", desc: "Vector · lossless", icon: FileCode },
    { id: "png", label: "PNG", desc: "Raster · transparent", icon: ImageIcon },
    { id: "jpg", label: "JPG", desc: "Raster · compressed", icon: ImageIcon },
    { id: "webp", label: "WebP", desc: "Modern · small size", icon: ImageIcon },
];

export function ExportMenu({ svgContent, diagramTitle, sourceCode, engine }: ExportMenuProps) {
    const [open, setOpen] = useState(false);
    const [exporting, setExporting] = useState<ExportFormat | "source" | null>(null);
    const [lastExported, setLastExported] = useState<string | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const slug = diagramTitle.toLowerCase().replace(/\s+/g, "-");
    const sourceExt = engine === "mermaid" ? "mmd" : "puml";

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            const target = e.target as Node;
            if (rootRef.current?.contains(target)) return;
            for (const portal of document.querySelectorAll("[data-diagram-dropdown-portal]")) {
                if (portal.contains(target)) return;
            }
            setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, [open]);

    function download(blob: Blob, filename: string) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    async function exportSource() {
        if (!sourceCode.trim()) {
            toast({ variant: "warning", message: "No source code to export." });
            return;
        }
        setExporting("source");
        try {
            const blob = new Blob([sourceCode], { type: "text/plain" });
            download(blob, `${slug}.${sourceExt}`);
            setLastExported("source");
            toast({
                variant: "success",
                title: "Exported!",
                message: `${slug}.${sourceExt} downloaded.`,
            });
        } catch (e) {
            const message = e instanceof Error ? e.message : "Unknown error";
            toast({ variant: "error", title: "Export failed", message });
        } finally {
            setExporting(null);
            setTimeout(() => setLastExported(null), 2000);
        }
    }

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
                setLastExported(format);
                toast({
                    variant: "success",
                    title: "Exported!",
                    message: `${slug}.svg downloaded.`,
                });
                return;
            }

            const targetWidthPx = 2400;
            const targetHeightPx = 1600;
            const viewBoxMatch = svgContent.match(/viewBox=["']([\d.\s-]+)["']/);
            let ratio = 1;
            if (viewBoxMatch) {
                const parts = viewBoxMatch[1].trim().split(/\s+/);
                if (parts.length === 4) {
                    const w = parseFloat(parts[2]);
                    const h = parseFloat(parts[3]);
                    if (w > 0 && h > 0) ratio = w / h;
                }
            }
            const finalWidth = targetWidthPx;
            const finalHeight = ratio !== 1 ? Math.round(finalWidth / ratio) : targetHeightPx;

            const container = document.createElement("div");
            container.style.position = "fixed";
            container.style.left = "-9999px";
            container.style.top = "0";
            container.style.width = `${finalWidth}px`;
            container.style.height = `${finalHeight}px`;
            container.style.background = format === "jpg" ? "#FFFFFF" : "transparent";
            document.body.appendChild(container);
            container.innerHTML = svgContent;
            const svgElem = container.querySelector("svg");
            if (svgElem) {
                svgElem.setAttribute("width", `${finalWidth}px`);
                svgElem.setAttribute("height", `${finalHeight}px`);
                svgElem.style.width = `${finalWidth}px`;
                svgElem.style.height = `${finalHeight}px`;
            }
            await new Promise((resolve) => requestAnimationFrame(resolve));

            const modifiedSvg = container.innerHTML;
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
            toast({
                variant: "success",
                title: "Exported!",
                message: `${slug}.${format} downloaded.`,
            });
        } catch (e) {
            const message = e instanceof Error ? e.message : "Unknown error";
            toast({ variant: "error", title: "Export failed", message });
        } finally {
            setExporting(null);
            setTimeout(() => setLastExported(null), 2000);
        }
    }

    const disabled = !!exporting;

    return (
        <div ref={rootRef} className="relative shrink-0">
            <Button
                ref={triggerRef}
                type="button"
                variant="outline"
                size="sm"
                className="h-8 shrink-0 gap-1.5 rounded-lg px-3 text-xs"
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label="Export"
                title="Export"
                onClick={() => setOpen((v) => !v)}
            >
                <Download className="size-3.5" aria-hidden />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown
                    className={cn("size-3 transition-transform", open && "rotate-180")}
                    aria-hidden
                />
            </Button>

            <DropdownPortal open={open} anchorRef={triggerRef} width={224} align="end">
                <div
                    role="menu"
                    className={cn(
                        "overflow-hidden rounded-xl border p-2",
                        "border-black/8 bg-[color-mix(in_srgb,var(--surface)_98%,transparent)] shadow-xl backdrop-blur-xl",
                        "dark:border-white/10"
                    )}
                >
                    <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#141414]/45 dark:text-white/40">
                        Image formats
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                        {FORMATS.map(({ id, label, desc, icon: Icon }) => {
                            const isExporting = exporting === id;
                            const isDone = lastExported === id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    role="menuitem"
                                    disabled={disabled || !svgContent}
                                    onClick={() => exportAs(id)}
                                    className={cn(
                                        "flex flex-col items-start gap-0.5 rounded-lg border p-2.5 text-left transition-colors",
                                        "disabled:cursor-not-allowed disabled:opacity-45",
                                        isDone
                                            ? "border-[#07CA6B]/35 bg-[#07CA6B]/8"
                                            : "border-black/6 bg-black/[0.02] hover:border-[#1856FF]/25 hover:bg-[#1856FF]/6 dark:border-white/8 dark:bg-white/[0.03] dark:hover:bg-[#1856FF]/10"
                                    )}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {isExporting ? (
                                            <Loader2 className="size-3.5 animate-spin text-[#1856FF]" />
                                        ) : isDone ? (
                                            <Check className="size-3.5 text-[#07CA6B]" />
                                        ) : (
                                            <Icon className="size-3.5 text-[#141414]/45 dark:text-white/45" />
                                        )}
                                        <span className="text-xs font-bold text-[#141414] dark:text-white">
                                            .{label}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-[#141414]/45 dark:text-white/40">
                                        {desc}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="my-2 h-px bg-black/6 dark:bg-white/8" />

                    <button
                        type="button"
                        role="menuitem"
                        disabled={disabled || !sourceCode.trim()}
                        onClick={exportSource}
                        className={cn(
                            "flex w-full items-center gap-2 rounded-lg border border-black/6 p-2.5 text-left transition-colors",
                            "hover:border-[#1856FF]/25 hover:bg-[#1856FF]/6 disabled:opacity-45",
                            "dark:border-white/8 dark:hover:bg-[#1856FF]/10"
                        )}
                    >
                        {exporting === "source" ? (
                            <Loader2 className="size-3.5 animate-spin text-[#1856FF]" />
                        ) : lastExported === "source" ? (
                            <Check className="size-3.5 text-[#07CA6B]" />
                        ) : (
                            <FileText className="size-3.5 text-[#141414]/45 dark:text-white/45" />
                        )}
                        <div>
                            <p className="text-xs font-bold text-[#141414] dark:text-white">
                                Source (.{sourceExt})
                            </p>
                            <p className="text-[10px] text-[#141414]/45 dark:text-white/40">
                                Download diagram code
                            </p>
                        </div>
                    </button>

                    {!svgContent && (
                        <p className="mt-2 px-1 text-center text-[10px] text-[#141414]/45 dark:text-white/40">
                            Render a diagram to enable image export
                        </p>
                    )}
                </div>
            </DropdownPortal>
        </div>
    );
}
