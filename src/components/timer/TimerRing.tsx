import { useEffect, useRef, useMemo } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography } from "@/src/constants/theme";

interface TimerRingProps {
  progress: number;
  remaining: number;
  status: "idle" | "running" | "paused" | "completed";
  pulseAnim: Animated.Value;
}

const SIZE = 270;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
};

const STATUS_LABEL: Record<string, string> = {
  idle: "READY",
  running: "FOCUSING",
  paused: "PAUSED",
  completed: "COMPLETE",
};

export const TimerRing = ({
  progress,
  remaining,
  status,
  pulseAnim,
}: TimerRingProps) => {
  const { colors, isDark } = useTheme();

  const animatedStroke = useRef(new Animated.Value(CIRCUMFERENCE)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const last10sPulse = useRef(new Animated.Value(1)).current;

  const isCompleted = status === "completed";
  const isPaused = status === "paused";
  const isRunning = status === "running";

  // Smooth arc progress
  useEffect(() => {
    Animated.timing(animatedStroke, {
      toValue: CIRCUMFERENCE * (1 - Math.min(progress, 1)),
      duration: 500,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.linear),
    }).start();
  }, [progress]);

  // Completion checkmark bounce
  useEffect(() => {
    if (isCompleted) {
      Animated.spring(checkAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [isCompleted]);

  // Last-10s heartbeat
  useEffect(() => {
    if (isRunning && remaining <= 10 && remaining > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(last10sPulse, {
            toValue: 1.1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(last10sPulse, {
            toValue: 1.0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      // Stop the loop cleanly when not in last-10s window
      last10sPulse.stopAnimation();
      last10sPulse.setValue(1);
    }
  }, [remaining, isRunning]);

  // Ring color adapts to dark mode
  const ringColor = isCompleted
    ? colors.accent.green
    : isPaused
      ? colors.border
      : colors.text.primary;

  // Track ring is slightly more visible in dark mode
  const trackColor = isDark
    ? "rgba(255,255,255,0.08)"
    : `rgba(0,0,0,${isRunning ? 0.06 : 0.04})`;

  // Gradient stops adapt to mode
  const gradStart = isCompleted
    ? colors.accent.green
    : isDark
      ? "#E0E0E0"
      : "#111111";
  const gradEnd = isCompleted ? "#4CAF50" : isDark ? "#888888" : "#444444";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          width: SIZE,
          height: SIZE,
          justifyContent: "center",
          alignItems: "center",
        },
        svg: { position: "absolute" },
        center: { alignItems: "center", gap: 2 },
        statusLabel: {
          ...Typography.caption,
          color: colors.text.tertiary,
          letterSpacing: 2,
          fontWeight: "600",
          marginBottom: 4,
        },
        statusPaused: { color: colors.text.tertiary },
        time: {
          fontSize: 58,
          fontWeight: "200",
          color: colors.text.primary,
          letterSpacing: -3,
          fontVariant: ["tabular-nums"],
        },
        timePaused: { color: colors.text.tertiary },
        doneCheck: {
          fontSize: 60,
          fontWeight: "300",
          color: colors.accent.green,
          lineHeight: 72,
        },
        progressPct: {
          ...Typography.caption,
          color: colors.text.tertiary,
          letterSpacing: 0.5,
          marginTop: 4,
        },
        completeLabel: {
          ...Typography.subhead,
          color: colors.accent.green,
          fontWeight: "500",
          marginTop: 2,
        },
      }),
    [colors],
  );

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: pulseAnim }] }]}
    >
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradStart} />
            <Stop offset="100%" stopColor={gradEnd} />
          </LinearGradient>
        </Defs>

        {/* Track */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={trackColor}
          strokeWidth={STROKE}
          fill="none"
        />

        {/* Progress arc */}
        {progress > 0 && (
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={ringColor}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={animatedStroke}
            strokeLinecap="round"
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        )}
      </Svg>

      <View style={styles.center}>
        <Text style={[styles.statusLabel, isPaused && styles.statusPaused]}>
          {STATUS_LABEL[status]}
        </Text>

        {isCompleted ? (
          <Animated.Text
            style={[styles.doneCheck, { transform: [{ scale: checkAnim }] }]}
          >
            ✓
          </Animated.Text>
        ) : (
          <Animated.Text
            style={[
              styles.time,
              isPaused && styles.timePaused,
              { transform: [{ scale: last10sPulse }] },
            ]}
          >
            {formatTime(remaining)}
          </Animated.Text>
        )}

        {status !== "idle" && !isCompleted && (
          <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
        )}

        {isCompleted && <Text style={styles.completeLabel}>Well done</Text>}
      </View>
    </Animated.View>
  );
};
