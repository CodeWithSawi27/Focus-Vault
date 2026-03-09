import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";

interface StoredNotification {
  content: Notifications.NotificationContentInput;
  trigger: Notifications.NotificationTriggerInput;
}

let suppressedNotifications: StoredNotification[] = [];

export const focusModeService = {
  async suppressNotifications(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    suppressedNotifications = scheduled.map((n) => ({
      content: n.content as Notifications.NotificationContentInput,
      // Cast through unknown — trigger shape is compatible at runtime
      // but SDK types diverge between scheduled vs input variants
      trigger: n.trigger as unknown as Notifications.NotificationTriggerInput,
    }));
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async restoreNotifications(): Promise<void> {
    if (!suppressedNotifications.length) return;
    await Promise.allSettled(
      suppressedNotifications.map((n) =>
        Notifications.scheduleNotificationAsync({
          content: n.content,
          trigger: n.trigger,
        }),
      ),
    );
    suppressedNotifications = [];
  },

  async promptDoNotDisturb(): Promise<void> {
    await Linking.openURL("App-Prefs:FOCUS");
  },
};
