import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Spacing } from '@/src/constants/spacing';
import type { HeatmapDay } from '@/src/hooks/useAnalytics';

interface MonthlyHeatmapProps {
  data: HeatmapDay[];
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const LEVEL_COLORS = [
  'rgba(0,0,0,0.05)',  // 0 — empty
  'rgba(0,0,0,0.15)',  // 1 — low
  'rgba(0,0,0,0.30)',  // 2 — medium
  'rgba(0,0,0,0.55)',  // 3 — high
  'rgba(0,0,0,0.85)',  // 4 — max
];

export const MonthlyHeatmap = ({ data }: MonthlyHeatmapProps) => {
  // Pad so grid starts on correct day of week
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

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.cardTitle}>ACTIVITY — LAST 5 WEEKS</Text>
        <Text style={styles.totalText}>
          {totalActivity} activities
        </Text>
      </View>

      {/* Day of week labels */}
      <View style={styles.dayLabels}>
        {DAY_LABELS.map((label, i) => (
          <Text key={i} style={styles.dayLabel}>{label}</Text>
        ))}
      </View>

      {/* Grid */}
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
                        : 'transparent',
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* Legend */}
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.07)',
    gap: 12,
    ...Shadow.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  totalText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  dayLabels: {
    flexDirection: 'row',
    gap: 4,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontSize: 10,
    fontWeight: '500',
  },
  grid: {
    gap: 4,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 4,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 3,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'flex-end',
    paddingTop: 2,
  },
  legendLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontSize: 10,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});