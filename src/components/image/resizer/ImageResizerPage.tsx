"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import JSZip from "jszip";
import {
    CloudUpload, Download, Trash2, Lock, Unlock, RefreshCw,
    CheckCircle2, AlertCircle, X, ImageIcon, ArrowRight, Layers,
    CheckCheck, AlertTriangle, Info, Package, Settings2,
    FolderArchive, FileImage, ChevronLeft, ChevronRight,
    Zap, Copy, SkipForward, BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_MB = 5;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const COMPRESS_QUALITY = 0.82;
const WORKER_CONCURRENCY = 6;

/** Images smaller than this (px area) are considered "low quality" — skip lossy compression */
const LOW_RES_THRESHOLD = 400 * 400; // 160 000 px²
/** Images smaller than this file size skip lossy compression */
const LOW_SIZE_THRESHOLD = 100 * 1024; // 100 KB

const PAGE_SIZE = 20; // items per pagination page

const UNSUPPORTED_TYPES = new Set(["image/tiff", "image/x-tiff"]);
const ANIMATED_TYPES = new Set(["image/gif", "image/webp"]);

// ─── Style Variables ──────────────────────────────────────────────────────────

const COLORS = {
    brand: "#1856FF",
    brandPurple: "#9333EA",
    error: "#EA2143",
    success: "#10b981",
    warning: "#f59e0b",
    violet: "#8b5cf6",
    muted: "#64748b",
    white: "#ffffff",
};

const GRADIENTS = {
    brand: "linear-gradient(135deg, #1856FF 0%, #7C3AED 100%)",
    brandSubtle: "linear-gradient(135deg, rgba(24,86,255,0.12), rgba(147,51,234,0.08))",
    brandInfo: "linear-gradient(135deg, rgba(24,86,255,0.06), rgba(147,51,234,0.04))",
    brandInfoStrong: "linear-gradient(135deg, rgba(24,86,255,0.18), rgba(147,51,234,0.12))",
    successSubtle: "linear-gradient(135deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02))",
    exportInfo: "linear-gradient(135deg, rgba(24,86,255,0.05), rgba(147,51,234,0.03))",
    radialBlue: "radial-gradient(ellipse 80% 50% at 20% 20%, rgba(24,86,255,0.08) 0%, transparent 60%)",
    radialPurple: "radial-gradient(ellipse 60% 40% at 80% 80%, rgba(147,51,234,0.06) 0%, transparent 60%)",
    glassSurface: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 50%, rgba(255,255,255,0.04) 100%)",
    progressBar: "linear-gradient(90deg, #1856FF, #9333EA)",
};

const SHADOWS = {
    brand: "0 8px 32px rgba(24,86,255,0.35), 0 1px 0 rgba(255,255,255,0.2) inset",
    brandGlow: "0 0 20px rgba(24,86,255,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
    successButton: "0 4px 16px rgba(16,185,129,0.12), inset 0 1px 0 rgba(255,255,255,0.1)",
    blueButton: "0 4px 16px rgba(24,86,255,0.12), inset 0 1px 0 rgba(255,255,255,0.1)",
    progressGlow: "0 0 8px rgba(24,86,255,0.4)",
    progressTrack: "inset 0 1px 3px rgba(0,0,0,0.1)",
    uploadIcon: "0 4px 16px rgba(24,86,255,0.15), inset 0 1px 0 rgba(255,255,255,0.5)",
    fitModeActive: "0 2px 12px rgba(24,86,255,0.18), inset 0 1px 0 rgba(255,255,255,0.12)",
    lockActive: "0 0 20px rgba(24,86,255,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
    doneCountBadge: "rgba(16,185,129,0.08)",
    processingBadge: "rgba(245,158,11,0.08)",
};

const BORDERS = {
    brand: "rgba(24,86,255,0.35)",
    successButton: "rgba(16,185,129,0.3)",
    blueButton: "rgba(24,86,255,0.3)",
};

const INLINE_STYLES = {
    resizeButtonActive: {
        background: GRADIENTS.brand,
        boxShadow: SHADOWS.brand,
        color: COLORS.white,
    },
    resizeButtonDisabled: {
        background: "rgba(148,163,184,0.12)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(148,163,184,0.2)",
        color: "rgba(148,163,184,0.5)",
        cursor: "not-allowed",
    },
    downloadIndividualButton: {
        background: "rgba(16,185,129,0.08)",
        borderColor: BORDERS.successButton,
        color: COLORS.success,
        boxShadow: SHADOWS.successButton,
    },
    downloadZipButton: {
        background: "rgba(24,86,255,0.08)",
        borderColor: BORDERS.blueButton,
        color: COLORS.brand,
        boxShadow: SHADOWS.blueButton,
    },
    progressTrack: {
        background: "rgba(148,163,184,0.15)",
        boxShadow: SHADOWS.progressTrack,
    },
    progressFill: {
        background: GRADIENTS.progressBar,
        boxShadow: SHADOWS.progressGlow,
    },
    uploadIconBox: {
        background: GRADIENTS.brandSubtle,
        backdropFilter: "blur(8px)",
        boxShadow: SHADOWS.uploadIcon,
    },
    glassPanelOverlay: {
        background: GRADIENTS.glassSurface,
    },
    lockButtonActive: {
        background: GRADIENTS.brandInfoStrong,
        borderColor: BORDERS.brand,
        boxShadow: SHADOWS.lockActive,
    },
    fitModeActive: {
        background: GRADIENTS.brandInfoStrong,
        boxShadow: SHADOWS.fitModeActive,
        color: COLORS.brand,
    },
    fitModeInactive: {
        color: "rgba(148,163,184,0.8)",
    },
    presetActive: {
        background: GRADIENTS.brandSubtle,
        backdropFilter: "blur(16px)",
    },
    infoBox: {
        background: GRADIENTS.brandInfo,
        backdropFilter: "blur(8px)",
    },
    exportInfoBox: {
        background: GRADIENTS.exportInfo,
    },
    statsSuccessRow: {
        background: GRADIENTS.successSubtle,
    },
    backgroundOverlay: {
        background: [GRADIENTS.radialBlue, GRADIENTS.radialPurple].join(", "),
        zIndex: 0,
    },
    pageBg: {
        zIndex: -1,
    },
};

// ─── Types ────────────────────────────────────────────────────────────────────
type FitMode = "pad" | "crop";

type ImageStatus = "idle" | "processing" | "done" | "error" | "skipped";

interface ImageItem {
    id: string;
    file: File;
    hash: string;
    previewUrl: string;
    originalW: number;
    originalH: number;
    originalSize: number;
    status: ImageStatus;
    resultBlob: Blob | null;
    resultSize: number | null;
    targetW: number | null;
    targetH: number | null;
    /** Actual output dimensions — may differ from targetW/H when original is passthrough-preserved */
    actualW: number | null;
    actualH: number | null;
    skippedCompression: boolean;
    skipReason?: string;
}

interface RatioRef { rw: number; rh: number; }
interface Preset { label: string; sub: string; w: number; h: number; }

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info" | "warning";
interface Toast { id: string; type: ToastType; message: string; }

function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const add = useCallback((type: ToastType, message: string) => {
        const id = crypto.randomUUID();
        setToasts((p) => [...p, { id, type, message }]);
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
    }, []);
    const remove = useCallback((id: string) => setToasts((p) => p.filter((t) => t.id !== id)), []);
    return { toasts, addToast: add, removeToast: remove };
}

const toastStyles: Record<ToastType, { icon: React.ReactNode; bg: string; border: string; text: string; iconColor: string; glow: string }> = {
    success: { icon: <CheckCheck size={14} />, bg: "bg-emerald-950/80", border: "border-emerald-500/30", text: "text-emerald-100", iconColor: "text-emerald-400", glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]" },
    error: { icon: <AlertTriangle size={14} />, bg: "bg-red-950/80", border: "border-red-500/30", text: "text-red-100", iconColor: "text-red-400", glow: "shadow-[0_0_20px_rgba(239,68,68,0.15)]" },
    info: { icon: <Info size={14} />, bg: "bg-[#0a0e1a]/80", border: "border-[#1856FF]/30", text: "text-slate-100", iconColor: "text-[#1856FF]", glow: "shadow-[0_0_20px_rgba(24,86,255,0.15)]" },
    warning: { icon: <AlertTriangle size={14} />, bg: "bg-amber-950/80", border: "border-amber-500/30", text: "text-amber-100", iconColor: "text-amber-400", glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]" },
};

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
    return (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((t) => {
                    const s = toastStyles[t.type];
                    return (
                        <motion.div key={t.id} layout initial={{ opacity: 0, y: 24, scale: 0.88 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 48, scale: 0.88 }} transition={{ type: "spring", stiffness: 420, damping: 32 }} className={cn("pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl cursor-pointer max-w-[320px]", s.bg, s.border, s.text, s.glow)} onClick={() => onRemove(t.id)}>
                            <span className={cn("shrink-0", s.iconColor)}>{s.icon}</span>
                            <span className="font-(family-name:--font-inter) text-[13px] font-medium leading-snug">{t.message}</span>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

// ─── Brand Icon ───────────────────────────────────────────────────────────────

function QuantipixorIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className={className}>
            <path d="M12 2.5C6.753 2.5 2.5 6.753 2.5 12C2.5 17.247 6.753 21.5 12 21.5C16.184 21.5 19.747 18.827 20.914 15.05" stroke="url(#qG1)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M19 18.5L22 21.5" stroke="url(#qG1)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="9.2" cy="9.2" r="1.3" fill="url(#qG1)" />
            <defs>
                <linearGradient id="qG1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={COLORS.brand} />
                    <stop offset="100%" stopColor={COLORS.brandPurple} />
                </linearGradient>
            </defs>
        </svg>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes < 0) return "—";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"] as const;
    const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
    const n = bytes / Math.pow(k, i);
    return `${n >= 10 || i === 0 ? n.toFixed(0) : n.toFixed(1)} ${sizes[i]}`;
}

function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b); }
function computeRatio(w: number, h: number): RatioRef { const d = gcd(w, h); return { rw: w / d, rh: h / d }; }
function validateDimension(v: string): boolean { const n = parseInt(v, 10); return !isNaN(n) && n >= 1 && n <= 8000; }

function loadImageElement(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
    });
}

