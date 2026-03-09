import { useEffect, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/context/ThemeContext";
import { useTimer } from "@/src/hooks/useTimer";
import { useSessionHistory } from "@/src/hooks/useSessionHistory";
import { useWeeklyGoal } from "@/src/hooks/useWeeklyGoal";
import { useFocusSession } from "@/src/hooks/useFocusSession";
import { TimerRing } from "@/src/components/timer/TimerRing";
import { TimerControls } from "@/src/components/timer/TimerControls";
import { TimerPresets } from "@/src/components/timer/TimerPresets";
import { SessionCategoryPicker } from "@/src/components/timer/SessionCategoryPicker";
import { SessionNotesModal } from "@/src/components/timer/SessionNotesModal";
import { WeeklyGoalCard } from "@/src/components/timer/WeeklyGoalCard";
import { SessionHistoryList } from "@/src/components/timer/SessionHistoryList";
import { FocusActiveOverlay } from "@/src/components/timer/FocusActiveOverlay";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Layout, Spacing } from "@/src/constants/spacing";

const SESSION_TIPS = [
  "Silence notifications during your session.",
  "Keep water nearby — hydration aids focus.",
  "One task at a time beats multitasking every time.",
  "Take a 5 minute break after each session.",
  "Close unnecessary browser tabs before starting.",
];
const getTip = () =>
  SESSION_TIPS[new Date().getMinutes() % SESSION_TIPS.length];

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const useFadeUp = (delay = 0) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 240,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 240,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
};

