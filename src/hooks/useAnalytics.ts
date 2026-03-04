import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { SESSION_CATEGORIES, getCategoryById } from '@/src/constants/categories';
import type { Habit } from '@/src/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AnalyticsPeriod = 'week' | 'month';

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

export interface CategoryPoint {
  id: string;
  label: string;
  emoji: string;
  minutes: number;
  color: string;
  percentage: number;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface AnalyticsData {
  period: AnalyticsPeriod;
  setPeriod: (p: AnalyticsPeriod) => void;
  habitsByDay: ChartPoint[];
  focusByDay: ChartPoint[];
  completionRate: ChartPoint[];
  categoryBreakdown: CategoryPoint[];
  bestDayData: ChartPoint[];
  heatmapData: HeatmapDay[];
  streaks: Habit[];
  summary: AnalyticsSummary;
  loading: boolean;
  refresh: () => void;
}

// ─── Category colours ─────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  deep_work:  '#1A1A1A',
  study:      '#0A84FF',
  exercise:   '#30D158',
  reading:    '#FF9F0A',
  meditation: '#BF5AF2',
  creative:   '#FF375F',
  planning:   '#32ADE6',
  other:      '#8E8E93',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_LABELS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const toDateKey    = (d: Date) => d.toISOString().split('T')[0];
const toShortLabel = (d: Date) => DAY_LABELS[d.getDay()];
const toShortMonth = (d: Date) =>
  d.toLocaleString('en-US', { month: 'short', day: 'numeric' });

const getLastNDays = (n: number): Date[] =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

// Aggregate 30 daily points into 4 weekly buckets
const aggregateWeekly = (dailyPoints: ChartPoint[]): ChartPoint[] => {
  const buckets: ChartPoint[] = [
    { x: 'Week 1', y: 0 },
    { x: 'Week 2', y: 0 },
    { x: 'Week 3', y: 0 },
    { x: 'Week 4', y: 0 },
  ];
  dailyPoints.forEach((pt, i) => {
    const bucket = Math.min(Math.floor(i / 7), 3);
    buckets[bucket].y += pt.y;
  });
  // For completion rate (%) — average instead of sum
  return buckets;
};

const aggregateWeeklyAvg = (dailyPoints: ChartPoint[]): ChartPoint[] => {
  const buckets = [
    { x: 'Week 1', y: 0, count: 0 },
    { x: 'Week 2', y: 0, count: 0 },
    { x: 'Week 3', y: 0, count: 0 },
    { x: 'Week 4', y: 0, count: 0 },
  ];
  dailyPoints.forEach((pt, i) => {
    const b = Math.min(Math.floor(i / 7), 3);
    buckets[b].y += pt.y;
    buckets[b].count += 1;
  });
  return buckets.map(b => ({
    x: b.x,
    y: b.count > 0 ? Math.round(b.y / b.count) : 0,
  }));
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAnalytics = (): AnalyticsData => {
  const { user } = useAuthStore();

  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const [habitLogs, setHabitLogs]       = useState<{ completed_at: string }[]>([]);
  const [focusSessions, setFocusSessions] = useState<{
    duration: number;
    started_at: string;
    category: string | null;
  }[]>([]);
  const [habits, setHabits]             = useState<Habit[]>([]);
  const [totalHabitsCount, setTotalHabitsCount] = useState(0);
  const [loading, setLoading]           = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Always fetch 30 days — derive week subset in memos
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
        .select('duration, started_at, category')
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

  // ─── Habits per day ───────────────────────────────────────────────────────
  const habitsByDay = useMemo<ChartPoint[]>(() => {
    const days = period === 'week' ? getLastNDays(7) : getLastNDays(30);
    const countMap: Record<string, number> = {};
    habitLogs.forEach(log => {
      const key = toDateKey(new Date(log.completed_at));
      countMap[key] = (countMap[key] ?? 0) + 1;
    });
    const daily = days.map(d => ({
      x: period === 'week' ? toShortLabel(d) : toShortMonth(d),
      y: countMap[toDateKey(d)] ?? 0,
    }));
    return period === 'month' ? aggregateWeekly(daily) : daily;
  }, [habitLogs, period]);

  // ─── Focus minutes per day ────────────────────────────────────────────────
  const focusByDay = useMemo<ChartPoint[]>(() => {
    const days = period === 'week' ? getLastNDays(7) : getLastNDays(30);
    const minuteMap: Record<string, number> = {};
    focusSessions.forEach(s => {
      const key = toDateKey(new Date(s.started_at));
      minuteMap[key] = (minuteMap[key] ?? 0) + Math.floor(s.duration / 60);
    });
    const daily = days.map(d => ({
      x: period === 'week' ? toShortLabel(d) : toShortMonth(d),
      y: minuteMap[toDateKey(d)] ?? 0,
    }));
    return period === 'month' ? aggregateWeekly(daily) : daily;
  }, [focusSessions, period]);

  // ─── Completion rate % ────────────────────────────────────────────────────
  const completionRate = useMemo<ChartPoint[]>(() => {
    if (totalHabitsCount === 0) return [];
    const days = period === 'week' ? getLastNDays(7) : getLastNDays(30);
    const countMap: Record<string, number> = {};
    habitLogs.forEach(log => {
      const key = toDateKey(new Date(log.completed_at));
      countMap[key] = (countMap[key] ?? 0) + 1;
    });
    const daily = days.map(d => ({
      x: period === 'week' ? toShortLabel(d) : toShortMonth(d),
      y: Math.min(
        Math.round(((countMap[toDateKey(d)] ?? 0) / totalHabitsCount) * 100),
        100
      ),
    }));
    return period === 'month' ? aggregateWeeklyAvg(daily) : daily;
  }, [habitLogs, totalHabitsCount, period]);

  // ─── Category breakdown ───────────────────────────────────────────────────
  const categoryBreakdown = useMemo<CategoryPoint[]>(() => {
    const minuteMap: Record<string, number> = {};
    focusSessions.forEach(s => {
      const key = s.category ?? 'other';
      minuteMap[key] = (minuteMap[key] ?? 0) + Math.floor(s.duration / 60);
    });

    const totalMins = Object.values(minuteMap).reduce((a, b) => a + b, 0);
    if (totalMins === 0) return [];

    return Object.entries(minuteMap)
      .map(([id, minutes]) => {
        const cat = getCategoryById(id);
        return {
          id,
          label:      cat?.label   ?? 'Other',
          emoji:      cat?.emoji   ?? '⚡',
          minutes,
          color:      CATEGORY_COLORS[id] ?? '#8E8E93',
          percentage: Math.round((minutes / totalMins) * 100),
        };
      })
      .sort((a, b) => b.minutes - a.minutes);
  }, [focusSessions]);

  // ─── Best day of week ─────────────────────────────────────────────────────
  const bestDayData = useMemo<ChartPoint[]>(() => {
    const habitScore: number[] = new Array(7).fill(0);
    const focusScore: number[] = new Array(7).fill(0);

    habitLogs.forEach(log => {
      habitScore[new Date(log.completed_at).getDay()] += 1;
    });
    focusSessions.forEach(s => {
      focusScore[new Date(s.started_at).getDay()] +=
        Math.floor(s.duration / 60);
    });

    // Normalize focus to 0-10 scale, combine with habit count
    const maxFocus = Math.max(...focusScore, 1);
    return DAY_LABELS.map((label, i) => ({
      x: label,
      y: habitScore[i] + Math.round((focusScore[i] / maxFocus) * 10),
    }));
  }, [habitLogs, focusSessions]);

  // ─── Monthly heatmap (last 35 days) ──────────────────────────────────────
  const heatmapData = useMemo<HeatmapDay[]>(() => {
    const days = getLastNDays(35);
    const countMap: Record<string, number> = {};

    habitLogs.forEach(log => {
      const key = toDateKey(new Date(log.completed_at));
      countMap[key] = (countMap[key] ?? 0) + 1;
    });
    focusSessions.forEach(s => {
      const key = toDateKey(new Date(s.started_at));
      countMap[key] = (countMap[key] ?? 0) + 1;
    });

    const maxCount = Math.max(...Object.values(countMap), 1);

    return days.map(d => {
      const key   = toDateKey(d);
      const count = countMap[key] ?? 0;
      const ratio = count / maxCount;
      const level = count === 0 ? 0
        : ratio < 0.25 ? 1
        : ratio < 0.5  ? 2
        : ratio < 0.75 ? 3
        : 4;
      return { date: key, count, level: level as HeatmapDay['level'] };
    });
  }, [habitLogs, focusSessions]);

  // ─── Summary ──────────────────────────────────────────────────────────────
  const summary = useMemo<AnalyticsSummary>(() => {
    const totalFocusMinutes = focusSessions.reduce(
      (sum, s) => sum + Math.floor(s.duration / 60), 0
    );
    const avgCompletionRate =
      totalHabitsCount > 0 && completionRate.length > 0
        ? Math.round(
            completionRate.reduce((s, p) => s + p.y, 0) / completionRate.length
          )
        : 0;
    return {
      totalFocusMinutes,
      totalSessions:        focusSessions.length,
      avgCompletionRate,
      totalHabitsCompleted: habitLogs.length,
    };
  }, [focusSessions, habitLogs, totalHabitsCount, completionRate]);

  // ─── Streaks leaderboard ──────────────────────────────────────────────────
  const streaks = useMemo<Habit[]>(
    () => [...habits]
      .sort((a, b) => b.longest_streak - a.longest_streak)
      .slice(0, 5),
    [habits]
  );

  return {
    period, setPeriod,
    habitsByDay, focusByDay, completionRate,
    categoryBreakdown, bestDayData, heatmapData,
    streaks, summary, loading,
    refresh: fetchAnalytics,
  };
};