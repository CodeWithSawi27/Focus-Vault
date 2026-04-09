import { useState, useEffect, useCallback, useMemo } from "react";
import * as Notifications from "expo-notifications";
import { supabase } from "@/src/services/supabase";
import { useToast } from "@/src/hooks/useToast";
import { useAuthStore } from "@/src/store/authStore";
import type { Habit } from "@/src/types";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface TodayStats {
  habitsCompleted: number;
  totalHabits: number;
  longestStreak: number;
  focusMinutesToday: number;
  sessionsThisWeek: number;
}

export interface LastSession {
  duration: number;
  started_at: string;
  category: string | null;
  notes: string | null;
}

export interface WeeklySummary {
  thisWeekMinutes: number;
  lastWeekMinutes: number;
  thisWeekSessions: number;
  lastWeekSessions: number;
  thisWeekHabitsCompleted: number;
  lastWeekHabitsCompleted: number;
}

export interface NextReminder {
  title: string;
  body: string;
  nextFireDate: Date;
}

interface DashboardData {
  greeting: string;
  formattedDate: string;
  habitsToday: Habit[];
  completedToday: Set<string>;
  todayStats: TodayStats;
  lastSession: LastSession | null;
  longestStreak: number;
  weeklySummary: WeeklySummary;
  nextReminder: NextReminder | null;
  loading: boolean;
  toggleHabit: (habitId: string) => Promise<void>;
  refresh: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const getFormattedDate = (): string =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

const getTodayKey = (): string => new Date().toISOString().split("T")[0];

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
const getWeekStart = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};
const getLastWeekStart = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() - 7);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};
const getLastWeekEnd = (): string => getWeekStart();

const isHabitScheduledToday = (habit: Habit): boolean => {
  if (habit.frequency === "daily") return true;
  if (habit.frequency === "weekly") return new Date().getDay() === 1;
  return true;
};

