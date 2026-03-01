import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/src/store/authStore';
import { useAuthListener } from '@/src/hooks/useAuthListener';
import { useOnboardingStore } from '@/src/store/onboardingStore';

export default function RootLayout() {
  useAuthListener();

  const { user, initialized }                    = useAuthStore();
  const { completed, loading: obLoading, init }  = useOnboardingStore();
  const segments                                  = useSegments();
  const router                                    = useRouter();

  // Init onboarding store once on mount
  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!initialized || obLoading) return;

    const inAuthGroup  = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!completed && !inOnboarding) {
      router.replace('/onboarding');
      return;
    }

    if (completed && !user && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (completed && user && (inAuthGroup || inOnboarding)) {
      router.replace('/(tabs)');
      return;
    }
  }, [user, initialized, completed, obLoading, segments]);

  if (!initialized || obLoading) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}