"use client";

import { Check, Copy } from "lucide-react";

// ---------------------------------------------------------------------------
// CopyButton
// ---------------------------------------------------------------------------
export default function CopyButton({ id, text, copy, copiedKey }: {
    id: string;
    text: string;
    copy: (id: string, text: string) => void;
    copiedKey: string | null;
}) {
    const done = copiedKey === id;
    return (
        <button
            onClick={() => copy(id, text)}
            title="Copy value"
            className={`ml-1 p-0.5 rounded transition-all duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100
                ${done
                    ? "text-emerald-500 dark:text-emerald-400"
                    : "text-slate-400 dark:text-white/30 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
        >
            {done ? <Check size={11} /> : <Copy size={11} />}
        </button>
    );
}