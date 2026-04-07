"use client";

import {motion} from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function loadImage(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = url;
    });
}

export function pickCanvasMimeFromName(name: string) {
    const lower = name.toLowerCase();
    if (lower.endsWith(".png")) return "image/png";
    return "image/jpeg";
}

export function withExtension(name: string, ext: "jpg" | "png") {
    const stripped = name.replace(/\.[^/.]+$/, "");
    return `${stripped}.${ext}`;
}

export const inputClass = cn(
    "w-full rounded-xl border border-black/[0.08] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-3 py-2 text-sm text-[#141414] outline-none transition",
    "focus:border-[#1856FF]/50 focus:ring-2 focus:ring-[#1856FF]/25",
    "dark:border-white/10 dark:bg-white/[0.04] dark:text-white",
);

export function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-sm font-semibold text-[#141414] dark:text-white">{label}</label>
            <p className="mb-2 text-xs text-[#141414]/55 dark:text-white/45">{hint}</p>
            {children}
        </div>
    );
}

export function StatCard({
    icon: Icon,
    label,
    value,
    hint,
    accent,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    hint: string;
    accent?: "success";
}) {
    return (
        <Card
            className={cn(
                "border-black/6 dark:border-white/10",
                accent === "success" && "border-[#07CA6B]/25 ring-1 ring-[#07CA6B]/10",
            )}
        >
            <CardContent className="flex gap-4 p-5">
                <div
                    className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1856FF]/10 text-[#1856FF]",
                        accent === "success" && "bg-[#07CA6B]/12 text-[#07CA6B]",
                    )}
                >
                    <Icon className="size-6" aria-hidden />
                </div>
                <div className="min-w-0">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#3A344E]/70 dark:text-white/45">
                        {label}
                    </p>
                    <p className="mt-1 truncate text-xl font-bold text-[#141414] dark:text-white">{value}</p>
                    <p className="mt-0.5 text-xs text-[#141414]/55 dark:text-white/45">{hint}</p>
                </div>
            </CardContent>
        </Card>
    );
}

export function ProgressBar({ value, tone }: { value: number; tone: "primary" }) {
    return (
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#3A344E]/10 dark:bg-white/10">
            <motion.div
                className={cn(
                    "h-full rounded-full",
                    tone === "primary" && "bg-[#1856FF]",
                )}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
        </div>
    );
}

export function IndeterminateBar() {
    return (
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[#3A344E]/10 dark:bg-white/10">
            <motion.div
                className="absolute left-0 top-0 h-full w-2/5 rounded-full bg-[#E89558]"
                animate={{ x: ["-100%", "280%"] }}
                transition={{ duration: 1.15, repeat: Infinity, ease: "linear" }}
            />
        </div>
    );
}