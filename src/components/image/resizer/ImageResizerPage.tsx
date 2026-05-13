"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import {
    CloudUpload,
    Download,
    Trash2,
    Lock,
    Unlock,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    X,
    ImageIcon,
    ArrowRight,
    Layers,
    CheckCheck,
    AlertTriangle,
    Info,
    Maximize2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ImageStatus = "idle" | "processing" | "done" | "error";

interface ImageItem {
    id: string;
    file: File;
    previewUrl: string;
    originalW: number;
    originalH: number;
    status: ImageStatus;
    resultBlob: Blob | null;
    targetW: number | null;
    targetH: number | null;
}

interface RatioRef {
    rw: number;
    rh: number;
}

interface Preset {
    label: string;
    sub: string;
    w: number;
    h: number;
}

interface LoadedImage {
    img: HTMLImageElement;
    url: string;
    width: number;
    height: number;
}

// ─── Toast System ─────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: ToastType, message: string) => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return { toasts, addToast, removeToast };
}

const toastConfig: Record<ToastType, { icon: React.ReactNode; bg: string; border: string; text: string; iconColor: string }> = {
    success: {
        icon: <CheckCheck size={15} />,
        bg: "bg-emerald-950/90",
        border: "border-emerald-700/50",
        text: "text-emerald-100",
        iconColor: "text-emerald-400",
    },
    error: {
        icon: <AlertTriangle size={15} />,
        bg: "bg-red-950/90",
        border: "border-red-700/50",
        text: "text-red-100",
        iconColor: "text-red-400",
    },
    info: {
        icon: <Info size={15} />,
        bg: "bg-slate-900/90",
        border: "border-indigo-700/50",
        text: "text-slate-100",
        iconColor: "text-indigo-400",
    },
};

