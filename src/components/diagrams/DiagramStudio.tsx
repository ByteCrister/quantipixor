"use client";
// ─── src/components/diagrams/DiagramStudio.tsx ───────────────────────────────

import { useState, useCallback, useRef } from "react";
import {
    Plus, Trash2, Copy, ChevronDown, LayoutTemplate,
    Download, PanelLeftClose, PanelLeftOpen, Pencil,
    Check, X, FileCode2, Sparkles,
} from "lucide-react";
import { COLORS, ALPHA_LAYERS, GRADIENTS, SHADOWS, BORDERS } from "@/styles/design-tokens";
import { Badge } from "@/components/ui/badge";
import { DiagramEditor } from "./DiagramEditor";
import { DiagramRenderer } from "./DiagramRenderer";
import { TemplatesGallery } from "./TemplatesGallery";
import { ExportPanel } from "./ExportPanel";
import { useDiagramStore } from "@/store/diagramStore";
import { DIAGRAM_TYPE_META, type DiagramType } from "@/types/diagram.types";

const DIAGRAM_TYPES: DiagramType[] = ["erd", "usecase", "activity", "workflow", "sequence", "class"];

function TypeBadge({ type }: { type: DiagramType }) {
    const meta = DIAGRAM_TYPE_META[type];
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
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

type SidebarTab = "templates" | "export";

function InlineTitleEditor({ title, onSave }: { title: string; onSave: (v: string) => void }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(title);
    const inputRef = useRef<HTMLInputElement>(null);

    const start = () => { setDraft(title); setEditing(true); setTimeout(() => inputRef.current?.select(), 0); };
    const save = () => { onSave(draft.trim() || title); setEditing(false); };
    const cancel = () => setEditing(false);

    if (editing) {
        return (
            <div className="flex items-center gap-1">
                <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
                    autoFocus
                    className="text-sm font-semibold bg-transparent outline-none border-b"
                    style={{ color: COLORS.text, borderColor: COLORS.primary, minWidth: 0, width: `${Math.max(draft.length, 6)}ch` }}
                />
                <button onClick={save} className="p-0.5 rounded" style={{ color: COLORS.success }}><Check className="size-3.5" /></button>
                <button onClick={cancel} className="p-0.5 rounded" style={{ color: COLORS.neutral400 }}><X className="size-3.5" /></button>
            </div>
        );
    }

    return (
        <button onClick={start} className="group flex items-center gap-1.5 text-sm font-semibold" style={{ color: COLORS.text }}>
            <span className="truncate max-w-50">{title}</span>
            <Pencil className="size-3 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: COLORS.neutral500 }} />
        </button>
    );
}

// ─── Page header — matches ImageConverterPage style ───────────────────────────
function PageHeader() {
    return (
        <div
            className="relative shrink-0 border-b px-6 py-2"
            style={{
                background: ALPHA_LAYERS.surfaceElevated,
                borderColor: COLORS.neutral100,
                backdropFilter: "blur(12px)",
            }}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between max-w-screen-2xl mx-auto">
                <div>
                    <Badge variant="secondary" className="font-mono text-[10px] tracking-[0.16em]">
                        Diagram tools
                    </Badge>
                    <h1 className="mt-1 text-xl font-bold tracking-tight md:text-2xl" style={{ color: COLORS.text }}>
                        Diagram{" "}
                        <span
                            className="bg-clip-text text-transparent"
                            style={{ backgroundImage: `linear-gradient(135deg, ${COLORS.primary} 0%, #3A344E 100%)` }}
                        >
                            Studio
                        </span>
                    </h1>
                    <p className="mt-1 text-sm max-w-xl" style={{ color: COLORS.neutral500 }}>
                        Create ERD, sequence, activity, workflow, use-case and class diagrams.
                        Edit code live and export as SVG, PNG, JPG or WebP.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 pb-0.5">
                    <Badge variant="success" className="gap-1.5 text-xs">
                        <Check className="size-3" aria-hidden />
                        Local
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[10px]">
                        Mermaid · PlantUML
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[10px]">
                        SVG · PNG · JPG · WebP
                    </Badge>
                </div>
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function DiagramStudio() {
    const {
        diagrams, activeDiagramId, createDiagram, createFromTemplate,
        updateDiagram, deleteDiagram, duplicateDiagram, setActiveDiagram, getActiveDiagram,
    } = useDiagramStore();

    const activeDiagram = getActiveDiagram();
    const [sidebarTab, setSidebarTab] = useState<SidebarTab>("templates");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [typeMenuOpen, setTypeMenuOpen] = useState(false);
    const [svgContent, setSvgContent] = useState("");
    const [listOpen, setListOpen] = useState(true);
    const [editorCollapsed, setEditorCollapsed] = useState(false);


    const handleCodeChange = useCallback((code: string) => {
        if (!activeDiagramId) return;
        updateDiagram(activeDiagramId, { code });
    }, [activeDiagramId, updateDiagram]);

    const handleTitleSave = useCallback((title: string) => {
        if (!activeDiagramId) return;
        updateDiagram(activeDiagramId, { title });
    }, [activeDiagramId, updateDiagram]);

    const handleTemplateSelect = useCallback((templateId: string) => {
        createFromTemplate(templateId);
        setSidebarTab("export");
    }, [createFromTemplate]);

    const handleNewDiagram = (type: DiagramType) => {
        createDiagram(type);
        setTypeMenuOpen(false);
    };

    // ─── Empty state ─────────────────────────────────────────────────────────
    if (diagrams.length === 0) {
        return (
            <div className="flex flex-col min-h-screen" style={{ background: "#F8F9FC" }}>
                <PageHeader />
                <div className="flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-6 max-w-sm text-center px-6">
                        <div
                            className="size-16 rounded-2xl flex items-center justify-center"
                            style={{ background: GRADIENTS.brandSubtle, boxShadow: SHADOWS.uploadIcon }}
                        >
                            <FileCode2 className="size-8" style={{ color: COLORS.primary }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-2" style={{ color: COLORS.text }}>No diagrams yet</h2>
                            <p className="text-sm" style={{ color: COLORS.neutral500 }}>
                                Start from a blank diagram or pick a template to get going quickly.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            {DIAGRAM_TYPES.map((type) => {
                                const meta = DIAGRAM_TYPE_META[type];
                                return (
                                    <button
                                        key={type}
                                        onClick={() => createDiagram(type)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150"
                                        style={{ background: ALPHA_LAYERS.surfaceSubtle, borderColor: COLORS.neutral100 }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLElement).style.background = `${meta.color}10`;
                                            (e.currentTarget as HTMLElement).style.borderColor = `${meta.color}30`;
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLElement).style.background = ALPHA_LAYERS.surfaceSubtle;
                                            (e.currentTarget as HTMLElement).style.borderColor = COLORS.neutral100;
                                        }}
                                    >
                                        <span className="size-2 rounded-full shrink-0" style={{ background: meta.color }} />
                                        <span className="text-sm font-medium" style={{ color: COLORS.text }}>{meta.label}</span>
                                        <span className="text-xs ml-auto" style={{ color: COLORS.neutral400 }}>{meta.engine}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        // 100dvh fills the true viewport height (handles mobile browser chrome)
        <div className="flex flex-col overflow-hidden" style={{ height: "100dvh", background: "#F8F9FC" }}>

            {/* Page header */}
            {/* <PageHeader /> */}

            {/* Studio shell — fills all remaining height */}
            <div className="flex flex-1 overflow-hidden">

                {/* ── Diagram list sidebar ──────────────────────────────────── */}
                <aside
                    className="flex flex-col shrink-0 border-r overflow-hidden transition-all duration-200"
                    style={{
                        width: listOpen ? 220 : 0,
                        borderColor: COLORS.neutral100,
                        background: ALPHA_LAYERS.surfaceElevated,
                        backdropFilter: "blur(12px)",
                    }}
                >
                    <div
                        className="flex items-center justify-between px-3 py-3 border-b shrink-0"
                        style={{ borderColor: COLORS.neutral100 }}
                    >
                        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: COLORS.neutral500 }}>
                            Diagrams
                        </span>
                        <div className="relative">
                            <button
                                onClick={() => setTypeMenuOpen((v) => !v)}
                                className="flex items-center gap-0.5 p-1 rounded-lg transition-colors"
                                style={{ color: COLORS.neutral500 }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = ALPHA_LAYERS.primarySubtle;
                                    (e.currentTarget as HTMLElement).style.color = COLORS.primary;
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = "transparent";
                                    (e.currentTarget as HTMLElement).style.color = COLORS.neutral500;
                                }}
                            >
                                <Plus className="size-3.5" />
                                <ChevronDown className="size-3" />
                            </button>
                            {typeMenuOpen && (
                                <div
                                    className="absolute top-full right-0 mt-1 w-44 rounded-xl border shadow-lg overflow-hidden z-50"
                                    style={{
                                        background: ALPHA_LAYERS.surfaceElevated,
                                        borderColor: COLORS.neutral100,
                                        backdropFilter: "blur(16px)",
                                        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                                    }}
                                >
                                    {DIAGRAM_TYPES.map((type) => {
                                        const meta = DIAGRAM_TYPE_META[type];
                                        return (
                                            <button
                                                key={type}
                                                onClick={() => handleNewDiagram(type)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors"
                                                style={{ color: COLORS.text }}
                                                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = `${meta.color}10`}
                                                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                                            >
                                                <span className="size-2 rounded-full shrink-0" style={{ background: meta.color }} />
                                                <span className="font-medium">{meta.label}</span>
                                                <span className="ml-auto text-xs" style={{ color: COLORS.neutral400 }}>{meta.engine}</span>
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
                                        onClick={() => setActiveDiagram(d.id)}
                                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150"
                                        style={{
                                            background: isActive ? ALPHA_LAYERS.primarySubtle : "transparent",
                                            borderLeft: isActive ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                                        }}
                                        onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = ALPHA_LAYERS.surfaceSubtle; }}
                                        onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                                    >
                                        <span className="size-1.5 rounded-full shrink-0" style={{ background: meta.color }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate" style={{ color: isActive ? COLORS.primary : COLORS.text }}>{d.title}</p>
                                        </div>
                                    </button>
                                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); duplicateDiagram(d.id); }}
                                            className="p-1 rounded-md" title="Duplicate"
                                            style={{ background: ALPHA_LAYERS.surfaceGlass, color: COLORS.neutral500 }}
                                            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = COLORS.primary}
                                            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = COLORS.neutral500}
                                        ><Copy className="size-3" /></button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteDiagram(d.id); }}
                                            className="p-1 rounded-md" title="Delete"
                                            style={{ background: ALPHA_LAYERS.surfaceGlass, color: COLORS.neutral500 }}
                                            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = COLORS.danger}
                                            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = COLORS.neutral500}
                                        ><Trash2 className="size-3" /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* ── Main workspace ────────────────────────────────────────── */}
                <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">

                    {/* Toolbar */}
                    <header
                        className="flex items-center gap-3 px-4 py-2.5 border-b shrink-0"
                        style={{
                            background: ALPHA_LAYERS.surfaceElevated,
                            borderColor: COLORS.neutral100,
                            backdropFilter: "blur(12px)",
                        }}
                    >
                        <button
                            onClick={() => setListOpen((v) => !v)}
                            className="p-1.5 rounded-lg transition-colors"
                            title={listOpen ? "Hide diagrams" : "Show diagrams"}
                            style={{ color: COLORS.neutral500 }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.background = ALPHA_LAYERS.primarySubtle;
                                (e.currentTarget as HTMLElement).style.color = COLORS.primary;
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background = "transparent";
                                (e.currentTarget as HTMLElement).style.color = COLORS.neutral500;
                            }}
                        >
                            {listOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
                        </button>

                        {activeDiagram ? (
                            <>
                                <InlineTitleEditor title={activeDiagram.title} onSave={handleTitleSave} />
                                <TypeBadge type={activeDiagram.type} />
                            </>
                        ) : (
                            <span className="text-sm text-neutral-400">No diagram selected</span>
                        )}

                        <div className="flex-1" />

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => { setSidebarTab("templates"); setSidebarOpen((v) => sidebarTab === "templates" ? !v : true); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150"
                                style={{
                                    background: sidebarOpen && sidebarTab === "templates" ? ALPHA_LAYERS.primarySubtle : "transparent",
                                    borderColor: sidebarOpen && sidebarTab === "templates" ? BORDERS.blue : COLORS.neutral200,
                                    color: sidebarOpen && sidebarTab === "templates" ? COLORS.primary : COLORS.neutral600,
                                }}
                            >
                                <LayoutTemplate className="size-3.5" /> Templates
                            </button>
                            <button
                                onClick={() => { setSidebarTab("export"); setSidebarOpen((v) => sidebarTab === "export" ? !v : true); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150"
                                style={{
                                    background: sidebarOpen && sidebarTab === "export" ? ALPHA_LAYERS.primarySubtle : "transparent",
                                    borderColor: sidebarOpen && sidebarTab === "export" ? BORDERS.blue : COLORS.neutral200,
                                    color: sidebarOpen && sidebarTab === "export" ? COLORS.primary : COLORS.neutral600,
                                }}
                            >
                                <Download className="size-3.5" /> Export
                            </button>
                        </div>
                    </header>

                    {/* Editor + Renderer + Right sidebar — fills remaining height */}
                    <div className="flex flex-1 min-h-0 overflow-hidden">

                        {/* Editor */}
                        {activeDiagram ? (
                            <div
                                className="shrink-0 h-full transition-all duration-200"
                                style={{ width: editorCollapsed ? 36 : '42%' }}
                            >
                                <DiagramEditor
                                    value={activeDiagram.code}
                                    onChange={handleCodeChange}
                                    type={activeDiagram.type}
                                    collapsed={editorCollapsed}
                                    onCollapsedChange={setEditorCollapsed}
                                    className="h-full"
                                    style={{ borderColor: COLORS.neutral100 }}
                                />
                            </div>
                        ) : (
                            <div
                                className="shrink-0 flex items-center justify-center border-r"
                                style={{
                                    width: editorCollapsed ? 36 : '42%',
                                    borderColor: COLORS.neutral100,
                                    color: COLORS.neutral400,
                                }}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <Sparkles className="size-8 opacity-30" />
                                    <p className="text-sm">Select a diagram to edit</p>
                                </div>
                            </div>
                        )}

                        {/* Renderer */}
                        <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
                            {activeDiagram ? (
                                <DiagramRenderer
                                    code={activeDiagram.code}
                                    type={activeDiagram.type}
                                    onSvgReady={setSvgContent}
                                    className="h-full"
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center" style={{ background: "#FAFBFE", color: COLORS.neutral400 }}>
                                    <p className="text-sm">Preview will appear here</p>
                                </div>
                            )}
                        </div>

                        {/* Right sidebar */}
                        <aside
                            className="flex flex-col shrink-0 border-l overflow-hidden transition-all duration-200"
                            style={{
                                width: sidebarOpen ? 260 : 0,
                                borderColor: COLORS.neutral100,
                                background: ALPHA_LAYERS.surfaceElevated,
                                backdropFilter: "blur(12px)",
                            }}
                        >
                            {sidebarOpen && (
                                <>
                                    <div className="flex border-b shrink-0" style={{ borderColor: COLORS.neutral100 }}>
                                        {(["templates", "export"] as SidebarTab[]).map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setSidebarTab(tab)}
                                                className="flex-1 py-2.5 text-xs font-semibold capitalize tracking-wide transition-colors"
                                                style={{
                                                    color: sidebarTab === tab ? COLORS.primary : COLORS.neutral500,
                                                    borderBottom: sidebarTab === tab ? `2px solid ${COLORS.primary}` : "2px solid transparent",
                                                    background: "transparent",
                                                }}
                                            >
                                                {tab === "templates" ? (
                                                    <span className="flex items-center justify-center gap-1.5">
                                                        <LayoutTemplate className="size-3.5" /> Templates
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-1.5">
                                                        <Download className="size-3.5" /> Export
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        {sidebarTab === "templates" ? (
                                            <TemplatesGallery onSelect={handleTemplateSelect} />
                                        ) : (
                                            <ExportPanel
                                                svgContent={svgContent}
                                                diagramTitle={activeDiagram?.title ?? "diagram"}
                                            />
                                        )}
                                    </div>
                                </>
                            )}
                        </aside>
                    </div>
                </div>
            </div>

            {typeMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setTypeMenuOpen(false)} />}
        </div>
    );
}