export default function TimerScreen() {
  const { colors } = useTheme();

  const {
    duration,
    remaining,
    progress,
    status,
    pulseAnim,
    PRESETS,
    category,
    setCategory,
    start,
    pause,
    resume,
    stop,
    saveSessionNotes,
    selectPreset,
    setCustomDuration,
  } = useTimer();

  const { startFocusMode, endFocusMode } = useFocusSession();

  const {
    sessions,
    loading: historyLoading,
    fetchHistory,
  } = useSessionHistory();

  const {
    goalMinutes,
    completedMinutes,
    progress: goalProgress,
    fetchGoalData,
    updateGoal,
  } = useWeeklyGoal();

  const isActive = status === "running" || status === "paused";
  const isCompleted = status === "completed";
  const isIdle = status === "idle";

  // Elapsed = total duration minus remaining
  const elapsed = duration - remaining;

  const headerAnim = useFadeUp(0);
  const ringAnim = useFadeUp(80);
  const categoryAnim = useFadeUp(100);
  const presetsAnim = useFadeUp(160);
  const controlsAnim = useFadeUp(200);
  const statsAnim = useFadeUp(0);
  const goalAnim = useFadeUp(220);
  const tipAnim = useFadeUp(280);
  const historyAnim = useFadeUp(340);

  useEffect(() => {
    fetchHistory();
    fetchGoalData();
  }, [fetchHistory, fetchGoalData]);

  useEffect(() => {
    if (status === "completed") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [status]);

  // ─── Timer controls wired to focus mode ────────────────────────────────────
  const handleStart = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    start();
    await startFocusMode();
  }, [start, startFocusMode]);

  const handlePause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pause();
  }, [pause]);

  const handleResume = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resume();
  }, [resume]);

  const handleStop = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    stop();
    await endFocusMode();
  }, [stop, endFocusMode]);

  const handleSaveNotes = useCallback(
    async (notes: string) => {
      await saveSessionNotes(notes);
      await endFocusMode();
      fetchHistory();
      fetchGoalData();
    },
    [saveSessionNotes, endFocusMode, fetchHistory, fetchGoalData],
  );

  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.all([fetchHistory(), fetchGoalData()]);
  }, [fetchHistory, fetchGoalData]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        scroll: {
          flexGrow: 1,
          paddingHorizontal: Layout.screenPadding,
          paddingTop: Spacing.md,
          paddingBottom: 48,
          gap: Spacing.lg,
          alignItems: "center",
        },
        headerWrap: { alignSelf: "stretch", gap: 4 },
        fullWidth: { alignSelf: "stretch" },
        title: {
          ...Typography.title2,
          color: colors.text.primary,
          letterSpacing: -0.4,
        },
        subtitle: {
          ...Typography.subhead,
          color: colors.text.tertiary,
          lineHeight: 20,
        },
        ringContainer: { alignItems: "center", justifyContent: "center" },
        section: { gap: Spacing.sm, alignItems: "center" },
        sectionLabel: {
          ...Typography.caption,
          color: colors.text.tertiary,
          textTransform: "uppercase",
          letterSpacing: 1,
          fontWeight: "600",
          alignSelf: "flex-start",
        },
        controls: { alignSelf: "stretch", alignItems: "center" },
        statsRow: {
          flexDirection: "row",
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.lg,
          padding: Spacing.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          justifyContent: "space-around",
          ...Shadow.sm,
        },
        statItem: { alignItems: "center", gap: 4 },
        statValue: {
          ...Typography.callout,
          color: colors.text.primary,
          fontWeight: "600",
          fontVariant: ["tabular-nums"],
        },
        statLabel: {
          ...Typography.caption,
          color: colors.text.tertiary,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          fontWeight: "500",
        },
        statDivider: {
          width: StyleSheet.hairlineWidth,
          backgroundColor: colors.border,
        },
        tipCard: {
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.lg,
          padding: Spacing.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          gap: 4,
          ...Shadow.sm,
        },
        tipLabel: {
          ...Typography.caption,
          color: colors.text.tertiary,
          textTransform: "uppercase",
          letterSpacing: 1,
          fontWeight: "600",
        },
        tipText: {
          ...Typography.callout,
          color: colors.text.secondary,
          lineHeight: 22,
        },
      }),
    [colors],
  );

  return (
    // Fragment allows FocusActiveOverlay to sit outside SafeAreaView
    // so it covers the tab bar with zIndex: 9999
    <>
      <SafeAreaView style={styles.safe} edges={["top"]}>
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
                tintColor={colors.text.tertiary}
              />
            ) : undefined
          }
        >
          <Animated.View style={[styles.headerWrap, headerAnim]}>
            <Text style={styles.title}>Focus Timer</Text>
            <Text style={styles.subtitle}>
              {isActive
                ? "Stay focused — you're doing great"
                : isCompleted
                  ? "Session complete — take a break"
                  : "Choose a category and begin"}
            </Text>
          </Animated.View>

          <Animated.View style={[styles.ringContainer, ringAnim]}>
            <TimerRing
              progress={progress}
              remaining={remaining}
              status={status}
              pulseAnim={pulseAnim}
            />
          </Animated.View>

          {isIdle && (
            <>
              <Animated.View style={[styles.fullWidth, categoryAnim]}>
                <SessionCategoryPicker
                  selected={category}
                  onSelect={setCategory}
                />
              </Animated.View>

              <Animated.View style={[styles.fullWidth, presetsAnim]}>
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
              </Animated.View>
            </>
          )}

          <Animated.View style={[styles.fullWidth, controlsAnim]}>
            <View style={styles.controls}>
              <TimerControls
                status={status}
                onStart={handleStart}
                onPause={handlePause}
                onResume={handleResume}
                onStop={handleStop}
              />
            </View>
          </Animated.View>

          {isActive && (
            <Animated.View style={[styles.fullWidth, statsAnim]}>
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
            </Animated.View>
          )}

          {isIdle && (
            <>
              <Animated.View style={[styles.fullWidth, goalAnim]}>
                <WeeklyGoalCard
                  goalMinutes={goalMinutes}
                  completedMinutes={completedMinutes}
                  progress={goalProgress}
                  onUpdateGoal={updateGoal}
                />
              </Animated.View>

              <Animated.View style={[styles.fullWidth, tipAnim]}>
                <View style={styles.tipCard}>
                  <Text style={styles.tipLabel}>Tip</Text>
                  <Text style={styles.tipText}>{getTip()}</Text>
                </View>
              </Animated.View>

              <Animated.View style={[styles.fullWidth, historyAnim]}>
                <SessionHistoryList sessions={sessions} onViewAll={() => {}} />
              </Animated.View>
            </>
          )}
        </ScrollView>

        <SessionNotesModal
          visible={isCompleted}
          durationSeconds={duration}
          category={category}
          onSave={handleSaveNotes}
        />
      </SafeAreaView>

      {/* Rendered outside SafeAreaView — covers tab bar via zIndex: 9999 */}
      <FocusActiveOverlay
        visible={status === "running"}
        elapsedLabel={formatTime(elapsed)}
        totalLabel={formatTime(duration)}
        category={category ?? "Focus"}
        progressPercent={(elapsed / duration) * 100}
        onEndSession={handleStop}
      />
    </>
  );
}
