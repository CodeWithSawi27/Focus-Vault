import { useRef, useMemo } from "react";
import {
  Animated,
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius } from "@/src/constants/theme";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: "primary" | "ghost" | "danger";
}

export const PrimaryButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
  variant = "primary",
}: PrimaryButtonProps) => {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  const handlePressOut = () =>
    Animated.spring(scale, {
      toValue: 1.0,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.selectionAsync();
    onPress();
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          height: 52,
          borderRadius: Radius.md,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        },
        primary: { backgroundColor: colors.primary },
        ghost: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: colors.border,
        },
        danger: { backgroundColor: colors.accent.redMuted },
        disabled: { opacity: 0.4 },
        label: {
          ...Typography.headline,
          color: colors.text.inverse,
          letterSpacing: -0.1,
        },
        // Ghost text uses primary text color so it's legible on any background
        labelGhost: { color: colors.text.primary },
        labelDanger: { color: colors.accent.red },
      }),
    [colors],
  );

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.base,
          variant === "primary" && styles.primary,
          variant === "ghost" && styles.ghost,
          variant === "danger" && styles.danger,
          (disabled || loading) && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={
              variant === "ghost" ? colors.text.primary : colors.text.inverse
            }
            size="small"
          />
        ) : (
          <Text
            style={[
              styles.label,
              variant === "ghost" && styles.labelGhost,
              variant === "danger" && styles.labelDanger,
            ]}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};