/**
 * Compute a fast SHA-256 hex digest from a File for duplicate detection.
 * We sample the first 256 KB + last 64 KB + file metadata instead of
 * reading the whole file, for speed with large files.
 */
async function fastFileHash(file: File): Promise<string> {
    const HEAD = 256 * 1024;
    const TAIL = 64 * 1024;
    const parts: ArrayBuffer[] = [];
    parts.push(await file.slice(0, Math.min(HEAD, file.size)).arrayBuffer());
    if (file.size > HEAD + TAIL) {
        parts.push(await file.slice(file.size - TAIL).arrayBuffer());
    }
    // Encode metadata as bytes so same-content files with different names are still equal
    const meta = new TextEncoder().encode(`${file.size}::${file.type}`);
    const combined = new Uint8Array(parts.reduce((acc, b) => acc + b.byteLength, 0) + meta.length);
    let offset = 0;
    for (const p of parts) { combined.set(new Uint8Array(p), offset); offset += p.byteLength; }
    combined.set(meta, offset);
    const digest = await crypto.subtle.digest("SHA-256", combined);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hasAlpha(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
    // Sample top-left, centre, and bottom-right to catch transparency anywhere in the image
    const regions: [number, number][] = [
        [0, 0],
        [Math.max(0, Math.floor(w / 2) - 64), Math.max(0, Math.floor(h / 2) - 64)],
        [Math.max(0, w - 128), Math.max(0, h - 128)],
    ];
    for (const [x, y] of regions) {
        const sw = Math.min(128, w - x);
        const sh = Math.min(128, h - y);
        if (sw <= 0 || sh <= 0) continue;
        try {
            const { data } = ctx.getImageData(x, y, sw, sh);
            for (let i = 3; i < data.length; i += 4) {
                if (data[i]! < 255) return true;
            }
        } catch { return false; }
    }
    return false;
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error(`toBlob null for ${mime}`)), mime, quality);
    });
}

/**
 * In pad mode: skip if dimensions already match exactly (no resize needed).
 * In crop mode: never skip — even a same-size image may need centre-cropping
 * if it was letterboxed or has a different content region.
 */
function isAlreadyTargetSize(item: ImageItem, targetW: number, targetH: number, fitMode: FitMode): boolean {
    if (fitMode === "crop") return false;
    return item.originalW === targetW && item.originalH === targetH;
}
/**
 * Returns true if this is a low-quality / tiny image that should not be
 * put through lossy compression (would degrade with zero benefit).
 */
function isLowQualityImage(file: File, w: number, h: number): boolean {
    const area = w * h;
    return area < LOW_RES_THRESHOLD || file.size < LOW_SIZE_THRESHOLD;
}

async function stepDownscale(
    img: HTMLImageElement | HTMLCanvasElement,
    srcW: number, srcH: number,
    targetW: number, targetH: number,
): Promise<HTMLCanvasElement> {
    let curW = srcW, curH = srcH;
    let canvas = document.createElement("canvas");
    canvas.width = curW; canvas.height = curH;
    const initCtx = canvas.getContext("2d")!;
    initCtx.imageSmoothingEnabled = true;
    initCtx.imageSmoothingQuality = "high";
    initCtx.drawImage(img, 0, 0, curW, curH);

    // Halve dimensions each step until we reach target
    while (curW * 0.5 > targetW || curH * 0.5 > targetH) {
        const nextW = Math.max(Math.floor(curW * 0.5), targetW);
        const nextH = Math.max(Math.floor(curH * 0.5), targetH);
        const next = document.createElement("canvas");
        next.width = nextW; next.height = nextH;
        const ctx = next.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(canvas, 0, 0, nextW, nextH);
        canvas = next; curW = nextW; curH = nextH;
    }
    return canvas;
}

async function stepUpscale(
    img: HTMLImageElement | HTMLCanvasElement,
    srcW: number, srcH: number,
    targetW: number, targetH: number,
): Promise<HTMLCanvasElement> {
    let curW = srcW, curH = srcH;
    let canvas = document.createElement("canvas");
    canvas.width = curW; canvas.height = curH;
    const initCtx = canvas.getContext("2d")!;
    initCtx.imageSmoothingEnabled = true;          // was missing on initial draw
    initCtx.imageSmoothingQuality = "high";        // was missing on initial draw
    initCtx.drawImage(img, 0, 0);

    while (curW < targetW * 0.99 || curH < targetH * 0.99) {
        const nextW = Math.min(Math.ceil(curW * 1.5), targetW);
        const nextH = Math.min(Math.ceil(curH * 1.5), targetH);
        const next = document.createElement("canvas");
        next.width = nextW; next.height = nextH;
        const ctx = next.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(canvas, 0, 0, nextW, nextH);
        canvas = next; curW = nextW; curH = nextH;
    }
    return canvas;
}

