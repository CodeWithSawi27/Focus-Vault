import { useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, PanResponder,
  Animated, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CheckCircle2, Circle, Trash2, Pencil, Flame } from 'lucide-react-native';
import { Colors, Typography, Radius } from '@/src/constants/theme';
import type { Habit } from '@/src/types';

const SWIPE_RIGHT_THRESHOLD = 60;
const SWIPE_LEFT_PEEK       = 70;
const SWIPE_LEFT_DELETE     = 200;
const ACTION_WIDTH          = 72;
const SNAP_OPEN             = -(ACTION_WIDTH * 2);

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
  const translateX   = useRef(new Animated.Value(0)).current;
  const rowOpacity   = useRef(new Animated.Value(1)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const flashIsGreen = useRef(true);
  const isOpen       = useRef(false);
  const hasTriggered = useRef(false);
  const gestureDir   = useRef<'none' | 'h' | 'v'>('none');

  // ─── Fade row when deleting ───────────────────────────────────────────────
  useEffect(() => {
    if (isDeleting) {
      Animated.timing(rowOpacity, {
        toValue: 0.4,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(rowOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isDeleting, rowOpacity]);

  // ─── Hint animation on first row ─────────────────────────────────────────
  useEffect(() => {
    if (!showHint) return;
    const timeout = setTimeout(() => {
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
    return () => clearTimeout(timeout);
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

  // ─── Flash ────────────────────────────────────────────────────────────────
  const flash = useCallback((green: boolean, cb?: () => void) => {
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
  }, [flashOpacity]);

  // ─── PanResponder ─────────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,

      onMoveShouldSetPanResponder: (_, g) => {
        if (gestureDir.current === 'v') return false;
        if (gestureDir.current === 'h') return true;
        const absDx = Math.abs(g.dx);
        const absDy = Math.abs(g.dy);
        if (absDx > 5 && absDx > absDy * 1.5) {
          gestureDir.current = 'h';
          setScrollEnabled?.(false);
          return true;
        }
        if (absDy > 8) gestureDir.current = 'v';
        return false;
      },

      onMoveShouldSetPanResponderCapture: (_, g) => {
        if (isOpen.current && Math.abs(g.dx) > 4) return true;
        return false;
      },

      onPanResponderGrant: () => {
        hasTriggered.current = false;
        gestureDir.current   = 'none';
        translateX.stopAnimation();
      },

      onPanResponderMove: (_, g) => {
        const base    = isOpen.current ? SNAP_OPEN : 0;
        const next    = base + g.dx;
        const clamped = Math.min(
          isOpen.current ? 4 : SWIPE_RIGHT_THRESHOLD + 20,
          Math.max(-(SWIPE_LEFT_DELETE + 40), next)
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
        gestureDir.current = 'none';
        setScrollEnabled?.(true);

        const base    = isOpen.current ? SNAP_OPEN : 0;
        const totalDx = base + g.dx;

        if (g.dx > SWIPE_RIGHT_THRESHOLD && !isOpen.current) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          flash(true, () => onToggle(habit.id));
          snapClosed();
          return;
        }

        if (totalDx < -SWIPE_LEFT_DELETE) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          flash(false, () => onDelete(habit.id));
          snapClosed();
          return;
        }

        if (g.dx < -SWIPE_LEFT_PEEK && !isOpen.current) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          snapOpen();
          return;
        }

        if (isOpen.current && g.dx > 10) {
          snapClosed();
          return;
        }

        snapClosed();
      },

      onPanResponderTerminate: () => {
        gestureDir.current = 'none';
        setScrollEnabled?.(true);
        snapClosed();
      },
    })
  ).current;

  const flashBg = flashOpacity.interpolate({
    inputRange:  [0, 1],
    outputRange: [
      'rgba(0,0,0,0)',
      flashIsGreen.current
        ? 'rgba(37,103,30,0.10)'
        : 'rgba(204,43,43,0.10)',
    ],
  });

  return (
    <Animated.View style={[styles.wrapper, { opacity: rowOpacity }]}>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => { snapClosed(); onEdit(habit); }}
          activeOpacity={0.85}
          disabled={isDeleting}
        >
          <Pencil size={17} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.actionLabel}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => { snapClosed(); onDelete(habit.id); }}
          activeOpacity={0.85}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Trash2 size={17} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.actionLabel}>Delete</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Swipeable row */}
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

        {/* Checkbox — tappable, shows spinner while toggling */}
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
            <ActivityIndicator
              size="small"
              color={Colors.text.tertiary}
            />
          ) : isCompleted ? (
            <CheckCircle2
              size={24}
              color={Colors.accent.green}
              strokeWidth={2}
            />
          ) : (
            <Circle
              size={24}
              color="rgba(0,0,0,0.2)"
              strokeWidth={1.8}
            />
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
                <Flame size={11} color={Colors.accent.orange} strokeWidth={2} />
                <Text style={styles.metaText}>{habit.streak}d streak</Text>
                <Text style={styles.metaDot}>·</Text>
              </>
            )}
            <Text style={styles.metaText}>
              {habit.frequency === 'daily' ? 'Daily' : 'Weekly'}
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

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  actions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    width: ACTION_WIDTH * 2,
  },
  actionBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  editBtn: {
    backgroundColor: Colors.text.primary,
  },
  deleteBtn: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  actionLabel: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    gap: 12,
    minHeight: 64,
  },
  checkWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  habitName: {
    ...Typography.callout,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  habitNameDone: {
    color: Colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  habitNameDeleting: {
    color: Colors.text.tertiary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  metaDot: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  doneTag: {
    backgroundColor: Colors.accent.greenMuted,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  doneTagText: {
    ...Typography.caption,
    color: Colors.accent.green,
    fontWeight: '600',
  },
  swipeHint: {
    paddingLeft: 2,
    opacity: 0.18,
  },
  swipeHintText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '300',
  },
});