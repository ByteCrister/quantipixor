"use client";

// ---------------------------------------------------------------------------
// Reusable shimmer primitive — mirrors the dark/light tokens used in the
// real JsonViewerPage (slate-* / white/*)
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
            className={`animate-pulse bg-slate-200 dark:bg-white/[0.07] ${className}`}
            style={style}
        />
    );
}

// ---------------------------------------------------------------------------
// Chip skeleton – matches the StatsBar <Chip> shape
// ---------------------------------------------------------------------------
function ChipSk({ width = "w-16" }: { width?: string }) {
    return (
        <Sk
            className={`h-7 ${width} rounded-lg border border-slate-200 dark:border-white/10`}
        />
    );
}

// ---------------------------------------------------------------------------
// Single DataCard skeleton
// ---------------------------------------------------------------------------
function DataCardSkeleton({
    index,
    fieldWidths = [75, 55, 88, 62, 70],
}: {
    index: number;
    fieldWidths?: number[];
}) {
    return (
        <article
            className="rounded-2xl overflow-hidden bg-white dark:bg-white/4 border border-slate-200 dark:border-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
            style={{ animationDelay: `${index * 35}ms` }}
        >
            {/* ── Card header ── */}
            <header className="flex items-center justify-between gap-2.5 px-4 py-3 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/2">
                <div className="flex items-center gap-2">
                    {/* #N badge */}
                    <Sk className="h-5 w-8 rounded" />
                    {/* "Entry" label */}
                    <Sk className="h-2.5 w-10 rounded-full" />
                </div>
                {/* Copy JSON button */}
                <Sk className="h-4 w-16 rounded-full" />
            </header>

            {/* ── Card body ── */}
            <div className="px-4 py-3.5 flex flex-col gap-3">
                {fieldWidths.map((w, i) => (
                    <div key={i} className="flex flex-col gap-1">
                        {/* Key label */}
                        <Sk className="h-2 w-1/4 rounded-full" />
                        {/* Value */}
                        <Sk className="h-3 rounded-full" style={{ width: `${w}%` }} />
                    </div>
                ))}
            </div>
        </article>
    );
}

// ---------------------------------------------------------------------------
// Full JsonViewer loading skeleton page
// ---------------------------------------------------------------------------
export default function JsonViewerSkeleton({
    cardCount = 9,
    viewMode = "grid",
}: {
    /** How many DataCard skeletons to show */
    cardCount?: number;
    /** Matches the real page's viewMode state */
    viewMode?: "grid" | "list";
}) {
    // Vary field widths per card so the skeleton looks naturally different
    const fieldVariants = [
        [75, 55, 88, 62, 70],
        [65, 80, 50, 90, 60],
        [85, 45, 72, 58, 77],
        [60, 70, 55, 83, 65],
        [78, 52, 91, 48, 68],
        [70, 60, 75, 55, 80],
        [55, 88, 62, 70, 45],
        [82, 50, 65, 90, 58],
        [68, 74, 53, 77, 62],
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f1a]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="flex flex-col gap-6">

                    {/* ── Page header ── */}
                    <header className="flex flex-col items-center gap-3 pb-2">
                        {/* Feature pills row */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {[80, 96, 88, 72, 90].map((w, i) => (
                                <Sk
                                    key={i}
                                    className="h-6 rounded-full border border-slate-200 dark:border-white/10"
                                    style={{ width: w }}
                                />
                            ))}
                        </div>
                        {/* Title */}
                        <Sk className="h-9 w-64 rounded-xl mt-1" />
                        {/* Subtitle */}
                        <Sk className="h-3.5 w-48 rounded-full" />
                    </header>

                    {/* ── Input panel ── */}
                    <section className="rounded-2xl p-5 sm:p-6 flex flex-col gap-4 bg-white dark:bg-white/4 border border-slate-200 dark:border-white/10 shadow-[0_2px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.45)]">
                        {/* Tab switcher */}
                        <div className="flex gap-1.5 bg-slate-100 dark:bg-white/5 rounded-xl p-1 w-fit">
                            {/* Active tab */}
                            <Sk className="h-8 w-24 rounded-[9px] bg-white dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/50" />
                            {/* Inactive tab */}
                            <div className="h-8 w-28 rounded-[9px]" />
                        </div>

                        {/* Textarea / drop-zone */}
                        <Sk className="w-full min-h-32.5 rounded-xl" />

                        {/* Stats + action row */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Clear button */}
                            <Sk className="h-8 w-16 rounded-lg border border-slate-200 dark:border-white/10" />
                            {/* StatsBar chips */}
                            <ChipSk width="w-20" />
                            <ChipSk width="w-16" />
                            <ChipSk width="w-18" />
                            {/* Entry count badge */}
                            <Sk className="h-6 w-20 rounded-full ml-auto" />
                        </div>
                    </section>

                    {/* ── Results section ── */}
                    <section className="flex flex-col gap-5">
                        {/* Search toolbar */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Search input */}
                            <Sk className="flex-1 min-w-50 h-10 rounded-xl border border-slate-200 dark:border-white/10" />
                            {/* Grid / List toggles */}
                            <Sk className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/10" />
                            <Sk className="h-10 w-10 rounded-xl border border-slate-200 dark:border-white/10" />
                        </div>

                        {/* Section label divider */}
                        <div className="flex items-center gap-2">
                            <Sk className="h-2.5 w-24 rounded-full" />
                            <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.07]" />
                        </div>

                        {/* DataCards */}
                        <div
                            className={
                                viewMode === "grid"
                                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                    : "flex flex-col gap-3"
                            }
                        >
                            {Array.from({ length: cardCount }).map((_, i) => (
                                <DataCardSkeleton
                                    key={i}
                                    index={i}
                                    fieldWidths={fieldVariants[i % fieldVariants.length]}
                                />
                            ))}
                        </div>

                        {/* Pagination bar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                            {/* "Showing X–Y of Z entries" */}
                            <Sk className="h-3 w-44 rounded-full" />

                            <div className="flex items-center gap-1.5">
                                {/* First / prev */}
                                <Sk className="h-8 w-8 rounded-lg border border-slate-200 dark:border-white/10" />
                                <Sk className="h-8 w-8 rounded-lg border border-slate-200 dark:border-white/10" />
                                {/* Page numbers */}
                                {[true, false, true, false, true].map((active, i) => (
                                    <Sk
                                        key={i}
                                        className={`h-8 w-8 rounded-lg border ${active
                                                ? "bg-blue-600 dark:bg-blue-600 border-blue-600"
                                                : "border-slate-200 dark:border-white/10"
                                            }`}
                                    />
                                ))}
                                {/* Next / last */}
                                <Sk className="h-8 w-8 rounded-lg border border-slate-200 dark:border-white/10" />
                                <Sk className="h-8 w-8 rounded-lg border border-slate-200 dark:border-white/10" />
                                {/* Page-size select */}
                                <Sk className="ml-2 h-8 w-24 rounded-lg border border-slate-200 dark:border-white/10" />
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}