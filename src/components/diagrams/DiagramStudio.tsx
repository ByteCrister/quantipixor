"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
    Plus,
    Trash2,
    Copy,
    ChevronDown,
    PanelLeftClose,
    PanelLeftOpen,
    Pencil,
    Check,
    X,
    FileCode2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DiagramEditor } from "./DiagramEditor";
import { DiagramRenderer, type RenderStatus } from "./DiagramRenderer";
import { TemplatesMenu } from "./TemplatesMenu";
import { ExportMenu } from "./ExportMenu";
import { EngineSelector } from "./EngineSelector";
import { ResizeHandle } from "./ResizeHandle";
import { useDiagramStore } from "@/store/diagramStore";
import {
    DIAGRAM_TEMPLATES,
    DIAGRAM_TYPE_META,
    DEFAULT_CODE_BY_ENGINE,
    DEFAULT_CODE_BY_TYPE,
    engineForType,
    type DiagramEngine,
    type DiagramType,
} from "@/types/diagram.types";
import { toast } from "@/store/toastStore";

const DIAGRAM_TYPES: DiagramType[] = [
    "erd",
    "usecase",
    "activity",
    "workflow",
    "sequence",
    "class",
];

const MIN_EDITOR_PX = 280;
const MAX_EDITOR_PERCENT = 65;

function TypeBadge({ type }: { type: DiagramType }) {
    const meta = DIAGRAM_TYPE_META[type];
    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{
                background: `${meta.color}18`,
                color: meta.color,
                border: `1px solid ${meta.color}30`,
            }}
        >
            <span className="size-1.5 rounded-full" style={{ background: meta.color }} />
            {meta.label}
        </span>
    );
}

function InlineTitleEditor({ title, onSave }: { title: string; onSave: (v: string) => void }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(title);
    const inputRef = useRef<HTMLInputElement>(null);

    const start = () => {
        setDraft(title);
        setEditing(true);
        setTimeout(() => inputRef.current?.select(), 0);
    };
    const save = () => {
        onSave(draft.trim() || title);
        setEditing(false);
    };

    if (editing) {
        return (
            <div className="flex items-center gap-1">
                <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") save();
                        if (e.key === "Escape") setEditing(false);
                    }}
                    autoFocus
                    className="min-w-0 border-b border-[#1856FF] bg-transparent text-sm font-semibold text-[#141414] outline-none dark:text-white"
                    style={{ width: `${Math.max(draft.length, 6)}ch` }}
                />
                <button
                    type="button"
                    onClick={save}
                    className="rounded p-0.5 text-[#07CA6B]"
                    aria-label="Save title"
                >
                    <Check className="size-3.5" />
                </button>
                <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded p-0.5 text-[#141414]/40 dark:text-white/40"
                    aria-label="Cancel"
                >
                    <X className="size-3.5" />
                </button>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={start}
            className="group flex max-w-48 items-center gap-1.5 truncate text-sm font-semibold text-[#141414] dark:text-white"
        >
            <span className="truncate">{title}</span>
            <Pencil className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
        </button>
    );
}

