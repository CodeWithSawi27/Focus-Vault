import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabits, CreateHabitPayload } from '@/src/hooks/useHabits';
import { HabitList } from '@/src/components/habits/HabitList';
import { AddHabitModal } from '@/src/components/habits/AddHabitModal';
import { Colors, Typography, Shadow } from '@/src/constants/theme';
import { Layout, Spacing } from '@/src/constants/spacing';
import type { Habit } from '@/src/types';
import { supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/authStore';

export default function HabitsScreen() {
  const {
    habits, loading,
    createHabit, updateHabit,
    deleteHabit, toggleHabitCompletion,
    fetchHabits,
  } = useHabits();

  const { user } = useAuthStore();

  const [modalVisible, setModalVisible]           = useState(false);
  const [editingHabit, setEditingHabit]           = useState<Habit | null>(null);
  const [completedTodayIds, setCompletedTodayIds] = useState<Set<string>>(new Set());
  const [togglingIds, setTogglingIds]             = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds]             = useState<Set<string>>(new Set());
  const [scrollEnabled, setScrollEnabled]         = useState(true);
  const [refreshing, setRefreshing]               = useState(false);

  // ─── Fetch today completions ──────────────────────────────────────────────
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

    if (data) {
      setCompletedTodayIds(new Set(data.map(l => l.habit_id)));
    }
  }, [user]);

  useEffect(() => { fetchTodayCompletions(); }, [fetchTodayCompletions]);

  // ─── Pull to refresh ──────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchHabits(), fetchTodayCompletions()]);
    setRefreshing(false);
  }, [fetchHabits, fetchTodayCompletions]);

  // ─── Optimistic toggle ────────────────────────────────────────────────────
  const handleToggle = useCallback(async (habitId: string) => {
    const wasCompleted = completedTodayIds.has(habitId);

    // 1. Instant UI update
    setCompletedTodayIds(prev => {
      const next = new Set(prev);
      wasCompleted ? next.delete(habitId) : next.add(habitId);
      return next;
    });

    // 2. Show row spinner
    setTogglingIds(prev => new Set(prev).add(habitId));

    try {
      await toggleHabitCompletion(habitId);
    } catch {
      // Revert on failure
      setCompletedTodayIds(prev => {
        const next = new Set(prev);
        wasCompleted ? next.add(habitId) : next.delete(habitId);
        return next;
      });
      Alert.alert('Error', 'Could not update habit. Please try again.');
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    }
  }, [completedTodayIds, toggleHabitCompletion]);

  // ─── Optimistic delete ────────────────────────────────────────────────────
  const handleDelete = useCallback((habitId: string) => {
    Alert.alert(
      'Delete Habit',
      'This will delete the habit and all its history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Show spinner on row
            setDeletingIds(prev => new Set(prev).add(habitId));
            try {
              await deleteHabit(habitId);
              // Remove from completed set too
              setCompletedTodayIds(prev => {
                const next = new Set(prev);
                next.delete(habitId);
                return next;
              });
            } catch {
              Alert.alert('Error', 'Could not delete habit. Please try again.');
            } finally {
              setDeletingIds(prev => {
                const next = new Set(prev);
                next.delete(habitId);
                return next;
              });
            }
          },
        },
      ]
    );
  }, [deleteHabit]);

  // ─── Edit ─────────────────────────────────────────────────────────────────
  const handleEdit = useCallback((habit: Habit) => {
    setEditingHabit(habit);
    setModalVisible(true);
  }, []);

  const handleSubmit = useCallback(async (payload: CreateHabitPayload) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, payload);
    } else {
      await createHabit(payload);
    }
    setEditingHabit(null);
  }, [editingHabit, createHabit, updateHabit]);

  const handleOpenCreate = useCallback(() => {
    setEditingHabit(null);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setEditingHabit(null);
  }, []);

  const completedCount = completedTodayIds.size;
  const totalCount     = habits.length;

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
          scrollEnabled={scrollEnabled}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.text.tertiary}
            />
          }
        >
          <HabitList
            habits={habits}
            completedTodayIds={completedTodayIds}
            togglingIds={togglingIds}
            deletingIds={deletingIds}
            loading={loading && !refreshing}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            setScrollEnabled={setScrollEnabled}
          />
        </ScrollView>
      </View>

      <AddHabitModal
        visible={modalVisible}
        onClose={handleCloseModal}
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
    backgroundColor: Colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.md,
  },
  addButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    lineHeight: 28,
  },
  scroll: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: 32,
    gap: Spacing.sm,
  },
});