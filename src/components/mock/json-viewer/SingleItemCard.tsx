"use client";

import { Fragment, useCallback } from "react";
import { JsonValue } from "./JsonViewerPage";
import { Check, Copy } from "lucide-react";
import CopyButton from "./CopyButton";
import ValueRenderer from "./ValueRenderer";

// ---------------------------------------------------------------------------
// SingleItemCard – full‑size view for a single object
// ---------------------------------------------------------------------------
export default function SingleItemCard({
    data,
    globalIndex,
    copy,
    copiedKey,
}: {
    data: Record<string, JsonValue>;
    globalIndex: number;
    copy: (id: string, text: string) => void;
    copiedKey: string | null;
}) {
    const copyEntire = useCallback(() => {
        copy(`expanded-${globalIndex}`, JSON.stringify(data, null, 2));
    }, [copy, globalIndex, data]);

    return (
        <article className="w-full rounded-2xl overflow-hidden bg-white dark:bg-white/4 border border-blue-200 dark:border-blue-500/30 shadow-[0_4px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.55)]">
            {/* Header */}
            <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 dark:border-white/10 bg-linear-to-r from-blue-50/80 to-transparent dark:from-blue-500/10 dark:to-transparent">
                <div className="flex items-center gap-3">
                    <span className="font-(family-name:--font-jetbrains-mono) text-xs font-bold tracking-widest text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-500/20 rounded-lg px-3 py-1">
                        #1
                    </span>
                    <span className="text-sm font-semibold tracking-wide text-slate-700 dark:text-white/70 font-(family-name:--font-plus-jakarta)">
                        Single Entry
                    </span>
                </div>
                <button
                    onClick={copyEntire}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-white/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                    {copiedKey === `expanded-${globalIndex}` ? (
                        <>
                            <Check size={13} className="text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy size={13} />
                            <span>Copy full JSON</span>
                        </>
                    )}
                </button>
            </header>

            {/* Body – two‑column layout for keys and values */}
            <div className="px-6 py-5 grid grid-cols-[minmax(0,auto)_1fr] gap-x-6 gap-y-4">
                {Object.entries(data).map(([key, value]) => (
                    <Fragment key={key}>
                        {/* Key column */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="text-xs font-semibold uppercase tracking-[0.06em] text-slate-500 dark:text-white/40 font-(family-name:--font-space-grotesk) whitespace-nowrap">
                                {key}
                            </span>
                            <CopyButton
                                id={`field-expanded-${globalIndex}-${key}`}
                                text={
                                    typeof value === "object" && value !== null
                                        ? JSON.stringify(value, null, 2)
                                        : String(value ?? "null")
                                }
                                copy={copy}
                                copiedKey={copiedKey}
                            />
                        </div>
                        {/* Value column */}
                        <div className="text-sm leading-relaxed break-all">
                            <ValueRenderer
                                value={value}
                                copyId={`val-expanded-${globalIndex}-${key}`}
                                copy={copy}
                                copiedKey={copiedKey}
                            />
                        </div>
                    </Fragment>
                ))}
            </div>
        </article>
    );
}