"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { COUNTRIES, LOCAL_NAMES, LOCALES } from "@/const/mock-profile";
import type { GeneratedProfile } from "@/types/mock-profile";
import { toast } from "@/store/toastStore";
import { plusJakarta, jetbrainsMono } from "@/fonts/google-fonts";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sparkles,
  Globe,
  Users,
  UserRound,
  Mail,
  Phone,
  MapPin,
  Cake,
  Briefcase,
  RefreshCw,
  SlidersHorizontal,
  Wand2,
  Copy,
  Check,
  ClipboardList,
  Mars,
  Venus,
  Shuffle,
  CalendarDays,
  Quote,
} from "lucide-react";

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------
type Gender = "male" | "female" | "random";
type FilterState = {
  country: string;
  language: string;
  gender: Gender;
  count: number;
};

const MAX_COUNT = 15;

// -------------------------------------------------------------------
// Animation variants
// -------------------------------------------------------------------
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 22 },
  },
  exit: { opacity: 0, y: -12, scale: 0.95, transition: { duration: 0.18 } },
};

const panelVariants: Variants = {
  hidden: { opacity: 0, y: -16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

// -------------------------------------------------------------------
// Copyable field wrapper
// -------------------------------------------------------------------
function CopyField({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({ variant: "success", message: "Copied to clipboard!" });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ variant: "error", message: "Failed to copy." });
    }
  };

  return (
    <div
      className={`group/field relative flex items-center gap-2 cursor-pointer rounded-md px-1 -mx-1 hover:bg-gray-100 dark:hover:bg-white/6 transition-colors duration-150 ${
        className ?? ""
      }`}
      onClick={handleCopy}
      title="Click to copy"
    >
      {children}
      <span
        className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/field:opacity-100 transition-opacity duration-150 z-50
          px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide whitespace-nowrap border border-white/10 bg-blue-600/85 text-white"
      >
        {copied ? "Copied!" : "Copy"}
      </span>
    </div>
  );
}

// -------------------------------------------------------------------
// Copy single profile as JSON
// -------------------------------------------------------------------
function CopyJsonButton({
  data,
  label = "Copy JSON",
}: {
  data: unknown;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      toast({ variant: "success", message: label + " copied!" });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ variant: "error", message: "Failed to copy." });
    }
  };

  return (
    <div className="group/copy relative">
      <button
        onClick={handleCopy}
        className="flex items-center justify-center w-7 h-7 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all duration-150 text-gray-500 dark:text-white/30 hover:text-blue-600 dark:hover:text-blue-300"
        aria-label={label}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
      <span
        className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/copy:opacity-100 transition-opacity duration-150 z-50
          px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide whitespace-nowrap border border-white/10 bg-blue-600/85 text-white"
      >
        {copied ? "Copied!" : label}
      </span>
    </div>
  );
}

