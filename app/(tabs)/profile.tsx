import { useEffect, useMemo } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useOnboardingStore } from "@/src/store/onboardingStore";
import {
  RefreshCw,
  User,
  Bell,
  BarChart2,
  Shield,
  Star,
  LogOut,
  Info,
  Mail,
  Lock,
  Sun,
  Moon,
  Smartphone,
} from "lucide-react-native";
import { useProfile } from "@/src/hooks/useProfile";
import { useAppLock } from "@/src/hooks/useAppLock";
import { useTheme } from "@/src/context/ThemeContext";
import { useToast } from "@/src/hooks/useToast";
import { ProfileAvatar } from "@/src/components/profile/ProfileAvatar";
import { ProfileStats } from "@/src/components/profile/ProfileStats";
import { ProfileMenuSection } from "@/src/components/profile/ProfileMenuSection";
import type { MenuItem } from "@/src/components/profile/ProfileMenuSection";
import { Typography } from "@/src/constants/theme";
import { Layout, Spacing } from "@/src/constants/spacing";
import { TOTAL_TAB_BAR_SPACING } from "@/src/components/ui/FloatingTabBar";

const APP_VERSION = "1.0.0";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets(); // Initialize insets
  const { user, stats, loading, fetchStats, logout, avatarBase64 } =
    useProfile();
  const { reset: resetOnboarding } = useOnboardingStore();
  const { isEnabled: appLockEnabled } = useAppLock();
  const { colors, preference, setPreference } = useTheme();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Keep Alert for sign-out confirmation — it's a destructive action
  // that benefits from a native modal rather than a dismissable toast
  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  const accountItems: MenuItem[] = useMemo(
    () => [
      {
        id: "email",
        label: "Email",
        sublabel: user?.email ?? "",
        icon: Mail,
        onPress: () => {},
        hideChevron: true,
      },
      {
        id: "display_name",
        label: "Edit Profile",
        sublabel: "Name, avatar, password",
        icon: User,
        onPress: () => router.push("/edit-profile"),
      },
    ],
    [user?.email],
  );

  const themeItems: MenuItem[] = useMemo(
    () => [
      {
        id: "theme_light",
        label: "Light",
        icon: Sun,
        sublabel: preference === "light" ? "✓ Active" : undefined,
        onPress: () => setPreference("light"),
        hideChevron: true,
      },
      {
        id: "theme_dark",
        label: "Dark",
        icon: Moon,
        sublabel: preference === "dark" ? "✓ Active" : undefined,
        onPress: () => setPreference("dark"),
        hideChevron: true,
      },
      {
        id: "theme_system",
        label: "System",
        icon: Smartphone,
        sublabel: preference === "system" ? "✓ Active" : undefined,
        onPress: () => setPreference("system"),
        hideChevron: true,
      },
    ],
    [preference, setPreference],
  );

  const appItems: MenuItem[] = useMemo(
    () => [
      {
        id: "analytics",
        label: "Analytics",
        sublabel: "Insights and trends",
        icon: BarChart2, // Switched to BarChart2 for better visual distinction
        onPress: () => router.push("/analytics"),
      },
      {
        id: "security",
        label: "Security",
        sublabel: appLockEnabled ? "App Lock · On" : "App Lock · Off",
        icon: Lock,
        onPress: () => router.push("/security"),
      },
      {
        id: "notifications",
        label: "Notifications",
        sublabel: "Reminders and alerts",
        icon: Bell,
        onPress: () => router.push("/notifications-settings"),
      },
      {
        id: "privacy",
        label: "Privacy",
        sublabel: "Data and permissions",
        icon: Shield,
        onPress: () => router.push("/privacy"),
      },
      {
        id: "rate",
        label: "Rate FocusVault",
        icon: Star,
        onPress: () => {},
      },
      {
        id: "about",
        label: "About",
        sublabel: `Version ${APP_VERSION}`,
        icon: Info,
        onPress: () => router.push("/about"),
      },
      {
        id: "reset_onboarding",
        label: "Reset Onboarding",
        sublabel: "Dev only",
        icon: RefreshCw,
        onPress: async () => {
          await resetOnboarding();
          toast.info("Restart the app to see onboarding.");
        },
      },
    ],
    [appLockEnabled, toast],
  );

  const dangerItems: MenuItem[] = useMemo(
    () => [
      {
        id: "logout",
        label: "Sign Out",
        icon: LogOut,
        onPress: handleLogout,
        destructive: true,
        hideChevron: true,
      },
    ],
    [],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        scroll: {
          paddingHorizontal: Layout.screenPadding,
          paddingTop: Spacing.md,
          gap: Spacing.lg,
          // FIX: Use the dynamic spacing helper + a little extra padding (Spacing.xl)
          paddingBottom: TOTAL_TAB_BAR_SPACING(insets.bottom) + Spacing.xl,
        },
        header: { gap: 4 },
        title: {
          ...Typography.title2,
          color: colors.text.primary,
          letterSpacing: -0.4,
        },
        footer: {
          ...Typography.footnote,
          color: colors.text.tertiary,
          textAlign: "center",
          paddingTop: Spacing.sm,
        },
      }),
    [colors, insets.bottom],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchStats}
            tintColor={colors.text.tertiary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <ProfileAvatar
          displayName={user?.displayName ?? null}
          email={user?.email ?? null}
          avatarBase64={avatarBase64}
        />

        {stats && (
          <ProfileStats
            totalHabits={stats.totalHabits}
            totalSessions={stats.totalSessions}
            totalFocusMinutes={stats.totalFocusMinutes}
            longestStreak={stats.longestStreak}
          />
        )}

        <ProfileMenuSection title="Account" items={accountItems} />
        <ProfileMenuSection title="Appearance" items={themeItems} />
        <ProfileMenuSection title="App" items={appItems} />
        <ProfileMenuSection title="Session" items={dangerItems} />

        <Text style={styles.footer}>
          FocusVault · Built with love by Momoh Sawi
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
