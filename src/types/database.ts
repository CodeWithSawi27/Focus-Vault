import type { UserProfile, Habit, HabitLog, FocusSession } from './index';

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
    };
  };
};