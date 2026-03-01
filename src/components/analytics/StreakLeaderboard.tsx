import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import type { Habit } from '@/src/types';

interface StreakLeaderboardProps {
  habits: Habit[];
}

const RANK_COLORS = ['#B8860B', '#888888', '#8B4513'];

export const StreakLeaderboard = ({ habits }: StreakLeaderboardProps) => {
  if (habits.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Best Streaks</Text>
        <Text style={styles.subtitle}>All-time records</Text>
      </View>

      <View style={styles.list}>
        {habits.map((habit, index) => (
          <View key={habit.id} style={[styles.row, index < habits.length - 1 && styles.rowBorder]}>
            {/* Rank */}
            <View style={styles.rankWrap}>
              <Text style={[
                styles.rank,
                index < 3 && { color: RANK_COLORS[index] }
              ]}>
                {index + 1}
              </Text>
            </View>

            {/* Name + current */}
            <View style={styles.info}>
              <Text style={styles.habitName} numberOfLines={1}>{habit.name}</Text>
              <Text style={styles.habitCurrent}>
                Current: {habit.streak}d
              </Text>
            </View>

            {/* Best streak */}
            <View style={styles.bestWrap}>
              <Text style={styles.bestValue}>{habit.longest_streak}</Text>
              <Text style={styles.bestLabel}>best</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    paddingTop: 16,
    paddingBottom: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    ...Shadow.sm,
  },
  header: {
    paddingHorizontal: 16,
    gap: 2,
    marginBottom: 12,
  },
  title: {
    ...Typography.callout,
    color: Colors.text.primary,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.07)',
  },
  rankWrap: {
    width: 24,
    alignItems: 'center',
  },
  rank: {
    ...Typography.callout,
    color: Colors.text.tertiary,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  habitName: {
    ...Typography.callout,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  habitCurrent: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
  },
  bestWrap: {
    alignItems: 'flex-end',
    gap: 1,
  },
  bestValue: {
    ...Typography.title3,
    color: Colors.text.primary,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  bestLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
});