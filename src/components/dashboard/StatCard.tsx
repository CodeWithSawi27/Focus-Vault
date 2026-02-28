import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  accent?: string;
  style?: ViewStyle;
}

export const StatCard = ({ label, value, subtitle, accent, style }: StatCardProps) => {
  return (
    <View style={[styles.wrapper, style]}>
      <BlurView intensity={50} tint="light" style={styles.blur}>
        <View style={styles.inner}>
          <Text style={styles.label}>{label}</Text>
          <Text style={[styles.value, accent ? { color: accent } : null]}>{value}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    ...Shadow.sm,
  },
  blur: { flex: 1 },
  inner: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'space-between',
    minHeight: 96,
    gap: 4,
  },
  label: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  value: {
    ...Typography.title2,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
  },
});