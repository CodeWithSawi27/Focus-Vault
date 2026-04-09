import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { ToastProvider } from "@/src/context/ToastContext";
import { useAuthStore } from "@/src/store/authStore";
import { useAuthListener } from "@/src/hooks/useAuthListener";
import { useOnboardingStore } from "@/src/store/onboardingStore";
import { useAppLock } from "@/src/hooks/useAppLock";
import { LockScreen } from "@/src/components/lock/LockScreen";
import { ErrorBoundary } from "@/src/components/ui/ErrorBoundary";

// ─── Bridges our theme system into ToastProvider ──────────────────────────────
// Must sit inside ThemeProvider so it can read isDark.
function ToastBridge({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  return (
    <ToastProvider
      colorScheme={isDark ? "dark" : "light"}
      position="top-center"
      maxToasts={3}
    >
      {children}
    </ToastProvider>
  );
}

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
    <View style={styles.root}>
      {/* Outer boundary — catches ThemeProvider / ToastProvider boot failures */}
      <ErrorBoundary>
        <ThemeProvider>
          {/* ToastBridge reads isDark from ThemeProvider and passes it down */}
          <ToastBridge>
            {/* Inner boundary — catches navigation/screen failures without
                killing the shell, so toasts can still render above the crash */}
            <ErrorBoundary>
              <RootLayoutInner />
            </ErrorBoundary>
          </ToastBridge>
        </ThemeProvider>
      </ErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
