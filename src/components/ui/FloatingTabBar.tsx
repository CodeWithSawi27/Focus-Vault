import { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Shadow, Radius } from "@/src/constants/theme";

// ─── Export so tab screens can pad their scroll content ───────────────────────
export const FLOATING_TAB_BAR_HEIGHT = 80;
export const FLOATING_TAB_BAR_BOTTOM_OFFSET = 24;

// ─── Per-item animated press wrapper ─────────────────────────────────────────
const AnimatedPressable = ({
  children,
  onPress,
  onLongPress,
  accessibilityRole,
  accessibilityState,
  accessibilityLabel,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityRole: "button";
  accessibilityState?: object;
  accessibilityLabel?: string;
  style?: object;
}) => {
  const scale = useMemo(() => new Animated.Value(1), []);

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scale]);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

// ─── Main floating tab bar ────────────────────────────────────────────────────
export const FloatingTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const bottomOffset = Math.max(insets.bottom, 16) + 8;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        // Outer wrapper — positions the bar on screen
        container: {
          position: "absolute",
          bottom: bottomOffset,
          left: 24,
          right: 24,
          borderRadius: Radius.xl,
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.07)",
          // Rich shadow so it visually lifts off the screen
          ...Shadow.lg,
          shadowOpacity: isDark ? 0.4 : 0.12,
          shadowRadius: 24,
        },

        // BlurView fills the container
        blur: {
          borderRadius: Radius.xl,
        },

        // Semi-transparent layer on top of blur for extra tinting
        inner: {
          flexDirection: "row",
          paddingVertical: 10,
          paddingHorizontal: 6,
          backgroundColor: isDark
            ? "rgba(15,15,15,0.82)"
            : "rgba(252,252,252,0.82)",
        },

        // Each tab item
        tabItem: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          paddingVertical: 2,
        },

        // Icon container — gets a background when focused
        iconWrap: {
          width: 46,
          height: 30,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 10,
        },

        iconWrapActive: {
          backgroundColor: isDark
            ? "rgba(255,255,255,0.12)"
            : "rgba(0,0,0,0.07)",
        },

        // Label
        label: {
          fontSize: 10,
          fontWeight: "500",
          letterSpacing: 0.2,
        },
      }),
    [colors, isDark, bottomOffset],
  );

  return (
    <View style={styles.container} pointerEvents="box-none">
      <BlurView
        intensity={isDark ? 50 : 70}
        tint={isDark ? "dark" : "light"}
        style={styles.blur}
      >
        <View style={styles.inner}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const focused = state.index === index;

            const label =
              options.tabBarLabel !== undefined
                ? String(options.tabBarLabel)
                : options.title !== undefined
                  ? options.title
                  : route.name;

            const color = focused ? colors.text.primary : colors.text.tertiary;

            const handlePress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const handleLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <AnimatedPressable
                key={route.key}
                onPress={handlePress}
                onLongPress={handleLongPress}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                style={styles.tabItem}
              >
                <View
                  style={[styles.iconWrap, focused && styles.iconWrapActive]}
                >
                  {options.tabBarIcon?.({
                    focused,
                    color,
                    size: 22,
                  })}
                </View>

                <Text style={[styles.label, { color }]}>{label}</Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};
