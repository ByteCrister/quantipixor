"use client";

import { createPortal } from "react-dom";
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";

interface DropdownPortalProps {
    open: boolean;
    anchorRef: RefObject<HTMLElement | null>;
    children: ReactNode;
    /** Panel width in px */
    width?: number;
    align?: "start" | "end";
}

function computePosition(
    anchor: HTMLElement,
    width: number,
    align: "start" | "end"
): CSSProperties {
    const rect = anchor.getBoundingClientRect();
    const panelWidth = Math.min(width, window.innerWidth - 16);
    const top = rect.bottom + 6;
    const base: CSSProperties = {
        position: "fixed",
        top,
        width: panelWidth,
        zIndex: 9999,
    };

    if (align === "end") {
        return { ...base, right: Math.max(8, window.innerWidth - rect.right) };
    }
    const left = Math.min(rect.left, window.innerWidth - panelWidth - 8);
    return { ...base, left: Math.max(8, left) };
}

function applyStyle(el: HTMLElement, style: CSSProperties) {
    Object.assign(el.style, {
        position: "fixed",
        top: `${style.top}px`,
        width: `${style.width}px`,
        zIndex: "9999",
        left: style.left !== undefined ? `${style.left}px` : "",
        right: style.right !== undefined ? `${style.right}px` : "",
        visibility: "visible",
    });
}

export function DropdownPortal({
    open,
    anchorRef,
    children,
    width = 224,
    align = "end",
}: DropdownPortalProps) {
    const panelRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!open) return;

        const update = () => {
            const anchor = anchorRef.current;
            const panel = panelRef.current;
            if (!anchor || !panel) return;
            applyStyle(panel, computePosition(anchor, width, align));
        };

        const panel = panelRef.current;
        if (panel) {
            panel.style.visibility = "hidden";
        }

        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [open, anchorRef, width, align]);

    if (!open || typeof document === "undefined") return null;

    return createPortal(
        <div
            ref={panelRef}
            data-diagram-dropdown-portal
            style={{ position: "fixed", visibility: "hidden", zIndex: 9999 }}
        >
            {children}
        </div>,
        document.body
    );
}
