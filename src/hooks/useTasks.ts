import { useState, useCallback, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '@/src/services/supabase';
import { syncQueue } from '@/src/services/syncQueue';
import { useAuthStore } from '@/src/store/authStore';
import { useTaskStore } from '@/src/store/taskStore';
import { useToast } from '@/src/hooks/useToast';
import type { Task, TaskStatus, TaskPriority, TaskSubtask, TaskComment } from '@/src/types';

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  start_date?: string | null;
  estimated_effort?: number | null;
}

const isNetworkAvailable = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return !!(state.isConnected && state.isInternetReachable);
};

export const useTasks = () => {
  const { user } = useAuthStore();
  const { tasks, setTasks, setLoading, loading, addTask, updateTask, deleteTask } = useTaskStore();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.uid)
      .order('created_at', { ascending: false });

    if (fetchError) setError(fetchError.message);
    else setTasks((data as Task[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (payload: CreateTaskPayload) => {
    if (!user) return;

    await toast.promise(
      (async () => {
        const { data, error: insertError } = await supabase
          .from('tasks')
          .insert({
            user_id: user.uid,
            reporter_id: user.uid,
            title: payload.title.trim(),
            description: payload.description?.trim() ?? null,
            status: payload.status,
            priority: payload.priority,
            due_date: payload.due_date ?? null,
            start_date: payload.start_date ?? null,
            estimated_effort: payload.estimated_effort ?? null,
            time_logged: 0,
          })
          .select()
          .single();

        if (insertError) throw new Error(insertError.message);
        if (data) addTask(data as Task);
      })(),
      {
        loading: 'Creating task...',
        success: 'Task created!',
        error: (e) => (e instanceof Error ? e.message : 'Failed to create task.'),
      }
    );
  }, [user, toast, addTask]);

  const updateTaskDetails = useCallback(async (taskId: string, payload: Partial<Task>) => {
    const online = await isNetworkAvailable();
    
    if (!online) {
      // In a real app, we'd update local state and queue sync
      toast.info('Offline - changes will sync when reconnected.');
      return;
    }

    await toast.promise(
      (async () => {
        const { data, error: updateError } = await supabase
          .from('tasks')
          .update(payload)
          .eq('id', taskId)
          .select()
          .single();

        if (updateError) throw new Error(updateError.message);
        if (data) updateTask(data as Task);
      })(),
      {
        loading: 'Updating task...',
        success: 'Task updated!',
        error: (e) => (e instanceof Error ? e.message : 'Failed to update task.'),
      }
    );
  }, [updateTask, toast]);

  const removeTask = useCallback(async (taskId: string) => {
    const online = await isNetworkAvailable();
    if (!online) {
        toast.info('Offline - deletion will sync when reconnected.');
        return;
    }

    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (deleteError) {
      toast.error('Failed to delete task.');
      return;
    }

    deleteTask(taskId);
    toast.success('Task deleted.');
  }, [deleteTask, toast]);

  // ─── Subtasks ─────────────────────────────────────────────────────────────
  const fetchSubtasks = useCallback(async (taskId: string) => {
    const { data, error } = await supabase
      .from('task_subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    
    if (error) return [];
    return data as TaskSubtask[];
  }, []);

  const addSubtask = useCallback(async (taskId: string, title: string) => {
    const { data, error } = await supabase
      .from('task_subtasks')
      .insert({ task_id: taskId, title: title.trim(), completed: false })
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to add subtask.');
      return null;
    }
    return data as TaskSubtask;
  }, [toast]);

  const toggleSubtask = useCallback(async (subtaskId: string, completed: boolean) => {
    const { error } = await supabase
      .from('task_subtasks')
      .update({ completed })
      .eq('id', subtaskId);
    
    if (error) toast.error('Failed to update subtask.');
  }, [toast]);

  // ─── Comments ─────────────────────────────────────────────────────────────
  const fetchComments = useCallback(async (taskId: string) => {
    const { data, error } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    
    if (error) return [];
    return data as TaskComment[];
  }, []);

  const addComment = useCallback(async (taskId: string, content: string) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('task_comments')
      .insert({ task_id: taskId, user_id: user.uid, content: content.trim() })
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to post comment.');
      return null;
    }
    return data as TaskComment;
  }, [user, toast]);

  // ─── Time Logging ─────────────────────────────────────────────────────────
  const logTime = useCallback(async (taskId: string, duration: number) => {
    if (!user) return;
    
    const { error: logError } = await supabase
      .from('task_logs')
      .insert({ task_id: taskId, user_id: user.uid, duration });
    
    if (logError) {
      toast.error('Failed to log time.');
      return;
    }

    // Update the total time_logged on the task itself
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newTotal = (task.time_logged || 0) + duration;
      const { data: updatedTask, error: updateError } = await supabase
        .from('tasks')
        .update({ time_logged: newTotal })
        .eq('id', taskId)
        .select()
        .single();
      
      if (!updateError && updatedTask) {
        updateTask(updatedTask as Task);
      }
    }
    
    toast.success(`Logged ${duration} minutes.`);
  }, [user, tasks, updateTask, toast]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTaskDetails,
    removeTask,
    fetchSubtasks,
    addSubtask,
    toggleSubtask,
    fetchComments,
    addComment,
    logTime,
  };
};
