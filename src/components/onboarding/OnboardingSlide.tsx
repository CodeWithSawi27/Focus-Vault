import { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions, Image, ImageSourcePropType } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius } from "@/src/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface SlideData {
  icon?: LucideIcon;
  image?: ImageSourcePropType;
  imageSize?: number;
  iconBg: string;
  iconColor: string;
  tag: string;
  title: string;
  subtitle: string;
}

interface OnboardingSlideProps {
  slide: SlideData;
}

export const OnboardingSlide = ({ slide }: OnboardingSlideProps) => {
  const { colors, isDark } = useTheme();
  const Icon = slide.icon;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          width: SCREEN_WIDTH,
          flex: 1,
          paddingHorizontal: 32,
          justifyContent: "center",
          gap: 36,
          alignItems: "flex-start",
        },
        iconCard: {
          width: 88,
          height: 88,
          borderRadius: 28,
          justifyContent: "center",
          alignItems: "center",
        },
        mascot: {
          width: slide.imageSize ?? 130,
          height: slide.imageSize ?? 130,
          resizeMode: "contain",
          marginLeft: -10,
        },
        textBlock: { gap: 12 },
        tagWrap: {
          alignSelf: "flex-start",
          backgroundColor: isDark
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.05)",
          borderRadius: Radius.full,
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)",
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
      }),
    [colors, isDark],
  );

  return (
    <View style={styles.container}>
      {slide.image ? (
        <Image source={slide.image} style={styles.mascot} />
      ) : (
        <View style={[styles.iconCard, { backgroundColor: slide.iconBg }]}>
          {Icon && <Icon size={40} color={slide.iconColor} strokeWidth={1.5} />}
        </View>
      )}
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
