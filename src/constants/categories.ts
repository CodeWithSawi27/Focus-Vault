export const SESSION_CATEGORIES = [
  { id: 'deep_work',  label: 'Deep Work',  emoji: '🎯' },
  { id: 'study',      label: 'Study',      emoji: '📚' },
  { id: 'exercise',   label: 'Exercise',   emoji: '💪' },
  { id: 'reading',    label: 'Reading',    emoji: '📖' },
  { id: 'meditation', label: 'Meditation', emoji: '🧘' },
  { id: 'creative',   label: 'Creative',   emoji: '✨' },
  { id: 'planning',   label: 'Planning',   emoji: '📋' },
  { id: 'other',      label: 'Other',      emoji: '⚡' },
] as const;

export type SessionCategoryId = typeof SESSION_CATEGORIES[number]['id'];

export const getCategoryById = (id: string | null) =>
  SESSION_CATEGORIES.find(c => c.id === id) ?? null;