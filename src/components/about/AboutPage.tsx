"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import {
  SiGithub,
  SiLinkerd,
  SiFacebook,
  SiInstagram,
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiFramer,
  SiRadixui,
  SiHuggingface,
  SiOpenai,
  SiVercel,
  SiMongodb,
  SiStripe,
  SiGoogle,
} from "react-icons/si";
import { LuDatabase } from "react-icons/lu";
import {
  Shield,
  FileImage,
  ArrowLeftRight,
  Eraser,
  ScanText,
  Globe,
  Maximize,
  Code2,
  Users,
  CreditCard,
  GitBranch,
} from "lucide-react";

import { SOCIAL_LINKS } from "@/const/social-links.const";
import { inter, jetbrainsMono, plusJakarta } from "@/styles/google-fonts";

// ── Animation helpers (unchanged) ────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ── Updated data: tools replacing the old compressor-only features ────────────
const TOOLS = [
  {
    icon: FileImage,
    label: "Batch Image Compressor",
    desc: "Compress JPG, PNG, WebP, AVIF and 14+ other formats in bulk with quality control, duplicate detection, and ZIP download — all client-side.",
  },
  {
    icon: ArrowLeftRight,
    label: "Image Converter",
    desc: "Convert between JPEG, PNG, WebP, AVIF and more formats with cropping via react-easy-crop.",
  },
  {
    icon: Eraser,
    label: "AI Background Removal",
    desc: "Remove image backgrounds using on-device AI (@imgly) or server fallback via HuggingFace and Gradio.",
  },
  {
    icon: ScanText,
    label: "OCR Document Formatter",
    desc: "Extract text with Google Gemini, OCR.Space, or Tesseract.js. Supports English, Bengali, Arabic, Hindi, Spanish. Export as .docx.",
  },
  {
    icon: Globe,
    label: "Favicon Generator",
    desc: "Upload & crop an image, then server-side Sharp resizing and .ico packaging with multi-resolution output.",
  },
  {
    icon: Maximize,
    label: "Image Resizer",
    desc: "Batch resize with aspect-ratio lock and presets for HD, Full HD, 4K, and social media sizes — 100% Canvas API.",
  },
  {
    icon: Code2,
    label: "JSON Viewer",
    desc: "Paste or upload .json files; card-based interactive layout with Web Worker parsing and pagination.",
  },
  {
    icon: Users,
    label: "Random Profile Generator",
    desc: "Generate realistic mock profiles (name, email, address, avatar) via /api/v1/mock/profiles backed by MongoDB.",
  },
  {
    icon: CreditCard,
    label: "Stripe Test Customer Tool",
    desc: "Create Stripe test customers and attach payment methods using your own key (BYOK) — keys never stored.",
  },
  {
    icon: GitBranch,
    label: "Diagram Studio",
    desc: "Mermaid & PlantUML diagram workspace with template gallery, localStorage persistence, and high-res exports.",
  },
];

const INPUT_FORMATS = [
  "JPG", "JPEG", "JFIF", "PJPEG", "PNG", "APNG",
  "WebP", "GIF", "BMP", "SVG", "ICO", "CUR",
  "AVIF", "TIFF", "TIF", "HEIC", "HEIF",
];

const ALL_TECH = [
  { icon: SiNextdotjs, label: "Next.js 16" },
  { icon: SiReact, label: "React 19" },
  { icon: SiTypescript, label: "TypeScript 5" },
  { icon: SiTailwindcss, label: "Tailwind CSS v4" },
  { icon: SiFramer, label: "Framer Motion" },
  { icon: LuDatabase, label: "Zustand 5" },
  { icon: SiRadixui, label: "Radix UI" },
  { label: "react-easy-crop" },
  { label: "JSZip" },
  { label: "Sharp" },
  { label: "to-ico / icojs" },
  { label: "Tesseract.js" },
  { icon: SiGoogle, label: "Google Gemini" },
  { label: "@imgly/background-removal" },
  { icon: SiHuggingface, label: "HuggingFace" },
  { label: "Gradio" },
  { icon: SiOpenai, label: "Groq SDK" },
  { label: "Upstash Redis" },
  { icon: SiVercel, label: "Vercel Blob" },
  { icon: SiMongodb, label: "MongoDB" },
  { icon: SiStripe, label: "Stripe" },
  { label: "Mermaid.js" },
  { label: "PlantUML" },
  { label: "docx / html-docx-js" },
  { label: "Plus Jakarta Sans" },
  { label: "JetBrains Mono" },
];

const SocialLinks = [
  { icon: SiGithub, label: "GitHub", href: SOCIAL_LINKS.GITHUB },
  { icon: SiLinkerd, label: "LinkedIn", href: SOCIAL_LINKS.LINKEDIN },
  { icon: SiFacebook, label: "Facebook", href: SOCIAL_LINKS.FACEBOOK },
  { icon: SiInstagram, label: "Instagram", href: SOCIAL_LINKS.INSTAGRAM },
];

