import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MuyuState {
  count: number;
  increment: () => void;
  reset: () => void;
}

export const useMuyuStore = create<MuyuState>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      reset: () => set({ count: 0 }),
    }),
    {
      name: 'muyu-storage',
    }
  )
);
