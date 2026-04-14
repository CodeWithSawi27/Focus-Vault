import type { HabitCategoryId } from "@/src/constants/categories";

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category_id: HabitCategoryId | null;
  frequency: 'daily' | 'weekly';
  streak: number;
  longest_streak: number;
  reminder_time: string | null; // "HH:MM:SS" format from Postgres
  created_at: string;
  updated_at: string;
}
export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string; // Supabase returns string for timestamptz
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  duration: number;
  completed: boolean;
  started_at: string;
  ended_at: string | null;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'completed';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  start_date: string | null;
  estimated_effort: number | null; // in minutes or story points, let's assume minutes
  time_logged: number; // in minutes
  project_id: string | null;
  assignee_id: string | null;
  reporter_id: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface TaskSubtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface TaskLog {
  id: string;
  task_id: string;
  user_id: string;
  duration: number; // in minutes
  logged_at: string;
}

export interface TaskTag {
  id: string;
  name: string;
  color: string;
}

export interface TaskTagRelation {
  task_id: string;
  tag_id: string;
}

export interface UserProfile {
  id: string;
  firebase_uid: string;
  email: string;
  display_name: string | null;
  created_at: string;
}