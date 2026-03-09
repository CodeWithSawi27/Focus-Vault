import { useEffect, useCallback, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useNavigation } from "expo-router";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { focusModeService } from "@/src/services/focusModeService";
import { useTimerStore } from "@/src/store/timerStore";

const KEEP_AWAKE_TAG = "focus-session";

export interface FocusSessionControls {
  startFocusMode: () => Promise<void>;
  endFocusMode: () => Promise<void>;
}

export const useFocusSession = (): FocusSessionControls => {
  const navigation = useNavigation();
  const { isRunning } = useTimerStore();
  const dndPromptShown = useRef(false);

  // ─── Hard block — intercepts ALL navigation away from focus screen ──────────
  useEffect(() => {
    if (!isRunning) return;

    // @ts-ignore — beforeRemove is valid React Navigation event;
    // Expo Router's navigation type doesn't expose it but it works at runtime
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      e.preventDefault();
    });

    return unsubscribe;
  }, [isRunning, navigation]);

  // ─── Safety net — restore notifications if app is backgrounded ──────────────
  useEffect(() => {
    if (!isRunning) return;

    const sub = AppState.addEventListener(
      "change",
      async (state: AppStateStatus) => {
        if (state === "background" || state === "inactive") {
          await focusModeService.restoreNotifications();
        }
      },
    );

    return () => sub.remove();
  }, [isRunning]);

  const startFocusMode = useCallback(async () => {
    await Promise.all([
      focusModeService.suppressNotifications(),
      activateKeepAwakeAsync(KEEP_AWAKE_TAG),
    ]);

    if (!dndPromptShown.current) {
      dndPromptShown.current = true;
      setTimeout(() => focusModeService.promptDoNotDisturb(), 800);
    }
  }, []);

  const endFocusMode = useCallback(async () => {
    await Promise.all([
      focusModeService.restoreNotifications(),
      deactivateKeepAwake(KEEP_AWAKE_TAG),
    ]);
  }, []);

  return { startFocusMode, endFocusMode };
};