function ToastContainer({
    toasts,
    onRemove,
}: {
    toasts: Toast[];
    onRemove: (id: string) => void;
}) {
    return (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => {
                    const cfg = toastConfig[toast.type];
                    return (
                        <motion.div
                            key={toast.id}
                            layout
                            initial={{ opacity: 0, y: 24, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 40, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl ${cfg.bg} ${cfg.border} ${cfg.text} max-w-[320px] cursor-pointer`}
                            onClick={() => onRemove(toast.id)}
                        >
                            <span className={`flex-shrink-0 ${cfg.iconColor}`}>{cfg.icon}</span>
                            <span className="font-[family-name:var(--font-inter)] text-[13px] font-medium leading-snug">
                                {toast.message}
                            </span>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

// ─── Brand Icon ───────────────────────────────────────────────────────────────

interface QuantipixorIconProps {
    className?: string;
    size?: number;
    "aria-label"?: string;
}

function QuantipixorIcon({
    className = "h-6 w-6",
    size = 24,
    "aria-label": ariaLabel,
}: QuantipixorIconProps) {
    const decorative = !ariaLabel;
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden={decorative ? true : undefined}
            aria-label={ariaLabel}
            role={decorative ? undefined : "img"}
            className={className}
        >
            <path
                d="M12 2.5C6.753 2.5 2.5 6.753 2.5 12C2.5 17.247 6.753 21.5 12 21.5C16.184 21.5 19.747 18.827 20.914 15.05"
                stroke="url(#qG1)"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M19 18.5L22 21.5"
                stroke="url(#qG1)"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            <circle cx="9.2" cy="9.2" r="1.3" fill="url(#qG1)" />
            <defs>
                <linearGradient id="qG1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1856FF" />
                    <stop offset="100%" stopColor="#9333EA" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const helpers = {
    formatBytes(bytes: number): string {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    },

    async loadImageFromFile(file: File): Promise<LoadedImage> {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () =>
                resolve({ img, url, width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = url;
        });
    },

    computeRatio(w: number, h: number): RatioRef {
        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const d = gcd(w, h);
        return { rw: w / d, rh: h / d };
    },

    resizeOnCanvas(
        img: HTMLImageElement,
        targetW: number,
        targetH: number,
        originalW: number,
        originalH: number
    ): HTMLCanvasElement {
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d")!;
        const scale = Math.min(targetW / originalW, targetH / originalH);
        const drawW = Math.round(originalW * scale);
        const drawH = Math.round(originalH * scale);
        const offsetX = Math.round((targetW - drawW) / 2);
        const offsetY = Math.round((targetH - drawH) / 2);
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        return canvas;
    },

    canvasToBlob(
        canvas: HTMLCanvasElement,
        mimeType: string = "image/png",
        quality: number = 0.92
    ): Promise<Blob> {
        return new Promise((resolve) =>
            canvas.toBlob((blob) => resolve(blob!), mimeType, quality)
        );
    },

    downloadBlob(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    },

    getOutputFilename(original: string, targetW: number, targetH: number): string {
        const base = original.replace(/\.[^.]+$/, "");
        return `${base}_${targetW}x${targetH}.png`;
    },

    validateDimension(value: string): boolean {
        const n = parseInt(value, 10);
        return !isNaN(n) && n >= 1 && n <= 8000;
    },
};

// ─── Presets ──────────────────────────────────────────────────────────────────

const PRESETS: Preset[] = [
    { label: "HD", sub: "1280×720", w: 1280, h: 720 },
    { label: "Full HD", sub: "1920×1080", w: 1920, h: 1080 },
    { label: "4K", sub: "3840×2160", w: 3840, h: 2160 },
    { label: "Square", sub: "1080×1080", w: 1080, h: 1080 },
    { label: "Story", sub: "1080×1920", w: 1080, h: 1920 },
    { label: "Twitter", sub: "1200×675", w: 1200, h: 675 },
    { label: "OG Image", sub: "1200×630", w: 1200, h: 630 },
];

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
    const spring = useSpring(value, { stiffness: 300, damping: 30 });
    const display = useTransform(spring, (v) => Math.round(v).toString());

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return <motion.span>{display}</motion.span>;
}

// ─── DropZone ─────────────────────────────────────────────────────────────────

interface DropZoneProps {
    onFiles: (files: File[]) => void;
    disabled: boolean;
}

function DropZone({ onFiles, disabled }: DropZoneProps) {
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setDragging(false);
            if (disabled) return;
            const files = Array.from(e.dataTransfer.files).filter((f) =>
                f.type.startsWith("image/")
            );
            if (files.length) onFiles(files);
        },
        [disabled, onFiles]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length) onFiles(files);
        e.target.value = "";
    };

    const inputId = "resizer-file-upload";
    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
                "relative rounded-3xl border-2 border-dashed p-8 text-center transition-all",
                dragging
                    ? "border-[#1856FF] bg-[#1856FF]/8 shadow-[0_0_0_4px_rgba(24,86,255,0.12)]"
                    : "border-[#3A344E]/20 bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] backdrop-blur-md dark:border-white/10",
                disabled ? "opacity-50 cursor-not-allowed" : "",
            )}
        >
            <input
                ref={inputRef}
                id={inputId}
                type="file"
                multiple
                accept="image/*"
                className="sr-only"
                onChange={handleChange}
                disabled={disabled}
            />
            <CloudUpload
                className="mx-auto size-12 text-[#1856FF] opacity-90"
                strokeWidth={1.25}
                aria-hidden
            />
            <label htmlFor={inputId} className={cn("mt-4 block", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
                <span className="inline-flex items-center justify-center rounded-full bg-[#1856FF] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_-6px_rgba(24,86,255,0.55)] ring-1 ring-white/20 transition hover:bg-[#0E4ADB] dark:ring-white/10">
                    Choose images
                </span>
            </label>
            <p className="mt-3 text-sm text-[#141414]/65 dark:text-white/55">
                Drag and drop or browse · PNG, JPG, WebP, GIF · Max 8000 × 8000 px
            </p>
        </div>
    );
}

// ─── DimensionInput ───────────────────────────────────────────────────────────

interface DimensionInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error: boolean;
}

function DimensionInput({ label, value, onChange, error }: DimensionInputProps) {
    const [focused, setFocused] = useState(false);
    return (
        <div className="flex-1 min-w-0">
            <label className="block font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-1.5">
                {label}
            </label>
            <motion.div
                animate={{
                    boxShadow: focused
                        ? "0 0 0 3px rgba(59,130,246,0.12)"
                        : error
                            ? "0 0 0 3px rgba(248,113,113,0.1)"
                            : "0 0 0 0px transparent",
                }}
                className={[
                    "flex items-center border rounded-xl bg-slate-50 dark:bg-[#151E2E] overflow-hidden transition-colors duration-150",
                    focused
                        ? "border-blue-500"
                        : error
                            ? "border-red-400 dark:border-red-500"
                            : "border-slate-200 dark:border-[#1E2D45]",
                ].join(" ")}
            >
                <input
                    type="number"
                    min={1}
                    max={8000}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="font-[family-name:var(--font-jetbrains-mono)] flex-1 border-none outline-none bg-transparent text-slate-900 dark:text-slate-100 text-base sm:text-lg font-semibold px-3 sm:px-3.5 py-2.5 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:opacity-30 [&::-webkit-inner-spin-button]:opacity-30"
                />
                <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold text-slate-400 dark:text-slate-500 pr-3 tracking-wide">
                    px
                </span>
            </motion.div>
        </div>
    );
}

// ─── PresetCard ───────────────────────────────────────────────────────────────

interface PresetCardProps {
    label: string;
    sub: string;
    w: number;
    h: number;
    onClick: (w: number, h: number) => void;
    active: boolean;
}

function PresetCard({ label, sub, w, h, onClick, active }: PresetCardProps) {
    return (
        <motion.button
            onClick={() => onClick(w, h)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={[
                "px-1.5 sm:px-2 py-2 sm:py-2.5 rounded-xl border text-center flex flex-col items-center gap-0.5 cursor-pointer transition-colors duration-150 w-full",
                active
                    ? "border-blue-500 dark:border-blue-600 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 ring-[3px] ring-blue-500/10 dark:ring-blue-500/20"
                    : "border-slate-200 dark:border-[#1E2D45] bg-white dark:bg-[#0F1623] hover:border-blue-300 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-[#151E2E]",
            ].join(" ")}
        >
            <span
                className={[
                    "font-[family-name:var(--font-plus-jakarta)] text-[10px] sm:text-[11px] font-bold block leading-tight",
                    active
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                        : "text-slate-700 dark:text-slate-200",
                ].join(" ")}
            >
                {label}
            </span>
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500 font-medium block leading-tight">
                {sub}
            </span>
        </motion.button>
    );
}

// ─── ImageCard ────────────────────────────────────────────────────────────────

interface ImageCardProps {
    item: ImageItem;
    onRemove: (id: string) => void;
}

const statusConfig: Record<
    ImageStatus,
    { label: string; badgeCls: string; cardBorderCls: string }
> = {
    idle: {
        label: "Ready",
        badgeCls:
            "bg-slate-100 dark:bg-[#151E2E] text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-[#1E2D45]",
        cardBorderCls: "border-slate-200 dark:border-[#1E2D45]",
    },
    processing: {
        label: "Resizing…",
        badgeCls: "bg-amber-50 dark:bg-amber-900/20 text-amber-500",
        cardBorderCls: "border-amber-200 dark:border-amber-800/40",
    },
    done: {
        label: "Done",
        badgeCls: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
        cardBorderCls: "border-emerald-200 dark:border-emerald-800/40",
    },
    error: {
        label: "Failed",
        badgeCls: "bg-red-50 dark:bg-red-900/10 text-red-400",
        cardBorderCls: "border-red-200 dark:border-red-800/30",
    },
};

function ImageCard({ item, onRemove }: ImageCardProps) {
    const s = statusConfig[item.status];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`flex items-center gap-2.5 sm:gap-3 px-3 sm:px-3.5 py-2.5 rounded-xl border bg-white dark:bg-[#0F1623] transition-colors duration-200 ${s.cardBorderCls}`}
        >
            {/* Thumbnail */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black relative flex items-center justify-center">
                {item.previewUrl ? (
                    <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <ImageIcon size={16} className="text-slate-500" />
                )}
                <AnimatePresence>
                    {item.status === "processing" && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/55 flex items-center justify-center text-white"
                        >
                            <RefreshCw size={14} className="animate-spin" />
                        </motion.div>
                    )}
                    {item.status === "done" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            className="absolute inset-0 bg-emerald-500/70 flex items-center justify-center text-white"
                        >
                            <CheckCircle2 size={14} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="font-[family-name:var(--font-plus-jakarta)] text-[12px] sm:text-[13px] font-semibold text-slate-800 dark:text-slate-100 truncate mb-0.5">
                    {item.file.name}
                </p>
                <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
                    {item.originalW}×{item.originalH}
                    {item.targetW != null && (
                        <>
                            <span className="text-indigo-400 mx-1">→</span>
                            {item.targetW}×{item.targetH}
                        </>
                    )}
                    <span className="mx-1 text-slate-300 dark:text-slate-600">·</span>
                    {helpers.formatBytes(item.file.size)}
                </p>
            </div>

            {/* Status badge — hidden on small screens */}
            <span
                className={`hidden sm:inline-flex font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide flex-shrink-0 ${s.badgeCls}`}
            >
                {s.label}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
                <AnimatePresence>
                    {item.status === "done" && item.resultBlob && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.94 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-[#151E2E] text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors duration-150 cursor-pointer"
                            onClick={() =>
                                helpers.downloadBlob(
                                    item.resultBlob!,
                                    helpers.getOutputFilename(item.file.name, item.targetW!, item.targetH!)
                                )
                            }
                            title="Download resized image"
                        >
                            <Download size={14} />
                        </motion.button>
                    )}
                </AnimatePresence>
                {item.status !== "processing" && (
                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#1E2D45] bg-slate-50 dark:bg-[#151E2E] text-slate-400 hover:text-red-400 hover:border-red-200 dark:hover:border-red-800/40 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-150 cursor-pointer"
                        onClick={() => onRemove(item.id)}
                        title="Remove"
                    >
                        <X size={14} />
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

interface ProgressBarProps {
    done: number;
    total: number;
}

function ProgressBar({ done, total }: ProgressBarProps) {
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-1 rounded-full bg-slate-200 dark:bg-[#1E2D45] overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                />
            </div>
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-semibold text-indigo-400 min-w-[34px] text-right">
                {pct}%
            </span>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ImageResizerPage() {
    const [items, setItems] = useState<ImageItem[]>([]);
    const [width, setWidth] = useState<string>("1920");
    const [height, setHeight] = useState<string>("1080");
    const [lockRatio, setLockRatio] = useState<boolean>(false);
    const [ratioRef, setRatioRef] = useState<RatioRef | null>(null);
    const [processing, setProcessing] = useState<boolean>(false);
    const [activePreset, setActivePreset] = useState<string | null>("Full HD");

    const { toasts, addToast, removeToast } = useToast();

    const widthValid = helpers.validateDimension(width);
    const heightValid = helpers.validateDimension(height);

    const handleFiles = useCallback(async (files: File[]) => {
        const newItems = await Promise.all(
            files.map(async (file): Promise<ImageItem | null> => {
                try {
                    const { width: w, height: h } = await helpers.loadImageFromFile(file);
                    return {
                        id: crypto.randomUUID(),
                        file,
                        previewUrl: URL.createObjectURL(file),
                        originalW: w,
                        originalH: h,
                        status: "idle" as ImageStatus,
                        resultBlob: null,
                        targetW: null,
                        targetH: null,
                    };
                } catch {
                    return null;
                }
            })
        );
        const valid = newItems.filter((item): item is ImageItem => item !== null);
        setItems((prev) => [...prev, ...valid]);
        if (valid.length > 0) {
            addToast("info", `${valid.length} image${valid.length !== 1 ? "s" : ""} added`);
        }
    }, [addToast]);

    const handleWidthChange = (val: string) => {
        setWidth(val);
        setActivePreset(null);
        if (lockRatio && ratioRef && helpers.validateDimension(val)) {
            setHeight(String(Math.round((parseInt(val) / ratioRef.rw) * ratioRef.rh)));
        }
    };

    const handleHeightChange = (val: string) => {
        setHeight(val);
        setActivePreset(null);
        if (lockRatio && ratioRef && helpers.validateDimension(val)) {
            setWidth(String(Math.round((parseInt(val) / ratioRef.rh) * ratioRef.rw)));
        }
    };

    const toggleLock = () => {
        if (!lockRatio && widthValid && heightValid) {
            setRatioRef(helpers.computeRatio(parseInt(width), parseInt(height)));
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
        if (lockRatio) setRatioRef(helpers.computeRatio(w, h));
        addToast("info", `Preset applied: ${label} (${w}×${h})`);
    };

    const handleResize = async () => {
        if (!widthValid || !heightValid || items.length === 0) return;
        const targetW = parseInt(width);
        const targetH = parseInt(height);
        setProcessing(true);

        let successCount = 0;
        let errorCount = 0;

        for (const item of items) {
            if (item.status === "done") continue;
            setItems((prev) =>
                prev.map((i) =>
                    i.id === item.id ? { ...i, status: "processing" as ImageStatus } : i
                )
            );
            try {
                const { img } = await helpers.loadImageFromFile(item.file);
                const canvas = helpers.resizeOnCanvas(img, targetW, targetH, item.originalW, item.originalH);
                const blob = await helpers.canvasToBlob(canvas);
                setItems((prev) =>
                    prev.map((i) =>
                        i.id === item.id
                            ? { ...i, status: "done" as ImageStatus, resultBlob: blob, targetW, targetH }
                            : i
                    )
                );
                successCount++;
            } catch {
                setItems((prev) =>
                    prev.map((i) =>
                        i.id === item.id ? { ...i, status: "error" as ImageStatus } : i
                    )
                );
                errorCount++;
            }
        }

        setProcessing(false);

        if (successCount > 0) {
            addToast(
                "success",
                `${successCount} image${successCount !== 1 ? "s" : ""} resized to ${targetW}×${targetH}`
            );
        }
        if (errorCount > 0) {
            addToast("error", `${errorCount} image${errorCount !== 1 ? "s" : ""} failed to resize`);
        }
    };

    const downloadAll = () => {
        const eligible = items.filter((i) => i.status === "done" && i.resultBlob);
        eligible.forEach((item) => {
            helpers.downloadBlob(
                item.resultBlob!,
                helpers.getOutputFilename(item.file.name, item.targetW!, item.targetH!)
            );
        });
        addToast("success", `Downloading ${eligible.length} images…`);
    };

    const clearAll = () => {
        items.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl));
        setItems([]);
        addToast("info", "Queue cleared");
    };

    const removeItem = (id: string) => {
        setItems((prev) => {
            const item = prev.find((i) => i.id === id);
            if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
            return prev.filter((i) => i.id !== id);
        });
    };

    const doneCount = items.filter((i) => i.status === "done").length;
    const canResize = items.length > 0 && widthValid && heightValid && !processing;

    // Stagger delay helper
    const stagger = (i: number) => ({ delay: i * 0.06 });

    return (
        <>
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            <div className="font-[family-name:var(--font-inter)] min-h-screen bg-slate-100 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 py-6 sm:py-10 px-4 pb-24">
                <div className="max-w-[740px] mx-auto flex flex-col gap-4 sm:gap-5">

                    {/* ── Header ── */}
                    <motion.header
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 bg-white dark:bg-[#0F1623] border border-slate-200 dark:border-[#1E2D45] rounded-2xl shadow-sm"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-slate-200 dark:border-[#1E2D45] flex items-center justify-center flex-shrink-0">
                                <QuantipixorIcon size={22} aria-label="Quantipixor" />
                            </div>
                            <div>
                                <div className="font-[family-name:var(--font-plus-jakarta)] text-[14px] sm:text-[15px] font-bold tracking-tight leading-tight">
                                    <span className="text-blue-600 dark:text-blue-400">Quanti</span>
                                    <span className="text-slate-900 dark:text-slate-100">pixor</span>
                                </div>
                                <div className="font-[family-name:var(--font-space-grotesk)] text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-widest uppercase mt-0.5">
                                    Image Resizer
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-br from-blue-500/8 to-purple-500/8 border border-slate-200 dark:border-[#1E2D45] font-[family-name:var(--font-space-grotesk)] text-[10px] sm:text-[11px] font-semibold text-indigo-500 dark:text-indigo-400 tracking-wide">
                            <Maximize2 size={11} />
                            <span className="hidden sm:inline">Batch · Lossless · Free</span>
                            <span className="sm:hidden">Free</span>
                        </div>
                    </motion.header>

                    {/* ── Hero ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...stagger(1), type: "spring", stiffness: 300, damping: 30 }}
                        className="px-1 pt-1 pb-0"
                    >
                        <h1 className="font-[family-name:var(--font-plus-jakarta)] text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight leading-tight text-slate-900 dark:text-slate-100 mb-2">
                            Resize images to{" "}
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                exact dimensions
                            </span>
                        </h1>
                        <p className="font-[family-name:var(--font-inter)] text-[13px] sm:text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-[500px]">
                            Upload any image, set your target size, and export. When aspect
                            ratios differ, images are centered with a black letterbox fill.
                        </p>
                    </motion.div>

                    {/* ── Upload ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...stagger(2), type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <DropZone onFiles={handleFiles} disabled={processing} />
                    </motion.div>

                    {/* ── Dimensions Panel ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...stagger(3), type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-white dark:bg-[#0F1623] border border-slate-200 dark:border-[#1E2D45] rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-sm"
                    >
                        <div className="flex items-center gap-2 font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
                            <Layers size={14} />
                            <span>Output Dimensions</span>
                        </div>

                        {/* Preset grid */}
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
                            {PRESETS.map((p, i) => (
                                <motion.div
                                    key={p.label}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.15 + i * 0.04, type: "spring", stiffness: 400, damping: 25 }}
                                >
                                    <PresetCard
                                        label={p.label}
                                        sub={p.sub}
                                        w={p.w}
                                        h={p.h}
                                        active={activePreset === p.label}
                                        onClick={(w, h) => applyPreset(w, h, p.label)}
                                    />
                                </motion.div>
                            ))}
                        </div>

                        {/* Dimension inputs row */}
                        <div className="flex items-end gap-2 sm:gap-2.5">
                            <DimensionInput
                                label="Width"
                                value={width}
                                onChange={handleWidthChange}
                                error={!widthValid}
                            />

                            {/* Lock button */}
                            <motion.button
                                onClick={toggleLock}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.92 }}
                                title={lockRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                                className={[
                                    "flex flex-col items-center gap-1 px-2.5 py-[11px] rounded-xl border cursor-pointer font-[family-name:var(--font-space-grotesk)] transition-all duration-150 flex-shrink-0",
                                    lockRatio
                                        ? "border-blue-500 dark:border-blue-600 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 shadow-sm"
                                        : "border-slate-200 dark:border-[#1E2D45] bg-slate-50 dark:bg-[#151E2E] text-slate-400 hover:border-blue-400 hover:text-blue-500",
                                ].join(" ")}
                            >
                                <motion.span
                                    animate={{ rotate: lockRatio ? 0 : 15 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                >
                                    {lockRatio ? <Lock size={14} /> : <Unlock size={14} />}
                                </motion.span>
                                <span className="text-[8px] font-bold tracking-widest uppercase leading-none">
                                    {lockRatio ? "Lock" : "Free"}
                                </span>
                            </motion.button>

                            <DimensionInput
                                label="Height"
                                value={height}
                                onChange={handleHeightChange}
                                error={!heightValid}
                            />
                        </div>

                        <AnimatePresence>
                            {(!widthValid || !heightValid) && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center gap-1.5 font-[family-name:var(--font-inter)] text-[12px] font-medium text-red-400 overflow-hidden"
                                >
                                    <AlertCircle size={13} />
                                    Dimensions must be between 1 and 8000 px.
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {/* Info note */}
                        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-indigo-100 dark:border-indigo-900/40 font-[family-name:var(--font-inter)] text-[12px] text-indigo-500 dark:text-indigo-400 leading-relaxed">
                            <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                            <span>
                                Images with a different aspect ratio will be letterboxed —
                                centered on a black background.
                            </span>
                        </div>
                    </motion.div>

                    {/* ── Queue ── */}
                    <AnimatePresence>
                        {items.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="flex flex-col gap-2.5"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-[family-name:var(--font-plus-jakarta)] text-[13px] font-bold text-slate-800 dark:text-slate-100">
                                            <AnimatedNumber value={items.length} /> image{items.length !== 1 ? "s" : ""}
                                        </span>
                                        <AnimatePresence>
                                            {doneCount > 0 && (
                                                <motion.span
                                                    initial={{ opacity: 0, scale: 0.7 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.7 }}
                                                    className="font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 px-2 py-0.5 rounded-full"
                                                >
                                                    {doneCount} done
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                        <AnimatePresence>
                                            {processing && (
                                                <motion.span
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 px-2 py-0.5 rounded-full"
                                                >
                                                    Processing…
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={clearAll}
                                        disabled={processing}
                                        className="flex items-center gap-1.5 font-[family-name:var(--font-inter)] text-[12px] font-semibold text-red-400 bg-transparent border-none cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 size={13} />
                                        Clear all
                                    </motion.button>
                                </div>

                                <AnimatePresence>
                                    {processing && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <ProgressBar
                                                done={doneCount}
                                                total={items.filter((i) => i.status !== "done").length + doneCount}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.div layout className="flex flex-col gap-1.5">
                                    <AnimatePresence initial={false}>
                                        {items.map((item) => (
                                            <ImageCard key={item.id} item={item} onRemove={removeItem} />
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Actions ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...stagger(4), type: "spring", stiffness: 300, damping: 30 }}
                        className="flex flex-col sm:flex-row gap-2.5"
                    >
                        <motion.button
                            onClick={handleResize}
                            disabled={!canResize}
                            whileHover={canResize ? { scale: 1.01, y: -1 } : {}}
                            whileTap={canResize ? { scale: 0.98 } : {}}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={[
                                "flex-1 py-3.5 sm:py-4 px-5 sm:px-6 rounded-xl border-none font-[family-name:var(--font-plus-jakarta)] text-[14px] sm:text-[15px] font-bold cursor-pointer flex items-center justify-center gap-2 tracking-tight transition-all duration-150",
                                canResize
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                                    : "bg-slate-200 dark:bg-[#1E2D45] text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none",
                            ].join(" ")}
                        >
                            {processing ? (
                                <>
                                    <motion.span
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    >
                                        <RefreshCw size={15} />
                                    </motion.span>
                                    Resizing images…
                                </>
                            ) : (
                                <>
                                    <ImageIcon size={15} />
                                    Resize{" "}
                                    {items.length > 0
                                        ? `${items.length} image${items.length !== 1 ? "s" : ""}`
                                        : "images"}
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </motion.button>

                        <AnimatePresence>
                            {doneCount > 1 && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.85, width: 0 }}
                                    animate={{ opacity: 1, scale: 1, width: "auto" }}
                                    exit={{ opacity: 0, scale: 0.85, width: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={downloadAll}
                                    className="sm:w-auto py-3.5 sm:py-4 px-4 sm:px-5 rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 font-[family-name:var(--font-plus-jakarta)] text-[13px] sm:text-[14px] font-bold cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-colors duration-150 overflow-hidden"
                                >
                                    <Download size={14} />
                                    Download all ({doneCount})
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* ── Empty hint ── */}
                    <AnimatePresence>
                        {items.length === 0 && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="font-[family-name:var(--font-inter)] text-center text-[13px] text-slate-400 dark:text-slate-500 py-3"
                            >
                                Upload images above, then set your target dimensions and hit Resize.
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {/* ── Footer ── */}
                    <motion.footer
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center justify-center gap-1.5 font-[family-name:var(--font-inter)] text-[11px] text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-200 dark:border-[#1E2D45]"
                    >
                        <QuantipixorIcon size={13} />
                        <span>
                            Quantipixor · All processing happens in your browser — no uploads to any server.
                        </span>
                    </motion.footer>
                </div>
            </div>
        </>
    );
}