import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { useHabitStore } from '@/src/store/habitStore';
import { calculateStreak } from '@/src/utils/streakCalculator';
import {
  scheduleHabitReminder,
  cancelHabitReminder,
} from '@/src/services/notifications';
import type { Habit } from '@/src/types';

export interface CreateHabitPayload {
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  reminder_time?: string | null;
}

export const useHabits = () => {
  const { user } = useAuthStore();
  const { setHabits, setLoading, habits, loading } = useHabitStore();
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.uid)
      .order('created_at', { ascending: true });

    if (fetchError) setError(fetchError.message);
    else setHabits((data as Habit[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const createHabit = useCallback(async (payload: CreateHabitPayload) => {
    if (!user) return;

    const { data, error: insertError } = await supabase
      .from('habits')
      .insert({
        user_id: user.uid,
        name: payload.name.trim(),
        description: payload.description?.trim() ?? null,
        frequency: payload.frequency,
        reminder_time: payload.reminder_time ?? null,
      })
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);

    // Schedule notification if reminder time was set
    if (data && payload.reminder_time) {
      await scheduleHabitReminder({
        habitId: data.id,
        habitName: data.name,
        reminderTime: payload.reminder_time,
        streak: 0,
        incompleteCount: 1,
      });
    }

    await fetchHabits();
  }, [user, fetchHabits]);

  const updateHabit = useCallback(async (
    habitId: string,
    payload: Partial<CreateHabitPayload>
  ) => {
    const { error: updateError } = await supabase
      .from('habits')
      .update({
        name: payload.name?.trim(),
        description: payload.description?.trim() ?? null,
        frequency: payload.frequency,
        reminder_time: payload.reminder_time ?? null,
      })
      .eq('id', habitId);

    if (updateError) throw new Error(updateError.message);

    // Handle notification rescheduling
    if (payload.reminder_time !== undefined) {
      if (payload.reminder_time) {
        await scheduleHabitReminder({
          habitId,
          habitName: payload.name ?? '',
          reminderTime: payload.reminder_time,
          streak: 0,
          incompleteCount: 1,
        });
      } else {
        await cancelHabitReminder(habitId);
      }
    }

    await fetchHabits();
  }, [fetchHabits]);

  const deleteHabit = useCallback(async (habitId: string) => {
    // Cancel notification before deleting row
    await cancelHabitReminder(habitId);

    const { error: deleteError } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId);

    if (deleteError) throw new Error(deleteError.message);
    await fetchHabits();
  }, [fetchHabits]);

  const recalculateStreak = useCallback(async (habitId: string) => {
    const { data: logs } = await supabase
      .from('habit_logs')
      .select('completed_at')
      .eq('habit_id', habitId)
      .order('completed_at', { ascending: false });

    if (!logs) return;

    const streak = calculateStreak(
      logs.map(l => l.completed_at).filter(Boolean) as string[]
    );

    const { data: habitData } = await supabase
      .from('habits')
      .select('longest_streak, name, reminder_time')
      .eq('id', habitId)
      .single();

    const currentLongest = (habitData as Pick<Habit, 'longest_streak' | 'name' | 'reminder_time'> | null)
      ?.longest_streak ?? 0;

    await supabase
      .from('habits')
      .update({
        streak,
        longest_streak: Math.max(streak, currentLongest),
      })
      .eq('id', habitId);

    // Refresh notification body with updated streak
    if (habitData?.reminder_time) {
      await scheduleHabitReminder({
        habitId,
        habitName: habitData.name,
        reminderTime: habitData.reminder_time,
        streak,
        incompleteCount: 1,
      });
    }
  }, []);

  const toggleHabitCompletion = useCallback(async (habitId: string) => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const { data: existingLogs } = await supabase
      .from('habit_logs')
      .select('id')
      .eq('habit_id', habitId)
      .eq('user_id', user.uid)
      .gte('completed_at', today.toISOString())
      .lte('completed_at', todayEnd.toISOString());

    if (existingLogs && existingLogs.length > 0) {
      await supabase
        .from('habit_logs')
        .delete()
        .eq('id', existingLogs[0].id);
    } else {
      await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, user_id: user.uid });
    }

    await recalculateStreak(habitId);
    await fetchHabits();
  }, [user, fetchHabits, recalculateStreak]);

  return {
    habits,
    loading,
    error,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
  };
};