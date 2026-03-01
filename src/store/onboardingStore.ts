import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'focusvault_onboarding_complete';

interface OnboardingStore {
  completed: boolean;
  loading: boolean;
  init: () => Promise<void>;
  complete: () => Promise<void>;
  reset: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  completed: false,
  loading: true,

  init: async () => {
    try {
      const val = await AsyncStorage.getItem(ONBOARDING_KEY);
      set({ completed: val === 'true', loading: false });
    } catch {
      set({ completed: false, loading: false });
    }
  },

  complete: async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    // Set state synchronously so _layout.tsx effect fires immediately
    set({ completed: true });
  },

  reset: async () => {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    set({ completed: false });
  },
}));