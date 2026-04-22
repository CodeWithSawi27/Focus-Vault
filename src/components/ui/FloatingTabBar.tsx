import { useMemo, useCallback } from "react";
import { View, StyleSheet, Pressable, Animated, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/src/context/ThemeContext";
import { Radius } from "@/src/constants/theme";

// ─── Constants for layout ────────────────────────────────────────────────────
export const FLOATING_TAB_BAR_HEIGHT = 64;
export const TAB_BAR_SIDE_MARGIN = 24;
// This is the total height occupied at the bottom of the screen
export const TOTAL_TAB_BAR_SPACING = (insetsBottom: number) =>
  FLOATING_TAB_BAR_HEIGHT + insetsBottom;

const AnimatedPressable = ({
  children,
  onPress,
  onLongPress,
  focused,
}: any) => {
  const scale = useMemo(() => new Animated.Value(1), []);

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.9, // Slightly more pronounced for better feedback
      useNativeDriver: true,
      speed: 50,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }, [scale]);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ flex: 1, alignItems: "center" }}
    >
      <Animated.View
        style={{
          transform: [{ scale }],
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

export const FloatingTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Reduced the bottom offset to 16px + safe area for a more "docked" look
  const bottomOffset = Math.max(insets.bottom, 16);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          position: "absolute",
          bottom: bottomOffset,
          left: TAB_BAR_SIDE_MARGIN,
          right: TAB_BAR_SIDE_MARGIN,
          height: FLOATING_TAB_BAR_HEIGHT,
          borderRadius: Radius.full,
          backgroundColor: isDark
            ? "rgba(20, 20, 20, 0.8)"
            : "rgba(255, 255, 255, 0.85)",
          borderWidth: 1,
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.05)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.5 : 0.15,
          shadowRadius: 12,
          elevation: 5,
          overflow: Platform.OS === "ios" ? "visible" : "hidden", // Allow shadow on iOS
        },
        blur: {
          flex: 1,
          borderRadius: Radius.full,
          overflow: "hidden",
        },
        inner: {
          flexDirection: "row",
          height: "100%",
          paddingHorizontal: 8,
          alignItems: "center",
        },
        iconWrap: {
          width: 44,
          height: 44,
          justifyContent: "center",
          alignItems: "center",
        },
        activeIndicator: {
          position: "absolute",
          bottom: -6,
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.accent.sage,
        },
      }),
    [colors, isDark, bottomOffset],
  );

  return (
    <View style={styles.container}>
      <BlurView
        intensity={Platform.OS === "ios" ? 30 : 100}
        tint={isDark ? "dark" : "light"}
        style={styles.blur}
      >
        <View style={styles.inner}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const focused = state.index === index;
            if (options.href === null) return null;

            const color = focused
              ? colors.accent.sage
              : isDark
                ? "#888888"
                : "#4A4A4A";

            return (
              <AnimatedPressable
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                focused={focused}
              >
                <View style={styles.iconWrap}>
                  {options.tabBarIcon?.({ focused, color, size: 24 })}
                  {focused && <View style={styles.activeIndicator} />}
                </View>
              </AnimatedPressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};
