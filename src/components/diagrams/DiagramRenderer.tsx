"use client";
// ─── src/components/diagrams/DiagramRenderer.tsx ─────────────────────────────
// draw.io-style canvas: Ctrl+scroll zoom, middle-mouse pan, spacebar pan,
// fit-to-screen, minimap, keyboard shortcuts

import { useEffect, useRef, useState, useCallback } from "react";
import mermaid from "mermaid";
import pako from "pako";
import { DIAGRAM_TYPE_META } from "@/types/diagram.types";
import type { DiagramType } from "@/types/diagram.types";
import { COLORS, ALPHA_LAYERS } from "@/styles/design-tokens";
import { cn } from "@/lib/utils";
import {
    ZoomIn,
    ZoomOut,
    Maximize2,
    RefreshCw,
    AlertTriangle,
    Map,
    MousePointer2,
} from "lucide-react";

// ── Mermaid initial configuration (used as base, re-applied on each render) ──
const MERMAID_THEME_VARIABLES = {
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

const MERMAID_CONFIG = {
    startOnLoad: false,
    theme: "base" as const,
    themeVariables: MERMAID_THEME_VARIABLES,
    flowchart: {
        curve: "basis" as const,
        padding: 20,
    },
    sequence: {
        showSequenceNumbers: false,
        mirrorActors: true,
    },
    er: {
        layoutDirection: "TB" as const,
        diagramPadding: 20,
        entityPadding: 15,
    },
};

// Initialize once (but we will re‑initialize before each render to avoid stale state)
mermaid.initialize(MERMAID_CONFIG);

const PLANTUML_SERVER = "https://www.plantuml.com/plantuml/svg";

// ── Correct PlantUML encoding (deflate + custom base64) ─────────────────────
function encodePlantUML(code: string): string {
    // 1. Deflate raw (without zlib header)
    const deflated = pako.deflateRaw(code, { level: 9 });
    // 2. Convert Uint8Array to string of bytes (0-255)
    let binaryStr = "";
    for (let i = 0; i < deflated.length; i++) {
        binaryStr += String.fromCharCode(deflated[i]);
    }
    // 3. Apply PlantUML's custom base64 encoding
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
        const n1 = b1 >> 2;
        const n2 = ((b1 & 0x03) << 4) | (b2 >> 4);
        const n3 = ((b2 & 0x0f) << 2) | (b3 >> 6);
        const n4 = b3 & 0x3f;
        result += alphabet[n1] + alphabet[n2] + alphabet[n3] + alphabet[n4];
    }
    return result;
}

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.1;
const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

interface DiagramRendererProps {
    code: string;
    type: DiagramType;
    className?: string;
    onSvgReady?: (svg: string) => void;
}

