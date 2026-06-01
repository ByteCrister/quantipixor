"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    FaLayerGroup,
    FaExchangeAlt,
    FaEraser,
    FaFileAlt,
    FaImage,
    FaExpandArrowsAlt,
    FaProjectDiagram,
    FaCode,
    FaUser,
    FaFlask,
} from "react-icons/fa";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Tool entries mirror src/data/navigation.tsx (navCategories) as the single source of truth.
// If navigation data structure changes, update the route/name fields here to stay in sync.
const tools = [
    {
        icon: FaLayerGroup,
        name: "Batch Compressor",
        description: "Compress images in bulk",
        route: "/image/batch-compressor",
        iconClass: "text-[#1856FF]",
        accentBg: "bg-[#1856FF]/10 dark:bg-[#1856FF]/20",
    },
    {
        icon: FaExchangeAlt,
        name: "Image Converter",
        description: "JPEG · PNG · WebP · AVIF",
        route: "/image/converter",
        iconClass: "text-[#7C3AED] dark:text-[#c4b5fd]",
        accentBg: "bg-[#7C3AED]/10 dark:bg-[#7C3AED]/20",
    },
    {
        icon: FaEraser,
        name: "Remove Background",
        description: "AI-powered background removal",
        route: "/image/remove-bg",
        iconClass: "text-[#07CA6B]",
        accentBg: "bg-[#07CA6B]/10 dark:bg-[#07CA6B]/20",
    },
    {
        icon: FaFileAlt,
        name: "OCR Formatter",
        description: "Extract text, export .docx",
        route: "/image/ocr-doc-formatter",
        iconClass: "text-[#c2410c] dark:text-[#fcd9a6]",
        accentBg: "bg-[#E89558]/10 dark:bg-[#E89558]/20",
    },
    {
        icon: FaImage,
        name: "Favicon Generator",
        description: "Multi-resolution .ico files",
        route: "/image/generate-favicon",
        iconClass: "text-[#4F46E5] dark:text-[#a5b4fc]",
        accentBg: "bg-[#4F46E5]/10 dark:bg-[#4F46E5]/20",
    },
    {
        icon: FaExpandArrowsAlt,
        name: "Image Resizer",
        description: "Exact dimensions with presets",
        route: "/image/resizer",
        iconClass: "text-[#0D9488] dark:text-[#5eead4]",
        accentBg: "bg-[#0D9488]/10 dark:bg-[#0D9488]/20",
    },
    {
        icon: FaProjectDiagram,
        name: "Diagram Studio",
        description: "Mermaid + PlantUML diagrams",
        route: "/diagrams",
        iconClass: "text-[#EA2143] dark:text-[#fda4af]",
        accentBg: "bg-[#EA2143]/10 dark:bg-[#EA2143]/20",
    },
    {
        icon: FaCode,
        name: "JSON Viewer",
        description: "Web Worker-powered explorer",
        route: "/mock/json-viewer",
        iconClass: "text-[#3A344E] dark:text-[#e9e4ff]",
        accentBg: "bg-[#3A344E]/10 dark:bg-[#3A344E]/20",
    },
    {
        icon: FaUser,
        name: "Mock Profile Gen",
        description: "Realistic profile data",
        route: "/mock/profile",
        iconClass: "text-[#0D9488] dark:text-[#5eead4]",
        accentBg: "bg-[#0D9488]/10 dark:bg-[#0D9488]/20",
    },
    {
        icon: FaFlask,
        name: "Stripe Test Customers",
        description: "Simulate payment flows",
        route: "/mock/stripe-test-customers",
        iconClass: "text-[#7C3AED] dark:text-[#c4b5fd]",
        accentBg: "bg-[#7C3AED]/10 dark:bg-[#7C3AED]/20",
    },
] as const;

const ToolsShowcaseSection: React.FC = () => {
    const router = useRouter();

    return (
        <section
            id="tools"
            className="relative scroll-mt-24 px-4 py-20 md:py-24"
            aria-labelledby="tools-heading"
        >
            {/* Subtle divider at top */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#1856FF]/20 to-transparent"
                aria-hidden
            />

            <div className="mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-10 flex flex-col items-center gap-3 text-center"
                >
                    <Badge variant="default" className="font-mono text-[10px] tracking-[0.2em]">
                        All Free
                    </Badge>
                    <h2
                        id="tools-heading"
                        className="text-3xl font-bold tracking-tight text-[#141414] dark:text-white md:text-4xl"
                    >
                        Pick Your Tool
                    </h2>
                    <p className="max-w-xl text-lg text-[#141414]/65 dark:text-white/60">
                        Click any card to jump straight in — no account, no waiting.
                    </p>
                </motion.div>

                {/* Horizontal scroll container */}
                <div
                    className="flex gap-3 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    role="list"
                    aria-label="Available tools"
                >
                    {tools.map((tool, idx) => {
                        const Icon = tool.icon;
                        return (
                            // motion.div is the real flex child — it owns shrink-0 and the fixed width
                            // so the wrapper itself never collapses regardless of Framer transforms.
                            <motion.div
                                key={tool.name}
                                role="listitem"
                                className="w-40 shrink-0 sm:w-44"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{
                                    delay: 0.04 * idx,
                                    duration: 0.45,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                whileHover={{
                                    y: -4,
                                    transition: { type: "spring", stiffness: 400, damping: 20 },
                                }}
                            >
                                <button
                                    onClick={() => router.push(tool.route)}
                                    aria-label={`Open ${tool.name}`}
                                    className={cn(
                                        // w-full + h-full fills the fixed-size motion.div wrapper completely
                                        "group flex h-full w-full flex-col items-start gap-3 rounded-2xl border border-black/6 p-4 text-left",
                                        "bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] shadow-sm backdrop-blur-sm",
                                        "transition-all duration-200",
                                        "hover:border-[#1856FF]/30 hover:shadow-[0_8px_24px_-8px_rgba(24,86,255,0.25)]",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF]/60",
                                        "dark:border-white/10 dark:bg-[color-mix(in_srgb,var(--surface)_50%,transparent)]",
                                        "dark:hover:border-[#1856FF]/35",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                            "transition-transform duration-200 motion-safe:group-hover:scale-110",
                                            tool.accentBg,
                                        )}
                                        aria-hidden
                                    >
                                        <Icon className={cn("h-5 w-5", tool.iconClass)} aria-hidden />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-semibold text-[#141414] transition-colors duration-200 group-hover:text-[#1856FF] dark:text-white dark:group-hover:text-[#a5c4ff]">
                                            {tool.name}
                                        </span>
                                        <span className="mt-0.5 block text-xs leading-snug text-[#141414]/55 dark:text-white/45">
                                            {tool.description}
                                        </span>
                                    </span>
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ToolsShowcaseSection;