import { useRef, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/src/store/onboardingStore";
import { useTheme } from "@/src/context/ThemeContext";
import { OnboardingDots } from "@/src/components/onboarding/OnboardingDots";
import { Typography, Radius, Shadow } from "@/src/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SlideData {
  image: ReturnType<typeof require>;
  tag: string;
  title: string;
  subtitle: string;
}

const SLIDES: SlideData[] = [
  {
    image: require("@/assets/mascots/mascot_welcome.png"),
    tag: "Welcome",
    title: "Build Focus.\nBuild Habits.",
    subtitle:
      "FocusVault helps you track habits, run focused work sessions, and watch your consistency compound over time.",
  },
  {
    image: require("@/assets/Habit-Tracker.png"),
    tag: "Habit Tracker",
    title: "Small habits.\nBig results.",
    subtitle:
      "Create daily and weekly habits, track streaks, and build momentum with a simple check-in system.",
  },
  {
    image: require("@/assets/Focus-Timer.png"),
    tag: "Focus Timer",
    title: "Deep work,\non demand.",
    subtitle:
      "Use structured 25, 50, or 90 minute focus sessions to do your best work — every single day.",
  },
  {
    image: require("@/assets/Analytics.png"),
    tag: "Analytics",
    title: "See your\nprogress clearly.",
    subtitle:
      "Weekly charts, streak history, and session summaries show you exactly how consistent you've been.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { complete: completeOnboarding } = useOnboardingStore();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLast = activeIndex === SLIDES.length - 1;

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setActiveIndex(index);
    },
    [],
  );

  const handleGetStarted = useCallback(async () => {
    await completeOnboarding();
    router.replace("/(auth)/login");
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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        skipRow: {
          paddingHorizontal: 24,
          paddingTop: 8,
          alignItems: "flex-end",
        },
        skipBtn: { paddingHorizontal: 12, paddingVertical: 6 },
        skipText: {
          ...Typography.subhead,
          color: colors.text.tertiary,
          fontWeight: "500",
        },
        slider: { flex: 1 },
        slide: {
          width: SCREEN_WIDTH,
          flex: 1,
          paddingHorizontal: 32,
          justifyContent: "center",
          gap: 32,
        },
        imageContainer: {
          width: "100%",
          aspectRatio: 1,
          maxHeight: SCREEN_WIDTH * 0.75,
          borderRadius: Radius.xl,
          overflow: "hidden",
          backgroundColor: colors.surface,
          alignSelf: "center",
        },
        image: { width: "100%", height: "100%" },
        textBlock: { gap: 12 },
        tagWrap: {
          alignSelf: "flex-start",
          backgroundColor: colors.surface,
          borderRadius: Radius.full,
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderWidth: 1,
          borderColor: colors.border,
        },
        tag: {
          ...Typography.caption,
          color: colors.text.secondary,
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: 1,
        },
        title: {
          fontSize: 34,
          fontWeight: "700",
          color: colors.text.primary,
          letterSpacing: -0.8,
          lineHeight: 40,
        },
        subtitle: {
          ...Typography.callout,
          color: colors.text.secondary,
          lineHeight: 24,
        },
        bottom: {
          paddingHorizontal: 32,
          paddingBottom: 24,
          paddingTop: 16,
          gap: 24,
          alignItems: "center",
        },
        nextBtn: {
          alignSelf: "stretch",
          backgroundColor: colors.primary,
          borderRadius: Radius.full,
          paddingVertical: 17,
          alignItems: "center",
          justifyContent: "center",
          ...Shadow.md,
        },
        nextBtnGreen: { backgroundColor: colors.accent.green },
        nextBtnText: {
          ...Typography.headline,
          color: colors.text.inverse,
          letterSpacing: -0.2,
        },
      }),
    [colors],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {!isLast && (
        <View style={styles.skipRow}>
          <TouchableOpacity
            onPress={handleGetStarted}
            activeOpacity={0.6}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

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
          <View key={i} style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image
                source={slide.image}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
            <View style={styles.textBlock}>
              <View style={styles.tagWrap}>
                <Text style={styles.tag}>{slide.tag}</Text>
              </View>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottom}>
        <OnboardingDots total={SLIDES.length} current={activeIndex} />
        <TouchableOpacity
          style={[styles.nextBtn, isLast && styles.nextBtnGreen]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextBtnText}>
            {isLast ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
