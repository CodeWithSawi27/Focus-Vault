import { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/context/ThemeContext";
import {
  SESSION_CATEGORIES,
  type SessionCategoryId,
} from "@/src/constants/categories";
import { Typography, Radius } from "@/src/constants/theme";

interface SessionCategoryPickerProps {
  selected: SessionCategoryId | null;
  onSelect: (id: SessionCategoryId) => void;
  disabled?: boolean;
}

export const SessionCategoryPicker = ({
  selected,
  onSelect,
  disabled = false,
}: SessionCategoryPickerProps) => {
  const { colors } = useTheme();

  const handlePress = useCallback(
    (id: SessionCategoryId) => {
      if (disabled) return;
      Haptics.selectionAsync();
      onSelect(id);
    },
    [disabled, onSelect],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: { gap: 8, alignSelf: "stretch" },
        label: {
          ...Typography.caption,
          color: colors.text.tertiary,
          textTransform: "uppercase",
          letterSpacing: 1,
          fontWeight: "600",
          paddingHorizontal: 2,
        },
        scroll: { gap: 8, paddingHorizontal: 2 },
        chip: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 14,
          paddingVertical: 9,
          borderRadius: Radius.full,
          backgroundColor: colors.surfaceStrong,
          borderWidth: 1,
          borderColor: colors.border,
        },
        chipActive: {
          backgroundColor: colors.text.primary,
          borderColor: colors.text.primary,
        },
        chipDisabled: { opacity: 0.4 },
        emoji: { fontSize: 14 },
        chipLabel: {
          ...Typography.subhead,
          color: colors.text.secondary,
          fontWeight: "500",
        },
        chipLabelActive: { color: colors.text.inverse, fontWeight: "600" },
      }),
    [colors],
  );

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {SESSION_CATEGORIES.map((cat) => {
          const active = selected === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                active && styles.chipActive,
                disabled && styles.chipDisabled,
              ]}
              onPress={() => handlePress(cat.id)}
              activeOpacity={0.7}
              disabled={disabled}
            >
              <Text style={styles.emoji}>{cat.emoji}</Text>
              <Text
                style={[styles.chipLabel, active && styles.chipLabelActive]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
