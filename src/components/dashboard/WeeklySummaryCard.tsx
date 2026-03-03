import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Spacing } from '@/src/constants/spacing';
import type { WeeklySummary } from '@/src/hooks/useDashboard';

interface WeeklySummaryCardProps {
  summary: WeeklySummary;
}

const formatHours = (mins: number): string => {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const getDelta = (current: number, previous: number) => {
  if (previous === 0) return { pct: null, dir: 'neutral' as const };
  const pct = Math.round(((current - previous) / previous) * 100);
  return {
    pct: Math.abs(pct),
    dir: pct > 0 ? 'up' as const : pct < 0 ? 'down' as const : 'neutral' as const,
  };
};

interface StatColumnProps {
  label: string;
  thisWeek: string;
  lastWeek: string;
  delta: ReturnType<typeof getDelta>;
}

const StatColumn = ({ label, thisWeek, lastWeek, delta }: StatColumnProps) => {
  const Icon = delta.dir === 'up'
    ? TrendingUp
    : delta.dir === 'down'
    ? TrendingDown
    : Minus;

  const trendColor = delta.dir === 'up'
    ? Colors.accent.green
    : delta.dir === 'down'
    ? Colors.accent.red
    : Colors.text.tertiary;

  return (
    <View style={colStyles.wrapper}>
      <Text style={colStyles.label}>{label}</Text>
      <Text style={colStyles.thisWeek}>{thisWeek}</Text>
      <View style={colStyles.trendRow}>
        <Icon size={11} color={trendColor} strokeWidth={2} />
        {delta.pct !== null ? (
          <Text style={[colStyles.trendText, { color: trendColor }]}>
            {delta.pct}% vs last week
          </Text>
        ) : (
          <Text style={[colStyles.trendText, { color: Colors.text.tertiary }]}>
            No data last week
          </Text>
        )}
      </View>
      <Text style={colStyles.lastWeek}>Last: {lastWeek}</Text>
    </View>
  );
};

const colStyles = StyleSheet.create({
  wrapper:   { flex: 1, gap: 4 },
  label:     { ...Typography.caption, color: Colors.text.tertiary, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
  thisWeek:  { fontSize: 24, fontWeight: '700', color: Colors.text.primary, letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  trendRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendText: { ...Typography.caption, fontWeight: '600' },
  lastWeek:  { ...Typography.caption, color: Colors.text.tertiary },
});

export const WeeklySummaryCard = ({ summary }: WeeklySummaryCardProps) => {
  const focusDelta   = getDelta(summary.thisWeekMinutes, summary.lastWeekMinutes);
  const habitDelta   = getDelta(summary.thisWeekHabitsCompleted, summary.lastWeekHabitsCompleted);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>THIS WEEK</Text>
      <View style={styles.divider} />
      <View style={styles.columns}>
        <StatColumn
          label="Focus Time"
          thisWeek={formatHours(summary.thisWeekMinutes)}
          lastWeek={formatHours(summary.lastWeekMinutes)}
          delta={focusDelta}
        />
        <View style={styles.columnDivider} />
        <StatColumn
          label="Habits Done"
          thisWeek={String(summary.thisWeekHabitsCompleted)}
          lastWeek={String(summary.lastWeekHabitsCompleted)}
          delta={habitDelta}
        />
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
  title: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: -4,
  },
  columns: {
    flexDirection: 'row',
    gap: 16,
  },
  columnDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
});