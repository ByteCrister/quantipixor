import { JsonValue } from '@/components/mock/json-viewer/JsonViewerPage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type JsonStore = {
    // Data
    rawInput: string;
    parsedData: JsonValue | null;
    parseError: string | null;
    fileName: string | null;
    fileSize: number | null;

    // UI
    searchTerm: string;
    viewMode: 'grid' | 'list';
    page: number;
    pageSize: number;
    tab: 'paste' | 'upload';

    // Actions
    setRawInput: (input: string) => void;
    setParsedData: (data: JsonValue | null, error: string | null) => void;
    setFileInfo: (name: string | null, size: number | null) => void;
    setSearchTerm: (term: string) => void;
    setViewMode: (mode: 'grid' | 'list') => void;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    setTab: (tab: 'paste' | 'upload') => void;
    clearAll: () => void;
};

export const useJsonStore = create<JsonStore>()(
    persist(
        (set) => ({
            rawInput: '',
            parsedData: null,
            parseError: null,
            fileName: null,
            fileSize: null,
            searchTerm: '',
            viewMode: 'grid',
            page: 1,
            pageSize: 12,
            tab: 'paste',

            setRawInput: (input) => set({ rawInput: input, parseError: null }),
            setParsedData: (data, error) => set({ parsedData: data, parseError: error }),
            setFileInfo: (name, size) => set({ fileName: name, fileSize: size }),
            setSearchTerm: (term) => set({ searchTerm: term, page: 1 }), // reset page on new search
            setViewMode: (mode) => set({ viewMode: mode }),
            setPage: (page) => set({ page }),
            setPageSize: (size) => set({ pageSize: size, page: 1 }),
            setTab: (tab) => set({ tab }),
            clearAll: () => set({
                rawInput: '',
                parsedData: null,
                parseError: null,
                fileName: null,
                fileSize: null,
                searchTerm: '',
                viewMode: 'grid',
                page: 1,
                pageSize: 12,
                tab: 'paste',
            }),
        }),
        {
            name: 'json-viewer-storage', // key for localStorage
            partialize: (state) => ({
                // persist everything except maybe ephemeral flags? We'll keep all for now
                rawInput: state.rawInput,
                parsedData: state.parsedData,
                parseError: state.parseError,
                fileName: state.fileName,
                fileSize: state.fileSize,
                searchTerm: state.searchTerm,
                viewMode: state.viewMode,
                page: state.page,
                pageSize: state.pageSize,
                tab: state.tab,
            }),
        }
    )
);