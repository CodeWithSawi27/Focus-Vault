import { useMemo, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Alert,
  Pressable,
  Image,
} from "react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { X, BrainCircuit } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";

const MASCOT_FOCUS = require("@/assets/mascots/mascot_focus.png");
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Spacing } from "@/src/constants/spacing";

interface FocusActiveOverlayProps {
  visible: boolean;
  elapsedLabel: string;
  totalLabel: string;
  category: string;
  progressPercent: number;
  onEndSession: () => void;
}

export const FocusActiveOverlay = ({
  visible,
  elapsedLabel,
  totalLabel,
  category,
  progressPercent,
  onEndSession,
}: FocusActiveOverlayProps) => {
  const { colors, isDark } = useTheme();

  // Self-contained entry animation — no dependency on useEntryAnimation
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 16,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleEndPress = useCallback(() => {
    Alert.alert(
      "End Session?",
      "Your progress will be saved but the session will be marked incomplete.",
      [
        { text: "Keep Going", style: "cancel" },
        { text: "End Session", style: "destructive", onPress: onEndSession },
      ],
    );
  }, [onEndSession]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          ...StyleSheet.absoluteFillObject,
          zIndex: 9999,
        },
        blur: { flex: 1 },
        overlay: {
          flex: 1,
          backgroundColor: isDark
            ? "rgba(10,10,10,0.88)"
            : "rgba(245,245,245,0.88)",
        },
        safe: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: Spacing.xl,
          paddingHorizontal: 32,
        },
        iconWrap: {
          width: 140,
          height: 140,
          alignItems: "center",
          justifyContent: "center",
        },
        mascot: {
          width: 140,
          height: 140,
          resizeMode: "contain",
        },
        categoryText: {
          ...Typography.callout,
          color: colors.text.secondary,
          textTransform: "uppercase",
          letterSpacing: 1.2,
        },
        timerText: {
          ...Typography.largeTitle,
          fontSize: 72,
          fontWeight: "200",
          letterSpacing: -4,
          color: colors.text.primary,
        },
        totalText: {
          ...Typography.footnote,
          color: colors.text.tertiary,
          marginTop: -Spacing.lg,
        },
        progressTrack: {
          width: "100%",
          height: 3,
          backgroundColor: colors.border,
          borderRadius: Radius.full,
          overflow: "hidden",
        },
        progressFill: {
          height: 3,
          backgroundColor: colors.accent.blue,
          borderRadius: Radius.full,
          width: `${Math.min(progressPercent, 100)}%`,
        },
        endBtn: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingVertical: 14,
          paddingHorizontal: 28,
          borderRadius: Radius.full,
          backgroundColor: colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          ...Shadow.sm,
        },
        endLabel: {
          ...Typography.callout,
          color: colors.text.secondary,
        },
        dndNote: {
          ...Typography.caption,
          color: colors.text.tertiary,
          textAlign: "center",
          lineHeight: 18,
        },
      }),
    [colors, isDark, progressPercent],
  );

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.root, { opacity, transform: [{ translateY }] }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} hidden />
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={isDark ? "dark" : "light"}
        style={styles.blur}
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safe}>
            <View style={styles.iconWrap}>
              <Image source={MASCOT_FOCUS} style={styles.mascot} />
            </View>

            <Text style={styles.categoryText}>{category}</Text>
            <Text style={styles.timerText}>{elapsedLabel}</Text>
            <Text style={styles.totalText}>of {totalLabel}</Text>

            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>

            <Pressable style={styles.endBtn} onPress={handleEndPress}>
              <X size={16} color={colors.text.secondary} strokeWidth={2} />
              <Text style={styles.endLabel}>End Session</Text>
            </Pressable>

            <Text style={styles.dndNote}>
              Notifications paused · Screen kept awake{"\n"}
              Enable Focus mode in iOS Settings for full DND
            </Text>
          </SafeAreaView>
        </View>
      </BlurView>
    </Animated.View>
  );
};
