import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Spacing } from '@/src/constants/spacing';
import type { ChartPoint } from '@/src/hooks/useAnalytics';

interface BestDayChartProps {
  data: ChartPoint[];
}

export const BestDayChart = ({ data }: BestDayChartProps) => {
  const maxY = useMemo(
    () => Math.max(...data.map(d => d.y), 1),
    [data]
  );

  const bestDay = useMemo(
    () => data.reduce((best, d) => (d.y > best.y ? d : best), data[0]),
    [data]
  );

  if (data.every(d => d.y === 0)) {
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
          <Text style={styles.bestBadgeText}>
            🏆 {bestDay?.x}
          </Text>
        </View>
      </View>

      {/* Custom bar chart */}
      <View style={styles.chartArea}>
        {data.map((point) => {
          const isBest    = point.x === bestDay?.x;
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
              <Text style={[
                styles.barLabel,
                isBest && styles.barLabelBest,
              ]}>
                {point.x.slice(0, 2)}
              </Text>
            </View>
          );
        })}
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
    gap: 16,
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
  bestBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bestBadgeText: {
    ...Typography.caption,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 100,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 4,
    minHeight: 4,
  },
  barBest: {
    backgroundColor: Colors.text.primary,
  },
  barLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontWeight: '500',
    fontSize: 11,
  },
  barLabelBest: {
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