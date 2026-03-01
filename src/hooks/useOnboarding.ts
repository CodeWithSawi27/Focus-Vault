import { useEffect } from 'react';
import { useOnboardingStore } from '@/src/store/onboardingStore';

export const useOnboarding = () => {
  const { completed, loading, init, complete, reset } = useOnboardingStore();

  useEffect(() => {
    // Only init once — if already loaded, skip
    if (!loading) return;
    init();
  }, []);

  return {
    completed,
    loading,
    completeOnboarding: complete,
    resetOnboarding: reset,
  };
};