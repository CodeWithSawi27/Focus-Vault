import { useMemo } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius } from "@/src/constants/theme";

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export const InputField = ({
  label,
  error,
  style,
  ...props
}: InputFieldProps) => {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { gap: 6 },
        label: {
          ...Typography.footnote,
          color: colors.text.secondary,
          fontWeight: "500",
          textTransform: "uppercase",
          letterSpacing: 0.6,
        },
        input: {
          height: 50,
          borderRadius: Radius.md,
          backgroundColor: colors.surfaceStrong,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 14,
          ...Typography.body,
          color: colors.text.primary,
        },
        inputError: { borderColor: colors.accent.red },
        error: { ...Typography.caption, color: colors.accent.red },
      }),
    [colors],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={colors.text.tertiary}
        autoCapitalize="none"
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};
