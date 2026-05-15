"use client";

import { useCallback } from "react";
import { JsonValue } from "./JsonViewerPage";
import { Check, Copy } from "lucide-react";
import ValueRenderer from "./ValueRenderer";



// ---------------------------------------------------------------------------
// DataCard
// ---------------------------------------------------------------------------
export default function DataCard({
    data,
    index,
    globalIndex,
    copy,
    copiedKey,
}: {
    data: Record<string, JsonValue>;
    index: number;
    globalIndex: number;
    copy: (id: string, text: string) => void;
    copiedKey: string | null;
}) {
    const copyEntire = useCallback(() => {
        copy(`card-${globalIndex}`, JSON.stringify(data, null, 2));
    }, [copy, globalIndex, data]);

    return (
        <article
            className="rounded-2xl overflow-hidden bg-white dark:bg-white/4 border border-slate-200 dark:border-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 hover:border-blue-200 dark:hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.55)] transition-all duration-200 animate-[fadeUp_0.25s_ease_both]"
            style={{ animationDelay: `${index * 35}ms` }}
        >
            <header className="flex items-center justify-between gap-2.5 px-4 py-3 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/2">
                <div className="flex items-center gap-2">
                    <span className="font-(family-name:--font-jetbrains-mono) text-[10px] font-bold tracking-widest text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-500/15 rounded px-2 py-0.5">
                        #{globalIndex + 1}
                    </span>
                    <span className="text-[13px] font-semibold tracking-wide text-slate-400 dark:text-white/50 font-(family-name:--font-plus-jakarta)">
                        Entry
                    </span>
                </div>
                <button
                    onClick={copyEntire}
                    title="Copy entire entry as JSON"
                    className="flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-white/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                    {copiedKey === `card-${globalIndex}` ? (
                        <><Check size={11} className="text-emerald-500" /><span className="text-emerald-500">Copied</span></>
                    ) : (
                        <><Copy size={11} /><span>Copy JSON</span></>
                    )}
                </button>
            </header>

            <div className="px-4 py-3.5 flex flex-col gap-3">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-1 group">
                        <div className="flex items-center gap-1">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-white/30 font-(family-name:--font-space-grotesk)">
                                {key}
                            </p>
                        </div>
                        <div className="text-[13px] leading-relaxed break-all">
                            <ValueRenderer
                                value={value}
                                copyId={`val-${globalIndex}-${key}`}
                                copy={copy}
                                copiedKey={copiedKey}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </article>
    );
}