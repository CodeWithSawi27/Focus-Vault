import { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Timer, Play, ArrowRight } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";

interface SmartCTAProps {
  lastSession: { duration: number; started_at: string } | null;
}

const formatDuration = (seconds: number) => `${Math.floor(seconds / 60)} min`;
const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (hrs >= 24) return `${Math.floor(hrs / 24)}d ago`;
  if (hrs >= 1) return `${hrs}h ago`;
  if (mins >= 1) return `${mins}m ago`;
  return "just now";
};

export const SmartCTA = ({ lastSession }: SmartCTAProps) => {
  const router = useRouter();
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        continueCard: {
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          backgroundColor: colors.primary,
          borderRadius: Radius.lg,
          padding: 16,
          ...Shadow.md,
        },
        iconWrap: {
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.1)",
          justifyContent: "center",
          alignItems: "center",
        },
        continueInfo: { flex: 1, gap: 3 },
        continueTitle: {
          ...Typography.callout,
          color: colors.text.inverse,
          fontWeight: "600",
          letterSpacing: -0.2,
        },
        continueSub: { ...Typography.footnote, color: "rgba(255,255,255,0.5)" },
        startCard: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.lg,
          padding: 16,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          ...Shadow.sm,
        },
        startLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
        startIconWrap: {
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: colors.surface,
          justifyContent: "center",
          alignItems: "center",
        },
        startText: { gap: 3 },
        startTitle: {
          ...Typography.callout,
          color: colors.text.primary,
          fontWeight: "600",
          letterSpacing: -0.2,
        },
        startSub: { ...Typography.footnote, color: colors.text.tertiary },
      }),
    [colors],
  );

  if (lastSession) {
    return (
      <TouchableOpacity
        style={styles.continueCard}
        onPress={() => router.push("/(tabs)/focus")}
        activeOpacity={0.8}
      >
        <View style={styles.iconWrap}>
          <Timer size={20} color={colors.text.inverse} strokeWidth={1.8} />
        </View>
        <View style={styles.continueInfo}>
          <Text style={styles.continueTitle}>Continue Focusing</Text>
          <Text style={styles.continueSub}>
            Last: {formatDuration(lastSession.duration)} ·{" "}
            {timeAgo(lastSession.started_at)}
          </Text>
        </View>
        <ArrowRight size={18} color="rgba(255,255,255,0.6)" strokeWidth={2} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.startCard}
      onPress={() => router.push("/(tabs)/focus")}
      activeOpacity={0.8}
    >
      <View style={styles.startLeft}>
        <View style={styles.startIconWrap}>
          <Play
            size={18}
            color={colors.text.primary}
            fill={colors.text.primary}
            strokeWidth={2}
          />
        </View>
        <View style={styles.startText}>
          <Text style={styles.startTitle}>Start Focusing</Text>
          <Text style={styles.startSub}>25, 50, or 90 minute sessions</Text>
        </View>
      </View>
      <ArrowRight size={18} color={colors.text.tertiary} strokeWidth={2} />
    </TouchableOpacity>
  );
};
