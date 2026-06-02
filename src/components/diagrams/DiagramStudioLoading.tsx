export default function DiagramStudioLoading() {
    return (
        <div className="flex h-[100dvh] flex-col overflow-hidden bg-[var(--background)]">
            <div className="flex min-h-0 flex-1 overflow-hidden">
                <aside
                    className="flex w-[220px] shrink-0 flex-col overflow-hidden border-r border-black/6 bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] dark:border-white/8"
                >
                    <div className="flex items-center justify-between border-b border-black/6 px-3 py-3 dark:border-white/8">
                        <span className="text-xs font-semibold uppercase tracking-widest text-[#141414]/35 dark:text-white/30">
                            Diagrams
                        </span>
                        <div className="h-5 w-5 animate-pulse rounded-md bg-black/6 dark:bg-white/8" />
                    </div>
                    <div className="space-y-1 py-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="mx-1 px-2.5 py-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="size-1.5 animate-pulse rounded-full bg-black/8 dark:bg-white/10" />
                                    <div className="h-3 w-24 animate-pulse rounded bg-black/6 dark:bg-white/8" />
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <header className="flex shrink-0 items-center gap-3 border-b border-black/6 px-4 py-2.5 dark:border-white/8">
                        <div className="h-7 w-7 animate-pulse rounded-lg bg-black/6 dark:bg-white/8" />
                        <div className="h-4 w-32 animate-pulse rounded bg-black/6 dark:bg-white/8" />
                        <div className="h-5 w-16 animate-pulse rounded-full bg-black/6 dark:bg-white/8" />
                        <div className="h-7 w-36 animate-pulse rounded-lg bg-black/6 dark:bg-white/8" />
                        <div className="flex-1" />
                        <div className="h-8 w-24 animate-pulse rounded-lg bg-black/6 dark:bg-white/8" />
                        <div className="h-8 w-20 animate-pulse rounded-lg bg-black/6 dark:bg-white/8" />
                    </header>

                    <div className="flex min-h-0 flex-1 overflow-hidden">
                        <div className="w-[42%] shrink-0 border-r border-black/6 dark:border-white/8">
                            <div className="flex h-full flex-col bg-[#0f172a]">
                                <div className="flex items-center justify-between border-b border-white/8 px-3 py-2">
                                    <div className="flex gap-2">
                                        <div className="h-3.5 w-3.5 animate-pulse rounded bg-white/10" />
                                        <div className="h-3 w-12 animate-pulse rounded bg-white/10" />
                                        <div className="h-5 w-14 animate-pulse rounded bg-white/10" />
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="size-6 animate-pulse rounded bg-white/10" />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-1">
                                    <div className="w-10 space-y-1 border-r border-white/6 py-4 pr-3 pl-3">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="ml-auto h-4 w-3 animate-pulse rounded bg-white/10" />
                                        ))}
                                    </div>
                                    <div className="flex-1 space-y-2 p-4">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="h-4 w-full animate-pulse rounded bg-white/10" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="min-w-0 flex-1 bg-[#f8fafd] dark:bg-[#0c0b10]">
                            <div className="flex items-center justify-between border-b border-black/6 px-3 py-2 dark:border-white/8">
                                <div className="flex gap-2">
                                    <div className="h-6 w-14 animate-pulse rounded-full bg-black/6 dark:bg-white/8" />
                                    <div className="h-6 w-16 animate-pulse rounded-full bg-black/6 dark:bg-white/8" />
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="size-7 animate-pulse rounded-lg bg-black/6 dark:bg-white/8" />
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-1 items-center justify-center p-8">
                                <div className="h-48 w-3/4 max-w-md animate-pulse rounded-xl bg-black/6 dark:bg-white/8" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
