import { TaskStatus, TaskPriority } from '@/src/types';

export const TASK_STATUSES: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog',    label: 'Backlog',     color: '#6B7280' },
  { id: 'todo',       label: 'To-Do',       color: '#3B82F6' },
  { id: 'in_progress', label: 'In Progress', color: '#F59E0B' },
  { id: 'in_review',   label: 'In Review',   color: '#8B5CF6' },
  { id: 'completed',   label: 'Completed',   color: '#10B981' },
];

export const TASK_PRIORITIES: { id: TaskPriority; label: string; color: string }[] = [
  { id: 'critical', label: 'Critical', color: '#CC2B2B' },
  { id: 'high',     label: 'High',     color: '#FF453A' },
  { id: 'medium',   label: 'Medium',   color: '#F59E0B' },
  { id: 'low',      label: 'Low',      color: '#34C759' },
];

export const getStatusById = (id: TaskStatus) => 
  TASK_STATUSES.find(s => s.id === id) ?? TASK_STATUSES[0];

export const getPriorityById = (id: TaskPriority) => 
  TASK_PRIORITIES.find(p => p.id === id) ?? TASK_PRIORITIES[2];
