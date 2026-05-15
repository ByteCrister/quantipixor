"use client";

import { useState } from "react";
import { JsonValue } from "./JsonViewerPage";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function ValueRenderer({
    value,
    depth = 0,
    copyId,
    copy,
    copiedKey,
}: {
    value: JsonValue;
    depth?: number;
    copyId: string;
    copy: (id: string, text: string) => void;
    copiedKey: string | null;
}) {
    const [open, setOpen] = useState(depth < 2);

    // Helper to render clickable copy area
    const makeCopyable = (text: string, children: React.ReactNode) => {
        const isCopied = copiedKey === copyId;
        return (
            <button
                onClick={() => copy(copyId, text)}
                className={`inline-flex items-center gap-1 rounded px-0.5 -mx-0.5 transition-colors cursor-copy
                    ${isCopied ? "text-emerald-600 dark:text-emerald-400" : "hover:bg-slate-100 dark:hover:bg-white/10"}`}
                title="Click to copy"
            >
                {children}
                {isCopied && <span className="text-[10px] ml-1">(copied)</span>}
            </button>
        );
    };

    if (value === null) {
        return makeCopyable("null", (
            <span className="font-(family-name:--font-jetbrains-mono) text-xs italic text-slate-400 dark:text-white/30">null</span>
        ));
    }

    if (typeof value === "boolean") {
        const text = String(value);
        return makeCopyable(text, (
            <span className={`font-(family-name:--font-jetbrains-mono) text-xs font-semibold ${value ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {text}
            </span>
        ));
    }

    if (typeof value === "number") {
        const text = String(value);
        return makeCopyable(text, (
            <span className="font-(family-name:--font-jetbrains-mono) text-xs text-amber-600 dark:text-amber-400">{text}</span>
        ));
    }

    if (typeof value === "string") {
        const display = `"${value}"`;
        const isLong = value.length > 60;
        return makeCopyable(value, (
            <span className={`font-(family-name:--font-jetbrains-mono) text-xs text-sky-700 dark:text-sky-400 ${isLong ? "block whitespace-pre-wrap rounded-md px-2 py-1.5 bg-sky-50 dark:bg-black/10 border-l-2 border-sky-400/50 mt-0.5 w-full" : ""}`}>
                {display}
            </span>
        ));
    }

    if (Array.isArray(value)) {
        const jsonText = JSON.stringify(value);
        return (
            <div className="flex flex-col gap-1 w-full">
                <div className="inline-flex items-center gap-1">
                    <button
                        onClick={() => setOpen(o => !o)}
                        className="inline-flex items-center gap-1 p-0 bg-transparent border-none cursor-pointer text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70"
                    >
                        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                    {makeCopyable(jsonText, (
                        <span className="font-(family-name:--font-jetbrains-mono) text-xs">
                            <span className="text-slate-400 dark:text-white/25">Array</span>
                            <span className="text-blue-600 dark:text-blue-400 font-semibold ml-1">[{value.length}]</span>
                        </span>
                    ))}
                </div>
                {open && (
                    <div className="ml-3.5 border-l border-slate-200 dark:border-white/10 pl-3 flex flex-col gap-1.5 mt-0.5">
                        {value.slice(0, 50).map((item, i) => (
                            <div key={i} className="flex items-start gap-2 flex-wrap">
                                <span className="font-(family-name:--font-jetbrains-mono) text-[11px] text-slate-400 dark:text-white/50 shrink-0 pt-px">{i}:</span>
                                <ValueRenderer
                                    value={item as JsonValue}
                                    depth={depth + 1}
                                    copyId={`${copyId}.${i}`}
                                    copy={copy}
                                    copiedKey={copiedKey}
                                />
                            </div>
                        ))}
                        {value.length > 50 && (
                            <span className="text-[11px] text-slate-400 dark:text-white/30 font-(family-name:--font-inter) italic">
                                … {value.length - 50} more items (expand in full view)
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (typeof value === "object") {
        const entries = Object.entries(value as Record<string, JsonValue>);
        const jsonText = JSON.stringify(value, null, 2);
        return (
            <div className="flex flex-col gap-1 w-full">
                <div className="inline-flex items-center gap-1">
                    <button
                        onClick={() => setOpen(o => !o)}
                        className="inline-flex items-center gap-1 p-0 bg-transparent border-none cursor-pointer text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70"
                    >
                        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                    {makeCopyable(jsonText, (
                        <span className="font-(family-name:--font-jetbrains-mono) text-xs">
                            <span className="text-slate-400 dark:text-white/25">Object</span>
                            <span className="text-blue-600 dark:text-blue-400 font-semibold ml-1">{entries.length} keys</span>
                        </span>
                    ))}
                </div>
                {open && (
                    <div className="ml-3.5 border-l border-slate-200 dark:border-white/10 pl-3 flex flex-col gap-1.5 mt-0.5">
                        {entries.map(([k, v]) => (
                            <div key={k} className="flex items-start gap-2 flex-wrap">
                                <span className="font-(family-name:--font-jetbrains-mono) text-[11px] text-slate-500 dark:text-white/55 shrink-0 pt-px after:content-[':']">{k}</span>
                                <ValueRenderer
                                    value={v}
                                    depth={depth + 1}
                                    copyId={`${copyId}.${k}`}
                                    copy={copy}
                                    copiedKey={copiedKey}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return <span className="font-(family-name:--font-jetbrains-mono) text-xs text-sky-700 dark:text-sky-400">{String(value)}</span>;
}