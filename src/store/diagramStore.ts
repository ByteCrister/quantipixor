// ─── src/store/diagramStore.ts ────────────────────────────────────────────────
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { DiagramRecord, DiagramType } from "@/types/diagram.types";
import { DIAGRAM_TEMPLATES } from "@/types/diagram.types";

interface DiagramState {
    diagrams: DiagramRecord[];
    activeDiagramId: string | null;

    // CRUD
    createDiagram: (type: DiagramType, title?: string) => string;
    createFromTemplate: (templateId: string) => string;
    updateDiagram: (id: string, patch: Partial<Omit<DiagramRecord, "id" | "createdAt">>) => void;
    deleteDiagram: (id: string) => void;
    duplicateDiagram: (id: string) => string;

    // Active
    setActiveDiagram: (id: string | null) => void;
    getActiveDiagram: () => DiagramRecord | null;
}

const DEFAULT_CODE: Record<DiagramType, string> = {
    erd: `erDiagram\n    ENTITY_A {\n        int id PK\n        string name\n    }\n    ENTITY_B {\n        int id PK\n        int entity_a_id FK\n        string value\n    }\n    ENTITY_A ||--o{ ENTITY_B : "has"`,
    usecase: `@startuml\n!theme plain\nskinparam backgroundColor transparent\nleft to right direction\nactor User\nrectangle "System" {\n  usecase "Feature A" as UC1\n  usecase "Feature B" as UC2\n}\nUser --> UC1\nUser --> UC2\n@enduml`,
    activity: `@startuml\n!theme plain\nskinparam backgroundColor transparent\nstart\n:Step One;\nif (Condition?) then (yes)\n  :Do A;\nelse (no)\n  :Do B;\nendif\nstop\n@enduml`,
    workflow: `flowchart LR\n    A([Start]) --> B[Process]\n    B --> C{Decision}\n    C -->|Yes| D[Result A]\n    C -->|No| E[Result B]\n    D --> F([End])\n    E --> F`,
    sequence: `sequenceDiagram\n    actor User\n    participant System\n    participant Database\n    User->>System: Request\n    System->>Database: Query\n    Database-->>System: Data\n    System-->>User: Response`,
    class: `classDiagram\n    class Animal {\n        +String name\n        +makeSound() void\n    }\n    class Dog {\n        +fetch() void\n    }\n    Animal <|-- Dog`,
};

export const useDiagramStore = create<DiagramState>()(
    persist(
        (set, get) => ({
            diagrams: [],
            activeDiagramId: null,

            createDiagram: (type, title) => {
                const id = nanoid(10);
                const now = Date.now();
                const record: DiagramRecord = {
                    id,
                    title: title ?? `Untitled ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                    type,
                    code: DEFAULT_CODE[type],
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
                return diagrams.find((d) => d.id === activeDiagramId) ?? null;
            },
        }),
        { name: "diagram-store" }
    )
);