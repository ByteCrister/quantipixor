// ─── src/store/diagramStore.ts ────────────────────────────────────────────────
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { DiagramRecord, DiagramType, DiagramEngine } from "@/types/diagram.types";
import {
    DIAGRAM_TEMPLATES,
    DEFAULT_CODE_BY_TYPE,
    DEFAULT_CODE_BY_ENGINE,
    engineForType,
} from "@/types/diagram.types";

interface DiagramState {
    diagrams: DiagramRecord[];
    activeDiagramId: string | null;

    createDiagram: (type: DiagramType, title?: string) => string;
    createFromTemplate: (templateId: string) => string;
    updateDiagram: (id: string, patch: Partial<Omit<DiagramRecord, "id" | "createdAt">>) => void;
    setDiagramEngine: (id: string, engine: DiagramEngine, options?: { resetCode?: boolean }) => void;
    deleteDiagram: (id: string) => void;
    duplicateDiagram: (id: string) => string;

    setActiveDiagram: (id: string | null) => void;
    getActiveDiagram: () => DiagramRecord | null;
}

type PersistedDiagram = Omit<DiagramRecord, "engine"> & { engine?: DiagramEngine };

function withEngine(diagram: PersistedDiagram): DiagramRecord {
    return {
        ...diagram,
        engine: diagram.engine ?? engineForType(diagram.type),
    };
}

export const useDiagramStore = create<DiagramState>()(
    persist(
        (set, get) => ({
            diagrams: [],
            activeDiagramId: null,

            createDiagram: (type, title) => {
                const id = nanoid(10);
                const now = Date.now();
                const engine = engineForType(type);
                const record: DiagramRecord = {
                    id,
                    title: title ?? `Untitled ${DIAGRAM_TYPE_LABEL(type)}`,
                    type,
                    engine,
                    code: DEFAULT_CODE_BY_TYPE[type],
                    createdAt: now,
                    updatedAt: now,
                };
                set((s) => ({ diagrams: [...s.diagrams, record], activeDiagramId: id }));
                return id;
            },

            createFromTemplate: (templateId) => {
                const tpl = DIAGRAM_TEMPLATES.find((t) => t.id === templateId);
                if (!tpl) throw new Error(`Template ${templateId} not found`);
                const id = nanoid(10);
                const now = Date.now();
                const record: DiagramRecord = {
                    id,
                    title: tpl.label,
                    type: tpl.type,
                    engine: engineForType(tpl.type),
                    code: tpl.code,
                    createdAt: now,
                    updatedAt: now,
                };
                set((s) => ({ diagrams: [...s.diagrams, record], activeDiagramId: id }));
                return id;
            },

            updateDiagram: (id, patch) => {
                set((s) => ({
                    diagrams: s.diagrams.map((d) =>
                        d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d
                    ),
                }));
            },

            setDiagramEngine: (id, engine, options) => {
                const diagram = get().diagrams.find((d) => d.id === id);
                if (!diagram || diagram.engine === engine) return;

                const resetCode = options?.resetCode ?? false;
                const patch: Partial<DiagramRecord> = { engine };
                if (resetCode) {
                    patch.code = DEFAULT_CODE_BY_ENGINE[engine];
                }

                set((s) => ({
                    diagrams: s.diagrams.map((d) =>
                        d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d
                    ),
                }));
            },

            deleteDiagram: (id) => {
                set((s) => ({
                    diagrams: s.diagrams.filter((d) => d.id !== id),
                    activeDiagramId: s.activeDiagramId === id ? null : s.activeDiagramId,
                }));
            },

            duplicateDiagram: (id) => {
                const src = get().diagrams.find((d) => d.id === id);
                if (!src) return id;
                const newId = nanoid(10);
                const now = Date.now();
                const copy: DiagramRecord = {
                    ...src,
                    id: newId,
                    title: `${src.title} (copy)`,
                    createdAt: now,
                    updatedAt: now,
                };
                set((s) => ({ diagrams: [...s.diagrams, copy], activeDiagramId: newId }));
                return newId;
            },

            setActiveDiagram: (id) => set({ activeDiagramId: id }),

            getActiveDiagram: () => {
                const { diagrams, activeDiagramId } = get();
                const found = diagrams.find((d) => d.id === activeDiagramId);
                return found ? withEngine(found) : null;
            },
        }),
        {
            name: "diagram-store",
            version: 1,
            migrate: (persisted) => {
                const state = persisted as { diagrams?: PersistedDiagram[] };
                if (!state?.diagrams) return persisted;
                return {
                    ...state,
                    diagrams: state.diagrams.map((d) => withEngine(d)),
                };
            },
        }
    )
);

function DIAGRAM_TYPE_LABEL(type: DiagramType): string {
    const labels: Record<DiagramType, string> = {
        erd: "ERD",
        usecase: "Use Case",
        activity: "Activity",
        workflow: "Workflow",
        sequence: "Sequence",
        class: "Class",
    };
    return labels[type];
}
