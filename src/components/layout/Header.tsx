"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QuantipixorIcon from "@/components/global/QuantipixorIcon";
import { cn } from "@/lib/utils";

const Header: React.FC = () => {
  const router = useRouter();                          
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogoClick = () => {
    router.push("/")
  };

  const handleBatchCompressorClick = () => {
    router.push("/image/batch-compressor");
  };

  const navPillBtn =
    "rounded-full px-4 py-2 text-sm font-medium text-foreground/75 transition-colors hover:text-[#1856FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF]/40 focus-visible:ring-offset-2 dark:text-white/70 dark:hover:text-white dark:focus-visible:ring-offset-[#0c0b10]";

  return (
    <>
      <header
        className={cn(
          "relative sticky top-0 z-40 w-full border-b transition-[background-color,box-shadow,backdrop-filter] duration-300",
          "bg-[color-mix(in_srgb,var(--surface)_68%,transparent)] backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--surface)_55%,transparent)]",
          "dark:bg-[color-mix(in_srgb,var(--surface)_45%,transparent)] dark:supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--surface)_38%,transparent)]",
          scrolled
            ? "border-[#1856FF]/15 shadow-[0_12px_40px_-12px_rgba(24,86,255,0.2)] dark:border-white/10 dark:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.55)]"
            : "border-black/[0.06] shadow-[inset_0_1px_0_0_var(--glass-highlight)] dark:border-white/[0.08]",
        )}
      >
        {/* Luminous edge (glass spec) */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#1856FF]/35 to-transparent dark:via-[#1856FF]/45"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 md:py-4">
            <button
              type="button"
              onClick={handleLogoClick}
              className="group flex items-center gap-3 rounded-2xl pr-3 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF]/45 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0c0b10]"
              aria-label="Scroll to top"
            >
              <span className="relative">
                <span
                  className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[#1856FF]/25 via-transparent to-purple-500/20 opacity-70 blur-lg transition-opacity group-hover:opacity-100 dark:from-[#1856FF]/35 dark:to-purple-500/25"
                  aria-hidden
                />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] shadow-[0_8px_24px_-8px_rgba(24,86,255,0.35)] ring-1 ring-[#1856FF]/20 backdrop-blur-md dark:bg-white/[0.07] dark:ring-white/10 md:h-12 md:w-12">
                  <QuantipixorIcon className="h-7 w-7 transition-transform duration-300 group-hover:scale-105 md:h-8 md:w-8" />
                </span>
              </span>
              <span className="flex flex-col items-start text-left">
                <span className="bg-gradient-to-r from-[#3A344E] via-[#1856FF] to-[#3A344E] bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-white dark:via-[#a5b4fc] dark:to-white md:text-2xl">
                  Quantipixor
                </span>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/45 dark:text-white/40">
                  Batch · Private · Fast
                </span>
              </span>
            </button>

            <nav
              className="flex flex-wrap items-center justify-end gap-2 sm:gap-3"
              aria-label="Main navigation"
            >
              <div
                className="flex items-center gap-0.5 rounded-full border border-black/[0.07] bg-black/[0.02] p-1 shadow-inner backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]"
                role="group"
                aria-label="About and help"
              >
                <button
                  type="button"
                  onClick={() => router.push("/about")}
                  className={navPillBtn}
                  aria-label="About Quantipixor"
                >
                  About
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/help")}
                  className={navPillBtn}
                  aria-label="Help and FAQ"
                >
                  Help
                </button>
              </div>

              <button
                type="button"
                onClick={handleBatchCompressorClick}
                className="inline-flex items-center justify-center rounded-full bg-[#1856FF] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_28px_-6px_rgba(24,86,255,0.55)] ring-1 ring-white/20 transition-all hover:-translate-y-0.5 hover:bg-[#0E4ADB] hover:shadow-[0_14px_36px_-6px_rgba(24,86,255,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF] focus-visible:ring-offset-2 active:translate-y-0 active:bg-[#0A3DB0] dark:ring-white/10 dark:focus-visible:ring-offset-[#0c0b10]"
                aria-label="Open Batch Compressor (separate page)"
              >
                Batch Compressor
              </button>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;