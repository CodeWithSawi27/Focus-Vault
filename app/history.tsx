import { useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/context/ThemeContext";
import { useSessionHistory } from "@/src/hooks/useSessionHistory";
import { SessionHistoryList } from "@/src/components/timer/SessionHistoryList";
import { Typography } from "@/src/constants/theme";
import { Layout, Spacing } from "@/src/constants/spacing";

export default function HistoryScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sessions, loading, fetchHistory } = useSessionHistory();

  useEffect(() => {
    fetchHistory(50); // Fetch more sessions for the full history view
  }, [fetchHistory]);

  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchHistory(50);
  }, [fetchHistory]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        navbar: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: Layout.screenPadding,
          height: 56,
        },
        backBtn: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          minWidth: 80,
        },
        backText: {
          ...Typography.body,
          color: colors.text.primary,
        },
        navTitle: {
          ...Typography.headline,
          color: colors.text.primary,
          fontWeight: "600",
        },
        navSpacer: {
          minWidth: 80,
        },
        scroll: {
          paddingHorizontal: Layout.screenPadding,
          paddingTop: Spacing.md,
          paddingBottom: insets.bottom + Spacing.xl,
          gap: Spacing.lg,
        },
        header: { gap: 4, marginBottom: Spacing.xs },
        title: {
          ...Typography.title2,
          color: colors.text.primary,
          letterSpacing: -0.4,
        },
        subtitle: { ...Typography.subhead, color: colors.text.tertiary },
      }),
    [colors, insets.bottom],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
      />

      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={colors.text.primary} strokeWidth={2} />
          <Text style={styles.backText}>Focus</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>History</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={colors.text.tertiary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Session History</Text>
          <Text style={styles.subtitle}>All your completed focus sessions</Text>
        </View>

        <SessionHistoryList
          sessions={sessions}
          hideHeader={true}
          maxItems={50}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
