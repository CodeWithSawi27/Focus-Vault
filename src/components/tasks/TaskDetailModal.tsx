import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { X, Plus, CheckCircle2, Circle, MessageSquare, Clock, Edit2, Trash2, Timer } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { useTasks } from "@/src/hooks/useTasks";
import { getStatusById, getPriorityById } from "@/src/constants/tasks";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Spacing } from "@/src/constants/spacing";
import type { Task, TaskSubtask, TaskComment } from "@/src/types";
import { Alert } from "react-native";

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdate: (taskId: string, payload: Partial<Task>) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const TaskDetailModal = ({ visible, task, onClose, onUpdate, onEdit, onDelete }: TaskDetailModalProps) => {
  const { colors, isDark } = useTheme();
  const { fetchSubtasks, addSubtask, toggleSubtask, fetchComments, addComment, logTime } = useTasks();

  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [newComment, setNewComment] = useState("");
  const [logMinutes, setLogMinutes] = useState("");
  const [loading, setLoading] = useState(false);

  const status = useMemo(() => task ? getStatusById(task.status) : null, [task]);
  const priority = useMemo(() => task ? getPriorityById(task.priority) : null, [task]);

  const loadDetails = useCallback(async () => {
    if (!task) return;
    setLoading(true);
    const [st, cm] = await Promise.all([
      fetchSubtasks(task.id),
      fetchComments(task.id),
    ]);
    setSubtasks(st);
    setComments(cm);
    setLoading(false);
  }, [task, fetchSubtasks, fetchComments]);

  useEffect(() => {
    if (visible && task) loadDetails();
  }, [visible, task, loadDetails]);

  const handleAddSubtask = async () => {
    if (!task || !newSubtask.trim()) return;
    const st = await addSubtask(task.id, newSubtask);
    if (st) {
      setSubtasks(prev => [...prev, st]);
      setNewSubtask("");
    }
  };

  const handleToggleSubtask = async (st: TaskSubtask) => {
    await toggleSubtask(st.id, !st.completed);
    setSubtasks(prev => prev.map(item => item.id === st.id ? { ...item, completed: !item.completed } : item));
  };

  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return;
    const cm = await addComment(task.id, newComment);
    if (cm) {
      setComments(prev => [...prev, cm]);
      setNewComment("");
    }
  };

  const handleLogTime = async () => {
    if (!task || !logMinutes.trim()) return;
    const mins = parseInt(logMinutes, 10);
    if (isNaN(mins)) return;
    await logTime(task.id, mins);
    setLogMinutes("");
  };

  const styles = useMemo(() => StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    content: { 
      backgroundColor: colors.background, 
      borderTopLeftRadius: Radius.xl, 
      borderTopRightRadius: Radius.xl, 
      height: '90%', 
      paddingTop: Spacing.md 
    },
    header: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.md
    },
    headerActions: { flexDirection: 'row', gap: 16, alignItems: 'center' },
    scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
    title: { ...Typography.title2, color: colors.text.primary, marginBottom: 4 },
    badgeRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.lg },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
    badgeText: { fontSize: 12, fontWeight: '600', color: colors.text.inverse },
    description: { ...Typography.body, color: colors.text.secondary, marginBottom: Spacing.xl },
    sectionTitle: { ...Typography.headline, color: colors.text.primary, marginBottom: Spacing.md, marginTop: Spacing.lg },
    
    // Subtasks
    subtaskItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
    subtaskTitle: { ...Typography.body, color: colors.text.primary, flex: 1 },
    subtaskTitleDone: { textDecorationLine: 'line-through', color: colors.text.tertiary },
    inputRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
    input: { 
      flex: 1, 
      backgroundColor: colors.surface, 
      borderRadius: Radius.md, 
      paddingHorizontal: 12, 
      paddingVertical: 8, 
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.border
    },
    addBtn: { 
      backgroundColor: colors.primary, 
      width: 40, 
      height: 40, 
      borderRadius: Radius.md, 
      justifyContent: 'center', 
      alignItems: 'center' 
    },

    // Comments
    commentItem: { 
      backgroundColor: colors.surface, 
      padding: 12, 
      borderRadius: Radius.md, 
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border
    },
    commentText: { ...Typography.subhead, color: colors.text.primary },
    commentDate: { ...Typography.caption, color: colors.text.tertiary, marginTop: 4 },

    // Time Log
    statsRow: { flexDirection: 'row', gap: 20, marginBottom: Spacing.md },
    statBox: { flex: 1, backgroundColor: colors.surface, padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: colors.border },
    statLabel: { ...Typography.caption, color: colors.text.tertiary, marginBottom: 2 },
    statValue: { ...Typography.headline, color: colors.text.primary }
  }), [colors]);

  if (!task) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.sectionTitle}>Task Details</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => onEdit(task)}>
                <Edit2 size={20} color={colors.accent.blue} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                Alert.alert("Delete Task", "Are you sure?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => {
                    onDelete(task.id);
                    onClose();
                  }}
                ]);
              }}>
                <Trash2 size={20} color={colors.accent.red} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}><X color={colors.text.primary} /></TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>{task.title}</Text>
            
            <View style={styles.badgeRow}>
              {status && <View style={[styles.badge, { backgroundColor: status.color }]}><Text style={styles.badgeText}>{status.label}</Text></View>}
              {priority && <View style={[styles.badge, { backgroundColor: priority.color + '30' }]}><Text style={[styles.badgeText, { color: priority.color }]}>{priority.label}</Text></View>}
            </View>

            {task.description && <Text style={styles.description}>{task.description}</Text>}

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Logged</Text>
                <Text style={styles.statValue}>{task.time_logged || 0}m</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Estimate</Text>
                <Text style={styles.statValue}>{task.estimated_effort || '—'}m</Text>
              </View>
            </View>

            <View>
              <Text style={styles.sectionTitle}>Log Time</Text>
              <View style={styles.inputRow}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Minutes spent..." 
                  placeholderTextColor={colors.text.tertiary}
                  value={logMinutes}
                  onChangeText={setLogMinutes}
                  keyboardType="numeric"
                />
                <TouchableOpacity style={styles.addBtn} onPress={handleLogTime}>
                  <Clock color={colors.text.inverse} size={20} />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text style={styles.sectionTitle}>Subtasks ({subtasks.filter(s => s.completed).length}/{subtasks.length})</Text>
              {subtasks.map(st => (
                <TouchableOpacity key={st.id} style={styles.subtaskItem} onPress={() => handleToggleSubtask(st)}>
                  {st.completed ? <CheckCircle2 size={20} color={colors.accent.green} /> : <Circle size={20} color={colors.text.tertiary} />}
                  <Text style={[styles.subtaskTitle, st.completed && styles.subtaskTitleDone]}>{st.title}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.inputRow}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Add subtask..." 
                  placeholderTextColor={colors.text.tertiary}
                  value={newSubtask}
                  onChangeText={setNewSubtask}
                />
                <TouchableOpacity style={styles.addBtn} onPress={handleAddSubtask}>
                  <Plus color={colors.text.inverse} size={20} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginTop: Spacing.xl }}>
              <Text style={styles.sectionTitle}>Activity</Text>
              {comments.map(cm => (
                <View key={cm.id} style={styles.commentItem}>
                  <Text style={styles.commentText}>{cm.content}</Text>
                  <Text style={styles.commentDate}>{new Date(cm.created_at).toLocaleString()}</Text>
                </View>
              ))}
              <View style={styles.inputRow}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Add a comment..." 
                  placeholderTextColor={colors.text.tertiary}
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TouchableOpacity style={styles.addBtn} onPress={handleAddComment}>
                  <MessageSquare color={colors.text.inverse} size={20} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
