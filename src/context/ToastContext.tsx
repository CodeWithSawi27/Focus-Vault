import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useRef,
} from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ToastItem, {
  ToastAction,
  ToastMessage,
  ToastType,
} from "@/src/components/ui/Toast";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastOptions {
  duration?: number;
  persistent?: boolean;
  action?: ToastAction;
  description?: string;
  onPress?: () => void; // ← Step 9
}

interface ToastContextValue {
  showToast: (
    message: string,
    type?: ToastType,
    options?: ToastOptions,
  ) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

interface ToastProviderProps {
  children: React.ReactNode;
  colorScheme?: "light" | "dark" | null;
  maxToasts?: number;
  position?: ToastPosition;
}

// ─── Step 11: Reducer ──────────────────────────────────────────────────────────

interface ToastState {
  visible: ToastMessage[]; // toasts currently rendered
  queue: ToastMessage[]; // toasts waiting for a slot
}

type ToastAction_R =
  | { type: "ADD"; toast: ToastMessage; maxToasts: number }
  | { type: "DISMISS_ONE"; id: string }
  | { type: "DISMISS_ALL" }
  | { type: "HIDE"; id: string; maxToasts: number };

function toastReducer(state: ToastState, action: ToastAction_R): ToastState {
  switch (action.type) {
    case "ADD": {
      // At capacity → push to queue, leave visible unchanged
      if (state.visible.length >= action.maxToasts) {
        return { ...state, queue: [...state.queue, action.toast] };
      }
      return { ...state, visible: [...state.visible, action.toast] };
    }

    case "DISMISS_ONE": {
      // Mark as dismissed (triggers exit animation in component)
      // Also purge from queue in case it hasn't surfaced yet
      return {
        visible: state.visible.map((t) =>
          t.id === action.id ? { ...t, dismissed: true } : t,
        ),
        queue: state.queue.filter((t) => t.id !== action.id),
      };
    }

    case "DISMISS_ALL": {
      return {
        visible: state.visible.map((t) => ({ ...t, dismissed: true })),
        queue: [], // wipe the queue too — nothing is waiting
      };
    }

    case "HIDE": {
      // Component finished exit animation — remove from visible.
      // If something is queued, promote the next item into the slot.
      const filtered = state.visible.filter((t) => t.id !== action.id);
      if (state.queue.length > 0 && filtered.length < action.maxToasts) {
        const [next, ...rest] = state.queue;
        return { visible: [...filtered, next], queue: rest };
      }
      return { ...state, visible: filtered };
    }

    default:
      return state;
  }
}

const initialState: ToastState = { visible: [], queue: [] };

// ─── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Step 7: Overlay position calculator ───────────────────────────────────────

function getOverlayStyle(
  position: ToastPosition,
  topInset: number,
  bottomInset: number,
) {
  const isTop = position.startsWith("top");
  const isLeft = position.endsWith("left");
  const isRight = position.endsWith("right");

  const vertical = isTop
    ? { top: topInset + 20 }
    : { bottom: bottomInset + 20 };

  const horizontal = isLeft
    ? { left: 16, width: 340 }
    : isRight
      ? { right: 16, width: 340 }
      : { left: 16, right: 16 };

  return {
    position: "absolute" as const,
    zIndex: 9999,
    ...vertical,
    ...horizontal,
  };
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({
  children,
  colorScheme,
  maxToasts = 3,
  position = "bottom-center",
}: ToastProviderProps) {
  const [state, dispatch] = useReducer(toastReducer, initialState);
  const counter = useRef(0);
  const insets = useSafeAreaInsets();
  const slideDirection = position.startsWith("top") ? -1 : 1;

  // ── Show ────────────────────────────────────────────────────────────────────
  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "info",
      options: ToastOptions = {},
    ): string => {
      const id = `toast_${counter.current++}`;

      const toast: ToastMessage = {
        id,
        message,
        description: options.description,
        type,
        duration: options.duration,
        persistent:
          options.persistent ?? (type === "error" || type === "loading"),
        action: options.action,
        onPress: options.onPress, // ← Step 9
        dismissed: false,
      };

      dispatch({ type: "ADD", toast, maxToasts });
      return id;
    },
    [maxToasts],
  );

  // ── Dismiss one ─────────────────────────────────────────────────────────────
  const dismiss = useCallback((id: string) => {
    dispatch({ type: "DISMISS_ONE", id });
  }, []);

  // ── Dismiss all ─────────────────────────────────────────────────────────────
  const dismissAll = useCallback(() => {
    dispatch({ type: "DISMISS_ALL" });
  }, []);

  // ── Remove after exit animation ─────────────────────────────────────────────
  const hideToast = useCallback(
    (id: string) => {
      dispatch({ type: "HIDE", id, maxToasts });
    },
    [maxToasts],
  );

  return (
    <ToastContext.Provider value={{ showToast, dismiss, dismissAll }}>
      {children}

      <View
        style={getOverlayStyle(position, insets.top, insets.bottom)}
        pointerEvents="box-none"
      >
        {state.visible.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onHide={hideToast}
            colorScheme={colorScheme}
            slideDirection={slideDirection as 1 | -1}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

// ─── Internal hook ─────────────────────────────────────────────────────────────

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx)
    throw new Error("useToastContext must be used inside <ToastProvider>.");
  return ctx;
}
