import { useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useLockStore } from '@/src/store/lockStore';

const STORAGE_KEY     = 'focusvault:appLockEnabled';
const LOCK_TIMEOUT_MS = 60 * 1000;

const runAuth = async (promptMessage: string): Promise<boolean> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled  = await LocalAuthentication.isEnrolledAsync();

    console.log('[AppLock] hasHardware:', hasHardware, 'isEnrolled:', isEnrolled);

    if (!hasHardware || !isEnrolled) return true; // no biometrics — allow through

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel:         'Use Passcode',
      cancelLabel:           'Cancel',
      disableDeviceFallback: false,
    });

    console.log('[AppLock] auth result:', JSON.stringify(result));
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
        setEnabled(stored === 'true');
      } catch {
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
          console.log('[AppLock] elapsed background time:', elapsed, 'ms');
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

  // ─── Unlock (called from LockScreen) ─────────────────────────────────────
  const authenticate = useCallback(async (): Promise<boolean> => {
    const success = await runAuth('Unlock FocusVault');
    if (success) setLocked(false);
    return success;
  }, []);

  // ─── Enable App Lock ──────────────────────────────────────────────────────
  const enableAppLock = useCallback(async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled  = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) return false;

      const success = await runAuth('Confirm your identity to enable App Lock');
      if (!success) return false;

      await SecureStore.setItemAsync(STORAGE_KEY, 'true');
      setEnabled(true);
      return true;
    } catch (e) {
      console.warn('[AppLock] enableAppLock error:', e);
      return false;
    }
  }, []);

  // ─── Disable App Lock ─────────────────────────────────────────────────────
  const disableAppLock = useCallback(async (): Promise<boolean> => {
    try {
      const success = await runAuth('Confirm your identity to disable App Lock');
      if (!success) return false;

      await SecureStore.setItemAsync(STORAGE_KEY, 'false');
      setEnabled(false);
      setLocked(false);
      return true;
    } catch (e) {
      console.warn('[AppLock] disableAppLock error:', e);
      return false;
    }
  }, []);

  // ─── Biometric type detection ─────────────────────────────────────────────
  const getBiometricType = useCallback(async (): Promise<'faceid' | 'touchid' | 'none'> => {
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
  }, []);

  return {
    isLocked,
    isEnabled,
    authenticate,
    enableAppLock,
    disableAppLock,
    getBiometricType,
  };
};