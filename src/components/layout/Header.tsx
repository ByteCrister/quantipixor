"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ImageIcon,
  Repeat,
  Eraser,
  Menu,
  X,
  FileText,
  ChevronDown,
  Maximize2,
  Layers,
  Braces,
  FlaskConical,
  UserRound,
} from "lucide-react";
import QuantipixorIcon from "@/components/global/QuantipixorIcon";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

// ─── More-menu items ──────────────────────────────────────────────────────────
const MORE_ITEMS = [
  {
    label: "Image Resizer",
    icon: <Maximize2 className="h-4 w-4" />,
    route: "/image/resizer",
    description: "Resize to exact dimensions",
  },
  {
    label: "Converter",
    icon: <Repeat className="h-4 w-4" />,
    route: "/image/converter",
    description: "Convert format or to Base64",
  },
  {
    label: "Favicons",
    icon: <ImageIcon className="h-4 w-4" />,
    route: "/image/generate-favicon",
    description: "Generate favicons for your site",
  },
  {
    label: "Remove BG",
    icon: <Eraser className="h-4 w-4" />,
    route: "/image/remove-bg",
    description: "Remove image backgrounds",
  },
  {
    label: "OCR Formatter",
    icon: <FileText className="h-4 w-4" />,
    route: "/image/ocr-doc-formatter",
    description: "Extract & format text from images",
  },
];

