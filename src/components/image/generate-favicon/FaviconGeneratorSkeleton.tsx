"use client";

// Matches FaviconGeneratorPage's Card / #1856FF / #3A344E token palette
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

export default function FaviconGeneratorSkeleton() {
    return (
        <section className="relative w-full overflow-x-clip">
            {/* Ambient blobs */}
            <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/3 rounded-full bg-[#1856FF]/10 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-32 h-56 w-56 translate-x-1/4 rounded-full bg-[#3A344E]/15 blur-3xl" />

            <div className="relative mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">

                {/* ── Page header ── */}
                <div className="relative mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-3">
                        {/* "Image tools" badge */}
                        <Sk className="h-5 w-24 rounded-full" />
                        {/* h1 */}
                        <Sk className="h-10 w-56 rounded-xl" />
                        {/* description — two lines */}
                        <Sk className="h-3.5 w-full max-w-sm rounded-full" />
                        <Sk className="h-3.5 w-3/4 max-w-xs rounded-full" />
                    </div>
                    {/* Right badges */}
                    <div className="flex flex-wrap gap-2">
                        <Sk className="h-5 w-16 rounded-full" />
                        <Sk className="h-5 w-20 rounded-full" />
                    </div>
                </div>

                {/* ── Output format pills ── */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {["PNG 16–512", "Apple touch", "favicon.ico", "site.webmanifest", "browserconfig"].map((_, i) => (
                        <Sk key={i} className="h-5 rounded-full" style={{ width: 64 + i * 14 }} />
                    ))}
                </div>

                {/* ── Upload card ── */}
                <div className="mb-6 rounded-2xl border border-black/6 dark:border-white/10 bg-white dark:bg-white/4 p-6 shadow-sm">
                    {/* Drop zone */}
                    <div className="rounded-3xl border-2 border-dashed border-[#3A344E]/20 dark:border-white/10 bg-[#3A344E]/3 p-8 text-center">
                        {/* Upload icon */}
                        <Sk className="mx-auto mb-4 w-12 h-12 rounded-full" />
                        {/* "Choose image" button */}
                        <Sk className="mx-auto mt-4 h-10 w-36 rounded-full" />
                        <Sk className="mx-auto mt-3 h-3 w-52 rounded-full" />
                    </div>

                    {/* File info row (appears after file is selected) */}
                    <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#1856FF]/15 bg-[#1856FF]/5 px-4 py-3">
                        <Sk className="w-4 h-4 rounded-sm shrink-0" />
                        <Sk className="flex-1 h-3 rounded-full min-w-0" />
                        <Sk className="h-3 w-16 rounded-full shrink-0" />
                    </div>
                </div>

                {/* ── Crop card (shown after file selected) ── */}
                <div className="mb-6 overflow-hidden rounded-2xl border border-black/6 dark:border-white/10 bg-white dark:bg-white/4 shadow-sm">
                    <div className="p-4 sm:p-6">
                        {/* CropImage area */}
                        <Sk className="w-full aspect-square rounded-2xl" />
                    </div>
                </div>

                {/* ── Generate button + hint row ── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* "Generate & download ZIP" button */}
                    <Sk className="h-11 w-full sm:w-56 rounded-xl" />
                    {/* Hint */}
                    <Sk className="h-3 w-48 rounded-full" />
                </div>
            </div>
        </section>
    );
}