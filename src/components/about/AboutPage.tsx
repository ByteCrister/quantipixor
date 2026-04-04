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
} from "react-icons/si";
import {
  Shield,
  Zap,
  Layers,
  FileImage,
  Download,
  ScanSearch,
  Sliders,
  HardDrive,
} from "lucide-react";

import { SOCIAL_LINKS } from "@/const/social-links";
import { inter, jetbrainsMono, plusJakarta } from "@/fonts/google-fonts";


// ── Animation helpers (enhanced) ──────────────────────────────────────────────
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

// ── Data (unchanged) ──────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Shield,
    label: "100% Client‑Side",
    desc: "All compression runs in your browser via Canvas API. Your images never touch a server.",
  },
  {
    icon: Layers,
    label: "Batch Processing",
    desc: "Upload up to 20 images at once, queue up to 50 total across multiple sessions.",
  },
  {
    icon: Download,
    label: "ZIP Download",
    desc: "Images are organised into batch‑N sub‑folders inside a single, clean ZIP archive.",
  },
  {
    icon: ScanSearch,
    label: "Duplicate Detection",
    desc: "SHA‑256 hashing prevents adding the same image twice — silently and instantly.",
  },
  {
    icon: Sliders,
    label: "Configurable Quality",
    desc: "Fine‑tune compression with a quality slider from 0.2 to 0.8 (default 0.7).",
  },
  {
    icon: HardDrive,
    label: "Max File Size",
    desc: "Individual files capped at 15 MB. Oversized files are rejected with clear feedback.",
  },
  {
    icon: FileImage,
    label: "18 Input Formats",
    desc: "JPG, PNG, WebP, AVIF, HEIC, GIF, BMP, SVG, TIFF, ICO and more.",
  },
  {
    icon: Zap,
    label: "Custom Naming",
    desc: "Set a base name and batch size to control how output files and folders are named.",
  },
];

const INPUT_FORMATS = [
  "JPG", "JPEG", "JFIF", "PJPEG", "PNG", "APNG",
  "WebP", "GIF", "BMP", "SVG", "ICO", "CUR",
  "AVIF", "TIFF", "TIF", "HEIC", "HEIF",
];

const TECH_STACK = [
  { icon: SiNextdotjs, label: "Next.js 16" },
  { icon: SiReact, label: "React 19" },
  { icon: SiTypescript, label: "TypeScript" },
  { icon: SiTailwindcss, label: "Tailwind CSS" },
  { icon: SiFramer, label: "Framer Motion" },
];

const SocialLinks = [
  { icon: SiGithub, label: "GitHub", href: SOCIAL_LINKS.GITHUB },
  {
    icon: SiLinkerd,
    label: "LinkedIn",
    href: SOCIAL_LINKS.LINKEDIN,
  },
  { icon: SiFacebook, label: "Facebook", href: SOCIAL_LINKS.FACEBOOK },
  { icon: SiInstagram, label: "Instagram", href: SOCIAL_LINKS.INSTAGRAM },
];

// ── Enhanced GlassCard with hover animations ──────────────────────────────────
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
        {/* Grid overlay */}
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
            <SectionLabel>v0.1.0 · MIT Licensed</SectionLabel>
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
            Private batch image compression in your browser. No logins. No servers.
            No compromise on privacy.
          </motion.p>

          {/* Stat pills with spring animation */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3"
          >
            {[
              ["18+", "Input formats"],
              ["50", "Max queue size"],
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
            Quantipixor is a high‑performance, privacy‑first web tool that compresses JPG, PNG,
            WebP, AVIF and 14+ other formats in bulk — entirely on your device. No uploads,
            no servers. Compressed images are downloaded as a tidy ZIP archive.
          </motion.p>
        </section>

        {/* ── Features Grid (enhanced hover & stagger) ── */}
        <section className="mb-24">
          <motion.div {...fadeUp(0)} className="mb-3">
            <SectionLabel>Features</SectionLabel>
          </motion.div>
          <motion.h2 {...fadeUp(0.06)} className="mb-10 font-['Plus_Jakarta_Sans'] text-3xl font-bold">
            Key features
          </motion.h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, label, desc }, i) => (
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

        {/* ── Supported Formats (with staggered animations) ── */}
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

        {/* ── Privacy Statement with hover shine ── */}
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
                  No images are uploaded to any server. Processing uses{" "}
                  <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-xs text-gray-800 dark:bg-white/10 dark:text-white/80">FileReader</code>,{" "}
                  <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-xs text-gray-800 dark:bg-white/10 dark:text-white/80">URL.createObjectURL</code>{" "}
                  and canvas drawing locally. No cookies or tracking related to your image data.
                </p>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* ── Tech Stack (stagger + hover effects) ── */}
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
            {TECH_STACK.map(({ icon: Icon, label }) => (
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
                <Icon size={16} className="text-gray-600 dark:text-white/60" />
                <span className="text-sm text-gray-700 dark:text-white/70">{label}</span>
              </motion.div>
            ))}
            {["Zustand", "Radix UI", "JSZip", "Plus Jakarta Sans", "JetBrains Mono"].map((t) => (
              <motion.div
                key={t}
                variants={staggerItem}
                whileHover={{ y: -4, scale: 1.05 }}
                className="flex cursor-default items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 backdrop-blur-sm dark:border-white/[0.07] dark:bg-white/4"
              >
                <span className="text-sm text-gray-500 dark:text-white/50">{t}</span>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Creator Section with social animations ── */}
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
                Open-source developer · MIT Licensed · v0.1.0
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