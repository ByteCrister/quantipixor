"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Sparkles, Upload } from "lucide-react";
import { FaImages } from "react-icons/fa";
import { TypeAnimation } from "react-type-animation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const HeroSection: React.FC = () => {
  const route = useRouter();
  const handleStartUpload = () => {
     route.push(`/image/batch-compressor`)
  };

  return (
    <section
      className="relative isolate overflow-hidden px-4 pb-20 pt-16 md:pb-28 md:pt-24"
      aria-labelledby="hero-heading"
    >
      {/* Ambient glass layers — unchanged */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-[#1856FF]/[0.14] blur-3xl dark:bg-[#1856FF]/20" />
        <div className="absolute -right-24 top-24 h-[320px] w-[320px] rounded-full bg-[#3A344E]/18 blur-3xl dark:bg-[#3A344E]/25" />
        <div className="absolute bottom-0 left-1/3 h-[200px] w-[200px] rounded-full bg-[#07CA6B]/12 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--background)_40%,transparent)_0%,transparent_45%)]" />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        {/* Badges row */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <Badge variant="success" className="font-mono text-[10px] tracking-[0.16em]">
            100% local
          </Badge>
          <Badge variant="outline" className="font-mono text-[10px] tracking-[0.16em]">
            No server uploads
          </Badge>
          <Badge variant="secondary" className="hidden sm:inline-flex font-mono text-[10px] tracking-[0.16em]">
            Enterprise-grade clarity
          </Badge>
        </motion.div>

        <motion.div
          custom={1}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-6 flex justify-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#1856FF]/25 bg-[#1856FF]/8 px-4 py-1.5 text-xs font-medium text-[#1856FF] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35)] backdrop-blur-md dark:text-[#a5c4ff]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Glassmorphism UI · WCAG-minded interactions
          </span>
        </motion.div>

        <motion.h1
          id="hero-heading"
          custom={2}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-8 text-balance text-4xl font-extrabold tracking-tight text-[#141414] dark:text-white md:text-5xl lg:text-6xl lg:leading-[1.05]"
        >
          <span className="bg-linear-to-br from-[#3A344E] via-[#1856FF] to-[#3A344E] bg-clip-text text-transparent dark:from-white dark:via-[#a5b4fc] dark:to-white">
            Compress Images in Bulk.
          </span>
          <br />
          <span className="bg-linear-to-r from-[#141414] via-[#1856FF] to-[#141414] bg-clip-text text-transparent dark:from-white dark:via-[#93c5fd] dark:to-white">
            Fast, Private, and Free.
          </span>
        </motion.h1>

        {/* Existing static paragraph */}
        <motion.p
          custom={3}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-[#141414]/72 md:text-xl dark:text-white/70"
        >
          Quantipixor lets you reduce image size without losing quality — batch processing, right in your browser, with{" "}
          <span className="font-semibold text-[#141414] dark:text-white/90">zero privacy trade-offs</span>.
        </motion.p>

        {/* Typing animation after h1 in the paragraph section */}
        <motion.div
          custom={3.5} // slightly after the static paragraph
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-4 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#1856FF]/10 px-5 py-2 text-base font-medium text-[#1856FF] backdrop-blur-sm dark:bg-[#1856FF]/20 dark:text-[#a5c4ff]">
            <span className="inline-flex items-center gap-1 text-[#141414]/60 dark:text-white/50">
              <Sparkles className="h-4 w-4" />
              It’s
            </span>
            <TypeAnimation
              sequence={[
                "100% local",
                1500,
                "completely private",
                1500,
                "batch‑optimized",
                1500,
                "lossless ready",
                1500,
              ]}
              wrapper="span"
              speed={40}
              repeat={Infinity}
              className="font-semibold"
            />
          </div>
        </motion.div>

        {/* Buttons row */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5"
        >
          <Button
            size="lg"
            className="min-w-[220px] shadow-[0_16px_40px_-12px_rgba(24,86,255,0.65)]"
            onClick={handleStartUpload}
            aria-label="Start uploading images"
          >
            <Upload className="h-5 w-5" aria-hidden />
            Start Uploading
            <ArrowRight className="h-4 w-4 opacity-90" aria-hidden />
          </Button>
          <p className="max-w-xs text-center text-sm text-[#141414]/55 dark:text-white/45">
            Warning tone for edge cases:{" "}
            <span className="font-mono text-[#E89558]">oversized</span> files are flagged —{" "}
            <span className="font-mono text-[#EA2143]">blocked</span> only when unsafe.
          </p>
        </motion.div>

        {/* Showcase card (unchanged) */}
        <motion.div
          custom={5}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-16 flex justify-center px-2"
        >
          <div className="relative w-full max-w-2xl">
            <div
              className="absolute -inset-4 rounded-4xl bg-linear-to-tr from-[#1856FF]/25 via-transparent to-[#3A344E]/20 opacity-80 blur-2xl dark:opacity-100"
              aria-hidden
            />
            <Card className="relative overflow-hidden border-[#1856FF]/20 shadow-[0_24px_80px_-24px_rgba(24,86,255,0.35)] dark:border-[#1856FF]/25">
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#1856FF]/60 to-transparent" aria-hidden />
              <CardContent className="flex flex-col items-center gap-6 p-8 pt-10 sm:flex-row sm:items-stretch sm:justify-between sm:gap-10">
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-[#1856FF]/20 to-[#3A344E]/15 ring-1 ring-[#1856FF]/25 dark:from-[#1856FF]/30 dark:to-[#3A344E]/25">
                    <FaImages className="h-8 w-8 text-[#1856FF] dark:text-[#a5c4ff]" aria-hidden />
                  </div>
                  <p className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3A344E]/70 dark:text-white/45">
                    Batch queue
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#141414] dark:text-white">
                    Drag, compress, download — all client-side.
                  </p>
                </div>

                <div className="grid w-full max-w-xs grid-cols-2 gap-3 sm:max-w-none">
                  {[
                    { label: "Smaller files", value: "up to 80%", tone: "text-[#1856FF]" },
                    { label: "Privacy", value: "local-only", tone: "text-[#07CA6B]" },
                    { label: "Formats", value: "JPEG · PNG · WebP", tone: "text-[#3A344E] dark:text-white/80" },
                    { label: "Risk", value: "minimal loss", tone: "text-[#E89558]" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-black/5 bg-black/2 px-3 py-3 text-left dark:border-white/10 dark:bg-white/4"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-wider text-[#141414]/45 dark:text-white/40">
                        {stat.label}
                      </p>
                      <p className={`mt-1 text-sm font-semibold ${stat.tone}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <motion.div
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#1856FF]/20 blur-2xl"
              animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.05, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;