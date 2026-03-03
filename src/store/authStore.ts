import { create } from 'zustand';
import type { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  initialized: boolean;
  avatarBase64: string | null; // ✅ global — shared across all screens
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setInitialized: (value: boolean) => void;
  setAvatarBase64: (base64: string | null) => void; // ✅
}

export const useAuthStore = create<AuthState>((set) => ({
  user:         null,
  initialized:  false,
  avatarBase64: null,

  setUser:        (user)        => set({ user }),
  clearUser:      ()            => set({ user: null, avatarBase64: null }),
  setInitialized: (initialized) => set({ initialized }),
  setAvatarBase64: (base64)     => set({ avatarBase64: base64 }), // ✅
}));