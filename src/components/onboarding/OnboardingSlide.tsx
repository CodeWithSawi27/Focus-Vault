import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Colors, Typography, Radius } from '@/src/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SlideData {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  tag: string;
  title: string;
  subtitle: string;
}

interface OnboardingSlidePros {
  slide: SlideData;
}

export const OnboardingSlide = ({ slide }: OnboardingSlidePros) => {
  const Icon = slide.icon;

  return (
    <View style={styles.container}>
      {/* Icon card */}
      <View style={[styles.iconCard, { backgroundColor: slide.iconBg }]}>
        <Icon size={40} color={slide.iconColor} strokeWidth={1.5} />
      </View>

      {/* Text block */}
      <View style={styles.textBlock}>
        <View style={styles.tagWrap}>
          <Text style={styles.tag}>{slide.tag}</Text>
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    gap: 36,
    alignItems: 'flex-start',
  },
  iconCard: {
    width: 88,
    height: 88,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    gap: 12,
  },
  tagWrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  tag: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  subtitle: {
    ...Typography.callout,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
});