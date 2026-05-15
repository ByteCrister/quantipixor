"use client";

import { Search } from "lucide-react";
import { JsonValue } from "./JsonViewerPage";
import SingleItemCard from "./SingleItemCard";
import DataCard from "./DataCard";
import PaginationBar from "./PaginationBar";

type ResultsSectionProps = {
  allItems: Record<string, JsonValue>[];
  filteredItems: Record<string, JsonValue>[];
  viewMode: 'grid' | 'list';
  copy: (id: string, text: string) => void;
  copiedKey: string | null;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
};


// ---------------------------------------------------------------------------
// ResultsSection – owns pagination state, remounts on key change to reset page
// ---------------------------------------------------------------------------
export default function ResultsSection({
    allItems,
    filteredItems,
    viewMode,
    copy,
    copiedKey,
    page,
    setPage,
    pageSize,
    setPageSize
}: ResultsSectionProps) {

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