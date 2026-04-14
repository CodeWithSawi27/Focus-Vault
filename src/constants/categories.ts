import { 
  Apple, 
  Rocket, 
  Brain, 
  User, 
  Banknote, 
  Home, 
  Users, 
  Sparkles,
  Target,
  BookOpen,
  Dumbbell,
  Book,
  Wind,
  PenTool,
  ClipboardList,
  Zap
} from 'lucide-react-native';

export const SESSION_CATEGORIES = [
  { id: 'deep_work',  label: 'Deep Work',  icon: Target,  emoji: '🎯' },
  { id: 'study',      label: 'Study',      icon: BookOpen, emoji: '📚' },
  { id: 'exercise',   label: 'Exercise',   icon: Dumbbell, emoji: '💪' },
  { id: 'reading',    label: 'Reading',    icon: Book,     emoji: '📖' },
  { id: 'meditation', label: 'Meditation', icon: Wind,     emoji: '🧘' },
  { id: 'creative',   icon: PenTool,  label: 'Creative',   emoji: '✨' },
  { id: 'planning',   icon: ClipboardList, label: 'Planning',   emoji: '📋' },
  { id: 'other',      icon: Zap, label: 'Other',      emoji: '⚡' },
] as const;

export const HABIT_CATEGORIES = [
  { id: 'health',       label: 'Health',       icon: Apple,    color: '#10B981' },
  { id: 'productivity', label: 'Productivity', icon: Rocket,   color: '#3B82F6' },
  { id: 'learning',     label: 'Learning',     icon: Brain,    color: '#8B5CF6' },
  { id: 'personal',     label: 'Personal',     icon: User,     color: '#F59E0B' },
  { id: 'finance',      label: 'Finance',      icon: Banknote, color: '#10B981' },
  { id: 'home',         label: 'Home',         icon: Home,     color: '#6366F1' },
  { id: 'social',       label: 'Social',       icon: Users,    color: '#EC4899' },
  { id: 'other',        label: 'Other',        icon: Sparkles, color: '#6B7280' },
] as const;

export type SessionCategoryId = typeof SESSION_CATEGORIES[number]['id'];
export type HabitCategoryId = typeof HABIT_CATEGORIES[number]['id'];

export const getCategoryById = (id: string | null) =>
  SESSION_CATEGORIES.find(c => c.id === id) ?? null;

export const getHabitCategoryById = (id: string | null) =>
  HABIT_CATEGORIES.find(c => c.id === id) ?? null;