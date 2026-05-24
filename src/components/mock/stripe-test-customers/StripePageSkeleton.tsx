"use client";

import { plusJakarta, jetbrainsMono } from "@/fonts/google-fonts";

export default function StripePageSkeleton() {
    return (
        <div
            className={`${plusJakarta.variable} ${jetbrainsMono.variable} relative min-h-screen overflow-x-clip
        bg-[radial-gradient(ellipse_at_top,#e8f0ff_0%,#f8faff_60%)]
        dark:bg-[radial-gradient(ellipse_at_top,rgba(24,86,255,0.12)_0%,#0a0d14_60%)]`}
        >
            {/* Ambient glow blobs (same as original Shell) */}
            <div
                className="pointer-events-none absolute left-0 top-0 h-80 w-80 -translate-x-1/3 rounded-full bg-[#1856FF]/10 blur-3xl"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute right-0 top-40 h-64 w-64 translate-x-1/4 rounded-full bg-[#3A344E]/15 blur-3xl dark:bg-[#1856FF]/8"
                aria-hidden
            />
            {/* Noise overlay */}
            <div
                className="pointer-events-none fixed inset-0 opacity-[0.025] dark:opacity-[0.04]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
            />

            {/* Main container – same max‑width and padding */}
            <div className="relative mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
                {/* ── Hero skeleton ────────────────────────────────────────── */}
                <div className="relative mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-3">
                        {/* Badge placeholder */}
                        <div className="h-5 w-36 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
                        {/* Title placeholder */}
                        <div className="h-8 w-64 rounded-md bg-gray-200 dark:bg-white/10 animate-pulse md:h-10 md:w-80" />
                        {/* Description placeholder */}
                        <div className="space-y-2 max-w-xl">
                            <div className="h-3 w-full rounded-sm bg-gray-200 dark:bg-white/10 animate-pulse" />
                            <div className="h-3 w-3/4 rounded-sm bg-gray-200 dark:bg-white/10 animate-pulse" />
                        </div>
                    </div>
                    {/* Badges placeholder */}
                    <div className="flex flex-wrap gap-2 shrink-0">
                        <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
                        <div className="h-6 w-32 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
                        <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
                    </div>
                </div>

                {/* ── Step chips skeleton ──────────────────────────────────── */}
                <div className="mb-8 flex flex-wrap gap-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-full border
                ${i === 1
                                    ? "bg-[#1856FF]/20 border-[#1856FF]/30"  // active step
                                    : "bg-white/60 dark:bg-white/5 border-gray-200 dark:border-white/10"}
              `}
                        >
                            <div
                                className={`w-5 h-5 rounded-full ${i === 1
                                        ? "bg-white/30"
                                        : "bg-gray-200 dark:bg-white/10"
                                    } animate-pulse`}
                            />
                            <div className="h-3 w-16 rounded-sm bg-gray-200 dark:bg-white/10 animate-pulse" />
                        </div>
                    ))}
                </div>

                {/* ── Glass card skeleton ──────────────────────────────────── */}
                <div
                    className="relative rounded-2xl border border-gray-200/80 dark:border-white/10
            bg-white/80 dark:bg-white/4 backdrop-blur-xl
            shadow-[0_8px_40px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]
            dark:shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]
            overflow-hidden"
                >
                    {/* Top accent */}
                    <div className="h-0.5 w-full bg-linear-to-r from-transparent via-[#1856FF]/60 to-transparent" />

                    <div className="p-8 space-y-5">
                        {/* Card header */}
                        <div className="flex items-center gap-3 mb-7">
                            <div className="w-10 h-10 rounded-xl bg-[#1856FF]/10 dark:bg-[#1856FF]/20 border border-[#1856FF]/20 dark:border-[#1856FF]/30 animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-4 w-36 rounded-sm bg-gray-200 dark:bg-white/10 animate-pulse" />
                                <div className="h-3 w-44 rounded-sm bg-gray-200 dark:bg-white/10 animate-pulse" />
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <div className="h-3 w-24 rounded-sm bg-gray-200 dark:bg-white/10 animate-pulse" />
                                <div className="h-10 w-full rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse" />
                            </div>
                            <div className="space-y-1.5">
                                <div className="h-3 w-20 rounded-sm bg-gray-200 dark:bg-white/10 animate-pulse" />
                                <div className="h-10 w-full rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse" />
                            </div>
                        </div>

                        {/* Security note */}
                        <div className="h-10 w-full rounded-xl bg-emerald-50/60 dark:bg-emerald-500/6 border border-emerald-200/60 dark:border-emerald-500/15 animate-pulse" />

                        {/* CTA button */}
                        <div className="h-11 w-full rounded-xl bg-[#1856FF]/20 animate-pulse" />
                    </div>
                </div>

                {/* ── Footer note skeleton ─────────────────────────────────── */}
                <div className="mt-8 flex justify-center">
                    <div className="h-3 w-72 rounded-sm bg-gray-200 dark:bg-white/10 animate-pulse" />
                </div>
            </div>
        </div>
    );
}