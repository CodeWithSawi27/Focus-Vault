import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Spacing } from '@/src/constants/spacing';
import type { CategoryPoint } from '@/src/hooks/useAnalytics';

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
  if (data.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>FOCUS CATEGORIES</Text>
        <Text style={styles.empty}>No sessions recorded yet</Text>
      </View>
    );
  }

  const totalMinutes = data.reduce((s, d) => s + d.minutes, 0);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>FOCUS CATEGORIES</Text>

      {/* Stacked bar */}
      <View style={styles.stackedBar}>
        {data.map(cat => (
          <View
            key={cat.id}
            style={[
              styles.stackSegment,
              {
                backgroundColor: cat.color,
                flex: cat.minutes,
              },
            ]}
          />
        ))}
      </View>

      {/* Legend rows */}
      <View style={styles.legend}>
        {data.map(cat => (
          <View key={cat.id} style={styles.legendRow}>
            {/* Left */}
            <View style={styles.legendLeft}>
              <View
                style={[styles.legendDot, { backgroundColor: cat.color }]}
              />
              <Text style={styles.legendEmoji}>{cat.emoji}</Text>
              <Text style={styles.legendLabel}>{cat.label}</Text>
            </View>

            {/* Right */}
            <View style={styles.legendRight}>
              <Text style={styles.legendTime}>
                {formatMinutes(cat.minutes)}
              </Text>
              <Text style={styles.legendPct}>{cat.percentage}%</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Focus Time</Text>
        <Text style={styles.totalValue}>{formatMinutes(totalMinutes)}</Text>
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
    gap: 14,
    ...Shadow.sm,
  },
  cardTitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  stackedBar: {
    height: 10,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  stackSegment: {
    height: '100%',
  },
  legend: {
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendEmoji: {
    fontSize: 14,
  },
  legendLabel: {
    ...Typography.subhead,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendTime: {
    ...Typography.subhead,
    color: Colors.text.primary,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  legendPct: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    width: 32,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  totalLabel: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  totalValue: {
    ...Typography.footnote,
    color: Colors.text.primary,
    fontWeight: '700',
  },
  empty: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: 12,
  },
});