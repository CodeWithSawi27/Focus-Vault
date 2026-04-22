import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  TouchableOpacity,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Stack } from "expo-router"; // Add this import
import { useStaggeredEntryAnimation } from "@/src/hooks/useEntryAnimation";
import { useAnalytics } from "@/src/hooks/useAnalytics";
import { useTheme } from "@/src/context/ThemeContext";
import { FilterTabs } from "@/src/components/analytics/FilterTabs";
import { SummaryRow } from "@/src/components/analytics/SummaryRow";
import { WeeklyHabitsChart } from "@/src/components/analytics/WeeklyHabitsChart";
import { FocusTimeChart } from "@/src/components/analytics/FocusTimeChart";
import { CompletionRateChart } from "@/src/components/analytics/CompletionRateChart";
import { StreakLeaderboard } from "@/src/components/analytics/StreakLeaderboard";
import { CategoryBreakdownChart } from "@/src/components/analytics/CategoryBreakdownChart";
import { BestDayChart } from "@/src/components/analytics/BestDayChart";
import { MonthlyHeatmap } from "@/src/components/analytics/MonthlyHeatmap";
import { Typography } from "@/src/constants/theme";
import { Layout, Spacing } from "@/src/constants/spacing";

const SECTION_COUNT = 10;

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    period,
    setPeriod,
    habitsByDay,
    focusByDay,
    completionRate,
    categoryBreakdown,
    bestDayData,
    heatmapData,
    streaks,
    summary,
    loading,
    refresh,
  } = useAnalytics();

  const router = useRouter();
  const sections = useStaggeredEntryAnimation(SECTION_COUNT, 70);
  const hasData = summary.totalHabitsCompleted > 0 || summary.totalSessions > 0;

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
          minWidth: 80, // Matches backBtn width to keep title centered
        },
        scroll: {
          paddingHorizontal: Layout.screenPadding,
          paddingTop: Spacing.md,
          // Since this is no longer a TAB screen, we use standard inset padding
          // instead of the TOTAL_TAB_BAR_SPACING.
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
        section: { gap: Spacing.sm },
        sectionLabel: {
          ...Typography.caption,
          color: colors.text.tertiary,
          textTransform: "uppercase",
          letterSpacing: 1,
          fontWeight: "600",
        },
        empty: {
          paddingTop: 40,
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 24,
        },
        emptyTitle: {
          ...Typography.headline,
          color: colors.text.primary,
          fontWeight: "600",
        },
        emptySubtitle: {
          ...Typography.subhead,
          color: colors.text.tertiary,
          textAlign: "center",
          lineHeight: 20,
        },
      }),
    [colors, insets.bottom],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* This configuration hides the header entirely, 
          ensuring there is no "Back" button visible. 
          The user MUST swipe to return.
      */}

      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: true, // Ensures swipe-to-go-back works
        }}
      />

      {/* CUSTOM NAVBAR */}
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={colors.text.primary} strokeWidth={2} />
          <Text style={styles.backText}>Profile</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Analytics</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.text.tertiary}
          />
        }
      >
        <Animated.View style={sections[0]}>
          <View style={styles.header}>
            <Text style={styles.title}>Analytics</Text>
            <Text style={styles.subtitle}>Your productivity at a glance</Text>
          </View>
        </Animated.View>

        <Animated.View style={sections[1]}>
          <FilterTabs period={period} onChange={setPeriod} />
        </Animated.View>

        <Animated.View style={sections[2]}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {period === "week" ? "This Week" : "This Month"}
            </Text>
            <SummaryRow summary={summary} />
          </View>
        </Animated.View>

        <Animated.View style={sections[3]}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Habits Completed</Text>
            <WeeklyHabitsChart data={habitsByDay} />
          </View>
        </Animated.View>

        <Animated.View style={sections[4]}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Focus Time</Text>
            <FocusTimeChart data={focusByDay} />
          </View>
        </Animated.View>

        {completionRate.length > 0 && (
          <Animated.View style={sections[5]}>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Completion Rate</Text>
              <CompletionRateChart data={completionRate} />
            </View>
          </Animated.View>
        )}

        <Animated.View style={sections[6]}>
          <View style={styles.section}>
            <CategoryBreakdownChart data={categoryBreakdown} />
          </View>
        </Animated.View>

        <Animated.View style={sections[7]}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Patterns</Text>
            <BestDayChart data={bestDayData} />
          </View>
        </Animated.View>

        <Animated.View style={sections[8]}>
          <View style={styles.section}>
            <MonthlyHeatmap data={heatmapData} />
          </View>
        </Animated.View>

        {streaks.length > 0 && (
          <Animated.View style={sections[9]}>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Streak Leaderboard</Text>
              <StreakLeaderboard habits={streaks} />
            </View>
          </Animated.View>
        )}

        {!loading && !hasData && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptySubtitle}>
              Complete habits and focus sessions to see your analytics here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
