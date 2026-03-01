import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Flame } from 'lucide-react-native';
import { Colors, Typography, Radius } from '@/src/constants/theme';

interface DashboardHeaderProps {
  greeting: string;
  formattedDate: string;
  displayName: string | null;
  longestStreak: number;
}

export const DashboardHeader = ({
  greeting,
  formattedDate,
  displayName,
  longestStreak,
}: DashboardHeaderProps) => {
  const router  = useRouter();
  const firstName = displayName?.split(' ')[0] ?? 'there';

  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Greeting block */}
        <View style={styles.greetingBlock}>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.greeting}>
            {greeting}, {firstName}
          </Text>
        </View>

        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      {/* Streak badge */}
      {longestStreak > 0 && (
        <View style={styles.streakBadge}>
          <Flame size={13} color={Colors.accent.orange} strokeWidth={2} />
          <Text style={styles.streakText}>
            {longestStreak} day streak
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greetingBlock: {
    gap: 3,
    flex: 1,
  },
  date: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  greeting: {
    ...Typography.title1,
    color: Colors.text.primary,
    letterSpacing: -0.5,
    fontWeight: '700',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  avatarText: {
    ...Typography.subhead,
    color: Colors.text.inverse,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(180, 83, 9, 0.08)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.15)',
  },
  streakText: {
    ...Typography.caption,
    color: Colors.accent.orange,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});