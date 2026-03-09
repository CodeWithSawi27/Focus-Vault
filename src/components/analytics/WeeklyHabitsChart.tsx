import { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import type { ChartPoint } from "@/src/hooks/useAnalytics";

const CHART_WIDTH = Dimensions.get("window").width - 48;

interface WeeklyHabitsChartProps {
  data: ChartPoint[];
}

export const WeeklyHabitsChart = ({ data }: WeeklyHabitsChartProps) => {
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

  const hasData = data.some((d) => d.y > 0);
  const chartData = {
    labels: data.map((d) => d.x),
    datasets: [{ data: data.map((d) => (d.y === 0 ? 0.01 : d.y)) }],
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Habits Completed</Text>
        <Text style={styles.subtitle}>Last 7 days</Text>
      </View>

      {!hasData ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No habit data yet</Text>
        </View>
      ) : (
        <BarChart
          data={chartData}
          width={CHART_WIDTH}
          height={180}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero
          showValuesOnTopOfBars
          withInnerLines={false}
          chartConfig={{
            backgroundColor: colors.surfaceStrong,
            backgroundGradientFrom: colors.surfaceStrong,
            backgroundGradientTo: colors.surfaceStrong,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(10,132,255,${opacity})`,
            labelColor: () => colors.text.tertiary,
            barPercentage: 0.55,
            propsForLabels: { fontSize: 11, fontWeight: "500" },
            propsForBackgroundLines: { stroke: "transparent" },
          }}
          style={styles.chart}
        />
      )}
    </View>
  );
};
