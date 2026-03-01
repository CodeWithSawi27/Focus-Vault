import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';

interface ProfileStatsProps {
  totalHabits: number;
  totalSessions: number;
  totalFocusMinutes: number;
  longestStreak: number;
}

interface StatItemProps {
  value: string;
  label: string;
  bordered?: boolean;
}

const StatItem = ({ value, label, bordered }: StatItemProps) => (
  <View style={[styles.statItem, bordered && styles.statBordered]}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export const ProfileStats = ({
  totalHabits,
  totalSessions,
  totalFocusMinutes,
  longestStreak,
}: ProfileStatsProps) => {
  const focusDisplay = totalFocusMinutes >= 60
    ? `${Math.floor(totalFocusMinutes / 60)}h`
    : `${totalFocusMinutes}m`;

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Lifetime Stats</Text>
      <View style={styles.grid}>
        <StatItem value={`${totalHabits}`} label="Habits" />
        <StatItem value={`${totalSessions}`} label="Sessions" bordered />
        <StatItem value={focusDisplay} label="Focus" bordered />
        <StatItem value={`${longestStreak}d`} label="Best Streak" bordered />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: 12,
    ...Shadow.sm,
  },
  cardLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statBordered: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(0,0,0,0.08)',
  },
  statValue: {
    ...Typography.title2,
    color: Colors.text.primary,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
});