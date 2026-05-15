"use client";

import { useState, useCallback, useEffect, useRef, useMemo, Fragment } from "react";
import {
    Upload,
    FileJson,
    AlertCircle,
    Copy,
    Check,
    Trash2,
    File,
    Search,
    X,
    Download,
    Braces,
    List,
    Hash,
    LayoutGrid,
    Zap,
    FileText,
    Clipboard,
    HardDrive,
    Loader2,
} from "lucide-react";
import {
    plusJakarta,
    jetbrainsMono,
    inter,
    spaceGrotesk,
} from "@/fonts/google-fonts";
import { useFuseSearch } from "@/hooks/useFuseSearch";
import ResultsSection from "./ResultsSection";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type JsonValue =
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

export type ParseResult =
    | { data: JsonValue; error: null }
    | { data: null; error: string };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;   // 10 MB

// ---------------------------------------------------------------------------
// Web Worker helper (creates an inline worker from a string)
// ---------------------------------------------------------------------------
function createJsonWorker() {
    const code = `
        self.onmessage = (e) => {
            const { id, raw } = e.data;
            try {
                const data = JSON.parse(raw);
                self.postMessage({ id, data, error: null });
            } catch (err) {
                self.postMessage({
                    id,
                    data: null,
                    error: err instanceof SyntaxError ? err.message : "Invalid JSON",
                });
            }
        };
    `;
    const blob = new Blob([code], { type: "application/javascript" });
    return new Worker(URL.createObjectURL(blob));
}

// ---------------------------------------------------------------------------
// useCopyField — per-field copy state
// ---------------------------------------------------------------------------
function useCopyField() {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const copy = useCallback(async (key: string, text: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1800);
    }, []);
    return { copiedKey, copy };
}

// ---------------------------------------------------------------------------
// StatsBar
// ---------------------------------------------------------------------------
function StatsBar({ parsed }: { parsed: JsonValue }) {
    const stats = useMemo(() => {
        if (Array.isArray(parsed)) {
            return {
                type: "array",
                count: parsed.length,
                keys: parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null
                    ? Object.keys(parsed[0] as object).length
                    : null,
            };
        }
        if (parsed && typeof parsed === "object") {
            return { type: "object", count: 1, keys: Object.keys(parsed as object).length };
        }
        return { type: typeof parsed, count: 1, keys: null };
    }, [parsed]);

    return (
        <div className="flex items-center gap-3 flex-wrap">
            <Chip icon={<Braces size={11} />} label="Type" value={stats.type} />
            <Chip icon={<Hash size={11} />} label="Items" value={stats.count.toLocaleString()} />
            {stats.keys !== null && (
                <Chip icon={<List size={11} />} label="Fields" value={String(stats.keys)} />
            )}
        </div>
    );
}

function Chip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/6 border border-slate-200 dark:border-white/10 text-[11px]">
            <span className="text-slate-400 dark:text-white/30">{icon}</span>
            <span className="text-slate-400 dark:text-white/35 font-(family-name:--font-inter)">{label}:</span>
            <span className="font-semibold text-slate-700 dark:text-white/70 font-(family-name:--font-space-grotesk)">{value}</span>
        </div>
    );
}

