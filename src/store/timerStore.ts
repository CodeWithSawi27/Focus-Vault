import { create } from 'zustand';

type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

interface TimerState {
  duration: number;
  elapsed: number;
  status: TimerStatus;
  setDuration: (duration: number) => void;
  setElapsed: (elapsed: number) => void;
  setStatus: (status: TimerStatus) => void;
  reset: () => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  duration: 25 * 60,
  elapsed: 0,
  status: 'idle',
  setDuration: (duration) => set({ duration }),
  setElapsed: (elapsed) => set({ elapsed }),
  setStatus: (status) => set({ status }),
  reset: () => set({ elapsed: 0, status: 'idle' }),
}));