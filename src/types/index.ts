export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency: 'daily' | 'weekly';
  streak: number;
  longest_streak: number;
  created_at: string;
  updated_at: string;
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

export interface UserProfile {
  id: string;
  firebase_uid: string;
  email: string;
  display_name: string | null;
  created_at: string;
}