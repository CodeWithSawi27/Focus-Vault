import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Lock } from 'lucide-react-native';
import { AvatarPicker } from '@/src/components/profile/AvatarPicker';
import { InputField } from '@/src/components/ui/InputField';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { useProfile } from '@/src/hooks/useProfile';
import { useAuthStore } from '@/src/store/authStore';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Layout, Spacing } from '@/src/constants/spacing';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  // ✅ Pull savedAvatar from useProfile so edit screen seeds correctly
  const {
    updateProfileInfo,
    changePassword,
    avatarBase64: savedAvatar,
  } = useProfile();

  // ─── Profile state ────────────────────────────────────────────────────────
  const [displayName, setDisplayName]   = useState(user?.displayName ?? '');
  const [avatarBase64, setAvatarBase64] = useState<string | null>(
    savedAvatar ?? null  // ✅ was (user as any)?.avatar_base64
  );
  const [profileError, setProfileError]     = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // ─── Password state ───────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError]     = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // ─── Remove avatar ────────────────────────────────────────────────────────
  const handleRemoveAvatar = useCallback(async () => {
    setAvatarBase64(null);
    setProfileError('');
    setProfileSuccess(false);
    setLoadingProfile(true);
    try {
      await updateProfileInfo({ avatarBase64: null });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (e: unknown) {
      setProfileError(
        e instanceof Error ? e.message : 'Could not remove avatar.'
      );
    } finally {
      setLoadingProfile(false);
    }
  }, [updateProfileInfo]);

  // ─── Save profile ─────────────────────────────────────────────────────────
  const handleSaveProfile = useCallback(async () => {
    if (!displayName.trim()) {
      setProfileError('Display name cannot be empty.');
      return;
    }
    setProfileError('');
    setProfileSuccess(false);
    setLoadingProfile(true);
    try {
      await updateProfileInfo({
        displayName: displayName.trim(),
        avatarBase64,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (e: unknown) {
      setProfileError(
        e instanceof Error ? e.message : 'Could not update profile.'
      );
    } finally {
      setLoadingProfile(false);
    }
  }, [displayName, avatarBase64, updateProfileInfo]);

  // ─── Save password ────────────────────────────────────────────────────────
  const handleSavePassword = useCallback(async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current.');
      return;
    }
    setPasswordError('');
    setPasswordSuccess(false);
    setLoadingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (e: unknown) {
      setPasswordError(
        e instanceof Error ? e.message : 'Could not update password.'
      );
    } finally {
      setLoadingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword, changePassword]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Nav */}
          <View style={styles.nav}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} color={Colors.text.primary} strokeWidth={2} />
              <Text style={styles.backText}>Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.subtitle}>
              Update your personal information
            </Text>
          </View>

          {/* Avatar picker */}
          <AvatarPicker
            currentBase64={avatarBase64}
            displayName={displayName}
            onPick={setAvatarBase64}
            size={100}
          />

          {/* ✅ Remove photo button — only shown when avatar exists */}
          {avatarBase64 && (
            <TouchableOpacity
              onPress={handleRemoveAvatar}
              activeOpacity={0.7}
              style={styles.removeBtn}
              disabled={loadingProfile}
            >
              <Text style={styles.removeBtnText}>Remove photo</Text>
            </TouchableOpacity>
          )}

          {/* ── Profile info card ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={15} color={Colors.text.secondary} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Personal Info</Text>
            </View>

            <View style={styles.card}>
              <InputField
                label="Display Name"
                value={displayName}
                onChangeText={(t) => {
                  setDisplayName(t);
                  setProfileError('');
                  setProfileSuccess(false);
                }}
                placeholder="Your name"
                autoCapitalize="words"
                autoComplete="name"
              />

              {profileError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{profileError}</Text>
                </View>
              ) : null}

              {profileSuccess ? (
                <View style={styles.successBox}>
                  <Text style={styles.successText}>
                    Profile updated successfully ✓
                  </Text>
                </View>
              ) : null}

              <PrimaryButton
                label="Save Changes"
                onPress={handleSaveProfile}
                loading={loadingProfile}
              />
            </View>
          </View>

          {/* ── Password card ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Lock size={15} color={Colors.text.secondary} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Change Password</Text>
            </View>

            <View style={styles.card}>
              <InputField
                label="Current Password"
                value={currentPassword}
                onChangeText={(t) => {
                  setCurrentPassword(t);
                  setPasswordError('');
                  setPasswordSuccess(false);
                }}
                secureTextEntry
                placeholder="••••••••"
                autoComplete="password"
              />
              <InputField
                label="New Password"
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  setPasswordError('');
                  setPasswordSuccess(false);
                }}
                secureTextEntry
                placeholder="Min. 6 characters"
                autoComplete="new-password"
              />
              <InputField
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  setPasswordError('');
                  setPasswordSuccess(false);
                }}
                secureTextEntry
                placeholder="Repeat new password"
                autoComplete="new-password"
              />

              {passwordError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{passwordError}</Text>
                </View>
              ) : null}

              {passwordSuccess ? (
                <View style={styles.successBox}>
                  <Text style={styles.successText}>
                    Password changed successfully ✓
                  </Text>
                </View>
              ) : null}

              <PrimaryButton
                label="Update Password"
                onPress={handleSavePassword}
                loading={loadingPassword}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  container: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: 40,
    gap: Spacing.lg,
  },
  nav: {
    paddingTop: Spacing.sm,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  backText: {
    ...Typography.callout,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  titleBlock: {
    gap: 4,
  },
  title: {
    ...Typography.largeTitle,
    color: Colors.text.primary,
    letterSpacing: -0.8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.tertiary,
  },
  removeBtn: {
    alignSelf: 'center',
    marginTop: -8,
  },
  removeBtnText: {
    ...Typography.subhead,
    color: Colors.accent.red,
    fontWeight: '500',
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: Spacing.md,
    ...Shadow.md,
  },
  errorBox: {
    backgroundColor: 'rgba(204,43,43,0.06)',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(204,43,43,0.12)',
  },
  errorText: {
    ...Typography.footnote,
    color: Colors.accent.red,
    textAlign: 'center',
  },
  successBox: {
    backgroundColor: 'rgba(37,103,30,0.06)',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(37,103,30,0.12)',
  },
  successText: {
    ...Typography.footnote,
    color: Colors.accent.green,
    textAlign: 'center',
    fontWeight: '500',
  },
});