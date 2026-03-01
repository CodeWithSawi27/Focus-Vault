import { useState, useCallback } from 'react';
import { supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { logoutUser } from '@/src/services/authService';

interface ProfileStats {
  totalHabits: number;
  totalSessions: number;
  totalFocusMinutes: number;
  longestStreak: number;
}

export const useProfile = () => {
  const { user } = useAuthStore();
  const [stats, setStats]     = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [habitsRes, sessionsRes] = await Promise.all([
      supabase
        .from('habits')
        .select('longest_streak')
        .eq('user_id', user.uid),
      supabase
        .from('focus_sessions')
        .select('duration')
        .eq('user_id', user.uid)
        .eq('completed', true),
    ]);

    if (habitsRes.error || sessionsRes.error) {
      setError('Failed to load profile stats.');
      setLoading(false);
      return;
    }

    const habits   = habitsRes.data ?? [];
    const sessions = sessionsRes.data ?? [];

    setStats({
      totalHabits: habits.length,
      totalSessions: sessions.length,
      totalFocusMinutes: sessions.reduce((sum, s) => sum + Math.floor(s.duration / 60), 0),
      longestStreak: habits.length > 0
        ? Math.max(...habits.map(h => h.longest_streak))
        : 0,
    });

    setLoading(false);
  }, [user]);

  const logout = useCallback(async () => {
    await logoutUser();
  }, []);

  return { user, stats, loading, error, fetchStats, logout };
};