// ── GlassCard & SectionLabel (unchanged) ──────────────────────────────────────
const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hoverScale?: number;
}> = ({ children, className = "", delay = 0, hoverScale = 1.02 }) => (
  <motion.div
    {...fadeUp(delay)}
    whileHover={{
      y: -6,
      scale: hoverScale,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    }}
    className={`
      relative rounded-2xl border p-6 transition-all duration-300
      bg-white/80 backdrop-blur-sm
      border-gray-200 shadow-sm
      dark:bg-white/4 dark:backdrop-blur-md
      dark:border-white/[0.07] dark:shadow-none
      hover:shadow-xl hover:border-indigo-300/50 dark:hover:border-indigo-500/40
      ${className}
    `}
  >
    {children}
  </motion.div>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.span
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="
      inline-block rounded-full border px-3 py-0.5 font-mono text-[11px] uppercase tracking-[0.18em]
      border-indigo-200 bg-indigo-50 text-indigo-600
      dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300
    "
  >
    {children}
  </motion.span>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <main
      className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} relative min-h-screen overflow-x-hidden bg-white text-gray-900 dark:bg-[#050812] dark:text-white`}
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {/* ── Animated background elements ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 h-130 w-130 rounded-full bg-linear-to-br from-indigo-500/20 via-purple-500/10 to-transparent blur-[100px] dark:from-indigo-600/20 dark:via-purple-600/10"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-32 -right-32 h-105 w-105 rounded-full bg-linear-to-tl from-purple-500/20 via-pink-500/10 to-transparent blur-[90px] dark:from-purple-600/20 dark:via-pink-600/10"
        />
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#4F46E5 1px, transparent 1px), linear-gradient(90deg, #4F46E5 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-5 py-20 sm:px-8">
        {/* ── Hero Section ── */}
        <section className="mb-24 flex flex-col items-center text-center">
          <motion.div {...fadeIn(0)} className="mb-6">
            <SectionLabel>MIT Licensed</SectionLabel>
          </motion.div>

          <motion.h1
            {...fadeUp(0.08)}
            className="mb-4 bg-linear-to-r from-gray-900 via-indigo-600 to-purple-600 bg-clip-text font-['Plus_Jakarta_Sans'] text-5xl font-extrabold tracking-tight text-transparent dark:from-white dark:via-indigo-300 dark:to-purple-300 sm:text-6xl"
          >
            Quanti
            <motion.span
              whileHover={{ scale: 1.05, display: "inline-block" }}
              transition={{ type: "spring", stiffness: 400 }}
              className="bg-linear-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent"
            >
              pixor
            </motion.span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.16)}
            className="mb-10 max-w-xl text-base leading-relaxed text-gray-500 dark:text-white/50"
          >
            A privacy‑first multi‑tool suite — compress, convert, extract, diagram, and
            generate mock data. Most processing stays in your browser; sensitive tasks
            use secure, transient API routes.
          </motion.p>

          {/* Stat pills */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3"
          >
            {[
              ["10+", "Tools"],
              ["18+", "Input formats"],
              ["0", "Data uploaded"],
              ["MIT", "Licensed"],
            ].map(([val, lbl]) => (
              <motion.div
                key={lbl}
                variants={staggerItem}
                whileHover={{ y: -3, scale: 1.05 }}
                className="flex cursor-default items-center gap-2 rounded-full border border-gray-200 bg-gray-50/80 px-4 py-2 backdrop-blur-sm transition-all dark:border-white/8 dark:bg-white/4"
              >
                <span className="font-mono text-sm font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {val}
                </span>
                <span className="text-xs text-gray-500 dark:text-white/40">{lbl}</span>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Overview ── */}
        <section className="mb-20">
          <motion.div {...fadeUp(0)} className="mb-3">
            <SectionLabel>Overview</SectionLabel>
          </motion.div>
          <motion.h2 {...fadeUp(0.08)} className="mb-4 font-['Plus_Jakarta_Sans'] text-3xl font-bold">
            What it does
          </motion.h2>
          <motion.p {...fadeUp(0.14)} className="max-w-2xl text-base leading-relaxed text-gray-500 dark:text-white/50">
            Quantipixor blends client‑side canvas processing with secure serverless APIs to deliver
            a wide array of tools — image editing, OCR, diagramming, and developer utilities —
            without sacrificing privacy. Files are processed locally whenever possible; for features
            that require server power (OCR, background removal, favicon generation, mock data),
            data is transmitted transiently and never stored.
          </motion.p>
        </section>

        {/* ── Features / Tools Grid ── */}
        <section className="mb-24">
          <motion.div {...fadeUp(0)} className="mb-3">
            <SectionLabel>Features</SectionLabel>
          </motion.div>
          <motion.h2 {...fadeUp(0.06)} className="mb-10 font-['Plus_Jakarta_Sans'] text-3xl font-bold">
            Every tool included
          </motion.h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map(({ icon: Icon, label, desc }, i) => (
              <GlassCard key={label} delay={i * 0.05} hoverScale={1.03}>
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/30 dark:to-purple-500/30"
                >
                  <Icon size={18} className="text-indigo-600 dark:text-indigo-400" />
                </motion.div>
                <h3 className="mb-1.5 font-['Plus_Jakarta_Sans'] text-sm font-semibold text-gray-800 dark:text-white">
                  {label}
                </h3>
                <p className="text-xs leading-relaxed text-gray-500 dark:text-white/40">{desc}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* ── Supported Formats ── */}
        <section className="mb-24">
          <motion.div {...fadeUp(0)} className="mb-3">
            <SectionLabel>Formats</SectionLabel>
          </motion.div>
          <motion.h2 {...fadeUp(0.06)} className="mb-2 font-['Plus_Jakarta_Sans'] text-3xl font-bold">
            Supported input formats
          </motion.h2>
          <motion.p {...fadeUp(0.1)} className="mb-8 text-sm text-gray-500 dark:text-white/40">
            Canvas reliably re‑encodes to <strong className="text-gray-700 dark:text-white/70">JPEG, WebP and PNG</strong>. All other formats are rasterized to PNG during compression.
          </motion.p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-wrap gap-2"
          >
            {INPUT_FORMATS.map((fmt) => (
              <motion.span
                key={fmt}
                variants={staggerItem}
                whileHover={{
                  scale: 1.08,
                  backgroundColor: "rgba(79, 70, 229, 0.1)",
                  borderColor: "rgba(79, 70, 229, 0.4)",
                  color: "#4F46E5",
                }}
                transition={{ type: "spring", stiffness: 400 }}
                className="cursor-default rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 font-mono text-xs text-gray-600 transition-all dark:border-white/8 dark:bg-white/4 dark:text-white/60"
              >
                .{fmt.toLowerCase()}
              </motion.span>
            ))}
          </motion.div>
        </section>

        {/* ── Privacy Statement (updated) ── */}
        <section className="mb-24">
          <GlassCard className="relative overflow-hidden border-indigo-300/50 bg-linear-to-br from-indigo-50/50 to-purple-50/50 dark:border-indigo-500/30 dark:from-indigo-500/10 dark:to-purple-500/10">
            <motion.div
              className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ["0%", "200%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
            />
            <div className="relative flex items-start gap-4">
              <motion.div
                whileHover={{ rotate: 12, scale: 1.1 }}
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20"
              >
                <Shield size={20} className="text-indigo-600 dark:text-indigo-400" />
              </motion.div>
              <div>
                <h3 className="mb-2 font-['Plus_Jakarta_Sans'] text-lg font-semibold">Privacy Statement</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-white/50">
                  Image tools (compressor, converter, resizer) and JSON Viewer run entirely in your
                  browser using the Canvas API, FileReader, and Web Workers — no data leaves your
                  device. For OCR, background removal, favicon generation, and mock profiles,
                  requests are sent to secure API routes over HTTPS. Transient data is processed in
                  memory, with Upstash Redis rate limiting and Vercel Blob for temporary storage.
                  Stripe test keys are held in‑memory only and never persisted. No cookies or
                  tracking related to your data.
                </p>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* ── Tech Stack (expanded) ── */}
        <section className="mb-24">
          <motion.div {...fadeUp(0)} className="mb-3">
            <SectionLabel>Tech Stack</SectionLabel>
          </motion.div>
          <motion.h2 {...fadeUp(0.06)} className="mb-8 font-['Plus_Jakarta_Sans'] text-3xl font-bold">
            Built with
          </motion.h2>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-wrap gap-3"
          >
            {ALL_TECH.map(({ icon: Icon, label }) => (
              <motion.div
                key={label}
                variants={staggerItem}
                whileHover={{
                  y: -4,
                  scale: 1.05,
                  borderColor: "#4F46E5",
                  boxShadow: "0 10px 25px -5px rgba(79,70,229,0.2)",
                }}
                className="flex cursor-default items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 backdrop-blur-sm transition-all dark:border-white/[0.07] dark:bg-white/4"
              >
                {Icon ? (
                  <Icon size={16} className="text-gray-600 dark:text-white/60" />
                ) : null}
                <span className={`text-sm ${Icon ? "text-gray-700 dark:text-white/70" : "text-gray-500 dark:text-white/50"}`}>
                  {label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Creator Section (unchanged layout) ── */}
        <section className="mb-12">
          <motion.div {...fadeUp(0)} className="mb-3">
            <SectionLabel>Creator</SectionLabel>
          </motion.div>

          <GlassCard
            delay={0.08}
            className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-1 font-['Plus_Jakarta_Sans'] text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
              >
                Sadiqul Islam Shakib
              </motion.p>
              <p className="text-sm text-gray-500 dark:text-white/40">
                Open-source developer · MIT Licensed
              </p>
            </div>

            <div className="flex gap-3">
              {SocialLinks.map(({ icon: Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{
                    y: -5,
                    scale: 1.1,
                    backgroundColor: "#4F46E5",
                    color: "white",
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 transition-all dark:border-white/8 dark:bg-white/4 dark:text-white/50"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </GlassCard>
        </section>
      </div>
    </main>
  );
}