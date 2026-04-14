import { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { Calendar, Clock, AlertTriangle } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { getStatusById, getPriorityById } from "@/src/constants/tasks";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Spacing } from "@/src/constants/spacing";
import type { Task } from "@/src/types";

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

export const TaskCard = ({ task, onPress }: TaskCardProps) => {
  const { colors, isDark } = useTheme();
  const status = getStatusById(task.status);
  const priority = getPriorityById(task.priority);

  const formattedDate = useMemo(() => {
    if (!task.due_date) return null;
    return new Date(task.due_date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }, [task.due_date]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          borderRadius: Radius.lg,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.border,
          ...Shadow.sm,
          marginBottom: Spacing.sm,
        },
        blur: { flex: 1 },
        inner: {
          padding: Spacing.md,
          backgroundColor: isDark
            ? "rgba(28,28,30,0.75)"
            : "rgba(255,255,255,0.75)",
          gap: 10,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        },
        title: {
          ...Typography.headline,
          color: colors.text.primary,
          flex: 1,
          marginRight: 8,
        },
        priorityBadge: {
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 4,
          backgroundColor: priority.color + '20',
        },
        priorityLabel: {
          fontSize: 10,
          fontWeight: '700',
          color: priority.color,
          textTransform: 'uppercase',
        },
        description: {
          ...Typography.footnote,
          color: colors.text.secondary,
        },
        footer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 4,
        },
        metaRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        metaItem: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        metaText: {
          ...Typography.caption,
          color: colors.text.tertiary,
        },
        statusBadge: {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: Radius.full,
          backgroundColor: status.color,
        },
        statusLabel: {
          fontSize: 10,
          fontWeight: '600',
          color: colors.text.inverse,
        },
      }),
    [colors, isDark, status, priority]
  );

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.wrapper}>
      <BlurView intensity={40} tint={isDark ? "dark" : "light"} style={styles.blur}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>{task.title}</Text>
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityLabel}>{priority.label}</Text>
            </View>
          </View>

          {task.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null}

          <View style={styles.footer}>
            <View style={styles.metaRow}>
              {formattedDate && (
                <View style={styles.metaItem}>
                  <Calendar size={12} color={colors.text.tertiary} />
                  <Text style={styles.metaText}>{formattedDate}</Text>
                </View>
              )}
              {task.estimated_effort && (
                <View style={styles.metaItem}>
                  <Clock size={12} color={colors.text.tertiary} />
                  <Text style={styles.metaText}>{task.estimated_effort}m</Text>
                </View>
              )}
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusLabel}>{status.label}</Text>
            </View>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};
