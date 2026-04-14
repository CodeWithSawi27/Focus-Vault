import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Filter } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/src/context/ThemeContext";
import { useTasks, CreateTaskPayload } from "@/src/hooks/useTasks";
import { TaskCard } from "@/src/components/tasks/TaskCard";
import { AddTaskModal } from "@/src/components/tasks/AddTaskModal";
import { TaskDetailModal } from "@/src/components/tasks/TaskDetailModal";
import { TASK_STATUSES } from "@/src/constants/tasks";
import { Typography, Shadow, Radius } from "@/src/constants/theme";
import { Layout, Spacing } from "@/src/constants/spacing";
import type { Task, TaskStatus } from "@/src/types";

export default function TasksScreen() {
  const { colors } = useTheme();
  const {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTaskDetails,
    removeTask,
  } = useTasks();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return tasks;
    return tasks.filter((t) => t.status === statusFilter);
  }, [tasks, statusFilter]);

  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchTasks();
  }, [fetchTasks]);

  const handleOpenCreate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingTask(null);
    setModalVisible(true);
  }, []);

  const handleTaskPress = useCallback((task: Task) => {
    setSelectedTask(task);
    setDetailVisible(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setDetailVisible(false);
    setModalVisible(true);
  }, []);

  const handleSubmit = useCallback(
    async (payload: CreateTaskPayload) => {
      if (editingTask) {
        await updateTaskDetails(editingTask.id, payload);
      } else {
        await createTask(payload);
      }
      setModalVisible(false);
      setEditingTask(null);
    },
    [editingTask, createTask, updateTaskDetails],
  );

  const handleUpdateTask = useCallback(
    async (taskId: string, payload: Partial<Task>) => {
      await updateTaskDetails(taskId, payload);
      // Update local selected task if it's the one being updated
      if (selectedTask?.id === taskId) {
        setSelectedTask((prev) => (prev ? { ...prev, ...payload } : null));
      }
    },
    [selectedTask, updateTaskDetails],
  );

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
        addButton: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
          ...Shadow.md,
        },
        filterScroll: {
          paddingHorizontal: Layout.screenPadding,
          paddingBottom: Spacing.md,
          flexGrow: 0,
        },
        filterItem: {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: Radius.full,
          backgroundColor: colors.surface,
          marginRight: 8,
          borderWidth: 1,
          borderColor: colors.border,
        },
        filterItemActive: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        filterLabel: {
          ...Typography.footnote,
          color: colors.text.secondary,
          fontWeight: "600",
        },
        filterLabelActive: {
          color: colors.text.inverse,
        },
        scroll: {
          paddingHorizontal: Layout.screenPadding,
          paddingBottom: 32,
        },
        emptyContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 100,
        },
        emptyText: {
          ...Typography.body,
          color: colors.text.tertiary,
          marginTop: 8,
        },
      }),
    [colors],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Tasks</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleOpenCreate}
            activeOpacity={0.8}
          >
            <Plus color={colors.text.inverse} size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={{ paddingRight: Layout.screenPadding }}
        >
          <TouchableOpacity
            style={[
              styles.filterItem,
              statusFilter === "all" && styles.filterItemActive,
            ]}
            onPress={() => setStatusFilter("all")}
          >
            <Text
              style={[
                styles.filterLabel,
                statusFilter === "all" && styles.filterLabelActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {TASK_STATUSES.map((status) => (
            <TouchableOpacity
              key={status.id}
              style={[
                styles.filterItem,
                statusFilter === status.id && styles.filterItemActive,
              ]}
              onPress={() => setStatusFilter(status.id)}
            >
              <Text
                style={[
                  styles.filterLabel,
                  statusFilter === status.id && styles.filterLabelActive,
                ]}
              >
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              tintColor={colors.text.tertiary}
            />
          }
        >
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => handleTaskPress(task)}
            />
          ))}

          {filteredTasks.length === 0 && !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks found</Text>
            </View>
          )}

          {loading && filteredTasks.length === 0 && (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginTop: 50 }}
            />
          )}
        </ScrollView>
      </View>

      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        editingTask={editingTask}
      />

      <TaskDetailModal
        visible={detailVisible}
        task={selectedTask}
        onClose={() => setDetailVisible(false)}
        onUpdate={handleUpdateTask}
        onEdit={handleEditTask}
        onDelete={removeTask}
      />
    </SafeAreaView>
  );
}
