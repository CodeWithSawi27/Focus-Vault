import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import type { TodayStats } from "@/src/hooks/useDashboard";

export type { TodayStats };

interface StatsGridProps {
  stats: TodayStats;
}
interface InnerStatCardProps {
  value: string;
  label: string;
  sublabel?: string;
}

const InnerStatCard = ({ value, label, sublabel }: InnerStatCardProps) => {
  const { colors } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flex: 1,
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.lg,
          padding: 14,
          gap: 2,
          minHeight: 88,
          justifyContent: "space-between",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          ...Shadow.sm,
        },
        value: {
          fontSize: 26,
          fontWeight: "700",
          color: colors.text.primary,
          letterSpacing: -0.8,
          fontVariant: ["tabular-nums"],
        },
        label: {
          ...Typography.subhead,
          color: colors.text.primary,
          fontWeight: "600",
        },
        sublabel: {
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
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
    </View>
  );
};

export const StatsGrid = ({ stats }: StatsGridProps) => {
  const focusDisplay =
    stats.focusMinutesToday >= 60
      ? `${Math.floor(stats.focusMinutesToday / 60)}h ${stats.focusMinutesToday % 60}m`
      : `${stats.focusMinutesToday}m`;

  return (
    <View style={staticStyles.grid}>
      <View style={staticStyles.row}>
        <InnerStatCard
          value={`${stats.habitsCompleted}/${stats.totalHabits}`}
          label="Today"
          sublabel="Habits done"
        />
        <InnerStatCard
          value={`${stats.longestStreak}d`}
          label="Streak"
          sublabel="Current best"
        />
      </View>
      <View style={staticStyles.row}>
        <InnerStatCard value={focusDisplay} label="Focus" sublabel="Today" />
        <InnerStatCard
          value={`${stats.sessionsThisWeek}`}
          label="Sessions"
          sublabel="This week"
        />
      </View>
    </View>
  );
};

const staticStyles = StyleSheet.create({
  grid: { gap: 8 },
  row: { flexDirection: "row", gap: 8 },
});
