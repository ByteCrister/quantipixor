"use client";

// Matches OcrDocFormatterPage's gradient bg (#1856FF / #07CA6B / #8b5cf6 tokens)
function Sk({
    className = "",
    style,
}: {
    className?: string;
    style?: React.CSSProperties;
}) {
    return (
        <div
            className={`animate-pulse bg-[rgba(20,20,20,0.08)] dark:bg-white/8 ${className}`}
            style={style}
        />
    );
}

// Glass card shell — matches the real page's glass cards
function GlassCard({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`relative overflow-hidden rounded-2xl border border-white/90 bg-white/72 p-6
        shadow-[0_16px_48px_rgba(24,86,255,0.1),0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-xl ${className}`}
        >
            {/* Glass sheen */}
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-to-br from-white/25 to-transparent" />
            {children}
        </div>
    );
}

// Section header dot + label
function SectionHeaderSk({ dotColor }: { dotColor: string }) {
    return (
        <div className="mb-5 flex items-center gap-2.5">
            <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: dotColor }} />
            <Sk className="h-4 w-32 rounded-full" />
        </div>
    );
}

export default function OcrDocFormatterSkeleton() {
    return (
        <main
            className="relative min-h-screen overflow-hidden"
            style={{
                background:
                    "linear-gradient(135deg, #e8eeff 0%, #f0f4ff 30%, #e6f9f0 70%, #f5f0ff 100%)",
            }}
        >
            {/* Ambient blobs */}
            <div
                aria-hidden
                className="pointer-events-none fixed -top-24 -left-24 h-125 w-125 rounded-full"
                style={{ background: "rgba(24,86,255,0.12)", filter: "blur(80px)" }}
            />
            <div
                aria-hidden
                className="pointer-events-none fixed -bottom-20 -right-20 h-100 w-100 rounded-full"
                style={{ background: "rgba(7,202,107,0.08)", filter: "blur(80px)" }}
            />

            <div className="relative z-10 mx-auto max-w-275 px-5 py-8">

                {/* ── Header ── */}
                <header className="mb-10 text-center space-y-3">
                    {/* "AI-Powered OCR" badge */}
                    <Sk className="mx-auto h-6 w-32 rounded-full" />
                    {/* Title */}
                    <Sk className="mx-auto h-10 w-72 rounded-xl" />
                    {/* Subtitle */}
                    <Sk className="mx-auto h-3.5 w-96 rounded-full" />
                </header>

                {/* ── Two-column grid ── */}
                <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">

                    {/* ── LEFT COLUMN ── */}
                    <div className="flex flex-col gap-5">

                        {/* Upload card */}
                        <GlassCard>
                            <SectionHeaderSk dotColor="#1856FF" />
                            {/* UploadZone stub */}
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50/60">
                                <Sk className="mx-auto mb-3 w-12 h-12 rounded-full" />
                                <Sk className="mx-auto h-3.5 w-48 rounded-full mb-1.5" />
                                <Sk className="mx-auto h-3 w-36 rounded-full" />
                            </div>

                            {/* PreviewPanel thumbnails */}
                            <div className="mt-4 space-y-2">
                                <Sk className="h-3 w-28 rounded-full" />
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {[1, 2, 3].map((i) => (
                                        <Sk key={i} className="w-20 h-20 rounded-md shrink-0" />
                                    ))}
                                </div>
                            </div>
                        </GlassCard>

                        {/* OCR Settings card */}
                        <GlassCard>
                            <SectionHeaderSk dotColor="#07CA6B" />

                            {/* Language label */}
                            <Sk className="h-2.5 w-16 rounded-full mb-3" />

                            {/* Language pills */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {[60, 50, 70, 55, 65, 48, 72].map((w, i) => (
                                    <Sk key={i} className="h-8 rounded-full" style={{ width: w }} />
                                ))}
                            </div>
                            <Sk className="h-3 w-40 rounded-full mb-5" />

                            {/* Divider */}
                            <div className="h-px bg-white/90 my-4" />

                            {/* Run OCR button */}
                            <Sk className="h-12 w-full rounded-[10px]" />

                            {/* Progress bar */}
                            <div className="mt-4 space-y-1.5">
                                <Sk className="h-1.5 w-full rounded-[3px]" />
                                <Sk className="mx-auto h-3 w-24 rounded-full" />
                            </div>
                        </GlassCard>
                    </div>

                    {/* ── RIGHT COLUMN: Output ── */}
                    <GlassCard className="flex flex-col">
                        {/* Output header */}
                        <div className="mb-4 flex items-center justify-between">
                            <SectionHeaderSk dotColor="#8b5cf6" />
                            <div className="flex gap-2">
                                <Sk className="h-6 w-16 rounded-full" />
                                <Sk className="h-6 w-12 rounded-full" />
                            </div>
                        </div>

                        {/* Tab row */}
                        <div className="mb-4 flex gap-1 rounded-[10px] border border-white/90 bg-white/45 p-1">
                            {/* Active tab */}
                            <Sk className="flex-1 h-8 rounded-[7px]" />
                            {/* Inactive tab */}
                            <div className="flex-1 h-8 rounded-[7px]" />
                        </div>

                        {/* Output panel — prose lines */}
                        <div className="min-h-55 max-h-85 flex-1 overflow-y-auto rounded-[10px] border border-white/90 bg-white/45 p-4 space-y-2.5">
                            {[85, 70, 90, 60, 75, 55, 80, 65, 78, 50].map((w, i) => (
                                <Sk key={i} className="h-3 rounded-full" style={{ width: `${w}%` }} />
                            ))}
                        </div>

                        {/* Action bar */}
                        <div className="mt-4 flex flex-wrap gap-2 border-t border-white/90 pt-4">
                            {[80, 72, 100, 88].map((w, i) => (
                                <Sk key={i} className="h-8 rounded-[10px]" style={{ width: w }} />
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </main>
    );
}