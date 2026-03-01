import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/authStore';
import type { Habit } from '@/src/types';

interface TodayStats {
  habitsCompleted: number;
  totalHabits: number;
  longestStreak: number;
  focusMinutesToday: number;
  sessionsThisWeek: number;
}

interface LastSession {
  duration: number;
  started_at: string;
}

interface DashboardData {
  greeting: string;
  formattedDate: string;
  habitsToday: Habit[];
  completedToday: Set<string>;
  todayStats: TodayStats;
  lastSession: LastSession | null;
  longestStreak: number;
  loading: boolean;
  toggleHabit: (habitId: string) => Promise<void>;
  refresh: () => void;
}

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const getFormattedDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

const getTodayKey = (): string =>
  new Date().toISOString().split('T')[0];

const getWeekStart = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const getTodayStart = (): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const getTodayEnd = (): string => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
};

// Determine if a habit should appear today based on frequency
const isHabitScheduledToday = (habit: Habit): boolean => {
  if (habit.frequency === 'daily') return true;
  // Weekly habits show on Monday
  if (habit.frequency === 'weekly') return new Date().getDay() === 1;
  return true;
};

export const useDashboard = (): DashboardData => {
  const { user } = useAuthStore();

  const [habits, setHabits]                 = useState<Habit[]>([]);
  const [completedIds, setCompletedIds]     = useState<Set<string>>(new Set());
  const [focusMinutes, setFocusMinutes]     = useState(0);
  const [sessionsThisWeek, setSessionsThisWeek] = useState(0);
  const [lastSession, setLastSession]       = useState<LastSession | null>(null);
  const [loading, setLoading]               = useState(true);

  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const todayStart = getTodayStart();
    const todayEnd   = getTodayEnd();
    const weekStart  = getWeekStart();

    const [habitsRes, logsRes, focusRes, lastSessionRes] = await Promise.all([
      supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: true }),

      supabase
        .from('habit_logs')
        .select('habit_id')
        .eq('user_id', user.uid)
        .gte('completed_at', todayStart)
        .lte('completed_at', todayEnd),

      supabase
        .from('focus_sessions')
        .select('duration, started_at')
        .eq('user_id', user.uid)
        .eq('completed', true)
        .gte('started_at', weekStart),

      supabase
        .from('focus_sessions')
        .select('duration, started_at')
        .eq('user_id', user.uid)
        .eq('completed', true)
        .order('started_at', { ascending: false })
        .limit(1)
        .single(),
    ]);

    if (habitsRes.data) setHabits(habitsRes.data as Habit[]);

    if (logsRes.data) {
      setCompletedIds(new Set(logsRes.data.map(l => l.habit_id)));
    }

    if (focusRes.data) {
      const todayKey = getTodayKey();
      const todayMinutes = focusRes.data
        .filter(s => s.started_at.startsWith(todayKey))
        .reduce((sum, s) => sum + Math.floor(s.duration / 60), 0);

      setFocusMinutes(todayMinutes);
      setSessionsThisWeek(focusRes.data.length);
    }

    if (lastSessionRes.data) {
      setLastSession(lastSessionRes.data);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // Optimistic toggle
  const toggleHabit = useCallback(async (habitId: string) => {
    if (!user) return;

    const wasCompleted = completedIds.has(habitId);

    // Optimistic update
    setCompletedIds(prev => {
      const next = new Set(prev);
      wasCompleted ? next.delete(habitId) : next.add(habitId);
      return next;
    });

    if (wasCompleted) {
      const todayStart = getTodayStart();
      const todayEnd   = getTodayEnd();
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('user_id', user.uid)
        .gte('completed_at', todayStart)
        .lte('completed_at', todayEnd);

      if (error) {
        // Revert
        setCompletedIds(prev => { const n = new Set(prev); n.add(habitId); return n; });
        Alert.alert('Error', 'Could not update habit. Try again.');
      }
    } else {
      const { error } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, user_id: user.uid });

      if (error) {
        // Revert
        setCompletedIds(prev => { const n = new Set(prev); n.delete(habitId); return n; });
        Alert.alert('Error', 'Could not update habit. Try again.');
      }
    }
  }, [user, completedIds]);

  // ─── Derived ──────────────────────────────────────────────────────────────

  const habitsToday = useMemo(
    () => habits.filter(isHabitScheduledToday),
    [habits]
  );

  const longestStreak = useMemo(
    () => habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0,
    [habits]
  );

  const todayStats = useMemo<TodayStats>(() => ({
    habitsCompleted: habitsToday.filter(h => completedIds.has(h.id)).length,
    totalHabits: habitsToday.length,
    longestStreak,
    focusMinutesToday: focusMinutes,
    sessionsThisWeek,
  }), [habitsToday, completedIds, longestStreak, focusMinutes, sessionsThisWeek]);

  return {
    greeting: getGreeting(),
    formattedDate: getFormattedDate(),
    habitsToday,
    completedToday: completedIds,
    todayStats,
    lastSession,
    longestStreak,
    loading,
    toggleHabit,
    refresh: fetchDashboard,
  };
};