async function resizeAndCompress(
    file: File,
    targetW: number,
    targetH: number,
    srcW: number,
    srcH: number,
    fitMode: FitMode = "pad",
): Promise<{ blob: Blob; skippedCompression: boolean; actualW: number; actualH: number }> {

    // ── Geometry first — we need scale to determine isUpscale correctly ────────
    let drawW: number, drawH: number, offsetX: number, offsetY: number;
    let srcX = 0, srcY = 0, srcCropW = srcW, srcCropH = srcH;
    let scaleForDirection: number;

    if (fitMode === "crop") {
        // Cover: scale so the shorter side fills the target, then centre-crop
        scaleForDirection = Math.max(targetW / srcW, targetH / srcH);
        srcCropW = Math.round(targetW / scaleForDirection);
        srcCropH = Math.round(targetH / scaleForDirection);
        // Clamp crop region to image bounds (safety for floating point rounding)
        srcCropW = Math.min(srcCropW, srcW);
        srcCropH = Math.min(srcCropH, srcH);
        srcX = Math.round((srcW - srcCropW) / 2);
        srcY = Math.round((srcH - srcCropH) / 2);
        drawW = targetW;
        drawH = targetH;
        offsetX = 0;
        offsetY = 0;
    } else {
        // Letterbox: scale so the longer side fits, centre with black bars
        scaleForDirection = Math.min(targetW / srcW, targetH / srcH);
        drawW = Math.round(srcW * scaleForDirection);
        drawH = Math.round(srcH * scaleForDirection);
        offsetX = Math.round((targetW - drawW) / 2);
        offsetY = Math.round((targetH - drawH) / 2);
    }

    // ── isUpscale based on actual scale factor, not area comparison ───────────
    // Area comparison was wrong for non-square aspect ratios in crop mode.
    const isUpscale = scaleForDirection > 1;
    const isTiny = isLowQualityImage(file, srcW, srcH);

    // ── Passthrough: tiny image being upscaled — return original untouched ────
    // Drawing on canvas would only blur it. Report actual dimensions as original.
    if (isTiny && isUpscale) {
        const originalBlob = new Blob([await file.arrayBuffer()], { type: file.type });
        return { blob: originalBlob, skippedCompression: true, actualW: srcW, actualH: srcH };
    }

    const url = URL.createObjectURL(file);
    try {
        const img = await loadImageElement(url);

        // ── Step scaling strategy ─────────────────────────────────────────────
        // For crop mode: step-downscale based on crop region size vs target,
        // not full image size vs target (the old code used srcW/srcH which was wrong).
        const downscaleRatio = fitMode === "crop"
            ? Math.max(srcCropW / targetW, srcCropH / targetH)
            : Math.max(srcW / targetW, srcH / targetH);
        const upscaleRatio = fitMode === "crop"
            ? Math.max(targetW / srcCropW, targetH / srcCropH)
            : Math.max(targetW / srcW, targetH / srcH);

        const needsStepDown = !isUpscale && downscaleRatio > 2;
        const needsStepUp = isUpscale && upscaleRatio > 1.5;

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        if (fitMode === "pad") {
            // ── PAD mode ──────────────────────────────────────────────────────
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, targetW, targetH);

            let source: HTMLCanvasElement | HTMLImageElement = img;
            if (needsStepDown) {
                source = await stepDownscale(img, srcW, srcH, drawW, drawH);
            } else if (needsStepUp) {
                source = await stepUpscale(img, srcW, srcH, drawW, drawH);
            }
            ctx.drawImage(source, offsetX, offsetY, drawW, drawH);

        } else {
            // ── CROP mode ─────────────────────────────────────────────────────
            // Step-downscale the full image first (to a canvas near target size),
            // then crop from that intermediate canvas — not from the raw img.
            // This is the fix for the bug where crop mode bypassed step-downscale.
            if (needsStepDown) {
                // Step down to an intermediate size: target * 2 is enough headroom
                // to then do a final accurate crop from.
                const interW = Math.min(srcW, targetW * 2);
                const interH = Math.min(srcH, targetH * 2);
                const intermediate = await stepDownscale(img, srcW, srcH, interW, interH);

                // Recalculate crop coords in the intermediate canvas's coordinate space
                const stepScaleX = intermediate.width / srcW;
                const stepScaleY = intermediate.height / srcH;
                const iSrcX = Math.round(srcX * stepScaleX);
                const iSrcY = Math.round(srcY * stepScaleY);
                const iCropW = Math.round(srcCropW * stepScaleX);
                const iCropH = Math.round(srcCropH * stepScaleY);

                // Clamp to intermediate canvas bounds
                const clampedX = Math.max(0, Math.min(iSrcX, intermediate.width - 1));
                const clampedY = Math.max(0, Math.min(iSrcY, intermediate.height - 1));
                const clampedW = Math.min(iCropW, intermediate.width - clampedX);
                const clampedH = Math.min(iCropH, intermediate.height - clampedY);

                ctx.drawImage(intermediate, clampedX, clampedY, clampedW, clampedH, 0, 0, targetW, targetH);
            } else {
                // No step scaling needed — draw crop directly from original image.
                // Clamp source rect to image bounds.
                const clampedX = Math.max(0, Math.min(srcX, srcW - 1));
                const clampedY = Math.max(0, Math.min(srcY, srcH - 1));
                const clampedW = Math.min(srcCropW, srcW - clampedX);
                const clampedH = Math.min(srcCropH, srcH - clampedY);

                if (needsStepUp) {
                    // Upscaling crop: crop first to a small canvas, then step-upscale
                    const cropCanvas = document.createElement("canvas");
                    cropCanvas.width = clampedW;
                    cropCanvas.height = clampedH;
                    const cropCtx = cropCanvas.getContext("2d")!;
                    cropCtx.imageSmoothingEnabled = true;
                    cropCtx.imageSmoothingQuality = "high";
                    cropCtx.drawImage(img, clampedX, clampedY, clampedW, clampedH, 0, 0, clampedW, clampedH);
                    const upscaled = await stepUpscale(cropCanvas as unknown as HTMLImageElement, clampedW, clampedH, targetW, targetH);
                    ctx.drawImage(upscaled, 0, 0, targetW, targetH);
                } else {
                    ctx.drawImage(img, clampedX, clampedY, clampedW, clampedH, 0, 0, targetW, targetH);
                }
            }
        }

        // ── Format selection ───────────────────────────────────────────────────
        const isLargeDownscale = !isUpscale && downscaleRatio > 2;
        const skipLossy = isTiny && !isLargeDownscale;

        if (skipLossy) {
            const pngBlob = await canvasToBlob(canvas, "image/png");
            if (pngBlob.size <= MAX_FILE_BYTES) {
                return { blob: pngBlob, skippedCompression: true, actualW: targetW, actualH: targetH };
            }
        }

        // ── Compress ───────────────────────────────────────────────────────────
        // hasAlpha now samples 3 regions — catches edge/corner transparency correctly
        const transparent = hasAlpha(ctx, targetW, targetH);
        if (transparent) {
            const [webp, png] = await Promise.all([
                canvasToBlob(canvas, "image/webp", COMPRESS_QUALITY),
                canvasToBlob(canvas, "image/png"),
            ]);
            const best = webp.size < png.size ? webp : png;
            return { blob: best, skippedCompression: false, actualW: targetW, actualH: targetH };
        }

        // Opaque path: try WebP + JPEG, pick smaller
        const flatCanvas = document.createElement("canvas");
        flatCanvas.width = targetW;
        flatCanvas.height = targetH;
        const flatCtx = flatCanvas.getContext("2d")!;
        flatCtx.fillStyle = "#ffffff";
        flatCtx.fillRect(0, 0, targetW, targetH);
        flatCtx.drawImage(canvas, 0, 0);

        const quality = isLargeDownscale ? 0.92 : COMPRESS_QUALITY;
        const [webp, jpeg] = await Promise.all([
            canvasToBlob(canvas, "image/webp", quality),
            canvasToBlob(flatCanvas, "image/jpeg", quality),
        ]);
        const fits = [webp, jpeg].filter((b) => b.size <= MAX_FILE_BYTES);
        if (fits.length > 0) return { blob: fits.reduce((a, b) => a.size < b.size ? a : b), skippedCompression: false, actualW: targetW, actualH: targetH };

        for (let q = 0.65; q >= 0.30; q -= 0.10) {
            const [w2, j2] = await Promise.all([
                canvasToBlob(canvas, "image/webp", q),
                canvasToBlob(flatCanvas, "image/jpeg", q),
            ]);
            const fitsNow = [w2, j2].filter((b) => b.size <= MAX_FILE_BYTES);
            if (fitsNow.length > 0) return { blob: fitsNow.reduce((a, b) => a.size < b.size ? a : b), skippedCompression: false, actualW: targetW, actualH: targetH };
        }
        return { blob: [webp, jpeg].reduce((a, b) => a.size < b.size ? a : b), skippedCompression: false, actualW: targetW, actualH: targetH };
    } finally {
        URL.revokeObjectURL(url);
    }
}

async function pLimit<T>(
    tasks: Array<() => Promise<T>>,
    concurrency: number,
    onSettled?: (index: number, result: T | Error) => void
): Promise<(T | Error)[]> {
    const results: (T | Error)[] = new Array(tasks.length);
    let next = 0;
    async function worker() {
        while (next < tasks.length) {
            const idx = next++;
            try {
                results[idx] = await tasks[idx]!();
                onSettled?.(idx, results[idx] as T);
            } catch (e) {
                results[idx] = e instanceof Error ? e : new Error(String(e));
                onSettled?.(idx, results[idx] as Error);
            }
        }
    }
    await Promise.all(Array.from({ length: concurrency }, () => worker()));
    return results;
}

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getOutputExtension(mime: string): string {
    if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
    if (mime.includes("webp")) return "webp";
    if (mime.includes("png")) return "png";
    return "png"; // safe fallback — canvas output is always decodable as PNG
}

// ─── Presets ──────────────────────────────────────────────────────────────────

const PRESETS: Preset[] = [
    { label: "HD", sub: "1280×720", w: 1280, h: 720 },
    { label: "Full HD", sub: "1920×1080", w: 1920, h: 1080 },
    { label: "4K", sub: "3840×2160", w: 3840, h: 2160 },
    { label: "Square", sub: "1080×1080", w: 1080, h: 1080 },
    { label: "Story", sub: "1080×1920", w: 1080, h: 1920 },
    { label: "Twitter", sub: "1200×675", w: 1200, h: 675 },
    { label: "OG", sub: "1200×630", w: 1200, h: 630 },
];

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
    const spring = useSpring(value, { stiffness: 300, damping: 30 });
    const display = useTransform(spring, (v) => Math.round(v).toString());
    useEffect(() => { spring.set(value); }, [value, spring]);
    return <motion.span>{display}</motion.span>;
}

// ─── Glass Panel ──────────────────────────────────────────────────────────────

function GlassPanel({ children, className, luminous }: { children: React.ReactNode; className?: string; luminous?: boolean }) {
    return (
        <div className={cn("relative rounded-3xl border backdrop-blur-xl overflow-hidden", "bg-white/60 border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]", "dark:bg-white/4 dark:border-white/8 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]", luminous && "dark:shadow-[0_8px_40px_rgba(24,86,255,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]", className)}>
            <div className="pointer-events-none absolute inset-0 rounded-3xl" style={INLINE_STYLES.glassPanelOverlay} />
            {children}
        </div>
    );
}

// ─── DropZone ─────────────────────────────────────────────────────────────────

