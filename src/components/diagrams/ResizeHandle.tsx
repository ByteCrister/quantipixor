"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface ResizeHandleProps {
    onResize: (deltaPx: number) => void;
    className?: string;
}

export function ResizeHandle({ onResize, className }: ResizeHandleProps) {
    const dragging = useRef(false);
    const lastX = useRef(0);

    const onPointerMove = useCallback(
        (e: PointerEvent) => {
            if (!dragging.current) return;
            const delta = e.clientX - lastX.current;
            lastX.current = e.clientX;
            onResize(delta);
        },
        [onResize]
    );

    const onPointerUp = useCallback(() => {
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
    }, []);

    useEffect(() => {
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        return () => {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        };
    }, [onPointerMove, onPointerUp]);

    return (
        <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize editor panel"
            tabIndex={0}
            className={cn(
                "group relative z-10 flex w-1.5 shrink-0 cursor-col-resize items-center justify-center",
                "border-x border-black/6 bg-[color-mix(in_srgb,var(--surface)_70%,transparent)]",
                "transition-colors hover:bg-[#1856FF]/10 dark:border-white/8 dark:hover:bg-[#1856FF]/15",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF]/40",
                className
            )}
            onPointerDown={(e) => {
                if (e.button !== 0) return;
                dragging.current = true;
                lastX.current = e.clientX;
                document.body.style.cursor = "col-resize";
                document.body.style.userSelect = "none";
                e.currentTarget.setPointerCapture(e.pointerId);
            }}
        >
            <GripVertical
                className="size-3 text-[#141414]/25 opacity-0 transition-opacity group-hover:opacity-100 dark:text-white/25"
                aria-hidden
            />
        </div>
    );
}
