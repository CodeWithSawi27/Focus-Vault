import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Spacing } from "@/src/constants/spacing";
import type { ChartPoint } from "@/src/hooks/useAnalytics";

interface BestDayChartProps {
  data: ChartPoint[];
}

export const BestDayChart = ({ data }: BestDayChartProps) => {
  const { colors } = useTheme();

  const maxY = useMemo(() => Math.max(...data.map((d) => d.y), 1), [data]);
  const bestDay = useMemo(
    () => data.reduce((best, d) => (d.y > best.y ? d : best), data[0]),
    [data],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.xl,
          padding: Spacing.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          gap: 16,
          ...Shadow.sm,
        },
        topRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        cardTitle: {
          ...Typography.caption,
          color: colors.text.tertiary,
          fontWeight: "600",
          letterSpacing: 1,
        },
        bestBadge: {
          backgroundColor: colors.surface,
          borderRadius: Radius.full,
          paddingHorizontal: 10,
          paddingVertical: 4,
        },
        bestBadgeText: {
          ...Typography.caption,
          color: colors.text.primary,
          fontWeight: "600",
        },
        chartArea: {
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 6,
          height: 100,
        },
        barColumn: {
          flex: 1,
          alignItems: "center",
          gap: 6,
          height: "100%",
          justifyContent: "flex-end",
        },
        barTrack: { width: "100%", flex: 1, justifyContent: "flex-end" },
        bar: {
          width: "100%",
          backgroundColor: colors.border,
          borderRadius: 4,
          minHeight: 4,
        },
        barBest: { backgroundColor: colors.text.primary },
        barLabel: {
          ...Typography.caption,
          color: colors.text.tertiary,
          fontWeight: "500",
          fontSize: 11,
        },
        barLabelBest: { color: colors.text.primary, fontWeight: "700" },
        empty: {
          ...Typography.subhead,
          color: colors.text.tertiary,
          textAlign: "center",
          paddingVertical: 12,
        },
      }),
    [colors],
  );

  if (data.every((d) => d.y === 0)) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>BEST DAY OF WEEK</Text>
        <Text style={styles.empty}>Not enough data yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.cardTitle}>BEST DAY OF WEEK</Text>
        <View style={styles.bestBadge}>
          <Text style={styles.bestBadgeText}>🏆 {bestDay?.x}</Text>
        </View>
      </View>

      <View style={styles.chartArea}>
        {data.map((point) => {
          const isBest = point.x === bestDay?.x;
          const barHeight = Math.max((point.y / maxY) * 100, 4);
          return (
            <View key={point.x} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    { height: `${barHeight}%` },
                    isBest && styles.barBest,
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, isBest && styles.barLabelBest]}>
                {point.x.slice(0, 2)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
