// store.ts
import { create } from 'zustand';

interface WidthState {
    width: number;
    setWidth: (w: number) => void;
}

export const useWidthStore = create<WidthState>()((set) => ({
    width: 0,
    setWidth: (w) => set({ width: w }),
}));