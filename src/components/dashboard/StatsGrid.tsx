import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import type { TodayStats } from '@/src/hooks/useDashboard';

// Re-export for external use
export type { TodayStats };

interface StatsGridProps {
  stats: TodayStats;
}

interface StatCardProps {
  value: string;
  label: string;
  sublabel?: string;
}

const StatCard = ({ value, label, sublabel }: StatCardProps) => (
  <View style={styles.card}>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
    {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
  </View>
);

export const StatsGrid = ({ stats }: StatsGridProps) => {
  const focusDisplay = stats.focusMinutesToday >= 60
    ? `${Math.floor(stats.focusMinutesToday / 60)}h ${stats.focusMinutesToday % 60}m`
    : `${stats.focusMinutesToday}m`;

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <StatCard
          value={`${stats.habitsCompleted}/${stats.totalHabits}`}
          label="Today"
          sublabel="Habits done"
        />
        <StatCard
          value={`${stats.longestStreak}d`}
          label="Streak"
          sublabel="Current best"
        />
      </View>
      <View style={styles.row}>
        <StatCard
          value={focusDisplay}
          label="Focus"
          sublabel="Today"
        />
        <StatCard
          value={`${stats.sessionsThisWeek}`}
          label="Sessions"
          sublabel="This week"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 14,
    gap: 2,
    minHeight: 88,
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.07)',
    ...Shadow.sm,
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
  },
  label: {
    ...Typography.subhead,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  sublabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
});