function SearchToolbar({
    search,
    setSearch,
    viewMode,
    setViewMode,
    resultCount,
}: {
    search: string;
    setSearch: (s: string) => void;
    viewMode: "grid" | "list";
    setViewMode: (v: "grid" | "list") => void;
    resultCount: number | null; // only shown when search is active
}) {
    return (
        <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-50">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 pointer-events-none" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search entries…"
                    className="w-full pl-8 pr-8 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/4 text-slate-700 dark:text-white/80 text-[13px] outline-none placeholder:text-slate-300 dark:placeholder:text-white/20 focus:border-blue-400 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-black/10 transition-all font-(family-name:--font-inter)"
                />
                {search && (
                    <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 transition-colors">
                        <X size={13} />
                    </button>
                )}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/10">
                <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60"}`}
                    title="Grid view"
                >
                    <LayoutGrid size={14} />
                </button>
                <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-white dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60"}`}
                    title="List view"
                >
                    <List size={14} />
                </button>
            </div>

            {search && resultCount !== null && (
                <span className="text-[12px] text-slate-500 dark:text-white/40 font-(family-name:--font-inter)">
                    {resultCount.toLocaleString()} result{resultCount !== 1 ? "s" : ""}
                </span>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function JsonViewerPage() {
    const [tab, setTab] = useState<"paste" | "upload">("paste");
    const [input, setInput] = useState("");
    const [debouncedInput, setDebouncedInput] = useState("");
    const [copied, setCopied] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileSize, setFileSize] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const fileRef = useRef<HTMLInputElement>(null);
    const { copiedKey, copy } = useCopyField();

    const requestIdRef = useRef(0);       // incremented each time we ask the worker
    const responseIdRef = useRef(0);      // updated when worker replies with the latest id
    const [, setResponseVersion] = useState(0); // only used to trigger a re‑render

    // Parsing state – result comes from the worker asynchronously
    const [workerParseResult, setWorkerParseResult] = useState<ParseResult | null>(null);

    // Worker ref – we keep it alive as long as the component is mounted
    const workerRef = useRef<Worker | null>(null);
    const [isParsing, setIsParsing] = useState(false);

    useEffect(() => {
        const worker = createJsonWorker();
        workerRef.current = worker;

        worker.onmessage = (e) => {
            const { id, data, error } = e.data;
            // Only accept a response that matches the most recent request
            if (id === requestIdRef.current) {
                setWorkerParseResult({ data, error });
                setIsParsing(false);
                responseIdRef.current = id;
                setResponseVersion(v => v + 1);   // force re‑render
            }
        };

        return () => {
            worker.terminate();
        };
    }, []);

    // Send input to web worker for parsing
    useEffect(() => {
        if (!workerRef.current) return;

        // Clear results when input is empty
        if (!debouncedInput.trim()) {
            // avoid synchronous setState during render/effect body which can cause
            // cascading renders; schedule update asynchronously
            const t = setTimeout(() => setIsParsing(false), 0);
            return () => clearTimeout(t);
        }

        const id = ++requestIdRef.current;
        // Avoid calling setState synchronously inside an effect to prevent
        // cascading renders. Schedule the update asynchronously.
        const t = setTimeout(() => setIsParsing(true), 0);
        workerRef.current.postMessage({ id, raw: debouncedInput });
        return () => clearTimeout(t);
    }, [debouncedInput]);


    // Debounce raw input
    useEffect(() => {
        const t = setTimeout(() => setDebouncedInput(input), 400);
        return () => clearTimeout(t);
    }, [input]);

    const parseResult = debouncedInput.trim() ? workerParseResult : null;
    const parsed = parseResult?.data ?? null;
    const error = parseResult?.error ?? null;


    // Flatten to array of objects for pagination
    const allItems = useMemo<Record<string, JsonValue>[]>(() => {
        if (Array.isArray(parsed)) return parsed as Record<string, JsonValue>[];
        if (parsed && typeof parsed === "object") return [parsed as Record<string, JsonValue>];
        return [];
    }, [parsed]);

    // Search filter
    const fuseOptions = useMemo(() => ({}), []);   // or any custom threshold, distance, etc.
    const filteredItems = useFuseSearch(allItems, search, fuseOptions);

    // File upload
    const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_FILE_SIZE_BYTES) {
            alert(`File too large. Maximum supported size is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`);
            return;
        }
        setFileName(file.name);
        setFileSize(file.size);
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (typeof ev.target?.result === "string") {
                setInput(ev.target.result);
                setIsParsing(true);
                setTab("paste");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    }, []);

    const handleCopyAll = async () => {
        if (!parsed) return;
        await navigator.clipboard.writeText(JSON.stringify(parsed, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!parsed) return;
        const blob = new Blob([JSON.stringify(parsed, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName ?? "data.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleClear = () => {
        setInput("");
        setDebouncedInput("");
        setFileName(null);
        setFileSize(null);
        setSearch("");
    };

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <div className={`${plusJakarta.variable} ${jetbrainsMono.variable} ${inter.variable} ${spaceGrotesk.variable}`}>
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>

            <div className="min-h-screen relative overflow-x-hidden bg-slate-50 dark:bg-[#0b0d14] transition-colors duration-300 font-(family-name:--font-plus-jakarta)">
                {/* Dark-mode ambient blobs */}
                <div className="pointer-events-none fixed rounded-full blur-[100px] w-175 h-175 -top-56 -left-40 opacity-0 dark:opacity-100 bg-blue-600/18 transition-opacity duration-500" />
                <div className="pointer-events-none fixed rounded-full blur-[80px] w-100 h-100 bottom-[8%] -right-28 opacity-0 dark:opacity-100 bg-emerald-500/10 transition-opacity duration-500" />
                <div className="pointer-events-none fixed rounded-full blur-[70px] w-72 h-72 top-[45%] left-[42%] opacity-0 dark:opacity-100 bg-violet-500/8 transition-opacity duration-500" />

                {/* Light-mode dot grid */}
                <div
                    className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-0 transition-opacity duration-500"
                    style={{
                        backgroundImage: "radial-gradient(circle, #1856FF 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                    }}
                />

                <div className="relative z-10 max-w-5xl mx-auto px-5 pt-10 pb-24 flex flex-col gap-8">
                    {/* Hero Header */}
                    <header className="flex flex-col gap-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 shadow-[0_0_28px_rgba(37,99,235,0.45)] dark:shadow-[0_0_36px_rgba(37,99,235,0.6)] flex items-center justify-center text-white">
                                        <FileJson size={26} />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-50 dark:border-[#0b0d14] shadow-sm" />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                                            JSON Explorer
                                        </h1>
                                        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-bold tracking-widest uppercase font-(family-name:--font-space-grotesk)">
                                            Pro
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-white/45 max-w-md font-(family-name:--font-inter)">
                                        Paste, upload, search and paginate large JSON files — up to{" "}
                                        <span className="font-semibold text-slate-700 dark:text-white/60">
                                            {MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB
                                        </span>.
                                        Copy any field with one click.
                                    </p>
                                </div>
                            </div>

                            {parsed && (
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={handleCopyAll}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/4 text-slate-600 dark:text-white/60 text-xs font-medium hover:bg-slate-50 dark:hover:bg-white/8 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all shadow-sm"
                                    >
                                        {copied ? <><Check size={13} className="text-emerald-500" /><span className="text-emerald-500">Copied</span></> : <><Copy size={13} /> Copy all</>}
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/4 text-slate-600 dark:text-white/60 text-xs font-medium hover:bg-slate-50 dark:hover:bg-white/8 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all shadow-sm"
                                    >
                                        <Download size={13} /> Download
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Feature pills – now using lucide icons instead of emojis */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { icon: <Zap size={13} />, text: "Non-blocking parse" },
                                { icon: <Search size={13} />, text: "Full-text search" },
                                { icon: <FileText size={13} />, text: "Smart pagination" },
                                { icon: <Clipboard size={13} />, text: "One-click copy" },
                                { icon: <HardDrive size={13} />, text: "Up to 10 MB" },
                            ].map(({ icon, text }) => (
                                <span
                                    key={text}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-white/4 border border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-white/40 font-(family-name:--font-inter) shadow-sm"
                                >
                                    <span className="text-slate-400 dark:text-white/30">{icon}</span> {text}
                                </span>
                            ))}
                        </div>
                    </header>

                    {/* Input Panel */}
                    <section className="rounded-2xl p-5 sm:p-6 flex flex-col gap-4 bg-white dark:bg-white/4 border border-slate-200 dark:border-white/10 shadow-[0_2px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                        <div className="flex gap-1.5 bg-slate-100 dark:bg-white/5 rounded-xl p-1 w-fit">
                            {(["paste", "upload"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-[9px] text-[13px] font-medium border transition-all duration-150 cursor-pointer font-(family-name:--font-plus-jakarta) ${tab === t
                                        ? "bg-white dark:bg-blue-600/20 border-blue-300 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-semibold shadow-sm"
                                        : "bg-transparent border-transparent text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80"
                                        }`}
                                >
                                    {t === "upload" && <Upload size={13} />}
                                    {t === "paste" ? "Paste JSON" : "Upload File"}
                                </button>
                            ))}
                        </div>

                        {tab === "paste" ? (
                            <textarea
                                className={`w-full min-h-50 px-4 py-3.5 rounded-xl border font-(family-name:--font-jetbrains-mono) text-[13px] leading-[1.75] resize-y outline-none transition-all duration-150
                                    text-slate-800 dark:text-white/90
                                    bg-slate-50 dark:bg-black/20
                                    placeholder:text-slate-300 dark:placeholder:text-white/15
                                    focus:bg-white dark:focus:bg-blue-600/3
                                    ${error
                                        ? "border-rose-400 dark:border-rose-500/60 focus:border-rose-500"
                                        : "border-slate-200 dark:border-white/10 focus:border-blue-400 dark:focus:border-blue-500"
                                    }`}
                                placeholder={'[\n  { "id": 1, "name": "Alice", "role": "admin" },\n  { "id": 2, "name": "Bob",   "role": "user"  }\n]'}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    setIsParsing(true);
                                }}
                                spellCheck={false}
                            />
                        ) : (
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-3 min-h-45 border-2 border-dashed border-slate-200 dark:border-white/20 rounded-xl cursor-pointer px-8 py-10 transition-all duration-150 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-600/4 group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/6 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-500/10 transition-colors">
                                    <File size={22} className="text-slate-400 dark:text-white/30 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-slate-600 dark:text-white/60 font-(family-name:--font-plus-jakarta)">
                                        {fileName ?? "Drop your JSON file here"}
                                    </p>
                                    {fileSize && (
                                        <p className="text-[11px] text-slate-400 dark:text-white/30 mt-0.5 font-(family-name:--font-inter)">
                                            {formatBytes(fileSize)}
                                        </p>
                                    )}
                                    {!fileName && (
                                        <p className="text-[11px] text-slate-400 dark:text-white/30 mt-1 font-(family-name:--font-inter)">
                                            or click to browse · max {MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB
                                        </p>
                                    )}
                                </div>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".json,application/json"
                                    className="sr-only"
                                    onChange={handleFile}
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={handleClear}
                                disabled={!input}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-transparent text-slate-500 dark:text-white/50 text-xs font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.07] hover:border-slate-300 dark:hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <Trash2 size={13} /> Clear
                            </button>

                            {/* Show loader while parsing */}
                            {isParsing && (
                                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                    <Loader2 size={14} className="animate-spin" />
                                    Parsing…
                                </div>
                            )}

                            {parsed && debouncedInput.trim() !== '' && !isParsing && (
                                <>
                                    <StatsBar parsed={parsed} />
                                    <span className="ml-auto text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-600/15 border border-blue-200 dark:border-blue-500/25 rounded-full px-3 py-1 font-(family-name:--font-space-grotesk)">
                                        {allItems.length.toLocaleString()} {allItems.length === 1 ? "entry" : "entries"}
                                    </span>
                                </>
                            )}
                        </div>

                        {error && debouncedInput.trim() !== '' && !isParsing && (
                            <div role="alert" className="flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-rose-600 dark:text-rose-400 font-(family-name:--font-jetbrains-mono) text-xs leading-relaxed">
                                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                    </section>

                    {/* Results – pagination reset via key */}
                    {allItems.length > 0 && debouncedInput.trim() !== '' && !isParsing && (
                        <section className="flex flex-col gap-5">
                            {/* Toolbar – never remounts */}
                            <SearchToolbar
                                search={search}
                                setSearch={setSearch}
                                viewMode={viewMode}
                                setViewMode={setViewMode}
                                resultCount={search ? filteredItems.length : null}
                            />

                            <div className="flex items-center gap-2">
                                <h2 className="text-[13px] font-semibold text-slate-400 dark:text-white/35 uppercase tracking-widest">
                                    {search ? "Search Results" : "All Entries"}
                                </h2>
                                <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.07]" />
                            </div>

                            {/* Results – remount when data or search changes → resets pagination */}
                            <ResultsSection
                                key={`${debouncedInput}-${search}`}   // now safe: input is outside
                                allItems={allItems}
                                filteredItems={filteredItems}
                                viewMode={viewMode}
                                copy={copy}
                                copiedKey={copiedKey}
                            />
                        </section>
                    )}

                    {/* Empty state */}
                    {!error && !parsed && !input.trim() && !isParsing && (
                        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                            <div className="w-20 h-20 rounded-[22px] bg-white dark:bg-white/4 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-300 dark:text-white/15 shadow-sm">
                                <FileJson size={36} />
                            </div>
                            <div>
                                <p className="text-base font-bold text-slate-400 dark:text-white/35 font-(family-name:--font-plus-jakarta)">
                                    Ready to explore
                                </p>
                                <p className="text-[13px] text-slate-400 dark:text-white/25 max-w-85 leading-relaxed mt-1 font-(family-name:--font-inter)">
                                    Paste JSON above or upload a file. Arrays are paginated automatically — even millions of rows.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}