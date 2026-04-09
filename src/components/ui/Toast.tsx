import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warning" | "loading";

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastMessage {
  id: string;
  message: string;
  description?: string;
  type: ToastType;
  duration?: number;
  persistent?: boolean;
  action?: ToastAction;
  dismissed?: boolean;
  onPress?: () => void;
}

interface ToastItemProps {
  toast: ToastMessage;
  onHide: (id: string) => void;
  colorScheme?: "light" | "dark" | null;
  slideDirection?: 1 | -1;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DISMISS_THRESHOLD = 55;

const TYPE_CONFIG: Record<
  ToastType,
  { icon: string; color: string; label: string }
> = {
  success: { icon: "checkmark-circle", color: "#16a34a", label: "Success" },
  error: { icon: "alert-circle", color: "#dc2626", label: "Error" },
  info: { icon: "information-circle", color: "#2563eb", label: "Info" },
  warning: { icon: "warning", color: "#d97706", label: "Warning" },
  loading: { icon: "reload-circle", color: "#6b7280", label: "Loading" },
};

const THEMES = {
  light: {
    background: "#ffffff",
    border: "rgba(0,0,0,0.06)",
    text: "#111827",
    subtext: "#9ca3af",
    closeIcon: "#d1d5db",
    progressTrack: "rgba(0,0,0,0.05)",
    actionBorder: "rgba(0,0,0,0.07)",
    shadow: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 10,
    },
  },
  dark: {
    background: "#161618",
    border: "rgba(255,255,255,0.08)",
    text: "#f3f4f6",
    subtext: "#9ca3af",
    closeIcon: "#374151",
    progressTrack: "rgba(255,255,255,0.06)",
    actionBorder: "rgba(255,255,255,0.08)",
    shadow: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    },
  },
};

// ─── Haptics ──────────────────────────────────────────────────────────────────

function fireEntryHaptic(type: ToastType) {
  switch (type) {
    case "success":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case "error":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
    case "warning":
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    case "info":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case "loading":
      break;
  }
}

