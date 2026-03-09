import { useEffect, useRef, useMemo } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Spacing } from "@/src/constants/spacing";

interface HabitCompletionRingProps {
  completed: number;
  total: number;
}

const SIZE = 130;
const STROKE = 9;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUM = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const HabitCompletionRing = ({
  completed,
  total,
}: HabitCompletionRingProps) => {
  const { colors } = useTheme();

  const progress = total > 0 ? Math.min(completed / total, 1) : 0;
  const allDone = total > 0 && completed >= total;
  const animVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUM, 0],
  });
  const pct = Math.round(progress * 100);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.xl,
          padding: Spacing.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          gap: Spacing.md,
          ...Shadow.md,
        },
        left: { alignItems: "center", justifyContent: "center" },
        ringWrap: {
          width: SIZE,
          height: SIZE,
          alignItems: "center",
          justifyContent: "center",
        },
        svg: { position: "absolute" },
        center: { alignItems: "center", gap: 1 },
        doneEmoji: { fontSize: 36 },
        countText: {
          fontSize: 30,
          fontWeight: "600",
          color: colors.text.primary,
          letterSpacing: -1,
          fontVariant: ["tabular-nums"],
        },
        countEmpty: { color: colors.text.tertiary },
        totalText: {
          fontSize: 18,
          fontWeight: "400",
          color: colors.text.tertiary,
        },
        pctText: {
          ...Typography.caption,
          color: colors.text.tertiary,
          letterSpacing: 0.3,
        },
        right: { flex: 1, gap: 5 },
        sectionTag: {
          ...Typography.caption,
          color: colors.text.tertiary,
          fontWeight: "600",
          letterSpacing: 1,
        },
        headline: {
          ...Typography.title3,
          color: colors.text.primary,
          fontWeight: "700",
          letterSpacing: -0.3,
        },
        subtext: {
          ...Typography.footnote,
          color: colors.text.secondary,
          lineHeight: 18,
        },
        barTrack: {
          height: 4,
          backgroundColor: colors.surface,
          borderRadius: 2,
          overflow: "hidden",
          marginTop: 4,
        },
      }),
    [colors],
  );

  const progressColor = allDone ? colors.accent.green : colors.text.primary;

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.ringWrap}>
          <Svg width={SIZE} height={SIZE} style={styles.svg}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={colors.surface}
              strokeWidth={STROKE}
              fill="none"
            />
            {total > 0 && (
              <AnimatedCircle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke={progressColor}
                strokeWidth={STROKE}
                fill="none"
                strokeDasharray={CIRCUM}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${SIZE / 2}, ${SIZE / 2}`}
              />
            )}
          </Svg>
          <View style={styles.center}>
            {allDone ? (
              <Text style={styles.doneEmoji}>🎉</Text>
            ) : (
              <>
                <Text
                  style={[styles.countText, total === 0 && styles.countEmpty]}
                >
                  {completed}
                  <Text style={styles.totalText}>/{total}</Text>
                </Text>
                <Text style={styles.pctText}>
                  {total > 0 ? `${pct}%` : "--"}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.sectionTag}>TODAY'S HABITS</Text>
        <Text style={styles.headline}>
          {total === 0
            ? "No habits yet"
            : allDone
              ? "All done!"
              : completed === 0
                ? "Let's get started"
                : `${total - completed} remaining`}
        </Text>
        <Text style={styles.subtext}>
          {total === 0
            ? "Add habits to track your progress"
            : allDone
              ? "Fantastic work today 🔥"
              : `${completed} of ${total} habits complete`}
        </Text>
        {total > 0 && (
          <View style={styles.barTrack}>
            <Animated.View
              style={{
                height: "100%",
                borderRadius: 2,
                backgroundColor: progressColor,
                width: animVal.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
};
