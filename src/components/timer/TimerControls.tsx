import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Pause, Square } from 'lucide-react-native';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';

type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

interface TimerControlsProps {
  status: TimerStatus;
  onStart:  () => void;
  onPause:  () => void;
  onResume: () => void;
  onStop:   () => void;
}

export const TimerControls = ({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
}: TimerControlsProps) => {
  const showStop = status === 'running' || status === 'paused';
  const isCompleted = status === 'completed';

  return (
    <View style={styles.container}>
      {/* Stop button — left */}
      {showStop ? (
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onStop}
          activeOpacity={0.7}
        >
          <Square size={18} color={Colors.text.secondary} strokeWidth={1.8} />
          <Text style={styles.secondaryLabel}>Stop</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      {/* Primary action — center */}
      {isCompleted ? (
        <TouchableOpacity
          style={[styles.primaryBtn, styles.primaryBtnGreen]}
          onPress={onStop}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryLabel}>Done</Text>
        </TouchableOpacity>
      ) : status === 'idle' ? (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onStart}
          activeOpacity={0.8}
        >
          <Play
            size={22}
            color={Colors.text.inverse}
            strokeWidth={2}
            fill={Colors.text.inverse}
          />
          <Text style={styles.primaryLabel}>Start</Text>
        </TouchableOpacity>
      ) : status === 'running' ? (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onPause}
          activeOpacity={0.8}
        >
          <Pause size={22} color={Colors.text.inverse} strokeWidth={2} />
          <Text style={styles.primaryLabel}>Pause</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onResume}
          activeOpacity={0.8}
        >
          <Play
            size={22}
            color={Colors.text.inverse}
            strokeWidth={2}
            fill={Colors.text.inverse}
          />
          <Text style={styles.primaryLabel}>Resume</Text>
        </TouchableOpacity>
      )}

      <View style={styles.placeholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.text.primary,
    borderRadius: Radius.full,
    paddingVertical: 16,
    paddingHorizontal: 40,
    ...Shadow.md,
  },
  primaryBtnGreen: {
    backgroundColor: Colors.accent.green,
  },
  primaryLabel: {
    ...Typography.headline,
    color: Colors.text.inverse,
    letterSpacing: -0.2,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  secondaryLabel: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  placeholder: {
    width: 80,
  },
});