// app/diagrams/loading.tsx
export default function DiagramStudioLoading() {
    return (
        <div className="flex flex-col overflow-hidden" style={{ height: "100dvh", background: "#F8F9FC" }}>
            {/* Studio shell */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left sidebar (diagrams list) – 220px */}
                <aside
                    className="flex flex-col shrink-0 border-r overflow-hidden"
                    style={{ width: 220, borderColor: "#E9EDF2", background: "rgba(255,255,255,0.8)" }}
                >
                    <div className="flex items-center justify-between px-3 py-3 border-b" style={{ borderColor: "#E9EDF2" }}>
                        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Diagrams</span>
                        <div className="w-5 h-5 rounded-md bg-neutral-100 animate-pulse" />
                    </div>
                    <div className="flex-1 overflow-y-auto py-1 space-y-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="mx-1 my-0.5 px-2.5 py-2 rounded-lg">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-200 animate-pulse" />
                                    <div className="h-3 bg-neutral-100 rounded w-24 animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main workspace */}
                <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
                    {/* Toolbar header */}
                    <header
                        className="flex items-center gap-3 px-4 py-2.5 border-b shrink-0"
                        style={{ borderColor: "#E9EDF2", background: "rgba(255,255,255,0.8)" }}
                    >
                        <div className="w-7 h-7 rounded-lg bg-neutral-100 animate-pulse" />
                        <div className="w-32 h-4 bg-neutral-100 rounded animate-pulse" />
                        <div className="w-16 h-5 bg-neutral-100 rounded-full animate-pulse" />
                        <div className="flex-1" />
                        <div className="flex gap-1">
                            <div className="w-20 h-8 bg-neutral-100 rounded-lg animate-pulse" />
                            <div className="w-16 h-8 bg-neutral-100 rounded-lg animate-pulse" />
                        </div>
                    </header>

                    {/* Editor + Renderer + Right sidebar */}
                    <div className="flex flex-1 min-h-0 overflow-hidden">
                        {/* Editor area (42% width) */}
                        <div className="shrink-0 h-full border-r" style={{ width: "42%", borderColor: "#E9EDF2" }}>
                            <div className="flex flex-col h-full overflow-hidden">
                                {/* Editor header */}
                                <div className="flex items-center justify-between px-3 py-2 border-b shrink-0 bg-neutral-50/50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3.5 h-3.5 bg-neutral-200 rounded animate-pulse" />
                                        <div className="w-12 h-3 bg-neutral-200 rounded animate-pulse" />
                                        <div className="w-16 h-5 bg-neutral-200 rounded-full animate-pulse" />
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="w-6 h-6 bg-neutral-200 rounded animate-pulse" />
                                        <div className="w-6 h-6 bg-neutral-200 rounded animate-pulse" />
                                    </div>
                                </div>
                                {/* Editor body with line numbers */}
                                <div className="flex flex-1 overflow-hidden bg-[#0F172A]">
                                    <div className="w-10 pt-4 pr-3 text-right bg-black/20">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="h-5 w-4 bg-neutral-700/30 rounded animate-pulse mb-1" />
                                        ))}
                                    </div>
                                    <div className="flex-1 p-4 space-y-2">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="h-4 bg-neutral-700/30 rounded w-full animate-pulse" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Renderer area */}
                        <div className="flex-1 min-w-0 min-h-0 overflow-hidden bg-[#FAFBFE]">
                            <div className="flex flex-col h-full">
                                {/* Renderer toolbar */}
                                <div className="flex items-center justify-between px-3 py-2 border-b bg-white/80">
                                    <div className="flex gap-1">
                                        <div className="w-16 h-6 bg-neutral-100 rounded-full animate-pulse" />
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="w-7 h-7 bg-neutral-100 rounded-lg animate-pulse" />
                                        ))}
                                    </div>
                                </div>
                                {/* Canvas mock */}
                                <div className="flex-1 relative flex items-center justify-center">
                                    <div className="w-3/4 h-48 bg-neutral-100 rounded-xl animate-pulse" />
                                </div>
                            </div>
                        </div>

                        {/* Right sidebar (260px) */}
                        <aside className="flex flex-col shrink-0 border-l" style={{ width: 260, borderColor: "#E9EDF2", background: "rgba(255,255,255,0.8)" }}>
                            <div className="flex border-b" style={{ borderColor: "#E9EDF2" }}>
                                {["Templates", "Export"].map((tab) => (
                                    <div key={tab} className="flex-1 py-2.5 text-center">
                                        <div className="w-16 h-3 bg-neutral-100 rounded animate-pulse mx-auto" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 p-4 space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100">
                                        <div className="w-8 h-8 rounded-lg bg-neutral-100 animate-pulse" />
                                        <div className="flex-1 space-y-1">
                                            <div className="h-3 bg-neutral-100 rounded w-24 animate-pulse" />
                                            <div className="h-2 bg-neutral-50 rounded w-32 animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
}