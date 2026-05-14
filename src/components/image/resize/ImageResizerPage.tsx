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
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Font variables (paths resolved externally) ───────────────────────────────
// --font-plus-jakarta, --font-jetbrains-mono, --font-inter, --font-space-grotesk

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

const toastConfig: Record<
    ToastType,
    {
        icon: React.ReactNode;
        bg: string;
        border: string;
        text: string;
        iconColor: string;
        glow: string;
    }
> = {
    success: {
        icon: <CheckCheck size={14} />,
        bg: "bg-emerald-950/80",
        border: "border-emerald-500/30",
        text: "text-emerald-100",
        iconColor: "text-emerald-400",
        glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    },
    error: {
        icon: <AlertTriangle size={14} />,
        bg: "bg-red-950/80",
        border: "border-red-500/30",
        text: "text-red-100",
        iconColor: "text-red-400",
        glow: "shadow-[0_0_20px_rgba(239,68,68,0.15)]",
    },
    info: {
        icon: <Info size={14} />,
        bg: "bg-[#0a0e1a]/80",
        border: "border-[#1856FF]/30",
        text: "text-slate-100",
        iconColor: "text-[#1856FF]",
        glow: "shadow-[0_0_20px_rgba(24,86,255,0.15)]",
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
                            initial={{ opacity: 0, y: 24, scale: 0.88 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 48, scale: 0.88 }}
                            transition={{ type: "spring", stiffness: 420, damping: 32 }}
                            className={cn(
                                "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl cursor-pointer max-w-[320px]",
                                cfg.bg,
                                cfg.border,
                                cfg.text,
                                cfg.glow
                            )}
                            onClick={() => onRemove(toast.id)}
                        >
                            <span className={cn("flex-shrink-0", cfg.iconColor)}>{cfg.icon}</span>
                            <span
                                className="font-[family-name:var(--font-inter)] text-[13px] font-medium leading-snug"
                            >
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

function QuantipixorIcon({ className = "h-6 w-6", size = 24 }: { className?: string; size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
            className={className}
        >
            <path
                d="M12 2.5C6.753 2.5 2.5 6.753 2.5 12C2.5 17.247 6.753 21.5 12 21.5C16.184 21.5 19.747 18.827 20.914 15.05"
                stroke="url(#qG1)"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
            />
            <path d="M19 18.5L22 21.5" stroke="url(#qG1)" strokeWidth="2.5" strokeLinecap="round" />
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
            img.onload = () => resolve({ img, url, width: img.naturalWidth, height: img.naturalHeight });
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

    canvasToBlob(canvas: HTMLCanvasElement, mimeType = "image/png", quality = 0.92): Promise<Blob> {
        return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob!), mimeType, quality));
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
    useEffect(() => { spring.set(value); }, [value, spring]);
    return <motion.span>{display}</motion.span>;
}

// ─── Glass Panel ──────────────────────────────────────────────────────────────

function GlassPanel({
    children,
    className,
    luminous,
}: {
    children: React.ReactNode;
    className?: string;
    luminous?: boolean;
}) {
    return (
        <div
            className={cn(
                "relative rounded-3xl border backdrop-blur-xl overflow-hidden",
                // Light mode
                "bg-white/60 border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]",
                // Dark mode
                "dark:bg-white/[0.04] dark:border-white/[0.08] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]",
                luminous && "dark:shadow-[0_8px_40px_rgba(24,86,255,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]",
                className
            )}
        >
            {/* Inner gloss shine */}
            <div
                className="pointer-events-none absolute inset-0 rounded-3xl"
                style={{
                    background:
                        "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 50%, rgba(255,255,255,0.04) 100%)",
                }}
            />
            {children}
        </div>
    );
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
            const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
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
                "relative rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300 overflow-hidden",
                dragging
                    ? [
                        "border-[#1856FF]/60",
                        "bg-[#1856FF]/5 dark:bg-[#1856FF]/10",
                        "shadow-[0_0_0_4px_rgba(24,86,255,0.1),inset_0_0_60px_rgba(24,86,255,0.06)]",
                    ].join(" ")
                    : [
                        "border-slate-300/60 dark:border-white/10",
                        "bg-white/40 dark:bg-white/[0.02]",
                        "backdrop-blur-xl",
                        "shadow-[0_4px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)]",
                    ].join(" "),
                disabled ? "opacity-50 cursor-not-allowed" : "hover:border-[#1856FF]/40 dark:hover:border-[#1856FF]/30"
            )}
        >
            {/* Ambient glow orb */}
            <div
                className={cn(
                    "absolute inset-0 pointer-events-none transition-opacity duration-500",
                    dragging ? "opacity-100" : "opacity-0"
                )}
                style={{
                    background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(24,86,255,0.08), transparent)",
                }}
            />

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

            <motion.div
                animate={dragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative"
            >
                {/* Icon with glass bubble */}
                <div className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center relative">
                    <div
                        className="absolute inset-0 rounded-2xl border border-white/60 dark:border-white/10"
                        style={{
                            background: "linear-gradient(135deg, rgba(24,86,255,0.12), rgba(147,51,234,0.08))",
                            backdropFilter: "blur(12px)",
                            boxShadow: "0 8px 32px rgba(24,86,255,0.2), inset 0 1px 0 rgba(255,255,255,0.5)",
                        }}
                    />
                    <CloudUpload className="relative z-10 text-[#1856FF]" size={28} strokeWidth={1.5} aria-hidden />
                </div>

                <label htmlFor={inputId} className={cn("block", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
                    <span
                        className="inline-flex items-center gap-2 rounded-2xl px-7 py-3 text-sm font-bold text-white cursor-pointer select-none"
                        style={{
                            background: "linear-gradient(135deg, #1856FF 0%, #7C3AED 100%)",
                            boxShadow: "0 4px 24px rgba(24,86,255,0.4), 0 1px 0 rgba(255,255,255,0.2) inset",
                        }}
                    >
                        <Sparkles size={14} />
                        Choose images
                    </span>
                </label>

                <p className="mt-4 font-[family-name:var(--font-inter)] text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Drag and drop or browse
                    <span className="mx-2 text-slate-300 dark:text-white/20">·</span>
                    PNG, JPG, WebP, GIF
                    <span className="mx-2 text-slate-300 dark:text-white/20">·</span>
                    Max 8000 × 8000 px
                </p>
            </motion.div>
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
            <label className="block font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold tracking-widest uppercase mb-1.5 text-slate-500 dark:text-slate-500">
                {label}
            </label>
            <motion.div
                animate={{
                    boxShadow: focused
                        ? "0 0 0 3px rgba(24,86,255,0.15), 0 0 20px rgba(24,86,255,0.1)"
                        : error
                            ? "0 0 0 3px rgba(234,33,67,0.15)"
                            : "0 0 0 0px transparent",
                }}
                className={cn(
                    "flex items-center rounded-2xl overflow-hidden border backdrop-blur-xl transition-colors duration-150",
                    // Light
                    "bg-white/70 border-slate-200/80",
                    // Dark
                    "dark:bg-white/[0.05] dark:border-white/[0.1]",
                    focused
                        ? "border-[#1856FF]/60 dark:border-[#1856FF]/40"
                        : error
                            ? "border-[#EA2143]/50"
                            : "hover:border-slate-300 dark:hover:border-white/20"
                )}
            >
                <input
                    type="number"
                    min={1}
                    max={8000}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="font-[family-name:var(--font-jetbrains-mono)] flex-1 border-none outline-none bg-transparent text-slate-900 dark:text-white text-lg font-semibold px-4 py-3 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:opacity-30 [&::-webkit-inner-spin-button]:opacity-30"
                />
                <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold text-slate-400 dark:text-slate-500 pr-3.5 tracking-wide">
                    px
                </span>
            </motion.div>
        </div>
    );
}

// ─── PresetCard ───────────────────────────────────────────────────────────────

function PresetCard({
    label,
    sub,
    w,
    h,
    onClick,
    active,
}: {
    label: string;
    sub: string;
    w: number;
    h: number;
    onClick: (w: number, h: number) => void;
    active: boolean;
}) {
    return (
        <motion.button
            onClick={() => onClick(w, h)}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
                "px-2 py-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 cursor-pointer w-full transition-all duration-200",
                active
                    ? [
                        "border-[#1856FF]/40 dark:border-[#1856FF]/30",
                        "shadow-[0_0_20px_rgba(24,86,255,0.15),inset_0_1px_0_rgba(255,255,255,0.5)]",
                        "dark:shadow-[0_0_20px_rgba(24,86,255,0.2),inset_0_1px_0_rgba(255,255,255,0.06)]",
                    ].join(" ")
                    : [
                        "border-slate-200/60 dark:border-white/[0.07]",
                        "bg-white/50 dark:bg-white/[0.03]",
                        "backdrop-blur-md",
                        "hover:border-[#1856FF]/30 dark:hover:border-[#1856FF]/20",
                        "hover:bg-white/70 dark:hover:bg-white/[0.06]",
                    ].join(" ")
            )}
            style={
                active
                    ? {
                        background:
                            "linear-gradient(135deg, rgba(24,86,255,0.12) 0%, rgba(147,51,234,0.08) 100%)",
                        backdropFilter: "blur(16px)",
                    }
                    : {}
            }
        >
            <span
                className={cn(
                    "font-[family-name:var(--font-plus-jakarta)] text-[10px] sm:text-[11px] font-bold block leading-tight",
                    active
                        ? "bg-gradient-to-r from-[#1856FF] to-[#9333EA] bg-clip-text text-transparent"
                        : "text-slate-700 dark:text-slate-200"
                )}
            >
                {label}
            </span>
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-500 font-medium block">
                {sub}
            </span>
        </motion.button>
    );
}

