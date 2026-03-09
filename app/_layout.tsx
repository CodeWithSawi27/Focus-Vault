import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { useAuthStore } from "@/src/store/authStore";
import { useAuthListener } from "@/src/hooks/useAuthListener";
import { useOnboardingStore } from "@/src/store/onboardingStore";
import { useAppLock } from "@/src/hooks/useAppLock";
import { LockScreen } from "@/src/components/lock/LockScreen";

function RootLayoutInner() {
  useAuthListener();
  useAppLock();

  const { colors, isDark } = useTheme();
  const { user, initialized } = useAuthStore();
  const { completed, loading: obLoading, init } = useOnboardingStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!initialized || obLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";

    if (!completed && !inOnboarding) {
      router.replace("/onboarding");
      return;
    }
    if (completed && !user && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }
    if (completed && user && (inAuthGroup || inOnboarding)) {
      router.replace("/(tabs)");
      return;
    }
  }, [user, initialized, completed, obLoading, segments]);

  if (!initialized || obLoading) return null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="notifications-settings" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="about" />
        <Stack.Screen name="security" />
      </Stack>
      <LockScreen />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
