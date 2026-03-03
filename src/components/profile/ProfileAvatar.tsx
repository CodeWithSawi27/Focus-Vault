import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, Typography, Shadow } from '@/src/constants/theme';

interface ProfileAvatarProps {
  displayName: string | null;
  email: string | null;
  avatarBase64?: string | null; // ✅ NEW
}

export const ProfileAvatar = ({
  displayName,
  email,
  avatarBase64,
}: ProfileAvatarProps) => {
  const initials = displayName
    ? displayName
        .split(' ')
        .filter(Boolean)
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (email?.[0] ?? '?').toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        {avatarBase64 ? (
          // ✅ Show photo if available
          <Image
            source={{ uri: avatarBase64 }}
            style={styles.avatarImage}
          />
        ) : (
          // Fallback to initials
          <View style={styles.avatarInitials}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
        )}
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
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 4,
    ...Shadow.md,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarInitials: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
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