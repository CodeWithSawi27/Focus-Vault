import { useMemo } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/src/context/ThemeContext";
import { Radius, Shadow } from "@/src/constants/theme";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  padding?: number;
}

export const GlassCard = ({
  children,
  style,
  intensity = 50,
  padding = 20,
}: GlassCardProps) => {
  const { colors, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          borderRadius: Radius.lg,
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          ...Shadow.md,
        },
        blur: { borderRadius: Radius.lg },
        inner: {
          // Light: translucent white glass. Dark: translucent dark glass.
          backgroundColor: isDark
            ? "rgba(28,28,30,0.75)"
            : "rgba(255,255,255,0.70)",
        },
      }),
    [colors, isDark],
  );

  return (
    <View style={[styles.wrapper, style]}>
      <BlurView
        intensity={intensity}
        tint={isDark ? "dark" : "light"}
        style={styles.blur}
      >
        <View style={[styles.inner, { padding }]}>{children}</View>
      </BlurView>
    </View>
  );
};
