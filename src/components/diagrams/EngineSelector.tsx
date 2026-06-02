"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ENGINE_META, type DiagramEngine } from "@/types/diagram.types";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EngineSelectorProps {
    value: DiagramEngine;
    onChange: (engine: DiagramEngine, resetCode: boolean) => void;
    hasCustomCode?: boolean;
    className?: string;
}

const ENGINES: DiagramEngine[] = ["mermaid", "plantuml"];

export function EngineSelector({ value, onChange, hasCustomCode, className }: EngineSelectorProps) {
    const [pending, setPending] = useState<DiagramEngine | null>(null);

    const select = (engine: DiagramEngine) => {
        if (engine === value) return;
        if (hasCustomCode) {
            setPending(engine);
            return;
        }
        onChange(engine, true);
    };

    return (
        <>
            <div
                className={cn(
                    "inline-flex rounded-lg border border-black/8 bg-black/[0.02] p-0.5 dark:border-white/10 dark:bg-white/[0.04]",
                    className
                )}
                role="radiogroup"
                aria-label="Diagram engine"
            >
                {ENGINES.map((engine) => {
                    const meta = ENGINE_META[engine];
                    const active = value === engine;
                    return (
                        <button
                            key={engine}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => select(engine)}
                            className={cn(
                                "rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                                active
                                    ? "text-white shadow-sm"
                                    : "text-[#141414]/60 hover:text-[#141414] dark:text-white/55 dark:hover:text-white"
                            )}
                            style={
                                active
                                    ? { background: meta.color, boxShadow: `0 2px 8px ${meta.color}40` }
                                    : undefined
                            }
                        >
                            {meta.shortLabel}
                        </button>
                    );
                })}
            </div>

            <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Switch to {pending ? ENGINE_META[pending].label : ""}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your current source may not be valid in the other engine. Keep your code
                            and fix syntax manually, or load the default starter template for{" "}
                            {pending ? ENGINE_META[pending].label : ""}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (pending) onChange(pending, false);
                                setPending(null);
                            }}
                        >
                            Keep code
                        </AlertDialogAction>
                        <AlertDialogAction
                            onClick={() => {
                                if (pending) onChange(pending, true);
                                setPending(null);
                            }}
                        >
                            Load default template
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
