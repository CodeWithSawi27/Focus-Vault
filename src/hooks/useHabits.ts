import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { useHabitStore } from '@/src/store/habitStore';
import { calculateStreak } from '@/src/utils/streakCalculator';
import type { Habit } from '@/src/types';

export interface CreateHabitPayload {
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  reminderTime?: string;
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
    const { error: insertError } = await supabase.from('habits').insert({
      user_id: user.uid,
      name: payload.name.trim(),
      description: payload.description?.trim() ?? null,
      frequency: payload.frequency,
    });
    if (insertError) throw new Error(insertError.message);
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
      })
      .eq('id', habitId);
    if (updateError) throw new Error(updateError.message);
    await fetchHabits();
  }, [fetchHabits]);

  const deleteHabit = useCallback(async (habitId: string) => {
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
      .select('longest_streak')
      .eq('id', habitId)
      .single();

    const currentLongest = (habitData as Pick<Habit, 'longest_streak'> | null)?.longest_streak ?? 0;

    await supabase
      .from('habits')
      .update({
        streak,
        longest_streak: Math.max(streak, currentLongest),
      })
      .eq('id', habitId);
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