"use client";

import { useEffect, useRef, useState } from "react";
import {
    Database,
    Users,
    Activity,
    GitBranch,
    ArrowRightLeft,
    Layers,
    LayoutTemplate,
    ChevronDown,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DropdownPortal } from "./DropdownPortal";
import {
    DIAGRAM_TYPE_META,
    templatesForEngine,
    type DiagramEngine,
    type DiagramType,
} from "@/types/diagram.types";

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

interface TemplatesMenuProps {
    engine: DiagramEngine;
    onSelect: (templateId: string) => void;
}

export function TemplatesMenu({ engine, onSelect }: TemplatesMenuProps) {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState<DiagramType | "all">("all");
    const [prevEngine, setPrevEngine] = useState(engine);
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    if (engine !== prevEngine) {
        setPrevEngine(engine);
        setFilter("all");
    }

    const engineTemplates = templatesForEngine(engine);
    const filtered =
        filter === "all"
            ? engineTemplates
            : engineTemplates.filter((t) => t.type === filter);

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            const target = e.target as Node;
            if (rootRef.current?.contains(target)) return;
            for (const portal of document.querySelectorAll("[data-diagram-dropdown-portal]")) {
                if (portal.contains(target)) return;
            }
            setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, [open]);

    return (
        <div ref={rootRef} className="relative shrink-0">
            <Button
                ref={triggerRef}
                type="button"
                variant="outline"
                size="sm"
                className="h-8 shrink-0 gap-1.5 rounded-lg px-3 text-xs"
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label="Templates"
                title="Templates"
                onClick={() => setOpen((v) => !v)}
            >
                <LayoutTemplate className="size-3.5" aria-hidden />
                <span className="hidden sm:inline">Templates</span>
                <ChevronDown
                    className={cn("size-3 transition-transform", open && "rotate-180")}
                    aria-hidden
                />
            </Button>

            <DropdownPortal open={open} anchorRef={triggerRef} width={352} align="end">
                <div
                    role="menu"
                    className={cn(
                        "flex max-h-[min(70vh,24rem)] flex-col overflow-hidden rounded-xl border",
                        "border-black/8 bg-[color-mix(in_srgb,var(--surface)_98%,transparent)] shadow-xl backdrop-blur-xl",
                        "dark:border-white/10 dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.55)]"
                    )}
                >
                    <div className="border-b border-black/6 px-3 py-2.5 dark:border-white/8">
                        <div className="mb-2 flex items-center gap-2">
                            <div className="flex size-6 items-center justify-center rounded-lg bg-[#1856FF]/10">
                                <Sparkles className="size-3.5 text-[#1856FF] dark:text-[#7ab0ff]" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-[#141414] dark:text-white">
                                    {engine === "mermaid" ? "Mermaid" : "PlantUML"} templates
                                </p>
                                <p className="text-[10px] text-[#141414]/50 dark:text-white/45">
                                    {engineTemplates.length} available
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {TYPE_FILTERS.map(({ id, label }) => {
                                const isActive = filter === id;
                                const meta = id !== "all" ? DIAGRAM_TYPE_META[id] : null;
                                const visible =
                                    id === "all" ||
                                    engineTemplates.some((t) => t.type === id);
                                if (!visible) return null;
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setFilter(id)}
                                        className={cn(
                                            "rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
                                            isActive
                                                ? "bg-[#1856FF]/12 text-[#1856FF] ring-1 ring-[#1856FF]/25 dark:text-[#7ab0ff]"
                                                : "text-[#141414]/55 hover:bg-black/4 dark:text-white/50 dark:hover:bg-white/6"
                                        )}
                                        style={
                                            isActive && meta
                                                ? {
                                                      background: `${meta.color}18`,
                                                      color: meta.color,
                                                      borderColor: `${meta.color}35`,
                                                  }
                                                : undefined
                                        }
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto p-2">
                        {filtered.length === 0 ? (
                            <p className="px-2 py-6 text-center text-xs text-[#141414]/50 dark:text-white/45">
                                No templates for this filter.
                            </p>
                        ) : (
                            filtered.map((tpl) => {
                                const Icon = ICON_MAP[tpl.icon] ?? Layers;
                                const meta = DIAGRAM_TYPE_META[tpl.type];
                                return (
                                    <button
                                        key={tpl.id}
                                        type="button"
                                        role="menuitem"
                                        onClick={() => {
                                            onSelect(tpl.id);
                                            setOpen(false);
                                        }}
                                        className={cn(
                                            "mb-1 flex w-full items-center gap-2.5 rounded-lg border border-transparent p-2.5 text-left transition-colors last:mb-0",
                                            "hover:border-[#1856FF]/20 hover:bg-[#1856FF]/6",
                                            "dark:hover:border-[#1856FF]/30 dark:hover:bg-[#1856FF]/10"
                                        )}
                                    >
                                        <div
                                            className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                                            style={{
                                                background: `${meta.color}15`,
                                                border: `1px solid ${meta.color}25`,
                                            }}
                                        >
                                            <Icon className="size-4" style={{ color: meta.color }} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-semibold text-[#141414] dark:text-white">
                                                {tpl.label}
                                            </p>
                                            <p className="mt-0.5 truncate text-[10px] text-[#141414]/50 dark:text-white/45">
                                                {tpl.description}
                                            </p>
                                        </div>
                                        <span
                                            className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium"
                                            style={{
                                                background: `${meta.color}12`,
                                                color: meta.color,
                                            }}
                                        >
                                            {meta.label}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </DropdownPortal>
        </div>
    );
}
