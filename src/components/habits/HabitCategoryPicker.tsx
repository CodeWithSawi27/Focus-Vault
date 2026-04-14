import { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { HABIT_CATEGORIES, type HabitCategoryId } from "@/src/constants/categories";
import { Typography, Radius, Shadow } from "@/src/constants/theme";

interface HabitCategoryPickerProps {
  value: HabitCategoryId | null;
  onChange: (value: HabitCategoryId) => void;
}

export const HabitCategoryPicker = ({
  value,
  onChange,
}: HabitCategoryPickerProps) => {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
        },
        category: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: Radius.full,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 6,
        },
        categoryActive: {
          backgroundColor: colors.surfaceStrong,
          borderColor: colors.text.primary,
          ...Shadow.sm,
        },
        emoji: {
          fontSize: 16,
        },
        label: {
          ...Typography.footnote,
          color: colors.text.secondary,
          fontWeight: "500",
        },
        labelActive: {
          color: colors.text.primary,
          fontWeight: "600",
        },
      }),
    [colors],
  );

  return (
    <View style={styles.container}>
      {HABIT_CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[styles.category, value === cat.id && styles.categoryActive]}
          onPress={() => onChange(cat.id)}
          activeOpacity={0.7}
        >
          <cat.icon 
            size={16} 
            color={value === cat.id ? colors.text.primary : colors.text.secondary} 
          />
          <Text
            style={[styles.label, value === cat.id && styles.labelActive]}
          >
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
