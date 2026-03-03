import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/authStore';

const GOAL_KEY = 'focusvault:weeklyGoalMinutes';
const DEFAULT_GOAL = 600; // 10 hours

const getWeekStart = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay()); // Sunday
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

export const useWeeklyGoal = () => {
  const { user } = useAuthStore();
  const [goalMinutes, setGoalMinutes]           = useState(DEFAULT_GOAL);
  const [completedMinutes, setCompletedMinutes] = useState(0);
  const [loading, setLoading]                   = useState(false);

  const fetchGoalData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Load saved goal from AsyncStorage
      const stored = await AsyncStorage.getItem(GOAL_KEY);
      const goal   = stored ? parseInt(stored, 10) : DEFAULT_GOAL;
      setGoalMinutes(goal);

      // Fetch this week's completed sessions
      const { data } = await supabase
        .from('focus_sessions')
        .select('duration')
        .eq('user_id', user.uid)
        .eq('completed', true)
        .gte('started_at', getWeekStart());

      const mins = (data ?? []).reduce(
        (acc, s) => acc + Math.floor(s.duration / 60),
        0
      );
      setCompletedMinutes(mins);
    } catch (e) {
      console.error('fetchGoalData error:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateGoal = useCallback(async (minutes: number) => {
    const clamped = Math.max(30, Math.min(3000, minutes));
    await AsyncStorage.setItem(GOAL_KEY, String(clamped));
    setGoalMinutes(clamped);
  }, []);

  const progress = goalMinutes > 0
    ? Math.min(completedMinutes / goalMinutes, 1)
    : 0;

  return {
    goalMinutes,
    completedMinutes,
    progress,
    loading,
    fetchGoalData,
    updateGoal,
  };
};