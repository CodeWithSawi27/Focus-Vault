import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Radius, Shadow } from '@/src/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  padding?: number;
}

export const GlassCard = ({ children, style, intensity = 50, padding = 20 }: GlassCardProps) => {
  return (
    <View style={[styles.wrapper, style]}>
      <BlurView intensity={intensity} tint="light" style={styles.blur}>
        <View style={[styles.inner, { padding }]}>{children}</View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
    ...Shadow.md,
  },
  blur: {
    borderRadius: Radius.lg,
  },
  inner: {
    backgroundColor: Colors.glass.background,
  },
});