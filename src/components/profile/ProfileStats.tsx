import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";

interface ProfileStatsProps {
  totalHabits: number;
  totalSessions: number;
  totalFocusMinutes: number;
  longestStreak: number;
}

interface StatItemProps {
  value: string;
  label: string;
  bordered?: boolean;
}

const StatItem = ({ value, label, bordered }: StatItemProps) => {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        statItem: { flex: 1, alignItems: "center", gap: 4 },
        statBordered: {
          borderLeftWidth: StyleSheet.hairlineWidth,
          borderLeftColor: colors.border,
        },
        statValue: {
          ...Typography.title2,
          color: colors.text.primary,
          fontWeight: "700",
          letterSpacing: -0.5,
        },
        statLabel: {
          ...Typography.caption,
          color: colors.text.tertiary,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          fontWeight: "600",
        },
      }),
    [colors],
  );

  return (
    <View style={[styles.statItem, bordered && styles.statBordered]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

export const ProfileStats = ({
  totalHabits,
  totalSessions,
  totalFocusMinutes,
  longestStreak,
}: ProfileStatsProps) => {
  const { colors } = useTheme();

  const focusDisplay =
    totalFocusMinutes >= 60
      ? `${Math.floor(totalFocusMinutes / 60)}h`
      : `${totalFocusMinutes}m`;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.lg,
          padding: 16,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          gap: 12,
          ...Shadow.sm,
        },
        cardLabel: {
          ...Typography.caption,
          color: colors.text.tertiary,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          fontWeight: "600",
        },
        grid: { flexDirection: "row" },
      }),
    [colors],
  );

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Lifetime Stats</Text>
      <View style={styles.grid}>
        <StatItem value={`${totalHabits}`} label="Habits" />
        <StatItem value={`${totalSessions}`} label="Sessions" bordered />
        <StatItem value={focusDisplay} label="Focus" bordered />
        <StatItem value={`${longestStreak}d`} label="Best Streak" bordered />
      </View>
    </View>
  );
};
