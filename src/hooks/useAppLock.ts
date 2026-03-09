import { useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useLockStore } from '@/src/store/lockStore';

// ⚠️ SecureStore keys must only contain alphanumeric, ".", "-", "_"
// No colons allowed
const STORAGE_KEY     = 'focusvault_appLockEnabled';
const LOCK_TIMEOUT_MS = 60 * 1000;

const runAuth = async (promptMessage: string): Promise<boolean> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled  = await LocalAuthentication.isEnrolledAsync();

    console.log('[AppLock] hasHardware:', hasHardware, 'isEnrolled:', isEnrolled);

    if (!hasHardware || !isEnrolled) {
      console.log('[AppLock] No biometrics — allowing through');
      return true;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel:         'Use Passcode',
      cancelLabel:           'Cancel',
      disableDeviceFallback: false,
    });

    console.log('[AppLock] auth result:', JSON.stringify(result));

    // success:true with a warning is still a success
    return result.success;
  } catch (e) {
    console.warn('[AppLock] auth exception:', e);
    return false;
  }
};

export const useAppLock = () => {
  const {
    isLocked, isEnabled,
    backgroundedAt,
    setLocked, setEnabled, setBackgroundedAt,
  } = useLockStore();

  // ─── Load persisted preference ────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await SecureStore.getItemAsync(STORAGE_KEY);
        console.log('[AppLock] loaded preference:', stored);
        setEnabled(stored === 'true');
      } catch (e) {
        console.warn('[AppLock] load error:', e);
        setEnabled(false);
      }
    };
    load();
  }, []);

  // ─── AppState listener ────────────────────────────────────────────────────
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (!isEnabled) return;

      if (nextState === 'background' || nextState === 'inactive') {
        setBackgroundedAt(Date.now());
      } else if (nextState === 'active') {
        if (backgroundedAt !== null) {
          const elapsed = Date.now() - backgroundedAt;
          console.log('[AppLock] elapsed:', elapsed, 'ms');
          if (elapsed >= LOCK_TIMEOUT_MS) {
            setLocked(true);
          }
        }
        setBackgroundedAt(null);
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [isEnabled, backgroundedAt]);

  // ─── Unlock ───────────────────────────────────────────────────────────────
  const authenticate = useCallback(async (): Promise<boolean> => {
    const success = await runAuth('Unlock FocusVault');
    if (success) setLocked(false);
    return success;
  }, []);

  // ─── Enable ───────────────────────────────────────────────────────────────
  const enableAppLock = useCallback(async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled  = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        console.warn('[AppLock] Cannot enable — no biometrics enrolled');
        return false;
      }

      const success = await runAuth('Confirm your identity to enable App Lock');
      if (!success) return false;

      await SecureStore.setItemAsync(STORAGE_KEY, 'true');
      console.log('[AppLock] enabled and saved');
      setEnabled(true);
      return true;
    } catch (e) {
      console.warn('[AppLock] enableAppLock error:', e);
      return false;
    }
  }, []);

  // ─── Disable ──────────────────────────────────────────────────────────────
  const disableAppLock = useCallback(async (): Promise<boolean> => {
    try {
      const success = await runAuth('Confirm your identity to disable App Lock');
      if (!success) return false;

      await SecureStore.setItemAsync(STORAGE_KEY, 'false');
      console.log('[AppLock] disabled and saved');
      setEnabled(false);
      setLocked(false);
      return true;
    } catch (e) {
      console.warn('[AppLock] disableAppLock error:', e);
      return false;
    }
  }, []);

  // ─── Biometric type ───────────────────────────────────────────────────────
  const getBiometricType = useCallback(
    async (): Promise<'faceid' | 'touchid' | 'none'> => {
      try {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          return 'faceid';
        }
        if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          return 'touchid';
        }
        return 'none';
      } catch {
        return 'none';
      }
    },
    []
  );

  return {
    isLocked,
    isEnabled,
    authenticate,
    enableAppLock,
    disableAppLock,
    getBiometricType,
  };
};