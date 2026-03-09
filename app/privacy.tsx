import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Database,
  Fingerprint,
  Trash2,
  Shield,
  Lock,
} from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { deleteAccount } from "@/src/services/authService";
import { cancelAllReminders } from "@/src/services/notifications";
import { useAuthStore } from "@/src/store/authStore";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Layout, Spacing } from "@/src/constants/spacing";

interface DataItem {
  icon: any;
  title: string;
  description: string;
}

const DATA_ITEMS: DataItem[] = [
  {
    icon: Fingerprint,
    title: "Authentication",
    description:
      "Email address and display name stored securely via Firebase Authentication.",
  },
  {
    icon: Database,
    title: "Habits & Logs",
    description:
      "Your habits, completion logs, and streak data stored in our secure database.",
  },
  {
    icon: Shield,
    title: "Focus Sessions",
    description:
      "Session duration, category, notes, and timestamps stored per session.",
  },
  {
    icon: Lock,
    title: "No Third-Party Sharing",
    description:
      "Your data is never sold or shared with third-party advertisers.",
  },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [deleting, setDeleting] = useState(false);

  const performDelete = async () => {
    if (!user?.uid) return;
    setDeleting(true);
    try {
      await cancelAllReminders();
      await deleteAccount(user.uid);
    } catch (e: any) {
      setDeleting(false);
      Alert.alert(
        "Delete Failed",
        e.message?.includes("recent")
          ? "For security, please sign out and sign back in before deleting your account."
          : "Could not delete account. Please try again.",
      );
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Are you absolutely sure?",
      `All data for ${user?.email ?? "your account"} will be permanently erased.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete Everything",
          style: "destructive",
          onPress: performDelete,
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account, all habits, focus sessions, and data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: confirmDelete,
        },
      ],
    );
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        navbar: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: Layout.screenPadding,
          paddingVertical: Spacing.sm,
        },
        backBtn: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingVertical: 4,
          minWidth: 80,
        },
        backText: {
          ...Typography.callout,
          color: colors.text.primary,
          fontWeight: "500",
        },
        navTitle: {
          ...Typography.headline,
          color: colors.text.primary,
          fontWeight: "600",
        },
        navSpacer: { minWidth: 80 },
        scroll: {
          paddingHorizontal: Layout.screenPadding,
          paddingTop: Spacing.sm,
          paddingBottom: 48,
          gap: Spacing.lg,
        },
        introCard: {
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.xl,
          padding: Spacing.lg,
          alignItems: "center",
          gap: 10,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          ...Shadow.sm,
        },
        introTitle: {
          ...Typography.title3,
          color: colors.text.primary,
          fontWeight: "700",
          letterSpacing: -0.3,
        },
        introSubtitle: {
          ...Typography.subhead,
          color: colors.text.tertiary,
          textAlign: "center",
          lineHeight: 20,
        },
        section: { gap: Spacing.sm },
        sectionLabel: {
          ...Typography.caption,
          color: colors.text.tertiary,
          fontWeight: "600",
          letterSpacing: 1,
          textTransform: "uppercase",
        },
        card: {
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.xl,
          padding: Spacing.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          ...Shadow.sm,
        },
        dataRow: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 12,
          paddingVertical: Spacing.sm,
        },
        dataIconWrap: {
          width: 32,
          height: 32,
          borderRadius: 9,
          backgroundColor: colors.surface,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 1,
        },
        dataText: { flex: 1, gap: 3 },
        dataTitle: {
          ...Typography.callout,
          color: colors.text.primary,
          fontWeight: "600",
        },
        dataDesc: {
          ...Typography.footnote,
          color: colors.text.secondary,
          lineHeight: 18,
        },
        rowDivider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.border,
        },
        accountRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 12,
        },
        accountLabel: {
          ...Typography.subhead,
          color: colors.text.tertiary,
          fontWeight: "500",
        },
        accountValue: {
          ...Typography.subhead,
          color: colors.text.primary,
          fontWeight: "500",
          maxWidth: "55%",
          textAlign: "right",
        },
        dangerCard: {
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.xl,
          padding: Spacing.md,
          gap: Spacing.md,
          borderWidth: 1,
          borderColor: colors.accent.red + "25",
          ...Shadow.sm,
        },
        dangerInfo: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
        dangerText: { flex: 1, gap: 3 },
        dangerTitle: {
          ...Typography.callout,
          color: colors.accent.red,
          fontWeight: "600",
        },
        dangerSubtitle: {
          ...Typography.footnote,
          color: colors.text.tertiary,
          lineHeight: 18,
        },
        deleteBtn: {
          backgroundColor: colors.accent.red,
          borderRadius: Radius.full,
          paddingVertical: 13,
          alignItems: "center",
        },
        deleteBtnDisabled: { opacity: 0.5 },
        deleteBtnText: {
          ...Typography.callout,
          color: "#FFFFFF",
          fontWeight: "600",
        },
      }),
    [colors],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={colors.text.primary} strokeWidth={2} />
          <Text style={styles.backText}>Profile</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Privacy</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introCard}>
          <Shield size={28} color={colors.text.primary} strokeWidth={1.5} />
          <Text style={styles.introTitle}>Your data, your control</Text>
          <Text style={styles.introSubtitle}>
            FocusVault stores only what is necessary to deliver your experience.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WHAT WE STORE</Text>
          <View style={styles.card}>
            {DATA_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <View key={item.title}>
                  <View style={styles.dataRow}>
                    <View style={styles.dataIconWrap}>
                      <Icon
                        size={16}
                        color={colors.text.primary}
                        strokeWidth={1.8}
                      />
                    </View>
                    <View style={styles.dataText}>
                      <Text style={styles.dataTitle}>{item.title}</Text>
                      <Text style={styles.dataDesc}>{item.description}</Text>
                    </View>
                  </View>
                  {index < DATA_ITEMS.length - 1 && (
                    <View style={styles.rowDivider} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR ACCOUNT</Text>
          <View style={styles.card}>
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Email</Text>
              <Text style={styles.accountValue} numberOfLines={1}>
                {user?.email ?? "—"}
              </Text>
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>User ID</Text>
              <Text style={styles.accountValue} numberOfLines={1}>
                {user?.uid ? `${user.uid.slice(0, 8)}...` : "—"}
              </Text>
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.accountRow}>
              <Text style={styles.accountLabel}>Auth Provider</Text>
              <Text style={styles.accountValue}>
                {user?.providerData?.[0]?.providerId === "google.com"
                  ? "Google"
                  : "Email / Password"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DANGER ZONE</Text>
          <View style={styles.dangerCard}>
            <View style={styles.dangerInfo}>
              <Trash2 size={18} color={colors.accent.red} strokeWidth={2} />
              <View style={styles.dangerText}>
                <Text style={styles.dangerTitle}>Delete Account</Text>
                <Text style={styles.dangerSubtitle}>
                  Permanently erase all your data. This cannot be undone.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.deleteBtn, deleting && styles.deleteBtnDisabled]}
              onPress={handleDeleteAccount}
              activeOpacity={0.8}
              disabled={deleting}
            >
              <Text style={styles.deleteBtnText}>
                {deleting ? "Deleting..." : "Delete My Account"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
