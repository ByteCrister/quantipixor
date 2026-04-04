// Header.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Repeat, Menu, X } from "lucide-react";
import QuantipixorIcon from "@/components/global/QuantipixorIcon";
import { cn } from "@/lib/utils";

const Header: React.FC = () => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogoClick = () => {
    router.push("/");
    setMobileMenuOpen(false);
  };

  const handleBatchCompressorClick = () => {
    router.push("/image/batch-compressor");
    setMobileMenuOpen(false);
  };

  const handleGenerateFaviconsClick = () => {
    router.push("/image/generate-favicon");
    setMobileMenuOpen(false);
  };

  const handleImageConverterClick = () => {
    router.push("/image/converter");
    setMobileMenuOpen(false);
  };

  const handleAboutClick = () => {
    router.push("/about");
    setMobileMenuOpen(false);
  };

  const handleHelpClick = () => {
    router.push("/help");
    setMobileMenuOpen(false);
  };

  const navPillBtn =
    "rounded-full px-4 py-2 text-sm font-medium text-foreground/75 transition-colors hover:text-[#1856FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF]/40 focus-visible:ring-offset-2 dark:text-white/70 dark:hover:text-white dark:focus-visible:ring-offset-[#0c0b10]";

  const mobileNavItem =
    "block w-full rounded-xl px-4 py-3 text-left text-base font-medium text-foreground/80 transition-all hover:bg-[#1856FF]/10 hover:text-[#1856FF] dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white";

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b transition-[background-color,box-shadow,backdrop-filter] duration-300",
          "bg-[color-mix(in_srgb,var(--surface)_68%,transparent)] backdrop-blur-2xl backdrop-saturate-150 supports-backdrop-filter:bg-[color-mix(in_srgb,var(--surface)_55%,transparent)]",
          "dark:bg-[color-mix(in_srgb,var(--surface)_45%,transparent)] dark:supports-backdrop-filter:bg-[color-mix(in_srgb,var(--surface)_38%,transparent)]",
          scrolled
            ? "border-[#1856FF]/15 shadow-[0_12px_40px_-12px_rgba(24,86,255,0.2)] dark:border-white/10 dark:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.55)]"
            : "border-black/6 shadow-[inset_0_1px_0_0_var(--glass-highlight)] dark:border-white/8",
        )}
      >
        {/* Luminous edge (glass spec) */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-[#1856FF]/35 to-transparent dark:via-[#1856FF]/45"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 md:py-4">
            {/* Logo / Brand */}
            <button
              type="button"
              onClick={handleLogoClick}
              className="group flex items-center gap-3 rounded-2xl pr-3 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF]/45 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0c0b10]"
              aria-label="Scroll to top"
            >
              <span className="relative">
                <span
                  className="absolute -inset-2 rounded-2xl bg-linear-to-br from-[#1856FF]/25 via-transparent to-purple-500/20 opacity-70 blur-lg transition-opacity group-hover:opacity-100 dark:from-[#1856FF]/35 dark:to-purple-500/25"
                  aria-hidden
                />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] shadow-[0_8px_24px_-8px_rgba(24,86,255,0.35)] ring-1 ring-[#1856FF]/20 backdrop-blur-md dark:bg-white/[0.07] dark:ring-white/10 md:h-12 md:w-12">
                  <QuantipixorIcon className="h-7 w-7 transition-transform duration-300 group-hover:scale-105 md:h-8 md:w-8" />
                </span>
              </span>
              <span className="flex flex-col items-start text-left">
                <span className="bg-linear-to-r from-[#3A344E] via-[#1856FF] to-[#3A344E] bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-white dark:via-[#a5b4fc] dark:to-white md:text-2xl">
                  Quantipixor
                </span>
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-foreground/45 dark:text-white/40">
                  Batch · Private · Fast
                </span>
              </span>
            </button>

            {/* Desktop Navigation (hidden on mobile) */}
            <nav
              className="hidden md:flex md:flex-wrap md:items-center md:justify-end md:gap-2"
              aria-label="Main navigation"
            >
              <div
                className="flex items-center gap-0.5 rounded-full border border-black/[0.07] bg-black/2 p-1 shadow-inner backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]"
                role="group"
                aria-label="About and help"
              >
                <button
                  type="button"
                  onClick={handleAboutClick}
                  className={navPillBtn}
                  aria-label="About Quantipixor"
                >
                  About
                </button>
                <button
                  type="button"
                  onClick={handleHelpClick}
                  className={navPillBtn}
                  aria-label="Help and FAQ"
                >
                  Help
                </button>
              </div>

              <button
                type="button"
                onClick={handleImageConverterClick}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/20 bg-transparent px-3 py-2 text-sm font-medium text-foreground/80 transition-all hover:border-[#1856FF]/60 hover:bg-[#1856FF]/5 hover:text-[#1856FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF]/40 focus-visible:ring-offset-2 dark:border-white/20 dark:text-white/70 dark:hover:border-white/40 dark:hover:bg-white/5 dark:hover:text-white dark:focus-visible:ring-offset-[#0c0b10]"
                aria-label="Convert image format or to Base64"
              >
                <Repeat className="h-4 w-4" />
                <span>Converter</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateFaviconsClick}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/20 bg-transparent px-3 py-2 text-sm font-medium text-foreground/80 transition-all hover:border-[#1856FF]/60 hover:bg-[#1856FF]/5 hover:text-[#1856FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF]/40 focus-visible:ring-offset-2 dark:border-white/20 dark:text-white/70 dark:hover:border-white/40 dark:hover:bg-white/5 dark:hover:text-white dark:focus-visible:ring-offset-[#0c0b10]"
                aria-label="Generate favicons for your website"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Favicons</span>
              </button>

              <button
                type="button"
                onClick={handleBatchCompressorClick}
                className="inline-flex items-center justify-center rounded-full bg-[#1856FF] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_28px_-6px_rgba(24,86,255,0.55)] ring-1 ring-white/20 transition-all hover:-translate-y-0.5 hover:bg-[#0E4ADB] hover:shadow-[0_14px_36px_-6px_rgba(24,86,255,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF] focus-visible:ring-offset-2 active:translate-y-0 active:bg-[#0A3DB0] dark:ring-white/10 dark:focus-visible:ring-offset-[#0c0b10]"
                aria-label="Open Batch Compressor (separate page)"
              >
                Batch Compressor
              </button>
            </nav>

            {/* Mobile Controls (visible only on mobile) */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={handleBatchCompressorClick}
                className="inline-flex items-center justify-center rounded-full bg-[#1856FF] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_8px_20px_-6px_rgba(24,86,255,0.45)] ring-1 ring-white/20 transition-all hover:bg-[#0E4ADB] active:bg-[#0A3DB0] dark:ring-white/10"
                aria-label="Open Batch Compressor"
              >
                Batch
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1856FF]/10 text-[#1856FF] transition-colors hover:bg-[#1856FF]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF]/40 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-all duration-300 md:hidden",
          mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 dark:bg-black/50",
            mobileMenuOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer */}
        <div
          className={cn(
            "absolute right-0 top-0 flex h-full w-80 flex-col bg-[color-mix(in_srgb,var(--surface)_98%,transparent)] backdrop-blur-2xl transition-transform duration-300 ease-out",
            "border-l border-black/10 shadow-2xl dark:border-white/10 dark:bg-[color-mix(in_srgb,var(--surface)_95%,transparent)]",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-black/10 p-4 dark:border-white/10">
            <div className="flex items-center gap-2">
              <QuantipixorIcon className="h-8 w-8" />
              <span className="bg-linear-to-r from-[#3A344E] via-[#1856FF] to-[#3A344E] bg-clip-text text-lg font-bold text-transparent dark:from-white dark:via-[#a5b4fc] dark:to-white">
                Quantipixor
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-full p-1 text-foreground/60 transition-colors hover:bg-black/5 hover:text-foreground dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Navigation */}
          <nav className="flex-1 space-y-1 p-4" aria-label="Mobile navigation">
            <button onClick={handleAboutClick} className={mobileNavItem}>
              About
            </button>
            <button onClick={handleHelpClick} className={mobileNavItem}>
              Help
            </button>
            <button onClick={handleImageConverterClick} className={mobileNavItem}>
              <span className="flex items-center gap-3">
                <Repeat className="h-4 w-4" />
                Converter
              </span>
            </button>
            <button onClick={handleGenerateFaviconsClick} className={mobileNavItem}>
              <span className="flex items-center gap-3">
                <ImageIcon className="h-4 w-4" />
                Favicons
              </span>
            </button>
          </nav>

          {/* Drawer Footer / CTA (optional) */}
          <div className="border-t border-black/10 p-4 dark:border-white/10">
            <button
              onClick={handleBatchCompressorClick}
              className="flex w-full items-center justify-center rounded-full bg-[#1856FF] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_28px_-6px_rgba(24,86,255,0.55)] transition-all hover:bg-[#0E4ADB] active:bg-[#0A3DB0]"
            >
              Batch Compressor
            </button>
            <p className="mt-3 text-center text-[10px] text-foreground/40 dark:text-white/30">
              Batch · Private · Fast
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;