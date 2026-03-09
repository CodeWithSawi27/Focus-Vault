import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, FileText, Shield, Heart } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Layout, Spacing } from "@/src/constants/spacing";

const APP_VERSION = "1.0.0";
const BUILD_NUMBER = "1";

const STACK_ITEMS = [
  { label: "Framework", value: "React Native (Expo)" },
  { label: "Navigation", value: "Expo Router" },
  { label: "Authentication", value: "Firebase Auth" },
  { label: "Database", value: "Supabase (PostgreSQL)" },
  { label: "Animations", value: "Reanimated + Moti" },
  { label: "Charts", value: "Victory Native XL" },
];

export default function AboutScreen() {
  const router = useRouter();
  const { colors } = useTheme();

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
        identityBlock: {
          alignItems: "center",
          gap: 8,
          paddingVertical: Spacing.md,
        },
        logoWrap: {
          width: 80,
          height: 80,
          borderRadius: 22,
          overflow: "hidden",
          marginBottom: 4,
          ...Shadow.md,
        },
        logo: { width: "100%", height: "100%" },
        appName: {
          ...Typography.title1,
          color: colors.text.primary,
          fontWeight: "700",
          letterSpacing: -0.6,
        },
        tagline: { ...Typography.subhead, color: colors.text.tertiary },
        versionRow: { marginTop: 4 },
        versionBadge: {
          backgroundColor: colors.border,
          borderRadius: Radius.full,
          paddingHorizontal: 12,
          paddingVertical: 5,
        },
        versionText: {
          ...Typography.caption,
          color: colors.text.secondary,
          fontWeight: "500",
          fontVariant: ["tabular-nums"],
        },
        card: {
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.xl,
          padding: Spacing.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          ...Shadow.sm,
        },
        description: {
          ...Typography.body,
          color: colors.text.secondary,
          lineHeight: 24,
        },
        section: { gap: Spacing.sm },
        sectionLabel: {
          ...Typography.caption,
          color: colors.text.tertiary,
          fontWeight: "600",
          letterSpacing: 1,
          textTransform: "uppercase",
        },
        stackRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 11,
        },
        stackLabel: {
          ...Typography.subhead,
          color: colors.text.tertiary,
          fontWeight: "500",
        },
        stackValue: {
          ...Typography.subhead,
          color: colors.text.primary,
          fontWeight: "500",
        },
        rowDivider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.border,
        },
        linkRow: {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          gap: 12,
        },
        linkIconWrap: {
          width: 30,
          height: 30,
          borderRadius: 8,
          backgroundColor: colors.border,
          justifyContent: "center",
          alignItems: "center",
        },
        linkLabel: {
          ...Typography.callout,
          color: colors.text.primary,
          fontWeight: "500",
          flex: 1,
        },
        linkArrow: {
          ...Typography.title3,
          color: colors.text.tertiary,
          fontWeight: "300",
        },
        creditsCard: {
          alignItems: "center",
          gap: 6,
          paddingVertical: Spacing.md,
        },
        creditsText: { ...Typography.subhead, color: colors.text.tertiary },
        creditsName: { color: colors.text.primary, fontWeight: "600" },
        creditsYear: { ...Typography.caption, color: colors.text.tertiary },
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
        <Text style={styles.navTitle}>About</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity */}
        <View style={styles.identityBlock}>
          <View style={styles.logoWrap}>
            <Image
              source={require("@/assets/App-Store-Icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>FocusVault</Text>
          <Text style={styles.tagline}>Liquid Glass Edition</Text>
          <View style={styles.versionRow}>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>
                v{APP_VERSION} · Build {BUILD_NUMBER}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.description}>
            FocusVault is a premium iOS productivity app designed to help you
            build consistent habits, manage deep focus sessions, and track your
            progress over time through beautiful analytics.
          </Text>
        </View>

        {/* Tech stack */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BUILT WITH</Text>
          <View style={styles.card}>
            {STACK_ITEMS.map((item, index) => (
              <View key={item.label}>
                <View style={styles.stackRow}>
                  <Text style={styles.stackLabel}>{item.label}</Text>
                  <Text style={styles.stackValue}>{item.value}</Text>
                </View>
                {index < STACK_ITEMS.length - 1 && (
                  <View style={styles.rowDivider} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LEGAL</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => Linking.openURL("https://focusvault.app/terms")}
              activeOpacity={0.7}
            >
              <View style={styles.linkIconWrap}>
                <FileText
                  size={16}
                  color={colors.text.primary}
                  strokeWidth={1.8}
                />
              </View>
              <Text style={styles.linkLabel}>Terms of Service</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.rowDivider} />
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => Linking.openURL("https://focusvault.app/privacy")}
              activeOpacity={0.7}
            >
              <View style={styles.linkIconWrap}>
                <Shield
                  size={16}
                  color={colors.text.primary}
                  strokeWidth={1.8}
                />
              </View>
              <Text style={styles.linkLabel}>Privacy Policy</Text>
              <Text style={styles.linkArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Credits */}
        <View style={styles.creditsCard}>
          <Heart
            size={16}
            color={colors.accent.red}
            strokeWidth={2}
            fill={colors.accent.red}
          />
          <Text style={styles.creditsText}>
            Designed and built by{" "}
            <Text style={styles.creditsName}>Momoh Sawi</Text>
          </Text>
          <Text style={styles.creditsYear}>
            © {new Date().getFullYear()} FocusVault
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
