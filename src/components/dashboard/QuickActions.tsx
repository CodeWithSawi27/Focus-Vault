import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Timer, Plus } from 'lucide-react-native';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Spacing } from '@/src/constants/spacing';

export const QuickActions = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.action, styles.focusAction]}
          onPress={() => router.push('/(tabs)/timer')}
          activeOpacity={0.8}
        >
          <View style={styles.iconWrap}>
            <Timer size={22} color="#FFFFFF" strokeWidth={1.8} />
          </View>
          <Text style={styles.actionLabel}>Start Focus</Text>
          <Text style={styles.actionSub}>Pomodoro timer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.action, styles.habitAction]}
          onPress={() => router.push('/(tabs)/habits')}
          activeOpacity={0.8}
        >
          <View style={[styles.iconWrap, styles.habitIconWrap]}>
            <Plus size={22} color={Colors.accent.green} strokeWidth={2} />
          </View>
          <Text style={[styles.actionLabel, styles.habitLabel]}>Add Habit</Text>
          <Text style={[styles.actionSub, styles.habitSub]}>Track a new goal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  title: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  action: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: 16,
    gap: 6,
    ...Shadow.sm,
  },
  focusAction: {
    backgroundColor: Colors.primary,
  },
  habitAction: {
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  habitIconWrap: {
    backgroundColor: Colors.accent.greenMuted,
  },
  actionLabel: {
    ...Typography.callout,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  habitLabel: {
    color: Colors.text.primary,
  },
  actionSub: {
    ...Typography.footnote,
    color: 'rgba(255,255,255,0.6)',
  },
  habitSub: {
    color: Colors.text.tertiary,
  },
});