"use client";

// ---------------------------------------------------------------------------
// Primitive — matches ImageResizerPage's bg-slate-* / white/* color tokens
// ---------------------------------------------------------------------------
function Sk({
    className = "",
    style,
}: {
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <div
            className={`animate-pulse bg-slate-200/70 dark:bg-white/[0.07] ${className}`}
            style={style}
        />
    );
}

// ---------------------------------------------------------------------------
// GlassPanel shell — mirrors the real GlassPanel backdrop styles
// ---------------------------------------------------------------------------
function GlassPanelShell({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`relative rounded-3xl border border-white/70 dark:border-white/8
        bg-white/60 dark:bg-white/4
        shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]
        dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]
        overflow-hidden backdrop-blur-xl ${className}`}
        >
            {children}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Single preset card skeleton
// ---------------------------------------------------------------------------
function PresetCardSk() {
    return (
        <div className="px-2 py-2.5 rounded-2xl border border-slate-200/60 dark:border-white/[0.07] bg-white/50 dark:bg-white/3 backdrop-blur-md flex flex-col items-center gap-1">
            <Sk className="h-3 w-10 rounded-full" />
            <Sk className="h-2 w-14 rounded-full" />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Single image-queue row skeleton
// ---------------------------------------------------------------------------
function ImageRowSk({ index }: { index: number }) {
    return (
        <div
            className="flex items-center gap-3 px-3.5 py-3 rounded-2xl border border-slate-200/60 dark:border-white/[0.07] bg-white/60 dark:bg-white/4 backdrop-blur-xl shadow-[0_2px_12px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]"
            style={{ animationDelay: `${index * 40}ms` }}
        >
            {/* Thumbnail */}
            <Sk className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl shrink-0" />

            {/* Name + dimensions */}
            <div className="flex-1 min-w-0 space-y-1.5">
                <Sk className="h-3 rounded-full w-3/5" />
                <Sk className="h-2.5 rounded-full w-2/5" />
            </div>

            {/* Status badge */}
            <Sk className="hidden sm:block h-5 w-12 rounded-full shrink-0" />

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
                <Sk className="w-8 h-8 rounded-xl" />
                <Sk className="w-8 h-8 rounded-xl" />
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Full ImageResizer loading skeleton
// ---------------------------------------------------------------------------
export default function ImageResizerSkeleton({ queueCount = 3 }: { queueCount?: number }) {
    const PRESET_COUNT = 7;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#06080f] py-6 sm:py-12 px-4">
            <div className="relative max-w-185 mx-auto flex flex-col gap-4 sm:gap-5">

                {/* ── Navbar / header panel ── */}
                <GlassPanelShell className="px-4 sm:px-5 py-3.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Logo bubble */}
                            <Sk className="w-10 h-10 rounded-2xl shrink-0" />
                            <div className="space-y-1.5">
                                <Sk className="h-3.5 w-24 rounded-full" />
                                <Sk className="h-2 w-20 rounded-full" />
                            </div>
                        </div>
                        {/* Badge */}
                        <Sk className="h-7 w-28 rounded-full" />
                    </div>
                </GlassPanelShell>

                {/* ── Hero text ── */}
                <div className="px-1 space-y-2.5">
                    <Sk className="h-8 w-3/4 rounded-xl" />
                    <Sk className="h-3.5 rounded-full w-full max-w-120" />
                    <Sk className="h-3.5 rounded-full w-4/5 max-w-95" />
                </div>

                {/* ── Drop zone ── */}
                <div className="relative rounded-3xl border-2 border-dashed border-slate-300/60 dark:border-white/10 bg-white/40 dark:bg-white/2 backdrop-blur-xl p-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)]">
                    {/* Icon bubble */}
                    <Sk className="mx-auto mb-5 w-16 h-16 rounded-2xl" />
                    {/* Button */}
                    <Sk className="mx-auto h-12 w-40 rounded-2xl" />
                    {/* Hint text */}
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        <Sk className="h-3 w-24 rounded-full" />
                        <Sk className="h-3 w-2 rounded-full" />
                        <Sk className="h-3 w-28 rounded-full" />
                        <Sk className="h-3 w-2 rounded-full" />
                        <Sk className="h-3 w-32 rounded-full" />
                    </div>
                </div>

                {/* ── Dimensions panel ── */}
                <GlassPanelShell className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4">
                        {/* Section label */}
                        <div className="flex items-center gap-2">
                            <Sk className="w-3.5 h-3.5 rounded-sm" />
                            <Sk className="h-2.5 w-36 rounded-full" />
                        </div>

                        {/* Preset cards grid */}
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                            {Array.from({ length: PRESET_COUNT }).map((_, i) => (
                                <PresetCardSk key={i} />
                            ))}
                        </div>

                        {/* Dimension inputs row */}
                        <div className="flex items-end gap-2 sm:gap-3">
                            {/* Width input */}
                            <div className="flex-1 min-w-0">
                                <Sk className="h-2 w-12 rounded-full mb-2" />
                                <Sk className="h-12 w-full rounded-2xl" />
                            </div>

                            {/* Lock button */}
                            <div className="flex flex-col items-center gap-1 px-3 py-3 rounded-2xl border border-slate-200/60 dark:border-white/8 bg-white/50 dark:bg-white/3 backdrop-blur-xl shrink-0">
                                <Sk className="w-3.5 h-3.5 rounded-sm" />
                                <Sk className="h-2 w-6 rounded-full" />
                            </div>

                            {/* Height input */}
                            <div className="flex-1 min-w-0">
                                <Sk className="h-2 w-12 rounded-full mb-2" />
                                <Sk className="h-12 w-full rounded-2xl" />
                            </div>
                        </div>

                        {/* Info callout */}
                        <Sk className="h-12 w-full rounded-2xl" />
                    </div>
                </GlassPanelShell>

                {/* ── Image queue ── */}
                <div className="flex flex-col gap-2.5">
                    {/* Queue header */}
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <Sk className="h-3.5 w-20 rounded-full" />
                            <Sk className="h-5 w-14 rounded-full" />
                        </div>
                        <Sk className="h-8 w-20 rounded-xl" />
                    </div>

                    {/* Progress bar */}
                    <Sk className="h-1.5 w-full rounded-full" />

                    {/* Image rows */}
                    <div className="flex flex-col gap-2">
                        {Array.from({ length: queueCount }).map((_, i) => (
                            <ImageRowSk key={i} index={i} />
                        ))}
                    </div>
                </div>

                {/* ── Actions ── */}
                <div className="flex flex-col sm:flex-row gap-2.5">
                    {/* Resize button */}
                    <Sk className="flex-1 h-14 rounded-2xl" />
                    {/* Download all (optional) */}
                    <Sk className="h-14 w-40 rounded-2xl" />
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-center gap-2 pt-5 border-t border-slate-200/60 dark:border-white/6">
                    <Sk className="h-3 w-64 rounded-full" />
                </div>
            </div>
        </div>
    );
}