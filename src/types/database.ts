export type Database = {
  public: {
    Tables: {
      users:         { Row: import('./index').UserProfile };
      habits:        { Row: import('./index').Habit };
      habit_logs:    { Row: import('./index').HabitLog };
      focus_sessions:{ Row: import('./index').FocusSession };
    };
  };
};