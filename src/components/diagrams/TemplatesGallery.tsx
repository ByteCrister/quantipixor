"use client";
// ─── src/components/diagrams/TemplatesGallery.tsx ─────────────────────────────

import { useState } from "react";
import {
    Database, Users, Activity, GitBranch, ArrowRightLeft, Layers,
    ChevronRight, Sparkles,
} from "lucide-react";
import { COLORS, ALPHA_LAYERS, GRADIENTS, BORDERS } from "@/styles/design-tokens";
import { DIAGRAM_TEMPLATES, DIAGRAM_TYPE_META, type DiagramType } from "@/types/diagram.types";

const ICON_MAP: Record<string, React.ElementType> = {
    database: Database,
    users: Users,
    activity: Activity,
    "git-branch": GitBranch,
    "arrow-right-left": ArrowRightLeft,
    layers: Layers,
};

const TYPE_FILTERS: { id: DiagramType | "all"; label: string }[] = [
    { id: "all", label: "All" },
    { id: "erd", label: "ERD" },
    { id: "usecase", label: "Use Case" },
    { id: "activity", label: "Activity" },
    { id: "workflow", label: "Workflow" },
    { id: "sequence", label: "Sequence" },
    { id: "class", label: "Class" },
];

interface TemplatesGalleryProps {
    onSelect: (templateId: string) => void;
}

export function TemplatesGallery({ onSelect }: TemplatesGalleryProps) {
    const [filter, setFilter] = useState<DiagramType | "all">("all");
    const [hovered, setHovered] = useState<string | null>(null);

    const filtered = filter === "all"
        ? DIAGRAM_TEMPLATES
        : DIAGRAM_TEMPLATES.filter((t) => t.type === filter);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 pb-3 border-b" style={{ borderColor: COLORS.neutral100 }}>
                <div className="flex items-center gap-2 mb-3">
                    <div
                        className="size-6 rounded-lg flex items-center justify-center"
                        style={{ background: GRADIENTS.brandSubtle }}
                    >
                        <Sparkles className="size-3.5" style={{ color: COLORS.primary }} />
                    </div>
                    <h3 className="text-sm font-semibold" style={{ color: COLORS.text }}>
                        Templates
                    </h3>
                </div>

                {/* Filter pills */}
                <div className="flex flex-wrap gap-1.5">
                    {TYPE_FILTERS.map(({ id, label }) => {
                        const isActive = filter === id;
                        const meta = id !== "all" ? DIAGRAM_TYPE_META[id] : null;
                        return (
                            <button
                                key={id}
                                onClick={() => setFilter(id)}
                                className="px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150"
                                style={{
                                    background: isActive
                                        ? (meta ? `${meta.color}18` : ALPHA_LAYERS.primarySubtle)
                                        : "transparent",
                                    color: isActive ? (meta?.color ?? COLORS.primary) : COLORS.neutral500,
                                    border: `1px solid ${isActive ? (meta ? `${meta.color}35` : BORDERS.blue) : "transparent"}`,
                                }}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Template list with minimal scrollbar */}
            <div
                className="flex-1 overflow-y-auto p-3 space-y-2"
                style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: `${COLORS.neutral300} transparent`,
                }}
            >
                <style>
                    {`
                        .overflow-y-auto::-webkit-scrollbar {
                            width: 6px;
                            height: 6px;
                        }
                        .overflow-y-auto::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        .overflow-y-auto::-webkit-scrollbar-thumb {
                            background: #cbd5e1;
                            border-radius: 8px;
                        }
                        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                            background: #94a3b8;
                        }
                    `}
                </style>
                {filtered.map((tpl) => {
                    const Icon = ICON_MAP[tpl.icon] ?? Layers;
                    const meta = DIAGRAM_TYPE_META[tpl.type];
                    const isHovered = hovered === tpl.id;
                    return (
                        <button
                            key={tpl.id}
                            onClick={() => onSelect(tpl.id)}
                            onMouseEnter={() => setHovered(tpl.id)}
                            onMouseLeave={() => setHovered(null)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150"
                            style={{
                                background: isHovered ? ALPHA_LAYERS.primarySubtle : ALPHA_LAYERS.surfaceSubtle,
                                borderColor: isHovered ? BORDERS.blue : COLORS.neutral100,
                            }}
                        >
                            <div
                                className="size-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}25` }}
                            >
                                <Icon className="size-4" style={{ color: meta.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate" style={{ color: COLORS.text }}>
                                    {tpl.label}
                                </p>
                                <p className="text-xs truncate mt-0.5" style={{ color: COLORS.neutral500 }}>
                                    {tpl.description}
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <span
                                    className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                                    style={{
                                        background: `${meta.color}12`,
                                        color: meta.color,
                                    }}
                                >
                                    {meta.label}
                                </span>
                                <ChevronRight
                                    className="size-3.5 transition-transform duration-150"
                                    style={{
                                        color: COLORS.neutral400,
                                        transform: isHovered ? "translateX(2px)" : "none",
                                    }}
                                />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}