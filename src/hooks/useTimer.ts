import { useEffect, useRef, useCallback } from 'react';
import { AppState, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { useTimerStore } from '@/src/store/timerStore';
import { supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/authStore';

export const PRESETS = [
  { label: '25 min', seconds: 25 * 60 },
  { label: '50 min', seconds: 50 * 60 },
  { label: '90 min', seconds: 90 * 60 },
] as const;

const TIMER_SOUND = require('@/assets/sounds/timer-complete.mp3');

export const useTimer = () => {
  const { user } = useAuthStore();
  const {
    duration, elapsed, status,
    setDuration, setElapsed, setStatus, reset,
  } = useTimerStore();

  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const appStateRef  = useRef(AppState.currentState);
  const pulseAnim    = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const soundRef     = useRef<Audio.Sound | null>(null);

  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  const remaining = Math.max(duration - elapsed, 0);
  const progress  = duration > 0 ? elapsed / duration : 0;

  // ─── Audio ────────────────────────────────────────────────────────────────

  const playCompletionSound = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      const { sound } = await Audio.Sound.createAsync(
        TIMER_SOUND,
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      soundRef.current = sound;
    } catch (e) {
      console.warn('Timer sound failed:', e);
    }
  }, []);

  const stopCompletionSound = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {
        console.warn('Failed to stop timer sound:', e);
      } finally {
        soundRef.current = null;
      }
    }
  }, []);

  // ─── Animation ────────────────────────────────────────────────────────────

  const startPulse = useCallback(() => {
    pulseLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.012,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoopRef.current.start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    pulseLoopRef.current?.stop();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [pulseAnim]);

  // ─── Timer core ───────────────────────────────────────────────────────────

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const createSession = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({ user_id: user.uid, duration, completed: false })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Failed to create focus session:', error.message);
      return;
    }
    if (data) {
      sessionIdRef.current = data.id;
      console.log('✅ Focus session created:', data.id);
    }
  }, [user, duration]);

  const runTick = useCallback((dur: number) => {
    intervalRef.current = setInterval(async () => {
      const newElapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);

      if (newElapsed >= dur) {
        setElapsed(dur);
        setStatus('completed');
        clearTimer();
        stopPulse();

        if (sessionIdRef.current) {
          const { error } = await supabase
            .from('focus_sessions')
            .update({
              completed: true,
              ended_at: new Date().toISOString(),
            })
            .eq('id', sessionIdRef.current);

          if (error) {
            console.error('❌ Failed to save completed session:', error.message);
          } else {
            console.log('✅ Focus session completed & saved:', sessionIdRef.current);
          }
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        playCompletionSound();

      } else {
        setElapsed(newElapsed);
        if (newElapsed % 300 === 0 && newElapsed > 0) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    }, 500);
  }, [clearTimer, stopPulse, setElapsed, setStatus, playCompletionSound]);

  // ─── Public controls ──────────────────────────────────────────────────────

  const start = useCallback(async () => {
    await createSession();
    setStatus('running');
    startTimeRef.current = Date.now() - elapsed * 1000;
    startPulse();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    runTick(duration);
  }, [duration, elapsed, createSession, setStatus, startPulse, runTick]);

  const pause = useCallback(() => {
    clearTimer();
    stopPulse();
    setStatus('paused');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [clearTimer, stopPulse, setStatus]);

  const resume = useCallback(() => {
    setStatus('running');
    startTimeRef.current = Date.now() - elapsed * 1000;
    startPulse();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    runTick(duration);
  }, [duration, elapsed, setStatus, startPulse, runTick]);

  const stop = useCallback(async () => {
    clearTimer();
    stopPulse();
    await stopCompletionSound();

    if (statusRef.current !== 'completed' && sessionIdRef.current) {
      const { error } = await supabase
        .from('focus_sessions')
        .update({
          completed: false,
          ended_at: new Date().toISOString(),
        })
        .eq('id', sessionIdRef.current);

      if (error) {
        console.error('❌ Failed to save stopped session:', error.message);
      } else {
        console.log('✅ Focus session stopped & saved:', sessionIdRef.current);
      }
    }

    sessionIdRef.current = null;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
  }, [clearTimer, stopPulse, stopCompletionSound, reset]);

  const selectPreset = useCallback((seconds: number) => {
    if (status !== 'idle') return;
    setDuration(seconds);
    Haptics.selectionAsync();
  }, [status, setDuration]);

  const setCustomDuration = useCallback((minutes: number) => {
    if (status !== 'idle') return;
    const clamped = Math.max(1, Math.min(180, minutes));
    setDuration(clamped * 60);
    Haptics.selectionAsync();
  }, [status, setDuration]);

  // ─── Side effects ─────────────────────────────────────────────────────────

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (
        appStateRef.current === 'active' &&
        next.match(/inactive|background/) &&
        statusRef.current === 'running'
      ) {
        pause();
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [pause]);

  useEffect(() => {
    return () => {
      clearTimer();
      stopPulse();
      stopCompletionSound();
    };
  }, [clearTimer, stopPulse, stopCompletionSound]);

  return {
    duration,
    elapsed,
    remaining,
    progress,
    status,
    pulseAnim,
    start,
    pause,
    resume,
    stop,
    selectPreset,
    setCustomDuration,
    PRESETS,
  };
};