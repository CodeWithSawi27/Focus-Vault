# FocusVault - Architectural Manifesto

## 🏛️ System Design Philosophy
FocusVault follows a **Modular Layered Architecture with Local-First Sync**. The system is designed to be resilient to intermittent connectivity while maintaining a high-performance, fluid UI.

- **Presentation Layer**: Functional React components utilizing Atomic Design principles (UI components in `src/components/ui`, feature components in feature-named folders).
- **Logic Layer (Hooks)**: All business logic, data fetching, and side effects MUST be encapsulated in custom hooks (`src/hooks`). Components should remain "thin" and primarily handle layout/styling.
- **State Layer (Zustand)**: UI state and client-side configuration reside in Zustand stores (`src/store`).
- **Data Persistence Layer (Local-First)**: Changes are first committed to a local `SyncQueue` (`src/services/syncQueue.ts`) and then optimistically or asynchronously synced to Supabase.
- **Service Layer**: Direct integrations with external APIs (Firebase, Supabase, Notifications) are abstracted into standalone services.

## 🛡️ Strict Type Safety Rules
We maintain a zero-tolerance policy for type ambiguity to ensure long-term maintainability.

- **No `any` or `unknown`**: Use specific interfaces or generic types. If a type is truly unknown, use a Type Guard to narrow it before usage.
- **No Non-Null Assertions**: Avoid `!`. Use optional chaining `?.` or explicit null checks with early returns.
- **Exhaustive Enums/Unions**: Always use discriminated unions for state machine statuses (e.g., `TimerStatus = 'idle' | 'running' | 'paused' | 'completed'`).
- **Database Mapping**: All Supabase returns must be typed using the generated `Database` type from `src/types/database.ts`.

## 💾 Data Handling & State
- **UI State**: Managed via Zustand. Examples: Theme, Onboarding progress, Timer elapsed time.
- **Server State**: Managed via a combination of Custom Hooks + `SyncQueue`. We do NOT use TanStack Query; instead, we rely on our custom `useNetworkSync` hook to drain the queue when connectivity is restored.
- **Local Storage**: `AsyncStorage` is reserved for the `SyncQueue` and lightweight preferences. Heavy data should live in Supabase.
- **Data Flow**: `Component` -> `Hook` -> `Store/SyncQueue` -> `Service` -> `Supabase`.

## 🚀 Performance Guardrails
- **Memoization**: Heavy calculations (especially in `useAnalytics`) MUST be wrapped in `useMemo`. All event handlers passed to children MUST use `useCallback`.
- **N+1 Prevention**: When fetching habits and their logs, use Supabase's `.select('*, habit_logs(*)')` to join data in a single request.
- **Lazy Loading**: Heavy UI elements (like Victory Charts or complex Modals) should be evaluated for deferred rendering if they impact TTI (Time to Interactive).
- **Selective Selection**: Never use `select('*')` for large tables; explicitly list required columns to reduce payload size.

## 🚫 The 'Do Not' List
- **NO Direct Service Calls**: Components must never call `supabase` or `firebase` directly. Use a hook.
- **NO `useEffect` for Derivation**: If a value can be computed from props or existing state, calculate it during render or via `useMemo`. Do not sync state with `useEffect`.
- **NO Inline Styles**: Use `StyleSheet.create` or reference the global `ThemeContext`.
- **NO Legacy Libraries**: Avoid adding `moment.js` (use native `Date` or `date-fns` if needed) or heavy CSS-in-JS libraries.

---
**Architectural Source of Truth**: @app/_layout.tsx
