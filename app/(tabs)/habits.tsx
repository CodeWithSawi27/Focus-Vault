import { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabits, CreateHabitPayload } from '@/src/hooks/useHabits';
import { HabitList } from '@/src/components/habits/HabitList';
import { AddHabitModal } from '@/src/components/habits/AddHabitModal';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Layout, Spacing } from '@/src/constants/spacing';
import type { Habit } from '@/src/types';
import { supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/authStore';

export default function HabitsScreen() {
  const {
    habits, loading,
    createHabit, updateHabit,
    deleteHabit, toggleHabitCompletion,
  } = useHabits();

  const { user } = useAuthStore();
  const [modalVisible, setModalVisible]   = useState(false);
  const [editingHabit, setEditingHabit]   = useState<Habit | null>(null);
  const [completedTodayIds, setCompletedTodayIds] = useState<string[]>([]);

  const fetchTodayCompletions = useCallback(async () => {
    if (!user) return;
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);

    const { data } = await supabase
      .from('habit_logs')
      .select('habit_id')
      .eq('user_id', user.uid)
      .gte('completed_at', start.toISOString())
      .lte('completed_at', end.toISOString());

    if (data) setCompletedTodayIds(data.map(l => l.habit_id));
  }, [user]);

  useEffect(() => { fetchTodayCompletions(); }, [fetchTodayCompletions]);

  const handleSubmit = useCallback(async (payload: CreateHabitPayload) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, payload);
    } else {
      await createHabit(payload);
    }
    setEditingHabit(null);
  }, [editingHabit, createHabit, updateHabit]);

  const handleEdit = useCallback((habit: Habit) => {
    setEditingHabit(habit);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback((habitId: string) => {
    Alert.alert(
      'Delete Habit',
      'This will delete the habit and all its history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteHabit(habitId),
        },
      ]
    );
  }, [deleteHabit]);

  const handleToggle = useCallback(async (habitId: string) => {
    await toggleHabitCompletion(habitId);
    await fetchTodayCompletions();
  }, [toggleHabitCompletion, fetchTodayCompletions]);

  const handleOpenCreate = useCallback(() => {
    setEditingHabit(null);
    setModalVisible(true);
  }, []);

  const completedCount = completedTodayIds.length;
  const totalCount = habits.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Habits</Text>
            <Text style={styles.subtitle}>
              {completedCount} of {totalCount} completed today
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleOpenCreate}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <HabitList
            habits={habits}
            completedTodayIds={completedTodayIds}
            loading={loading}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </ScrollView>
      </View>

      <AddHabitModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingHabit(null); }}
        onSubmit={handleSubmit}
        editingHabit={editingHabit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.title1,
    color: Colors.text.primary,
  },
  subtitle: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.md,
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    lineHeight: 28,
  },
  scroll: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: 32,
    gap: Spacing.sm,
  },
});