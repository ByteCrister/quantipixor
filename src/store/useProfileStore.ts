import { create } from "zustand";
import type { GeneratedProfile } from "@/types/mock-profile.types";
import { toast } from "@/store/toastStore";

export type Gender = "male" | "female" | "random";

export interface FilterState {
    country: string;
    language: string;
    gender: Gender;
    count: number;
}

interface ProfileStore {
    filters: FilterState;
    profiles: GeneratedProfile[];
    loading: boolean;
    hasFetched: boolean;
    // actions
    setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
    fetchProfiles: () => Promise<void>;
    reset: () => void;
}

const INITIAL_FILTERS: FilterState = {
    country: "random",
    language: "random",
    gender: "random",
    count: 10,
};

// module-level abort controller to cancel in-flight requests
let currentAbortController: AbortController | null = null;

export const useProfileStore = create<ProfileStore>((set, get) => ({
    filters: { ...INITIAL_FILTERS },
    profiles: [],
    loading: false,
    hasFetched: false,

    setFilter: (key, value) =>
        set((state) => ({
            filters: { ...state.filters, [key]: value },
        })),

    fetchProfiles: async () => {
        // abort previous request if still ongoing
        if (currentAbortController) {
            currentAbortController.abort();
        }

        const controller = new AbortController();
        currentAbortController = controller;
        const { filters } = get();

        set({ loading: true });

        const params = new URLSearchParams();
        if (filters.country !== "random") params.append("country", filters.country);
        if (filters.language !== "random") params.append("language", filters.language);
        if (filters.gender !== "random") params.append("gender", filters.gender);
        params.append("count", filters.count.toString());

        try {
            const res = await fetch(`/api/v1/mock/profiles?${params}`, {
                signal: controller.signal,
            });

            if (!res.ok) {
                const data = await res.json();
                toast({
                    variant: "error",
                    title: "Error",
                    message: data?.error ?? "Failed to generate profiles.",
                });
                return;
            }

            const data: GeneratedProfile[] = await res.json();
            set({ profiles: data, hasFetched: true });
            toast({
                variant: "success",
                message: `${data.length} profiles generated!`,
            });
        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                // silently ignore aborted requests
                return;
            }
            toast({
                variant: "error",
                title: "Network error",
                message: "Could not reach the server.",
            });
        } finally {
            if (currentAbortController === controller) {
                currentAbortController = null;
            }
            set({ loading: false });
        }
    },

    reset: () => {
        if (currentAbortController) {
            currentAbortController.abort();
            currentAbortController = null;
        }
        set({
            filters: { ...INITIAL_FILTERS },
            profiles: [],
            loading: false,
            hasFetched: false,
        });
    },
}));