function announceToast(type: ToastType, message: string, description?: string) {
  const prefix = TYPE_CONFIG[type].label;
  const parts = [prefix, message, description].filter(Boolean).join(". ");
  AccessibilityInfo.announceForAccessibility(parts);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ToastItem({
  toast,
  onHide,
  colorScheme,
  slideDirection = 1,
}: ToastItemProps) {
  const systemScheme = useColorScheme();
  const scheme = colorScheme ?? systemScheme ?? "light";
  const theme = THEMES[scheme];
  const { icon, color, label } = TYPE_CONFIG[toast.type];
  const duration = toast.duration ?? 3800;
  const isLoading = toast.type === "loading";

  // ─── Animated values ───────────────────────────────────────────────────────
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(90 * slideDirection)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const progress = useRef(new Animated.Value(1)).current;
  const swipeY = useRef(new Animated.Value(0)).current;

  const isExiting = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressAnim = useRef<Animated.CompositeAnimation | null>(null);

  const triggerHide = useCallback(() => onHide(toast.id), [toast.id, onHide]);

  // ─── Exit animation ────────────────────────────────────────────────────────
  const animateOut = useCallback(() => {
    if (isExiting.current) return;
    isExiting.current = true;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    progressAnim.current?.stop();
    opacity.stopAnimation();
    translateY.stopAnimation();
    scale.stopAnimation();

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.94,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 90 * slideDirection,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) triggerHide();
    });
  }, [triggerHide, slideDirection]);

  // ─── Pause / resume progress ───────────────────────────────────────────────
  const pauseProgress = useCallback(() => {
    if (toast.persistent || isLoading || isExiting.current) return;
    progressAnim.current?.stop();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [toast.persistent, isLoading]);

  const resumeProgress = useCallback(() => {
    if (toast.persistent || isLoading || isExiting.current) return;

    // Read current progress value to calculate remaining time
    const remaining = (progress as any)._value * duration;
    if (remaining <= 0) {
      animateOut();
      return;
    }

    progressAnim.current = Animated.timing(progress, {
      toValue: 0,
      duration: remaining,
      useNativeDriver: false,
    });
    progressAnim.current.start();
    timerRef.current = setTimeout(animateOut, remaining);
  }, [toast.persistent, isLoading, duration, animateOut, progress]);

  // ─── Entry animation ───────────────────────────────────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 22,
        stiffness: 260,
        mass: 0.85,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 22,
        stiffness: 260,
        useNativeDriver: true,
      }),
    ]).start();

    fireEntryHaptic(toast.type);
    announceToast(toast.type, toast.message, toast.description);

    if (!toast.persistent && !isLoading) {
      progressAnim.current = Animated.timing(progress, {
        toValue: 0,
        duration,
        useNativeDriver: false,
      });
      progressAnim.current.start();
      timerRef.current = setTimeout(animateOut, duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      progressAnim.current?.stop();
    };
  }, []);

  // ─── External dismiss signal ───────────────────────────────────────────────
  useEffect(() => {
    if (toast.dismissed) animateOut();
  }, [toast.dismissed]);

  // ─── Swipe via PanResponder ────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isLoading,
      onMoveShouldSetPanResponder: (_, { dy }) =>
        !isLoading && Math.abs(dy) > 5,

      onPanResponderGrant: () => {
        pauseProgress();
      },

      onPanResponderMove: (_, { dy }) => {
        const inDismissDir = slideDirection === 1 ? dy > 0 : dy < 0;
        if (inDismissDir) {
          swipeY.setValue(dy);
          if (Math.abs(dy) > DISMISS_THRESHOLD) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      },

      onPanResponderRelease: (_, { dy }) => {
        const inDismissDir = slideDirection === 1 ? dy > 0 : dy < 0;
        if (inDismissDir && Math.abs(dy) > DISMISS_THRESHOLD) {
          animateOut();
        } else {
          Animated.spring(swipeY, {
            toValue: 0,
            damping: 20,
            stiffness: 300,
            useNativeDriver: true,
          }).start();
          resumeProgress();
        }
      },

      onPanResponderTerminate: () => {
        Animated.spring(swipeY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        resumeProgress();
      },
    }),
  ).current;

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateOut();
  }, [animateOut]);

  const handleAction = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toast.action?.onPress();
    animateOut();
  }, [toast.action, animateOut]);

  const handleBodyPress = useCallback(() => {
    if (isLoading || !toast.onPress) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toast.onPress();
    animateOut();
  }, [isLoading, toast.onPress, animateOut]);

  // ─── Derived animated style ────────────────────────────────────────────────
  const swipeFadeOpacity = swipeY.interpolate({
    inputRange: [0, DISMISS_THRESHOLD],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const combinedOpacity = Animated.multiply(opacity, swipeFadeOpacity);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const a11yLabel = [label, toast.message, toast.description]
    .filter(Boolean)
    .join(". ");

  return (
    <Animated.View
      accessible
      accessibilityRole="alert"
      accessibilityLabel={a11yLabel}
      accessibilityLiveRegion="polite"
      style={[
        styles.toast,
        {
          backgroundColor: theme.background,
          borderColor: theme.border,
          ...theme.shadow,
          opacity: combinedOpacity,
          transform: [
            { translateY: Animated.add(translateY, swipeY) },
            { scale },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: color }]} />

      {/* Icon */}
      <View
        style={[styles.iconWrap, { backgroundColor: color + "15" }]}
        accessible={false}
        importantForAccessibility="no"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <Ionicons name={icon as any} size={17} color={color} />
        )}
      </View>

      {/* Content */}
      <View style={styles.contentBlock}>
        <TouchableOpacity
          onPress={toast.onPress && !isLoading ? handleBodyPress : undefined}
          activeOpacity={toast.onPress && !isLoading ? 0.7 : 1}
          style={styles.textRow}
          accessible={!!toast.onPress && !isLoading}
          accessibilityRole={toast.onPress && !isLoading ? "button" : undefined}
          accessibilityLabel={
            toast.onPress && !isLoading ? a11yLabel : undefined
          }
          importantForAccessibility={
            toast.onPress && !isLoading ? "yes" : "no-hide-descendants"
          }
        >
          <View style={styles.textBlock}>
            <Text style={[styles.label, { color }]}>{label}</Text>
            <Text
              style={[styles.message, { color: theme.text }]}
              numberOfLines={2}
            >
              {toast.message}
            </Text>
            {toast.description ? (
              <Text
                style={[styles.description, { color: theme.subtext }]}
                numberOfLines={3}
              >
                {toast.description}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>

        {toast.action && !isLoading && (
          <View
            style={[styles.actionRow, { borderTopColor: theme.actionBorder }]}
          >
            <TouchableOpacity
              onPress={handleAction}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              style={styles.actionBtn}
              accessible
              accessibilityRole="button"
              accessibilityLabel={toast.action.label}
            >
              <Text style={[styles.actionLabel, { color }]}>
                {toast.action.label}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={12}
                color={color}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Close button */}
      {!isLoading && (
        <TouchableOpacity
          onPress={handleClose}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          style={styles.closeBtn}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
        >
          <Ionicons name="close" size={15} color={theme.closeIcon} />
        </TouchableOpacity>
      )}

      {/* Progress bar */}
      {!toast.persistent && !isLoading && (
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: theme.progressTrack },
          ]}
          accessible={false}
          importantForAccessibility="no"
        >
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: color, width: progressWidth },
            ]}
          />
        </View>
      )}
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  toast: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
    paddingVertical: 14,
    paddingRight: 14,
    overflow: "hidden",
    gap: 11,
    width: "100%",
  },
  accentBar: {
    width: 3,
    alignSelf: "stretch",
    borderRadius: 99,
    marginLeft: 4,
    flexShrink: 0,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  contentBlock: { flex: 1 },
  textRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  textBlock: { flex: 1, gap: 2 },
  label: {
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  message: {
    fontSize: 13.5,
    fontWeight: "500",
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  description: {
    fontSize: 12.5,
    fontWeight: "400",
    lineHeight: 17,
    letterSpacing: -0.1,
    marginTop: 1,
  },
  closeBtn: {
    alignSelf: "flex-start",
    marginTop: 1,
    flexShrink: 0,
    marginLeft: 8,
  },
  actionRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
  },
});
