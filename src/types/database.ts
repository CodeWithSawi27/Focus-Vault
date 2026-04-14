import type { UserProfile, Habit, HabitLog, FocusSession, Task, TaskSubtask, TaskComment, TaskLog, TaskTag, TaskTagRelation } from './index';

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at'>;
        Update: Partial<Omit<UserProfile, 'id'>>;
      };
      habits: {
        Row: Habit;
        Insert: Omit<Habit, 'id' | 'streak' | 'longest_streak' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Habit, 'id' | 'user_id' | 'created_at'>>;
      };
      habit_logs: {
        Row: HabitLog;
        Insert: Omit<HabitLog, 'id' | 'completed_at'>;
        Update: never;
      };
      focus_sessions: {
        Row: FocusSession;
        Insert: Omit<FocusSession, 'id' | 'started_at'>;
        Update: Partial<Omit<FocusSession, 'id' | 'user_id' | 'started_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed_at'>;
        Update: Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>;
      };
      task_subtasks: {
        Row: TaskSubtask;
        Insert: Omit<TaskSubtask, 'id' | 'created_at'>;
        Update: Partial<Omit<TaskSubtask, 'id' | 'task_id' | 'created_at'>>;
      };
      task_comments: {
        Row: TaskComment;
        Insert: Omit<TaskComment, 'id' | 'created_at'>;
        Update: Partial<Omit<TaskComment, 'id' | 'task_id' | 'user_id' | 'created_at'>>;
      };
      task_logs: {
        Row: TaskLog;
        Insert: Omit<TaskLog, 'id' | 'logged_at'>;
        Update: Partial<Omit<TaskLog, 'id' | 'task_id' | 'user_id' | 'logged_at'>>;
      };
      task_tags: {
        Row: TaskTag;
        Insert: Omit<TaskTag, 'id'>;
        Update: Partial<Omit<TaskTag, 'id'>>;
      };
      task_tag_relations: {
        Row: TaskTagRelation;
        Insert: TaskTagRelation;
        Update: never;
      };
    };
  };
};