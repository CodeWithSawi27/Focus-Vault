import { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertTriangle, RefreshCw } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Spacing } from "@/src/constants/spacing";

interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  compact?: boolean; // for per-screen use vs full-page
}

export const ErrorFallback = ({
  error,
  onRetry,
  compact = false,
}: ErrorFallbackProps) => {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: {
          flex: 1,
          backgroundColor: colors.background,
        },
        container: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 40,
          gap: Spacing.lg,
        },
        iconWrap: {
          width: 64,
          height: 64,
          borderRadius: Radius.xl,
          backgroundColor: colors.accent.redMuted,
          alignItems: "center",
          justifyContent: "center",
        },
        title: {
          ...Typography.title3,
          color: colors.text.primary,
          textAlign: "center",
        },
        message: {
          ...Typography.callout,
          color: colors.text.secondary,
          textAlign: "center",
          lineHeight: 22,
        },
        errorDetail: {
          ...Typography.caption,
          color: colors.text.tertiary,
          textAlign: "center",
          fontFamily: "monospace",
          backgroundColor: colors.surface,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          borderRadius: Radius.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        retryBtn: {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingVertical: 14,
          paddingHorizontal: 28,
          backgroundColor: colors.text.primary,
          borderRadius: Radius.full,
          ...Shadow.sm,
        },
        retryLabel: {
          ...Typography.callout,
          color: colors.text.inverse,
          fontWeight: "600",
        },
        // Compact variant for embedded use
        compactContainer: {
          alignItems: "center",
          justifyContent: "center",
          padding: Spacing.xl,
          gap: Spacing.md,
        },
      }),
    [colors],
  );

  const content = (
    <View style={compact ? styles.compactContainer : styles.container}>
      <View style={styles.iconWrap}>
        <AlertTriangle size={28} color={colors.accent.red} strokeWidth={1.5} />
      </View>

      <Text style={styles.title}>Something went wrong</Text>

      <Text style={styles.message}>
        An unexpected error occurred. Your data is safe.
      </Text>

      {__DEV__ && error?.message && (
        <Text style={styles.errorDetail} numberOfLines={4}>
          {error.message}
        </Text>
      )}

      {onRetry && (
        <Pressable style={styles.retryBtn} onPress={onRetry}>
          <RefreshCw size={16} color={colors.text.inverse} strokeWidth={2} />
          <Text style={styles.retryLabel}>Try Again</Text>
        </Pressable>
      )}
    </View>
  );

  if (compact) return content;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {content}
    </SafeAreaView>
  );
};
