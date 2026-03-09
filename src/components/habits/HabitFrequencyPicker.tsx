import { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";

interface HabitFrequencyPickerProps {
  value: "daily" | "weekly";
  onChange: (value: "daily" | "weekly") => void;
}

const OPTIONS = [
  { value: "daily" as const, label: "Daily" },
  { value: "weekly" as const, label: "Weekly" },
];

export const HabitFrequencyPicker = ({
  value,
  onChange,
}: HabitFrequencyPickerProps) => {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: "row",
          backgroundColor: colors.surface,
          borderRadius: Radius.md,
          padding: 3,
          gap: 3,
        },
        option: {
          flex: 1,
          paddingVertical: 9,
          borderRadius: Radius.sm,
          alignItems: "center",
        },
        optionActive: { backgroundColor: colors.surfaceStrong, ...Shadow.sm },
        label: {
          ...Typography.subhead,
          color: colors.text.tertiary,
          fontWeight: "500",
        },
        labelActive: { color: colors.text.primary, fontWeight: "600" },
      }),
    [colors],
  );

  return (
    <View style={styles.container}>
      {OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.option, value === opt.value && styles.optionActive]}
          onPress={() => onChange(opt.value)}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.label, value === opt.value && styles.labelActive]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
