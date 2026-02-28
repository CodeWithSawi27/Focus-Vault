import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/authStore';
import type { Habit } from '@/src/types';

interface DashboardData {
  todayHabits: Habit[];
  completedTodayIds: string[];
  totalFocusToday: number;
  currentStreak: number;
  completionRate: number;
  loading: boolean;
  refresh: () => void;
}

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
};

export const useDashboard = (): DashboardData => {
  const { user } = useAuthStore();
  const [todayHabits, setTodayHabits]           = useState<Habit[]>([]);
  const [completedTodayIds, setCompletedTodayIds] = useState<string[]>([]);
  const [totalFocusToday, setTotalFocusToday]   = useState(0);
  const [loading, setLoading]                   = useState(true);

  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { start, end } = getTodayRange();

    const [habitsRes, logsRes, focusRes] = await Promise.all([
      supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.uid)
        .eq('frequency', 'daily')
        .order('created_at', { ascending: true }),

      supabase
        .from('habit_logs')
        .select('habit_id')
        .eq('user_id', user.uid)
        .gte('completed_at', start)
        .lte('completed_at', end),

      supabase
        .from('focus_sessions')
        .select('duration')
        .eq('user_id', user.uid)
        .eq('completed', true)
        .gte('started_at', start)
        .lte('started_at', end),
    ]);

    if (habitsRes.data) setTodayHabits(habitsRes.data);
    if (logsRes.data)   setCompletedTodayIds(logsRes.data.map(l => l.habit_id));
    if (focusRes.data)  setTotalFocusToday(
      focusRes.data.reduce((sum, s) => sum + s.duration, 0)
    );

    setLoading(false);
  }, [user]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const currentStreak = todayHabits.length > 0
    ? Math.max(...todayHabits.map(h => h.streak), 0)
    : 0;

  const completionRate = todayHabits.length > 0
    ? Math.round((completedTodayIds.length / todayHabits.length) * 100)
    : 0;

  return {
    todayHabits,
    completedTodayIds,
    totalFocusToday,
    currentStreak,
    completionRate,
    loading,
    refresh: fetchDashboard,
  };
};