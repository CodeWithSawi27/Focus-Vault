import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "focusvault_sync_queue";

export type QueueOperationType =
  | "habit_completion"
  | "session_save"
  | "habit_update"
  | "habit_delete";

export interface QueuedOperation {
  id: string;
  type: QueueOperationType;
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
}

const MAX_RETRIES = 3;

export const syncQueue = {
  async getAll(): Promise<QueuedOperation[]> {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async push(
    type: QueueOperationType,
    payload: Record<string, unknown>,
  ): Promise<void> {
    try {
      const queue = await this.getAll();
      const op: QueuedOperation = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        type,
        payload,
        createdAt: new Date().toISOString(),
        retryCount: 0,
      };
      queue.push(op);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

      if (__DEV__) {
        console.log(`[SyncQueue] Queued: ${type}`, payload);
      }
    } catch (err) {
      console.error("[SyncQueue] Failed to push operation:", err);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      const queue = await this.getAll();
      const filtered = queue.filter((op) => op.id !== id);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
    } catch (err) {
      console.error("[SyncQueue] Failed to remove operation:", err);
    }
  },

  async incrementRetry(id: string): Promise<void> {
    try {
      const queue = await this.getAll();
      const updated = queue.map((op) =>
        op.id === id ? { ...op, retryCount: op.retryCount + 1 } : op,
      );
      // Purge ops that have exceeded max retries — avoid queue bloat
      const purged = updated.filter((op) => op.retryCount <= MAX_RETRIES);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(purged));
    } catch (err) {
      console.error("[SyncQueue] Failed to increment retry:", err);
    }
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
  },

  async count(): Promise<number> {
    const queue = await this.getAll();
    return queue.length;
  },
};
