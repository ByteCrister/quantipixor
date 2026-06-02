"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import {
    Code2,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Keyboard,
    Copy,
    Eraser,
    Check,
} from "lucide-react";
import { ENGINE_META, type DiagramEngine } from "@/types/diagram.types";
import { toast } from "@/store/toastStore";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface DiagramEditorProps {
    value: string;
    onChange: (v: string) => void;
    engine: DiagramEngine;
    defaultCode?: string;
    className?: string;
    collapsed?: boolean;
    onCollapsedChange?: (v: boolean) => void;
}

const EDITOR_SHORTCUTS = [
    { keys: "Tab", desc: "Indent 4 spaces" },
    { keys: "Shift+Tab", desc: "Outdent 4 spaces" },
    { keys: "Ctrl+/", desc: "Toggle comment" },
    { keys: "Alt+↑/↓", desc: "Move line up/down" },
    { keys: "Ctrl+D", desc: "Duplicate line" },
    { keys: "Ctrl+Backspace", desc: "Delete line" },
    { keys: "Ctrl+G", desc: "Go to line" },
];

export function DiagramEditor({
    value,
    onChange,
    engine,
    defaultCode,
    className,
    collapsed = false,
    onCollapsedChange,
}: DiagramEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumRef = useRef<HTMLDivElement>(null);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [goToLine, setGoToLine] = useState("");
    const [showGoTo, setShowGoTo] = useState(false);
    const [copied, setCopied] = useState(false);

    const lines = value.split("\n");
    const engineMeta = ENGINE_META[engine];
    const commentPrefix = engine === "mermaid" ? "%% " : "' ";

    const syncScroll = useCallback(() => {
        if (!textareaRef.current || !lineNumRef.current) return;
        lineNumRef.current.scrollTop = textareaRef.current.scrollTop;
    }, []);

    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.addEventListener("scroll", syncScroll);
        return () => ta.removeEventListener("scroll", syncScroll);
    }, [syncScroll]);

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast({ variant: "success", message: "Diagram code copied." });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({ variant: "error", message: "Could not copy to clipboard." });
        }
    };

    const clearCode = () => {
        onChange("");
        textareaRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;

        if (e.key === "Tab" && !e.shiftKey) {
            e.preventDefault();
            const newVal = value.substring(0, start) + "    " + value.substring(end);
            onChange(newVal);
            requestAnimationFrame(() => {
                ta.selectionStart = ta.selectionEnd = start + 4;
            });
            return;
        }

        if (e.key === "Tab" && e.shiftKey) {
            e.preventDefault();
            const lineStart = value.lastIndexOf("\n", start - 1) + 1;
            const lineEnd = value.indexOf("\n", start);
            const line = value.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);
            const stripped = line.replace(/^    /, "");
            const removed = line.length - stripped.length;
            if (removed > 0) {
                const newVal =
                    value.substring(0, lineStart) +
                    stripped +
                    value.substring(lineStart + line.length);
                onChange(newVal);
                requestAnimationFrame(() => {
                    ta.selectionStart = ta.selectionEnd = Math.max(start - removed, lineStart);
                });
            }
            return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key === "/") {
            e.preventDefault();
            const lineStart = value.lastIndexOf("\n", start - 1) + 1;
            const lineEnd = value.indexOf("\n", start);
            const line = value.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);
            const isCommented = line.startsWith(commentPrefix);
            const newLine = isCommented ? line.slice(commentPrefix.length) : commentPrefix + line;
            const newVal =
                value.substring(0, lineStart) +
                newLine +
                value.substring(lineStart + line.length);
            onChange(newVal);
            return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key === "d") {
            e.preventDefault();
            const lineStart = value.lastIndexOf("\n", start - 1) + 1;
            const lineEnd = value.indexOf("\n", start);
            const line = value.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);
            const insertAt = lineEnd === -1 ? value.length : lineEnd;
            const newVal = value.substring(0, insertAt) + "\n" + line + value.substring(insertAt);
            onChange(newVal);
            return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key === "Backspace") {
            e.preventDefault();
            const lineStart = value.lastIndexOf("\n", start - 1) + 1;
            const lineEnd = value.indexOf("\n", start);
            if (lineEnd === -1) {
                const newVal = value.substring(0, Math.max(0, lineStart - 1));
                onChange(newVal);
            } else {
                onChange(value.substring(0, lineStart) + value.substring(lineEnd + 1));
            }
            return;
        }

        if (e.altKey && e.key === "ArrowUp") {
            e.preventDefault();
            const lineArr = value.split("\n");
            const curLineIdx = value.substring(0, start).split("\n").length - 1;
            if (curLineIdx === 0) return;
            const swapped = [...lineArr];
            [swapped[curLineIdx - 1], swapped[curLineIdx]] = [
                swapped[curLineIdx],
                swapped[curLineIdx - 1],
            ];
            onChange(swapped.join("\n"));
            return;
        }

        if (e.altKey && e.key === "ArrowDown") {
            e.preventDefault();
            const lineArr = value.split("\n");
            const curLineIdx = value.substring(0, start).split("\n").length - 1;
            if (curLineIdx >= lineArr.length - 1) return;
            const swapped = [...lineArr];
            [swapped[curLineIdx], swapped[curLineIdx + 1]] = [
                swapped[curLineIdx + 1],
                swapped[curLineIdx],
            ];
            onChange(swapped.join("\n"));
            return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key === "g") {
            e.preventDefault();
            setShowGoTo(true);
        }
    };

    const jumpToLine = () => {
        const n = parseInt(goToLine, 10);
        if (isNaN(n) || !textareaRef.current) return;
        const lineArr = value.split("\n");
        const idx = Math.max(0, Math.min(n - 1, lineArr.length - 1));
        const pos = lineArr.slice(0, idx).join("\n").length + (idx > 0 ? 1 : 0);
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = pos;
        textareaRef.current.scrollTop = Math.max(0, idx * 20 - 80);
        setShowGoTo(false);
        setGoToLine("");
    };

    if (collapsed) {
        return (
            <div
                className={cn(
                    "flex h-full w-9 shrink-0 items-center justify-center border-r border-black/6 bg-[#0f172a] dark:border-white/8",
                    className
                )}
            >
                <button
                    type="button"
                    onClick={() => onCollapsedChange?.(false)}
                    title="Show editor"
                    aria-label="Show editor"
                    className="flex flex-col items-center gap-1 py-3 text-slate-500 transition-colors hover:text-[#60a5fa]"
                >
                    <Code2 className="size-4" />
                    <ChevronRight className="size-3" />
                </button>
            </div>
        );
    }

    return (
        <TooltipProvider delayDuration={300}>
            <div
                className={cn(
                    "flex h-full min-w-0 flex-col overflow-hidden border-r border-black/6 dark:border-white/8",
                    className
                )}
            >
                <div className="flex shrink-0 items-center justify-between border-b border-white/8 bg-[#0f172a] px-3 py-2">
                    <div className="flex items-center gap-2">
                        <Code2 className="size-3.5 text-[#60a5fa]/80" aria-hidden />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                            Editor
                        </span>
                        <span
                            className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold"
                            style={{
                                background: `${engineMeta.color}22`,
                                color: engineMeta.color,
                                border: `1px solid ${engineMeta.color}33`,
                            }}
                        >
                            {engineMeta.label}
                        </span>
                    </div>

                    <div className="flex items-center gap-0.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={copyCode}
                                    aria-label="Copy diagram code"
                                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/6 hover:text-slate-300"
                                >
                                    {copied ? (
                                        <Check className="size-3.5 text-emerald-400" />
                                    ) : (
                                        <Copy className="size-3.5" />
                                    )}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Copy code</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={clearCode}
                                    aria-label="Clear editor"
                                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/6 hover:text-slate-300"
                                >
                                    <Eraser className="size-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Clear editor</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={() => setShowShortcuts((v) => !v)}
                                    aria-label="Keyboard shortcuts"
                                    className={cn(
                                        "rounded-lg p-1.5 transition-colors",
                                        showShortcuts
                                            ? "text-[#60a5fa]"
                                            : "text-slate-500 hover:bg-white/6 hover:text-slate-300"
                                    )}
                                >
                                    <Keyboard className="size-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Shortcuts</TooltipContent>
                        </Tooltip>

                        {defaultCode && value !== defaultCode && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={() => onChange(defaultCode)}
                                        aria-label="Reset to default"
                                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/6 hover:text-slate-300"
                                    >
                                        <RotateCcw className="size-3.5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>Reset template</TooltipContent>
                            </Tooltip>
                        )}

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={() => onCollapsedChange?.(true)}
                                    aria-label="Collapse editor"
                                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/6 hover:text-slate-300"
                                >
                                    <ChevronLeft className="size-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Collapse editor</TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {showShortcuts && (
                    <div className="grid shrink-0 grid-cols-2 gap-x-4 gap-y-1.5 border-b border-white/6 bg-[#0c1222] p-3">
                        {EDITOR_SHORTCUTS.map(({ keys, desc }) => (
                            <div key={keys} className="flex items-center gap-2">
                                <kbd className="shrink-0 rounded border border-white/10 bg-white/8 px-1 py-0.5 font-mono text-[9px] text-[#60a5fa]/90">
                                    {keys}
                                </kbd>
                                <span className="truncate text-[10px] text-slate-500">{desc}</span>
                            </div>
                        ))}
                    </div>
                )}

                {showGoTo && (
                    <div className="flex shrink-0 items-center gap-2 border-b border-white/6 bg-[#0c1222] px-3 py-2">
                        <span className="text-xs text-slate-500">Go to line:</span>
                        <input
                            autoFocus
                            type="number"
                            value={goToLine}
                            onChange={(e) => setGoToLine(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") jumpToLine();
                                if (e.key === "Escape") {
                                    setShowGoTo(false);
                                    setGoToLine("");
                                }
                            }}
                            className="w-16 rounded border border-[#1856FF]/30 bg-white/7 px-2 py-0.5 font-mono text-xs text-slate-200 outline-none"
                            min={1}
                            max={lines.length}
                            placeholder={`1–${lines.length}`}
                        />
                        <button
                            type="button"
                            onClick={jumpToLine}
                            className="rounded bg-[#1856FF]/25 px-2 py-0.5 text-xs text-[#60a5fa]"
                        >
                            Jump
                        </button>
                    </div>
                )}

                <div className="relative flex flex-1 overflow-hidden bg-[#0f172a] font-mono text-sm">
                    <div
                        ref={lineNumRef}
                        className="select-none overflow-hidden shrink-0 border-r border-white/6 bg-black/20 py-4 pl-3 pr-3 text-right text-[0.7rem] leading-5 text-slate-600"
                        style={{ minWidth: "3rem" }}
                        aria-hidden
                    >
                        {lines.map((_, i) => (
                            <div key={i}>{i + 1}</div>
                        ))}
                    </div>
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        spellCheck={false}
                        autoCapitalize="off"
                        autoCorrect="off"
                        aria-label="Diagram source code"
                        className="flex-1 resize-none bg-transparent p-4 pl-3 text-[0.7rem] leading-5 text-slate-200 outline-none caret-[#60a5fa]"
                        style={{
                            fontFamily:
                                "var(--font-jetbrains-mono), 'JetBrains Mono', 'Fira Code', monospace",
                        }}
                    />
                </div>

                <div className="flex shrink-0 items-center justify-between border-t border-white/6 bg-[#0f172a] px-3 py-1.5">
                    <span className="font-mono text-[10px] text-slate-600">
                        {lines.length} lines · {value.length} chars
                    </span>
                    <button
                        type="button"
                        onClick={() => setShowGoTo(true)}
                        className="text-[10px] text-slate-600 transition-colors hover:text-[#60a5fa]/80"
                    >
                        Ctrl+G · Go to line
                    </button>
                </div>
            </div>
        </TooltipProvider>
    );
}
