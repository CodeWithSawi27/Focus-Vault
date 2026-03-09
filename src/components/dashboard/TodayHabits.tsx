import { useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  ListChecks,
} from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import type { AppColors } from "@/src/constants/theme";
import type { Habit } from "@/src/types";

const MAX_VISIBLE = 4;

// ─── HabitRow (internal) ──────────────────────────────────────────────────────
const HabitRow = ({
  habit,
  done,
  isLast,
  index,
  onToggle,
}: {
  habit: Habit;
  done: boolean;
  isLast: boolean;
  index: number;
  onToggle: (id: string) => void;
}) => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-6)).current;
  const checkScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        delay: index * 55,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 220,
        delay: index * 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    checkScale.setValue(done ? 0.6 : 1);
    Animated.spring(checkScale, {
      toValue: 1,
      damping: 14,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  }, [done]);

  const rowStyles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
          paddingVertical: 13,
          gap: 12,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        check: { width: 24, alignItems: "center" },
        info: { flex: 1, gap: 2 },
        habitName: {
          ...Typography.callout,
          color: colors.text.primary,
          fontWeight: "500",
        },
        habitNameDone: {
          color: colors.text.tertiary,
          textDecorationLine: "line-through",
        },
        habitStreak: {
          ...Typography.caption,
          color: colors.text.tertiary,
          letterSpacing: 0.2,
        },
        doneTag: {
          backgroundColor: colors.accent.greenMuted,
          borderRadius: Radius.sm,
          paddingHorizontal: 8,
          paddingVertical: 3,
        },
        doneTagText: {
          ...Typography.caption,
          color: colors.accent.green,
          fontWeight: "600",
          letterSpacing: 0.3,
        },
      }),
    [colors, isLast],
  );

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      <TouchableOpacity
        style={rowStyles.row}
        onPress={() => onToggle(habit.id)}
        activeOpacity={0.6}
      >
        <Animated.View
          style={[rowStyles.check, { transform: [{ scale: checkScale }] }]}
        >
          {done ? (
            <CheckCircle2
              size={22}
              color={colors.accent.green}
              strokeWidth={2}
            />
          ) : (
            <Circle size={22} color={colors.border} strokeWidth={1.5} />
          )}
        </Animated.View>
        <View style={rowStyles.info}>
          <Text style={[rowStyles.habitName, done && rowStyles.habitNameDone]}>
            {habit.name}
          </Text>
          {habit.streak > 0 && (
            <Text style={rowStyles.habitStreak}>{habit.streak}d streak</Text>
          )}
        </View>
        {done && (
          <View style={rowStyles.doneTag}>
            <Text style={rowStyles.doneTagText}>Done</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── TodayHabits ──────────────────────────────────────────────────────────────
interface TodayHabitsProps {
  habits: Habit[];
  completedToday: Set<string>;
  onToggle: (habitId: string) => void;
}

export const TodayHabits = ({
  habits,
  completedToday,
  onToggle,
}: TodayHabitsProps) => {
  const router = useRouter();
  const { colors } = useTheme();

  const visible = habits.slice(0, MAX_VISIBLE);
  const overflow = habits.length - MAX_VISIBLE;

  const handleToggle = (habitId: string) => {
    completedToday.has(habitId)
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onToggle(habitId);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { gap: 8 },
        sectionHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        sectionLabel: {
          ...Typography.caption,
          color: colors.text.tertiary,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          fontWeight: "600",
        },
        viewAll: { flexDirection: "row", alignItems: "center", gap: 3 },
        viewAllText: {
          ...Typography.caption,
          color: colors.text.tertiary,
          fontWeight: "600",
        },
        card: {
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          overflow: "hidden",
          ...Shadow.sm,
        },
        overflowRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 12,
          gap: 4,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
        },
        overflowText: {
          ...Typography.subhead,
          color: colors.text.tertiary,
          fontWeight: "500",
        },
        emptyCard: {
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.lg,
          padding: 24,
          alignItems: "center",
          gap: 8,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          ...Shadow.sm,
        },
        emptyTitle: {
          ...Typography.callout,
          color: colors.text.primary,
          fontWeight: "600",
          marginTop: 4,
        },
        emptySubtitle: {
          ...Typography.subhead,
          color: colors.text.tertiary,
          textAlign: "center",
          lineHeight: 20,
        },
        emptyBtn: {
          marginTop: 8,
          backgroundColor: colors.primary,
          borderRadius: Radius.full,
          paddingHorizontal: 20,
          paddingVertical: 10,
        },
        emptyBtnText: {
          ...Typography.subhead,
          color: colors.text.inverse,
          fontWeight: "600",
        },
      }),
    [colors],
  );

  if (habits.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <ListChecks size={28} color={colors.text.tertiary} strokeWidth={1.5} />
        <Text style={styles.emptyTitle}>No habits today</Text>
        <Text style={styles.emptySubtitle}>
          Add your first habit to start building momentum.
        </Text>
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => router.push("/(tabs)/habits")}
          activeOpacity={0.7}
        >
          <Text style={styles.emptyBtnText}>Go to Habits</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Today's Habits</Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/habits")}
          activeOpacity={0.6}
          style={styles.viewAll}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <ArrowRight size={13} color={colors.text.tertiary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        {visible.map((habit, index) => (
          <HabitRow
            key={habit.id}
            habit={habit}
            done={completedToday.has(habit.id)}
            isLast={index === visible.length - 1 && overflow <= 0}
            index={index}
            onToggle={handleToggle}
          />
        ))}
        {overflow > 0 && (
          <TouchableOpacity
            style={styles.overflowRow}
            onPress={() => router.push("/(tabs)/habits")}
            activeOpacity={0.6}
          >
            <Text style={styles.overflowText}>
              +{overflow} more habit{overflow > 1 ? "s" : ""} — View All
            </Text>
            <ArrowRight
              size={14}
              color={colors.text.tertiary}
              strokeWidth={2}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
