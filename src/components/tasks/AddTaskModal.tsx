import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  SafeAreaView,
  Pressable,
  PanResponder,
} from "react-native";
import { X, ChevronDown } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { InputField } from "@/src/components/ui/InputField";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { TASK_STATUSES, TASK_PRIORITIES } from "@/src/constants/tasks";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Spacing } from "@/src/constants/spacing";
import type { CreateTaskPayload } from "@/src/hooks/useTasks";
import type { Task, TaskStatus, TaskPriority } from "@/src/types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
  editingTask?: Task | null;
}

export const AddTaskModal = ({
  visible,
  onClose,
  onSubmit,
  editingTask,
}: AddTaskModalProps) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [estimatedEffort, setEstimatedEffort] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dismissY = useRef(new Animated.Value(0)).current;

  const handleDismiss = useCallback(() => {
    if (loading) return;
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [slideAnim, onClose, loading]);

  useEffect(() => {
    if (visible) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description ?? "");
        setStatus(editingTask.status);
        setPriority(editingTask.priority);
        setEstimatedEffort(editingTask.estimated_effort?.toString() ?? "");
      } else {
        setTitle("");
        setDescription("");
        setStatus("todo");
        setPriority("medium");
        setEstimatedEffort("");
      }
      setError("");
      dismissY.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 25,
        stiffness: 180,
      }).start();
    }
  }, [visible, editingTask, slideAnim]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        title,
        description,
        status,
        priority,
        estimated_effort: estimatedEffort ? parseInt(estimatedEffort, 10) : null,
      });
      handleDismiss();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [title, description, status, priority, estimatedEffort, onSubmit, handleDismiss]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, justifyContent: "flex-end" },
        overlay: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.4)",
        },
        sheet: {
          backgroundColor: colors.background,
          borderTopLeftRadius: Radius.xl,
          borderTopRightRadius: Radius.xl,
          maxHeight: SCREEN_HEIGHT * 0.9,
          ...Shadow.lg,
        },
        keyboardView: { width: "100%" },
        safeArea: { width: "100%" },
        content: {
          paddingHorizontal: Spacing.lg,
          paddingBottom: Platform.OS === "ios" ? 40 : 40,
          paddingTop: Spacing.md,
        },
        headerRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: Spacing.md,
        },
        headerTitle: {
          ...Typography.headline,
          color: colors.text.primary,
        },
        closeBtn: {
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: colors.surface,
          justifyContent: "center",
          alignItems: "center",
        },
        form: { gap: Spacing.lg },
        fieldGroup: { gap: 8 },
        fieldLabel: {
          ...Typography.footnote,
          color: colors.text.secondary,
          fontWeight: "600",
          textTransform: "uppercase",
        },
        pickerRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        },
        pickerItem: {
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: Radius.full,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
        pickerItemActive: {
          backgroundColor: colors.surfaceStrong,
          borderColor: colors.text.primary,
        },
        pickerLabel: {
          fontSize: 12,
          color: colors.text.secondary,
          fontWeight: '500',
        },
        pickerLabelActive: {
          color: colors.text.primary,
          fontWeight: '700',
        },
        errorText: {
          color: colors.accent.red,
          textAlign: 'center',
          ...Typography.footnote,
        }
      }),
    [colors]
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleDismiss}>
      <View style={styles.root}>
        <Pressable style={styles.overlay} onPress={handleDismiss} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <SafeAreaView style={styles.safeArea}>
              <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.headerRow}>
                  <Text style={styles.headerTitle}>{editingTask ? "Edit Task" : "New Task"}</Text>
                  <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
                    <X size={18} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.form}>
                  <InputField label="Title" value={title} onChangeText={setTitle} placeholder="What needs to be done?" />
                  <InputField label="Description" value={description} onChangeText={setDescription} placeholder="Context or acceptance criteria" multiline numberOfLines={3} />

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Status</Text>
                    <View style={styles.pickerRow}>
                      {TASK_STATUSES.map(s => (
                        <TouchableOpacity 
                          key={s.id} 
                          style={[styles.pickerItem, status === s.id && styles.pickerItemActive]}
                          onPress={() => setStatus(s.id)}
                        >
                          <Text style={[styles.pickerLabel, status === s.id && styles.pickerLabelActive]}>{s.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Priority</Text>
                    <View style={styles.pickerRow}>
                      {TASK_PRIORITIES.map(p => (
                        <TouchableOpacity 
                          key={p.id} 
                          style={[styles.pickerItem, priority === p.id && styles.pickerItemActive]}
                          onPress={() => setPriority(p.id)}
                        >
                          <Text style={[styles.pickerLabel, priority === p.id && styles.pickerLabelActive]}>{p.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <InputField 
                    label="Estimated Effort (minutes)" 
                    value={estimatedEffort} 
                    onChangeText={setEstimatedEffort} 
                    placeholder="e.g. 60" 
                    keyboardType="numeric"
                  />

                  {error ? <Text style={styles.errorText}>{error}</Text> : null}

                  <PrimaryButton 
                    label={editingTask ? "Update Task" : "Create Task"} 
                    onPress={handleSubmit} 
                    loading={loading} 
                  />
                </View>
              </ScrollView>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};
