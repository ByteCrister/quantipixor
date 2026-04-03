"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    Upload,
    Settings,
    Zap,
    Download,
    ChevronDown,
    FolderOpen,
    Info,
    Keyboard,
    MonitorSmartphone,
    Folder,
    Image,
    Sparkles,
    Shield,
    Globe,
    CheckCircle2,
    ArrowRight,
} from "lucide-react";

// ── Google Fonts (Inter & Space Grotesk) ──────────────────────────────────────
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
    display: "swap",
});

// ── Enhanced Animation Variants ────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as const, delay },
});

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.2,
        },
    },
};

const cardHover: Variants = {
    rest: { scale: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
    hover: {
        scale: 1.02,
        y: -4,
        transition: { duration: 0.25, ease: "easeOut" },
        boxShadow: "0 20px 30px -12px rgba(0, 0, 0, 0.15)",
    },
};

const iconGlow: Variants = {
    rest: { scale: 1, filter: "brightness(1)" },
    hover: {
        scale: 1.1,
        filter: "brightness(1.2) drop-shadow(0 0 8px rgba(24,86,255,0.5))",
        transition: { duration: 0.2 },
    },
};

// ── Data (enhanced with gradient colors) ──────────────────────────────────────
const STEPS = [
    {
        num: "01",
        icon: Upload,
        title: "Upload",
        desc: "Drag & drop or use the file picker. Max 20 images per upload, 50 total in queue. Duplicates are silently skipped via SHA‑256 hashing.",
        gradient: "from-blue-500 to-indigo-600",
        bgLight: "bg-blue-50",
        bgDark: "dark:bg-blue-500/5",
    },
    {
        num: "02",
        icon: Settings,
        title: "Configure",
        desc: "Adjust quality (20–80%), set a base file name and batch size (1–100). These settings control output filenames and folder structure.",
        gradient: "from-purple-500 to-pink-600",
        bgLight: "bg-purple-50",
        bgDark: "dark:bg-purple-500/5",
    },
    {
        num: "03",
        icon: Zap,
        title: "Compress",
        desc: "Click Compress. Each image transitions through pending → processing → completed / error states, shown in real time.",
        gradient: "from-amber-500 to-orange-600",
        bgLight: "bg-amber-50",
        bgDark: "dark:bg-amber-500/5",
    },
    {
        num: "04",
        icon: Download,
        title: "Download",
        desc: "Get a single ZIP file with all images organised into batch‑N/ sub‑folders, ready to share or deploy.",
        gradient: "from-emerald-500 to-teal-600",
        bgLight: "bg-emerald-50",
        bgDark: "dark:bg-emerald-500/5",
    },
];

const CONFIG_TABLE = [
    {
        setting: "Quality",
        range: "0.2 – 0.8",
        default: "0.7",
        desc: "Applies to JPEG and WebP output",
        icon: Settings,
    },
    {
        setting: "Batch size",
        range: "1 – 100",
        default: "10",
        desc: "Images per sub-folder in the ZIP",
        icon: Folder,
    },
    {
        setting: "Base name",
        range: "any string",
        default: '"image"',
        desc: "Prefix for output files (image-1.jpg)",
        icon: Sparkles,
    },
    {
        setting: "Max file size",
        range: "—",
        default: "15 MB",
        desc: "Files larger than this are rejected",
        icon: Shield,
    },
];

const FAQS = [
    {
        q: "Why is my HEIC/TIFF not compressing?",
        a: "Browser Canvas support varies. HEIC/TIFF may not decode on all browsers. Chrome and Safari have the best format support for these types.",
    },
    {
        q: "Why did my file become PNG?",
        a: "Canvas can only reliably output JPEG, WebP and PNG. All other input formats (GIF, BMP, SVG, AVIF, etc.) are rasterized to PNG during compression.",
    },
    {
        q: "Why were some images skipped?",
        a: "The upload stats toast shows counts for duplicates, invalid files, and truncated files (over the queue limit). Check the toast notification for a breakdown.",
    },
    {
        q: "Can I re‑compress with different settings?",
        a: 'Yes — use the "Reset for Recompress" action. This keeps files in the queue but clears previous compression results, letting you adjust settings and compress again.',
    },
    {
        q: "Does WebP output work in all browsers?",
        a: "WebP output works in Chrome, Edge, and Firefox. Support is limited in older Safari versions. For maximum compatibility, use JPEG output.",
    },
    {
        q: "Does SHA‑256 hashing require HTTPS?",
        a: "Yes. The crypto.subtle API requires a secure context (HTTPS or localhost). Make sure you are not accessing the app over plain HTTP.",
    },
];

// ── Enhanced Sub-components ────────────────────────────────────────────────────
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.span
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-sm dark:border-blue-800/30 dark:from-blue-950/40 dark:to-indigo-950/40 dark:text-blue-300"
    >
        <Sparkles size={12} className="text-blue-500 dark:text-blue-400" />
        {children}
    </motion.span>
);

