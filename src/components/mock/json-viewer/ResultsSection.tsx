"use client";

import { Check, ChevronDown, ChevronLeft, ChevronRight, ChevronRightIcon, ChevronsLeft, ChevronsRight, Copy, Search } from "lucide-react";
import { Fragment, useCallback, useState } from "react";
import { JsonValue } from "./JsonViewerPage";

// ---------------------------------------------------------------------------
// CopyButton
// ---------------------------------------------------------------------------
function CopyButton({ id, text, copy, copiedKey }: {
    id: string;
    text: string;
    copy: (id: string, text: string) => void;
    copiedKey: string | null;
}) {
    const done = copiedKey === id;
    return (
        <button
            onClick={() => copy(id, text)}
            title="Copy value"
            className={`ml-1 p-0.5 rounded transition-all duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100
                ${done
                    ? "text-emerald-500 dark:text-emerald-400"
                    : "text-slate-400 dark:text-white/30 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
        >
            {done ? <Check size={11} /> : <Copy size={11} />}
        </button>
    );
}

// ---------------------------------------------------------------------------
// ValueRenderer — recursively renders JSON values
// ---------------------------------------------------------------------------
function ValueRenderer({
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

    if (value === null)
        return (
            <span className="group inline-flex items-center gap-0.5">
                <span className={`font-(family-name:--font-jetbrains-mono) text-xs italic text-slate-400 dark:text-white/30`}>null</span>
                <CopyButton id={copyId} text="null" copy={copy} copiedKey={copiedKey} />
            </span>
        );

    if (typeof value === "boolean")
        return (
            <span className="group inline-flex items-center gap-0.5">
                <span className={`font-(family-name:--font-jetbrains-mono) text-xs font-semibold ${value ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {String(value)}
                </span>
                <CopyButton id={copyId} text={String(value)} copy={copy} copiedKey={copiedKey} />
            </span>
        );

    if (typeof value === "number")
        return (
            <span className="group inline-flex items-center gap-0.5">
                <span className="font-(family-name:--font-jetbrains-mono) text-xs text-amber-600 dark:text-amber-400">{value}</span>
                <CopyButton id={copyId} text={String(value)} copy={copy} copiedKey={copiedKey} />
            </span>
        );

    if (typeof value === "string") {
        const display = `"${value}"`;
        return (
            <span className={`group inline-flex items-start gap-0.5 ${value.length > 60 ? "w-full" : ""}`}>
                <span className={`font-(family-name:--font-jetbrains-mono) text-xs text-sky-700 dark:text-sky-400 ${value.length > 60 ? "block whitespace-pre-wrap rounded-md px-2 py-1.5 bg-sky-50 dark:bg-black/10 border-l-2 border-sky-400/50 mt-0.5 w-full" : ""}`}>
                    {display}
                </span>
                <CopyButton id={copyId} text={value} copy={copy} copiedKey={copiedKey} />
            </span>
        );
    }

    if (Array.isArray(value)) {
        return (
            <div className="flex flex-col gap-1 w-full">
                <div className="inline-flex items-center gap-1">
                    <button
                        onClick={() => setOpen((o) => !o)}
                        className="inline-flex items-center gap-1 font-(family-name:--font-jetbrains-mono) text-xs text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70 transition-colors bg-transparent border-none p-0 cursor-pointer"
                    >
                        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        <span className="text-slate-400 dark:text-white/25">Array</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">[{value.length}]</span>
                    </button>
                    <CopyButton id={copyId} text={JSON.stringify(value)} copy={copy} copiedKey={copiedKey} />
                </div>
                {open && (
                    <div className="ml-3.5 border-l border-slate-200 dark:border-white/10 pl-3 flex flex-col gap-1.5 mt-0.5">
                        {value.slice(0, 50).map((item, i) => (
                            <div key={i} className="flex items-start gap-2 flex-wrap">
                                <span className="font-(family-name:--font-jetbrains-mono) text-[11px] text-slate-400 dark:text-white/50 shrink-0 pt-px">{i}:</span>
                                <ValueRenderer value={item as JsonValue} depth={depth + 1} copyId={`${copyId}.${i}`} copy={copy} copiedKey={copiedKey} />
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
        return (
            <div className="flex flex-col gap-1 w-full">
                <div className="inline-flex items-center gap-1">
                    <button
                        onClick={() => setOpen((o) => !o)}
                        className="inline-flex items-center gap-1 font-(family-name:--font-jetbrains-mono) text-xs text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70 transition-colors bg-transparent border-none p-0 cursor-pointer"
                    >
                        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        <span className="text-slate-400 dark:text-white/25">Object</span>
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">{entries.length} keys</span>
                    </button>
                    <CopyButton id={copyId} text={JSON.stringify(value, null, 2)} copy={copy} copiedKey={copiedKey} />
                </div>
                {open && (
                    <div className="ml-3.5 border-l border-slate-200 dark:border-white/10 pl-3 flex flex-col gap-1.5 mt-0.5">
                        {entries.map(([k, v]) => (
                            <div key={k} className="flex items-start gap-2 flex-wrap">
                                <span className="font-(family-name:--font-jetbrains-mono) text-[11px] text-slate-500 dark:text-white/55 shrink-0 pt-px after:content-[':']">{k}</span>
                                <ValueRenderer value={v} depth={depth + 1} copyId={`${copyId}.${k}`} copy={copy} copiedKey={copiedKey} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return <span className="font-(family-name:--font-jetbrains-mono) text-xs text-sky-700 dark:text-sky-400">{String(value)}</span>;
}

// ---------------------------------------------------------------------------
// SingleItemCard – full‑size view for a single object
// ---------------------------------------------------------------------------
function SingleItemCard({
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

// ---------------------------------------------------------------------------
// DataCard
// ---------------------------------------------------------------------------
function DataCard({
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
                            <CopyButton
                                id={`field-${globalIndex}-${key}`}
                                text={typeof value === "object" && value !== null ? JSON.stringify(value, null, 2) : String(value ?? "null")}
                                copy={copy}
                                copiedKey={copiedKey}
                            />
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

// ---------------------------------------------------------------------------
// Pagination controls
// ---------------------------------------------------------------------------
const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

function PaginationBar({
    page,
    totalPages,
    pageSize,
    totalItems,
    onPage,
    onPageSize,
}: {
    page: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPage: (p: number) => void;
    onPageSize: (s: number) => void;
}) {
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalItems);

    const pages: (number | "…")[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (page > 3) pages.push("…");
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
        if (page < totalPages - 2) pages.push("…");
        pages.push(totalPages);
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-[12px] text-slate-400 dark:text-white/35 font-(family-name:--font-inter)">
                Showing <span className="font-semibold text-slate-600 dark:text-white/60">{from}–{to}</span> of <span className="font-semibold text-slate-600 dark:text-white/60">{totalItems.toLocaleString()}</span> entries
            </span>

            <div className="flex items-center gap-1.5">
                <button onClick={() => onPage(1)} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/30 hover:bg-slate-100 dark:hover:bg-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronsLeft size={14} />
                </button>
                <button onClick={() => onPage(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/30 hover:bg-slate-100 dark:hover:bg-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft size={14} />
                </button>

                {pages.map((p, i) =>
                    p === "…" ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-slate-400 dark:text-white/30 text-xs">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPage(p as number)}
                            className={`min-w-8 h-8 px-2 rounded-lg text-xs font-medium border transition-all ${p === page
                                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                : "border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/[0.07]"
                                }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button onClick={() => onPage(page + 1)} disabled={page === totalPages} className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/30 hover:bg-slate-100 dark:hover:bg-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronRightIcon size={14} />
                </button>
                <button onClick={() => onPage(totalPages)} disabled={page === totalPages} className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/30 hover:bg-slate-100 dark:hover:bg-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronsRight size={14} />
                </button>

                <select
                    value={pageSize}
                    onChange={(e) => { onPageSize(Number(e.target.value)); onPage(1); }}
                    className="ml-2 h-8 px-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/4 text-slate-600 dark:text-white/70 text-xs font-medium outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-all cursor-pointer"
                >
                    {PAGE_SIZE_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s} / page</option>
                    ))}
                </select>
            </div>
        </div>
    );
}


// ---------------------------------------------------------------------------
// ResultsSection – owns pagination state, remounts on key change to reset page
// ---------------------------------------------------------------------------
export default function ResultsSection({
    allItems,
    filteredItems,
    viewMode,
    copy,
    copiedKey,
}: {
    allItems: Record<string, JsonValue>[];
    filteredItems: Record<string, JsonValue>[];
    viewMode: "grid" | "list";
    copy: (id: string, text: string) => void;
    copiedKey: string | null;
}) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    // If filteredItems change (e.g. search term changed), React will
    // unmount and remount this component because its key changed in the parent.
    // That automatically resets `page` to 1 – no useEffect needed!

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const pageItems = filteredItems.slice((safePage - 1) * pageSize, safePage * pageSize);

    // Single‑item view
    if (filteredItems.length === 1) {
        return (
            <div className="flex flex-col gap-5">
                <SingleItemCard
                    data={filteredItems[0]}
                    globalIndex={allItems.indexOf(filteredItems[0])}
                    copy={copy}
                    copiedKey={copiedKey}
                />
            </div>
        );
    }

    // Empty state
    if (filteredItems.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Search size={28} className="text-slate-300 dark:text-white/15" />
                <p className="text-sm font-medium text-slate-400 dark:text-white/35">
                    No entries match your search
                </p>
            </div>
        );
    }

    return (
        <>
            <div
                className={
                    viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        : "flex flex-col gap-3"
                }
            >
                {pageItems.map((item, i) => (
                    <DataCard
                        key={(safePage - 1) * pageSize + i}
                        data={item}
                        index={i}
                        globalIndex={(safePage - 1) * pageSize + i}
                        copy={copy}
                        copiedKey={copiedKey}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <PaginationBar
                    page={safePage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={filteredItems.length}
                    onPage={setPage}
                    onPageSize={setPageSize}
                />
            )}
        </>
    );
}