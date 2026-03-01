import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnalytics } from '@/src/hooks/useAnalytics';
import { SummaryRow } from '@/src/components/analytics/SummaryRow';
import { WeeklyHabitsChart } from '@/src/components/analytics/WeeklyHabitsChart';
import { FocusTimeChart } from '@/src/components/analytics/FocusTimeChart';
import { CompletionRateChart } from '@/src/components/analytics/CompletionRateChart';
import { StreakLeaderboard } from '@/src/components/analytics/StreakLeaderboard';
import { Colors, Typography } from '@/src/constants/theme';
import { Layout, Spacing } from '@/src/constants/spacing';

export default function AnalyticsScreen() {
  const {
    habitsByDay, focusByDay, completionRate,
    streaks, summary, loading, refresh,
  } = useAnalytics();

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

        {/* 30-day summary tiles */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Last 30 Days</Text>
          <SummaryRow summary={summary} />
        </View>

        {/* Weekly bar charts */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>This Week</Text>
          <WeeklyHabitsChart data={habitsByDay} />
        </View>

        <View style={styles.section}>
          <FocusTimeChart data={focusByDay} />
        </View>

        {/* 30-day completion trend */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>30-Day Trend</Text>
          <CompletionRateChart data={completionRate} />
        </View>

        {/* Streak leaderboard */}
        {streaks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Leaderboard</Text>
            <StreakLeaderboard habits={streaks} />
          </View>
        )}

        {/* Empty state */}
        {!loading && summary.totalHabitsCompleted === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptySubtitle}>
              Complete habits and focus sessions to see your analytics populate here.
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