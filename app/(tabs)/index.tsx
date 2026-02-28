import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { useDashboard } from '@/src/hooks/useDashboard';
import { DashboardHeader } from '@/src/components/dashboard/DashboardHeader';
import { StatsGrid } from '@/src/components/dashboard/StatsGrid';
import { TodayHabits } from '@/src/components/dashboard/TodayHabits';
import { QuickActions } from '@/src/components/dashboard/QuickActions';
import { Colors } from '@/src/constants/theme';
import { Layout, Spacing } from '@/src/constants/spacing';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const {
    todayHabits,
    completedTodayIds,
    totalFocusToday,
    currentStreak,
    completionRate,
    refresh,
  } = useDashboard();

  const focusMinutes = Math.floor(totalFocusToday / 60);

  const handleToggleHabit = useCallback(async (habitId: string) => {
    if (!user) return;
    const alreadyDone = completedTodayIds.includes(habitId);

    if (alreadyDone) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('user_id', user.uid)
        .gte('completed_at', today.toISOString());
    } else {
      await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, user_id: user.uid });
    }
    refresh();
  }, [completedTodayIds, user, refresh]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader streak={currentStreak} />

        <StatsGrid
          completionRate={completionRate}
          completedCount={completedTodayIds.length}
          totalHabits={todayHabits.length}
          focusMinutes={focusMinutes}
          streak={currentStreak}
        />

        <QuickActions />

        <TodayHabits
          habits={todayHabits}
          completedIds={completedTodayIds}
          onToggle={handleToggleHabit}
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
    paddingBottom: 32,
    gap: Spacing.lg,
  },
});