import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Shadow } from '@/src/constants/theme';

interface ProfileAvatarProps {
  displayName: string | null;
  email: string | null;
}

export const ProfileAvatar = ({ displayName, email }: ProfileAvatarProps) => {
  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : (email?.[0] ?? '?').toUpperCase();

  const firstName = displayName?.split(' ')[0] ?? 'User';

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <Text style={styles.name}>{displayName ?? 'User'}</Text>
      <Text style={styles.email}>{email}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>FocusVault Member</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    ...Shadow.md,
  },
  initials: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.text.inverse,
    letterSpacing: -0.5,
  },
  name: {
    ...Typography.title3,
    color: Colors.text.primary,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  email: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
  },
  badge: {
    marginTop: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});