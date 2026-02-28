import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';
import { Colors, Typography } from '@/src/constants/theme';
import { useAuthStore } from '@/src/store/authStore';

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = (): string =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

interface DashboardHeaderProps {
  streak: number;
}

export const DashboardHeader = ({ streak }: DashboardHeaderProps) => {
  const { user } = useAuthStore();
  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.textGroup}>
          <Text style={styles.greeting}>{getGreeting()}, {firstName}</Text>
          <Text style={styles.date}>{formatDate()}</Text>
        </View>
        {streak > 0 && (
          <View style={styles.streakBadge}>
            <Flame size={14} color={Colors.accent.orange} strokeWidth={2} />
            <Text style={styles.streakCount}>{streak}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 4,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textGroup: {
    gap: 3,
  },
  greeting: {
    ...Typography.title2,
    color: Colors.text.primary,
    letterSpacing: -0.4,
  },
  date: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent.orangeMuted,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.15)',
  },
  streakCount: {
    ...Typography.subhead,
    color: Colors.accent.orange,
    fontWeight: '700',
  },
});