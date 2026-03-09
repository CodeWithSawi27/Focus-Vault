import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Spacing } from "@/src/constants/spacing";
import type { HeatmapDay } from "@/src/hooks/useAnalytics";

interface MonthlyHeatmapProps {
  data: HeatmapDay[];
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

// Professional blue-scale — mirrors GitHub/Linear heatmap aesthetic
const LEVEL_COLORS_LIGHT = [
  "rgba(10,132,255,0.06)", // 0 — empty
  "rgba(10,132,255,0.20)", // 1 — low
  "rgba(10,132,255,0.42)", // 2 — medium
  "rgba(10,132,255,0.68)", // 3 — high
  "rgba(10,132,255,1.00)", // 4 — max
];

const LEVEL_COLORS_DARK = [
  "rgba(10,132,255,0.10)", // 0 — empty
  "rgba(10,132,255,0.28)", // 1 — low
  "rgba(10,132,255,0.50)", // 2 — medium
  "rgba(10,132,255,0.74)", // 3 — high
  "rgba(10,132,255,1.00)", // 4 — max
];

export const MonthlyHeatmap = ({ data }: MonthlyHeatmapProps) => {
  const { colors, isDark } = useTheme();
  const LEVEL_COLORS = isDark ? LEVEL_COLORS_DARK : LEVEL_COLORS_LIGHT;

  const paddedData = useMemo(() => {
    if (data.length === 0) return [];
    const firstDayOfWeek = new Date(data[0].date).getDay();
    const padding = Array.from({ length: firstDayOfWeek }, () => null);
    return [...padding, ...data];
  }, [data]);

  const weeks = useMemo(() => {
    const rows: (HeatmapDay | null)[][] = [];
    for (let i = 0; i < paddedData.length; i += 7) {
      rows.push(paddedData.slice(i, i + 7));
    }
    return rows;
  }, [paddedData]);

  const totalActivity = data.reduce((sum, d) => sum + d.count, 0);

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
        cardTitle: {
          ...Typography.caption,
          color: colors.text.tertiary,
          fontWeight: "600",
          letterSpacing: 1,
        },
        totalText: {
          ...Typography.caption,
          color: colors.text.secondary,
          fontWeight: "500",
        },
        dayLabels: { flexDirection: "row", gap: 4 },
        dayLabel: {
          flex: 1,
          textAlign: "center",
          ...Typography.caption,
          color: colors.text.tertiary,
          fontSize: 10,
          fontWeight: "500",
        },
        grid: { gap: 4 },
        weekRow: { flexDirection: "row", gap: 4 },
        cell: { flex: 1, aspectRatio: 1, borderRadius: 3 },
        legendRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          justifyContent: "flex-end",
          paddingTop: 2,
        },
        legendLabel: {
          ...Typography.caption,
          color: colors.text.tertiary,
          fontSize: 10,
        },
        legendCell: { width: 10, height: 10, borderRadius: 2 },
      }),
    [colors],
  );

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.cardTitle}>ACTIVITY — LAST 5 WEEKS</Text>
        <Text style={styles.totalText}>{totalActivity} activities</Text>
      </View>

      <View style={styles.dayLabels}>
        {DAY_LABELS.map((label, i) => (
          <Text key={i} style={styles.dayLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {weeks.map((week, weekIdx) => (
          <View key={weekIdx} style={styles.weekRow}>
            {Array.from({ length: 7 }, (_, dayIdx) => {
              const cell = week[dayIdx] ?? null;
              return (
                <View
                  key={dayIdx}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: cell
                        ? LEVEL_COLORS[cell.level]
                        : "transparent",
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.legendRow}>
        <Text style={styles.legendLabel}>Less</Text>
        {LEVEL_COLORS.map((color, i) => (
          <View
            key={i}
            style={[styles.legendCell, { backgroundColor: color }]}
          />
        ))}
        <Text style={styles.legendLabel}>More</Text>
      </View>
    </View>
  );
};
