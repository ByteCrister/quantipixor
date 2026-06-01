"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

const CtaBannerSection: React.FC = () => {
    const router = useRouter();

    return (
        <section
            className="relative isolate overflow-hidden px-4 py-20 md:py-28"
            aria-labelledby="cta-heading"
        >
            {/* Ambient glow blobs — mirrors HeroSection.tsx pattern */}
            <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
                <div className="absolute -left-20 top-0 h-90 w-90 rounded-full bg-[#1856FF]/[0.14] blur-3xl dark:bg-[#1856FF]/20" />
                <div className="absolute -right-16 bottom-0 h-70 w-70 rounded-full bg-[#3A344E]/15 blur-3xl dark:bg-[#3A344E]/25" />
                <div className="absolute bottom-0 left-1/2 h-45 w-45 -translate-x-1/2 rounded-full bg-[#07CA6B]/10 blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#1856FF]/25 to-transparent" />
            </div>

            <div className="mx-auto max-w-3xl">
                <div className="relative overflow-hidden rounded-3xl border border-[#1856FF]/20 bg-[color-mix(in_srgb,var(--surface)_75%,transparent)] px-8 py-14 text-center shadow-[0_24px_80px_-24px_rgba(24,86,255,0.3)] backdrop-blur-xl dark:border-white/10 dark:bg-[color-mix(in_srgb,var(--surface)_45%,transparent)] md:px-16">
                    {/* Top highlight line */}
                    <div
                        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#1856FF]/60 to-transparent"
                        aria-hidden
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <h2
                            id="cta-heading"
                            className="text-3xl font-extrabold tracking-tight text-[#141414] dark:text-white md:text-4xl"
                        >
                            Start for free.{" "}
                            <span className="bg-linear-to-r from-[#1856FF] to-[#3A344E] bg-clip-text text-transparent dark:from-[#a5c4ff] dark:to-white">
                                No account needed.
                            </span>
                        </h2>
                        <p className="mx-auto mt-4 max-w-lg text-lg text-[#141414]/65 dark:text-white/60">
                            Every tool is free, private, and runs in your browser.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5"
                    >
                        <Button
                            size="lg"
                            className="min-w-50 shadow-[0_16px_40px_-12px_rgba(24,86,255,0.65)]"
                            onClick={() => router.push("/image/batch-compressor")}
                            aria-label="Start compressing images"
                        >
                            Compress Images
                            <ArrowRight className="h-4 w-4 opacity-90" aria-hidden />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="min-w-50"
                            onClick={() => router.push("/image/converter")}
                            aria-label="Explore all tools"
                        >
                            Explore Tools
                        </Button>
                    </motion.div>

                    {/* Animated ambient glow inside card */}
                    <motion.div
                        className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-[#1856FF]/15 blur-2xl dark:bg-[#1856FF]/25"
                        animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        aria-hidden
                    />
                    <motion.div
                        className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-[#07CA6B]/10 blur-2xl dark:bg-[#07CA6B]/20"
                        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.06, 1] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        aria-hidden
                    />
                </div>
            </div>
        </section>
    );
};

export default CtaBannerSection;