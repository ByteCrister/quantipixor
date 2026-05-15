"use client";

import { ChevronLeft, ChevronRightIcon, ChevronsLeft, ChevronsRight } from "lucide-react";

// ---------------------------------------------------------------------------
// Pagination controls
// ---------------------------------------------------------------------------
const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

export default function PaginationBar({
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