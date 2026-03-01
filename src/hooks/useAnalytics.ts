import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/authStore';
import type { Habit } from '@/src/types';

export interface ChartPoint {
  x: string;
  y: number;
}

export interface AnalyticsSummary {
  totalFocusMinutes: number;
  totalSessions: number;
  avgCompletionRate: number;
  totalHabitsCompleted: number;
}

export interface AnalyticsData {
  habitsByDay: ChartPoint[];
  focusByDay: ChartPoint[];
  completionRate: ChartPoint[];
  streaks: Habit[];
  summary: AnalyticsSummary;
  loading: boolean;
  refresh: () => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getLast7Days = (): Date[] => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
};

const getLast30Days = (): Date[] => {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
};

const toDateKey = (date: Date): string =>
  date.toISOString().split('T')[0];

const toShortLabel = (date: Date): string =>
  DAY_LABELS[date.getDay()];

const toShortMonthLabel = (date: Date): string => {
  const month = date.toLocaleString('en-US', { month: 'short' });
  return `${month} ${date.getDate()}`;
};

export const useAnalytics = (): AnalyticsData => {
  const { user } = useAuthStore();
  const [habitLogs, setHabitLogs]       = useState<{ completed_at: string }[]>([]);
  const [focusSessions, setFocusSessions] = useState<{ duration: number; started_at: string; completed: boolean }[]>([]);
  const [habits, setHabits]             = useState<Habit[]>([]);
  const [totalHabitsCount, setTotalHabitsCount] = useState(0);
  const [loading, setLoading]           = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [logsRes, focusRes, habitsRes] = await Promise.all([
      supabase
        .from('habit_logs')
        .select('completed_at')
        .eq('user_id', user.uid)
        .gte('completed_at', thirtyDaysAgo.toISOString()),

      supabase
        .from('focus_sessions')
        .select('duration, started_at, completed')
        .eq('user_id', user.uid)
        .eq('completed', true)
        .gte('started_at', thirtyDaysAgo.toISOString()),

      supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.uid)
        .order('longest_streak', { ascending: false }),
    ]);

    if (logsRes.data)   setHabitLogs(logsRes.data);
    if (focusRes.data)  setFocusSessions(focusRes.data);
    if (habitsRes.data) {
      setHabits(habitsRes.data as Habit[]);
      setTotalHabitsCount(habitsRes.data.length);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // ─── Derived: habits completed per day (last 7) ───────────────────────────
  const habitsByDay = useMemo<ChartPoint[]>(() => {
    const last7 = getLast7Days();
    const countMap: Record<string, number> = {};

    habitLogs.forEach(log => {
      const key = toDateKey(new Date(log.completed_at));
      countMap[key] = (countMap[key] ?? 0) + 1;
    });

    return last7.map(day => ({
      x: toShortLabel(day),
      y: countMap[toDateKey(day)] ?? 0,
    }));
  }, [habitLogs]);

  // ─── Derived: focus minutes per day (last 7) ─────────────────────────────
  const focusByDay = useMemo<ChartPoint[]>(() => {
    const last7 = getLast7Days();
    const minuteMap: Record<string, number> = {};

    focusSessions.forEach(session => {
      const key = toDateKey(new Date(session.started_at));
      minuteMap[key] = (minuteMap[key] ?? 0) + Math.floor(session.duration / 60);
    });

    return last7.map(day => ({
      x: toShortLabel(day),
      y: minuteMap[toDateKey(day)] ?? 0,
    }));
  }, [focusSessions]);

  // ─── Derived: completion rate % per day (last 30) ────────────────────────
  const completionRate = useMemo<ChartPoint[]>(() => {
    if (totalHabitsCount === 0) return [];
    const last30 = getLast30Days();
    const countMap: Record<string, number> = {};

    habitLogs.forEach(log => {
      const key = toDateKey(new Date(log.completed_at));
      countMap[key] = (countMap[key] ?? 0) + 1;
    });

    return last30.map(day => ({
      x: toShortMonthLabel(day),
      y: Math.min(
        Math.round(((countMap[toDateKey(day)] ?? 0) / totalHabitsCount) * 100),
        100
      ),
    }));
  }, [habitLogs, totalHabitsCount]);

  // ─── Derived: summary stats ───────────────────────────────────────────────
  const summary = useMemo<AnalyticsSummary>(() => {
    const totalFocusMinutes = focusSessions.reduce(
      (sum, s) => sum + Math.floor(s.duration / 60), 0
    );
    const totalSessions = focusSessions.length;
    const totalHabitsCompleted = habitLogs.length;

    const avgCompletionRate = totalHabitsCount > 0 && completionRate.length > 0
      ? Math.round(
          completionRate.reduce((sum, p) => sum + p.y, 0) / completionRate.length
        )
      : 0;

    return {
      totalFocusMinutes,
      totalSessions,
      avgCompletionRate,
      totalHabitsCompleted,
    };
  }, [focusSessions, habitLogs, totalHabitsCount, completionRate]);

  // ─── Derived: streaks leaderboard ────────────────────────────────────────
  const streaks = useMemo<Habit[]>(() => {
    return [...habits].sort((a, b) => b.longest_streak - a.longest_streak).slice(0, 5);
  }, [habits]);

  return {
    habitsByDay,
    focusByDay,
    completionRate,
    streaks,
    summary,
    loading,
    refresh: fetchAnalytics,
  };
};