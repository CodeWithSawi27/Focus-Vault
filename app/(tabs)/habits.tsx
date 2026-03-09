import { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/context/ThemeContext";
import { useHabits, CreateHabitPayload } from "@/src/hooks/useHabits";
import { useAuthStore } from "@/src/store/authStore";
import { HabitList } from "@/src/components/habits/HabitList";
import { AddHabitModal } from "@/src/components/habits/AddHabitModal";
import { Typography, Shadow } from "@/src/constants/theme";
import { Layout, Spacing } from "@/src/constants/spacing";
import type { Habit } from "@/src/types";
import { supabase } from "@/src/services/supabase";

export default function HabitsScreen() {
  const { colors } = useTheme();
  const {
    habits,
    loading,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    fetchHabits,
  } = useHabits();

  const { user } = useAuthStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [completedTodayIds, setCompletedTodayIds] = useState<Set<string>>(
    new Set(),
  );
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTodayCompletions = useCallback(async () => {
    if (!user) return;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const { data } = await supabase
      .from("habit_logs")
      .select("habit_id")
      .eq("user_id", user.uid)
      .gte("completed_at", start.toISOString())
      .lte("completed_at", end.toISOString());
    if (data) setCompletedTodayIds(new Set(data.map((l) => l.habit_id)));
  }, [user]);

  useEffect(() => {
    fetchTodayCompletions();
  }, [fetchTodayCompletions]);

  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await Promise.all([fetchHabits(), fetchTodayCompletions()]);
    setRefreshing(false);
  }, [fetchHabits, fetchTodayCompletions]);

  const handleToggle = useCallback(
    async (habitId: string) => {
      const wasCompleted = completedTodayIds.has(habitId);
      wasCompleted
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setCompletedTodayIds((prev) => {
        const next = new Set(prev);
        wasCompleted ? next.delete(habitId) : next.add(habitId);
        return next;
      });
      setTogglingIds((prev) => new Set(prev).add(habitId));
      try {
        await toggleHabitCompletion(habitId);
      } catch {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setCompletedTodayIds((prev) => {
          const next = new Set(prev);
          wasCompleted ? next.add(habitId) : next.delete(habitId);
          return next;
        });
        Alert.alert("Error", "Could not update habit. Please try again.");
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(habitId);
          return next;
        });
      }
    },
    [completedTodayIds, toggleHabitCompletion],
  );

  const handleDelete = useCallback(
    (habitId: string) => {
      Alert.alert(
        "Delete Habit",
        "This will delete the habit and all its history. This cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setDeletingIds((prev) => new Set(prev).add(habitId));
              try {
                await deleteHabit(habitId);
                setCompletedTodayIds((prev) => {
                  const next = new Set(prev);
                  next.delete(habitId);
                  return next;
                });
              } catch {
                Alert.alert(
                  "Error",
                  "Could not delete habit. Please try again.",
                );
              } finally {
                setDeletingIds((prev) => {
                  const next = new Set(prev);
                  next.delete(habitId);
                  return next;
                });
              }
            },
          },
        ],
      );
    },
    [deleteHabit],
  );

  const handleEdit = useCallback((habit: Habit) => {
    setEditingHabit(habit);
    setModalVisible(true);
  }, []);
  const handleSubmit = useCallback(
    async (payload: CreateHabitPayload) => {
      if (editingHabit) {
        await updateHabit(editingHabit.id, payload);
      } else {
        await createHabit(payload);
      }
      setEditingHabit(null);
    },
    [editingHabit, createHabit, updateHabit],
  );

  const handleOpenCreate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingHabit(null);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setEditingHabit(null);
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        container: { flex: 1 },
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: Layout.screenPadding,
          paddingTop: Spacing.sm,
          paddingBottom: Spacing.md,
        },
        title: { ...Typography.title1, color: colors.text.primary },
        subtitle: {
          ...Typography.subhead,
          color: colors.text.secondary,
          marginTop: 2,
        },
        addButton: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
          ...Shadow.md,
        },
        addButtonText: {
          fontSize: 24,
          color: colors.text.inverse,
          lineHeight: 28,
        },
        scroll: {
          paddingHorizontal: Layout.screenPadding,
          paddingBottom: 32,
          gap: Spacing.sm,
        },
      }),
    [colors],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Habits</Text>
            <Text style={styles.subtitle}>
              {completedTodayIds.size} of {habits.length} completed today
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleOpenCreate}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          scrollEnabled={scrollEnabled}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.text.tertiary}
            />
          }
        >
          <HabitList
            habits={habits}
            completedTodayIds={completedTodayIds}
            togglingIds={togglingIds}
            deletingIds={deletingIds}
            loading={loading && !refreshing}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            setScrollEnabled={setScrollEnabled}
          />
        </ScrollView>
      </View>

      <AddHabitModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingHabit={editingHabit}
      />
    </SafeAreaView>
  );
}
