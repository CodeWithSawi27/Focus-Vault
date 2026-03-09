import { useMemo } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Layers } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { SwipeableHabitRow } from "./SwipeableHabitRow";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import type { Habit } from "@/src/types";

interface HabitListProps {
  habits: Habit[];
  completedTodayIds: Set<string>;
  togglingIds: Set<string>;
  deletingIds: Set<string>;
  loading: boolean;
  onToggle: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  setScrollEnabled?: (enabled: boolean) => void;
}

export const HabitList = ({
  habits,
  completedTodayIds,
  togglingIds,
  deletingIds,
  loading,
  onToggle,
  onEdit,
  onDelete,
  setScrollEnabled,
}: HabitListProps) => {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        center: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 80,
        },
        gestureHint: { paddingHorizontal: 4, paddingBottom: 6 },
        gestureHintText: {
          fontSize: 11,
          color: colors.text.tertiary,
          letterSpacing: 0.3,
        },
        card: {
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          overflow: "hidden",
          ...Shadow.sm,
        },
        rowWrapper: { backgroundColor: colors.surfaceStrong },
        rowBorder: {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        empty: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 80,
          gap: 10,
        },
        emptyIcon: {
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: colors.surface,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 4,
        },
        emptyTitle: {
          fontSize: 17,
          color: colors.text.primary,
          fontWeight: "600",
        },
        emptySubtitle: {
          fontSize: 15,
          color: colors.text.tertiary,
          textAlign: "center",
          paddingHorizontal: 40,
          lineHeight: 20,
        },
      }),
    [colors],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.text.tertiary} size="small" />
      </View>
    );
  }

  if (habits.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Layers size={28} color={colors.text.tertiary} strokeWidth={1.5} />
        </View>
        <Text style={styles.emptyTitle}>No habits yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the + button to create your first habit
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.gestureHint}>
        <Text style={styles.gestureHintText}>
          Tap ○ to complete · Swipe left for options
        </Text>
      </View>
      <View style={styles.card}>
        {habits.map((habit, index) => {
          const isLast = index === habits.length - 1;
          return (
            <View
              key={habit.id}
              style={[styles.rowWrapper, !isLast && styles.rowBorder]}
            >
              <SwipeableHabitRow
                habit={habit}
                isCompleted={completedTodayIds.has(habit.id)}
                isToggling={togglingIds.has(habit.id)}
                isDeleting={deletingIds.has(habit.id)}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                setScrollEnabled={setScrollEnabled}
                showHint={index === 0}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};
