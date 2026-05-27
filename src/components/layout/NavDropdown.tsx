// components/header/NavDropdown.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { NavItem } from "@/data/navigation";

interface NavDropdownProps {
    label: string;
    icon: React.ReactNode;
    items: NavItem[];
    onNavigate: (route: string) => void;
}

export default function NavDropdown({
    label,
    icon,
    items,
    onNavigate,
}: NavDropdownProps) {
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
            {/* trigger button – exact same styles as original */}
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
                {icon}
                <span>{label}</span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="flex items-center"
                >
                    <ChevronDown className="h-3.5 w-3.5" />
                </motion.span>
            </button>

            {/* dropdown panel – exact same glass‑morphism and animations */}
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
                        {/* top highlight line */}
                        <div
                            className="pointer-events-none absolute inset-x-0 top-0 h-px"
                            style={{
                                background:
                                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0.6) 60%, transparent)",
                            }}
                        />
                        <div className="p-1.5">
                            {items.map((item) => (
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
                        {/* bottom highlight line */}
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