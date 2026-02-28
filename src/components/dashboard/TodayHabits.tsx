import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Spacing } from '@/src/constants/spacing';
import type { Habit } from '@/src/types';

interface TodayHabitsProps {
  habits: Habit[];
  completedIds: string[];
  onToggle: (habitId: string) => void;
}

export const TodayHabits = ({ habits, completedIds, onToggle }: TodayHabitsProps) => {
  const router = useRouter();
  const preview = habits.slice(0, 4);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/habits')}
          style={styles.seeAllBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAll}>All habits</Text>
          <ArrowRight size={14} color={Colors.accent.blue} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {preview.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <BlurView intensity={50} tint="light" style={styles.blur}>
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No habits scheduled</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/habits')}>
                <Text style={styles.emptyAction}>Create your first habit</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      ) : (
        preview.map((habit, index) => {
          const done = completedIds.includes(habit.id);
          const isLast = index === preview.length - 1;
          return (
            <View key={habit.id} style={[styles.habitWrapper, !isLast && styles.habitBorder]}>
              <BlurView intensity={50} tint="light" style={styles.blur}>
                <TouchableOpacity
                  onPress={() => onToggle(habit.id)}
                  activeOpacity={0.7}
                  style={styles.habitInner}
                >
                  {done
                    ? <CheckCircle2 size={22} color={Colors.accent.green} strokeWidth={1.8} />
                    : <Circle size={22} color={Colors.text.tertiary} strokeWidth={1.5} />
                  }
                  <View style={styles.habitInfo}>
                    <Text style={[styles.habitName, done && styles.habitNameDone]}>
                      {habit.name}
                    </Text>
                    {habit.streak > 0 && (
                      <Text style={styles.habitStreak}>{habit.streak} day streak</Text>
                    )}
                  </View>
                  {done && (
                    <View style={styles.doneTag}>
                      <Text style={styles.doneTagText}>Done</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </BlurView>
            </View>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 0 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.title3,
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  seeAll: {
    ...Typography.subhead,
    color: Colors.accent.blue,
    fontWeight: '500',
  },
  emptyWrapper: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    ...Shadow.sm,
  },
  blur: { width: '100%' },
  empty: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
    gap: 8,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.tertiary,
  },
  emptyAction: {
    ...Typography.subhead,
    color: Colors.accent.blue,
    fontWeight: '500',
  },
  habitWrapper: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: Radius.lg,
    marginBottom: Spacing.xs,
    ...Shadow.sm,
  },
  habitBorder: {},
  habitInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.65)',
    gap: 12,
  },
  habitInfo: { flex: 1 },
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
    ...Typography.footnote,
    color: Colors.text.tertiary,
    marginTop: 1,
  },
  doneTag: {
    backgroundColor: Colors.accent.greenMuted,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  doneTagText: {
    ...Typography.caption,
    color: Colors.accent.green,
    fontWeight: '600',
  },
});