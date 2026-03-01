import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Clock, Target, TrendingUp, CheckSquare } from 'lucide-react-native';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import type { AnalyticsSummary } from '@/src/hooks/useAnalytics';

interface SummaryRowProps {
  summary: AnalyticsSummary;
}

interface StatTileProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const StatTile = ({ icon, value, label }: StatTileProps) => (
  <View style={styles.tileWrapper}>
    <BlurView intensity={50} tint="light" style={styles.blur}>
      <View style={styles.tileInner}>
        <View style={styles.iconWrap}>{icon}</View>
        <Text style={styles.tileValue}>{value}</Text>
        <Text style={styles.tileLabel}>{label}</Text>
      </View>
    </BlurView>
  </View>
);

export const SummaryRow = ({ summary }: SummaryRowProps) => {
  const focusDisplay = summary.totalFocusMinutes >= 60
    ? `${Math.floor(summary.totalFocusMinutes / 60)}h ${summary.totalFocusMinutes % 60}m`
    : `${summary.totalFocusMinutes}m`;

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <StatTile
          icon={<Clock size={16} color={Colors.text.secondary} strokeWidth={1.8} />}
          value={focusDisplay}
          label="Focus Time"
        />
        <StatTile
          icon={<Target size={16} color={Colors.text.secondary} strokeWidth={1.8} />}
          value={`${summary.totalSessions}`}
          label="Sessions"
        />
      </View>
      <View style={styles.row}>
        <StatTile
          icon={<TrendingUp size={16} color={Colors.text.secondary} strokeWidth={1.8} />}
          value={`${summary.avgCompletionRate}%`}
          label="Avg Completion"
        />
        <StatTile
          icon={<CheckSquare size={16} color={Colors.text.secondary} strokeWidth={1.8} />}
          value={`${summary.totalHabitsCompleted}`}
          label="Habits Done"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: { gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  tileWrapper: {
    flex: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    ...Shadow.sm,
  },
  blur: { flex: 1 },
  tileInner: {
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    gap: 4,
    minHeight: 90,
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileValue: {
    ...Typography.title3,
    color: Colors.text.primary,
    letterSpacing: -0.4,
    fontWeight: '700',
  },
  tileLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
});