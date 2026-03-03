import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Spacing } from '@/src/constants/spacing';

interface HabitCompletionRingProps {
  completed: number;
  total: number;
}

const SIZE   = 130;
const STROKE = 9;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUM = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const HabitCompletionRing = ({
  completed,
  total,
}: HabitCompletionRingProps) => {
  const progress = total > 0 ? Math.min(completed / total, 1) : 0;
  const allDone  = total > 0 && completed >= total;

  const animVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue:        progress,
      duration:       800,
      easing:         Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = animVal.interpolate({
    inputRange:  [0, 1],
    outputRange: [CIRCUM, 0],
  });

  const pct = Math.round(progress * 100);

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.ringWrap}>
          <Svg width={SIZE} height={SIZE} style={styles.svg}>
            {/* Track */}
            <Circle
              cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
              stroke="rgba(0,0,0,0.06)"
              strokeWidth={STROKE}
              fill="none"
            />
            {/* Progress */}
            {total > 0 && (
              <AnimatedCircle
                cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
                stroke={allDone ? Colors.accent.green : Colors.text.primary}
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

          {/* Center label */}
          <View style={styles.center}>
            {allDone ? (
              <Text style={styles.doneEmoji}>🎉</Text>
            ) : (
              <>
                <Text style={[styles.countText, total === 0 && styles.countEmpty]}>
                  {completed}
                  <Text style={styles.totalText}>/{total}</Text>
                </Text>
                <Text style={styles.pctText}>{total > 0 ? `${pct}%` : '--'}</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Right — contextual label */}
      <View style={styles.right}>
        <Text style={styles.sectionTag}>TODAY'S HABITS</Text>
        <Text style={styles.headline}>
          {total === 0
            ? 'No habits yet'
            : allDone
            ? 'All done!'
            : completed === 0
            ? 'Let\'s get started'
            : `${total - completed} remaining`}
        </Text>
        <Text style={styles.subtext}>
          {total === 0
            ? 'Add habits to track your progress'
            : allDone
            ? 'Fantastic work today 🔥'
            : `${completed} of ${total} habits complete`}
        </Text>

        {/* Mini progress bar */}
        {total > 0 && (
          <View style={styles.barTrack}>
            <Animated.View
              style={[
                styles.barFill,
                {
                  backgroundColor: allDone
                    ? Colors.accent.green
                    : Colors.text.primary,
                  width: animVal.interpolate({
                    inputRange:  [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.07)',
    gap: Spacing.md,
    ...Shadow.md,
  },
  left: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
    gap: 1,
  },
  doneEmoji: {
    fontSize: 36,
  },
  countText: {
    fontSize: 30,
    fontWeight: '600',
    color: Colors.text.primary,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  countEmpty: {
    color: Colors.text.tertiary,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.text.tertiary,
  },
  pctText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    letterSpacing: 0.3,
  },
  right: {
    flex: 1,
    gap: 5,
  },
  sectionTag: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  headline: {
    ...Typography.title3,
    color: Colors.text.primary,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtext: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  barTrack: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});