import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleHabitReminder = async ({
  habitId,
  habitName,
  reminderTime,   // "HH:MM:SS" from Postgres or "HH:MM" from picker
  streak,
  incompleteCount,
}: {
  habitId: string;
  habitName: string;
  reminderTime: string;
  streak: number;
  incompleteCount: number;
}): Promise<string | null> => {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return null;

    // Cancel existing notification for this habit first
    await cancelHabitReminder(habitId);

    const [hourStr, minuteStr] = reminderTime.split(':');
    const hour   = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (isNaN(hour) || isNaN(minute)) return null;

    const body = buildNotificationBody({
      habitName,
      streak,
      incompleteCount,
    });

    const identifier = await Notifications.scheduleNotificationAsync({
      identifier: `habit-${habitId}`,
      content: {
        title: `⏰ ${habitName}`,
        body,
        sound: true,
        data: { habitId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    return identifier;
  } catch (e) {
    console.warn('Failed to schedule notification:', e);
    return null;
  }
};

export const cancelHabitReminder = async (habitId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(`habit-${habitId}`);
  } catch {
    // Notification may not exist — safe to ignore
  }
};

export const cancelAllReminders = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

const buildNotificationBody = ({
  habitName,
  streak,
  incompleteCount,
}: {
  habitName: string;
  streak: number;
  incompleteCount: number;
}): string => {
  const motivational = [
    'Small steps build big results.',
    'Consistency is the key to progress.',
    'Show up today — your future self will thank you.',
    'Every check-in counts.',
    'One habit at a time.',
  ];

  const quote = motivational[new Date().getMinutes() % motivational.length];

  const parts: string[] = [];

  if (incompleteCount > 0) {
    parts.push(
      incompleteCount === 1
        ? '1 habit waiting for you today.'
        : `${incompleteCount} habits waiting for you today.`
    );
  }

  if (streak > 1) {
    parts.push(`🔥 ${streak}-day streak — keep it going!`);
  }

  parts.push(quote);

  return parts.join(' ');
};