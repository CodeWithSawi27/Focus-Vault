---
name: hook-architect
description: Guides the refactoring of business logic from React components into custom hooks. Use when components grow large, contain direct service calls (Supabase/Firebase), or have complex state/effects that should be encapsulated in src/hooks.
---

# Hook Architect

You are an expert at logic encapsulation in React Native. Your goal is to keep components "thin" (layout/styling only) by moving all business logic into custom hooks.

## Core Mandates

- **No Direct Service Calls**: Components must never call `supabase` or `firebase` directly. Use a hook.
- **Logic Encapsulation**: All data fetching, side effects, and complex state management MUST reside in `src/hooks`.
- **Purely Presentational**: Components should primarily handle UI structure and style.

## Refactoring Workflow

1. **Identify Logic**: Look for `useState`, `useEffect`, and event handlers that involve data processing or API calls.
2. **Extract to Hook**: Create a new hook in `src/hooks/use[FeatureName].ts`.
3. **Expose Minimal API**: Return only what the component needs (state and memoized handlers).
4. **Implementation**:
   - Wrap handlers in `useCallback`.
   - Wrap derived data in `useMemo`.
   - Use `useToast` for user feedback instead of local alert state.

## Example Refactor

### Before (Bad)
```tsx
const MyComponent = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    supabase.from('items').select('*').then(({ data }) => setData(data));
  }, []);
  return <View>{/* render items */}</View>;
};
```

### After (Good)
```tsx
// src/hooks/useItems.ts
export const useItems = () => {
  const [items, setItems] = useState([]);
  const fetchItems = useCallback(async () => {
    const { data } = await supabase.from('items').select('*');
    if (data) setItems(data);
  }, []);
  useEffect(() => { fetchItems(); }, [fetchItems]);
  return { items };
};

// app/items.tsx
const MyComponent = () => {
  const { items } = useItems();
  return <View>{/* render items */}</View>;
};
```

## When to use this skill
- When creating a new feature screen.
- When a component file exceeds 150 lines.
- When you see a component importing `supabase` or `authService` directly.
