import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cancelAllReminders, requestNotificationPermission } from '@/src/services/notifications';

const STORAGE_KEY = 'focusvault:notificationsEnabled';

export interface ScheduledReminder {
  identifier: string;
  title: string;
  body: string;
  hour: number;
  minute: number;
}

interface NotificationSettings {
  permissionGranted: boolean;
  enabled: boolean;
  scheduledReminders: ScheduledReminder[];
  loading: boolean;
  toggle: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
  refresh: () => Promise<void>;
}

const formatTime = (hour: number, minute: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h      = hour % 12 || 12;
  const m      = String(minute).padStart(2, '0');
  return `${h}:${m} ${period}`;
};

export const useNotificationSettings = (): NotificationSettings => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [enabled, setEnabled]                     = useState(true);
  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>([]);
  const [loading, setLoading]                     = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // Check permission
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionGranted(status === 'granted');

      // Load persisted preference
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      setEnabled(stored !== 'false');

      // Load scheduled notifications
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const reminders: ScheduledReminder[] = scheduled
        .map(n => {
          const trigger = n.trigger as any;
          return {
            identifier: n.identifier,
            title:      n.content.title ?? 'Reminder',
            body:       n.content.body  ?? '',
            hour:       trigger?.hour   ?? 0,
            minute:     trigger?.minute ?? 0,
          };
        })
        .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));

      setScheduledReminders(reminders);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const toggle = useCallback(async () => {
    if (!permissionGranted) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
      setPermissionGranted(true);
    }

    const next = !enabled;
    setEnabled(next);
    await AsyncStorage.setItem(STORAGE_KEY, String(next));

    if (!next) {
      await cancelAllReminders();
      setScheduledReminders([]);
    }
    // Turning back on — user must re-enable per-habit in Habits screen
    // (we don't store reminder times here to reschedule centrally)
  }, [enabled, permissionGranted]);

  const sendTestNotification = useCallback(async () => {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 FocusVault',
        body:  'Test notification — reminders are working!',
        sound: true,
      },
      trigger: { seconds: 3, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL },
    });
  }, []);

  return {
    permissionGranted,
    enabled,
    scheduledReminders,
    loading,
    toggle,
    sendTestNotification,
    refresh,
  };
};