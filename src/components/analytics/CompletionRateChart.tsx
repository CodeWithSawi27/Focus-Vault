import { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import type { ChartPoint } from "@/src/hooks/useAnalytics";

const CHART_WIDTH = Dimensions.get("window").width - 48;

interface CompletionRateChartProps {
  data: ChartPoint[];
}

export const CompletionRateChart = ({ data }: CompletionRateChartProps) => {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.lg,
          paddingTop: 16,
          paddingBottom: 4,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          ...Shadow.sm,
        },
        header: { paddingHorizontal: 16, gap: 2, marginBottom: 4 },
        title: {
          ...Typography.callout,
          color: colors.text.primary,
          fontWeight: "600",
          letterSpacing: -0.2,
        },
        subtitle: {
          ...Typography.caption,
          color: colors.text.tertiary,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          fontWeight: "600",
        },
        chart: { marginLeft: -8 },
        empty: { height: 180, justifyContent: "center", alignItems: "center" },
        emptyText: { ...Typography.subhead, color: colors.text.tertiary },
      }),
    [colors],
  );

  if (data.length === 0) return null;

  const hasData = data.some((d) => d.y > 0);
  const labels = data.map((d, i) => (i % 5 === 0 ? d.x : ""));
  const chartData = { labels, datasets: [{ data: data.map((d) => d.y) }] };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Completion Rate</Text>
        <Text style={styles.subtitle}>% of habits done per day — 30 days</Text>
      </View>

      {!hasData ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No completion data yet</Text>
        </View>
      ) : (
        <LineChart
          data={chartData}
          width={CHART_WIDTH}
          height={180}
          yAxisSuffix="%"
          yAxisLabel=""
          fromZero
          withDots={false}
          withInnerLines={false}
          withOuterLines={false}
          withShadow={false}
          bezier
          chartConfig={{
            backgroundColor: colors.surfaceStrong,
            backgroundGradientFrom: colors.surfaceStrong,
            backgroundGradientTo: colors.surfaceStrong,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(10,132,255,${opacity})`,
            labelColor: () => colors.text.tertiary,
            strokeWidth: 2,
            propsForLabels: { fontSize: 10, fontWeight: "500" },
            propsForBackgroundLines: {
              stroke: colors.border,
              strokeDasharray: "4",
            },
          }}
          style={styles.chart}
        />
      )}
    </View>
  );
};
