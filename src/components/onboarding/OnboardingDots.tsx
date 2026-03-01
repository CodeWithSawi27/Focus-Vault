import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/src/constants/theme';

interface OnboardingDotsProps {
  total: number;
  current: number;
}

export const OnboardingDots = ({ total, current }: OnboardingDotsProps) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === current ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.text.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
});