function DropZone({ onFiles, disabled }: { onFiles: (files: File[]) => void; disabled: boolean }) {
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (disabled) return;
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
        if (files.length) onFiles(files);
    }, [disabled, onFiles]);

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
                "relative rounded-3xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center p-10 backdrop-blur-xl",
                dragging
                    ? "border-[#1856FF]/60 dark:border-[#1856FF]/40 bg-[#1856FF]/5 dark:bg-[#1856FF]/8 shadow-[0_0_40px_rgba(24,86,255,0.15)]"
                    : "border-slate-300/60 dark:border-white/10 bg-white/40 dark:bg-white/2 shadow-[0_4px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-[#1856FF]/30 hover:bg-white/50 dark:hover:bg-white/4",
                disabled && "opacity-60 cursor-not-allowed"
            )}
            onClick={() => !disabled && inputRef.current?.click()}
        >
            {/* Reset value after each selection so same file can be re-added after removal */}
            <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    if (files.length) onFiles(files);
                    // Reset so the same file can be selected again (important for re-adds)
                    e.target.value = "";
                }}
                disabled={disabled}
            />
            <motion.div animate={{ scale: dragging ? 1.08 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <div className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/60 dark:border-white/10" style={INLINE_STYLES.uploadIconBox}>
                    <motion.div animate={{ y: dragging ? -3 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                        <CloudUpload size={28} className="text-[#1856FF]" />
                    </motion.div>
                </div>
                <p className="font-(family-name:--font-plus-jakarta) text-[14px] sm:text-[15px] font-bold text-slate-700 dark:text-slate-200">
                    Drop images here or <span className="text-[#1856FF]">browse</span>
                </p>
                <p className="mt-2 font-(family-name:--font-inter) text-[12px] text-slate-400 dark:text-slate-500">
                    Up to <strong>1 500 images</strong> · JPEG, PNG, WebP, GIF, BMP, AVIF, SVG
                </p>
            </motion.div>
        </div>
    );
}

// ─── DimensionInput ───────────────────────────────────────────────────────────

function DimensionInput({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error: boolean }) {
    return (
        <div className="flex-1 min-w-0">
            <label className="block font-(family-name:--font-space-grotesk) text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2">{label}</label>
            <input
                type="number" min={1} max={8000}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn("w-full h-12 px-4 rounded-2xl border font-(family-name:--font-jetbrains-mono) text-[14px] font-semibold text-slate-800 dark:text-slate-100 bg-white/60 dark:bg-white/4 backdrop-blur-xl transition-all duration-150 outline-none focus:ring-0 appearance-none", error ? "border-[#EA2143]/40 focus:border-[#EA2143]/60 shadow-[0_0_16px_rgba(234,33,67,0.08)]" : "border-slate-200/60 dark:border-white/8 focus:border-[#1856FF]/40 focus:shadow-[0_0_16px_rgba(24,86,255,0.1)]")}
            />
        </div>
    );
}

// ─── PresetCard ───────────────────────────────────────────────────────────────

function PresetCard({ label, sub, w, h, onClick, active }: { label: string; sub: string; w: number; h: number; onClick: (w: number, h: number) => void; active: boolean }) {
    return (
        <motion.button onClick={() => onClick(w, h)} whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className={cn("px-2 py-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 cursor-pointer w-full transition-all duration-200", active ? "border-[#1856FF]/40 dark:border-[#1856FF]/30 shadow-[0_0_20px_rgba(24,86,255,0.15),inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[0_0_20px_rgba(24,86,255,0.2),inset_0_1px_0_rgba(255,255,255,0.06)]" : "border-slate-200/60 dark:border-white/[0.07] bg-white/50 dark:bg-white/3 backdrop-blur-md hover:border-[#1856FF]/30 dark:hover:border-[#1856FF]/20 hover:bg-white/70 dark:hover:bg-white/6")} style={active ? INLINE_STYLES.presetActive : {}}>
            <span className={cn("font-(family-name:--font-plus-jakarta) text-[10px] sm:text-[11px] font-bold block leading-tight", active ? "bg-linear-to-r from-[#1856FF] to-[#9333EA] bg-clip-text text-transparent" : "text-slate-700 dark:text-slate-200")}>{label}</span>
            <span className="font-(family-name:--font-jetbrains-mono) text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500 font-medium block">{sub}</span>
        </motion.button>
    );
}

// ─── Stats Dashboard ──────────────────────────────────────────────────────────

interface StatsProps {
    total: number;
    done: number;
    duplicates: number;
    skippedDims: number;
    skippedLowQ: number;
    errors: number;
    originalBytes: number;
    resultBytes: number;
}

function StatsDashboard({ stats }: { stats: StatsProps }) {
    const saved = stats.originalBytes - stats.resultBytes;
    const pct = stats.originalBytes > 0 ? Math.round((saved / stats.originalBytes) * 100) : 0;
    const tiles = [
        { icon: <ImageIcon size={13} />, label: "Total", value: stats.total, color: COLORS.brand },
        { icon: <CheckCircle2 size={13} />, label: "Processed", value: stats.done, color: COLORS.success },
        { icon: <Copy size={13} />, label: "Duplicates", value: stats.duplicates, color: COLORS.warning },
        { icon: <SkipForward size={13} />, label: "Skipped", value: stats.skippedDims + stats.skippedLowQ, color: COLORS.violet },
        { icon: <AlertTriangle size={13} />, label: "Failed", value: stats.errors, color: COLORS.error },
    ];

    return (
        <GlassPanel className="p-4 sm:p-5">
            <div className="flex items-center gap-2 font-(family-name:--font-space-grotesk) text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-3">
                <BarChart2 size={13} />
                Session Stats
            </div>
            <div className="grid grid-cols-5 gap-2 mb-3">
                {tiles.map((t) => (
                    <div key={t.label} className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-2xl border border-slate-200/50 dark:border-white/6 bg-white/40 dark:bg-white/2">
                        <span style={{ color: t.color }}>{t.icon}</span>
                        <span className="font-(family-name:--font-jetbrains-mono) text-[15px] font-bold text-slate-800 dark:text-slate-100">{t.value}</span>
                        <span className="font-(family-name:--font-inter) text-[9px] text-slate-400 dark:text-slate-500 text-center leading-tight">{t.label}</span>
                    </div>
                ))}
            </div>
            {stats.done > 0 && (
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl border border-emerald-300/30 dark:border-emerald-500/20" style={INLINE_STYLES.statsSuccessRow}>
                    <CheckCheck size={12} className="text-emerald-500 shrink-0" />
                    <span className="font-(family-name:--font-inter) text-[11px] text-emerald-700 dark:text-emerald-400">
                        <strong>{formatBytes(stats.originalBytes)}</strong> → <strong>{formatBytes(stats.resultBytes)}</strong>
                        {saved > 0 && <> · saved <strong>{formatBytes(saved)}</strong> ({pct}%)</>}
                    </span>
                </div>
            )}
        </GlassPanel>
    );
}

// ─── Image Card ───────────────────────────────────────────────────────────────

const statusConfig: Record<ImageStatus, { label: string; badgeCls: string; borderClass: string; glowClass: string }> = {
    idle: { label: "Ready", badgeCls: "text-slate-400 dark:text-slate-500 border-slate-200/60 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.04]", borderClass: "border-slate-200/60 dark:border-white/[0.07]", glowClass: "" },
    processing: { label: "Processing…", badgeCls: "text-amber-500 border-amber-400/30 bg-amber-50/80 dark:bg-amber-900/20", borderClass: "border-amber-300/40 dark:border-amber-500/20", glowClass: "shadow-[0_0_20px_rgba(245,158,11,0.08)]" },
    done: { label: "Done", badgeCls: "text-emerald-600 dark:text-emerald-400 border-emerald-400/30 bg-emerald-50/80 dark:bg-emerald-900/20", borderClass: "border-emerald-300/50 dark:border-emerald-500/20", glowClass: "shadow-[0_0_20px_rgba(16,185,129,0.08)]" },
    error: { label: "Failed", badgeCls: "text-[#EA2143] border-red-400/30 bg-red-50/80 dark:bg-red-900/10", borderClass: "border-red-300/40 dark:border-red-500/20", glowClass: "shadow-[0_0_20px_rgba(234,33,67,0.08)]" },
    skipped: { label: "Skipped", badgeCls: "text-violet-500 border-violet-400/30 bg-violet-50/80 dark:bg-violet-900/20", borderClass: "border-violet-300/40 dark:border-violet-500/20", glowClass: "" },
};

function ImageCard({ item, onRemove, onDownload }: {
    item: ImageItem;
    onRemove: (id: string) => void;
    onDownload: (item: ImageItem) => void;
}) {
    const s = statusConfig[item.status];
    const savings = item.resultSize && item.originalSize > item.resultSize
        ? Math.round(((item.originalSize - item.resultSize) / item.originalSize) * 100)
        : null;

    return (
        <motion.div layout initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className={cn("flex items-center gap-3 px-3.5 py-3 rounded-2xl border backdrop-blur-xl transition-all duration-200 bg-white/60 dark:bg-white/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]", s.borderClass, s.glowClass)}>
            {/* Thumbnail */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden shrink-0 bg-black relative flex items-center justify-center border border-white/20">
                {item.previewUrl ? <img src={item.previewUrl} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-slate-500" />}
                <AnimatePresence>
                    {item.status === "processing" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                            <RefreshCw size={14} className="text-white animate-spin" />
                        </motion.div>
                    )}
                    {item.status === "done" && (
                        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 25 }} className="absolute inset-0 bg-emerald-500/75 backdrop-blur-sm flex items-center justify-center text-white">
                            <CheckCircle2 size={14} />
                        </motion.div>
                    )}
                    {item.status === "skipped" && (
                        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-violet-500/70 backdrop-blur-sm flex items-center justify-center text-white">
                            <SkipForward size={14} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="font-(family-name:--font-plus-jakarta) text-[12px] sm:text-[13px] font-semibold text-slate-800 dark:text-slate-100 truncate mb-0.5">{item.file.name}</p>
                <p className="font-(family-name:--font-jetbrains-mono) text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
                    {item.originalW}×{item.originalH}
                    {item.status === "done" && item.actualW != null && (
                        item.actualW === item.originalW && item.actualH === item.originalH
                            ? <span className="ml-1 text-amber-500"> (original preserved)</span>
                            : <><span className="text-[#1856FF] mx-1">→</span>{item.actualW}×{item.actualH}</>
                    )}
                    {item.status === "skipped" && item.targetW != null && (
                        <><span className="text-[#1856FF] mx-1">→</span>{item.targetW}×{item.targetH}</>
                    )}
                    <span className="mx-1.5 text-slate-300 dark:text-white/10">·</span>
                    {formatBytes(item.originalSize)}
                    {item.resultSize != null && item.status === "done" && (
                        <><span className="mx-1">→</span><span className={item.resultSize > item.originalSize ? "text-amber-500" : "text-emerald-500"}>{formatBytes(item.resultSize)}</span></>
                    )}
                    {savings != null && savings > 0 && <span className="ml-1 text-emerald-500">−{savings}%</span>}
                    {item.skippedCompression && item.status === "done" && <span className="ml-1.5 text-slate-300 dark:text-white/20">(lossless)</span>}
                    {item.skipReason && <span className="ml-1.5 text-violet-400 dark:text-violet-400"> · {item.skipReason}</span>}
                </p>
            </div>

            {/* Badge */}
            <span className={cn("hidden sm:inline-flex font-(family-name:--font-space-grotesk) text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide border shrink-0", s.badgeCls)}>{s.label}</span>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
                <AnimatePresence>
                    {item.status === "done" && item.resultBlob && (
                        <motion.button initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ type: "spring", stiffness: 500, damping: 25 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onDownload(item)} className="w-8 h-8 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-300/50 dark:border-emerald-500/20 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/20 transition-all duration-150 cursor-pointer" title="Download">
                            <Download size={13} />
                        </motion.button>
                    )}
                </AnimatePresence>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={cn("w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-150 cursor-pointer", "text-slate-400 dark:text-slate-500 border-slate-200/60 dark:border-white/8 bg-white/50 dark:bg-white/3", "hover:text-[#EA2143] hover:border-red-300/50 dark:hover:border-red-500/20 hover:bg-red-50/80 dark:hover:bg-red-900/10")} onClick={() => onRemove(item.id)} title="Remove">
                    <X size={13} />
                </motion.button>
            </div>
        </motion.div>
    );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ done, total }: { done: number; total: number }) {
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={INLINE_STYLES.progressTrack}>
                <motion.div className="h-full rounded-full" initial={{ width: "0%" }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4, ease: "easeOut" }} style={INLINE_STYLES.progressFill} />
            </div>
            <span className="font-(family-name:--font-jetbrains-mono) text-[11px] font-semibold text-[#1856FF] dark:text-blue-400 min-w-8.5 text-right">{pct}%</span>
        </div>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
    if (totalPages <= 1) return null;
    const pages: (number | "…")[] = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
        else if (pages[pages.length - 1] !== "…") pages.push("…");
    }
    return (
        <div className="flex items-center justify-center gap-1 pt-2">
            <button onClick={() => onChange(page - 1)} disabled={page === 1} className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-200/60 dark:border-white/8 text-slate-400 dark:text-slate-500 disabled:opacity-30 hover:border-[#1856FF]/30 hover:text-[#1856FF] transition-all cursor-pointer disabled:cursor-not-allowed">
                <ChevronLeft size={14} />
            </button>
            {pages.map((p, i) =>
                p === "…"
                    ? <span key={`ellipsis-${i}`} className="font-(family-name:--font-jetbrains-mono) text-[11px] text-slate-400 px-1">…</span>
                    : <button key={p} onClick={() => onChange(p as number)} className={cn("w-8 h-8 rounded-xl flex items-center justify-center border font-(family-name:--font-jetbrains-mono) text-[11px] font-bold transition-all cursor-pointer", page === p ? "border-[#1856FF]/40 text-[#1856FF] bg-[#1856FF]/10" : "border-slate-200/60 dark:border-white/8 text-slate-400 dark:text-slate-500 hover:border-[#1856FF]/30 hover:text-[#1856FF]")}>{p}</button>
            )}
            <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-200/60 dark:border-white/8 text-slate-400 dark:text-slate-500 disabled:opacity-30 hover:border-[#1856FF]/30 hover:text-[#1856FF] transition-all cursor-pointer disabled:cursor-not-allowed">
                <ChevronRight size={14} />
            </button>
        </div>
    );
}

// ─── Export Settings Panel ────────────────────────────────────────────────────

function ExportSettingsPanel({
    baseName, batchSize, onBaseNameChange, onBatchSizeChange, doneCount, showIndividual,
}: {
    baseName: string; batchSize: string; onBaseNameChange: (v: string) => void;
    onBatchSizeChange: (v: string) => void; doneCount: number; showIndividual: boolean;
}) {
    const batchNum = parseInt(batchSize, 10);
    const batchValid = !isNaN(batchNum) && batchNum >= 1 && batchNum <= 1500;
    const batchCount = doneCount > 0 && batchValid ? Math.ceil(doneCount / batchNum) : null;

    return (
        <GlassPanel className="p-4 sm:p-5">
            <div className="flex items-center gap-2 font-(family-name:--font-space-grotesk) text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-4">
                <Settings2 size={13} />
                Export Settings
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Base name */}
                <div>
                    <label className="block font-(family-name:--font-space-grotesk) text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-1.5">File prefix</label>
                    <input
                        type="text" value={baseName} onChange={(e) => onBaseNameChange(e.target.value)} placeholder="image"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200/60 dark:border-white/8 font-(family-name:--font-jetbrains-mono) text-[13px] text-slate-800 dark:text-slate-100 bg-white/60 dark:bg-white/4 backdrop-blur-xl outline-none focus:border-[#1856FF]/40 focus:shadow-[0_0_12px_rgba(24,86,255,0.08)] transition-all"
                    />
                </div>
                {/* Batch size */}
                <div>
                    <label className="block font-(family-name:--font-space-grotesk) text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-1.5">Images per zip</label>
                    <input
                        type="number" min={1} max={1500} value={batchSize} onChange={(e) => onBatchSizeChange(e.target.value)}
                        className={cn("w-full h-10 px-3 rounded-xl border font-(family-name:--font-jetbrains-mono) text-[13px] text-slate-800 dark:text-slate-100 bg-white/60 dark:bg-white/4 backdrop-blur-xl outline-none transition-all", batchValid ? "border-slate-200/60 dark:border-white/8 focus:border-[#1856FF]/40" : "border-[#EA2143]/40")}
                    />
                </div>
            </div>
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-[#1856FF]/15 dark:border-[#1856FF]/10 font-(family-name:--font-inter) text-[11px] text-[#1856FF] dark:text-blue-400 leading-relaxed" style={INLINE_STYLES.exportInfoBox}>
                <Info size={12} className="shrink-0 mt-0.5" />
                <span>
                    Files named <code className="font-(family-name:--font-jetbrains-mono) bg-[#1856FF]/10 px-1 rounded">{baseName || "image"}-1.jpg</code>
                    {batchCount && batchCount > 1 && <>, in <strong>{batchCount} zip{batchCount !== 1 ? "s" : ""}</strong> of {batchNum} each</>}
                    {showIndividual && doneCount <= 10 && <> · or download individually</>}
                </span>
            </div>
        </GlassPanel>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ImageResizerPage() {
    const [items, setItems] = useState<ImageItem[]>([]);
    const [width, setWidth] = useState<string>("1920");
    const [height, setHeight] = useState<string>("1080");
    const [lockRatio, setLockRatio] = useState<boolean>(false);
    const [ratioRef, setRatioRef] = useState<RatioRef | null>(null);
    const [fitMode, setFitMode] = useState<FitMode>("pad");
    const [processing, setProcessing] = useState<boolean>(false);
    const [activePreset, setActivePreset] = useState<string | null>("Full HD");
    const [baseName, setBaseName] = useState<string>("image");
    const [batchSize, setBatchSize] = useState<string>("10");
    const [zipping, setZipping] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [statusFilter, setStatusFilter] = useState<ImageStatus | "all">("all");

    const { toasts, addToast, removeToast } = useToast();
    const progressRef = useRef({ done: 0, total: 0 });
    const [progressSnapshot, setProgressSnapshot] = useState({ done: 0, total: 0 });

    // Use a ref to avoid stale closure in handleFiles — this is the key fix for the double-input bug
    const itemsRef = useRef<ImageItem[]>([]);
    useEffect(() => { itemsRef.current = items; }, [items]);

    // Track hashes of already-added files to detect duplicates
    const seenHashesRef = useRef<Set<string>>(new Set());

    const widthValid = validateDimension(width);
    const heightValid = validateDimension(height);
    const doneItems = items.filter((i) => i.status === "done" && i.resultBlob);
    const doneCount = doneItems.length;

    // ── Stats ──────────────────────────────────────────────────────────────────

    const stats: StatsProps = {
        total: items.length,
        done: items.filter((i) => i.status === "done").length,
        duplicates: items.filter((i) => i.status === "skipped" && i.skipReason === "duplicate").length,
        skippedDims: items.filter((i) => i.status === "skipped" && i.skipReason === "already correct size").length,
        skippedLowQ: items.filter((i) => i.skippedCompression && i.status === "done").length,
        errors: items.filter((i) => i.status === "error").length,
        originalBytes: items.reduce((acc, i) => acc + i.originalSize, 0),
        resultBytes: items.filter((i) => i.status === "done" && i.resultSize != null).reduce((acc, i) => acc + (i.resultSize ?? 0), 0),
    };

    // ── Filtered + paginated items ─────────────────────────────────────────────

    const filteredItems = statusFilter === "all" ? items : items.filter((i) => i.status === statusFilter);
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
    const pagedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Reset to page 1 when filter or items change
    useEffect(() => { setPage(1); }, [statusFilter, items.length]);

    // ── File handling ──────────────────────────────────────────────────────────
    // FIX: Use itemsRef instead of items.length in the dependency array.
    // This prevents the stale closure problem that caused double-input in React StrictMode
    // (where the component mounts twice but the old closure still had length 0).
    const handleFiles = useCallback(async (files: File[]) => {
        // Filter to images only, warn on unsupported types
        const imageFiles: File[] = [];
        let animatedCount = 0;
        for (const f of files) {
            if (!f.type.startsWith("image/")) continue;
            if (UNSUPPORTED_TYPES.has(f.type)) {
                addToast("warning", `${f.name}: TIFF cannot be decoded by browsers — skipped.`);
                continue;
            }
            if (ANIMATED_TYPES.has(f.type)) animatedCount++;
            imageFiles.push(f);
        }
        if (animatedCount > 0) {
            addToast("info", `${animatedCount} animated image${animatedCount !== 1 ? "s" : ""} will be flattened to the first frame.`);
        }

        const remaining = 1500 - itemsRef.current.length;
        const toAdd = imageFiles.slice(0, remaining);

        if (toAdd.length < imageFiles.length) {
            addToast("warning", `Queue limited to 1 500 images. ${imageFiles.length - toAdd.length} skipped.`);
        }
        if (toAdd.length === 0) return;

        const newItems = await Promise.all(
            toAdd.map(async (file): Promise<ImageItem | null> => {
                try {
                    const hash = await fastFileHash(file);
                    const isDuplicate = seenHashesRef.current.has(hash);

                    const url = URL.createObjectURL(file);
                    const img = await loadImageElement(url);
                    URL.revokeObjectURL(url);

                    const base = {
                        id: crypto.randomUUID(),
                        file,
                        hash,
                        previewUrl: URL.createObjectURL(file),
                        originalW: img.naturalWidth || img.width,
                        originalH: img.naturalHeight || img.height,
                        originalSize: file.size,
                        resultBlob: null,
                        resultSize: null,
                        targetW: null,
                        targetH: null,
                        actualW: null,
                        actualH: null,
                        skippedCompression: false,
                    };

                    if (isDuplicate) {
                        return { ...base, status: "skipped", skipReason: "duplicate" };
                    }

                    seenHashesRef.current.add(hash);
                    return { ...base, status: "idle" };
                } catch { return null; }
            })
        );

        const valid = newItems.filter((i): i is ImageItem => i !== null);
        const dupeCount = valid.filter((i) => i.status === "skipped").length;
        const addedCount = valid.length - dupeCount;

        setItems((prev) => [...prev, ...valid]);
        if (addedCount > 0) addToast("info", `${addedCount} image${addedCount !== 1 ? "s" : ""} added`);
        if (dupeCount > 0) addToast("warning", `${dupeCount} duplicate${dupeCount !== 1 ? "s" : ""} skipped`);
    }, [addToast]); // No items.length dependency — we read from itemsRef instead

    // ── Dimension controls ─────────────────────────────────────────────────────

    const handleWidthChange = (val: string) => {
        setWidth(val);
        setActivePreset(null);
        if (lockRatio && ratioRef && validateDimension(val))
            setHeight(String(Math.round((parseInt(val) / ratioRef.rw) * ratioRef.rh)));
    };

    const handleHeightChange = (val: string) => {
        setHeight(val);
        setActivePreset(null);
        if (lockRatio && ratioRef && validateDimension(val))
            setWidth(String(Math.round((parseInt(val) / ratioRef.rh) * ratioRef.rw)));
    };

    const toggleLock = () => {
        if (!lockRatio && widthValid && heightValid) {
            setRatioRef(computeRatio(parseInt(width), parseInt(height)));
            addToast("info", "Aspect ratio locked");
        } else if (lockRatio) {
            addToast("info", "Aspect ratio unlocked");
        }
        setLockRatio((v) => !v);
    };

    const applyPreset = (w: number, h: number, label: string) => {
        setWidth(String(w));
        setHeight(String(h));
        setActivePreset(label);
        if (lockRatio) setRatioRef(computeRatio(w, h));
        addToast("info", `Preset: ${label} (${w}×${h})`);
    };

    // ── Main resize + compress pipeline ───────────────────────────────────────

    const handleResize = async () => {
        if (!widthValid || !heightValid || items.length === 0) return;
        const targetW = parseInt(width);
        const targetH = parseInt(height);
        setProcessing(true);

        const pending = items.filter((i) => i.status === "idle" || i.status === "error");

        // isAlreadyTargetSize now receives fitMode — crop mode never skips
        const dimMatchIds = new Set(
            pending.filter((i) => isAlreadyTargetSize(i, targetW, targetH, fitMode)).map((i) => i.id)
        );
        if (dimMatchIds.size > 0) {
            setItems((prev) => prev.map((i) =>
                dimMatchIds.has(i.id)
                    ? { ...i, status: "skipped" as ImageStatus, targetW, targetH, actualW: i.originalW, actualH: i.originalH, skipReason: "already correct size" }
                    : i
            ));
        }

        const toProcess = pending.filter((i) => !dimMatchIds.has(i.id));
        progressRef.current = { done: 0, total: toProcess.length };
        setProgressSnapshot({ done: 0, total: toProcess.length });

        const tasks = toProcess.map((item) => async () => {
            setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "processing" as ImageStatus } : i));
            const { blob, skippedCompression, actualW, actualH } = await resizeAndCompress(
                item.file, targetW, targetH, item.originalW, item.originalH, fitMode
            );
            setItems((prev) => prev.map((i) =>
                i.id === item.id
                    ? { ...i, status: "done" as ImageStatus, resultBlob: blob, resultSize: blob.size, targetW, targetH, actualW, actualH, skippedCompression }
                    : i
            ));
            return { id: item.id };
        });

        let successCount = 0, errorCount = 0;
        await pLimit(tasks, WORKER_CONCURRENCY, (_idx, result) => {
            if (result instanceof Error) errorCount++;
            else successCount++;
            progressRef.current.done++;
            setProgressSnapshot({ done: progressRef.current.done, total: progressRef.current.total });
        });

        setProcessing(false);
        if (dimMatchIds.size > 0) addToast("info", `${dimMatchIds.size} image${dimMatchIds.size !== 1 ? "s" : ""} already at target size — skipped`);
        if (successCount > 0) addToast("success", `${successCount} image${successCount !== 1 ? "s" : ""} resized to ${targetW}×${targetH}`);
        if (errorCount > 0) addToast("error", `${errorCount} image${errorCount !== 1 ? "s" : ""} failed`);
    };

    // ── Download helpers ───────────────────────────────────────────────────────

    const downloadSingle = (item: ImageItem) => {
        if (!item.resultBlob) return;
        const ext = getOutputExtension(item.resultBlob.type);
        const base = baseName.trim() || "image";
        const idx = doneItems.indexOf(item) + 1;
        downloadBlob(item.resultBlob, `${base}-${idx}.${ext}`);
    };

    const downloadAllIndividually = () => {
        doneItems.forEach((item, idx) => {
            if (!item.resultBlob) return;
            const ext = getOutputExtension(item.resultBlob.type);
            const base = baseName.trim() || "image";
            setTimeout(() => downloadBlob(item.resultBlob!, `${base}-${idx + 1}.${ext}`), idx * 80);
        });
        addToast("success", `Downloading ${doneCount} images individually…`);
    };

    const downloadZip = async (batchIndex?: number) => {
        if (doneCount === 0) return;
        setZipping(true);
        try {
            const batchNum = Math.max(1, parseInt(batchSize, 10) || 10);
            const base = baseName.trim() || "image";

            if (batchIndex !== undefined) {
                const zip = new JSZip();
                const start = batchIndex * batchNum;
                const end = Math.min(start + batchNum, doneItems.length);
                for (let i = start; i < end; i++) {
                    const item = doneItems[i]!;
                    if (!item.resultBlob) continue;
                    zip.file(`${base}-${(i % batchNum) + 1}.${getOutputExtension(item.resultBlob.type)}`, item.resultBlob);
                }
                const blob = await zip.generateAsync({ type: "blob" });
                downloadBlob(blob, `${base}-batch-${batchIndex + 1}.zip`);
                addToast("success", `Batch ${batchIndex + 1} downloaded.`);
            } else if (doneCount <= batchNum) {
                const zip = new JSZip();
                doneItems.forEach((item, i) => {
                    if (!item.resultBlob) return;
                    zip.file(`${base}-${i + 1}.${getOutputExtension(item.resultBlob.type)}`, item.resultBlob);
                });
                const blob = await zip.generateAsync({ type: "blob" });
                downloadBlob(blob, `${base}-resized.zip`);
                addToast("success", `${doneCount} images zipped.`);
            } else {
                const totalBatches = Math.ceil(doneCount / batchNum);
                for (let b = 0; b < totalBatches; b++) {
                    const zip = new JSZip();
                    const start = b * batchNum;
                    const end = Math.min(start + batchNum, doneItems.length);
                    for (let i = start; i < end; i++) {
                        const item = doneItems[i]!;
                        if (!item.resultBlob) continue;
                        zip.file(`${base}-${(i % batchNum) + 1}.${getOutputExtension(item.resultBlob.type)}`, item.resultBlob);
                    }
                    const blob = await zip.generateAsync({ type: "blob" });
                    await new Promise<void>((res) => setTimeout(() => { downloadBlob(blob, `${base}-batch-${b + 1}.zip`); res(); }, b * 300));
                }
                addToast("success", `${Math.ceil(doneCount / batchNum)} zip batches downloaded.`);
            }
        } finally {
            setZipping(false);
        }
    };

    const clearAll = () => {
        items.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl));
        seenHashesRef.current.clear();
        setItems([]);
        addToast("info", "Queue cleared");
    };

    const removeItem = (id: string) => {
        setItems((prev) => {
            const item = prev.find((i) => i.id === id);
            if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
            // Remove hash so the same file can be re-added
            if (item?.hash) seenHashesRef.current.delete(item.hash);
            return prev.filter((i) => i.id !== id);
        });
    };

    const canResize = items.filter((i) => i.status === "idle" || i.status === "error").length > 0 && widthValid && heightValid && !processing;
    const batchNum = Math.max(1, parseInt(batchSize, 10) || 10);
    const batchCount = doneCount > 0 ? Math.ceil(doneCount / batchNum) : 0;
    const showIndividualOption = doneCount > 0 && doneCount <= 10;
    const stagger = (i: number) => ({ delay: i * 0.07 });

    const filterOptions: { value: ImageStatus | "all"; label: string; count: number; color: string }[] = [
        { value: "all", label: "All", count: items.length, color: COLORS.brand },
        { value: "idle", label: "Ready", count: items.filter((i) => i.status === "idle").length, color: COLORS.muted },
        { value: "done", label: "Done", count: items.filter((i) => i.status === "done").length, color: COLORS.success },
        { value: "skipped", label: "Skipped", count: items.filter((i) => i.status === "skipped").length, color: COLORS.violet },
        { value: "processing", label: "Working", count: items.filter((i) => i.status === "processing").length, color: COLORS.warning },
        { value: "error", label: "Failed", count: items.filter((i) => i.status === "error").length, color: COLORS.error },
    ];

    return (
        <>
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            <div className="font-(family-name:--font-inter) min-h-screen relative overflow-hidden text-slate-900 dark:text-slate-100">
                <div className="pointer-events-none fixed inset-0" style={INLINE_STYLES.backgroundOverlay} />
                <div className="fixed inset-0 bg-slate-50 dark:bg-[#06080f]" style={INLINE_STYLES.pageBg} />

                <div className="relative max-w-5xl mx-auto px-4 py-8 md:px-6 md:py-12" style={{ zIndex: 1 }}>

                    {/* ── Header ── */}
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <Badge variant="secondary" className="font-mono text-[10px] tracking-[0.16em]">Image tools</Badge>
                            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#141414] dark:text-white md:text-4xl">
                                Image{" "}
                                <span className="bg-linear-to-r from-[#1856FF] to-[#3A344E] bg-clip-text text-transparent dark:from-[#a5c4ff] dark:to-white/90">resizer</span>
                            </h1>
                            <p className="mt-2 max-w-2xl text-[#141414]/70 dark:text-white/65">
                                Resize up to 1 500 images at once. Duplicates auto-skipped, smart compression, pagination, all in-browser.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="success" className="gap-1.5"><CheckCircle2 className="size-3" />Local</Badge>
                            <Badge variant="outline" className="font-mono text-[10px]">Up to 1 500 images</Badge>
                            <Badge variant="outline" className="font-mono text-[10px]">≤ 5 MB output</Badge>
                        </div>
                    </motion.div>

                    {/* Format chips */}
                    <div className="mb-8 flex flex-wrap gap-2">
                        {["JPEG", "PNG", "WebP", "GIF", "BMP", "AVIF", "SVG"].map((label) => (
                            <Badge key={label} variant="secondary" className="font-normal">{label}</Badge>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4 sm:gap-5">

                        {/* ── Drop zone ── */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...stagger(1), type: "spring", stiffness: 300, damping: 30 }}>
                            <DropZone onFiles={handleFiles} disabled={processing} />
                        </motion.div>

                        {/* ── Dimensions panel ── */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...stagger(2), type: "spring", stiffness: 300, damping: 30 }}>
                            <GlassPanel className="p-4 sm:p-6" luminous>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2 font-(family-name:--font-space-grotesk) text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
                                        <Layers size={13} />
                                        Output Dimensions
                                    </div>
                                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                                        {PRESETS.map((p, i) => (
                                            <motion.div key={p.label} initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.18 + i * 0.04, type: "spring", stiffness: 400, damping: 25 }}>
                                                <PresetCard label={p.label} sub={p.sub} w={p.w} h={p.h} active={activePreset === p.label} onClick={(w, h) => applyPreset(w, h, p.label)} />
                                            </motion.div>
                                        ))}
                                    </div>
                                    <div className="flex items-end gap-2 sm:gap-3">
                                        <DimensionInput label="Width" value={width} onChange={handleWidthChange} error={!widthValid} />
                                        <motion.button onClick={toggleLock} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.9 }} title={lockRatio ? "Unlock aspect ratio" : "Lock aspect ratio"} className={cn("flex flex-col items-center gap-1 px-3 py-3 rounded-2xl border cursor-pointer font-(family-name:--font-space-grotesk) transition-all duration-200 shrink-0 backdrop-blur-xl", lockRatio ? "text-[#1856FF]" : "border-slate-200/60 dark:border-white/8 bg-white/50 dark:bg-white/[0.03] text-slate-400 dark:text-slate-500 hover:border-[#1856FF]/30 hover:text-[#1856FF]")} style={lockRatio ? INLINE_STYLES.lockButtonActive : {}}>
                                            <motion.span animate={{ rotate: lockRatio ? 0 : 15 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                                                {lockRatio ? <Lock size={14} /> : <Unlock size={14} />}
                                            </motion.span>
                                            <span className="text-[8px] font-bold tracking-widest uppercase leading-none">{lockRatio ? "Lock" : "Free"}</span>
                                        </motion.button>
                                        <DimensionInput label="Height" value={height} onChange={handleHeightChange} error={!heightValid} />
                                    </div>
                                    <AnimatePresence>
                                        {(!widthValid || !heightValid) && (
                                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-1.5 font-(family-name:--font-inter) text-[12px] font-medium text-[#EA2143] overflow-hidden">
                                                <AlertCircle size={13} />
                                                Dimensions must be between 1 and 8 000 px.
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                    <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-2xl border border-[#1856FF]/15 dark:border-[#1856FF]/10 font-(family-name:--font-inter) text-[12px] text-[#1856FF] dark:text-blue-400 leading-relaxed" style={INLINE_STYLES.infoBox}>
                                        <Zap size={13} className="shrink-0 mt-0.5" />
                                        <span>
                                            Images are <strong>{fitMode === "pad" ? "letterboxed (black bars)" : "centre-cropped"}</strong> if aspect ratios differ.
                                            {" "}Images already at target dimensions are skipped. Low-resolution or small images skip lossy compression. Output ≤ <strong>5 MB</strong>.
                                        </span>
                                    </div>
                                    {/* ── Fit mode toggle ── */}
                                    <div className="flex items-center gap-2 p-1 rounded-2xl border border-slate-200/60 dark:border-white/8 bg-white/40 dark:bg-white/2 backdrop-blur-xl">
                                        {(["pad", "crop"] as FitMode[]).map((mode) => {
                                            const isActive = fitMode === mode;
                                            const label = mode === "pad" ? "Letterbox (pad)" : "Crop to fill";
                                            const sublabel = mode === "pad" ? "Black bars, no crop" : "Centred crop, no bars";
                                            const icon = mode === "pad" ? <Package size={13} /> : <Layers size={13} />;
                                            return (
                                                <motion.button
                                                    key={mode}
                                                    onClick={() => setFitMode(mode)}
                                                    whileTap={{ scale: 0.97 }}
                                                    className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-left"
                                                    style={isActive ? INLINE_STYLES.fitModeActive : INLINE_STYLES.fitModeInactive}
                                                >
                                                    <span className="shrink-0">{icon}</span>
                                                    <span className="flex flex-col">
                                                        <span className="font-(family-name:--font-space-grotesk) text-[11px] font-bold tracking-wide leading-none">{label}</span>
                                                        <span className="font-(family-name:--font-inter) text-[10px] opacity-70 mt-0.5 leading-none">{sublabel}</span>
                                                    </span>
                                                    {isActive && (
                                                        <motion.span layoutId="fitIndicator" className="ml-auto" initial={false}>
                                                            <CheckCircle2 size={13} />
                                                        </motion.span>
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </GlassPanel>
                        </motion.div>

                        {/* ── Export settings — always visible ── */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...stagger(3), type: "spring", stiffness: 300, damping: 30 }}>
                            <ExportSettingsPanel
                                baseName={baseName} batchSize={batchSize}
                                onBaseNameChange={setBaseName} onBatchSizeChange={setBatchSize}
                                doneCount={doneCount} showIndividual={showIndividualOption}
                            />
                        </motion.div>

                        {/* ── Stats dashboard ── */}
                        <AnimatePresence>
                            {items.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                                    <StatsDashboard stats={stats} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Image queue ── */}
                        <AnimatePresence>
                            {items.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="flex flex-col gap-2.5">

                                    {/* Header row */}
                                    <div className="flex items-center justify-between px-1 flex-wrap gap-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-(family-name:--font-plus-jakarta) text-[13px] font-bold text-slate-800 dark:text-slate-100">
                                                <AnimatedNumber value={items.length} /> image{items.length !== 1 ? "s" : ""}
                                            </span>
                                            <AnimatePresence>
                                                {doneCount > 0 && (
                                                    <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} className="font-(family-name:--font-space-grotesk) text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-300/50 dark:border-emerald-500/20 px-2 py-0.5 rounded-full" style={{ background: SHADOWS.doneCountBadge }}>
                                                        {doneCount} done
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                            <AnimatePresence>
                                                {processing && (
                                                    <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="font-(family-name:--font-space-grotesk) text-[10px] font-bold text-amber-500 border border-amber-400/30 px-2 py-0.5 rounded-full" style={{ background: SHADOWS.processingBadge }}>
                                                        Processing…
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} onClick={clearAll} disabled={processing} className="flex items-center gap-1.5 font-(family-name:--font-inter) text-[12px] font-semibold text-[#EA2143]/70 hover:text-[#EA2143] bg-transparent border-none cursor-pointer px-2.5 py-1.5 rounded-xl hover:bg-red-50/80 dark:hover:bg-red-900/10 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed">
                                            <Trash2 size={13} />
                                            Clear all
                                        </motion.button>
                                    </div>

                                    {/* ── Status filter tabs — always visible ── */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {filterOptions.map((opt) => {
                                            const isActive = statusFilter === opt.value;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => setStatusFilter(opt.value)}
                                                    className={cn(
                                                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-(family-name:--font-space-grotesk) text-[10px] font-bold tracking-wide transition-all duration-150 cursor-pointer",
                                                        isActive
                                                            ? "border-transparent text-white"
                                                            : "border-slate-200/60 dark:border-white/8 text-slate-400 dark:text-slate-500 bg-white/40 dark:bg-white/2 hover:border-slate-300/80 dark:hover:border-white/12"
                                                    )}
                                                    style={isActive ? { background: opt.color, boxShadow: `0 2px 12px ${opt.color}40` } : {}}
                                                >
                                                    {opt.label}
                                                    <span className={cn("px-1.5 py-0.5 rounded-full text-[9px] font-bold", isActive ? "bg-white/20" : "bg-slate-100 dark:bg-white/6 text-slate-500 dark:text-slate-400")}>
                                                        {opt.count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Progress */}
                                    <AnimatePresence>
                                        {processing && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                                <ProgressBar done={progressSnapshot.done} total={progressSnapshot.total} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Paginated image list */}
                                    <motion.div layout className="flex flex-col gap-2">
                                        <AnimatePresence initial={false}>
                                            {pagedItems.map((item) => (
                                                <ImageCard key={item.id} item={item} onRemove={removeItem} onDownload={downloadSingle} />
                                            ))}
                                        </AnimatePresence>
                                        {filteredItems.length === 0 && statusFilter !== "all" && (
                                            <p className="text-center font-(family-name:--font-inter) text-[12px] text-slate-400 dark:text-slate-500 py-4">
                                                No images match this filter.
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* Pagination */}
                                    <Pagination page={page} totalPages={totalPages} onChange={setPage} />

                                    {/* Page info */}
                                    {filteredItems.length > PAGE_SIZE && (
                                        <p className="text-center font-(family-name:--font-inter) text-[11px] text-slate-400 dark:text-slate-500">
                                            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredItems.length)} of {filteredItems.length}
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Actions ── */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...stagger(4), type: "spring", stiffness: 300, damping: 30 }} className="flex flex-col gap-2.5">
                            <motion.button
                                onClick={handleResize}
                                disabled={!canResize}
                                whileHover={canResize ? { scale: 1.01, y: -1 } : {}}
                                whileTap={canResize ? { scale: 0.98 } : {}}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="w-full py-4 px-6 rounded-2xl font-(family-name:--font-plus-jakarta) text-[14px] sm:text-[15px] font-bold cursor-pointer flex items-center justify-center gap-2 tracking-tight transition-all duration-150 border-none"
                                style={canResize ? INLINE_STYLES.resizeButtonActive : INLINE_STYLES.resizeButtonDisabled}
                            >
                                {processing ? (
                                    <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><RefreshCw size={15} /></motion.span>Resizing & compressing…</>
                                ) : (
                                    <><ImageIcon size={15} />Resize {items.filter((i) => i.status === "idle" || i.status === "error").length > 0 ? `${items.filter((i) => i.status === "idle" || i.status === "error").length} image${items.filter((i) => i.status === "idle" || i.status === "error").length !== 1 ? "s" : ""}` : "images"}<ArrowRight size={14} /></>
                                )}
                            </motion.button>

                            <AnimatePresence>
                                {doneCount > 0 && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="overflow-hidden">
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            {showIndividualOption && (
                                                <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }} onClick={downloadAllIndividually} disabled={zipping} className="flex-1 py-3.5 px-5 rounded-2xl font-(family-name:--font-plus-jakarta) text-[13px] sm:text-[14px] font-bold cursor-pointer flex items-center justify-center gap-2 border backdrop-blur-xl transition-all duration-150" style={INLINE_STYLES.downloadIndividualButton}>
                                                    <FileImage size={14} />
                                                    Download {doneCount} individually
                                                </motion.button>
                                            )}
                                            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }} onClick={() => downloadZip()} disabled={zipping} className={cn("py-3.5 px-5 rounded-2xl font-(family-name:--font-plus-jakarta) text-[13px] sm:text-[14px] font-bold cursor-pointer flex items-center justify-center gap-2 border backdrop-blur-xl transition-all duration-150", showIndividualOption ? "" : "flex-1")} style={INLINE_STYLES.downloadZipButton}>
                                                {zipping ? (
                                                    <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><RefreshCw size={14} /></motion.span>Zipping…</>
                                                ) : (
                                                    <><FolderArchive size={14} />{batchCount > 1 ? `Download ${batchCount} zips` : `Download zip (${doneCount})`}</>
                                                )}
                                            </motion.button>
                                        </div>
                                        {batchCount > 1 && (
                                            <p className="mt-1.5 text-center font-(family-name:--font-inter) text-[11px] text-slate-400 dark:text-slate-500">
                                                {doneCount} images → {batchCount} zip files of up to {batchNum} each · prefix: <code className="font-(family-name:--font-jetbrains-mono)">{baseName || "image"}</code>
                                            </p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <AnimatePresence>
                            {items.length === 0 && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-(family-name:--font-inter) text-center text-[13px] text-slate-400 dark:text-slate-500 py-2">
                                    Upload images above, set your target dimensions and hit Resize.
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {/* ── Footer ── */}
                        <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center justify-center gap-2 font-(family-name:--font-inter) text-[11px] text-slate-400 dark:text-slate-500 pt-5 border-t border-slate-200/60 dark:border-white/6">
                            <QuantipixorIcon size={13} />
                            <span>Quantipixor · All processing happens in your browser — no uploads to any server.</span>
                        </motion.footer>
                    </div>
                </div>
            </div>
        </>
    );
}