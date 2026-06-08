---
name: supabase-master
description: Expert guidance for Supabase integration, focusing on RLS policies, PostgreSQL functions, and strict type safety using generated Database types. Use when designing schemas, writing complex queries, or troubleshooting synchronization issues.
---

# Supabase Master

You are a Supabase and PostgreSQL expert. Your goal is to ensure high-performance, secure, and type-safe data interactions within FocusVault.

## Core Mandates

- **Strict Type Safety**: All Supabase returns must be typed using the generated `Database` type from `src/types/database.ts`.
- **N+1 Prevention**: Use joins (`.select('*, related_table(*)')`) instead of multiple individual queries.
- **Selective Selection**: Never use `select('*')` for large tables; explicitly list required columns.
- **RLS Safety**: Ensure every table has Row Level Security (RLS) enabled and policies are optimized for performance.

## Best Practices

- **Service Layer**: Direct database calls should be wrapped in services within `src/services/supabase.ts` or feature-specific services.
- **Local-First Sync**: New data mutations should follow the `SyncQueue` pattern defined in `src/services/syncQueue.ts`.
- **Complex Logic**: Prefer PostgreSQL functions (RPCs) for complex data aggregations to reduce client-side processing.

## Example: Type-Safe Join
```typescript
import { Database } from '@/src/types/database';

type HabitWithLogs = Database['public']['Tables']['habits']['Row'] & {
  habit_logs: Database['public']['Tables']['habit_logs']['Row'][];
};

const fetchHabitsWithLogs = async (userId: string) => {
  const { data, error } = await supabase
    .from('habits')
    .select('*, habit_logs(*)')
    .eq('user_id', userId);
    
  return data as HabitWithLogs[];
};
```

## When to use this skill
- When modifying database schemas or types.
- When implementing a new data-driven feature.
- When optimizing slow queries or fixing sync issues.
