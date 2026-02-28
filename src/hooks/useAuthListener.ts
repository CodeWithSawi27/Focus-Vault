import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/src/services/firebase';
import { setSupabaseAuthHeader, clearSupabaseAuthHeader } from '@/src/services/supabase';
import { useAuthStore } from '@/src/store/authStore';

export const useAuthListener = () => {
  const { setUser, setInitialized } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        setSupabaseAuthHeader(idToken);
        setUser(user);
      } else {
        clearSupabaseAuthHeader();
        setUser(null);
      }
      setInitialized(true);
    });

    return unsubscribe;
  }, []);
};