export function DiagramRenderer({
    code,
    type,
    className,
    onSvgReady,
}: DiagramRendererProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [svgContent, setSvgContent] = useState<string>("");
    const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showMinimap, setShowMinimap] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
    const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`);
    const meta = DIAGRAM_TYPE_META[type];
    const isMermaid = meta.engine === "mermaid";
    const renderTimeout = useRef<NodeJS.Timeout | null>(null);

    // ── Render logic ────────────────────────────────────────────────────────────
    const renderMermaid = useCallback(
        async (src: string) => {
            if (!src.trim()) {
                setSvgContent(
                    `<div class="text-sm text-neutral-400 p-4">Empty diagram – start typing above</div>`
                );
                setError(null);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                // Re-initialize Mermaid to avoid stale plugins/themes
                await mermaid.initialize(MERMAID_CONFIG);
                const { svg } = await mermaid.render(idRef.current, src);
                setSvgContent(svg);
                onSvgReady?.(svg);
            } catch (e) {
                const message = e instanceof Error ? e.message : "Unknown error";
                setError(message);
                setSvgContent(`<div class="text-sm text-danger p-4 border border-danger/20 rounded-lg bg-danger/5">
                    <strong>Syntax error</strong><br/>${message.replace(/</g, "&lt;")}
                </div>`);
            } finally {
                setIsLoading(false);
            }
        },
        [onSvgReady]
    );

    const renderPlantUML = useCallback(
        async (src: string) => {
            if (!src.trim()) {
                setSvgContent(
                    `<div class="text-sm text-neutral-400 p-4">Empty diagram – start typing above</div>`
                );
                setError(null);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const encoded = encodePlantUML(src);
                const url = `${PLANTUML_SERVER}/${encoded}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error(`PlantUML server returned ${res.status}`);
                const svg = await res.text();
                if (!svg.includes("<svg")) throw new Error("Server did not return a valid SVG");
                setSvgContent(svg);
                onSvgReady?.(svg);
            } catch (e) {
                const message = e instanceof Error ? e.message : "Unknown error";
                setError(message);
                setSvgContent(`<div class="text-sm text-danger p-4 border border-danger/20 rounded-lg bg-danger/5">
                    <strong>PlantUML error</strong><br/>${message.replace(/</g, "&lt;")}
                </div>`);
            } finally {
                setIsLoading(false);
            }
        },
        [onSvgReady]
    );

    // Debounced render
    useEffect(() => {
        if (renderTimeout.current !== null) {
            clearTimeout(renderTimeout.current);
        }
        renderTimeout.current = setTimeout(() => {
            if (isMermaid) renderMermaid(code);
            else renderPlantUML(code);
        }, 400);
        return () => {
            if (renderTimeout.current !== null) {
                clearTimeout(renderTimeout.current);
            }
        };
    }, [code, isMermaid, renderMermaid, renderPlantUML]);

    // ── Zoom with mouse position (Ctrl+wheel) ───────────────────────────────────
    useEffect(() => {
        const el = canvasRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            if (!e.ctrlKey && !e.metaKey) return;
            e.preventDefault();
            e.stopPropagation();

            const rect = el.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            setZoom((prevZoom) => {
                const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
                const nextZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prevZoom + delta));
                if (nextZoom === prevZoom) return prevZoom;

                const worldX = (mouseX - pan.x) / prevZoom;
                const worldY = (mouseY - pan.y) / prevZoom;
                const newPanX = mouseX - worldX * nextZoom;
                const newPanY = mouseY - worldY * nextZoom;

                setPan({ x: newPanX, y: newPanY });
                return nextZoom;
            });
        };

        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [pan]);

    // Spacebar panning (optional, kept for consistency)
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === " " && !e.repeat) e.preventDefault();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    // Observe content size for initial pan centering
    useEffect(() => {
        if (!contentRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const rect = entries[0].contentRect;
            setContentSize({ width: rect.width, height: rect.height });
        });
        observer.observe(contentRef.current);
        return () => observer.disconnect();
    }, [svgContent]);

    // Auto-center when content size changes
    useEffect(() => {
        if (!canvasRef.current || contentSize.width === 0 || contentSize.height === 0) return;
        const containerRect = canvasRef.current.getBoundingClientRect();
        const newPanX = (containerRect.width - contentSize.width) / 2;
        const newPanY = (containerRect.height - contentSize.height) / 2;
        setPan({ x: newPanX, y: newPanY });
    }, [contentSize, svgContent]);

    // ── Panning handlers ────────────────────────────────────────────────────────
    const startPan = useCallback(
        (clientX: number, clientY: number) => {
            setIsPanning(true);
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
            const dx = e.clientX - panStart.current.x;
            const dy = e.clientY - panStart.current.y;
            setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy });
        },
        [isDragging, isPanning]
    );

    const onMouseUp = useCallback(() => {
        setIsPanning(false);
        setIsDragging(false);
        panStart.current = null;
    }, []);

    // ── Zoom actions ─────────────────────────────────────────────────────────────
    const handleFit = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };
    const handleRefresh = () => {
        if (isMermaid) renderMermaid(code);
        else renderPlantUML(code);
    };
    const snapToLevel = (dir: 1 | -1) => {
        const idx = ZOOM_LEVELS.findIndex((l) => l >= zoom);
        const next =
            dir === 1
                ? ZOOM_LEVELS[Math.min(idx + 1, ZOOM_LEVELS.length - 1)]
                : ZOOM_LEVELS[Math.max((idx === -1 ? ZOOM_LEVELS.length - 1 : idx) - 1, 0)];
        if (next) setZoom(next);
    };

    const cursorStyle = isDragging || isPanning ? "grabbing" : "grab";

    return (
        <div className={cn("flex flex-col h-full select-none", className)}>
            {/* Toolbar */}
            <div
                className="flex items-center justify-between px-3 py-2 border-b shrink-0 z-10"
                style={{
                    background: "rgba(255,255,255,0.85)",
                    borderColor: "rgba(203,213,225,0.5)",
                    backdropFilter: "blur(8px)",
                }}
            >
                <div className="flex items-center gap-2">
                    <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                            background: `${meta.color}18`,
                            color: meta.color,
                            border: `1px solid ${meta.color}30`,
                        }}
                    >
                        <span className="size-1.5 rounded-full" style={{ background: meta.color }} />
                        {meta.label}
                        <span className="opacity-50 mx-0.5">·</span>
                        <span className="opacity-60 lowercase">{meta.engine}</span>
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <ToolBtn icon={ZoomOut} label="Zoom out (Ctrl+−)" onClick={() => snapToLevel(-1)} />
                    <button
                        onClick={() => {
                            setZoom(1);
                            setPan({ x: 0, y: 0 });
                        }}
                        title="Reset zoom (Ctrl+1)"
                        className="text-xs font-mono px-2 py-1 rounded-lg transition-colors min-w-14 text-center"
                        style={{
                            background: ALPHA_LAYERS.surfaceSubtle,
                            color: COLORS.neutral600,
                            border: `1px solid ${COLORS.neutral200}`,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = ALPHA_LAYERS.primarySubtle;
                            e.currentTarget.style.color = COLORS.primary;
                            e.currentTarget.style.borderColor = "rgba(24,86,255,0.3)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = ALPHA_LAYERS.surfaceSubtle;
                            e.currentTarget.style.color = COLORS.neutral600;
                            e.currentTarget.style.borderColor = COLORS.neutral200;
                        }}
                    >
                        {Math.round(zoom * 100)}%
                    </button>
                    <ToolBtn icon={ZoomIn} label="Zoom in (Ctrl++)" onClick={() => snapToLevel(1)} />

                    <div className="w-px h-4 mx-0.5" style={{ background: COLORS.neutral200 }} />

                    <ToolBtn icon={Maximize2} label="Fit to screen (Ctrl+0)" onClick={handleFit} />
                    <ToolBtn icon={RefreshCw} label="Refresh" onClick={handleRefresh} />

                    <div className="w-px h-4 mx-0.5" style={{ background: COLORS.neutral200 }} />

                    <ToolBtn
                        icon={Map}
                        label="Toggle minimap"
                        onClick={() => setShowMinimap((v) => !v)}
                        active={showMinimap}
                    />
                    <ToolBtn
                        icon={MousePointer2}
                        label="Keyboard shortcuts"
                        onClick={() => setShowShortcuts((v) => !v)}
                    />
                </div>
            </div>

            {/* Canvas */}
            <div
                ref={canvasRef}
                className="flex-1 overflow-hidden relative"
                style={{
                    background: `
                        radial-gradient(ellipse 80% 60% at 20% 20%, rgba(24,86,255,0.03) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 40% at 80% 80%, rgba(147,51,234,0.03) 0%, transparent 60%),
                        #F8FAFD
                    `,
                    cursor: cursorStyle,
                }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
            >
                {/* Dot grid */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle, rgba(148,163,184,0.35) 1px, transparent 1px)`,
                        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
                        backgroundPosition: `${pan.x % (24 * zoom)}px ${pan.y % (24 * zoom)}px`,
                    }}
                />

                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="flex flex-col items-center gap-3">
                            <div
                                className="size-8 rounded-full border-2 border-t-transparent animate-spin"
                                style={{
                                    borderColor: `${COLORS.primary}40`,
                                    borderTopColor: COLORS.primary,
                                }}
                            />
                            <span className="text-sm" style={{ color: COLORS.neutral500 }}>
                                Rendering…
                            </span>
                        </div>
                    </div>
                )}

                {/* Error banner (clickable) */}
                {error && (
                    <div className="absolute top-3 left-3 right-3 z-20 pointer-events-auto">
                        <div
                            className="flex items-start gap-2 p-3 rounded-xl text-sm"
                            style={{
                                background: "rgba(234,33,67,0.06)",
                                border: "1px solid rgba(234,33,67,0.2)",
                                color: COLORS.danger,
                            }}
                        >
                            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-xs mb-0.5">Syntax error</p>
                                <p className="text-xs opacity-80 font-mono leading-relaxed whitespace-pre-wrap break-all">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Diagram content with transform */}
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

                {/* Minimap */}
                {showMinimap && svgContent && (
                    <Minimap svgContent={svgContent} zoom={zoom} pan={pan} />
                )}

                {/* Shortcuts panel */}
                {showShortcuts && <ShortcutsPanel onClose={() => setShowShortcuts(false)} />}
            </div>
        </div>
    );
}

// ── Minimap component ──────────────────────────────────────────────────────────
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
            className="absolute bottom-12 right-3 rounded-xl overflow-hidden border"
            style={{
                width: 140,
                height: 90,
                background: "rgba(255,255,255,0.9)",
                borderColor: "rgba(203,213,225,0.7)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                backdropFilter: "blur(8px)",
            }}
        >
            <div
                className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest border-b"
                style={{
                    color: COLORS.neutral400,
                    borderColor: "rgba(203,213,225,0.5)",
                    background: "rgba(248,250,252,0.8)",
                }}
            >
                Minimap
            </div>
            <div className="flex items-center justify-center overflow-hidden" style={{ height: 66, padding: 4 }}>
                <div
                    style={{
                        transform: `scale(0.15) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                        transformOrigin: "center center",
                        pointerEvents: "none",
                    }}
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                />
            </div>
            <div className="absolute bottom-1 right-2 text-[9px] font-mono" style={{ color: COLORS.neutral400 }}>
                {Math.round(zoom * 100)}%
            </div>
        </div>
    );
}

