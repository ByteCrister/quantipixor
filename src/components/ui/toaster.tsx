"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

import { useToastStore, type ToastRecord, type ToastVariant } from "@/store/toastStore";
import { cn } from "@/lib/utils";

const AUTO_DISMISS_MS = 4500;

const variantStyles: Record<
  ToastVariant,
  { border: string; bg: string; icon: string; Icon: typeof CheckCircle2 }
> = {
  success: {
    border: "border-[#07CA6B]/35",
    bg: "bg-[color-mix(in_srgb,var(--surface)_92%,#07CA6B)] dark:bg-[#07CA6B]/12",
    icon: "text-[#07CA6B]",
    Icon: CheckCircle2,
  },
  error: {
    border: "border-[#EA2143]/35",
    bg: "bg-[color-mix(in_srgb,var(--surface)_92%,#EA2143)] dark:bg-[#EA2143]/12",
    icon: "text-[#EA2143]",
    Icon: AlertCircle,
  },
  info: {
    border: "border-[#1856FF]/35",
    bg: "bg-[color-mix(in_srgb,var(--surface)_92%,#1856FF)] dark:bg-[#1856FF]/12",
    icon: "text-[#1856FF]",
    Icon: Info,
  },
  warning: {
    border: "border-[#E89558]/40",
    bg: "bg-[color-mix(in_srgb,var(--surface)_92%,#E89558)] dark:bg-[#E89558]/12",
    icon: "text-[#E89558]",
    Icon: AlertTriangle,
  },
};

function ToastItem({ record, onDismiss }: { record: ToastRecord; onDismiss: () => void }) {
  const styles = variantStyles[record.variant];
  const Icon = styles.Icon;

  useEffect(() => {
    const t = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      role="status"
      className={cn(
        "pointer-events-auto flex max-w-sm gap-3 rounded-2xl border px-4 py-3 shadow-[0_16px_48px_-12px_rgba(24,86,255,0.2)] backdrop-blur-xl dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.45)]",
        styles.border,
        styles.bg,
      )}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", styles.icon)} aria-hidden />
      <div className="min-w-0 flex-1">
        {record.title && (
          <p className="font-semibold text-[#141414] dark:text-white">{record.title}</p>
        )}
        <p
          className={cn(
            "text-sm leading-snug text-[#141414]/75 dark:text-white/75",
            record.title && "mt-0.5",
          )}
        >
          {record.message}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-lg p-1 text-[#141414]/45 transition-colors hover:bg-black/[0.05] hover:text-[#141414] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF]/40 dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white"
        aria-label="Dismiss notification"
      >
        <X className="size-4" />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[200] flex flex-col gap-2 sm:bottom-6 sm:right-6"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} record={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
