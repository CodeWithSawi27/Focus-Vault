import { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";

interface OnboardingDotsProps {
  total: number;
  current: number;
}

export const OnboardingDots = ({ total, current }: OnboardingDotsProps) => {
  const { colors, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: "row",
          gap: 6,
          alignItems: "center",
          justifyContent: "center",
        },
        dot: { height: 6, borderRadius: 3 },
        dotActive: { width: 24, backgroundColor: colors.text.primary },
        dotInactive: {
          width: 6,
          backgroundColor: isDark
            ? "rgba(255,255,255,0.20)"
            : "rgba(0,0,0,0.15)",
        },
      }),
    [colors, isDark],
  );

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