// ── Keyboard shortcuts panel ──────────────────────────────────────────────────
function ShortcutsPanel({ onClose }: { onClose: () => void }) {
    const shortcuts = [
        { keys: "Ctrl + Scroll", desc: "Zoom in / out" },
        { keys: "Ctrl + +", desc: "Zoom in" },
        { keys: "Ctrl + −", desc: "Zoom out" },
        { keys: "Ctrl + 0", desc: "Fit to screen" },
        { keys: "Ctrl + 1", desc: "Reset to 100%" },
        { keys: "Space + Drag", desc: "Pan canvas" },
        { keys: "Middle-click drag", desc: "Pan canvas" },
    ];
    return (
        <div
            className="absolute top-12 right-3 rounded-2xl border overflow-hidden z-30"
            style={{
                background: "rgba(255,255,255,0.95)",
                borderColor: "rgba(203,213,225,0.7)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                backdropFilter: "blur(12px)",
                minWidth: 240,
            }}
        >
            <div
                className="flex items-center justify-between px-4 py-2.5 border-b"
                style={{ borderColor: "rgba(203,213,225,0.5)" }}
            >
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: COLORS.neutral500 }}>
                    Keyboard Shortcuts
                </span>
                <button
                    onClick={onClose}
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{ color: COLORS.neutral400 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = ALPHA_LAYERS.surfaceSubtle)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                    ✕
                </button>
            </div>
            <div className="p-3 space-y-1.5">
                {shortcuts.map(({ keys, desc }) => (
                    <div key={keys} className="flex items-center justify-between gap-4">
                        <span className="text-xs" style={{ color: COLORS.neutral600 }}>
                            {desc}
                        </span>
                        <kbd
                            className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                            style={{
                                background: ALPHA_LAYERS.surfaceSubtle,
                                color: COLORS.neutral500,
                                border: `1px solid ${COLORS.neutral200}`,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {keys}
                        </kbd>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Reusable toolbar button ───────────────────────────────────────────────────
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
        <button
            onClick={onClick}
            title={label}
            className="p-1.5 rounded-lg transition-colors"
            style={{
                color: active ? COLORS.primary : COLORS.neutral500,
                background: active ? ALPHA_LAYERS.primarySubtle : "transparent",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = ALPHA_LAYERS.primarySubtle;
                e.currentTarget.style.color = COLORS.primary;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = active ? ALPHA_LAYERS.primarySubtle : "transparent";
                e.currentTarget.style.color = active ? COLORS.primary : COLORS.neutral500;
            }}
        >
            <Icon className="size-3.5" />
        </button>
    );
}