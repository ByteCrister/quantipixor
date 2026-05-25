"use client";

// Matches BatchCompressor's Card / #1856FF / #3A344E / #07CA6B token palette
function Sk({
    className = "",
    style,
}: {
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <div
            className={`animate-pulse bg-black/[0.07] dark:bg-white/8 ${className}`}
            style={style}
        />
    );
}

// StatCard shell — matches the real StatCard layout from loadImage.tsx
function StatCardSk({ accent }: { accent?: boolean }) {
    return (
        <div
            className={`rounded-2xl border bg-white dark:bg-white/4 p-5 shadow-sm
        ${accent
                    ? "border-[#07CA6B]/25 ring-1 ring-[#07CA6B]/10"
                    : "border-black/6 dark:border-white/10"
                }`}
        >
            <div className="flex gap-4">
                <Sk
                    className={`w-12 h-12 shrink-0 rounded-2xl ${accent ? "bg-[#07CA6B]/10" : "bg-[#1856FF]/10"}`}
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                    <Sk className="h-2.5 w-20 rounded-full" />
                    <Sk className="h-6 w-16 rounded-lg" />
                    <Sk className="h-2.5 w-28 rounded-full" />
                </div>
            </div>
        </div>
    );
}

// Single image grid card skeleton
function ImageCardSk({ index }: { index: number }) {
    return (
        <div
            className="rounded-2xl border border-black/6 dark:border-white/10 bg-white dark:bg-white/4 overflow-hidden shadow-sm"
            style={{ animationDelay: `${index * 30}ms` }}
        >
            <div className="p-3">
                {/* Thumbnail */}
                <Sk className="w-full aspect-square rounded-xl mb-2" />
                {/* Filename */}
                <Sk className="h-2.5 w-3/4 rounded-full mb-1.5" />
                {/* Size */}
                <Sk className="h-2.5 w-1/2 rounded-full mb-1.5" />
                {/* Status */}
                <Sk className="h-2.5 w-14 rounded-full" />
            </div>
        </div>
    );
}

export default function BatchCompressorSkeleton({
    gridCount = 8,
}: {
    /** How many image cards to render in the grid */
    gridCount?: number;
}) {
    return (
        <>
            <section className="relative w-full overflow-x-clip">
                {/* Ambient blobs */}
                <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/3 rounded-full bg-[#1856FF]/10 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-32 h-56 w-56 translate-x-1/4 rounded-full bg-[#3A344E]/15 blur-3xl" />

                <div className="relative mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">

                    {/* ── Page header ── */}
                    <div className="relative mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="space-y-3">
                            <Sk className="h-5 w-24 rounded-full" />
                            <Sk className="h-9 w-64 rounded-xl" />
                            <Sk className="h-3.5 w-72 rounded-full" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Sk className="h-5 w-16 rounded-full" />
                            <Sk className="h-5 w-24 rounded-full" />
                            <Sk className="h-5 w-20 rounded-full" />
                            <Sk className="h-5 w-16 rounded-full" />
                        </div>
                    </div>

                    {/* ── Stats dashboard ── */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCardSk />
                        <StatCardSk />
                        <StatCardSk />
                        <StatCardSk accent />
                    </div>

                    {/* ── Compression progress card ── */}
                    <div className="mb-6 rounded-2xl border border-[#1856FF]/25 bg-[#1856FF]/4 dark:border-[#1856FF]/30 p-4 shadow-sm space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Sk className="w-4 h-4 rounded-full" />
                                <Sk className="h-3.5 w-28 rounded-full" />
                            </div>
                            <Sk className="h-3 w-12 rounded-full" />
                        </div>
                        {/* Progress bar */}
                        <Sk className="h-2.5 w-full rounded-full" />
                    </div>

                    {/* ── Config card ── */}
                    <div className="mb-6 rounded-2xl border border-black/6 dark:border-white/10 bg-white dark:bg-white/4 shadow-sm">
                        <div className="grid gap-6 p-6 md:grid-cols-3">
                            {/* Base name */}
                            <div className="space-y-2">
                                <Sk className="h-3.5 w-20 rounded-full" />
                                <Sk className="h-3 w-40 rounded-full" />
                                <Sk className="h-9 w-full rounded-xl" />
                            </div>
                            {/* Images per folder */}
                            <div className="space-y-2">
                                <Sk className="h-3.5 w-32 rounded-full" />
                                <Sk className="h-3 w-44 rounded-full" />
                                <Sk className="h-9 w-full rounded-xl" />
                            </div>
                            {/* Quality slider */}
                            <div className="space-y-2">
                                <Sk className="h-3.5 w-24 rounded-full" />
                                <Sk className="h-3 w-40 rounded-full" />
                                <Sk className="h-2 w-full rounded-full mt-3" />
                            </div>
                        </div>
                    </div>

                    {/* ── Drop zone ── */}
                    <div className="relative mb-6 rounded-3xl border-2 border-dashed border-[#3A344E]/20 dark:border-white/10 bg-[#3A344E]/3 p-10 text-center">
                        <Sk className="mx-auto mb-4 w-12 h-12 rounded-full" />
                        <Sk className="mx-auto h-10 w-36 rounded-full" />
                        <Sk className="mx-auto mt-3 h-3 w-64 rounded-full" />
                    </div>

                    {/* ── Upload stats banner ── */}
                    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[#1856FF]/20 bg-[#1856FF]/6 px-4 py-3">
                        <Sk className="h-4 w-4 rounded-sm shrink-0" />
                        <Sk className="h-3 w-64 rounded-full" />
                    </div>

                    {/* ── Action bar ── */}
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        {/* Compress all */}
                        <Sk className="h-11 w-44 rounded-xl" />
                        {/* Download mode toggle + download */}
                        <div className="flex items-center gap-2">
                            <Sk className="h-9 w-36 rounded-xl" />
                            <Sk className="h-11 w-40 rounded-xl" />
                        </div>
                        {/* Reset */}
                        <Sk className="h-11 w-24 rounded-xl" />
                        {/* Clear all */}
                        <Sk className="h-11 w-24 rounded-xl" />
                    </div>

                    {/* ── Summary chips ── */}
                    <div className="mb-6 flex flex-wrap gap-2">
                        {[52, 60, 52, 80].map((w, i) => (
                            <Sk key={i} className="h-5 rounded-full" style={{ width: w }} />
                        ))}
                    </div>

                    {/* ── Image grid ── */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: gridCount }).map((_, i) => (
                            <ImageCardSk key={i} index={i} />
                        ))}
                    </div>

                    {/* ── Pagination bar ── */}
                    <div className="mt-8">
                        <div className="flex items-center justify-center gap-1.5">
                            {/* Prev */}
                            <Sk className="w-9 h-9 rounded-xl" />
                            {/* Page buttons */}
                            {[true, false, true, false, true].map((active, i) => (
                                <Sk
                                    key={i}
                                    className={`w-9 h-9 rounded-xl ${active ? "bg-[#1856FF]/70 dark:bg-[#1856FF]/60" : ""}`}
                                />
                            ))}
                            {/* Next */}
                            <Sk className="w-9 h-9 rounded-xl" />
                        </div>
                        {/* "Showing X–Y of Z" */}
                        <Sk className="mx-auto mt-2 h-3 w-40 rounded-full" />
                    </div>
                </div>
            </section>
        </>
    );
}