// -------------------------------------------------------------------
// Main Component
// -------------------------------------------------------------------
export default function ProfileGenerator() {

  const [filters, setFilters] = useState<FilterState>({
    country: "random",
    language: "random",
    gender: "random",
    count: 10,
  });
  const [profiles, setProfiles] = useState<GeneratedProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProfiles = useCallback(async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);

    const params = new URLSearchParams();
    if (filters.country !== "random") params.append("country", filters.country);
    if (filters.language !== "random")
      params.append("language", filters.language);
    if (filters.gender !== "random") params.append("gender", filters.gender);
    params.append("count", filters.count.toString());

    try {
      const res = await fetch(`/api/v1/mock/profiles?${params}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = data?.message ?? "Failed to generate profiles.";
        toast({ variant: "error", title: "Error", message: msg });
        return;
      }

      const data: GeneratedProfile[] = await res.json();
      setProfiles(data);
      setHasFetched(true);
      toast({ variant: "success", message: `${data.length} profiles generated!` });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      toast({
        variant: "error",
        title: "Network error",
        message: "Could not reach the server.",
      });
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string | number) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-[#0a0f1e] dark:via-[#111827] dark:to-[#0d1b35]`}
      style={{ fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif" }}
    >
      {/* Ambient orbs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-150 h-150 rounded-full opacity-20 blur-3xl bg-[radial-gradient(circle,#93c5fd,transparent)] dark:bg-[radial-gradient(circle,#1856FF,transparent)]" />
        <div className="absolute -bottom-40 -right-40 w-125 h-125 rounded-full opacity-15 blur-3xl bg-[radial-gradient(circle,#93c5fd,transparent)] dark:bg-[radial-gradient(circle,#3b72ff,transparent)]" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* ── Header ── */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-300 tracking-widest uppercase">
              Profile Generator
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Random{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-blue-400 dark:from-blue-600 dark:to-blue-400">
              Profiles
            </span>
          </h1>
          <p className="mt-3 text-base text-gray-500 dark:text-white/40 font-medium">
            Configure your filters, then generate realistic user profiles
          </p>
          {/* Theme toggle button removed — theme follows system / stored */}
        </motion.div>

        {/* ── Filters Panel ── */}
        <motion.div
          variants={panelVariants}
          initial="hidden"
          animate="show"
          className="mb-8 rounded-2xl border backdrop-blur-xl bg-white/70 dark:bg-white/6 border-gray-200 dark:border-white/10 shadow-md dark:shadow-[0_8px_32px_rgba(24,86,255,0.10),inset_0_1px_0_rgba(255,255,255,0.09)] p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 dark:text-white/30" />
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/30">
              Filters
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Country */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/45">
                <Globe className="w-3.5 h-3.5" />
                Country
              </label>
              <Select
                value={filters.country}
                onValueChange={(v) => handleFilterChange("country", v)}
              >
                <SelectTrigger className="border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-blue-500/40 backdrop-blur-md h-10">
                  <SelectValue placeholder="Random" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#111827] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white max-h-60">
                  <SelectItem value="random">
                    <Globe className="w-4 h-4 mr-1 inline" /> Random
                  </SelectItem>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/45">
                <Globe className="w-3.5 h-3.5" />
                Language / Locale
              </label>
              <Select
                value={filters.language}
                onValueChange={(v) => handleFilterChange("language", v)}
              >
                <SelectTrigger className="border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-blue-500/40 backdrop-blur-md h-10">
                  <SelectValue placeholder="Random" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#111827] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white max-h-60">
                  <SelectItem value="random">
                    <Globe className="w-4 h-4 mr-1 inline" /> Random
                  </SelectItem>
                  {LOCALES.map((l) => (
                    <SelectItem key={l} value={l}>
                      {LOCAL_NAMES[l] || l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/45">
                <UserRound className="w-3.5 h-3.5" />
                Gender
              </label>
              <Select
                value={filters.gender}
                onValueChange={(v) => handleFilterChange("gender", v as Gender)}
              >
                <SelectTrigger className="border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:ring-blue-500/40 backdrop-blur-md h-10">
                  <SelectValue placeholder="Random" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#111827] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                  <SelectItem value="random">
                    <Shuffle className="w-4 h-4 mr-1 inline" /> Random
                  </SelectItem>
                  <SelectItem value="male">
                    <Mars className="w-4 h-4 mr-1 inline" /> Male
                  </SelectItem>
                  <SelectItem value="female">
                    <Venus className="w-4 h-4 mr-1 inline" /> Female
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Count */}
            <div className="space-y-3">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/45">
                <Users className="w-3.5 h-3.5" />
                Profiles —{" "}
                <span className="text-gray-900 dark:text-white font-bold">
                  {filters.count}
                </span>
              </label>
              <Slider
                min={1}
                max={MAX_COUNT}
                step={1}
                value={[filters.count]}
                onValueChange={([v]) => handleFilterChange("count", v)}
                className="mt-1"
              />
              <div className="flex justify-between text-[10px] text-gray-400 dark:text-white/25 font-mono">
                <span>1</span>
                <span>{MAX_COUNT}</span>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={fetchProfiles}
              disabled={loading}
              size="lg"
              className="relative px-10 py-6 text-sm font-semibold rounded-xl text-white border-0 overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed bg-linear-to-br from-blue-600 to-blue-500 dark:from-blue-600 dark:to-blue-500 shadow-[0_0_28px_rgba(24,86,255,0.5),0_4px_16px_rgba(0,0,0,0.35)] dark:shadow-[0_0_28px_rgba(24,86,255,0.5),0_4px_16px_rgba(0,0,0,0.35)]"
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-linear-to-r from-transparent via-white/15 to-transparent skew-x-[-20deg] -translate-x-full animate-shimmer" />
              {loading ? (
                <span className="flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating…
                </span>
              ) : (
                <span className="flex items-center gap-2.5">
                  <Wand2 className="w-4 h-4" />
                  {hasFetched ? "Regenerate Profiles" : "Generate Profiles"}
                </span>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Idle / Empty state */}
        <AnimatePresence>
          {!hasFetched && !loading && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center justify-center py-24 gap-5"
            >
              <div className="w-24 h-24 rounded-full flex items-center justify-center border border-blue-500/20 bg-[radial-gradient(circle_at_35%_35%,rgba(24,86,255,0.22),rgba(24,86,255,0.03))] shadow-[0_0_40px_rgba(24,86,255,0.15)]">
                <Users className="w-10 h-10 text-blue-400/60" />
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-white/55 font-semibold text-base">
                  No profiles yet
                </p>
                <p className="text-gray-400 dark:text-white/25 text-sm mt-1.5">
                  Set your filters above and click{" "}
                  <span className="text-blue-500 dark:text-blue-400/80">
                    Generate Profiles
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skeleton loader */}
        <AnimatePresence>
          {loading && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {Array.from({ length: filters.count }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-200 dark:border-white/8 p-5 backdrop-blur-md bg-gray-100 dark:bg-white/5 animate-pulse"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-300 dark:bg-white/10 rounded-full w-3/4" />
                      <div className="h-2.5 bg-gray-200 dark:bg-white/6 rounded-full w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="h-2.5 bg-gray-200 dark:bg-white/6 rounded-full"
                        style={{ width: `${70 + j * 8}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/8 flex gap-2">
                    <div className="h-5 w-16 bg-gray-300 dark:bg-white/8 rounded-full" />
                    <div className="h-5 w-24 bg-gray-300 dark:bg-white/8 rounded-full" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profiles grid */}
        <AnimatePresence>
          {!loading && profiles.length > 0 && (
            <>
              <motion.div
                key="copy-all-bar"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between mb-4"
              >
                <span className="text-xs text-gray-500 dark:text-white/30 font-semibold uppercase tracking-widest">
                  {profiles.length} profile{profiles.length !== 1 ? "s" : ""}{" "}
                  generated
                </span>
                <CopyAllButton profiles={profiles} />
              </motion.div>

              <motion.div
                key="grid"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {profiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <Toaster />
    </div>
  );
}

// -------------------------------------------------------------------
// Copy-all button
// -------------------------------------------------------------------
function CopyAllButton({ profiles }: { profiles: GeneratedProfile[] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(profiles, null, 2));
      setCopied(true);
      toast({
        variant: "success",
        message: `All ${profiles.length} profiles copied as JSON!`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ variant: "error", message: "Failed to copy." });
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="group/all relative flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:bg-blue-500/15 hover:border-blue-500/30 transition-all duration-150 text-gray-600 dark:text-white/40 hover:text-blue-600 dark:hover:text-blue-300 text-xs font-semibold"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <ClipboardList className="w-3.5 h-3.5" />
      )}
      {copied ? "Copied!" : "Copy all as JSON"}
    </button>
  );
}

// -------------------------------------------------------------------
// Profile Card – now displays every detail
// -------------------------------------------------------------------
function ProfileCard({ profile }: { profile: GeneratedProfile }) {
  const initials = profile.name.full
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [avatarCopied, setAvatarCopied] = useState(false);
  const handleCopyAvatar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(profile.avatar);
      setAvatarCopied(true);
      toast({ variant: "success", message: "Avatar URL copied!" });
      setTimeout(() => setAvatarCopied(false), 1800);
    } catch {
      toast({ variant: "error", message: "Failed to copy." });
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        y: -4,
        boxShadow:
          "0 12px 40px rgba(24,86,255,0.22), inset 0 1px 0 rgba(255,255,255,0.12)",
      }}
      className="group rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden backdrop-blur-xl bg-white/90 dark:bg-white/6 shadow-md dark:shadow-[0_4px_24px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]"
    >
      {/* Hover accent bar */}
      <div className="h-0.5 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-r from-blue-600 via-blue-400 to-transparent dark:from-blue-600 dark:via-blue-400 dark:to-transparent" />

      <div className="p-5">
        {/* Avatar + name row */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="group/avatar relative shrink-0 cursor-pointer"
            onClick={handleCopyAvatar}
            title="Click to copy avatar URL"
          >
            <Avatar className="h-12 w-12 ring-2 ring-gray-200 dark:ring-white/10">
              <AvatarImage src={profile.avatar} alt={profile.name.full} />
              <AvatarFallback className="bg-blue-600/30 text-blue-200 text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-150 flex items-center justify-center">
              {avatarCopied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-150 z-50 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide whitespace-nowrap border border-white/10 bg-blue-600/85 text-white">
              {avatarCopied ? "Copied!" : "Copy URL"}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <CopyField value={profile.name.full}>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight break-all">
                {profile.name.full}
              </h3>
            </CopyField>
            <CopyField value={profile.username}>
              <p
                className="text-[11px] mt-0.5 break-all font-mono text-blue-600 dark:text-blue-300/75"
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              >
                @{profile.username}
              </p>
            </CopyField>
          </div>

          <div className="shrink-0 ml-auto">
            <CopyJsonButton data={profile} label="Copy profile JSON" />
          </div>
        </div>

        {/* All details – no truncation, every field copyable */}
        <div className="space-y-1 text-[11px] text-gray-500 dark:text-white/50">
          <CopyField value={profile.email} className="min-w-0">
            <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-white/20 shrink-0" />
            <span className="break-all">{profile.email}</span>
          </CopyField>

          <CopyField value={profile.phone}>
            <Phone className="w-3.5 h-3.5 text-gray-400 dark:text-white/20 shrink-0" />
            <span>{profile.phone}</span>
          </CopyField>

          <CopyField value={profile.address.street}>
            <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-white/20 shrink-0 mt-0.5" />
            <span className="wrap-break-word">{profile.address.street}</span>
          </CopyField>

          <CopyField
            value={`${profile.address.city}, ${profile.address.state}, ${profile.address.country}`}
          >
            <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-white/20 shrink-0 mt-0.5" />
            <span className="wrap-break-word">
              {profile.address.city}, {profile.address.state},{" "}
              {profile.address.country}
            </span>
          </CopyField>

          <CopyField value={profile.address.zipCode}>
            <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-white/20 shrink-0" />
            <span>ZIP: {profile.address.zipCode}</span>
          </CopyField>

          <CopyField value={profile.dateOfBirth}>
            <CalendarDays className="w-3.5 h-3.5 text-gray-400 dark:text-white/20 shrink-0" />
            <span>{profile.dateOfBirth}</span>
          </CopyField>

          <CopyField value={String(profile.age)}>
            <Cake className="w-3.5 h-3.5 text-gray-400 dark:text-white/20 shrink-0" />
            <span>{profile.age} years</span>
          </CopyField>

          <CopyField value={profile.website} className="min-w-0">
            <Globe className="w-3.5 h-3.5 text-gray-400 dark:text-white/20 shrink-0" />
            <span className="break-all">{profile.website}</span>
          </CopyField>

          <CopyField value={profile.company.name} className="min-w-0">
            <Briefcase className="w-3.5 h-3.5 text-gray-400 dark:text-white/20 shrink-0" />
            <span className="break-all">{profile.company.name}</span>
          </CopyField>

          <CopyField value={profile.company.catchPhrase} className="min-w-0">
            <Quote className="w-3.5 h-3.5 text-gray-400 dark:text-white/20 shrink-0" />
            <span className="wrap-break-word italic">
              “{profile.company.catchPhrase}”
            </span>
          </CopyField>
        </div>
      </div>
    </motion.div>
  );
}