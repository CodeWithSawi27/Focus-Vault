import { useRef, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  CheckCircle2,
  Circle,
  Trash2,
  Pencil,
  Flame,
} from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius } from "@/src/constants/theme";
import type { Habit } from "@/src/types";

const SWIPE_RIGHT_THRESHOLD = 60;
const SWIPE_LEFT_PEEK = 70;
const SWIPE_LEFT_DELETE = 200;
const ACTION_WIDTH = 72;
const SNAP_OPEN = -(ACTION_WIDTH * 2);

interface SwipeableHabitRowProps {
  habit: Habit;
  isCompleted: boolean;
  isToggling: boolean;
  isDeleting: boolean;
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  setScrollEnabled?: (enabled: boolean) => void;
  showHint?: boolean;
}

export const SwipeableHabitRow = ({
  habit,
  isCompleted,
  isToggling,
  isDeleting,
  onToggle,
  onEdit,
  onDelete,
  setScrollEnabled,
  showHint = false,
}: SwipeableHabitRowProps) => {
  const { colors } = useTheme();

  const translateX = useRef(new Animated.Value(0)).current;
  const rowOpacity = useRef(new Animated.Value(1)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const flashIsGreen = useRef(true);
  const isOpen = useRef(false);
  const hasTriggered = useRef(false);
  // ⚠️  Track gesture direction inside a ref so PanResponder callbacks
  //     (which close over a stale copy of state) always read the latest value.
  const gestureDir = useRef<"none" | "h" | "v">("none");

  // ─── Row fade while deleting ──────────────────────────────────────────────
  useEffect(() => {
    Animated.timing(rowOpacity, {
      toValue: isDeleting ? 0.4 : 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [isDeleting]);

  // ─── One-time swipe hint on first row ─────────────────────────────────────
  useEffect(() => {
    if (!showHint) return;
    const id = setTimeout(() => {
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: -28,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 800);
    return () => clearTimeout(id);
  }, [showHint]);

  // ─── Snap helpers ─────────────────────────────────────────────────────────
  const snapClosed = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
    isOpen.current = false;
    setScrollEnabled?.(true);
  }, [translateX, setScrollEnabled]);

  const snapOpen = useCallback(() => {
    Animated.spring(translateX, {
      toValue: SNAP_OPEN,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
    isOpen.current = true;
  }, [translateX]);

  // ─── Flash feedback ───────────────────────────────────────────────────────
  const flash = useCallback(
    (green: boolean, cb?: () => void) => {
      flashIsGreen.current = green;
      flashOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(flashOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(flashOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start(() => cb?.());
    },
    [flashOpacity],
  );

  // ─── PanResponder ─────────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      // Never steal the touch start — let taps through cleanly.
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,

      // If the row is already open, capture any horizontal nudge immediately.
      onMoveShouldSetPanResponderCapture: (_, g) =>
        isOpen.current && Math.abs(g.dx) > 4,

      // Decide whether to claim horizontal gestures.
      // ⚠️  Do NOT call setScrollEnabled here — this predicate fires
      //     speculatively and the responder may never be granted.
      onMoveShouldSetPanResponder: (_, g) => {
        if (gestureDir.current === "v") return false;
        if (gestureDir.current === "h") return true;

        const absDx = Math.abs(g.dx);
        const absDy = Math.abs(g.dy);

        if (absDx > 5 && absDx > absDy * 1.5) {
          gestureDir.current = "h";
          return true;
        }
        if (absDy > 8) gestureDir.current = "v";
        return false;
      },

      // Responder is granted — safe to disable parent scroll NOW.
      onPanResponderGrant: () => {
        hasTriggered.current = false;
        gestureDir.current = "none";
        translateX.stopAnimation();
        setScrollEnabled?.(false); // ← moved here from onMoveShouldSetPanResponder
      },

      onPanResponderMove: (_, g) => {
        const base = isOpen.current ? SNAP_OPEN : 0;
        const next = base + g.dx;
        const clamped = Math.min(
          isOpen.current ? 4 : SWIPE_RIGHT_THRESHOLD + 20,
          Math.max(-(SWIPE_LEFT_DELETE + 40), next),
        );
        translateX.setValue(clamped);

        if (!hasTriggered.current) {
          if (g.dx > SWIPE_RIGHT_THRESHOLD && !isOpen.current) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            hasTriggered.current = true;
          } else if (base + g.dx < -SWIPE_LEFT_DELETE) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            hasTriggered.current = true;
          }
        }
      },

      onPanResponderRelease: (_, g) => {
        gestureDir.current = "none";
        setScrollEnabled?.(true); // always re-enable on release

        const base = isOpen.current ? SNAP_OPEN : 0;
        const totalDx = base + g.dx;

        // Swipe right → toggle complete
        if (g.dx > SWIPE_RIGHT_THRESHOLD && !isOpen.current) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          flash(true, () => onToggle(habit.id));
          snapClosed();
          return;
        }

        // Swipe far left → delete
        if (totalDx < -SWIPE_LEFT_DELETE) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          flash(false, () => onDelete(habit.id));
          snapClosed();
          return;
        }

        // Short left swipe → reveal action buttons
        if (g.dx < -SWIPE_LEFT_PEEK && !isOpen.current) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          snapOpen();
          return;
        }

        // Close if already open and swiped right
        if (isOpen.current && g.dx > 10) {
          snapClosed();
          return;
        }

        snapClosed();
      },

      // If another responder steals the gesture, always restore scroll.
      onPanResponderTerminate: () => {
        gestureDir.current = "none";
        setScrollEnabled?.(true);
        snapClosed();
      },
    }),
  ).current;

  // ─── Flash overlay color ──────────────────────────────────────────────────
  const flashBg = flashOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [
      "rgba(0,0,0,0)",
      flashIsGreen.current ? "rgba(52,199,89,0.12)" : "rgba(255,69,58,0.12)",
    ],
  });

  // ─── All styles inside useMemo so colors are always in sync ───────────────
  const styles = useMemo(
    () =>
      StyleSheet.create({
        // Wrapper: overflow:hidden clips the sliding row;
        // actions sit underneath via render order (painted first → lower z).
        wrapper: {
          position: "relative",
          overflow: "hidden",
          backgroundColor: colors.surfaceStrong, // opaque fallback
        },

        // ── Action buttons (painted first, revealed by sliding row) ────────────
        actions: {
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          flexDirection: "row",
          width: ACTION_WIDTH * 2,
          // No zIndex override — render order handles layering.
        },
        actionBtn: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 5,
        },
        // ⚠️ Fix: was colors.primary (#F5F5F5 in light = near-white → invisible).
        //    colors.text.primary gives dark-on-light / light-on-dark correctly.
        editBtn: { backgroundColor: colors.text.primary },
        deleteBtn: { backgroundColor: colors.accent.red },
        actionLabel: {
          ...Typography.caption,
          color: colors.text.inverse,
          fontWeight: "600",
          letterSpacing: 0.3,
        },

        // ── Sliding row (painted after actions → sits on top) ──────────────────
        row: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
          paddingVertical: 14,
          // Must be fully opaque — any transparency reveals the action buttons
          // unintentionally before the user swipes.
          backgroundColor: colors.surfaceStrong,
          gap: 12,
          minHeight: 64,
        },

        checkWrap: {
          width: 28,
          height: 28,
          alignItems: "center",
          justifyContent: "center",
        },
        content: { flex: 1, gap: 3 },

        habitName: {
          ...Typography.callout,
          color: colors.text.primary,
          fontWeight: "500",
        },
        habitNameDone: {
          color: colors.text.tertiary,
          textDecorationLine: "line-through",
        },
        habitNameDeleting: {
          color: colors.text.tertiary,
        },

        meta: { flexDirection: "row", alignItems: "center", gap: 4 },
        metaText: { ...Typography.caption, color: colors.text.tertiary },
        metaDot: { ...Typography.caption, color: colors.text.tertiary },

        doneTag: {
          backgroundColor: colors.accent.greenMuted,
          borderRadius: Radius.sm,
          paddingHorizontal: 8,
          paddingVertical: 3,
        },
        doneTagText: {
          ...Typography.caption,
          color: colors.accent.green,
          fontWeight: "600",
        },

        swipeHint: { paddingLeft: 2, opacity: 0.18 },
        swipeHintText: {
          fontSize: 16,
          color: colors.text.primary,
          fontWeight: "300",
        },
      }),
    [colors],
  );

  return (
    <Animated.View style={[styles.wrapper, { opacity: rowOpacity }]}>
      {/* ── Action buttons — rendered first so row paints on top ── */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => {
            snapClosed();
            onEdit(habit);
          }}
          activeOpacity={0.85}
          disabled={isDeleting}
        >
          <Pencil size={17} color={colors.text.inverse} strokeWidth={2} />
          <Text style={styles.actionLabel}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => {
            snapClosed();
            onDelete(habit.id);
          }}
          activeOpacity={0.85}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <>
              <Trash2 size={17} color={colors.text.inverse} strokeWidth={2} />
              <Text style={styles.actionLabel}>Delete</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Sliding row — rendered after actions so it starts on top ── */}
      <Animated.View
        style={[styles.row, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {/* Flash overlay */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: flashBg, zIndex: 10 },
          ]}
        />

        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkWrap}
          onPress={() => {
            if (isToggling || isDeleting) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggle(habit.id);
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={isToggling || isDeleting}
        >
          {isToggling ? (
            <ActivityIndicator size="small" color={colors.text.tertiary} />
          ) : isCompleted ? (
            <CheckCircle2
              size={24}
              color={colors.accent.green}
              strokeWidth={2}
            />
          ) : (
            <Circle size={24} color={colors.border} strokeWidth={1.8} />
          )}
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <Text
            style={[
              styles.habitName,
              isCompleted && styles.habitNameDone,
              isDeleting && styles.habitNameDeleting,
            ]}
            numberOfLines={1}
          >
            {habit.name}
          </Text>
          <View style={styles.meta}>
            {habit.streak > 0 && (
              <>
                <Flame size={11} color={colors.accent.orange} strokeWidth={2} />
                <Text style={styles.metaText}>{habit.streak}d streak</Text>
                <Text style={styles.metaDot}>·</Text>
              </>
            )}
            <Text style={styles.metaText}>
              {habit.frequency === "daily" ? "Daily" : "Weekly"}
            </Text>
          </View>
        </View>

        {/* Done tag */}
        {isCompleted && !isToggling && (
          <View style={styles.doneTag}>
            <Text style={styles.doneTagText}>Done</Text>
          </View>
        )}

        {/* Swipe affordance */}
        {!isCompleted && !isDeleting && (
          <View style={styles.swipeHint}>
            <Text style={styles.swipeHintText}>⟨</Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
};
