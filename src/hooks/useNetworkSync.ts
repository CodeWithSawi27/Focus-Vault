import { useEffect, useCallback, useRef, useState } from "react";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { supabase } from "@/src/services/supabase";
import { syncQueue, type QueuedOperation } from "@/src/services/syncQueue";
import { useAuthStore } from "@/src/store/authStore";
import { useToast } from "@/src/hooks/useToast";

export interface NetworkSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
}

const executeOperation = async (
  op: QueuedOperation,
  userId: string,
): Promise<boolean> => {
  try {
    switch (op.type) {
      case "habit_completion": {
        const { error } = await supabase
          .from("habit_logs")
          .upsert({ ...op.payload, user_id: userId });
        return !error;
      }
      case "session_save": {
        const { error } = await supabase
          .from("focus_sessions")
          .insert({ ...op.payload, user_id: userId });
        return !error;
      }
      case "habit_update": {
        const { id, ...updates } = op.payload as { id: string } & Record<
          string,
          unknown
        >;
        const { error } = await supabase
          .from("habits")
          .update(updates)
          .eq("id", id)
          .eq("user_id", userId);
        return !error;
      }
      case "habit_delete": {
        const { error } = await supabase
          .from("habits")
          .delete()
          .eq("id", op.payload.id as string)
          .eq("user_id", userId);
        return !error;
      }
      default:
        return false;
    }
  } catch {
    return false;
  }
};

export const useNetworkSync = (): NetworkSyncState => {
  const { user } = useAuthStore();
  const toast = useToast();
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // ─── Refs to avoid stale closures ─────────────────────────────────────────
  const isSyncingRef = useRef(false);
  const userRef = useRef(user);
  const toastRef = useRef(toast);

  useEffect(() => {
    userRef.current = user;
  }, [user]);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const refreshCount = useCallback(async () => {
    const count = await syncQueue.count();
    setPendingCount(count);
  }, []);

  // ─── Drain — stable reference, reads from refs ────────────────────────────
  const drainQueue = useCallback(async () => {
    if (!userRef.current?.uid || isSyncingRef.current) return;

    const queue = await syncQueue.getAll();
    if (!queue.length) return;

    isSyncingRef.current = true;
    setIsSyncing(true);

    let failCount = 0;

    for (const op of queue) {
      const success = await executeOperation(op, userRef.current.uid);
      if (success) {
        await syncQueue.remove(op.id);
        if (__DEV__) console.log(`[SyncQueue] Drained: ${op.type}`);
      } else {
        failCount += 1;
        await syncQueue.incrementRetry(op.id);
        if (__DEV__) console.warn(`[SyncQueue] Failed: ${op.type}`);
      }
    }

    isSyncingRef.current = false;
    setIsSyncing(false);
    await refreshCount();

    const remaining = await syncQueue.count();

    if (remaining === 0 && queue.length > 0) {
      // All pending changes synced successfully
      toastRef.current.success(
        `${queue.length} change${queue.length > 1 ? "s" : ""} synced.`,
        { duration: 2500 },
      );
    } else if (failCount > 0 && remaining > 0) {
      // Some failed — will retry next reconnect
      toastRef.current.warning(
        `${failCount} change${failCount > 1 ? "s" : ""} failed to sync — will retry.`,
        { duration: 3500 },
      );
    }
  }, [refreshCount]);

  // ─── Keep drainQueue ref fresh ────────────────────────────────────────────
  const drainQueueRef = useRef(drainQueue);
  useEffect(() => {
    drainQueueRef.current = drainQueue;
  }, [drainQueue]);

  useEffect(() => {
    refreshCount();

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = !!(state.isConnected && state.isInternetReachable);
      setIsOnline(online);
      if (online) drainQueueRef.current();
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isOnline, isSyncing, pendingCount };
};
