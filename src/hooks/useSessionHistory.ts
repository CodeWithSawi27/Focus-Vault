import { useState, useCallback } from 'react';
import { supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/authStore';
import type { SessionCategoryId } from '@/src/constants/categories';

export interface FocusSessionRecord {
  id: string;
  duration: number;
  completed: boolean;
  category: SessionCategoryId | null;
  notes: string | null;
  pause_count: number;
  started_at: string;
  ended_at: string | null;
}

export const useSessionHistory = () => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<FocusSessionRecord[]>([]);
  const [loading, setLoading]   = useState(false);

  const fetchHistory = useCallback(async (limit = 10) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('id, duration, completed, category, notes, pause_count, started_at, ended_at')
        .eq('user_id', user.uid)
        .eq('completed', true)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (!error && data) setSessions(data as FocusSessionRecord[]);
    } catch (e) {
      console.error('fetchHistory error:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { sessions, loading, fetchHistory };
};