// ─── More Dropdown ────────────────────────────────────────────────────────────
function MoreDropdown({ onNavigate }: { onNavigate: (route: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF]/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0c0b10]",
          open
            ? "border-[#1856FF]/50 bg-[#1856FF]/8 text-[#1856FF] dark:border-[#1856FF]/40 dark:bg-[#1856FF]/10 dark:text-blue-300"
            : "border-black/20 bg-transparent text-foreground/80 hover:border-[#1856FF]/50 hover:bg-[#1856FF]/5 hover:text-[#1856FF] dark:border-white/20 dark:text-white/70 dark:hover:border-white/40 dark:hover:bg-white/5 dark:hover:text-white"
        )}
      >
        <Layers className="h-4 w-4" />
        <span>Tools</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex items-center"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className={cn(
              "absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border",
              "bg-white/90 border-black/8 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18),0_4px_16px_-4px_rgba(0,0,0,0.08)]",
              "dark:bg-[#0f1623]/95 dark:border-white/8 dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)]",
              "backdrop-blur-2xl"
            )}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0.6) 60%, transparent)",
              }}
            />
            <div className="p-1.5">
              {MORE_ITEMS.map((item) => (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => {
                    onNavigate(item.route);
                    setOpen(false);
                  }}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150",
                    "text-foreground/80 hover:bg-[#1856FF]/6 hover:text-[#1856FF]",
                    "dark:text-white/70 dark:hover:bg-white/6 dark:hover:text-white",
                    "focus-visible:outline-none focus-visible:bg-[#1856FF]/6"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150",
                      "border-black/8 bg-black/3 text-foreground/60 group-hover:border-[#1856FF]/25 group-hover:bg-[#1856FF]/8 group-hover:text-[#1856FF]",
                      "dark:border-white/8 dark:bg-white/4 dark:text-white/50 dark:group-hover:border-[#1856FF]/30 dark:group-hover:bg-[#1856FF]/10 dark:group-hover:text-blue-300"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-semibold leading-tight">{item.label}</span>
                    <span className="text-[11px] font-normal text-foreground/45 group-hover:text-[#1856FF]/60 dark:text-white/35 dark:group-hover:text-blue-300/60">
                      {item.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(0,0,0,0.06) 40%, rgba(0,0,0,0.06) 60%, transparent)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── API Dropdown (single page navigation) ────────────────────────────────────
function ApiDropdown({ onNavigate }: { onNavigate: (route: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF]/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0c0b10]",
          open
            ? "border-[#1856FF]/50 bg-[#1856FF]/8 text-[#1856FF] dark:border-[#1856FF]/40 dark:bg-[#1856FF]/10 dark:text-blue-300"
            : "border-black/20 bg-transparent text-foreground/80 hover:border-[#1856FF]/50 hover:bg-[#1856FF]/5 hover:text-[#1856FF] dark:border-white/20 dark:text-white/70 dark:hover:border-white/40 dark:hover:bg-white/5 dark:hover:text-white"
        )}
      >
        <FlaskConical className="h-4 w-4" />
        <span>MOCK</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex items-center"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className={cn(
              "absolute right-0 top-full z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border",
              "bg-white/90 border-black/8 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18),0_4px_16px_-4px_rgba(0,0,0,0.08)]",
              "dark:bg-[#0f1623]/95 dark:border-white/8 dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)]",
              "backdrop-blur-2xl"
            )}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0.6) 60%, transparent)",
              }}
            />
            <div className="p-1.5">

              <button
                type="button"
                onClick={() => {
                  onNavigate("/mock/profile");
                  setOpen(false);
                }}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150",
                  "text-foreground/80 hover:bg-[#1856FF]/6 hover:text-[#1856FF]",
                  "dark:text-white/70 dark:hover:bg-white/6 dark:hover:text-white",
                  "focus-visible:outline-none focus-visible:bg-[#1856FF]/6"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150",
                    "border-black/8 bg-black/3 text-foreground/60 group-hover:border-[#1856FF]/25 group-hover:bg-[#1856FF]/8 group-hover:text-[#1856FF]",
                    "dark:border-white/8 dark:bg-white/4 dark:text-white/50 dark:group-hover:border-[#1856FF]/30 dark:group-hover:bg-[#1856FF]/10 dark:group-hover:text-blue-300"
                  )}
                >
                  <UserRound className="h-4 w-4" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-semibold leading-tight">Mock Profile</span>
                  <span className="text-[11px] font-normal text-foreground/45 group-hover:text-[#1856FF]/60 dark:text-white/35 dark:group-hover:text-blue-300/60">
                    View mock profile page
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onNavigate("/mock/json-viewer");
                  setOpen(false);
                }}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150",
                  "text-foreground/80 hover:bg-[#1856FF]/6 hover:text-[#1856FF]",
                  "dark:text-white/70 dark:hover:bg-white/6 dark:hover:text-white",
                  "focus-visible:outline-none focus-visible:bg-[#1856FF]/6"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150",
                    "border-black/8 bg-black/3 text-foreground/60 group-hover:border-[#1856FF]/25 group-hover:bg-[#1856FF]/8 group-hover:text-[#1856FF]",
                    "dark:border-white/8 dark:bg-white/4 dark:text-white/50 dark:group-hover:border-[#1856FF]/30 dark:group-hover:bg-[#1856FF]/10 dark:group-hover:text-blue-300"
                  )}
                >
                  <Braces className="h-4 w-4" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-semibold leading-tight">JSON Viewer</span>
                  <span className="text-[11px] font-normal text-foreground/45 group-hover:text-[#1856FF]/60 dark:text-white/35 dark:group-hover:text-blue-300/60">
                    View and format JSON data
                  </span>
                </span>
              </button>

            </div>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(0,0,0,0.06) 40%, rgba(0,0,0,0.06) 60%, transparent)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
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

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const navigate = (route: string) => {
    router.push(route);
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
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-[#1856FF]/35 to-transparent dark:via-[#1856FF]/45"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 md:py-4">
            {/* ── Logo ── */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="group flex items-center gap-3 rounded-2xl pr-3 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF]/45 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0c0b10]"
              aria-label="Go to homepage"
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

            {/* ── Desktop Navigation ── */}
            <nav className="hidden md:flex md:items-center md:gap-2" aria-label="Main navigation">
              {/* About / Help pill group */}
              <div
                className="flex items-center gap-0.5 rounded-full border border-black/[0.07] bg-black/2 p-1 shadow-inner backdrop-blur-sm dark:border-white/10 dark:bg-white/4"
                role="group"
                aria-label="About and help"
              >
                <button type="button" onClick={() => navigate("/about")} className={navPillBtn}>
                  About
                </button>
                <button type="button" onClick={() => navigate("/help")} className={navPillBtn}>
                  Help
                </button>
              </div>

              {/* Tools dropdown */}
              <MoreDropdown onNavigate={navigate} />

              {/* API dropdown — now navigates to a page */}
              <ApiDropdown onNavigate={navigate} />

              {/* Primary CTA */}
              <button
                type="button"
                onClick={() => navigate("/image/batch-compressor")}
                className="inline-flex items-center justify-center rounded-full bg-[#1856FF] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_28px_-6px_rgba(24,86,255,0.55)] ring-1 ring-white/20 transition-all hover:-translate-y-0.5 hover:bg-[#0E4ADB] hover:shadow-[0_14px_36px_-6px_rgba(24,86,255,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF] focus-visible:ring-offset-2 active:translate-y-0 active:bg-[#0A3DB0] dark:ring-white/10 dark:focus-visible:ring-offset-[#0c0b10]"
              >
                Batch Compressor
              </button>
            </nav>

            {/* ── Mobile Controls ── */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => navigate("/image/batch-compressor")}
                className="inline-flex items-center justify-center rounded-full bg-[#1856FF] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_8px_20px_-6px_rgba(24,86,255,0.45)] ring-1 ring-white/20 transition-all hover:bg-[#0E4ADB] active:bg-[#0A3DB0] dark:ring-white/10"
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

      {/* ── Mobile Drawer ── */}
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

        {/* Drawer panel */}
        <div
          className={cn(
            "absolute right-0 top-0 flex h-full w-80 flex-col backdrop-blur-2xl transition-transform duration-300 ease-out",
            "bg-[color-mix(in_srgb,var(--surface)_98%,transparent)] border-l border-black/10 shadow-2xl",
            "dark:bg-[color-mix(in_srgb,var(--surface)_95%,transparent)] dark:border-white/10",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          {/* Drawer header */}
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

          {/* Drawer nav */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Mobile navigation">
            <button onClick={() => navigate("/about")} className={mobileNavItem}>About</button>
            <button onClick={() => navigate("/help")} className={mobileNavItem}>Help</button>

            <div className="my-2 h-px bg-black/8 dark:bg-white/8" />

            {MORE_ITEMS.map((item) => (
              <button
                key={item.route}
                onClick={() => navigate(item.route)}
                className={cn(mobileNavItem, "flex items-center gap-3")}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/8 bg-black/3 text-foreground/60 dark:border-white/8 dark:bg-white/4 dark:text-white/50">
                  {item.icon}
                </span>
                <span className="flex flex-col items-start">
                  <span className="text-sm font-semibold leading-tight">{item.label}</span>
                  <span className="text-[11px] text-foreground/45 dark:text-white/35">{item.description}</span>
                </span>
              </button>
            ))}

            {/* ── Mobile: API page navigation ── */}
            <div className="my-2 h-px bg-black/8 dark:bg-white/8" />
            <button
              onClick={() => navigate("/mock/profile")}
              className={cn(mobileNavItem, "flex items-center gap-3")}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/8 bg-black/3 text-foreground/60 dark:border-white/8 dark:bg-white/4 dark:text-white/50">
                <UserRound className="h-4 w-4" />
              </span>
              <span className="flex flex-col items-start">
                <span className="text-sm font-semibold leading-tight">Mock Profile</span>
                <span className="text-[11px] text-foreground/45 dark:text-white/35">View mock profile page</span>
              </span>
            </button>
            <button
              onClick={() => navigate("/mock/json-viewer")}
              className={cn(mobileNavItem, "flex items-center gap-3")}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/8 bg-black/3 text-foreground/60 dark:border-white/8 dark:bg-white/4 dark:text-white/50">
                <Braces className="h-4 w-4" />
              </span>
              <span className="flex flex-col items-start">
                <span className="text-sm font-semibold leading-tight">JSON Viewer</span>
                <span className="text-[11px] text-foreground/45 dark:text-white/35">
                  View and format JSON data
                </span>
              </span>
            </button>
          </nav>

          {/* Drawer footer */}
          <div className="border-t border-black/10 p-4 dark:border-white/10">
            <button
              onClick={() => navigate("/image/batch-compressor")}
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