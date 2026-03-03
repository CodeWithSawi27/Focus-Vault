import { useState, useCallback } from 'react';
import {
  updatePassword,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
} from 'firebase/auth';
import { auth } from '@/src/services/firebase';
import { supabase } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/authStore';

interface UpdateProfilePayload {
  displayName?: string;
  avatarBase64?: string | null;
}

interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileStats {
  totalHabits: number;
  totalSessions: number;
  totalFocusMinutes: number;
  longestStreak: number;
}

export const useProfile = () => {
  // ✅ avatarBase64 now comes from global store
  const { user, setUser, clearUser, avatarBase64, setAvatarBase64 } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [stats, setStats]     = useState<ProfileStats | null>(null);

  // ─── Fetch lifetime stats + avatar ───────────────────────────────────────
  const fetchStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [habitsRes, sessionsRes, streakRes, userRes] = await Promise.all([
        supabase
          .from('habits')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.uid),

        supabase
          .from('focus_sessions')
          .select('duration_seconds')
          .eq('user_id', user.uid),

        supabase
          .from('habits')
          .select('longest_streak')
          .eq('user_id', user.uid)
          .order('longest_streak', { ascending: false })
          .limit(1),

        supabase
          .from('users')
          .select('avatar_base64, display_name')
          .eq('firebase_uid', user.uid)
          .single(),
      ]);

      const totalFocusMinutes = (sessionsRes.data ?? []).reduce(
        (acc, s) => acc + Math.floor((s.duration_seconds ?? 0) / 60),
        0
      );

      setStats({
        totalHabits:       habitsRes.count ?? 0,
        totalSessions:     sessionsRes.data?.length ?? 0,
        totalFocusMinutes,
        longestStreak:     streakRes.data?.[0]?.longest_streak ?? 0,
      });

      // ✅ Write to global store — all screens update instantly
      setAvatarBase64(userRes.data?.avatar_base64 ?? null);

    } catch (e) {
      console.error('fetchStats error:', e);
    } finally {
      setLoading(false);
    }
  }, [user, setAvatarBase64]);

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      clearUser(); // clears avatarBase64 too via store
    } catch (e) {
      console.error('logout error:', e);
    }
  }, [clearUser]);

  // ─── Update display name + avatar ─────────────────────────────────────────
  const updateProfileInfo = useCallback(async (
    payload: UpdateProfilePayload
  ) => {
    if (!user || !auth.currentUser) return;
    setLoading(true);
    setError(null);

    try {
      if (payload.displayName !== undefined) {
        await updateProfile(auth.currentUser, {
          displayName: payload.displayName,
        });

        const { data: nameData, error: nameError } = await supabase
          .from('users')
          .update({ display_name: payload.displayName })
          .eq('firebase_uid', user.uid)
          .select('id, display_name')
          .single();

        if (nameError) throw new Error(`Name save failed: ${nameError.message}`);
        if (!nameData) throw new Error('No user row found — firebase_uid mismatch.');
      }

      if (payload.avatarBase64 !== undefined && payload.avatarBase64 !== null) {
        const estimatedBytes = payload.avatarBase64.length * 0.75;
        if (estimatedBytes > 500_000) {
          throw new Error('Image is too large. Please choose a smaller photo or crop tighter.');
        }

        const { error: avatarError } = await supabase
          .from('users')
          .update({ avatar_base64: payload.avatarBase64 })
          .eq('firebase_uid', user.uid)
          .select('id')
          .single();

        if (avatarError) throw new Error(`Avatar save failed: ${avatarError.message}`);

        // ✅ Global store update — dashboard + edit screen update immediately
        setAvatarBase64(payload.avatarBase64);
      }

      if (payload.avatarBase64 === null) {
        await supabase
          .from('users')
          .update({ avatar_base64: null })
          .eq('firebase_uid', user.uid);

        setAvatarBase64(null); // ✅ clears globally
      }

      const { data: freshUser, error: fetchError } = await supabase
        .from('users')
        .select('firebase_uid, email, display_name, avatar_base64')
        .eq('firebase_uid', user.uid)
        .single();

      if (fetchError) throw new Error(fetchError.message);
      if (freshUser) setUser(Object.assign(auth.currentUser!, {
        supabaseData: freshUser,
      }) as any);

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Update failed.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [user, setUser, setAvatarBase64]);

  // ─── Change password ──────────────────────────────────────────────────────
  const changePassword = useCallback(async (
    payload: UpdatePasswordPayload
  ) => {
    if (!auth.currentUser?.email) return;
    setLoading(true);
    setError(null);

    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        payload.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, payload.newPassword);
    } catch (e: unknown) {
      let msg = 'Password update failed.';
      if (e instanceof Error) {
        if (e.message.includes('wrong-password') || e.message.includes('invalid-credential')) {
          msg = 'Current password is incorrect.';
        } else if (e.message.includes('weak-password')) {
          msg = 'New password must be at least 6 characters.';
        } else {
          msg = e.message;
        }
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    stats,
    loading,
    fetchStats,
    logout,
    error,
    avatarBase64,       // ✅ from global store
    updateProfileInfo,
    changePassword,
  };
};