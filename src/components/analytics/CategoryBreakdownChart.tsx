import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Spacing } from "@/src/constants/spacing";
import type { CategoryPoint } from "@/src/hooks/useAnalytics";

interface CategoryBreakdownChartProps {
  data: CategoryPoint[];
}

const formatMinutes = (mins: number): string => {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const CategoryBreakdownChart = ({
  data,
}: CategoryBreakdownChartProps) => {
  const { colors } = useTheme();

  const totalMinutes = data.reduce((s, d) => s + d.minutes, 0);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.xl,
          padding: Spacing.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          gap: 14,
          ...Shadow.sm,
        },
        cardTitle: {
          ...Typography.caption,
          color: colors.text.tertiary,
          fontWeight: "600",
          letterSpacing: 1,
        },
        stackedBar: {
          height: 10,
          borderRadius: 5,
          flexDirection: "row",
          overflow: "hidden",
          backgroundColor: colors.surface,
        },
        legend: { gap: 10 },
        legendRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        legendLeft: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          flex: 1,
        },
        legendDot: { width: 8, height: 8, borderRadius: 4 },
        legendEmoji: { fontSize: 14 },
        legendLabel: {
          ...Typography.subhead,
          color: colors.text.primary,
          fontWeight: "500",
        },
        legendRight: { flexDirection: "row", alignItems: "center", gap: 10 },
        legendTime: {
          ...Typography.subhead,
          color: colors.text.primary,
          fontWeight: "600",
          fontVariant: ["tabular-nums"],
        },
        legendPct: {
          ...Typography.caption,
          color: colors.text.tertiary,
          width: 32,
          textAlign: "right",
          fontVariant: ["tabular-nums"],
        },
        totalRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          paddingTop: 4,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
        },
        totalLabel: {
          ...Typography.footnote,
          color: colors.text.tertiary,
          fontWeight: "500",
        },
        totalValue: {
          ...Typography.footnote,
          color: colors.text.primary,
          fontWeight: "700",
        },
        empty: {
          ...Typography.subhead,
          color: colors.text.tertiary,
          textAlign: "center",
          paddingVertical: 12,
        },
      }),
    [colors],
  );

  if (data.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>FOCUS CATEGORIES</Text>
        <Text style={styles.empty}>No sessions recorded yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>FOCUS CATEGORIES</Text>

      <View style={styles.stackedBar}>
        {data.map((cat) => (
          <View
            key={cat.id}
            style={{
              backgroundColor: cat.color,
              flex: cat.minutes,
              height: "100%",
            }}
          />
        ))}
      </View>

      <View style={styles.legend}>
        {data.map((cat) => (
          <View key={cat.id} style={styles.legendRow}>
            <View style={styles.legendLeft}>
              <View
                style={[styles.legendDot, { backgroundColor: cat.color }]}
              />
              <Text style={styles.legendEmoji}>{cat.emoji}</Text>
              <Text style={styles.legendLabel}>{cat.label}</Text>
            </View>
            <View style={styles.legendRight}>
              <Text style={styles.legendTime}>
                {formatMinutes(cat.minutes)}
              </Text>
              <Text style={styles.legendPct}>{cat.percentage}%</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Focus Time</Text>
        <Text style={styles.totalValue}>{formatMinutes(totalMinutes)}</Text>
      </View>
    </View>
  );
};
