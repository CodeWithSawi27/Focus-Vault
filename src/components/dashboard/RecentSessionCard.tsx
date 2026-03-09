import { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Play, Clock } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { getCategoryById } from "@/src/constants/categories";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Spacing } from "@/src/constants/spacing";
import type { LastSession } from "@/src/hooks/useDashboard";

interface RecentSessionCardProps {
  lastSession: LastSession | null;
}

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
};

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
};

export const RecentSessionCard = ({ lastSession }: RecentSessionCardProps) => {
  const router = useRouter();
  const { colors } = useTheme();
  const cat = getCategoryById(lastSession?.category ?? null);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.xl,
          padding: Spacing.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          gap: 12,
          ...Shadow.sm,
        },
        topRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        label: {
          ...Typography.caption,
          color: colors.text.tertiary,
          fontWeight: "600",
          letterSpacing: 1,
        },
        startBtn: {
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          backgroundColor: colors.primary,
          borderRadius: Radius.full,
          paddingHorizontal: 12,
          paddingVertical: 6,
        },
        startBtnText: {
          ...Typography.caption,
          color: colors.text.inverse,
          fontWeight: "600",
          letterSpacing: 0.2,
        },
        sessionInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
        emojiWrap: {
          width: 42,
          height: 42,
          borderRadius: 12,
          backgroundColor: colors.surface,
          justifyContent: "center",
          alignItems: "center",
        },
        emoji: { fontSize: 22 },
        sessionText: { flex: 1, gap: 3 },
        sessionTitle: {
          ...Typography.callout,
          color: colors.text.primary,
          fontWeight: "600",
        },
        sessionNote: {
          ...Typography.caption,
          color: colors.text.tertiary,
          fontStyle: "italic",
        },
        sessionMeta: { alignItems: "flex-end", gap: 2 },
        duration: {
          ...Typography.subhead,
          color: colors.text.primary,
          fontWeight: "600",
          fontVariant: ["tabular-nums"],
        },
        timeAgo: { ...Typography.caption, color: colors.text.tertiary },
        emptyState: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingVertical: 4,
        },
        emptyText: { ...Typography.subhead, color: colors.text.tertiary },
      }),
    [colors],
  );

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.label}>LAST SESSION</Text>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => router.push("/(tabs)/focus")}
          activeOpacity={0.8}
        >
          <Play
            size={12}
            color={colors.text.inverse}
            strokeWidth={2}
            fill={colors.text.inverse}
          />
          <Text style={styles.startBtnText}>Start Focus</Text>
        </TouchableOpacity>
      </View>

      {lastSession ? (
        <View style={styles.sessionInfo}>
          <View style={styles.emojiWrap}>
            <Text style={styles.emoji}>{cat?.emoji ?? "⚡"}</Text>
          </View>
          <View style={styles.sessionText}>
            <Text style={styles.sessionTitle}>
              {cat?.label ?? "Focus Session"}
            </Text>
            {lastSession.notes ? (
              <Text style={styles.sessionNote} numberOfLines={1}>
                "{lastSession.notes}"
              </Text>
            ) : null}
          </View>
          <View style={styles.sessionMeta}>
            <Text style={styles.duration}>
              {formatDuration(lastSession.duration)}
            </Text>
            <Text style={styles.timeAgo}>
              {timeAgo(lastSession.started_at)}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Clock size={18} color={colors.text.tertiary} strokeWidth={1.5} />
          <Text style={styles.emptyText}>
            No sessions yet — start your first!
          </Text>
        </View>
      )}
    </View>
  );
};
