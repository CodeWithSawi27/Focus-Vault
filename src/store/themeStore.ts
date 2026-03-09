import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ThemePreference } from "@/src/constants/theme";

const STORAGE_KEY = "focusvault_themePreference";

interface ThemeState {
  preference: ThemePreference;
  hydrated: boolean;
  setPreference: (p: ThemePreference) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: "system",
  hydrated: false,

  setPreference: async (preference) => {
    set({ preference });
    await AsyncStorage.setItem(STORAGE_KEY, preference);
  },

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark" || stored === "system") {
        set({ preference: stored, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },
}));
