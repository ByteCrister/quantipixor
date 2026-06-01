// src/components/help/HelpPage.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
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
    Image as ImgIcon,
    Sparkles,
    Shield,
    Globe,
    CheckCircle2,
    ArrowRight,
    Scissors,
    Cpu,
    FileText,
    Eye,
    Code,
    FileJson,
    Search,
    AlignLeft,
    UserPlus,
    SlidersHorizontal,
    Copy,
    CreditCard,
} from "lucide-react";
import { inter, spaceGrotesk } from "@/styles/google-fonts";

// ── Enhanced Animation Variants (kept exactly from original) ─────────────────
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

// ── Sub-components (kept exactly from original) ─────────────────────────────
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.span
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50 px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-sm dark:border-blue-800/30 dark:from-blue-950/40 dark:to-indigo-950/40 dark:text-blue-300"
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
            className="group overflow-hidden rounded-2xl border border-gray-200/80 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:border-blue-300/50 hover:shadow-lg dark:border-white/8 dark:bg-white/3 dark:hover:border-blue-500/30"
        >
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-all duration-200 hover:bg-gray-50/50 dark:hover:bg-white/4"
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
                        <div className="border-t border-gray-200/50 px-6 pb-5 pt-4 dark:border-white/5">
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
                className={`relative z-10 h-full rounded-2xl border border-gray-200/60 bg-linear-to-br ${step.bgLight} ${step.bgDark} p-6 backdrop-blur-sm transition-all duration-300 dark:border-white/8`}
            >
                <div
                    className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-linear-to-br ${step.gradient} opacity-10 blur-2xl transition-all duration-500 group-hover:opacity-20`}
                />
                <div className="relative">
                    <motion.div
                        variants={iconGlow}
                        initial="rest"
                        whileHover="hover"
                        className="mb-5 inline-flex rounded-2xl bg-linear-to-br from-white to-gray-100 p-3 shadow-md dark:from-gray-800 dark:to-gray-900"
                    >
                        <Icon className={`h-6 w-6 bg-linear-to-br ${step.gradient} bg-clip-text`} />
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
            {index < STEPS.length - 1 && (
                <div className="absolute -right-6 top-1/2 hidden -translate-y-1/2 text-gray-300 dark:text-white/10 lg:block">
                    <ArrowRight size={20} className="rotate-45" />
                </div>
            )}
        </motion.div>
    );
};

// ── Data: Batch Compressor (original data preserved verbatim) ────────────────
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

// ── Data: All tool steps ──────────────────────────────────────────────────────
const CONVERTER_STEPS = [
    {
        num: "01",
        icon: Upload,
        title: "Upload",
        desc: "Select an image file (JPEG, PNG, WebP, AVIF, GIF, BMP, SVG). The tool previews it immediately in the browser.",
        gradient: "from-blue-500 to-indigo-600",
        bgLight: "bg-blue-50",
        bgDark: "dark:bg-blue-500/5",
    },
    {
        num: "02",
        icon: Settings,
        title: "Configure",
        desc: "Choose the output format (JPEG, PNG, WebP, AVIF) or select Base64 to get a data URI. Use the crop tool to trim before converting.",
        gradient: "from-purple-500 to-pink-600",
        bgLight: "bg-purple-50",
        bgDark: "dark:bg-purple-500/5",
    },
    {
        num: "03",
        icon: Download,
        title: "Download",
        desc: "Click Convert. The output file downloads instantly — no server involved.",
        gradient: "from-emerald-500 to-teal-600",
        bgLight: "bg-emerald-50",
        bgDark: "dark:bg-emerald-500/5",
    },
];

const REMOVEBG_STEPS = [
    {
        num: "01",
        icon: Upload,
        title: "Upload",
        desc: "Drop or select any image. Supported: JPEG, PNG, WebP.",
        gradient: "from-green-500 to-emerald-600",
        bgLight: "bg-green-50",
        bgDark: "dark:bg-green-500/5",
    },
    {
        num: "02",
        icon: Scissors,
        title: "Process",
        desc: "Click Remove Background. The tool first tries @imgly's on-device AI model (no data leaves your browser). If the model fails to load, it falls back to a server-side HuggingFace inference call.",
        gradient: "from-teal-500 to-cyan-600",
        bgLight: "bg-teal-50",
        bgDark: "dark:bg-teal-500/5",
    },
    {
        num: "03",
        icon: Download,
        title: "Download",
        desc: "Download the result as a transparent PNG. Use the preview toggle to check edges before downloading.",
        gradient: "from-blue-500 to-indigo-600",
        bgLight: "bg-blue-50",
        bgDark: "dark:bg-blue-500/5",
    },
];

const OCR_STEPS = [
    {
        num: "01",
        icon: Upload,
        title: "Upload",
        desc: "Select an image containing printed or handwritten text (JPEG, PNG, WebP).",
        gradient: "from-amber-500 to-orange-600",
        bgLight: "bg-amber-50",
        bgDark: "dark:bg-amber-500/5",
    },
    {
        num: "02",
        icon: Cpu,
        title: "Choose Engine",
        desc: "Pick an OCR engine: Gemini (best accuracy, requires API key), OCR.Space (cloud, no key needed), or Tesseract.js (fully local, no network).",
        gradient: "from-orange-500 to-red-600",
        bgLight: "bg-orange-50",
        bgDark: "dark:bg-orange-500/5",
    },
    {
        num: "03",
        icon: FileText,
        title: "Extract",
        desc: "Click Extract. The tool returns structured text with paragraph detection and formatting hints.",
        gradient: "from-purple-500 to-pink-600",
        bgLight: "bg-purple-50",
        bgDark: "dark:bg-purple-500/5",
    },
    {
        num: "04",
        icon: Download,
        title: "Export",
        desc: "Download the result as a .docx file. Supports 5 languages: English, French, German, Spanish, Portuguese.",
        gradient: "from-emerald-500 to-teal-600",
        bgLight: "bg-emerald-50",
        bgDark: "dark:bg-emerald-500/5",
    },
];

const FAVICON_STEPS = [
    {
        num: "01",
        icon: Upload,
        title: "Upload",
        desc: "Select a square image (PNG recommended, min 256×256 px). Non-square images are auto-cropped to the largest centered square.",
        gradient: "from-indigo-500 to-purple-600",
        bgLight: "bg-indigo-50",
        bgDark: "dark:bg-indigo-500/5",
    },
    {
        num: "02",
        icon: Eye,
        title: "Preview",
        desc: "The tool generates previews at 16×16, 32×32, 48×48, and 256×256 px. Verify sharpness at small sizes before downloading.",
        gradient: "from-purple-500 to-pink-600",
        bgLight: "bg-purple-50",
        bgDark: "dark:bg-purple-500/5",
    },
    {
        num: "03",
        icon: Download,
        title: "Download",
        desc: "Click Generate. You receive a multi-resolution .ico file processed by Sharp on the server. Drop it in your project root as favicon.ico.",
        gradient: "from-blue-500 to-indigo-600",
        bgLight: "bg-blue-50",
        bgDark: "dark:bg-blue-500/5",
    },
];

const RESIZER_STEPS = [
    {
        num: "01",
        icon: Upload,
        title: "Upload",
        desc: "Select any image (JPEG, PNG, WebP, AVIF).",
        gradient: "from-teal-500 to-cyan-600",
        bgLight: "bg-teal-50",
        bgDark: "dark:bg-teal-500/5",
    },
    {
        num: "02",
        icon: Settings,
        title: "Configure",
        desc: "Enter target width and height in pixels, or choose a preset (HD 1280×720, Full HD 1920×1080, 4K 3840×2160, Twitter, Instagram, LinkedIn). Toggle aspect-lock to prevent distortion.",
        gradient: "from-cyan-500 to-blue-600",
        bgLight: "bg-cyan-50",
        bgDark: "dark:bg-cyan-500/5",
    },
    {
        num: "03",
        icon: Download,
        title: "Download",
        desc: "Click Resize. The output downloads immediately — all processing happens in the browser via Canvas API.",
        gradient: "from-blue-500 to-indigo-600",
        bgLight: "bg-blue-50",
        bgDark: "dark:bg-blue-500/5",
    },
];

const DIAGRAMS_STEPS = [
    {
        num: "01",
        icon: Code,
        title: "Write",
        desc: "Type Mermaid or PlantUML syntax in the left-hand editor panel. The diagram re-renders live as you type.",
        gradient: "from-rose-500 to-pink-600",
        bgLight: "bg-rose-50",
        bgDark: "dark:bg-rose-500/5",
    },
    {
        num: "02",
        icon: Eye,
        title: "Preview",
        desc: "The right panel renders the diagram in real time. Switch between Mermaid and PlantUML using the toolbar toggle. Supported types: flowchart, ERD, sequence, class, Gantt.",
        gradient: "from-pink-500 to-purple-600",
        bgLight: "bg-pink-50",
        bgDark: "dark:bg-pink-500/5",
    },
    {
        num: "03",
        icon: Download,
        title: "Export",
        desc: "Download the diagram as SVG or PNG. Your diagrams are saved locally in the browser — no account needed.",
        gradient: "from-purple-500 to-indigo-600",
        bgLight: "bg-purple-50",
        bgDark: "dark:bg-purple-500/5",
    },
];

const JSON_STEPS = [
    {
        num: "01",
        icon: FileJson,
        title: "Paste / Upload",
        desc: "Paste raw JSON into the editor or upload a .json file. Files up to 50 MB are supported.",
        gradient: "from-blue-500 to-indigo-600",
        bgLight: "bg-blue-50",
        bgDark: "dark:bg-blue-500/5",
    },
    {
        num: "02",
        icon: Search,
        title: "Explore",
        desc: "The viewer parses the JSON in a Web Worker (non-blocking) and renders it as an interactive card tree. Expand and collapse nodes, search keys, and copy values.",
        gradient: "from-indigo-500 to-purple-600",
        bgLight: "bg-indigo-50",
        bgDark: "dark:bg-indigo-500/5",
    },
    {
        num: "03",
        icon: AlignLeft,
        title: "Format",
        desc: "Use the Format button to pretty-print the raw JSON with configurable indentation (2 or 4 spaces).",
        gradient: "from-purple-500 to-pink-600",
        bgLight: "bg-purple-50",
        bgDark: "dark:bg-purple-500/5",
    },
];

const MOCKPROFILE_STEPS = [
    {
        num: "01",
        icon: UserPlus,
        title: "Generate",
        desc: "Click Generate Profile. The server queries MongoDB to return a realistic fake user profile including name, avatar, address, job title, and contact details.",
        gradient: "from-emerald-500 to-teal-600",
        bgLight: "bg-emerald-50",
        bgDark: "dark:bg-emerald-500/5",
    },
    {
        num: "02",
        icon: SlidersHorizontal,
        title: "Customize",
        desc: "Filter by nationality, gender, or age range using the sidebar controls. Each generation is unique.",
        gradient: "from-teal-500 to-cyan-600",
        bgLight: "bg-teal-50",
        bgDark: "dark:bg-teal-500/5",
    },
    {
        num: "03",
        icon: Copy,
        title: "Copy",
        desc: "Copy the profile as JSON or as individual fields. Use it for UI mockups, test fixtures, or demo data.",
        gradient: "from-cyan-500 to-blue-600",
        bgLight: "bg-cyan-50",
        bgDark: "dark:bg-cyan-500/5",
    },
];

const STRIPE_STEPS = [
    {
        num: "01",
        icon: CreditCard,
        title: "Configure",
        desc: "Enter a customer name and email, or use the auto-fill button to generate realistic test data.",
        gradient: "from-violet-500 to-purple-600",
        bgLight: "bg-violet-50",
        bgDark: "dark:bg-violet-500/5",
    },
    {
        num: "02",
        icon: UserPlus,
        title: "Create",
        desc: "Click Create Customer. The tool calls the Stripe API in test mode to create a real Stripe Customer object and attach a test payment method (e.g. card 4242 4242 4242 4242).",
        gradient: "from-purple-500 to-pink-600",
        bgLight: "bg-purple-50",
        bgDark: "dark:bg-purple-500/5",
    },
    {
        num: "03",
        icon: Search,
        title: "Inspect",
        desc: "The Stripe Customer ID and payment method details are displayed. Use them in your own Stripe integration tests.",
        gradient: "from-pink-500 to-rose-600",
        bgLight: "bg-pink-50",
        bgDark: "dark:bg-pink-500/5",
    },
];

// ── Config tables for other tools ─────────────────────────────────────────────
const CONVERTER_CONFIG = [
    { setting: "Output Format", range: "JPEG/PNG/WebP/AVIF/Base64", default: "JPEG", desc: "Target encoding" },
    { setting: "Quality", range: "0.1 – 1.0", default: "0.92", desc: "Applies to JPEG and WebP" },
    { setting: "Crop", range: "optional", default: "off", desc: "Trim image before converting" },
];

const OCR_CONFIG = [
    { setting: "Engine", range: "Gemini / OCR.Space / Tesseract", default: "Tesseract", desc: "OCR backend" },
    { setting: "Language", range: "en/fr/de/es/pt", default: "en", desc: "Output language" },
    { setting: "Export format", range: ".docx / plain text", default: ".docx", desc: "Download format" },
];

const RESIZER_CONFIG = [
    { setting: "Width", range: "1 – 8000 px", default: "original", desc: "Output width in pixels" },
    { setting: "Height", range: "1 – 8000 px", default: "original", desc: "Output height in pixels" },
    { setting: "Aspect lock", range: "on / off", default: "on", desc: "Maintain original aspect ratio" },
];

// ── New FAQ array (12 items covering all tools) ──────────────────────────────
const FAQS = [
    // Compressor
    {
        q: "Why is my HEIC/TIFF not compressing?",
        a: "Browser Canvas support varies. HEIC/TIFF may not decode on all browsers. Chrome and Safari 16+ have the best format support. For other browsers, convert to JPEG or PNG first.",
    },
    {
        q: "Why did my file become PNG after compression?",
        a: "Canvas can only reliably output JPEG, WebP, and PNG. All other input formats (GIF, BMP, SVG, AVIF, etc.) are rasterized to PNG during compression.",
    },
    {
        q: "Can I re-compress with different settings?",
        a: "Yes — use the 'Reset for Recompress' action. This keeps files in the queue but clears previous results, letting you adjust settings and compress again.",
    },
    // Converter
    {
        q: "What is Base64 output used for?",
        a: "Base64 produces a data: URI you can embed directly in HTML <img src> or CSS background-image. It is useful for small icons or when you want to avoid a separate HTTP request.",
    },
    {
        q: "Why does my converted file look different from the original?",
        a: "JPEG and WebP are lossy formats. If you need pixel-perfect output, choose PNG. The quality slider controls the compression level for JPEG and WebP.",
    },
    // AI Background Removal
    {
        q: "The background removal result has rough edges — what can I do?",
        a: "The on-device @imgly model works best on images with clear contrast between subject and background. For complex scenes, try the HuggingFace server fallback, which uses a different model.",
    },
    {
        q: "I hit a rate limit on background removal — what does that mean?",
        a: "The server-side HuggingFace fallback is rate-limited via Redis. If you see a rate limit error, wait 60 seconds and try again, or use the on-device model by refreshing the page.",
    },
    // OCR Formatter
    {
        q: "Which OCR engine should I use?",
        a: "Use Gemini for the best accuracy on complex documents (requires a Google API key). Use OCR.Space for a quick cloud option with no setup. Use Tesseract.js for fully private, offline extraction.",
    },
    {
        q: "Why is my .docx export empty?",
        a: "This usually means the OCR engine returned no text. Check that the image has sufficient resolution (at least 150 DPI) and that the text is not rotated more than 15 degrees.",
    },
    // Diagram Studio
    {
        q: "My diagram syntax is correct but nothing renders — why?",
        a: "Check the error panel below the editor for a parse error message. Common issues: missing semicolons in PlantUML, incorrect arrow syntax in Mermaid, or unsupported diagram type for the selected engine.",
    },
    {
        q: "I lost my diagram after clearing browser data — can I recover it?",
        a: "Diagrams are stored in localStorage, which is cleared with browser data. Always export your diagrams as SVG or PNG before clearing. There is no server-side backup.",
    },
    // JSON Viewer
    {
        q: "The viewer is slow on a large JSON file — is that expected?",
        a: "Parsing runs in a Web Worker so the UI stays responsive, but rendering a very large tree (>10 MB) can be slow. Use the collapse-all button to render only the top level, then expand nodes as needed.",
    },
];

// ── Tool tab configuration ────────────────────────────────────────────────────
const TOOLS = [
    { id: "compressor", label: "Batch Compressor", category: "Image Tools", route: "/image/batch-compressor" },
    { id: "converter", label: "Image Converter", category: "Image Tools", route: "/image/converter" },
    { id: "removebg", label: "Remove BG", category: "Image Tools", route: "/image/remove-bg" },
    { id: "ocr", label: "OCR Formatter", category: "Image Tools", route: "/image/ocr-doc-formatter" },
    { id: "favicon", label: "Favicon Generator", category: "Image Tools", route: "/image/generate-favicon" },
    { id: "resizer", label: "Image Resizer", category: "Image Tools", route: "/image/resizer" },
    { id: "diagrams", label: "Diagram Studio", category: "Developer Tools", route: "/diagrams" },
    { id: "json", label: "JSON Viewer", category: "Developer Tools", route: "/mock/json-viewer" },
    { id: "mockprofile", label: "Mock Profile", category: "Developer Tools", route: "/mock/profile" },
    { id: "stripe", label: "Stripe Test", category: "Developer Tools", route: "/mock/stripe-test-customers" },
];

// ── Helper: render a config table (reused from original style) ────────────────
function ConfigTable({ rows }: { rows: { setting: string; range: string; default: string; desc: string; icon?: React.ElementType }[] }) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/50 backdrop-blur-sm dark:border-white/8 dark:bg-white/2"
        >
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200/80 bg-gray-50/50 dark:border-white/5 dark:bg-white/2">
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-white/70">Setting</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-white/70">Range</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-white/70">Default</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-white/70">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => {
                            const Icon = row.icon || Settings;
                            return (
                                <motion.tr
                                    key={row.setting}
                                    variants={fadeUp(idx * 0.05)}
                                    className="border-b border-gray-200/50 transition-colors hover:bg-gray-50/40 dark:border-white/4 dark:hover:bg-white/2"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Icon size={14} className="text-blue-500" />
                                            <span className="font-medium text-gray-800 dark:text-white/80">{row.setting}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-white/50">{row.range}</td>
                                    <td className="px-6 py-4 font-mono text-sm text-gray-600 dark:text-white/50">{row.default}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-white/40">{row.desc}</td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function HelpPage() {
    const [activeTab, setActiveTab] = useState<string>("compressor");

    const handleTabClick = (id: string) => {
        setActiveTab(id);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <main
            className={`${inter.variable} ${spaceGrotesk.variable} relative min-h-screen overflow-x-hidden bg-linear-to-br from-gray-50 via-white to-gray-100 font-sans text-gray-900 dark:from-[#03050b] dark:via-[#060912] dark:to-[#0a0f1a] dark:text-white`}
        >
            {/* ── Background Decorations (unchanged) ── */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <motion.div
                    animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-linear-to-r from-blue-400/20 to-indigo-500/20 blur-3xl dark:from-blue-600/10 dark:to-indigo-700/10"
                />
                <motion.div
                    animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-40 right-10 h-96 w-96 rounded-full bg-linear-to-r from-purple-400/15 to-pink-500/15 blur-3xl dark:from-purple-600/8 dark:to-pink-700/8"
                />
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-500/5"
                />
                <div
                    className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
                    style={{
                        backgroundImage: "radial-gradient(circle at 1px 1px, #1856FF 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />
            </div>

            <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
                {/* ── Hero Section ── */}
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
                        className="mb-4 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-blue-500/10 to-indigo-500/10 px-4 py-1.5 text-sm font-medium text-blue-700 backdrop-blur-sm dark:from-blue-400/10 dark:to-indigo-400/10 dark:text-blue-300"
                    >
                        <Sparkles size={16} />
                        <span>Quantipixor Help Center</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="mb-4 bg-linear-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-white dark:via-blue-300 dark:to-white sm:text-5xl lg:text-6xl"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                        How to use every tool
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-white/50"
                    >
                        Step-by-step guides, configuration references, and troubleshooting for all 10 Quantipixor tools.
                    </motion.p>
                </motion.div>

                {/* ── Tool Navigation Tabs ── */}
                <motion.div
                    {...fadeUp(0.1)}
                    className="mb-16 overflow-x-auto whitespace-nowrap scrollbar-hide"
                >
                    <div className="inline-flex gap-2 rounded-2xl border border-gray-200/60 bg-white/40 p-1.5 backdrop-blur-sm dark:border-white/8 dark:bg-white/[0.03]">
                        {TOOLS.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => handleTabClick(tool.id)}
                                aria-label={`Jump to ${tool.label} help section`}
                                aria-current={activeTab === tool.id ? "true" : undefined}
                                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${activeTab === tool.id
                                    ? "bg-[#1856FF] text-white shadow-md"
                                    : "text-gray-700 hover:bg-gray-100 dark:text-white/70 dark:hover:bg-white/10"
                                    }`}
                            >
                                {tool.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* ── Tool Sections ── */}
                {/* 1. Batch Compressor */}
                <section id="compressor" className="mb-28 scroll-mt-24">
                    <SectionLabel>Image Tools</SectionLabel>
                    <motion.h2
                        {...fadeUp(0.06)}
                        className="mb-2 text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                        Batch Compressor
                    </motion.h2>
                    <motion.p {...fadeUp(0.1)} className="mb-8 text-gray-600 dark:text-white/50">
                        Compress multiple images at once with configurable quality and batch‑wise ZIP output.
                        <Link href="/image/batch-compressor" className="ml-2 inline-flex items-center gap-1 text-blue-600 underline underline-offset-2 dark:text-blue-400">
                            Open Tool → <ArrowRight size={14} />
                        </Link>
                    </motion.p>

                    <motion.h3
                        {...fadeUp(0)}
                        className="mb-8 text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                        Simple 4‑step compression workflow
                    </motion.h3>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {STEPS.map((step, idx) => (
                            <StepCard key={step.title} step={step} index={idx} />
                        ))}
                    </div>

                    {/* Config table */}
                    <div className="mt-12">
                        <motion.div {...fadeUp(0)} className="mb-3">
                            <SectionLabel>Configuration</SectionLabel>
                        </motion.div>
                        <motion.h3
                            {...fadeUp(0.06)}
                            className="mb-6 text-2xl font-bold tracking-tight"
                            style={{ fontFamily: "var(--font-space-grotesk)" }}
                        >
                            Adjustable parameters
                        </motion.h3>
                        <ConfigTable rows={CONFIG_TABLE} />
                    </div>

                    {/* ZIP output structure */}
                    <div className="mt-12">
                        <motion.div {...fadeUp(0)} className="mb-3">
                            <SectionLabel>Output</SectionLabel>
                        </motion.div>
                        <motion.h3
                            {...fadeUp(0.06)}
                            className="mb-6 text-2xl font-bold tracking-tight"
                            style={{ fontFamily: "var(--font-space-grotesk)" }}
                        >
                            ZIP output structure
                        </motion.h3>
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/50 p-6 backdrop-blur-sm dark:border-white/8 dark:bg-white/3"
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
                                            <ImgIcon size={14} className="shrink-0 text-gray-400" />
                                        )}
                                        <span className={highlight ? "font-semibold text-blue-600 dark:text-blue-400" : ""}>
                                            {text}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                            <motion.div
                                variants={fadeUp(0.2)}
                                className="mt-6 flex items-start gap-3 rounded-xl border border-blue-200/60 bg-linear-to-r from-blue-50/50 to-indigo-50/50 px-5 py-4 dark:border-blue-800/20 dark:from-blue-950/20 dark:to-indigo-950/20"
                            >
                                <Info size={16} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                                <p className="text-xs leading-relaxed text-gray-700 dark:text-white/45">
                                    Batch size and base name are fully configurable. Increasing batch size groups more
                                    images per folder. Default batch size is 10.
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* 2. Image Converter */}
                <section id="converter" className="mb-28 scroll-mt-24">
                    <SectionLabel>Image Tools</SectionLabel>
                    <motion.h2
                        {...fadeUp(0.06)}
                        className="mb-2 text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                        Image Converter
                    </motion.h2>
                    <motion.p {...fadeUp(0.1)} className="mb-8 text-gray-600 dark:text-white/50">
                        Convert images between JPEG, PNG, WebP, AVIF and Base64, with optional cropping.
                        <Link href="/image/converter" className="ml-2 inline-flex items-center gap-1 text-blue-600 underline underline-offset-2 dark:text-blue-400">
                            Open Tool → <ArrowRight size={14} />
                        </Link>
                    </motion.p>

                    <div className="grid gap-6 sm:grid-cols-3">
                        {CONVERTER_STEPS.map((step, idx) => (
                            <StepCard key={step.title} step={step} index={idx} />
                        ))}
                    </div>
                    <div className="mt-10">
                        <ConfigTable rows={CONVERTER_CONFIG} />
                    </div>
                    <motion.div
                        {...fadeUp(0.2)}
                        className="mt-6 flex items-start gap-3 rounded-xl border border-blue-200/60 bg-linear-to-r from-blue-50/50 to-indigo-50/50 px-5 py-4 dark:border-blue-800/20 dark:from-blue-950/20 dark:to-indigo-950/20"
                    >
                        <Info size={16} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs leading-relaxed text-gray-700 dark:text-white/45">
                            Base64 output produces a data: URI string you can embed directly in HTML or CSS. The string is copied to clipboard automatically.
                        </p>
                    </motion.div>
                </section>

                {/* 3. AI Background Removal */}
                <section id="removebg" className="mb-28 scroll-mt-24">
                    <SectionLabel>Image Tools</SectionLabel>
                    <motion.h2
                        {...fadeUp(0.06)}
                        className="mb-2 text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                        AI Background Removal
                    </motion.h2>
                    <motion.p {...fadeUp(0.1)} className="mb-8 text-gray-600 dark:text-white/50">
                        Remove image backgrounds with on-device AI or HuggingFace fallback.
                        <Link href="/image/remove-bg" className="ml-2 inline-flex items-center gap-1 text-blue-600 underline underline-offset-2 dark:text-blue-400">
                            Open Tool → <ArrowRight size={14} />
                        </Link>
                    </motion.p>

                    <div className="grid gap-6 sm:grid-cols-3">
                        {REMOVEBG_STEPS.map((step, idx) => (
                            <StepCard key={step.title} step={step} index={idx} />
                        ))}
                    </div>
                    <motion.div
                        {...fadeUp(0.2)}
                        className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200/60 bg-linear-to-r from-amber-50/50 to-yellow-50/50 px-5 py-4 dark:border-amber-800/20 dark:from-amber-950/20 dark:to-yellow-950/20"
                    >
                        <Info size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <p className="text-xs leading-relaxed text-gray-700 dark:text-white/45">
                            The on-device model requires a modern browser with WebAssembly support. The server-side fallback is rate-limited via Redis — if you hit the limit, wait 60 seconds and try again.
                        </p>
                    </motion.div>
                </section>

                {/* 4. OCR Document Formatter */}
                <section id="ocr" className="mb-28 scroll-mt-24">
                    <SectionLabel>Image Tools</SectionLabel>
                    <motion.h2
                        {...fadeUp(0.06)}
                        className="mb-2 text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                        OCR Document Formatter
                    </motion.h2>
                    <motion.p {...fadeUp(0.1)} className="mb-8 text-gray-600 dark:text-white/50">
                        Extract text from images using Gemini, OCR.Space, or Tesseract.js and export as .docx.
                        <Link href="/image/ocr-doc-formatter" className="ml-2 inline-flex items-center gap-1 text-blue-600 underline underline-offset-2 dark:text-blue-400">
                            Open Tool → <ArrowRight size={14} />
                        </Link>
                    </motion.p>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {OCR_STEPS.map((step, idx) => (
                            <StepCard key={step.title} step={step} index={idx} />
                        ))}
                    </div>
                    <div className="mt-10">
                        <ConfigTable rows={OCR_CONFIG} />
                    </div>
                    <motion.div
                        {...fadeUp(0.2)}
                        className="mt-6 flex items-start gap-3 rounded-xl border border-blue-200/60 bg-linear-to-r from-blue-50/50 to-indigo-50/50 px-5 py-4 dark:border-blue-800/20 dark:from-blue-950/20 dark:to-indigo-950/20"
                    >
                        <Info size={16} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs leading-relaxed text-gray-700 dark:text-white/45">
                            Gemini requires a valid GOOGLE_API_KEY environment variable set on the server. OCR.Space uses a shared free-tier key with rate limits. For fully private extraction with no network calls, use Tesseract.js.
                        </p>
                    </motion.div>
                </section>

                {/* 5. Favicon Generator */}
                <section id="favicon" className="mb-28 scroll-mt-24">
                    <SectionLabel>Image Tools</SectionLabel>
                    <motion.h2
                        {...fadeUp(0.06)}
                        className="mb-2 text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                        Favicon Generator
                    </motion.h2>
                    <motion.p {...fadeUp(0.1)} className="mb-8 text-gray-600 dark:text-white/50">
                        Generate multi‑resolution .ico favicons from a single image.
                        <Link href="/image/generate-favicon" className="ml-2 inline-flex items-center gap-1 text-blue-600 underline underline-offset-2 dark:text-blue-400">
                            Open Tool → <ArrowRight size={14} />
                        </Link>
                    </motion.p>

                    <div className="grid gap-6 sm:grid-cols-3">
                        {FAVICON_STEPS.map((step, idx) => (
                            <StepCard key={step.title} step={step} index={idx} />
                        ))}
                    </div>
                    <motion.div
                        {...fadeUp(0.2)}
                        className="mt-6 flex items-start gap-3 rounded-xl border border-blue-200/60 bg-linear-to-r from-blue-50/50 to-indigo-50/50 px-5 py-4 dark:border-blue-800/20 dark:from-blue-950/20 dark:to-indigo-950/20"
                    >
                        <Info size={16} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs leading-relaxed text-gray-700 dark:text-white/45">
                            The .ico file embeds all four resolutions in a single file. Browsers automatically pick the best resolution. For modern browsers you can also use the PNG directly via &lt;link rel=&apos;icon&apos; type=&apos;image/png&apos;&gt;.
                        </p>
                    </motion.div>
                </section>

                {/* 6. Image Resizer */}
                <section id="resizer" className="mb-28 scroll-mt-24">
                    <SectionLabel>Image Tools</SectionLabel>
                    <motion.h2
                        {...fadeUp(0.06)}
                        className="mb-2 text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                        Image Resizer
                    </motion.h2>
                    <motion.p {...fadeUp(0.1)} className="mb-8 text-gray-600 dark:text-white/50">
                        Resize images to exact dimensions or popular social media presets.
                        <Link href="/image/resizer" className="ml-2 inline-flex items-center gap-1 text-blue-600 underline underline-offset-2 dark:text-blue-400">
                            Open Tool → <ArrowRight size={14} />
                        </Link>
                    </motion.p>

                    <div className="grid gap-6 sm:grid-cols-3">
                        {RESIZER_STEPS.map((step, idx) => (
                            <StepCard key={step.title} step={step} index={idx} />
                        ))}
                    </div>
                    <div className="mt-10">
                        <ConfigTable rows={RESIZER_CONFIG} />
                    </div>
                </section>

                {/* 7. Diagram Studio */}
                <section id="diagrams" className="mb-28 scroll-mt-24">
                    <SectionLabel>Developer Tools</SectionLabel>
                    <motion.h2
                        {...fadeUp(0.06)}
                        className="mb-2 text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                        Diagram Studio
                    </motion.h2>
                    <motion.p {...fadeUp(0.1)} className="mb-8 text-gray-600 dark:text-white/50">
                        Create Mermaid & PlantUML diagrams with live preview and local persistence.
                        <Link href="/diagrams" className="ml-2 inline-flex items-center gap-1 text-blue-600 underline underline-offset-2 dark:text-blue-400">
                            Open Tool → <ArrowRight size={14} />
                        </Link>
                    </motion.p>

                    <div className="grid gap-6 sm:grid-cols-3">
                        {DIAGRAMS_STEPS.map((step, idx) => (
                            <StepCard key={step.title} step={step} index={idx} />
                        ))}
                    </div>
                    <motion.div
                        {...fadeUp(0.2)}
                        className="mt-6 flex items-start gap-3 rounded-xl border border-blue-200/60 bg-linear-to-r from-blue-50/50 to-indigo-50/50 px-5 py-4 dark:border-blue-800/20 dark:from-blue-950/20 dark:to-indigo-950/20"
                    >
                        <Info size={16} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs leading-relaxed text-gray-700 dark:text-white/45">
                            Diagrams are persisted in localStorage. Clearing browser data will erase saved diagrams. For permanent storage, export your diagrams before clearing.
                        </p>
                    </motion.div>
                </section>

                {/* 8. JSON Viewer */}
                <section id="json" className="mb-28 scroll-mt-24">
                    <SectionLabel>Developer Tools</SectionLabel>
                    <motion.h2
                        {...fadeUp(0.06)}
                        className="mb-2 text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                        JSON Viewer
                    </motion.h2>
                    <motion.p {...fadeUp(0.1)} className="mb-8 text-gray-600 dark:text-white/50">
                        Explore and format JSON in an interactive tree view, powered by Web Workers.
                        <Link href="/mock/json-viewer" className="ml-2 inline-flex items-center gap-1 text-blue-600 underline underline-offset-2 dark:text-blue-400">
                            Open Tool → <ArrowRight size={14} />
                        </Link>
                    </motion.p>

                    <div className="grid gap-6 sm:grid-cols-3">
                        {JSON_STEPS.map((step, idx) => (
                            <StepCard key={step.title} step={step} index={idx} />
                        ))}
                    </div>
                    <motion.div
                        {...fadeUp(0.2)}
                        className="mt-6 flex items-start gap-3 rounded-xl border border-blue-200/60 bg-linear-to-r from-blue-50/50 to-indigo-50/50 px-5 py-4 dark:border-blue-800/20 dark:from-blue-950/20 dark:to-indigo-950/20"
                    >
                        <Info size={16} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs leading-relaxed text-gray-700 dark:text-white/45">
                            Parsing runs in a Web Worker so the UI stays responsive even for large files. All data stays in your browser — nothing is sent to a server.
                        </p>
                    </motion.div>
                </section>

                {/* 9. Mock Profile Generator */}
                <section id="mockprofile" className="mb-28 scroll-mt-24">
                    <SectionLabel>Developer Tools</SectionLabel>
                    <motion.h2
                        {...fadeUp(0.06)}
                        className="mb-2 text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                        Mock Profile Generator
                    </motion.h2>
                    <motion.p {...fadeUp(0.1)} className="mb-8 text-gray-600 dark:text-white/50">
                        Generate realistic fake user profiles from a MongoDB-backed service.
                        <Link href="/mock/profile" className="ml-2 inline-flex items-center gap-1 text-blue-600 underline underline-offset-2 dark:text-blue-400">
                            Open Tool → <ArrowRight size={14} />
                        </Link>
                    </motion.p>

                    <div className="grid gap-6 sm:grid-cols-3">
                        {MOCKPROFILE_STEPS.map((step, idx) => (
                            <StepCard key={step.title} step={step} index={idx} />
                        ))}
                    </div>
                    <motion.div
                        {...fadeUp(0.2)}
                        className="mt-6 flex items-start gap-3 rounded-xl border border-blue-200/60 bg-linear-to-r from-blue-50/50 to-indigo-50/50 px-5 py-4 dark:border-blue-800/20 dark:from-blue-950/20 dark:to-indigo-950/20"
                    >
                        <Info size={16} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs leading-relaxed text-gray-700 dark:text-white/45">
                            Profile data is generated server-side from a MongoDB collection of seed data. No real personal data is used or stored.
                        </p>
                    </motion.div>
                </section>

                {/* 10. Stripe Test Customers */}
                <section id="stripe" className="mb-28 scroll-mt-24">
                    <SectionLabel>Developer Tools</SectionLabel>
                    <motion.h2
                        {...fadeUp(0.06)}
                        className="mb-2 text-3xl font-bold tracking-tight"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                        Stripe Test Customers
                    </motion.h2>
                    <motion.p {...fadeUp(0.1)} className="mb-8 text-gray-600 dark:text-white/50">
                        Create Stripe test customers with attached payment methods.
                        <Link href="/mock/stripe-test-customers" className="ml-2 inline-flex items-center gap-1 text-blue-600 underline underline-offset-2 dark:text-blue-400">
                            Open Tool → <ArrowRight size={14} />
                        </Link>
                    </motion.p>

                    <div className="grid gap-6 sm:grid-cols-3">
                        {STRIPE_STEPS.map((step, idx) => (
                            <StepCard key={step.title} step={step} index={idx} />
                        ))}
                    </div>
                    <motion.div
                        {...fadeUp(0.2)}
                        className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200/60 bg-linear-to-r from-amber-50/50 to-yellow-50/50 px-5 py-4 dark:border-amber-800/20 dark:from-amber-950/20 dark:to-yellow-950/20"
                    >
                        <Info size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <p className="text-xs leading-relaxed text-gray-700 dark:text-white/45">
                            This tool uses Stripe test mode only. No real charges are made. You must have a valid STRIPE_SECRET_KEY (test key) set in the server environment. Never use a live key here.
                        </p>
                    </motion.div>
                </section>

                {/* ── Browser Compatibility (updated) ── */}
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
                        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
                    >
                        {[
                            {
                                browser: "Chrome / Edge",
                                support: "Full",
                                note: "Best support for all tools. Canvas API, WebAssembly (@imgly), Web Workers, crypto.subtle, and WebP output all work fully.",
                                ok: true,
                                icon: Globe,
                            },
                            {
                                browser: "Firefox",
                                support: "Good",
                                note: "Full Canvas and Web Worker support. WebP output works. @imgly WebAssembly model loads correctly. HEIC decode may fail.",
                                ok: true,
                                icon: Shield,
                            },
                            {
                                browser: "Safari (16+)",
                                support: "Good",
                                note: "WebP output works in Safari 16+. @imgly WebAssembly supported. HEIC decode available natively. Older Safari versions have limited WebP support.",
                                ok: true,
                                icon: MonitorSmartphone,
                            },
                            {
                                browser: "Safari (<16)",
                                support: "Partial",
                                note: "WebP output limited. Some WebAssembly features may not work. Upgrade to Safari 16+ for full tool support.",
                                ok: false,
                                icon: MonitorSmartphone,
                            },
                        ].map(({ browser, support, note, ok, icon: Icon }) => (
                            <motion.div
                                key={browser}
                                variants={cardHover}
                                initial="rest"
                                whileHover="hover"
                                animate="rest"
                                className="rounded-2xl border border-gray-200/80 bg-white/50 p-5 backdrop-blur-sm transition-all dark:border-white/8 dark:bg-white/3"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon size={16} className="text-blue-500" />
                                        <span className="font-semibold text-gray-800 dark:text-white">{browser}</span>
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
                                <p className="text-xs leading-relaxed text-gray-500 dark:text-white/35">{note}</p>
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
                        className="mt-6 flex items-start gap-3 rounded-xl border border-blue-200/60 bg-linear-to-r from-blue-50/50 to-indigo-50/50 px-5 py-4 dark:border-blue-800/20 dark:from-blue-950/20 dark:to-indigo-950/20"
                    >
                        <Keyboard size={16} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                        <p className="text-xs leading-relaxed text-gray-700 dark:text-white/45">
                            Different tools have different browser requirements: <br />
                            • Batch Compressor, Converter, Resizer — Canvas API + crypto.subtle (HTTPS) <br />
                            • AI Background Removal — WebAssembly (on-device) or network (fallback) <br />
                            • OCR Formatter — network access for Gemini/OCR.Space; Tesseract.js is local <br />
                            • Favicon Generator — server-side Sharp pipeline (always works) <br />
                            • Diagram Studio — localStorage for persistence <br />
                            • JSON Viewer — Web Workers for non-blocking parse <br />
                            All tools follow WCAG 2.2 AA with keyboard-first interactions.
                        </p>
                    </motion.div>
                </section>

                {/* ── FAQ ── */}
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