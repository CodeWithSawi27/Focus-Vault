import { useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ListChecks, Timer, BarChart2, Zap } from 'lucide-react-native';
import { useOnboardingStore } from '@/src/store/onboardingStore';
import { OnboardingSlide } from '@/src/components/onboarding/OnboardingSlide';
import { OnboardingDots } from '@/src/components/onboarding/OnboardingDots';
import type { SlideData } from '@/src/components/onboarding/OnboardingSlide';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES: SlideData[] = [
  {
    icon: Zap,
    iconBg: '#111111',
    iconColor: '#FFFFFF',
    tag: 'Welcome',
    title: 'Build Focus.\nBuild Habits.',
    subtitle:
      'FocusVault helps you track habits, run focused work sessions, and watch your consistency compound over time.',
  },
  {
    icon: ListChecks,
    iconBg: 'rgba(37, 103, 30, 0.1)',
    iconColor: Colors.accent.green,
    tag: 'Habit Tracker',
    title: 'Small habits.\nBig results.',
    subtitle:
      'Create daily and weekly habits, track streaks, and build momentum with a simple check-in system.',
  },
  {
    icon: Timer,
    iconBg: 'rgba(0,0,0,0.05)',
    iconColor: Colors.text.primary,
    tag: 'Focus Timer',
    title: 'Deep work,\non demand.',
    subtitle:
      'Use structured 25, 50, or 90 minute focus sessions to do your best work — every single day.',
  },
  {
    icon: BarChart2,
    iconBg: 'rgba(26, 86, 219, 0.08)',
    iconColor: Colors.accent.blue,
    tag: 'Analytics',
    title: 'See your\nprogress clearly.',
    subtitle:
      "Weekly charts, streak history, and session summaries show you exactly how consistent you've been.",
  },
];

export default function OnboardingScreen() {
  const router                          = useRouter();
  const { complete: completeOnboarding } = useOnboardingStore();
  const scrollRef                        = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex]    = useState(0);

  const isLast = activeIndex === SLIDES.length - 1;

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setActiveIndex(index);
    },
    []
  );

  const handleGetStarted = useCallback(async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  }, [completeOnboarding, router]);

  const handleSkip = useCallback(async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  }, [completeOnboarding, router]);

  const handleNext = useCallback(() => {
    if (isLast) {
      handleGetStarted();
      return;
    }
    scrollRef.current?.scrollTo({
      x: (activeIndex + 1) * SCREEN_WIDTH,
      animated: true,
    });
  }, [activeIndex, isLast, handleGetStarted]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Skip button */}
      {!isLast && (
        <View style={styles.skipRow}>
          <TouchableOpacity
            onPress={handleSkip}
            activeOpacity={0.6}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.slider}
        bounces={false}
      >
        {SLIDES.map((slide, i) => (
          <OnboardingSlide key={i} slide={slide} />
        ))}
      </ScrollView>

      {/* Bottom controls */}
      <View style={styles.bottom}>
        <OnboardingDots total={SLIDES.length} current={activeIndex} />

        <TouchableOpacity
          style={[styles.nextBtn, isLast && styles.nextBtnGreen]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextBtnText}>
            {isLast ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skipRow: {
    paddingHorizontal: 24,
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  slider: {
    flex: 1,
  },
  bottom: {
    paddingHorizontal: 32,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 24,
    alignItems: 'center',
  },
  nextBtn: {
    alignSelf: 'stretch',
    backgroundColor: Colors.text.primary,
    borderRadius: Radius.full,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  nextBtnGreen: {
    backgroundColor: Colors.accent.green,
  },
  nextBtnText: {
    ...Typography.headline,
    color: Colors.text.inverse,
    letterSpacing: -0.2,
  },
});