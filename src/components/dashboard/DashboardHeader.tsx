import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Flame } from 'lucide-react-native';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';

interface DashboardHeaderProps {
  greeting: string;
  formattedDate: string;
  displayName: string | null;
  longestStreak: number;
  avatarBase64?: string | null; // ✅ NEW
  
}

export const DashboardHeader = ({
  greeting,
  formattedDate,
  displayName,
  longestStreak,
  avatarBase64,
}: DashboardHeaderProps) => {
  const router    = useRouter();
  const firstName = displayName?.split(' ')[0] ?? 'there';
  const initials  = displayName
    ? displayName.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
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

        {/* Avatar — shows photo if available, falls back to initials */}
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.8}
        >
          {avatarBase64 ? (
            <Image
              source={{ uri: avatarBase64 }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
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
    fontSize: 13,
    letterSpacing: 0.8,
    fontWeight: '400',
  },
  greeting: {
    ...Typography.title1,
    color: Colors.text.primary,
    letterSpacing: -0.5,
    fontSize: 22,
    fontWeight: '600',
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginTop: 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.06)',
    ...Shadow.sm,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: Colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...Typography.subhead,
    color: Colors.text.inverse,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
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
    fontWeight: '400',
    letterSpacing: 0.1,
  },
});