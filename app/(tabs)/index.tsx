import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '@/src/hooks/useProfile';
import { useDashboard } from '@/src/hooks/useDashboard';
import { useAuthStore } from '@/src/store/authStore';
import { DashboardHeader }       from '@/src/components/dashboard/DashboardHeader';
import { HabitCompletionRing }   from '@/src/components/dashboard/HabitCompletionRing';
import { TodayHabits }           from '@/src/components/dashboard/TodayHabits';
import { RecentSessionCard }     from '@/src/components/dashboard/RecentSessionCard';
import { WeeklySummaryCard }     from '@/src/components/dashboard/WeeklySummaryCard';
import { UpcomingReminderCard }  from '@/src/components/dashboard/UpcomingReminderCard';
import { MotivationalQuoteCard } from '@/src/components/dashboard/MotivationalQuoteCard';
import { Colors, Typography } from '@/src/constants/theme';
import { Layout, Spacing } from '@/src/constants/spacing';

export default function DashboardScreen() {
  const { avatarBase64 } = useProfile();
  const { user }         = useAuthStore();
  const {
    greeting, formattedDate,
    habitsToday, completedToday,
    todayStats, lastSession, longestStreak,
    weeklySummary, nextReminder,
    loading, toggleHabit, refresh,
  } = useDashboard();

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
        <DashboardHeader
          greeting={greeting}
          formattedDate={formattedDate}
          displayName={user?.displayName ?? null}
          longestStreak={longestStreak}
          avatarBase64={avatarBase64}
        />

        {/* ── Today ── */}
        <View style={styles.section}>
          <HabitCompletionRing
            completed={todayStats.habitsCompleted}
            total={todayStats.totalHabits}
          />
        </View>

        {/* ── Habits ── */}
        <TodayHabits
          habits={habitsToday}
          completedToday={completedToday}
          onToggle={toggleHabit}
        />

        {/* ── Focus ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Focus</Text>
          <RecentSessionCard lastSession={lastSession} />
        </View>

        {/* ── This Week ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>This Week</Text>
          <WeeklySummaryCard summary={weeklySummary} />
        </View>

        {/* ── Upcoming Reminder ── */}
        {nextReminder && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Upcoming</Text>
            <UpcomingReminderCard reminder={nextReminder} />
          </View>
        )}

        {/* ── Daily Boost ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Daily Boost</Text>
          <MotivationalQuoteCard />
        </View>
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
});