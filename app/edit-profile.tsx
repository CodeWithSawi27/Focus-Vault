import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, User, Lock } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { AvatarPicker } from "@/src/components/profile/AvatarPicker";
import { InputField } from "@/src/components/ui/InputField";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { useProfile } from "@/src/hooks/useProfile";
import { useAuthStore } from "@/src/store/authStore";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Layout, Spacing } from "@/src/constants/spacing";

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const {
    updateProfileInfo,
    changePassword,
    avatarBase64: savedAvatar,
  } = useProfile();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [avatarBase64, setAvatarBase64] = useState<string | null>(
    savedAvatar ?? null,
  );
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleRemoveAvatar = useCallback(async () => {
    setAvatarBase64(null);
    setProfileError("");
    setProfileSuccess(false);
    setLoadingProfile(true);
    try {
      await updateProfileInfo({ avatarBase64: null });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (e: unknown) {
      setProfileError(
        e instanceof Error ? e.message : "Could not remove avatar.",
      );
    } finally {
      setLoadingProfile(false);
    }
  }, [updateProfileInfo]);

  const handleSaveProfile = useCallback(async () => {
    if (!displayName.trim()) {
      setProfileError("Display name cannot be empty.");
      return;
    }
    setProfileError("");
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
        e instanceof Error ? e.message : "Could not update profile.",
      );
    } finally {
      setLoadingProfile(false);
    }
  }, [displayName, avatarBase64, updateProfileInfo]);

  const handleSavePassword = useCallback(async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current.");
      return;
    }
    setPasswordError("");
    setPasswordSuccess(false);
    setLoadingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (e: unknown) {
      setPasswordError(
        e instanceof Error ? e.message : "Could not update password.",
      );
    } finally {
      setLoadingPassword(false);
    }
  }, [currentPassword, newPassword, confirmPassword, changePassword]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        flex: { flex: 1 },
        container: {
          paddingHorizontal: Layout.screenPadding,
          paddingBottom: 40,
          gap: Spacing.lg,
        },
        nav: { paddingTop: Spacing.sm },
        backBtn: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          alignSelf: "flex-start",
          paddingVertical: 4,
        },
        backText: {
          ...Typography.callout,
          color: colors.text.primary,
          fontWeight: "500",
        },
        titleBlock: { gap: 4 },
        title: {
          ...Typography.largeTitle,
          color: colors.text.primary,
          letterSpacing: -0.8,
        },
        subtitle: { ...Typography.body, color: colors.text.tertiary },
        removeBtn: { alignSelf: "center", marginTop: -8 },
        removeBtnText: {
          ...Typography.subhead,
          color: colors.accent.red,
          fontWeight: "500",
        },
        section: { gap: 10 },
        sectionHeader: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 2,
        },
        sectionTitle: {
          ...Typography.footnote,
          color: colors.text.secondary,
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: 0.6,
        },
        card: {
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.xl,
          padding: Spacing.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          gap: Spacing.md,
          ...Shadow.md,
        },
        errorBox: {
          backgroundColor: colors.accent.redMuted,
          borderRadius: Radius.md,
          padding: 12,
          borderWidth: 1,
          borderColor: colors.accent.red + "20",
        },
        errorText: {
          ...Typography.footnote,
          color: colors.accent.red,
          textAlign: "center",
        },
        successBox: {
          backgroundColor: colors.accent.greenMuted,
          borderRadius: Radius.md,
          padding: 12,
          borderWidth: 1,
          borderColor: colors.accent.green + "20",
        },
        successText: {
          ...Typography.footnote,
          color: colors.accent.green,
          textAlign: "center",
          fontWeight: "500",
        },
      }),
    [colors],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.nav}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <ArrowLeft
                size={20}
                color={colors.text.primary}
                strokeWidth={2}
              />
              <Text style={styles.backText}>Profile</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.subtitle}>
              Update your personal information
            </Text>
          </View>

          <AvatarPicker
            currentBase64={avatarBase64}
            displayName={displayName}
            onPick={setAvatarBase64}
            size={100}
          />

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

          {/* Profile card */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={15} color={colors.text.secondary} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Personal Info</Text>
            </View>
            <View style={styles.card}>
              <InputField
                label="Display Name"
                value={displayName}
                onChangeText={(t) => {
                  setDisplayName(t);
                  setProfileError("");
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

          {/* Password card */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Lock size={15} color={colors.text.secondary} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Change Password</Text>
            </View>
            <View style={styles.card}>
              <InputField
                label="Current Password"
                value={currentPassword}
                onChangeText={(t) => {
                  setCurrentPassword(t);
                  setPasswordError("");
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
                  setPasswordError("");
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
                  setPasswordError("");
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
