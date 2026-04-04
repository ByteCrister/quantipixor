"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PageLoaderProps {
  message?: string;
  minimal?: boolean;
}

// ── Orbital ring loader (minimal variant) ─────────────────────────────────────
const OrbitalLoader: React.FC = () => (
  <div className="relative flex h-12 w-12 items-center justify-center">
    {/* Static inner dot */}
    <div className="h-2 w-2 rounded-full bg-[#1856FF]" />

    {/* Spinning ring 1 */}
    <motion.div
      className="absolute inset-0 rounded-full border border-[#1856FF]/30"
      animate={{ rotate: 360 }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute -top-0.75 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-[#1856FF]" />
    </motion.div>

    {/* Spinning ring 2 — counter-clockwise, different size */}
    <motion.div
      className="absolute -inset-2.5 rounded-full border border-[#1856FF]/15"
      animate={{ rotate: -360 }}
      transition={{ duration: 3.6, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute -top-0.75 left-1/2 -translate-x-1/2 h-1.25 w-1.25 rounded-full bg-[#1856FF]/60" />
    </motion.div>
  </div>
);

// ── Scanning bar (full loader) ─────────────────────────────────────────────────
const ScanBar: React.FC = () => (
  <div className="relative h-0.5 w-48 overflow-hidden rounded-full bg-[#1856FF]/10">
    <motion.div
      className="absolute inset-y-0 w-16 rounded-full bg-linear-to-r from-transparent via-[#1856FF] to-transparent"
      animate={{ x: [-64, 192] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

// ── Ticking counter ────────────────────────────────────────────────────────────
const Counter: React.FC = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((prev) => {
        if (prev >= 99) { clearInterval(id); return 99; }
        // accelerate then decelerate to feel organic
        const step = prev < 60 ? 3 : prev < 85 ? 2 : 1;
        return Math.min(prev + step, 99);
      });
    }, 80);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="font-mono text-[11px] tracking-[0.2em] text-[#1856FF]/40">
      {String(count).padStart(2, "0")}
      <span className="text-[#1856FF]/20">%</span>
    </div>
  );
};

// ── Corner brackets ────────────────────────────────────────────────────────────
const Bracket: React.FC<{ corner: "tl" | "tr" | "bl" | "br" }> = ({ corner }) => {
  const base = "absolute h-4 w-4 border-[#1856FF]/30";
  const styles: Record<string, string> = {
    tl: "top-4 left-4 border-t border-l",
    tr: "top-4 right-4 border-t border-r",
    bl: "bottom-4 left-4 border-b border-l",
    br: "bottom-4 right-4 border-b border-r",
  };
  return (
    <motion.div
      className={`${base} ${styles[corner]}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.4 }}
    />
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
const PageLoader: React.FC<PageLoaderProps> = ({
  message = "Loading…",
  minimal = false,
}) => {
  if (minimal) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <OrbitalLoader />
      </div>
    );
  }

  return (
    <AnimatePresence>
      {/* Solid white overlay — no blur */}
      <motion.div
        key="loader-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-[#0a0a0f]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-col items-center gap-6 px-14 py-12"
        >
          {/* Corner brackets */}
          <Bracket corner="tl" />
          <Bracket corner="tr" />
          <Bracket corner="bl" />
          <Bracket corner="br" />

          {/* Orbital animation */}
          <OrbitalLoader />

          {/* Message */}
          <div className="flex flex-col items-center gap-1.5">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm font-medium tracking-wide text-[#141414] dark:text-white"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {message}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-[11px] uppercase tracking-[0.18em] text-[#141414]/30 dark:text-white/25"
            >
              preparing workspace
            </motion.p>
          </div>

          {/* Scan bar + counter row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-2"
          >
            <ScanBar />
            <Counter />
          </motion.div>
        </motion.div>

        {/* Ambient glow — bottom centre */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-40 w-80 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#1856FF]/6 blur-3xl dark:bg-[#1856FF]/12" />
      </motion.div>
    </AnimatePresence>
  );
};

export default PageLoader;