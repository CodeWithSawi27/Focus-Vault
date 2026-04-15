import { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Clock } from "lucide-react-native";

const MASCOT_EMPTY = require("@/assets/mascots/mascot_empty.png");
import { useTheme } from "@/src/context/ThemeContext";
import { getCategoryById } from "@/src/constants/categories";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Spacing } from "@/src/constants/spacing";
import type { FocusSessionRecord } from "@/src/hooks/useSessionHistory";

interface SessionHistoryListProps {
  sessions: FocusSessionRecord[];
  onViewAll?: () => void;
}

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export const SessionHistoryList = ({
  sessions,
  onViewAll,
}: SessionHistoryListProps) => {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: { alignSelf: "stretch", gap: 8 },
        titleRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 2,
        },
        sectionLabel: {
          ...Typography.caption,
          color: colors.text.tertiary,
          textTransform: "uppercase",
          letterSpacing: 1,
          fontWeight: "600",
        },
        viewAll: {
          ...Typography.caption,
          color: colors.text.secondary,
          fontWeight: "600",
          textDecorationLine: "underline",
        },
        card: {
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          overflow: "hidden",
          ...Shadow.sm,
        },
        row: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
          paddingVertical: 12,
          gap: 12,
        },
        rowBorder: {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        emojiWrap: {
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: colors.surface,
          justifyContent: "center",
          alignItems: "center",
        },
        emoji: { fontSize: 18 },
        rowContent: { flex: 1, gap: 2 },
        rowTitle: {
          ...Typography.callout,
          color: colors.text.primary,
          fontWeight: "500",
        },
        rowNote: {
          ...Typography.caption,
          color: colors.text.tertiary,
          fontStyle: "italic",
        },
        rowDate: { ...Typography.caption, color: colors.text.tertiary },
        rowRight: { alignItems: "flex-end", gap: 2 },
        duration: {
          ...Typography.subhead,
          color: colors.text.primary,
          fontWeight: "600",
          fontVariant: ["tabular-nums"],
        },
        rowDateRight: { ...Typography.caption, color: colors.text.tertiary },
        empty: {
          alignSelf: "stretch",
          alignItems: "center",
          paddingVertical: Spacing.xl,
          gap: 12,
        },
        mascot: {
          width: 100,
          height: 100,
          resizeMode: "contain",
        },
        emptyText: {
          ...Typography.callout,
          color: colors.text.secondary,
          fontWeight: "500",
        },
        emptySubtext: {
          ...Typography.footnote,
          color: colors.text.tertiary,
          textAlign: "center",
        },
      }),
    [colors],
  );

  if (sessions.length === 0) {
    return (
      <View style={styles.empty}>
        <Image source={MASCOT_EMPTY} style={styles.mascot} />
        <Text style={styles.emptyText}>No sessions yet</Text>
        <Text style={styles.emptySubtext}>
          Complete your first session to see history
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <Text style={styles.sectionLabel}>Recent Sessions</Text>
        {onViewAll && sessions.length >= 5 && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        {sessions.slice(0, 5).map((session, index) => {
          const cat = getCategoryById(session.category);
          const isLast = index === Math.min(sessions.length, 5) - 1;
          return (
            <View
              key={session.id}
              style={[styles.row, !isLast && styles.rowBorder]}
            >
              <View style={styles.emojiWrap}>
                <Text style={styles.emoji}>{cat?.emoji ?? "⚡"}</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>
                  {cat?.label ?? "Focus Session"}
                </Text>
                {session.notes ? (
                  <Text style={styles.rowNote} numberOfLines={1}>
                    {session.notes}
                  </Text>
                ) : (
                  <Text style={styles.rowDate}>
                    {formatDate(session.started_at)}
                  </Text>
                )}
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.duration}>
                  {formatDuration(session.duration)}
                </Text>
                <Text style={styles.rowDateRight}>
                  {formatDate(session.started_at)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};
