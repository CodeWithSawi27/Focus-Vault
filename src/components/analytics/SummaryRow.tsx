import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Clock, Target, TrendingUp, CheckSquare } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import type { AnalyticsSummary } from "@/src/hooks/useAnalytics";

interface SummaryRowProps {
  summary: AnalyticsSummary;
}

interface StatTileProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const StatTile = ({ icon, value, label }: StatTileProps) => {
  const { colors, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        tileWrapper: {
          flex: 1,
          borderRadius: Radius.lg,
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          ...Shadow.sm,
        },
        blur: { flex: 1 },
        tileInner: {
          padding: 14,
          backgroundColor: isDark
            ? "rgba(28,28,30,0.85)"
            : "rgba(255,255,255,0.7)",
          gap: 4,
          minHeight: 90,
          justifyContent: "space-between",
        },
        iconWrap: {
          width: 30,
          height: 30,
          borderRadius: 8,
          backgroundColor: colors.surface,
          justifyContent: "center",
          alignItems: "center",
        },
        tileValue: {
          ...Typography.title3,
          color: colors.text.primary,
          letterSpacing: -0.4,
          fontWeight: "700",
        },
        tileLabel: {
          ...Typography.caption,
          color: colors.text.tertiary,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          fontWeight: "600",
        },
      }),
    [colors, isDark],
  );

  return (
    <View style={styles.tileWrapper}>
      <BlurView
        intensity={50}
        tint={isDark ? "dark" : "light"}
        style={styles.blur}
      >
        <View style={styles.tileInner}>
          <View style={styles.iconWrap}>{icon}</View>
          <Text style={styles.tileValue}>{value}</Text>
          <Text style={styles.tileLabel}>{label}</Text>
        </View>
      </BlurView>
    </View>
  );
};

export const SummaryRow = ({ summary }: SummaryRowProps) => {
  const { colors } = useTheme();

  const focusDisplay =
    summary.totalFocusMinutes >= 60
      ? `${Math.floor(summary.totalFocusMinutes / 60)}h ${summary.totalFocusMinutes % 60}m`
      : `${summary.totalFocusMinutes}m`;

  return (
    <View style={staticStyles.grid}>
      <View style={staticStyles.row}>
        <StatTile
          icon={
            <Clock size={16} color={colors.text.secondary} strokeWidth={1.8} />
          }
          value={focusDisplay}
          label="Focus Time"
        />
        <StatTile
          icon={
            <Target size={16} color={colors.text.secondary} strokeWidth={1.8} />
          }
          value={`${summary.totalSessions}`}
          label="Sessions"
        />
      </View>
      <View style={staticStyles.row}>
        <StatTile
          icon={
            <TrendingUp
              size={16}
              color={colors.text.secondary}
              strokeWidth={1.8}
            />
          }
          value={`${summary.avgCompletionRate}%`}
          label="Avg Completion"
        />
        <StatTile
          icon={
            <CheckSquare
              size={16}
              color={colors.text.secondary}
              strokeWidth={1.8}
            />
          }
          value={`${summary.totalHabitsCompleted}`}
          label="Habits Done"
        />
      </View>
    </View>
  );
};

const staticStyles = StyleSheet.create({
  grid: { gap: 8 },
  row: { flexDirection: "row", gap: 8 },
});
