"use client";
// ─── src/components/diagrams/DiagramEditor.tsx ───────────────────────────────
// Improved editor: collapsible, keyboard shortcuts (indent/outdent, comment,
// duplicate line, move line, go to line), line numbers synced on scroll

import { useRef, useEffect, useCallback, useState } from "react";
import { COLORS } from "@/styles/design-tokens";
import { cn } from "@/lib/utils";
import { Code2, RotateCcw, ChevronLeft, ChevronRight, Keyboard } from "lucide-react";

interface DiagramEditorProps {
    value: string;
    onChange: (v: string) => void;
    type: string;
    defaultValue?: string;
    className?: string;
    /** Controlled collapsed state from parent */
    collapsed?: boolean;
    onCollapsedChange?: (v: boolean) => void;
    style?: React.CSSProperties; 
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
    type,
    defaultValue,
    className,
    collapsed = false,
    onCollapsedChange,
}: DiagramEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumRef = useRef<HTMLDivElement>(null);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [goToLine, setGoToLine] = useState<string>("");
    const [showGoTo, setShowGoTo] = useState(false);

    const lines = value.split("\n");

    // Sync scroll between line numbers and textarea
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

    // ── Key bindings ─────────────────────────────────────────────────────────────
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;

        // Tab → indent
        if (e.key === "Tab" && !e.shiftKey) {
            e.preventDefault();
            const newVal = value.substring(0, start) + "    " + value.substring(end);
            onChange(newVal);
            requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 4; });
            return;
        }

        // Shift+Tab → outdent
        if (e.key === "Tab" && e.shiftKey) {
            e.preventDefault();
            const lineStart = value.lastIndexOf("\n", start - 1) + 1;
            const lineEnd = value.indexOf("\n", start);
            const line = value.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);
            const stripped = line.replace(/^    /, "");
            const removed = line.length - stripped.length;
            if (removed > 0) {
                const newVal = value.substring(0, lineStart) + stripped + value.substring(lineStart + line.length);
                onChange(newVal);
                requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = Math.max(start - removed, lineStart); });
            }
            return;
        }

        // Ctrl+/ → toggle line comment (# for both mermaid and plantuml)
        if ((e.ctrlKey || e.metaKey) && e.key === "/") {
            e.preventDefault();
            const lineStart = value.lastIndexOf("\n", start - 1) + 1;
            const lineEnd = value.indexOf("\n", start);
            const line = value.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);
            const actualPrefix = type === "mermaid" ? "%% " : "' ";
            const isCommented = line.startsWith(actualPrefix);
            const newLine = isCommented ? line.slice(actualPrefix.length) : actualPrefix + line;
            const newVal = value.substring(0, lineStart) + newLine + value.substring(lineStart + line.length);
            onChange(newVal);
            return;
        }

        // Ctrl+D → duplicate line
        if ((e.ctrlKey || e.metaKey) && e.key === "d") {
            e.preventDefault();
            const lineStart = value.lastIndexOf("\n", start - 1) + 1;
            const lineEnd = value.indexOf("\n", start);
            const line = value.substring(lineStart, lineEnd === -1 ? undefined : lineEnd);
            const insertAt = lineEnd === -1 ? value.length : lineEnd;
            const newVal = value.substring(0, insertAt) + "\n" + line + value.substring(insertAt);
            onChange(newVal);
            requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = insertAt + 1 + (start - lineStart); });
            return;
        }

        // Ctrl+Backspace → delete current line
        if ((e.ctrlKey || e.metaKey) && e.key === "Backspace") {
            e.preventDefault();
            const lineStart = value.lastIndexOf("\n", start - 1) + 1;
            const lineEnd = value.indexOf("\n", start);
            if (lineEnd === -1) {
                // Last line
                const newVal = value.substring(0, Math.max(0, lineStart - 1));
                onChange(newVal);
                requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = newVal.length; });
            } else {
                const newVal = value.substring(0, lineStart) + value.substring(lineEnd + 1);
                onChange(newVal);
                requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = lineStart; });
            }
            return;
        }

        // Alt+ArrowUp → move line up
        if (e.altKey && e.key === "ArrowUp") {
            e.preventDefault();
            const lineArr = value.split("\n");
            const curLineIdx = value.substring(0, start).split("\n").length - 1;
            if (curLineIdx === 0) return;
            const swapped = [...lineArr];
            [swapped[curLineIdx - 1], swapped[curLineIdx]] = [swapped[curLineIdx], swapped[curLineIdx - 1]];
            onChange(swapped.join("\n"));
            const newPos = swapped.slice(0, curLineIdx - 1).join("\n").length + (curLineIdx - 1 > 0 ? 1 : 0) + (start - value.split("\n").slice(0, curLineIdx).join("\n").length - (curLineIdx > 0 ? 1 : 0));
            requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = Math.max(0, newPos); });
            return;
        }

        // Alt+ArrowDown → move line down
        if (e.altKey && e.key === "ArrowDown") {
            e.preventDefault();
            const lineArr = value.split("\n");
            const curLineIdx = value.substring(0, start).split("\n").length - 1;
            if (curLineIdx >= lineArr.length - 1) return;
            const swapped = [...lineArr];
            [swapped[curLineIdx], swapped[curLineIdx + 1]] = [swapped[curLineIdx + 1], swapped[curLineIdx]];
            onChange(swapped.join("\n"));
            return;
        }

        // Ctrl+G → go to line
        if ((e.ctrlKey || e.metaKey) && e.key === "g") {
            e.preventDefault();
            setShowGoTo(true);
            return;
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
        // Scroll line into view
        const lineHeight = 20;
        textareaRef.current.scrollTop = Math.max(0, idx * lineHeight - 80);
        setShowGoTo(false);
        setGoToLine("");
    };

    if (collapsed) {
        return (
            <div
      className={cn("flex items-center justify-center border-r h-full", className)}
            style={{ borderColor: COLORS.neutral100, background: "#0F172A", width: 36 }}
            >
                <button
                    onClick={() => onCollapsedChange?.(false)}
                    title="Show editor"
                    className="flex flex-col items-center gap-1 py-3 group"
                    style={{ color: "rgba(148,163,184,0.5)" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "rgba(96,165,250,0.8)"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "rgba(148,163,184,0.5)"}
                >
                    <Code2 className="size-4" />
                    <ChevronRight className="size-3 mt-1" />
                </button>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col h-full overflow-hidden", className)}>
            {/* Header */}
            <div
                className="flex items-center justify-between px-3 py-2 border-b shrink-0"
                style={{
                    background: "rgba(15,23,42,0.95)",
                    borderColor: "rgba(255,255,255,0.07)",
                }}
            >
                <div className="flex items-center gap-2">
                    <Code2 className="size-3.5" style={{ color: "rgba(96,165,250,0.7)" }} />
                    <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "rgba(148,163,184,0.6)" }}>
                        Editor
                    </span>
                    <span
                        className="text-xs px-1.5 py-0.5 rounded font-mono"
                        style={{
                            background: "rgba(24,86,255,0.15)",
                            color: "rgba(96,165,250,0.9)",
                            border: "1px solid rgba(24,86,255,0.2)",
                        }}
                    >
                        {type === "mermaid" ? "Mermaid" : "PlantUML"}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    {/* Keyboard shortcuts toggle */}
                    <button
                        onClick={() => setShowShortcuts((v) => !v)}
                        title="Editor shortcuts"
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: showShortcuts ? "rgba(96,165,250,0.9)" : "rgba(148,163,184,0.4)" }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "rgba(96,165,250,0.8)"}
                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = showShortcuts ? "rgba(96,165,250,0.9)" : "rgba(148,163,184,0.4)"}
                    >
                        <Keyboard className="size-3.5" />
                    </button>

                    {/* Reset */}
                    {defaultValue && value !== defaultValue && (
                        <button
                            onClick={() => onChange(defaultValue)}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                            style={{ color: "rgba(148,163,184,0.5)" }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.background = "rgba(24,86,255,0.15)";
                                (e.currentTarget as HTMLElement).style.color = "rgba(96,165,250,0.9)";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background = "transparent";
                                (e.currentTarget as HTMLElement).style.color = "rgba(148,163,184,0.5)";
                            }}
                        >
                            <RotateCcw className="size-3" />
                            Reset
                        </button>
                    )}

                    {/* Collapse */}
                    <button
                        onClick={() => onCollapsedChange?.(true)}
                        title="Hide editor (focus mode)"
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "rgba(148,163,184,0.4)" }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "rgba(96,165,250,0.8)"}
                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "rgba(148,163,184,0.4)"}
                    >
                        <ChevronLeft className="size-3.5" />
                    </button>
                </div>
            </div>

            {/* Shortcuts panel */}
            {showShortcuts && (
                <div
                    className="border-b shrink-0 p-3 grid grid-cols-2 gap-x-4 gap-y-1.5"
                    style={{ background: "rgba(15,23,42,0.98)", borderColor: "rgba(255,255,255,0.05)" }}
                >
                    {EDITOR_SHORTCUTS.map(({ keys, desc }) => (
                        <div key={keys} className="flex items-center gap-2">
                            <kbd
                                className="text-[9px] px-1 py-0.5 rounded font-mono shrink-0"
                                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(96,165,250,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
                            >
                                {keys}
                            </kbd>
                            <span className="text-[10px] truncate" style={{ color: "rgba(148,163,184,0.5)" }}>{desc}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Go to line */}
            {showGoTo && (
                <div
                    className="flex items-center gap-2 px-3 py-2 border-b shrink-0"
                    style={{ background: "rgba(15,23,42,0.98)", borderColor: "rgba(255,255,255,0.05)" }}
                >
                    <span className="text-xs" style={{ color: "rgba(148,163,184,0.6)" }}>Go to line:</span>
                    <input
                        autoFocus
                        type="number"
                        value={goToLine}
                        onChange={(e) => setGoToLine(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") jumpToLine();
                            if (e.key === "Escape") { setShowGoTo(false); setGoToLine(""); }
                        }}
                        className="w-16 text-xs px-2 py-0.5 rounded outline-none font-mono"
                        style={{
                            background: "rgba(255,255,255,0.07)",
                            color: "rgba(226,232,240,0.9)",
                            border: "1px solid rgba(24,86,255,0.3)",
                        }}
                        min={1}
                        max={lines.length}
                        placeholder={`1–${lines.length}`}
                    />
                    <button
                        onClick={jumpToLine}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ background: "rgba(24,86,255,0.2)", color: "rgba(96,165,250,0.9)" }}
                    >
                        Jump
                    </button>
                    <button
                        onClick={() => { setShowGoTo(false); setGoToLine(""); }}
                        className="text-xs"
                        style={{ color: "rgba(148,163,184,0.4)" }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Editor body */}
            <div className="flex flex-1 overflow-hidden font-mono text-sm relative" style={{ background: "#0F172A" }}>
                {/* Line numbers */}
                <div
                    ref={lineNumRef}
                    className="select-none overflow-hidden shrink-0 pt-4 pb-4 pr-3 pl-3"
                    style={{
                        color: "rgba(148,163,184,0.3)",
                        borderRight: "1px solid rgba(255,255,255,0.05)",
                        minWidth: "3rem",
                        lineHeight: "1.25rem",
                        fontSize: "0.7rem",
                        textAlign: "right",
                        background: "rgba(0,0,0,0.2)",
                    }}
                >
                    {lines.map((_, i) => (
                        <div key={i}>{i + 1}</div>
                    ))}
                </div>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    className="flex-1 resize-none outline-none p-4 pl-4"
                    style={{
                        background: "transparent",
                        color: "#E2E8F0",
                        fontSize: "0.7rem",
                        lineHeight: "1.25rem",
                        caretColor: "#60A5FA",
                        fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', 'Fira Code', monospace",
                    }}
                />
            </div>

            {/* Footer */}
            <div
                className="flex items-center justify-between px-3 py-1.5 shrink-0"
                style={{
                    background: "rgba(15,23,42,0.95)",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                }}
            >
                <span className="text-xs font-mono" style={{ color: "rgba(148,163,184,0.4)" }}>
                    {lines.length} lines · {value.length} chars
                </span>
                <button
                    onClick={() => setShowGoTo(true)}
                    className="text-xs transition-colors"
                    style={{ color: "rgba(148,163,184,0.35)" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "rgba(96,165,250,0.7)"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "rgba(148,163,184,0.35)"}
                >
                    Ctrl+G · Go to line
                </button>
            </div>
        </div>
    );
}