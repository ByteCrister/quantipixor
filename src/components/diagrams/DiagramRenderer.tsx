"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mermaid from "mermaid";
import pako from "pako";
import { DIAGRAM_TYPE_META, ENGINE_META, type DiagramType, type DiagramEngine } from "@/types/diagram.types";
import { cn } from "@/lib/utils";
import {
    ZoomIn,
    ZoomOut,
    Maximize2,
    RefreshCw,
    AlertTriangle,
    Map,
    MousePointer2,
    Loader2,
    CheckCircle2,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const MERMAID_LIGHT = {
    primaryColor: "#EEF2F6",
    primaryTextColor: "#141414",
    primaryBorderColor: "#CBD5E1",
    lineColor: "#475569",
    secondaryColor: "#F8F9FC",
    tertiaryColor: "#FFFFFF",
    background: "#FFFFFF",
    mainBkg: "#F8F9FC",
    nodeBorder: "#CBD5E1",
    clusterBkg: "#F1F5F9",
    titleColor: "#141414",
    edgeLabelBackground: "#FFFFFF",
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
    fontSize: "14px",
};

const MERMAID_DARK = {
    primaryColor: "#1e293b",
    primaryTextColor: "#f1f5f9",
    primaryBorderColor: "#475569",
    lineColor: "#94a3b8",
    secondaryColor: "#0f172a",
    tertiaryColor: "#1e293b",
    background: "#0f172a",
    mainBkg: "#1e293b",
    nodeBorder: "#475569",
    clusterBkg: "#334155",
    titleColor: "#f1f5f9",
    edgeLabelBackground: "#1e293b",
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
    fontSize: "14px",
};

function getMermaidConfig(dark: boolean) {
    return {
        startOnLoad: false,
        theme: "base" as const,
        themeVariables: dark ? MERMAID_DARK : MERMAID_LIGHT,
        flowchart: { curve: "basis" as const, padding: 20 },
        sequence: { showSequenceNumbers: false, mirrorActors: true },
        er: { layoutDirection: "TB" as const, diagramPadding: 20, entityPadding: 15 },
    };
}

const PLANTUML_SERVER = "https://www.plantuml.com/plantuml/svg";

function encodePlantUML(code: string): string {
    const deflated = pako.deflateRaw(code, { level: 9 });
    let binaryStr = "";
    for (let i = 0; i < deflated.length; i++) {
        binaryStr += String.fromCharCode(deflated[i]);
    }
    return encode64(binaryStr);
}

function encode64(data: string): string {
    const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
    let result = "";
    let i = 0;
    while (i < data.length) {
        const b1 = data.charCodeAt(i++) & 0xff;
        if (i === data.length) {
            result += alphabet[b1 >> 2];
            result += alphabet[(b1 & 0x03) << 4];
            result += "==";
            break;
        }
        const b2 = data.charCodeAt(i++) & 0xff;
        if (i === data.length) {
            const n = ((b1 & 0x03) << 4) | (b2 >> 4);
            result += alphabet[b1 >> 2];
            result += alphabet[n];
            result += alphabet[(b2 & 0x0f) << 2];
            result += "=";
            break;
        }
        const b3 = data.charCodeAt(i++) & 0xff;
        result +=
            alphabet[b1 >> 2] +
            alphabet[((b1 & 0x03) << 4) | (b2 >> 4)] +
            alphabet[((b2 & 0x0f) << 2) | (b3 >> 6)] +
            alphabet[b3 & 0x3f];
    }
    return result;
}

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.1;
const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

export type RenderStatus = "idle" | "rendering" | "success" | "error";

interface DiagramRendererProps {
    code: string;
    type: DiagramType;
    engine: DiagramEngine;
    className?: string;
    onSvgReady?: (svg: string) => void;
    onRenderStatusChange?: (status: RenderStatus, error: string | null) => void;
}

export function DiagramRenderer({
    code,
    type,
    engine,
    className,
    onSvgReady,
    onRenderStatusChange,
}: DiagramRendererProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<RenderStatus>("idle");
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [svgContent, setSvgContent] = useState("");
    const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showMinimap, setShowMinimap] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
    const mermaidIdRef = useRef(0);
    const renderTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const renderGeneration = useRef(0);
    const lastRenderedKey = useRef("");
    const lastCenteredSvg = useRef("");
    const userPanned = useRef(false);
    const onSvgReadyRef = useRef(onSvgReady);
    const onRenderStatusChangeRef = useRef(onRenderStatusChange);
    const isDarkRef = useRef(isDark);
    const svgContentRef = useRef(svgContent);

    const typeMeta = DIAGRAM_TYPE_META[type];
    const engineMeta = ENGINE_META[engine];
    const isMermaid = engine === "mermaid";

    useEffect(() => {
        onSvgReadyRef.current = onSvgReady;
    }, [onSvgReady]);

    useEffect(() => {
        onRenderStatusChangeRef.current = onRenderStatusChange;
    }, [onRenderStatusChange]);

    useEffect(() => {
        isDarkRef.current = isDark;
    }, [isDark]);

    useEffect(() => {
        svgContentRef.current = svgContent;
    }, [svgContent]);

    const setRenderState = useCallback((next: RenderStatus, err: string | null = null) => {
        setStatus(next);
        setError(err);
        onRenderStatusChangeRef.current?.(next, err);
    }, []);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        setIsDark(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    const runRender = useCallback(async (src: string, generation: number) => {
        const trimmed = src.trim();
        const hasPreview = !!svgContentRef.current;

        if (!trimmed) {
            if (generation !== renderGeneration.current) return;
            setSvgContent("");
            setRenderState("idle", null);
            return;
        }

        setRenderState("rendering", null);

        try {
            let svg: string;

            if (isMermaid) {
                const config = getMermaidConfig(isDarkRef.current);
                await mermaid.initialize(config);
                const id = `mermaid-diagram-${++mermaidIdRef.current}`;
                const result = await mermaid.render(id, trimmed);
                svg = result.svg;
            } else {
                const encoded = encodePlantUML(trimmed);
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 30000);
                const res = await fetch(`${PLANTUML_SERVER}/${encoded}`, {
                    signal: controller.signal,
                });
                clearTimeout(timeout);
                if (!res.ok) throw new Error(`PlantUML server returned ${res.status}`);
                svg = await res.text();
                if (!svg.includes("<svg")) {
                    const errMatch = svg.match(/<text[^>]*>([^<]+)</i);
                    throw new Error(errMatch?.[1] ?? "Server did not return a valid SVG");
                }
            }

            if (generation !== renderGeneration.current) return;

            setSvgContent(svg);
            onSvgReadyRef.current?.(svg);
            setRenderState("success", null);
            userPanned.current = false;
            lastCenteredSvg.current = "";
        } catch (e) {
            if (generation !== renderGeneration.current) return;
            const message =
                e instanceof Error
                    ? e.name === "AbortError"
                        ? "PlantUML request timed out"
                        : e.message
                    : "Unknown error";
            if (!hasPreview) setSvgContent("");
            setRenderState("error", message);
        }
    }, [isMermaid, setRenderState]);

    useEffect(() => {
        const renderKey = `${engine}:${isDark}:${code}`;
        if (renderTimeout.current) clearTimeout(renderTimeout.current);

        renderTimeout.current = setTimeout(() => {
            if (renderKey === lastRenderedKey.current) return;
            lastRenderedKey.current = renderKey;
            const generation = ++renderGeneration.current;
            void runRender(code, generation);
        }, 400);

        return () => {
            if (renderTimeout.current) clearTimeout(renderTimeout.current);
        };
    }, [code, engine, isDark, runRender]);

    useEffect(() => {
        const el = canvasRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            if (!e.ctrlKey && !e.metaKey) return;
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            setZoom((prevZoom) => {
                const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
                const nextZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prevZoom + delta));
                if (nextZoom === prevZoom) return prevZoom;
                const worldX = (mouseX - pan.x) / prevZoom;
                const worldY = (mouseY - pan.y) / prevZoom;
                setPan({ x: mouseX - worldX * nextZoom, y: mouseY - worldY * nextZoom });
                return nextZoom;
            });
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [pan]);

    useEffect(() => {
        if (!contentRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const rect = entries[0].contentRect;
            setContentSize({ width: rect.width, height: rect.height });
        });
        observer.observe(contentRef.current);
        return () => observer.disconnect();
    }, [svgContent]);

    useEffect(() => {
        if (
            userPanned.current ||
            !svgContent ||
            !canvasRef.current ||
            contentSize.width === 0 ||
            lastCenteredSvg.current === svgContent
        ) {
            return;
        }
        lastCenteredSvg.current = svgContent;
        const containerRect = canvasRef.current.getBoundingClientRect();
        setPan({
            x: (containerRect.width - contentSize.width * zoom) / 2,
            y: (containerRect.height - contentSize.height * zoom) / 2,
        });
    }, [contentSize, svgContent, zoom]);

    const startPan = useCallback(
        (clientX: number, clientY: number) => {
            setIsPanning(true);
            userPanned.current = true;
            panStart.current = { x: clientX, y: clientY, panX: pan.x, panY: pan.y };
        },
        [pan]
    );

    const onMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (e.button === 0 || e.button === 1) {
                e.preventDefault();
                startPan(e.clientX, e.clientY);
                setIsDragging(true);
            }
        },
        [startPan]
    );

    const onMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if ((!isDragging && !isPanning) || !panStart.current) return;
            setPan({
                x: panStart.current.panX + (e.clientX - panStart.current.x),
                y: panStart.current.panY + (e.clientY - panStart.current.y),
            });
        },
        [isDragging, isPanning]
    );

    const onMouseUp = useCallback(() => {
        setIsPanning(false);
        setIsDragging(false);
        panStart.current = null;
    }, []);

    const handleFit = () => {
        userPanned.current = false;
        if (!canvasRef.current || !contentRef.current || contentSize.width === 0) {
            setZoom(1);
            setPan({ x: 0, y: 0 });
            return;
        }
        const containerRect = canvasRef.current.getBoundingClientRect();
        const padding = 48;
        const scaleX = (containerRect.width - padding) / contentSize.width;
        const scaleY = (containerRect.height - padding) / contentSize.height;
        const fitZoom = Math.min(scaleX, scaleY, ZOOM_MAX);
        const z = Math.max(ZOOM_MIN, fitZoom);
        setZoom(z);
        setPan({
            x: (containerRect.width - contentSize.width * z) / 2,
            y: (containerRect.height - contentSize.height * z) / 2,
        });
    };

    const handleRefresh = () => {
        userPanned.current = false;
        lastRenderedKey.current = "";
        lastCenteredSvg.current = "";
        const generation = ++renderGeneration.current;
        void runRender(code, generation);
    };

    function snapToLevel(dir: 1 | -1) {
        const idx = ZOOM_LEVELS.findIndex((l) => l >= zoom);
        const next =
            dir === 1
                ? ZOOM_LEVELS[Math.min(idx + 1, ZOOM_LEVELS.length - 1)]
                : ZOOM_LEVELS[Math.max((idx === -1 ? ZOOM_LEVELS.length - 1 : idx) - 1, 0)];
        if (next) setZoom(next);
    }

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const tag = (document.activeElement as HTMLElement)?.tagName;
            if (tag === "TEXTAREA" || tag === "INPUT") return;
            if (!(e.ctrlKey || e.metaKey)) return;
            if (e.key === "=" || e.key === "+") {
                e.preventDefault();
                snapToLevel(1);
            } else if (e.key === "-" || e.key === "_") {
                e.preventDefault();
                snapToLevel(-1);
            } else if (e.key === "0") {
                e.preventDefault();
                handleFit();
            } else if (e.key === "1") {
                e.preventDefault();
                setZoom(1);
                userPanned.current = false;
                setPan({ x: 0, y: 0 });
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    });

    const statusLabel =
        status === "rendering"
            ? "Rendering…"
            : status === "error"
              ? "Syntax error"
              : status === "success"
                ? "Live preview"
                : "Ready";

    return (
        <TooltipProvider delayDuration={300}>
            <div className={cn("flex h-full min-w-0 flex-col select-none", className)}>
                <div
                    className={cn(
                        "z-10 flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2",
                        "border-black/6 bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] backdrop-blur-md",
                        "dark:border-white/8"
                    )}
                >
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                            style={{
                                background: `${typeMeta.color}18`,
                                color: typeMeta.color,
                                border: `1px solid ${typeMeta.color}30`,
                            }}
                        >
                            <span
                                className="size-1.5 rounded-full"
                                style={{ background: typeMeta.color }}
                            />
                            {typeMeta.label}
                        </span>
                        <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{
                                background: `${engineMeta.color}18`,
                                color: engineMeta.color,
                                border: `1px solid ${engineMeta.color}30`,
                            }}
                        >
                            {engineMeta.label}
                        </span>
                        <span
                            className={cn(
                                "inline-flex items-center gap-1 text-[10px] font-medium",
                                status === "error"
                                    ? "text-[#EA2143]"
                                    : status === "success"
                                      ? "text-[#07CA6B]"
                                      : "text-[#141414]/50 dark:text-white/45"
                            )}
                        >
                            {status === "rendering" ? (
                                <Loader2 className="size-3 animate-spin" />
                            ) : status === "success" ? (
                                <CheckCircle2 className="size-3" />
                            ) : status === "error" ? (
                                <AlertTriangle className="size-3" />
                            ) : null}
                            {statusLabel}
                        </span>
                    </div>

                    <div className="flex items-center gap-0.5">
                        <ToolBtn icon={ZoomOut} label="Zoom out (Ctrl+−)" onClick={() => snapToLevel(-1)} />
                        <button
                            type="button"
                            onClick={() => {
                                setZoom(1);
                                userPanned.current = false;
                                setPan({ x: 0, y: 0 });
                            }}
                            title="Reset zoom (Ctrl+1)"
                            className="min-w-14 rounded-lg border border-black/8 bg-black/[0.02] px-2 py-1 text-center font-mono text-xs text-[#141414]/70 transition-colors hover:border-[#1856FF]/30 hover:bg-[#1856FF]/8 hover:text-[#1856FF] dark:border-white/10 dark:text-white/65 dark:hover:text-[#7ab0ff]"
                        >
                            {Math.round(zoom * 100)}%
                        </button>
                        <ToolBtn icon={ZoomIn} label="Zoom in (Ctrl++)" onClick={() => snapToLevel(1)} />
                        <div className="mx-0.5 h-4 w-px bg-black/10 dark:bg-white/10" />
                        <ToolBtn icon={Maximize2} label="Fit to screen (Ctrl+0)" onClick={handleFit} />
                        <ToolBtn icon={RefreshCw} label="Refresh preview" onClick={handleRefresh} />
                        <div className="mx-0.5 h-4 w-px bg-black/10 dark:bg-white/10" />
                        <ToolBtn
                            icon={Map}
                            label="Toggle minimap"
                            onClick={() => setShowMinimap((v) => !v)}
                            active={showMinimap}
                        />
                        <ToolBtn
                            icon={MousePointer2}
                            label="Canvas shortcuts"
                            onClick={() => setShowShortcuts((v) => !v)}
                            active={showShortcuts}
                        />
                    </div>
                </div>

                <div
                    ref={canvasRef}
                    tabIndex={0}
                    className={cn(
                        "relative flex-1 overflow-hidden outline-none",
                        "bg-[#f8fafd] dark:bg-[#0c0b10]",
                        isDragging || isPanning ? "cursor-grabbing" : "cursor-grab"
                    )}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                >
                    <div
                        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle, rgba(148,163,184,0.35) 1px, transparent 1px)",
                            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
                            backgroundPosition: `${pan.x % (24 * zoom)}px ${pan.y % (24 * zoom)}px`,
                        }}
                    />

                    {status === "rendering" && !svgContent && (
                        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[color-mix(in_srgb,var(--surface)_40%,transparent)] backdrop-blur-[2px]">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="size-7 animate-spin text-[#1856FF]" />
                                <span className="text-sm text-[#141414]/55 dark:text-white/50">
                                    Rendering…
                                </span>
                            </div>
                        </div>
                    )}

                    {!code.trim() && (
                        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                            <p className="text-sm text-[#141414]/40 dark:text-white/35">
                                Start typing in the editor — preview updates live
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="pointer-events-auto absolute left-3 right-3 top-3 z-20">
                            <div className="flex items-start gap-2 rounded-xl border border-[#EA2143]/25 bg-[color-mix(in_srgb,var(--surface)_92%,#EA2143)] p-3 text-sm text-[#EA2143] dark:bg-[#EA2143]/12">
                                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                <div className="min-w-0">
                                    <p className="mb-0.5 text-xs font-semibold">Syntax error</p>
                                    <p className="break-all font-mono text-xs leading-relaxed opacity-90">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {svgContent && (
                        <div className="absolute inset-0" style={{ pointerEvents: isPanning ? "none" : "auto" }}>
                            <div
                                ref={contentRef}
                                style={{
                                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                    transformOrigin: "0 0",
                                    transition: isPanning ? "none" : "transform 0.05s ease-out",
                                }}
                                dangerouslySetInnerHTML={{ __html: svgContent }}
                            />
                        </div>
                    )}

                    {showMinimap && svgContent && (
                        <Minimap svgContent={svgContent} zoom={zoom} pan={pan} />
                    )}

                    {showShortcuts && <ShortcutsPanel onClose={() => setShowShortcuts(false)} />}
                </div>
            </div>
        </TooltipProvider>
    );
}

function Minimap({
    svgContent,
    zoom,
    pan,
}: {
    svgContent: string;
    zoom: number;
    pan: { x: number; y: number };
}) {
    return (
        <div
            className={cn(
                "absolute bottom-12 right-3 overflow-hidden rounded-xl border shadow-lg",
                "border-black/10 bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-md",
                "dark:border-white/10"
            )}
            style={{ width: 140, height: 90 }}
        >
            <div className="border-b border-black/6 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#141414]/40 dark:border-white/8 dark:text-white/40">
                Minimap
            </div>
            <div className="flex items-center justify-center overflow-hidden p-1" style={{ height: 66 }}>
                <div
                    style={{
                        transform: `scale(0.15) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                        transformOrigin: "center center",
                        pointerEvents: "none",
                    }}
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                />
            </div>
            <div className="absolute bottom-1 right-2 font-mono text-[9px] text-[#141414]/40 dark:text-white/40">
                {Math.round(zoom * 100)}%
            </div>
        </div>
    );
}

function ShortcutsPanel({ onClose }: { onClose: () => void }) {
    const shortcuts = [
        { keys: "Ctrl + Scroll", desc: "Zoom in / out" },
        { keys: "Ctrl + +", desc: "Zoom in" },
        { keys: "Ctrl + −", desc: "Zoom out" },
        { keys: "Ctrl + 0", desc: "Fit to screen" },
        { keys: "Ctrl + 1", desc: "Reset to 100%" },
        { keys: "Drag", desc: "Pan canvas" },
    ];
    return (
        <div
            className={cn(
                "absolute right-3 top-12 z-30 min-w-52 overflow-hidden rounded-xl border shadow-xl",
                "border-black/10 bg-[color-mix(in_srgb,var(--surface)_96%,transparent)] backdrop-blur-xl",
                "dark:border-white/10"
            )}
        >
            <div className="flex items-center justify-between border-b border-black/6 px-3 py-2 dark:border-white/8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/50 dark:text-white/45">
                    Canvas shortcuts
                </span>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded px-1.5 text-xs text-[#141414]/40 hover:bg-black/4 dark:text-white/40 dark:hover:bg-white/6"
                >
                    ✕
                </button>
            </div>
            <div className="space-y-1.5 p-3">
                {shortcuts.map(({ keys, desc }) => (
                    <div key={keys} className="flex items-center justify-between gap-4">
                        <span className="text-xs text-[#141414]/65 dark:text-white/60">{desc}</span>
                        <kbd className="whitespace-nowrap rounded border border-black/8 bg-black/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-[#141414]/50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/45">
                            {keys}
                        </kbd>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ToolBtn({
    icon: Icon,
    label,
    onClick,
    active,
}: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    active?: boolean;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    type="button"
                    onClick={onClick}
                    aria-label={label}
                    className={cn(
                        "rounded-lg p-1.5 transition-colors",
                        active
                            ? "bg-[#1856FF]/12 text-[#1856FF] dark:text-[#7ab0ff]"
                            : "text-[#141414]/50 hover:bg-[#1856FF]/8 hover:text-[#1856FF] dark:text-white/50 dark:hover:text-[#7ab0ff]"
                    )}
                >
                    <Icon className="size-3.5" />
                </button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}
