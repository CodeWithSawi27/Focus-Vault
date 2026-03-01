import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDashboard } from '@/src/hooks/useDashboard';
import { useAuthStore } from '@/src/store/authStore';
import { DashboardHeader } from '@/src/components/dashboard/DashboardHeader';
import { StatsGrid } from '@/src/components/dashboard/StatsGrid';
import { TodayHabits } from '@/src/components/dashboard/TodayHabits';
import { SmartCTA } from '@/src/components/dashboard/SmartCTA';
import { Colors, Typography } from '@/src/constants/theme';
import { Layout, Spacing } from '@/src/constants/spacing';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const {
    greeting, formattedDate,
    habitsToday, completedToday,
    todayStats, lastSession, longestStreak,
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
        />

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Overview</Text>
          <StatsGrid stats={todayStats} />
        </View>

        {/* Smart CTA */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Focus</Text>
          <SmartCTA lastSession={lastSession} />
        </View>

        {/* Today's habits */}
        <TodayHabits
          habits={habitsToday}
          completedToday={completedToday}
          onToggle={toggleHabit}
        />
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
    gap: Spacing.xl,
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