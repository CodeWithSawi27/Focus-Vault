import { useCallback, useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { signInWithGoogle } from '@/src/services/authService';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID =
  '19879073254-1noeapk2v5m3m9tmm1rrvcdjpegmpahv.apps.googleusercontent.com';

// Hardcoded proxy URI — the only one Google will accept in Expo Go
const REDIRECT_URI = 'https://auth.expo.io/@momohsawi/focus-vault';

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:    WEB_CLIENT_ID,
    redirectUri: REDIRECT_URI,
  });

  const handleGoogleResponse = useCallback(async () => {
    if (response?.type !== 'success') return;

    const idToken = response.authentication?.idToken;
    if (!idToken) {
      setError('Google sign-in failed — no token returned.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle(idToken);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  }, [response]);

  const signIn = useCallback(async () => {
    setError(null);
    await promptAsync({ useProxy: true }); // ✅ force proxy
  }, [promptAsync]);

  return {
    signIn,
    handleGoogleResponse,
    response,
    loading,
    error,
    ready: !!request,
  };
};