const getNextFireDate = (trigger: any): Date | null => {
  if (!trigger) return null;
  try {
    if (trigger.hour !== undefined && trigger.minute !== undefined) {
      const now = new Date();
      const next = new Date();
      next.setHours(trigger.hour, trigger.minute, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      return next;
    }
    if (trigger.value) return new Date(trigger.value);
    if (trigger.date) return new Date(trigger.date);
  } catch {}
  return null;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useDashboard = (): DashboardData => {
  const { user } = useAuthStore();
  const toast = useToast();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [focusMinutes, setFocusMinutes] = useState(0);
  const [sessionsThisWeek, setSessionsThisWeek] = useState(0);
  const [lastSession, setLastSession] = useState<LastSession | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary>({
    thisWeekMinutes: 0,
    lastWeekMinutes: 0,
    thisWeekSessions: 0,
    lastWeekSessions: 0,
    thisWeekHabitsCompleted: 0,
    lastWeekHabitsCompleted: 0,
  });
  const [nextReminder, setNextReminder] = useState<NextReminder | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── Fetch next scheduled reminder ────────────────────────────────────────
  const fetchNextReminder = useCallback(async () => {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      if (!scheduled.length) return;

      const withDates = scheduled
        .map((n) => ({
          notification: n,
          nextFireDate: getNextFireDate(n.trigger),
        }))
        .filter((x) => x.nextFireDate !== null)
        .sort((a, b) => a.nextFireDate!.getTime() - b.nextFireDate!.getTime());

      if (withDates.length > 0) {
        const next = withDates[0];
        setNextReminder({
          title: next.notification.content.title ?? "Habit Reminder",
          body: next.notification.content.body ?? "",
          nextFireDate: next.nextFireDate!,
        });
      }
    } catch (e) {
      console.warn("fetchNextReminder error:", e);
    }
  }, []);

  // ─── Main fetch ───────────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const todayStart = getTodayStart();
    const todayEnd = getTodayEnd();
    const weekStart = getWeekStart();
    const lastWkStart = getLastWeekStart();
    const lastWkEnd = getLastWeekEnd();

    const [
      habitsRes,
      logsRes,
      focusRes,
      lastSessionRes,
      lastWeekFocusRes,
      lastWeekLogsRes,
    ] = await Promise.all([
      supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.uid)
        .order("created_at", { ascending: true }),

      supabase
        .from("habit_logs")
        .select("habit_id")
        .eq("user_id", user.uid)
        .gte("completed_at", todayStart)
        .lte("completed_at", todayEnd),

      supabase
        .from("focus_sessions")
        .select("duration, started_at")
        .eq("user_id", user.uid)
        .eq("completed", true)
        .gte("started_at", weekStart),

      supabase
        .from("focus_sessions")
        .select("duration, started_at, category, notes")
        .eq("user_id", user.uid)
        .eq("completed", true)
        .order("started_at", { ascending: false })
        .limit(1)
        .single(),

      supabase
        .from("focus_sessions")
        .select("duration")
        .eq("user_id", user.uid)
        .eq("completed", true)
        .gte("started_at", lastWkStart)
        .lt("started_at", lastWkEnd),

      supabase
        .from("habit_logs")
        .select("habit_id")
        .eq("user_id", user.uid)
        .gte("completed_at", lastWkStart)
        .lt("completed_at", lastWkEnd),
    ]);

    if (habitsRes.data) setHabits(habitsRes.data as Habit[]);

    if (logsRes.data) {
      setCompletedIds(new Set(logsRes.data.map((l) => l.habit_id)));
    }

    if (focusRes.data) {
      const todayKey = getTodayKey();
      const todayMins = focusRes.data
        .filter((s) => s.started_at.startsWith(todayKey))
        .reduce((sum, s) => sum + Math.floor(s.duration / 60), 0);
      const weekMins = focusRes.data.reduce(
        (sum, s) => sum + Math.floor(s.duration / 60),
        0,
      );
      setFocusMinutes(todayMins);
      setSessionsThisWeek(focusRes.data.length);

      const lastWkMins = (lastWeekFocusRes.data ?? []).reduce(
        (sum, s) => sum + Math.floor(s.duration / 60),
        0,
      );
      setWeeklySummary((prev) => ({
        ...prev,
        thisWeekMinutes: weekMins,
        thisWeekSessions: focusRes.data!.length,
        lastWeekMinutes: lastWkMins,
        lastWeekSessions: lastWeekFocusRes.data?.length ?? 0,
        lastWeekHabitsCompleted: lastWeekLogsRes.data?.length ?? 0,
      }));
    }

    if (lastSessionRes.data) {
      setLastSession(lastSessionRes.data as LastSession);
    }

    await fetchNextReminder();
    setLoading(false);
  }, [user, fetchNextReminder]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ─── Optimistic toggle ────────────────────────────────────────────────────
  const toggleHabit = useCallback(
    async (habitId: string) => {
      if (!user) return;
      const wasCompleted = completedIds.has(habitId);

      setCompletedIds((prev) => {
        const next = new Set(prev);
        wasCompleted ? next.delete(habitId) : next.add(habitId);
        return next;
      });

      setWeeklySummary((prev) => ({
        ...prev,
        thisWeekHabitsCompleted: wasCompleted
          ? Math.max(0, prev.thisWeekHabitsCompleted - 1)
          : prev.thisWeekHabitsCompleted + 1,
      }));

      if (wasCompleted) {
        const { error } = await supabase
          .from("habit_logs")
          .delete()
          .eq("habit_id", habitId)
          .eq("user_id", user.uid)
          .gte("completed_at", getTodayStart())
          .lte("completed_at", getTodayEnd());

        if (error) {
          // Rollback
          setCompletedIds((prev) => {
            const n = new Set(prev);
            n.add(habitId);
            return n;
          });
          setWeeklySummary((prev) => ({
            ...prev,
            thisWeekHabitsCompleted: prev.thisWeekHabitsCompleted + 1,
          }));
          toast.error("Could not update habit. Please try again.");
        }
      } else {
        const { error } = await supabase
          .from("habit_logs")
          .insert({ habit_id: habitId, user_id: user.uid });

        if (error) {
          // Rollback
          setCompletedIds((prev) => {
            const n = new Set(prev);
            n.delete(habitId);
            return n;
          });
          setWeeklySummary((prev) => ({
            ...prev,
            thisWeekHabitsCompleted: Math.max(
              0,
              prev.thisWeekHabitsCompleted - 1,
            ),
          }));
          toast.error("Could not update habit. Please try again.");
        }
      }
    },
    [user, completedIds, toast],
  );

  // ─── Derived ──────────────────────────────────────────────────────────────
  const habitsToday = useMemo(
    () => habits.filter(isHabitScheduledToday),
    [habits],
  );

  const longestStreak = useMemo(
    () => (habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0),
    [habits],
  );

  const todayStats = useMemo<TodayStats>(
    () => ({
      habitsCompleted: habitsToday.filter((h) => completedIds.has(h.id)).length,
      totalHabits: habitsToday.length,
      longestStreak,
      focusMinutesToday: focusMinutes,
      sessionsThisWeek: sessionsThisWeek,
    }),
    [habitsToday, completedIds, longestStreak, focusMinutes, sessionsThisWeek],
  );

  return {
    greeting: getGreeting(),
    formattedDate: getFormattedDate(),
    habitsToday,
    completedToday: completedIds,
    todayStats,
    lastSession,
    longestStreak,
    weeklySummary,
    nextReminder,
    loading,
    toggleHabit,
    refresh: fetchDashboard,
  };
};
