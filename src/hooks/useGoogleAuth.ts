import { useCallback, useState, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { signInWithGoogle } from "@/src/services/authService";
import { useToast } from "@/src/hooks/useToast";

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID =
  "19879073254-1noeapk2v5m3m9tmm1rrvcdjpegmpahv.apps.googleusercontent.com";
const REDIRECT_URI = "https://auth.expo.io/@momohsawi/focus-vault";

export const useGoogleAuth = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID,
    redirectUri: REDIRECT_URI,
  });

  const handleGoogleResponse = useCallback(async () => {
    if (response?.type !== "success") return;

    const idToken = response.authentication?.idToken;
    if (!idToken) {
      toast.error("Google sign-in failed — no token returned.");
      return;
    }

    setLoading(true);
    try {
      await signInWithGoogle(idToken);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  }, [response, toast]);

  useEffect(() => {
    if (response?.type === "success") handleGoogleResponse();
  }, [response]);

  const signIn = useCallback(async () => {
    await promptAsync({ useProxy: true });
  }, [promptAsync]);

  return {
    signIn,
    handleGoogleResponse,
    response,
    loading,
    ready: !!request,
  };
};