// ─── Image Card ───────────────────────────────────────────────────────────────

const statusConfig: Record<
    ImageStatus,
    {
        label: string;
        badgeCls: string;
        borderStyle: React.CSSProperties;
        borderClass: string;
        glowClass: string;
    }
> = {
    idle: {
        label: "Ready",
        badgeCls: "text-slate-400 dark:text-slate-500 border-slate-200/60 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.04]",
        borderClass: "border-slate-200/60 dark:border-white/[0.07]",
        borderStyle: {},
        glowClass: "",
    },
    processing: {
        label: "Resizing…",
        badgeCls: "text-amber-500 border-amber-400/30 bg-amber-50/80 dark:bg-amber-900/20",
        borderClass: "border-amber-300/40 dark:border-amber-500/20",
        borderStyle: {},
        glowClass: "shadow-[0_0_20px_rgba(245,158,11,0.08)]",
    },
    done: {
        label: "Done",
        badgeCls: "text-emerald-600 dark:text-emerald-400 border-emerald-400/30 bg-emerald-50/80 dark:bg-emerald-900/20",
        borderClass: "border-emerald-300/50 dark:border-emerald-500/20",
        borderStyle: {},
        glowClass: "shadow-[0_0_20px_rgba(16,185,129,0.08)]",
    },
    error: {
        label: "Failed",
        badgeCls: "text-[#EA2143] border-red-400/30 bg-red-50/80 dark:bg-red-900/10",
        borderClass: "border-red-300/40 dark:border-red-500/20",
        borderStyle: {},
        glowClass: "shadow-[0_0_20px_rgba(234,33,67,0.08)]",
    },
};

