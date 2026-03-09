import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

  const sections = useStaggeredEntryAnimation(SECTION_COUNT, 70);
  const hasData = summary.totalHabitsCompleted > 0 || summary.totalSessions > 0;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        scroll: {
          paddingHorizontal: Layout.screenPadding,
          paddingTop: Spacing.md,
          paddingBottom: 48,
          gap: Spacing.lg,
        },
        header: { gap: 4 },
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
    [colors],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
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
