"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Sparkles } from "lucide-react";
import {
  FaLayerGroup,
  FaShieldAlt,
  FaSlidersH,
  FaFileImage,
  FaInfinity,
} from "react-icons/fa";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

// Hover animation for cards (spring-based for smoothness)
const cardHover: Variants = {
  rest: { scale: 1, y: 0, boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" },
  hover: {
    scale: 1.02,
    y: -6,
    boxShadow: "0 24px 60px -20px rgba(24, 86, 255, 0.4)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      mass: 0.5,
    },
  },
};

const features = [
  {
    icon: FaLayerGroup,
    accent: "from-[#1856FF]/25 to-[#1856FF]/5",
    ring: "ring-[#1856FF]/25",
    iconClass: "text-[#1856FF]",
    title: "True Batch Processing",
    description: "Compress hundreds of images at once — built for real workloads, not toy demos.",
  },
  {
    icon: FaShieldAlt,
    accent: "from-[#07CA6B]/25 to-[#07CA6B]/5",
    ring: "ring-[#07CA6B]/25",
    iconClass: "text-[#07CA6B]",
    title: "Privacy First",
    description: "Images never leave your device. No uploads, no servers — period.",
  },
  {
    icon: FaSlidersH,
    accent: "from-[#E89558]/25 to-[#E89558]/5",
    ring: "ring-[#E89558]/30",
    iconClass: "text-[#c2410c] dark:text-[#fcd9a6]",
    title: "Advanced Compression",
    description: "Up to 80% smaller files with minimal visible quality loss — tuned for clarity.",
  },
  {
    icon: FaFileImage,
    accent: "from-[#3A344E]/25 to-[#3A344E]/5",
    ring: "ring-[#3A344E]/20",
    iconClass: "text-[#3A344E] dark:text-[#e9e4ff]",
    title: "Multi-Format Support",
    description: "JPEG, PNG, WebP, and more — one flow for your whole library.",
  },
  {
    icon: FaInfinity,
    accent: "from-[#EA2143]/20 to-[#EA2143]/5",
    ring: "ring-[#EA2143]/20",
    iconClass: "text-[#EA2143] dark:text-[#fda4af]",
    title: "No File Size Limits",
    description: "Compress huge images freely — we don’t throttle your batches.",
  },
] as const;

const FeaturesSection: React.FC = () => {
  return (
    <section
      id="features"
      className="relative scroll-mt-24 px-4 py-20 md:py-28"
      aria-labelledby="features-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-r from-transparent via-[#1856FF]/35 to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(24,86,255,0.06),transparent_60%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(24,86,255,0.12),transparent_55%)]" />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <Badge variant="default" className="font-mono text-[10px] tracking-[0.2em]">
            Differentiation
          </Badge>
          <h2
            id="features-heading"
            className="mt-4 text-3xl font-bold tracking-tight text-[#141414] dark:text-white md:text-4xl lg:text-[2.5rem] lg:leading-tight"
          >
            Why Quantipixor?
          </h2>
          <p className="mt-3 text-lg text-[#141414]/70 dark:text-white/65">
            Features that set us apart — <span className="font-semibold text-[#1856FF] dark:text-[#a5c4ff]">bold</span>,{" "}
            <span className="font-semibold text-[#3A344E] dark:text-white/85">precise</span>, and{" "}
            <span className="font-semibold text-[#07CA6B]">trust-first</span>.
          </p>
        </motion.div>

        <motion.ul
          className="mt-14 grid list-none grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.li
                key={feature.title}
                className={cn(
                  "h-full min-h-0",
                  idx === 4 && "sm:col-span-2 xl:col-span-2 xl:col-start-2",
                )}
                initial="rest"
                whileHover="hover"
                animate="rest"
                variants={cardHover}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card
                  className={cn(
                    "group h-full border-black/6 dark:border-white/10 motion-safe:transition-colors motion-safe:duration-200",
                    // Border glow on hover (applied via motion li shadow, but we keep border transition)
                    "motion-safe:hover:border-[#1856FF]/30 dark:motion-safe:hover:border-[#1856FF]/40",
                  )}
                >
                  <CardHeader className="pb-2">
                    <div
                      className={cn(
                        "relative mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br shadow-inner transition-all duration-200 ease-out",
                        feature.accent,
                        "ring-1",
                        feature.ring,
                        "motion-safe:group-hover:scale-105 motion-safe:group-hover:shadow-md motion-safe:group-hover:ring-2",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-7 w-7 transition-transform duration-200 ease-out",
                          feature.iconClass,
                          "motion-safe:group-hover:scale-105",
                        )}
                        aria-hidden
                      />
                    </div>
                    <CardTitle className="text-lg leading-snug transition-colors duration-200 motion-safe:group-hover:text-[#1856FF] dark:motion-safe:group-hover:text-[#a5c4ff]">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed transition-colors duration-200 motion-safe:group-hover:text-[#141414]/90 dark:motion-safe:group-hover:text-white/85">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.li>
            );
          })}
        </motion.ul>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mt-14 flex justify-center px-2"
        >
          <div className="relative max-w-3xl">
            <div
              className="absolute -inset-1 rounded-full bg-linear-to-r from-[#1856FF]/30 via-[#3A344E]/25 to-[#07CA6B]/25 opacity-70 blur-lg dark:opacity-90"
              aria-hidden
            />
            <motion.div
              className="relative flex flex-col items-center gap-3 rounded-full border border-[#1856FF]/25 bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] px-6 py-4 text-center shadow-[0_12px_40px_-18px_rgba(24,86,255,0.35)] backdrop-blur-xl transition-all duration-200 motion-safe:hover:scale-[1.01] motion-safe:hover:border-[#1856FF]/40 motion-safe:hover:shadow-[0_20px_40px_-18px_rgba(24,86,255,0.45)] dark:border-white/10 dark:bg-[color-mix(in_srgb,var(--surface)_55%,transparent)] sm:flex-row sm:text-left"
              whileHover={{ scale: 1.01, transition: { type: "spring", stiffness: 400, damping: 25 } }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1856FF]/12 text-[#1856FF] transition-all duration-200 motion-safe:group-hover:scale-105 dark:bg-[#1856FF]/25 dark:text-[#a5c4ff]">
                <Sparkles className="h-5 w-5" aria-hidden />
              </span>
              <p className="text-sm font-medium leading-relaxed text-[#141414]/80 dark:text-white/75 md:text-base">
                Unlike competitors, Quantipixor offers{" "}
                <span className="text-[#1856FF] dark:text-[#a5c4ff]">unlimited batch compression</span> with{" "}
                <span className="text-[#07CA6B]">zero privacy trade-offs</span>.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;