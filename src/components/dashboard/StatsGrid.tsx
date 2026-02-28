import { View, StyleSheet } from 'react-native';
import { StatCard } from './StatCard';
import { Colors } from '@/src/constants/theme';
import { Spacing } from '@/src/constants/spacing';

interface StatsGridProps {
  completionRate: number;
  completedCount: number;
  totalHabits: number;
  focusMinutes: number;
  streak: number;
}

export const StatsGrid = ({
  completionRate,
  completedCount,
  totalHabits,
  focusMinutes,
  streak,
}: StatsGridProps) => {
  const focusDisplay = focusMinutes >= 60
    ? `${Math.floor(focusMinutes / 60)}h ${focusMinutes % 60}m`
    : `${focusMinutes}m`;

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <StatCard
          label="Progress"
          value={`${completionRate}%`}
          subtitle={`${completedCount} of ${totalHabits} habits`}
          accent={completionRate === 100 ? Colors.accent.green : Colors.text.primary}
        />
        <StatCard
          label="Focus Time"
          value={focusDisplay}
          subtitle="Today"
          accent={Colors.text.primary}
        />
      </View>
      <View style={styles.row}>
        <StatCard
          label="Streak"
          value={`${streak}d`}
          subtitle="Current streak"
          accent={streak > 0 ? Colors.accent.orange : Colors.text.tertiary}
        />
        <StatCard
          label="Active"
          value={`${totalHabits}`}
          subtitle="Total habits"
          accent={Colors.text.primary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { gap: Spacing.sm },
  row:  { flexDirection: 'row', gap: Spacing.sm },
});