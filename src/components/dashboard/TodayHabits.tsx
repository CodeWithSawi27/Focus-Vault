import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, Circle, ArrowRight, ListChecks } from 'lucide-react-native';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import type { Habit } from '@/src/types';

const MAX_VISIBLE = 4;

interface TodayHabitsProps {
  habits: Habit[];
  completedToday: Set<string>;
  onToggle: (habitId: string) => void;
}

export const TodayHabits = ({
  habits,
  completedToday,
  onToggle,
}: TodayHabitsProps) => {
  const router   = useRouter();
  const visible  = habits.slice(0, MAX_VISIBLE);
  const overflow = habits.length - MAX_VISIBLE;

  if (habits.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <ListChecks size={28} color={Colors.text.tertiary} strokeWidth={1.5} />
        <Text style={styles.emptyTitle}>No habits today</Text>
        <Text style={styles.emptySubtitle}>
          Add your first habit to start building momentum.
        </Text>
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => router.push('/(tabs)/habits')}
          activeOpacity={0.7}
        >
          <Text style={styles.emptyBtnText}>Go to Habits</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Today's Habits</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/habits')}
          activeOpacity={0.6}
          style={styles.viewAll}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <ArrowRight size={13} color={Colors.text.tertiary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Habit rows */}
      <View style={styles.card}>
        {visible.map((habit, index) => {
          const done   = completedToday.has(habit.id);
          const isLast = index === visible.length - 1 && overflow <= 0;

          return (
            <TouchableOpacity
              key={habit.id}
              style={[styles.row, !isLast && styles.rowBorder]}
              onPress={() => onToggle(habit.id)}
              activeOpacity={0.6}
            >
              {/* Checkbox */}
              <View style={styles.check}>
                {done ? (
                  <CheckCircle2
                    size={22}
                    color={Colors.accent.green}
                    strokeWidth={2}
                  />
                ) : (
                  <Circle
                    size={22}
                    color="rgba(0,0,0,0.15)"
                    strokeWidth={1.5}
                  />
                )}
              </View>

              {/* Name + streak */}
              <View style={styles.info}>
                <Text style={[styles.habitName, done && styles.habitNameDone]}>
                  {habit.name}
                </Text>
                {habit.streak > 0 && (
                  <Text style={styles.habitStreak}>
                    {habit.streak}d streak
                  </Text>
                )}
              </View>

              {/* Done tag */}
              {done && (
                <View style={styles.doneTag}>
                  <Text style={styles.doneTagText}>Done</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Overflow row */}
        {overflow > 0 && (
          <TouchableOpacity
            style={styles.overflowRow}
            onPress={() => router.push('/(tabs)/habits')}
            activeOpacity={0.6}
          >
            <Text style={styles.overflowText}>
              +{overflow} more habit{overflow > 1 ? 's' : ''} — View All
            </Text>
            <ArrowRight size={14} color={Colors.text.tertiary} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewAllText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
    ...Shadow.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  check: {
    width: 24,
    alignItems: 'center',
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
  habitNameDone: {
    color: Colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  habitStreak: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    letterSpacing: 0.2,
  },
  doneTag: {
    backgroundColor: Colors.accent.greenMuted,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  doneTagText: {
    ...Typography.caption,
    color: Colors.accent.green,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  overflowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  overflowText: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.07)',
    ...Shadow.sm,
  },
  emptyTitle: {
    ...Typography.callout,
    color: Colors.text.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  emptySubtitle: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: Colors.text.primary,
    borderRadius: Radius.full,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyBtnText: {
    ...Typography.subhead,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
});