function ImageCard({ item, onRemove }: { item: ImageItem; onRemove: (id: string) => void }) {
    const s = statusConfig[item.status];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
                "flex items-center gap-3 px-3.5 py-3 rounded-2xl border backdrop-blur-xl transition-all duration-200",
                "bg-white/60 dark:bg-white/[0.04]",
                "shadow-[0_2px_12px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]",
                s.borderClass,
                s.glowClass
            )}
        >
            {/* Thumbnail */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden flex-shrink-0 bg-black relative flex items-center justify-center border border-white/20">
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
                            className="absolute inset-0 bg-black/60 flex items-center justify-center text-white backdrop-blur-sm"
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
                            className="absolute inset-0 bg-emerald-500/75 backdrop-blur-sm flex items-center justify-center text-white"
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
                            <span className="text-[#1856FF] mx-1">→</span>
                            {item.targetW}×{item.targetH}
                        </>
                    )}
                    <span className="mx-1.5 text-slate-300 dark:text-white/10">·</span>
                    {helpers.formatBytes(item.file.size)}
                </p>
            </div>

            {/* Badge */}
            <span
                className={cn(
                    "hidden sm:inline-flex font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide border flex-shrink-0",
                    s.badgeCls
                )}
            >
                {s.label}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
                <AnimatePresence>
                    {item.status === "done" && item.resultBlob && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.92 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            className={cn(
                                "w-8 h-8 flex items-center justify-center rounded-xl border cursor-pointer backdrop-blur-xl transition-all duration-150",
                                "text-emerald-600 dark:text-emerald-400",
                                "border-emerald-300/50 dark:border-emerald-500/20",
                                "bg-emerald-50/80 dark:bg-emerald-900/20",
                                "hover:bg-emerald-100 dark:hover:bg-emerald-900/30",
                                "shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                            )}
                            onClick={() =>
                                helpers.downloadBlob(
                                    item.resultBlob!,
                                    helpers.getOutputFilename(item.file.name, item.targetW!, item.targetH!)
                                )
                            }
                            title="Download resized image"
                        >
                            <Download size={13} />
                        </motion.button>
                    )}
                </AnimatePresence>
                {item.status !== "processing" && (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-xl border cursor-pointer backdrop-blur-xl transition-all duration-150",
                            "text-slate-400 dark:text-slate-500",
                            "border-slate-200/60 dark:border-white/[0.08]",
                            "bg-white/50 dark:bg-white/[0.03]",
                            "hover:text-[#EA2143] hover:border-red-300/50 dark:hover:border-red-500/20 hover:bg-red-50/80 dark:hover:bg-red-900/10",
                            "hover:shadow-[0_0_12px_rgba(234,33,67,0.12)]"
                        )}
                        onClick={() => onRemove(item.id)}
                        title="Remove"
                    >
                        <X size={13} />
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ done, total }: { done: number; total: number }) {
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return (
        <div className="flex items-center gap-3">
            <div
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{
                    background: "rgba(148,163,184,0.15)",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                }}
            >
                <motion.div
                    className="h-full rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{
                        background: "linear-gradient(90deg, #1856FF, #9333EA)",
                        boxShadow: "0 0 8px rgba(24,86,255,0.4)",
                    }}
                />
            </div>
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-semibold text-[#1856FF] dark:text-blue-400 min-w-[34px] text-right">
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

    const handleFiles = useCallback(
        async (files: File[]) => {
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
                            status: "idle",
                            resultBlob: null,
                            targetW: null,
                            targetH: null,
                        };
                    } catch {
                        return null;
                    }
                })
            );
            const valid = newItems.filter((i): i is ImageItem => i !== null);
            setItems((prev) => [...prev, ...valid]);
            if (valid.length > 0) {
                addToast("info", `${valid.length} image${valid.length !== 1 ? "s" : ""} added`);
            }
        },
        [addToast]
    );

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
                prev.map((i) => (i.id === item.id ? { ...i, status: "processing" } : i))
            );
            try {
                const { img } = await helpers.loadImageFromFile(item.file);
                const canvas = helpers.resizeOnCanvas(img, targetW, targetH, item.originalW, item.originalH);
                const blob = await helpers.canvasToBlob(canvas);
                setItems((prev) =>
                    prev.map((i) =>
                        i.id === item.id ? { ...i, status: "done", resultBlob: blob, targetW, targetH } : i
                    )
                );
                successCount++;
            } catch {
                setItems((prev) =>
                    prev.map((i) => (i.id === item.id ? { ...i, status: "error" } : i))
                );
                errorCount++;
            }
        }

        setProcessing(false);
        if (successCount > 0)
            addToast("success", `${successCount} image${successCount !== 1 ? "s" : ""} resized to ${targetW}×${targetH}`);
        if (errorCount > 0)
            addToast("error", `${errorCount} image${errorCount !== 1 ? "s" : ""} failed to resize`);
    };

    const downloadAll = () => {
        const eligible = items.filter((i) => i.status === "done" && i.resultBlob);
        eligible.forEach((item) =>
            helpers.downloadBlob(item.resultBlob!, helpers.getOutputFilename(item.file.name, item.targetW!, item.targetH!))
        );
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

    const stagger = (i: number) => ({ delay: i * 0.07 });

    return (
        <>
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {/* ── Page background ── */}
            <div className="font-[family-name:var(--font-inter)] min-h-screen relative overflow-hidden text-slate-900 dark:text-slate-100 py-6 sm:py-12 px-4 pb-24">
                {/* Background gradient mesh */}
                <div
                    className="fixed inset-0 pointer-events-none"
                    style={{
                        background: [
                            "radial-gradient(ellipse 80% 50% at 20% 20%, rgba(24,86,255,0.08) 0%, transparent 60%)",
                            "radial-gradient(ellipse 60% 40% at 80% 80%, rgba(147,51,234,0.06) 0%, transparent 60%)",
                            "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 70%)",
                        ].join(", "),
                    }}
                />
                <div className="fixed inset-0 pointer-events-none bg-slate-50 dark:bg-[#06080f]" style={{ zIndex: -1 }} />

                <div className="relative max-w-[740px] mx-auto flex flex-col gap-4 sm:gap-5">

                    {/* ── Header ── */}
                    <motion.header
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <GlassPanel className="px-4 sm:px-5 py-3.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Logo glass bubble */}
                                    <div
                                        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/60 dark:border-white/10"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(24,86,255,0.12), rgba(147,51,234,0.08))",
                                            backdropFilter: "blur(8px)",
                                            boxShadow: "0 4px 16px rgba(24,86,255,0.15), inset 0 1px 0 rgba(255,255,255,0.5)",
                                        }}
                                    >
                                        <QuantipixorIcon size={22} />
                                    </div>
                                    <div>
                                        <div className="font-[family-name:var(--font-plus-jakarta)] text-[14px] sm:text-[15px] font-extrabold tracking-tight leading-tight">
                                            <span className="bg-gradient-to-r from-[#1856FF] to-[#7C3AED] bg-clip-text text-transparent">Quanti</span>
                                            <span className="text-slate-900 dark:text-slate-100">pixor</span>
                                        </div>
                                        <div className="font-[family-name:var(--font-space-grotesk)] text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-widest uppercase mt-0.5">
                                            Image Resizer
                                        </div>
                                    </div>
                                </div>

                                {/* Badge */}
                                <div
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#1856FF]/20 dark:border-[#1856FF]/20 font-[family-name:var(--font-space-grotesk)] text-[10px] sm:text-[11px] font-bold text-[#1856FF] dark:text-blue-400 tracking-wide"
                                    style={{
                                        background: "linear-gradient(135deg, rgba(24,86,255,0.08), rgba(147,51,234,0.05))",
                                        backdropFilter: "blur(8px)",
                                    }}
                                >
                                    <Maximize2 size={10} />
                                    <span className="hidden sm:inline">Batch · Lossless · Free</span>
                                    <span className="sm:hidden">Free</span>
                                </div>
                            </div>
                        </GlassPanel>
                    </motion.header>

                    {/* ── Hero ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...stagger(1), type: "spring", stiffness: 300, damping: 30 }}
                        className="px-1"
                    >
                        <h1 className="font-[family-name:var(--font-plus-jakarta)] text-2xl sm:text-[30px] lg:text-[34px] font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white mb-2.5">
                            Resize images to{" "}
                            <span
                                className="bg-clip-text text-transparent"
                                style={{ backgroundImage: "linear-gradient(135deg, #1856FF 0%, #9333EA 100%)" }}
                            >
                                exact dimensions
                            </span>
                        </h1>
                        <p className="font-[family-name:var(--font-inter)] text-[13px] sm:text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-[520px]">
                            Upload any image, set your target size, and export. When aspect ratios differ,
                            images are centered with a black letterbox fill.
                        </p>
                    </motion.div>

                    {/* ── Upload ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...stagger(2), type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <DropZone onFiles={handleFiles} disabled={processing} />
                    </motion.div>

                    {/* ── Dimensions Panel ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...stagger(3), type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <GlassPanel className="p-4 sm:p-6" luminous>
                            <div className="flex flex-col gap-4">
                                {/* Section label */}
                                <div className="flex items-center gap-2 font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
                                    <Layers size={13} />
                                    Output Dimensions
                                </div>

                                {/* Presets */}
                                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                                    {PRESETS.map((p, i) => (
                                        <motion.div
                                            key={p.label}
                                            initial={{ opacity: 0, scale: 0.88 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.18 + i * 0.04, type: "spring", stiffness: 400, damping: 25 }}
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

                                {/* Dimension inputs */}
                                <div className="flex items-end gap-2 sm:gap-3">
                                    <DimensionInput label="Width" value={width} onChange={handleWidthChange} error={!widthValid} />
                                    
                                    {/* Lock button */}
                                    <motion.button
                                        onClick={toggleLock}
                                        whileHover={{ scale: 1.06 }}
                                        whileTap={{ scale: 0.9 }}
                                        title={lockRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                                        className={cn(
                                            "flex flex-col items-center gap-1 px-3 py-[12px] rounded-2xl border cursor-pointer font-[family-name:var(--font-space-grotesk)] transition-all duration-200 flex-shrink-0 backdrop-blur-xl",
                                            lockRatio
                                                ? "text-[#1856FF]"
                                                : [
                                                    "border-slate-200/60 dark:border-white/[0.08]",
                                                    "bg-white/50 dark:bg-white/[0.03]",
                                                    "text-slate-400 dark:text-slate-500",
                                                    "hover:border-[#1856FF]/30 hover:text-[#1856FF]",
                                                ].join(" ")
                                        )}
                                        style={
                                            lockRatio
                                                ? {
                                                    background: "linear-gradient(135deg, rgba(24,86,255,0.15), rgba(147,51,234,0.1))",
                                                    borderColor: "rgba(24,86,255,0.35)",
                                                    boxShadow: "0 0 20px rgba(24,86,255,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
                                                }
                                                : {}
                                        }
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

                                    <DimensionInput label="Height" value={height} onChange={handleHeightChange} error={!heightValid} />
                                </div>

                                {/* Validation error */}
                                <AnimatePresence>
                                    {(!widthValid || !heightValid) && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex items-center gap-1.5 font-[family-name:var(--font-inter)] text-[12px] font-medium text-[#EA2143] overflow-hidden"
                                        >
                                            <AlertCircle size={13} />
                                            Dimensions must be between 1 and 8000 px.
                                        </motion.p>
                                    )}
                                </AnimatePresence>

                                {/* Info note */}
                                <div
                                    className="flex items-start gap-2.5 px-3.5 py-3 rounded-2xl border border-[#1856FF]/15 dark:border-[#1856FF]/10 font-[family-name:var(--font-inter)] text-[12px] text-[#1856FF] dark:text-blue-400 leading-relaxed"
                                    style={{
                                        background: "linear-gradient(135deg, rgba(24,86,255,0.06), rgba(147,51,234,0.04))",
                                        backdropFilter: "blur(8px)",
                                    }}
                                >
                                    <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                                    <span>
                                        Images with a different aspect ratio will be letterboxed — centered on a black background.
                                    </span>
                                </div>
                            </div>
                        </GlassPanel>
                    </motion.div>

                    {/* ── Queue ── */}
                    <AnimatePresence>
                        {items.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="flex flex-col gap-2.5"
                            >
                                {/* Queue header */}
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-[family-name:var(--font-plus-jakarta)] text-[13px] font-bold text-slate-800 dark:text-slate-100">
                                            <AnimatedNumber value={items.length} /> image{items.length !== 1 ? "s" : ""}
                                        </span>
                                        <AnimatePresence>
                                            {doneCount > 0 && (
                                                <motion.span
                                                    initial={{ opacity: 0, scale: 0.6 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.6 }}
                                                    className="font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-300/50 dark:border-emerald-500/20 px-2 py-0.5 rounded-full"
                                                    style={{ background: "rgba(16,185,129,0.08)" }}
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
                                                    className="font-[family-name:var(--font-space-grotesk)] text-[10px] font-bold text-amber-500 border border-amber-400/30 px-2 py-0.5 rounded-full"
                                                    style={{ background: "rgba(245,158,11,0.08)" }}
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
                                        className="flex items-center gap-1.5 font-[family-name:var(--font-inter)] text-[12px] font-semibold text-[#EA2143]/70 hover:text-[#EA2143] bg-transparent border-none cursor-pointer px-2.5 py-1.5 rounded-xl hover:bg-red-50/80 dark:hover:bg-red-900/10 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 size={13} />
                                        Clear all
                                    </motion.button>
                                </div>

                                {/* Progress */}
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

                                {/* Image list */}
                                <motion.div layout className="flex flex-col gap-2">
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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...stagger(4), type: "spring", stiffness: 300, damping: 30 }}
                        className="flex flex-col sm:flex-row gap-2.5"
                    >
                        {/* Resize button */}
                        <motion.button
                            onClick={handleResize}
                            disabled={!canResize}
                            whileHover={canResize ? { scale: 1.01, y: -1 } : {}}
                            whileTap={canResize ? { scale: 0.98 } : {}}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={cn(
                                "flex-1 py-4 px-6 rounded-2xl font-[family-name:var(--font-plus-jakarta)] text-[14px] sm:text-[15px] font-bold cursor-pointer flex items-center justify-center gap-2 tracking-tight transition-all duration-150 border-none"
                            )}
                            style={
                                canResize
                                    ? {
                                        background: "linear-gradient(135deg, #1856FF 0%, #7C3AED 100%)",
                                        boxShadow: "0 8px 32px rgba(24,86,255,0.35), 0 1px 0 rgba(255,255,255,0.2) inset",
                                        color: "white",
                                    }
                                    : {
                                        background: "rgba(148,163,184,0.12)",
                                        backdropFilter: "blur(8px)",
                                        border: "1px solid rgba(148,163,184,0.2)",
                                        color: "rgba(148,163,184,0.5)",
                                        cursor: "not-allowed",
                                    }
                            }
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

                        {/* Download all */}
                        <AnimatePresence>
                            {doneCount > 1 && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.82, width: 0 }}
                                    animate={{ opacity: 1, scale: 1, width: "auto" }}
                                    exit={{ opacity: 0, scale: 0.82, width: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={downloadAll}
                                    className="py-4 px-5 rounded-2xl font-[family-name:var(--font-plus-jakarta)] text-[13px] sm:text-[14px] font-bold cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden border backdrop-blur-xl transition-all duration-150"
                                    style={{
                                        background: "rgba(16,185,129,0.08)",
                                        borderColor: "rgba(16,185,129,0.3)",
                                        color: "#10b981",
                                        boxShadow: "0 4px 16px rgba(16,185,129,0.12), inset 0 1px 0 rgba(255,255,255,0.1)",
                                    }}
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
                                className="font-[family-name:var(--font-inter)] text-center text-[13px] text-slate-400 dark:text-slate-500 py-2"
                            >
                                Upload images above, then set your target dimensions and hit Resize.
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {/* ── Footer ── */}
                    <motion.footer
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center justify-center gap-2 font-[family-name:var(--font-inter)] text-[11px] text-slate-400 dark:text-slate-500 pt-5 border-t border-slate-200/60 dark:border-white/[0.06]"
                    >
                        <QuantipixorIcon size={13} />
                        <span>Quantipixor · All processing happens in your browser — no uploads to any server.</span>
                    </motion.footer>
                </div>
            </div>
        </>
    );
}