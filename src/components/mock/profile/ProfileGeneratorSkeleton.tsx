"use client";

// ---------------------------------------------------------------------------
// Reusable shimmer primitive
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
            className={`animate-pulse bg-gray-200 dark:bg-white/8 ${className}`}
            style={style}
        />
    );
}

// ---------------------------------------------------------------------------
// Skeleton for a single ProfileCard
// ---------------------------------------------------------------------------
function ProfileCardSkeleton({ index }: { index: number }) {
    return (
        <div
            className="rounded-2xl border border-gray-200 dark:border-white/8 overflow-hidden bg-white dark:bg-white/4 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
            style={{ animationDelay: `${index * 60}ms` }}
        >
            {/* ── Header ── */}
            <div className="px-5 pt-4 pb-3.5 border-b border-gray-100 dark:border-white/8 bg-gray-50/60 dark:bg-white/2">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <Sk className="w-14 h-14 rounded-full shrink-0" />

                    <div className="flex-1 min-w-0 space-y-2">
                        {/* Full name */}
                        <Sk className="h-3.5 rounded-full w-3/4" />
                        {/* Username */}
                        <Sk className="h-2.5 rounded-full w-1/2" />
                        {/* Badge row */}
                        <div className="flex items-center gap-2 pt-0.5">
                            <Sk className="h-4 w-12 rounded-full" />
                            <Sk className="h-4 w-20 rounded-full" />
                        </div>
                    </div>

                    {/* Copy JSON button stub */}
                    <Sk className="h-6 w-14 rounded-lg shrink-0" />
                </div>
            </div>

            {/* ── Body ── */}
            <div className="px-5 py-4 space-y-2.5">
                {/* Section label */}
                <Sk className="h-2 w-16 rounded-full mb-3" />

                {/* Info rows: icon + label + value */}
                {[
                    ["w-3.5", "w-8", "w-3/4"],
                    ["w-3.5", "w-8", "w-2/3"],
                    ["w-3.5", "w-8", "w-4/5"],
                    ["w-3.5", "w-8", "w-1/2"],
                ].map(([icon, lbl, val], i) => (
                    <div key={i} className="flex items-center gap-2">
                        <Sk className={`${icon} h-3.5 rounded-sm shrink-0`} />
                        <Sk className={`${lbl} h-2 rounded-full shrink-0`} />
                        <Sk className={`${val} h-2.5 rounded-full`} />
                    </div>
                ))}

                {/* Second section */}
                <Sk className="h-2 w-20 rounded-full mt-4 mb-3" />

                {[
                    ["w-3.5", "w-8", "w-3/5"],
                    ["w-3.5", "w-8", "w-2/3"],
                    ["w-3.5", "w-8", "w-1/2"],
                ].map(([icon, lbl, val], i) => (
                    <div key={i} className="flex items-center gap-2">
                        <Sk className={`${icon} h-3.5 rounded-sm shrink-0`} />
                        <Sk className={`${lbl} h-2 rounded-full shrink-0`} />
                        <Sk className={`${val} h-2.5 rounded-full`} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Full ProfileGenerator loading skeleton page
// ---------------------------------------------------------------------------
export default function ProfileGeneratorSkeleton({
    count = 6,
}: {
    /** Number of card skeletons to render — match your filters.count */
    count?: number;
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f1a]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

                {/* ── Page header ── */}
                <div className="mb-10 space-y-3">
                    <Sk className="h-3 w-28 rounded-full" />
                    <Sk className="h-8 w-56 rounded-xl" />
                    <Sk className="h-3.5 w-80 rounded-full" />
                </div>

                {/* ── Filters panel ── */}
                <div className="mb-8 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/6 shadow-md dark:shadow-[0_8px_32px_rgba(24,86,255,0.08)] p-6">
                    {/* Panel header */}
                    <div className="flex items-center gap-2 mb-6">
                        <Sk className="w-4 h-4 rounded-sm" />
                        <Sk className="h-2.5 w-16 rounded-full" />
                    </div>

                    {/* Filter controls grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Country */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5">
                                <Sk className="w-3.5 h-3.5 rounded-sm" />
                                <Sk className="h-2.5 w-14 rounded-full" />
                            </div>
                            <Sk className="h-10 w-full rounded-lg" />
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-1.5">
                                <Sk className="w-3.5 h-3.5 rounded-sm" />
                                <Sk className="h-2.5 w-14 rounded-full" />
                            </div>
                            <Sk className="h-10 w-full rounded-lg" />
                        </div>

                        {/* Count slider */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-1.5">
                                <Sk className="w-3.5 h-3.5 rounded-sm" />
                                <Sk className="h-2.5 w-28 rounded-full" />
                            </div>
                            {/* Track */}
                            <Sk className="h-1.5 w-full rounded-full mt-1" />
                            {/* Min / max labels */}
                            <div className="flex justify-between">
                                <Sk className="h-2.5 w-4 rounded-full" />
                                <Sk className="h-2.5 w-6 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Generate button */}
                    <div className="mt-8 flex justify-center">
                        <Sk className="h-12 w-48 rounded-xl" />
                    </div>
                </div>

                {/* ── Top bar (count label + copy-all) ── */}
                <div className="flex items-center justify-between mb-4">
                    <Sk className="h-2.5 w-32 rounded-full" />
                    <Sk className="h-8 w-24 rounded-lg" />
                </div>

                {/* ── Profile cards grid ── */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: count }).map((_, i) => (
                        <ProfileCardSkeleton key={i} index={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}