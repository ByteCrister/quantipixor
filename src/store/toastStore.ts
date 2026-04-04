import { create } from "zustand";
import { nanoid } from "nanoid";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastRecord {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  /** Optional primary action (e.g. Undo); dismisses toast after the handler runs. */
  action?: { label: string; onClick: () => void };
}

interface ToastState {
  toasts: ToastRecord[];
  push: (toast: Omit<ToastRecord, "id">) => string;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = nanoid(8);
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    return id;
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast(options: Omit<ToastRecord, "id">) {
  return useToastStore.getState().push(options);
}
