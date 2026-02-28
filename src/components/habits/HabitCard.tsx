import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Spacing } from '@/src/constants/spacing';
import type { Habit } from '@/src/types';

interface HabitCardProps {
  habit: Habit;
  isCompletedToday: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const HabitCard = ({
  habit,
  isCompletedToday,
  onToggle,
  onEdit,
  onDelete,
}: HabitCardProps) => {
  return (
    <View style={styles.wrapper}>
      {/* Completion accent bar */}
      <View style={[styles.accentBar, isCompletedToday && styles.accentBarDone]} />

      <BlurView intensity={55} tint="light" style={styles.blur}>
        <View style={styles.inner}>

          {/* Left — Completion ring */}
          <TouchableOpacity
            onPress={onToggle}
            activeOpacity={0.7}
            style={styles.ringContainer}
          >
            <View style={[styles.ring, isCompletedToday && styles.ringDone]}>
              {isCompletedToday && <View style={styles.ringFill} />}
            </View>
          </TouchableOpacity>

          {/* Center — Content */}
          <View style={styles.content}>
            <Text
              style={[styles.name, isCompletedToday && styles.nameDone]}
              numberOfLines={1}
            >
              {habit.name}
            </Text>

            {habit.description ? (
              <Text style={styles.description} numberOfLines={1}>
                {habit.description}
              </Text>
            ) : null}

            <View style={styles.meta}>
              <Text style={styles.streak}>
                {habit.streak > 0 ? `${habit.streak} day streak` : 'Start your streak'}
              </Text>
              <View style={styles.dot} />
              <Text style={styles.frequency}>{habit.frequency}</Text>
            </View>
          </View>

          {/* Right — Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit} activeOpacity={0.6} style={styles.actionBtn}>
              <Text style={styles.actionEdit}>Edit</Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity onPress={onDelete} activeOpacity={0.6} style={styles.actionBtn}>
              <Text style={styles.actionDelete}>Delete</Text>
            </TouchableOpacity>
          </View>

        </View>
      </BlurView>

      {/* Completion overlay shimmer */}
      {isCompletedToday && <View style={styles.completedOverlay} />}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glass.border,
    flexDirection: 'row',
    ...Shadow.sm,
  },
  accentBar: {
    width: 3,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  accentBarDone: {
    backgroundColor: Colors.accent.green,
  },
  blur: {
    flex: 1,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.glass.background,
    gap: 12,
  },
  ringContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.text.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringDone: {
    borderColor: Colors.accent.green,
  },
  ringFill: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent.green,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  name: {
    ...Typography.callout,
    color: Colors.text.primary,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  nameDone: {
    color: Colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  description: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 1,
  },
  streak: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.text.tertiary,
    opacity: 0.5,
  },
  frequency: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  actionBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  actionEdit: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  actionDelete: {
    ...Typography.caption,
    color: Colors.accent.red,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  actionDivider: {
    width: 20,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.text.tertiary,
    opacity: 0.4,
  },
  completedOverlay: {
    position: 'absolute',
    top: 0,
    left: 3,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(48, 209, 88, 0.03)',
    pointerEvents: 'none',
  },
});