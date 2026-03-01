import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors, Typography } from '@/src/constants/theme';
import { useEffect, useRef } from 'react';

interface TimerRingProps {
  progress: number;
  remaining: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
  pulseAnim: Animated.Value;
}

const SIZE = 270;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
};

const STATUS_LABEL: Record<string, string> = {
  idle: 'READY',
  running: 'FOCUSING',
  paused: 'PAUSED',
  completed: 'COMPLETE',
};

export const TimerRing = ({ progress, remaining, status, pulseAnim }: TimerRingProps) => {
  const animatedStroke = useRef(new Animated.Value(CIRCUMFERENCE)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const last10sPulse = useRef(new Animated.Value(1)).current;

  const isCompleted = status === 'completed';
  const isPaused = status === 'paused';
  const isRunning = status === 'running';

  // Smooth progress animation
  useEffect(() => {
    const offset = CIRCUMFERENCE * (1 - Math.min(progress, 1));
    Animated.timing(animatedStroke, {
      toValue: offset,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.linear),
    }).start();
  }, [progress]);

  // Checkmark animation on completion
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

  // Last 10s heartbeat pulse
  useEffect(() => {
    if (isRunning && remaining <= 10 && remaining > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(last10sPulse, { toValue: 1.1, duration: 300, useNativeDriver: true }),
          Animated.timing(last10sPulse, { toValue: 1, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [remaining, isRunning]);

  const ringColor = isCompleted
    ? Colors.accent.green
    : isPaused
    ? 'rgba(0,0,0,0.2)'
    : Colors.text.primary;

  const trackOpacity = isRunning ? 0.06 : 0.04;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={isCompleted ? Colors.accent.green : '#111111'} />
            <Stop offset="100%" stopColor={isCompleted ? '#4CAF50' : '#444444'} />
          </LinearGradient>
        </Defs>

        {/* Track */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={`rgba(0,0,0,${trackOpacity})`}
          strokeWidth={STROKE}
          fill="none"
        />

        {/* Animated Progress arc */}
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

      {/* Center content */}
      <View style={styles.center}>
        <Text style={[styles.statusLabel, isPaused && styles.statusPaused]}>
          {STATUS_LABEL[status]}
        </Text>

        {isCompleted ? (
          <Animated.Text
            style={[
              styles.doneCheck,
              { transform: [{ scale: checkAnim }] },
            ]}
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

        {status !== 'idle' && !isCompleted && (
          <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
        )}

        {isCompleted && <Text style={styles.completeLabel}>Well done</Text>}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
    gap: 2,
  },
  statusLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusPaused: {
    color: 'rgba(0,0,0,0.25)',
  },
  time: {
    fontSize: 58,
    fontWeight: '200',
    color: Colors.text.primary,
    letterSpacing: -3,
    fontVariant: ['tabular-nums'],
  },
  timePaused: {
    color: 'rgba(0,0,0,0.3)',
  },
  doneCheck: {
    fontSize: 60,
    fontWeight: '300',
    color: Colors.accent.green,
    lineHeight: 72,
  },
  progressPct: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  completeLabel: {
    ...Typography.subhead,
    color: Colors.accent.green,
    fontWeight: '500',
    marginTop: 2,
  },
});