export function DiagramStudio() {
    const {
        diagrams,
        activeDiagramId,
        createDiagram,
        createFromTemplate,
        updateDiagram,
        setDiagramEngine,
        deleteDiagram,
        duplicateDiagram,
        setActiveDiagram,
        getActiveDiagram,
    } = useDiagramStore();

    const activeDiagram = getActiveDiagram();
    const [svgContent, setSvgContent] = useState("");
    const [renderStatus, setRenderStatus] = useState<RenderStatus>("idle");
    const [renderError, setRenderError] = useState<string | null>(null);
    const [listOpen, setListOpen] = useState(true);
    const [editorCollapsed, setEditorCollapsed] = useState(false);
    const [editorWidthPx, setEditorWidthPx] = useState<number | null>(null);
    const [typeMenuOpen, setTypeMenuOpen] = useState(false);
    const workspaceRef = useRef<HTMLDivElement>(null);
    const typeMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!typeMenuOpen) return;
        const onDoc = (e: MouseEvent) => {
            if (!typeMenuRef.current?.contains(e.target as Node)) setTypeMenuOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, [typeMenuOpen]);

    // Ensure a diagram is selected when the list is non-empty
    useEffect(() => {
        if (diagrams.length === 0) return;
        if (!activeDiagramId || !diagrams.some((d) => d.id === activeDiagramId)) {
            setActiveDiagram(diagrams[0].id);
        }
    }, [diagrams, activeDiagramId, setActiveDiagram]);

    const handleCodeChange = useCallback(
        (code: string) => {
            if (!activeDiagramId) return;
            updateDiagram(activeDiagramId, { code });
        },
        [activeDiagramId, updateDiagram]
    );

    const handleTitleSave = useCallback(
        (title: string) => {
            if (!activeDiagramId) return;
            updateDiagram(activeDiagramId, { title });
        },
        [activeDiagramId, updateDiagram]
    );

    const handleTemplateSelect = useCallback(
        (templateId: string) => {
            const template = DIAGRAM_TEMPLATES.find((t) => t.id === templateId);
            if (!template) {
                toast({ variant: "error", message: "Template not found." });
                return;
            }
            if (!template.code?.trim()) {
                toast({ variant: "warning", message: `Template "${template.label}" has no code.` });
                return;
            }

            if (activeDiagramId) {
                updateDiagram(activeDiagramId, {
                    code: template.code,
                    type: template.type,
                    engine: engineForType(template.type),
                    title: template.label,
                });
                toast({ variant: "success", message: `Applied "${template.label}" template.` });
            } else {
                createFromTemplate(templateId);
                toast({ variant: "success", message: `Created from "${template.label}".` });
            }
        },
        [activeDiagramId, createFromTemplate, updateDiagram]
    );

    const handleEngineChange = useCallback(
        (engine: DiagramEngine, resetCode: boolean) => {
            if (!activeDiagramId) return;
            setDiagramEngine(activeDiagramId, engine, { resetCode });
            toast({
                variant: "success",
                message: resetCode
                    ? `Loaded ${engine === "mermaid" ? "Mermaid" : "PlantUML"} starter template.`
                    : `Switched to ${engine === "mermaid" ? "Mermaid" : "PlantUML"}.`,
            });
        },
        [activeDiagramId, setDiagramEngine]
    );

    const handleSvgReady = useCallback((svg: string) => {
        setSvgContent(svg);
    }, []);

    const handleRenderStatusChange = useCallback((status: RenderStatus, error: string | null) => {
        setRenderStatus(status);
        setRenderError(error);
    }, []);

    const handleResize = useCallback((deltaPx: number) => {
        const workspace = workspaceRef.current;
        if (!workspace) return;
        const total = workspace.clientWidth;
        const current = editorWidthPx ?? total * 0.42;
        const next = Math.min(
            total * (MAX_EDITOR_PERCENT / 100),
            Math.max(MIN_EDITOR_PX, current + deltaPx)
        );
        setEditorWidthPx(next);
    }, [editorWidthPx]);

    const handleNewDiagram = (type: DiagramType) => {
        createDiagram(type);
        setTypeMenuOpen(false);
    };

    if (diagrams.length === 0) {
        return (
            <div className="flex min-h-[100dvh] flex-col bg-[var(--background)]">
                <div className="flex flex-1 items-center justify-center px-6">
                    <div className="flex max-w-md flex-col items-center gap-6 text-center">
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-[#1856FF]/10 shadow-lg shadow-[#1856FF]/10">
                            <FileCode2 className="size-8 text-[#1856FF] dark:text-[#7ab0ff]" />
                        </div>
                        <div>
                            <h2 className="mb-2 text-xl font-bold text-[#141414] dark:text-white">
                                No diagrams yet
                            </h2>
                            <p className="text-sm text-[#141414]/55 dark:text-white/50">
                                Pick a diagram type below. Each opens with the right engine — Mermaid
                                or PlantUML — and a starter template.
                            </p>
                        </div>
                        <div className="flex w-full flex-col gap-2">
                            {DIAGRAM_TYPES.map((type) => {
                                const meta = DIAGRAM_TYPE_META[type];
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => createDiagram(type)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                                            "border-black/6 bg-[color-mix(in_srgb,var(--surface)_88%,transparent)]",
                                            "hover:border-[#1856FF]/25 hover:bg-[#1856FF]/6",
                                            "dark:border-white/8 dark:hover:bg-[#1856FF]/10"
                                        )}
                                    >
                                        <span
                                            className="size-2 shrink-0 rounded-full"
                                            style={{ background: meta.color }}
                                        />
                                        <span className="text-sm font-medium text-[#141414] dark:text-white">
                                            {meta.label}
                                        </span>
                                        <span className="ml-auto text-xs capitalize text-[#141414]/45 dark:text-white/40">
                                            {meta.engine}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const defaultCode = activeDiagram
        ? activeDiagram.engine === engineForType(activeDiagram.type)
            ? DEFAULT_CODE_BY_TYPE[activeDiagram.type]
            : DEFAULT_CODE_BY_ENGINE[activeDiagram.engine]
        : undefined;

    const editorWidthStyle = editorCollapsed
        ? { width: 36 }
        : editorWidthPx
          ? { width: editorWidthPx }
          : { width: "42%" };

    return (
        <div className="flex h-[100dvh] flex-col overflow-hidden bg-[var(--background)]">
            <div className="flex min-h-0 flex-1 overflow-hidden">
                {/* Diagram list */}
                <aside
                    className={cn(
                        "flex shrink-0 flex-col overflow-hidden border-r border-black/6 transition-all duration-200 dark:border-white/8",
                        "bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] backdrop-blur-xl"
                    )}
                    style={{ width: listOpen ? 220 : 0 }}
                >
                    <div className="flex shrink-0 items-center justify-between border-b border-black/6 px-3 py-3 dark:border-white/8">
                        <span className="text-xs font-semibold uppercase tracking-widest text-[#141414]/45 dark:text-white/40">
                            Diagrams
                        </span>
                        <div ref={typeMenuRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setTypeMenuOpen((v) => !v)}
                                className="flex items-center gap-0.5 rounded-lg p-1 text-[#141414]/50 transition-colors hover:bg-[#1856FF]/10 hover:text-[#1856FF] dark:text-white/50 dark:hover:text-[#7ab0ff]"
                                aria-label="New diagram"
                            >
                                <Plus className="size-3.5" />
                                <ChevronDown className="size-3" />
                            </button>
                            {typeMenuOpen && (
                                <div
                                    className={cn(
                                        "absolute top-full right-0 z-50 mt-1 w-44 overflow-hidden rounded-xl border shadow-xl",
                                        "border-black/8 bg-[color-mix(in_srgb,var(--surface)_96%,transparent)] backdrop-blur-xl",
                                        "dark:border-white/10"
                                    )}
                                >
                                    {DIAGRAM_TYPES.map((type) => {
                                        const meta = DIAGRAM_TYPE_META[type];
                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => handleNewDiagram(type)}
                                                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-[#141414] transition-colors hover:bg-[#1856FF]/8 dark:text-white dark:hover:bg-[#1856FF]/12"
                                            >
                                                <span
                                                    className="size-2 shrink-0 rounded-full"
                                                    style={{ background: meta.color }}
                                                />
                                                <span className="font-medium">{meta.label}</span>
                                                <span className="ml-auto text-[10px] capitalize text-[#141414]/40 dark:text-white/35">
                                                    {meta.engine}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto py-1">
                        {diagrams.map((d) => {
                            const isActive = d.id === activeDiagramId;
                            const meta = DIAGRAM_TYPE_META[d.type];
                            return (
                                <div key={d.id} className="group relative mx-1 my-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setActiveDiagram(d.id)}
                                        className={cn(
                                            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                                            isActive
                                                ? "bg-[#1856FF]/10"
                                                : "hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                                        )}
                                        style={{
                                            borderLeft: isActive
                                                ? "2px solid #1856FF"
                                                : "2px solid transparent",
                                        }}
                                    >
                                        <span
                                            className="size-1.5 shrink-0 rounded-full"
                                            style={{ background: meta.color }}
                                        />
                                        <p
                                            className={cn(
                                                "min-w-0 flex-1 truncate text-xs font-medium",
                                                isActive
                                                    ? "text-[#1856FF] dark:text-[#7ab0ff]"
                                                    : "text-[#141414] dark:text-white"
                                            )}
                                        >
                                            {d.title}
                                        </p>
                                    </button>
                                    <div className="absolute top-1/2 right-1.5 hidden -translate-y-1/2 items-center gap-0.5 group-hover:flex">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                duplicateDiagram(d.id);
                                            }}
                                            className="rounded-md bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] p-1 text-[#141414]/50 hover:text-[#1856FF] dark:text-white/45"
                                            title="Duplicate"
                                            aria-label="Duplicate diagram"
                                        >
                                            <Copy className="size-3" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteDiagram(d.id);
                                            }}
                                            className="rounded-md bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] p-1 text-[#141414]/50 hover:text-[#EA2143] dark:text-white/45"
                                            title="Delete"
                                            aria-label="Delete diagram"
                                        >
                                            <Trash2 className="size-3" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* Main workspace */}
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                    <header
                        className={cn(
                            "relative z-30 flex shrink-0 items-center gap-2 border-b px-3 py-2 sm:gap-3 sm:px-4",
                            "border-black/6 bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] backdrop-blur-xl",
                            "dark:border-white/8"
                        )}
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setListOpen((v) => !v)}
                                className="shrink-0 rounded-lg p-1.5 text-[#141414]/50 transition-colors hover:bg-[#1856FF]/10 hover:text-[#1856FF] dark:text-white/50 dark:hover:text-[#7ab0ff]"
                                title={listOpen ? "Hide diagrams" : "Show diagrams"}
                                aria-label={listOpen ? "Hide diagram list" : "Show diagram list"}
                            >
                                {listOpen ? (
                                    <PanelLeftClose className="size-4" />
                                ) : (
                                    <PanelLeftOpen className="size-4" />
                                )}
                            </button>

                            {activeDiagram ? (
                                <>
                                    <InlineTitleEditor
                                        title={activeDiagram.title}
                                        onSave={handleTitleSave}
                                    />
                                    <TypeBadge type={activeDiagram.type} />
                                    <EngineSelector
                                        value={activeDiagram.engine}
                                        onChange={handleEngineChange}
                                        hasCustomCode={
                                            !!activeDiagram.code.trim() &&
                                            activeDiagram.code !== defaultCode
                                        }
                                    />
                                </>
                            ) : (
                                <span className="truncate text-sm text-[#141414]/40 dark:text-white/40">
                                    No diagram selected
                                </span>
                            )}
                        </div>

                        {activeDiagram && (
                            <div className="flex shrink-0 items-center gap-1.5">
                                {renderStatus === "error" && renderError && (
                                    <span
                                        className="hidden max-w-24 truncate text-[10px] text-[#EA2143] lg:inline"
                                        title={renderError}
                                    >
                                        Error
                                    </span>
                                )}
                                <TemplatesMenu
                                    engine={activeDiagram.engine}
                                    onSelect={handleTemplateSelect}
                                />
                                <ExportMenu
                                    svgContent={svgContent}
                                    diagramTitle={activeDiagram.title}
                                    sourceCode={activeDiagram.code}
                                    engine={activeDiagram.engine}
                                />
                            </div>
                        )}
                    </header>

                    <div ref={workspaceRef} className="flex min-h-0 flex-1 overflow-hidden">
                        {activeDiagram ? (
                            <>
                                <div
                                    className="h-full shrink-0 transition-[width] duration-150"
                                    style={editorWidthStyle}
                                >
                                    <DiagramEditor
                                        value={activeDiagram.code}
                                        onChange={handleCodeChange}
                                        engine={activeDiagram.engine}
                                        defaultCode={defaultCode}
                                        collapsed={editorCollapsed}
                                        onCollapsedChange={setEditorCollapsed}
                                        className="h-full"
                                    />
                                </div>

                                {!editorCollapsed && (
                                    <ResizeHandle onResize={handleResize} />
                                )}

                                <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                                    <DiagramRenderer
                                        code={activeDiagram.code}
                                        type={activeDiagram.type}
                                        engine={activeDiagram.engine}
                                        onSvgReady={handleSvgReady}
                                        onRenderStatusChange={handleRenderStatusChange}
                                        className="h-full"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-1 items-center justify-center">
                                <p className="text-sm text-[#141414]/40 dark:text-white/35">
                                    Select a diagram from the list
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
