import { create } from 'zustand';

interface LockState {
  isLocked:       boolean;
  isEnabled:      boolean;
  backgroundedAt: number | null;
  setLocked:      (v: boolean) => void;
  setEnabled:     (v: boolean) => void;
  setBackgroundedAt: (t: number | null) => void;
}

export const useLockStore = create<LockState>((set) => ({
  isLocked:       false,
  isEnabled:      false,
  backgroundedAt: null,
  setLocked:      (v) => set({ isLocked: v }),
  setEnabled:     (v) => set({ isEnabled: v }),
  setBackgroundedAt: (t) => set({ backgroundedAt: t }),
}));