import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnalytics } from '@/src/hooks/useAnalytics';
import { FilterTabs }              from '@/src/components/analytics/FilterTabs';
import { SummaryRow }              from '@/src/components/analytics/SummaryRow';
import { WeeklyHabitsChart }       from '@/src/components/analytics/WeeklyHabitsChart';
import { FocusTimeChart }          from '@/src/components/analytics/FocusTimeChart';
import { CompletionRateChart }     from '@/src/components/analytics/CompletionRateChart';
import { StreakLeaderboard }       from '@/src/components/analytics/StreakLeaderboard';
import { CategoryBreakdownChart }  from '@/src/components/analytics/CategoryBreakdownChart';
import { BestDayChart }            from '@/src/components/analytics/BestDayChart';
import { MonthlyHeatmap }          from '@/src/components/analytics/MonthlyHeatmap';
import { Colors, Typography } from '@/src/constants/theme';
import { Layout, Spacing } from '@/src/constants/spacing';

export default function AnalyticsScreen() {
  const {
    period, setPeriod,
    habitsByDay, focusByDay, completionRate,
    categoryBreakdown, bestDayData, heatmapData,
    streaks, summary, loading, refresh,
  } = useAnalytics();

  const hasData = summary.totalHabitsCompleted > 0 || summary.totalSessions > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={Colors.text.tertiary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Your productivity at a glance</Text>
        </View>

        {/* Filter tabs */}
        <FilterTabs period={period} onChange={setPeriod} />

        {/* Summary tiles */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {period === 'week' ? 'This Week' : 'This Month'}
          </Text>
          <SummaryRow summary={summary} />
        </View>

        {/* Habits per day */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Habits Completed</Text>
          <WeeklyHabitsChart data={habitsByDay} />
        </View>

        {/* Focus time */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Focus Time</Text>
          <FocusTimeChart data={focusByDay} />
        </View>

        {/* Completion rate */}
        {completionRate.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Completion Rate</Text>
            <CompletionRateChart data={completionRate} />
          </View>
        )}

        {/* Category breakdown */}
        <View style={styles.section}>
          <CategoryBreakdownChart data={categoryBreakdown} />
        </View>

        {/* Best day of week + Heatmap side by side on same scroll */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Patterns</Text>
          <BestDayChart data={bestDayData} />
        </View>

        {/* Monthly heatmap */}
        <View style={styles.section}>
          <MonthlyHeatmap data={heatmapData} />
        </View>

        {/* Streak leaderboard */}
        {streaks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Streak Leaderboard</Text>
            <StreakLeaderboard habits={streaks} />
          </View>
        )}

        {/* Empty state */}
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: 48,
    gap: Spacing.lg,
  },
  header: {
    gap: 4,
  },
  title: {
    ...Typography.title2,
    color: Colors.text.primary,
    letterSpacing: -0.4,
  },
  subtitle: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  empty: {
    paddingTop: 40,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    ...Typography.headline,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  emptySubtitle: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});