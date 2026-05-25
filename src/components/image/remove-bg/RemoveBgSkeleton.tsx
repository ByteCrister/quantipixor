"use client";

// Matches RemoveBgPage's Card / #1856FF / #3A344E token palette
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

export default function RemoveBgSkeleton() {
  return (
    <section className="relative w-full overflow-x-clip">
      {/* Ambient blobs — cosmetic only */}
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/3 rounded-full bg-[#1856FF]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-32 h-56 w-56 translate-x-1/4 rounded-full bg-[#3A344E]/15 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">

        {/* ── Page header ── */}
        <div className="relative mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            {/* "Image tools" badge */}
            <Sk className="h-5 w-24 rounded-full" />
            {/* h1 */}
            <Sk className="h-9 w-64 rounded-xl" />
            {/* subtitle */}
            <Sk className="h-3.5 w-80 rounded-full" />
          </div>
          {/* Right badges */}
          <div className="flex flex-wrap gap-2">
            <Sk className="h-5 w-20 rounded-full" />
            <Sk className="h-5 w-16 rounded-full" />
            <Sk className="h-5 w-52 rounded-full" />
            <Sk className="h-5 w-20 rounded-full" />
          </div>
        </div>

        {/* ── Upload card ── */}
        <div className="mb-6 rounded-2xl border border-black/6 dark:border-white/10 bg-white dark:bg-white/4 p-6 shadow-sm">
          {/* Drop zone */}
          <div className="rounded-3xl border-2 border-dashed border-[#3A344E]/20 dark:border-white/10 bg-[#3A344E]/3 p-8 text-center">
            {/* Upload icon */}
            <Sk className="mx-auto mb-4 w-12 h-12 rounded-full" />
            {/* "Choose image" button */}
            <Sk className="mx-auto h-10 w-36 rounded-full" />
            <Sk className="mx-auto mt-3 h-3 w-56 rounded-full" />
          </div>
        </div>

        {/* ── Loading status banner (optional, always shown in skeleton) ── */}
        <Sk className="mb-6 h-11 w-full rounded-2xl" />

        {/* ── Crop preview + sidebar ── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

          {/* Left: image crop card */}
          <div className="rounded-2xl border border-black/6 dark:border-white/10 bg-white dark:bg-white/4 p-5 shadow-sm">
            {/* Card header row */}
            <div className="mb-3 flex items-center gap-2">
              <Sk className="w-5 h-5 rounded-md" />
              <Sk className="h-5 w-32 rounded-lg" />
            </div>

            {/* Crop area */}
            <Sk className="w-full aspect-square rounded-2xl" />

            {/* Filename + size */}
            <Sk className="mt-3 h-3 w-44 rounded-full" />
          </div>

          {/* Right: action sidebar */}
          <div className="space-y-3">
            {/* Reset crop */}
            <Sk className="h-10 w-full rounded-lg" />
            {/* Apply crop */}
            <Sk className="h-10 w-full rounded-lg" />
            {/* Remove bg (primary) */}
            <Sk className="h-10 w-full rounded-lg" />
            {/* Select new image */}
            <Sk className="h-10 w-full rounded-lg" />
          </div>
        </div>

        {/* ── Result card (post-processing state) ── */}
        <div className="mt-6 rounded-2xl border border-black/6 dark:border-white/10 bg-white dark:bg-white/4 p-5 shadow-sm">
          <Sk className="mb-3 h-6 w-20 rounded-lg" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Result thumbnail */}
            <Sk className="w-48 h-48 rounded-xl" />
            {/* Download button */}
            <Sk className="h-10 w-36 rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}