import { create } from 'zustand';

interface StripeStore {
  publishableKey: string | null;
  secretKey: string | null;
  setPublishableKey: (key: string) => void;
  setSecretKey: (key: string) => void;
  clearKeys: () => void;
}

export const useStripeStore = create<StripeStore>()((set) => ({
  publishableKey: null,
  secretKey: null,
  setPublishableKey: (key) => set({ publishableKey: key }),
  setSecretKey: (key) => set({ secretKey: key }),
  clearKeys: () => set({ publishableKey: null, secretKey: null }),
}));