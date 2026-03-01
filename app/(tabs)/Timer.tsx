import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimer } from '@/src/hooks/useTimer';
import { TimerRing } from '@/src/components/timer/TimerRing';
import { TimerControls } from '@/src/components/timer/TimerControls';
import { TimerPresets } from '@/src/components/timer/TimerPresets';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Layout, Spacing } from '@/src/constants/spacing';

const SESSION_TIPS = [
  'Silence notifications during your session.',
  'Keep water nearby — hydration aids focus.',
  'One task at a time beats multitasking every time.',
  'Take a 5 minute break after each session.',
  'Close unnecessary browser tabs before starting.',
];

const getTip = () => SESSION_TIPS[new Date().getMinutes() % SESSION_TIPS.length];

export default function TimerScreen() {
  const {
    duration, remaining, progress, status,
    pulseAnim, PRESETS,
    start, pause, resume, stop,
    selectPreset, setCustomDuration,
  } = useTimer();

  const isActive    = status === 'running' || status === 'paused';
  const isCompleted = status === 'completed';
  const isIdle      = status === 'idle';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={isIdle || isCompleted}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Focus Timer</Text>
          <Text style={styles.subtitle}>
            {isActive    ? 'Stay focused — you\'re doing great'   :
             isCompleted ? 'Session complete — take a break'       :
                           'Set a duration and begin your session'}
          </Text>
        </View>

        {/* Ring */}
        <View style={styles.ringContainer}>
          <TimerRing
            progress={progress}
            remaining={remaining}
            status={status}
            pulseAnim={pulseAnim}
          />
        </View>

        {/* Presets — only idle */}
        {isIdle && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Duration</Text>
            <TimerPresets
              presets={PRESETS}
              currentDuration={duration}
              disabled={isActive}
              onSelect={selectPreset}
              onCustom={setCustomDuration}
            />
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <TimerControls
            status={status}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onStop={stop}
          />
        </View>

        {/* Tip card — only idle */}
        {isIdle && (
          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>Tip</Text>
            <Text style={styles.tipText}>{getTip()}</Text>
          </View>
        )}

        {/* Session stats while active */}
        {isActive && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.floor(duration / 60)}m
              </Text>
              <Text style={styles.statLabel}>Target</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.floor(remaining / 60)}m {remaining % 60}s
              </Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(progress * 100)}%
              </Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>
        )}

        {/* Completion card */}
        {isCompleted && (
          <View style={styles.completedCard}>
            <Text style={styles.completedTitle}>Session saved</Text>
            <Text style={styles.completedSub}>
              {Math.floor(duration / 60)} minutes of focused work logged.
              Your streak is building — take a short break.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: 48,
    gap: Spacing.xl,
    alignItems: 'center',
  },
  header: {
    alignSelf: 'stretch',
    gap: 4,
  },
  title: {
    ...Typography.title2,
    color: Colors.text.primary,
    letterSpacing: -0.4,
  },
  subtitle: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
    lineHeight: 20,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  section: {
    alignSelf: 'stretch',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  controls: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  tipCard: {
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.07)',
    gap: 4,
    ...Shadow.sm,
  },
  tipLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  tipText: {
    ...Typography.callout,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  statsRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.07)',
    justifyContent: 'space-around',
    ...Shadow.sm,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    ...Typography.callout,
    color: Colors.text.primary,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '500',
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  completedCard: {
    alignSelf: 'stretch',
    backgroundColor: Colors.accent.greenMuted,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(37, 103, 30, 0.18)',
    gap: 6,
  },
  completedTitle: {
    ...Typography.headline,
    color: Colors.accent.green,
    fontWeight: '600',
  },
  completedSub: {
    ...Typography.subhead,
    color: Colors.accent.green,
    opacity: 0.85,
    lineHeight: 20,
  },
});