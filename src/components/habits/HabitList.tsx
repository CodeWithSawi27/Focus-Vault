import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Layers } from 'lucide-react-native';
import { HabitCard } from './HabitCard';
import { Colors, Typography } from '@/src/constants/theme';
import { Spacing } from '@/src/constants/spacing';
import type { Habit } from '@/src/types';

interface HabitListProps {
  habits: Habit[];
  completedTodayIds: string[];
  loading: boolean;
  onToggle: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export const HabitList = ({
  habits,
  completedTodayIds,
  loading,
  onToggle,
  onEdit,
  onDelete,
}: HabitListProps) => {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.text.tertiary} size="small" />
      </View>
    );
  }

  if (habits.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Layers size={28} color={Colors.text.tertiary} strokeWidth={1.5} />
        </View>
        <Text style={styles.emptyTitle}>No habits yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the + button to create your first habit
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          isCompletedToday={completedTodayIds.includes(habit.id)}
          onToggle={() => onToggle(habit.id)}
          onEdit={() => onEdit(habit)}
          onDelete={() => onDelete(habit.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  list: {
    gap: Spacing.sm,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    gap: 10,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
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
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});