const FaqItem: React.FC<{ q: string; a: string; index: number }> = ({ q, a, index }) => {
    const [open, setOpen] = useState(false);
    return (
        <motion.div
            variants={cardHover}
            whileHover="hover"
            animate="rest"
            custom={index}
            {...fadeUp(index * 0.05)}
            className="group overflow-hidden rounded-2xl border border-gray-200/80 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:border-blue-300/50 hover:shadow-lg dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-blue-500/30"
        >
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-all duration-200 hover:bg-gray-50/50 dark:hover:bg-white/[0.04]"
            >
                <span className="text-sm font-medium text-gray-800 dark:text-white/80 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {q}
                </span>
                <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                    className="shrink-0 rounded-full bg-gray-100 p-1 dark:bg-white/10"
                >
                    <ChevronDown size={16} className="text-gray-500 dark:text-white/50" />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
                    >
                        <div className="border-t border-gray-200/50 px-6 pb-5 pt-4 dark:border-white/[0.05]">
                            <p className="text-sm leading-relaxed text-gray-600 dark:text-white/45">{a}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const StepCard: React.FC<{ step: typeof STEPS[0]; index: number }> = ({ step, index }) => {
    const Icon = step.icon;
    return (
        <motion.div
            variants={staggerContainer}
            custom={index}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-30px" }}
            className="group relative"
        >
            <motion.div
                variants={cardHover}
                initial="rest"
                whileHover="hover"
                animate="rest"
                className={`relative z-10 h-full rounded-2xl border border-gray-200/60 bg-gradient-to-br ${step.bgLight} ${step.bgDark} p-6 backdrop-blur-sm transition-all duration-300 dark:border-white/[0.08]`}
            >
                {/* Decorative gradient circle */}
                <div
                    className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${step.gradient} opacity-10 blur-2xl transition-all duration-500 group-hover:opacity-20`}
                />

                <div className="relative">
                    <motion.div
                        variants={iconGlow}
                        initial="rest"
                        whileHover="hover"
                        className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-white to-gray-100 p-3 shadow-md dark:from-gray-800 dark:to-gray-900"
                    >
                        <Icon className={`h-6 w-6 bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent`} />
                    </motion.div>

                    <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-xl font-bold tracking-tight text-gray-800 dark:text-white">
                            {step.title}
                        </h3>
                        <span className="font-mono text-sm font-bold text-gray-400 dark:text-white/30">
                            {step.num}
                        </span>
                    </div>

                    <p className="text-sm leading-relaxed text-gray-600 dark:text-white/50">{step.desc}</p>

                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400"
                    >
                        <span>Learn more</span>
                        <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                    </motion.div>
                </div>
            </motion.div>

            {/* Connecting line (except last) */}
            {index < STEPS.length - 1 && (
                <div className="absolute -right-6 top-1/2 hidden -translate-y-1/2 text-gray-300 dark:text-white/10 lg:block">
                    <ArrowRight size={20} className="rotate-45" />
                </div>
            )}
        </motion.div>
    );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function HelpPage() {
    return (
        <main
            className={`${inter.variable} ${spaceGrotesk.variable} relative min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 font-sans text-gray-900 dark:from-[#03050b] dark:via-[#060912] dark:to-[#0a0f1a] dark:text-white`}
        >
            {/* ── Enhanced Background Decorations ── */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                {/* Animated orbs */}
                <motion.div
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -20, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-gradient-to-r from-blue-400/20 to-indigo-500/20 blur-3xl dark:from-blue-600/10 dark:to-indigo-700/10"
                />
                <motion.div
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-40 right-10 h-96 w-96 rounded-full bg-gradient-to-r from-purple-400/15 to-pink-500/15 blur-3xl dark:from-purple-600/8 dark:to-pink-700/8"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-500/5"
                />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, #1856FF 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />
            </div>

            <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
                {/* ── Hero Section (Enhanced) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="mb-20 text-center"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-4 py-1.5 text-sm font-medium text-blue-700 backdrop-blur-sm dark:from-blue-400/10 dark:to-indigo-400/10 dark:text-blue-300"
                    >
                        <Sparkles size={16} />
                        <span>Quantipixor Help Center</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-white dark:via-blue-300 dark:to-white sm:text-5xl lg:text-6xl"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                        How to compress <br /> images like a pro
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-white/50"
                    >
                        Everything you need to know about compressing images efficiently
                    </motion.p>
                </motion.div>

                {/* ── Steps Section (Grid with animations) ── */}
                <section className="mb-28">
                    <motion.div {...fadeUp(0)} className="mb-3">
                        <SectionLabel>Workflow</SectionLabel>
                    </motion.div>
                    <motion.h2
                        {...fadeUp(0.06)}
                        className="mb-10 text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                        Simple 4‑step compression workflow
                    </motion.h2>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {STEPS.map((step, idx) => (
                            <StepCard key={step.title} step={step} index={idx} />
                        ))}
                    </div>
                </section>

                {/* ── Configuration Table (Enhanced) ── */}
                <section className="mb-28">
                    <motion.div {...fadeUp(0)} className="mb-3">
                        <SectionLabel>Configuration</SectionLabel>
                    </motion.div>
                    <motion.h2
                        {...fadeUp(0.06)}
                        className="mb-8 text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                        Adjustable parameters
                    </motion.h2>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/50 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.02]"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200/80 bg-gray-50/50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-white/70">
                                            Setting
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-white/70">
                                            Range
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-white/70">
                                            Default
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-white/70">
                                            Description
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {CONFIG_TABLE.map((row, idx) => {
                                        const Icon = row.icon;
                                        return (
                                            <motion.tr
                                                key={row.setting}
                                                variants={fadeUp(idx * 0.05)}
                                                className="border-b border-gray-200/50 transition-colors hover:bg-gray-50/40 dark:border-white/[0.04] dark:hover:bg-white/[0.02]"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Icon size={14} className="text-blue-500" />
                                                        <span className="font-medium text-gray-800 dark:text-white/80">
                                                            {row.setting}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-white/50">
                                                    {row.range}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-white/50">
                                                    {row.default}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-white/40">
                                                    {row.desc}
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </section>

                {/* ── ZIP Structure (Enhanced) ── */}
                <section className="mb-28">
                    <motion.div {...fadeUp(0)} className="mb-3">
                        <SectionLabel>Output</SectionLabel>
                    </motion.div>
                    <motion.h2
                        {...fadeUp(0.06)}
                        className="mb-8 text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                        ZIP output structure
                    </motion.h2>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/50 p-6 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03]"
                    >
                        <motion.div
                            variants={fadeUp(0)}
                            className="mb-5 flex items-center gap-2 text-sm text-gray-500 dark:text-white/40"
                        >
                            <FolderOpen size={16} />
                            <span className="font-mono">compressed-images-&lt;timestamp&gt;.zip</span>
                        </motion.div>

                        <div className="space-y-2 font-mono text-sm">
                            {[
                                { indent: 0, type: "folder", text: "batch-1/", highlight: true },
                                { indent: 1, type: "image", text: "image-1.jpg" },
                                { indent: 1, type: "image", text: "image-2.png" },
                                { indent: 1, type: "image", text: "image-3.webp" },
                                { indent: 0, type: "folder", text: "batch-2/", highlight: true },
                                { indent: 1, type: "image", text: "image-4.jpg" },
                                { indent: 1, type: "image", text: "image-5.png" },
                            ].map(({ indent, type, text, highlight }, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeUp(i * 0.03)}
                                    className="flex items-center gap-2 text-gray-600 transition-all hover:translate-x-1 dark:text-white/50"
                                    style={{ paddingLeft: `${indent * 24}px` }}
                                >
                                    {type === "folder" ? (
                                        <Folder size={14} className="shrink-0 text-blue-500" />
                                    ) : (
                                        <Image size={14} className="shrink-0 text-gray-400" />
                                    )}
                                    <span
                                        className={
                                            highlight
                                                ? "font-semibold text-blue-600 dark:text-blue-400"
                                                : ""
                                        }
                                    >
                                        {text}
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            variants={fadeUp(0.2)}
                            className="mt-6 flex items-start gap-3 rounded-xl border border-blue-200/60 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 px-5 py-4 dark:border-blue-800/20 dark:from-blue-950/20 dark:to-indigo-950/20"
                        >
                            <Info size={16} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                            <p className="text-xs leading-relaxed text-gray-700 dark:text-white/45">
                                Batch size and base name are fully configurable. Increasing batch size groups more
                                images per folder. Default batch size is 10.
                            </p>
                        </motion.div>
                    </motion.div>
                </section>

                {/* ── Browser Compatibility (Enhanced) ── */}
                <section className="mb-28">
                    <motion.div {...fadeUp(0)} className="mb-3">
                        <SectionLabel>Compatibility</SectionLabel>
                    </motion.div>
                    <motion.h2
                        {...fadeUp(0.06)}
                        className="mb-8 text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                        Browser compatibility
                    </motion.h2>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid gap-5 sm:grid-cols-3"
                    >
                        {[
                            {
                                browser: "Chrome / Edge",
                                support: "Full",
                                note: "Best format support including HEIC decode. Recommended.",
                                ok: true,
                                icon: Globe,
                            },
                            {
                                browser: "Firefox",
                                support: "Good",
                                note: "Full Canvas support. WebP output works. HEIC may not decode.",
                                ok: true,
                                icon: Shield,
                            },
                            {
                                browser: "Safari",
                                support: "Partial",
                                note: "WebP output limited in older versions. HEIC decode on recent Safari.",
                                ok: false,
                                icon: MonitorSmartphone,
                            },
                        ].map(({ browser, support, note, ok, icon: Icon }, idx) => (
                            <motion.div
                                key={browser}
                                variants={cardHover}
                                initial="rest"
                                whileHover="hover"
                                animate="rest"
                                className="rounded-2xl border border-gray-200/80 bg-white/50 p-5 backdrop-blur-sm transition-all dark:border-white/[0.08] dark:bg-white/[0.03]"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon size={16} className="text-blue-500" />
                                        <span className="font-semibold text-gray-800 dark:text-white">
                                            {browser}
                                        </span>
                                    </div>
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${ok
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                            : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                            }`}
                                    >
                                        {support}
                                    </span>
                                </div>
                                <p className="text-xs leading-relaxed text-gray-500 dark:text-white/35">
                                    {note}
                                </p>
                                {ok && (
                                    <div className="mt-3 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 size={12} />
                                        <span className="text-[10px] font-medium">Fully supported</span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div
                        variants={fadeUp(0.2)}
                        className="mt-6 flex items-start gap-3 rounded-xl border border-blue-200/60 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 px-5 py-4 dark:border-blue-800/20 dark:from-blue-950/20 dark:to-indigo-950/20"
                    >
                        <Keyboard size={16} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs leading-relaxed text-gray-700 dark:text-white/45">
                            Requires a modern browser with <strong className="text-gray-800 dark:text-white/70">Canvas API</strong> and{" "}
                            <strong className="text-gray-800 dark:text-white/70">crypto.subtle</strong> (HTTPS needed for SHA‑256).
                            Quantipixor follows <strong className="text-gray-800 dark:text-white/70">WCAG 2.2 AA</strong> with keyboard‑first interactions and visible focus states.
                        </p>
                    </motion.div>
                </section>

                {/* ── FAQ (Enhanced) ── */}
                <section className="mb-12">
                    <motion.div {...fadeUp(0)} className="mb-3">
                        <SectionLabel>FAQ</SectionLabel>
                    </motion.div>
                    <motion.h2
                        {...fadeUp(0.06)}
                        className="mb-8 text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                        Troubleshooting & FAQs
                    </motion.h2>

                    <div className="space-y-3">
                        {FAQS.map((faq, i) => (
                            <FaqItem key={faq.q} {...faq} index={i} />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}