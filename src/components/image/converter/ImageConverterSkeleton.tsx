"use client";

// Matches ImageConverterPage's Card / #1856FF / #3A344E token palette
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

// Minimal Card shell
function CardShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl border border-black/6 dark:border-white/10 bg-white dark:bg-white/4 shadow-sm ${className}`}>
            {children}
        </div>
    );
}

export default function ImageConverterSkeleton() {
    const FORMAT_PILLS = ["JPEG", "PNG", "WebP", "GIF", "BMP", "AVIF", "TIFF", "ICO", "SVG", "…"];

    return (
        <>
            <section className="relative w-full overflow-x-clip">
                {/* Ambient blobs */}
                <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/3 rounded-full bg-[#1856FF]/10 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-32 h-56 w-56 translate-x-1/4 rounded-full bg-[#3A344E]/15 blur-3xl" />

                <div className="relative mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">

                    {/* ── Page header ── */}
                    <div className="relative mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="space-y-3">
                            <Sk className="h-5 w-24 rounded-full" />
                            <Sk className="h-9 w-56 rounded-xl" />
                            <Sk className="h-3.5 w-80 rounded-full" />
                            <Sk className="h-3.5 w-64 rounded-full" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Sk className="h-5 w-16 rounded-full" />
                            <Sk className="h-5 w-40 rounded-full" />
                        </div>
                    </div>

                    {/* ── Format pills row ── */}
                    <div className="mb-6 flex flex-wrap gap-2">
                        {FORMAT_PILLS.map((_, i) => (
                            <Sk key={i} className="h-5 rounded-full" style={{ width: 32 + i * 4 }} />
                        ))}
                    </div>

                    {/* ── Upload card ── */}
                    <CardShell className="mb-6">
                        <div className="p-6">
                            <div className="rounded-3xl border-2 border-dashed border-[#3A344E]/20 dark:border-white/10 bg-[#3A344E]/3 p-8 text-center">
                                <Sk className="mx-auto mb-4 w-12 h-12 rounded-full" />
                                <Sk className="mx-auto h-10 w-36 rounded-full" />
                                <Sk className="mx-auto mt-3 h-3 w-72 rounded-full" />
                            </div>
                        </div>
                    </CardShell>

                    {/* ── Two-column: original | convert-to ── */}
                    <div className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">

                            {/* Original card */}
                            <CardShell>
                                <div className="p-5 space-y-3">
                                    {/* Card title */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sk className="w-5 h-5 rounded-md" />
                                        <Sk className="h-5 w-20 rounded-lg" />
                                    </div>
                                    {/* Image preview area */}
                                    <Sk className="w-full aspect-video rounded-2xl" />
                                    {/* "Crop image" button */}
                                    <div className="flex justify-end mt-3">
                                        <Sk className="h-8 w-28 rounded-lg" />
                                    </div>
                                    {/* Metadata rows */}
                                    <div className="mt-4 space-y-2">
                                        {[["Name", "70%"], ["Size", "30%"], ["Detected", "20%"]].map(([, w], i) => (
                                            <div key={i} className="flex justify-between gap-2">
                                                <Sk className="h-3 w-16 rounded-full" />
                                                <Sk className="h-3 rounded-full" style={{ width: w }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardShell>

                            {/* Convert-to card */}
                            <CardShell>
                                <div className="p-5 space-y-4">
                                    {/* Card title */}
                                    <div className="flex items-center gap-2">
                                        <Sk className="w-5 h-5 rounded-md" />
                                        <Sk className="h-5 w-24 rounded-lg" />
                                    </div>
                                    <Sk className="h-3 w-full rounded-full" />
                                    <Sk className="h-3 w-3/4 rounded-full" />

                                    {/* Format select */}
                                    <div className="space-y-2">
                                        <Sk className="h-3 w-24 rounded-full" />
                                        <Sk className="h-10 w-full rounded-xl" />
                                    </div>

                                    {/* Convert button */}
                                    <Sk className="h-11 w-full rounded-xl" />

                                    {/* Output preview */}
                                    <div className="border-t border-black/6 dark:border-white/10 pt-4 space-y-2">
                                        <Sk className="h-4 w-28 rounded-lg" />
                                        <Sk className="w-full aspect-4/3 rounded-2xl" />
                                        <div className="flex items-center justify-between mt-3">
                                            <Sk className="h-3 w-20 rounded-full" />
                                            <Sk className="h-8 w-24 rounded-lg" />
                                        </div>
                                    </div>
                                </div>
                            </CardShell>
                        </div>

                        {/* ── Source Base64 panel ── */}
                        <CardShell className="border-[#1856FF]/20 bg-[#1856FF]/3 dark:border-[#1856FF]/25">
                            <div className="p-5 space-y-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <Sk className="h-5 w-28 rounded-lg" />
                                    {/* Checkbox + label */}
                                    <div className="flex items-center gap-2">
                                        <Sk className="h-4 w-4 rounded-sm" />
                                        <Sk className="h-3 w-48 rounded-full" />
                                    </div>
                                </div>
                                <Sk className="h-3 w-3/4 rounded-full" />
                                {/* Base64 text block */}
                                <Sk className="h-32 w-full rounded-xl" />
                                <div className="flex justify-end">
                                    <Sk className="h-8 w-28 rounded-lg" />
                                </div>
                            </div>
                        </CardShell>

                        {/* ── Converted Base64 panel ── */}
                        <CardShell>
                            <div className="p-5 space-y-4">
                                <Sk className="h-5 w-36 rounded-lg" />
                                <Sk className="h-32 w-full rounded-xl" />
                                <div className="flex justify-end">
                                    <Sk className="h-8 w-28 rounded-lg" />
                                </div>
                            </div>
                        </CardShell>
                    </div>

                    {/* ── "Upload a different image" ── */}
                    <div className="mt-8 flex justify-center">
                        <Sk className="h-8 w-44 rounded-lg" />
                    </div>

                    {/* ── Footer note ── */}
                    <Sk className="mx-auto mt-10 h-3 w-3/4 max-w-135 rounded-full" />
                </div>
            </section>
        </>
    );
}