import { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimer } from '@/src/hooks/useTimer';
import { useSessionHistory } from '@/src/hooks/useSessionHistory';
import { useWeeklyGoal } from '@/src/hooks/useWeeklyGoal';
import { TimerRing } from '@/src/components/timer/TimerRing';
import { TimerControls } from '@/src/components/timer/TimerControls';
import { TimerPresets } from '@/src/components/timer/TimerPresets';
import { SessionCategoryPicker } from '@/src/components/timer/SessionCategoryPicker';
import { SessionNotesModal } from '@/src/components/timer/SessionNotesModal';
import { WeeklyGoalCard } from '@/src/components/timer/WeeklyGoalCard';
import { SessionHistoryList } from '@/src/components/timer/SessionHistoryList';
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
    category, setCategory,
    start, pause, resume, stop,
    saveSessionNotes,
    selectPreset, setCustomDuration,
  } = useTimer();

  const { sessions, loading: historyLoading, fetchHistory } = useSessionHistory();
  const {
    goalMinutes, completedMinutes, progress: goalProgress,
    fetchGoalData, updateGoal,
  } = useWeeklyGoal();

  const isActive    = status === 'running' || status === 'paused';
  const isCompleted = status === 'completed';
  const isIdle      = status === 'idle';

  // Load data on mount
  useEffect(() => {
    fetchHistory();
    fetchGoalData();
  }, [fetchHistory, fetchGoalData]);

  // Refresh after session saved
  const handleSaveNotes = useCallback(async (notes: string) => {
    await saveSessionNotes(notes);
    fetchHistory();
    fetchGoalData();
  }, [saveSessionNotes, fetchHistory, fetchGoalData]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchHistory(), fetchGoalData()]);
  }, [fetchHistory, fetchGoalData]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={isIdle || isCompleted}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          isIdle ? (
            <RefreshControl
              refreshing={historyLoading}
              onRefresh={handleRefresh}
              tintColor={Colors.text.tertiary}
            />
          ) : undefined
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Focus Timer</Text>
          <Text style={styles.subtitle}>
            {isActive    ? 'Stay focused — you\'re doing great'   :
             isCompleted ? 'Session complete — take a break'       :
                           'Choose a category and begin'}
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

        {/* ── IDLE STATE ── */}
        {isIdle && (
          <>
            {/* Category picker */}
            <SessionCategoryPicker
              selected={category}
              onSelect={setCategory}
            />

            {/* Presets */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Duration</Text>
              <TimerPresets
                presets={PRESETS}
                currentDuration={duration}
                disabled={false}
                onSelect={selectPreset}
                onCustom={setCustomDuration}
              />
            </View>
          </>
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

        {/* Stats row — running/paused */}
        {isActive && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.floor(duration / 60)}m</Text>
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
              <Text style={styles.statValue}>{Math.round(progress * 100)}%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>
        )}

        {/* ── IDLE — cards below fold ── */}
        {isIdle && (
          <>
            {/* Weekly goal */}
            <WeeklyGoalCard
              goalMinutes={goalMinutes}
              completedMinutes={completedMinutes}
              progress={goalProgress}
              onUpdateGoal={updateGoal}
            />

            {/* Tip card */}
            <View style={styles.tipCard}>
              <Text style={styles.tipLabel}>Tip</Text>
              <Text style={styles.tipText}>{getTip()}</Text>
            </View>

            {/* Session history */}
            <SessionHistoryList
              sessions={sessions}
              onViewAll={() => {}}
            />
          </>
        )}
      </ScrollView>

      {/* Session notes modal — shown on completion */}
      <SessionNotesModal
        visible={isCompleted}
        durationSeconds={duration}
        category={category}
        onSave={handleSaveNotes}
      />
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
    gap: Spacing.lg,
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
    alignSelf: 'flex-start',
  },
  controls: {
    alignSelf: 'stretch',
    alignItems: 'center',
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
});