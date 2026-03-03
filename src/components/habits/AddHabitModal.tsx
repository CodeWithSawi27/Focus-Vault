import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  Animated, Dimensions, SafeAreaView, Pressable,
  PanResponder,
} from 'react-native';
import { X } from 'lucide-react-native';
import { InputField } from '@/src/components/ui/InputField';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { HabitFrequencyPicker } from './HabitFrequencyPicker';
import { ReminderTimePicker } from './ReminderTimePicker';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Spacing } from '@/src/constants/spacing';
import type { CreateHabitPayload } from '@/src/hooks/useHabits';
import type { Habit } from '@/src/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateHabitPayload) => Promise<void>;
  editingHabit?: Habit | null;
}

export const AddHabitModal = ({
  visible,
  onClose,
  onSubmit,
  editingHabit,
}: AddHabitModalProps) => {
  const [name, setName]                 = useState('');
  const [description, setDescription]   = useState('');
  const [frequency, setFrequency]       = useState<'daily' | 'weekly'>('daily');
  const [reminderTime, setReminderTime] = useState<string | null>(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const slideAnim  = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const dismissY   = useRef(new Animated.Value(0)).current;

  // ─── Swipe down to dismiss ────────────────────────────────────────────────
  const dismissPan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        g.dy > 10 && Math.abs(g.dy) > Math.abs(g.dx),

      onPanResponderMove: (_, g) => {
        if (g.dy > 0) dismissY.setValue(g.dy);
      },

      onPanResponderRelease: (_, g) => {
        if (loading) {
          Animated.spring(dismissY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 200,
          }).start();
          return;
        }

        if (g.dy > 120 || g.vy > 0.5) {
          Animated.timing(dismissY, {
            toValue: SCREEN_HEIGHT,
            duration: 220,
            useNativeDriver: true,
          }).start(() => {
            dismissY.setValue(0);
            onClose();
          });
        } else {
          Animated.spring(dismissY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 200,
          }).start();
        }
      },

      onPanResponderTerminate: () => {
        Animated.spring(dismissY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }).start();
      },
    })
  ).current;

  // ─── Slide in/out ─────────────────────────────────────────────────────────
  const handleDismiss = useCallback(() => {
    if (loading) return;
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [slideAnim, onClose, loading]);

  useEffect(() => {
    if (visible) {
      if (editingHabit) {
        setName(editingHabit.name);
        setDescription(editingHabit.description ?? '');
        setFrequency(editingHabit.frequency);
        setReminderTime(editingHabit.reminder_time ?? null);
      } else {
        setName('');
        setDescription('');
        setFrequency('daily');
        setReminderTime(null);
      }
      setError('');
      dismissY.setValue(0);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 25,
        stiffness: 180,
      }).start();
    }
  }, [visible, editingHabit, slideAnim]);

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!name.trim()) { setError('Habit name is required.'); return; }
    setError('');
    setLoading(true);
    try {
      await onSubmit({ name, description, frequency, reminder_time: reminderTime });
      handleDismiss();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [name, description, frequency, reminderTime, onSubmit, handleDismiss]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.root}>
        <Pressable style={styles.overlay} onPress={handleDismiss} />

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [
                { translateY: slideAnim },
                { translateY: dismissY },
              ],
            },
          ]}
        >
          {/* Drag handle */}
          <View {...dismissPan.panHandlers} style={styles.dragHandle}>
            <View style={styles.dragBar} />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <SafeAreaView style={styles.safeArea}>
              <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Header row */}
                <View style={styles.headerRow}>
                  <View style={styles.headerLeft} />
                  <Text style={styles.title}>
                    {editingHabit ? 'Edit Habit' : 'New Habit'}
                  </Text>
                  <TouchableOpacity
                    onPress={handleDismiss}
                    style={styles.closeBtn}
                    activeOpacity={0.7}
                  >
                    <X size={18} color={Colors.text.secondary} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.form}>
                  <InputField
                    label="Name"
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Morning run"
                    autoCapitalize="sentences"
                  />

                  <InputField
                    label="Description"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Optional — what's the goal?"
                    autoCapitalize="sentences"
                    multiline
                    numberOfLines={3}
                    style={styles.textArea}
                  />

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Frequency</Text>
                    <HabitFrequencyPicker
                      value={frequency}
                      onChange={setFrequency}
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Reminder</Text>
                    <ReminderTimePicker
                      value={reminderTime}
                      onChange={setReminderTime}
                    />
                  </View>

                  {error ? (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  <View style={styles.buttonGroup}>
                    <PrimaryButton
                      label={editingHabit ? 'Save Changes' : 'Create Habit'}
                      onPress={handleSubmit}
                      loading={loading}
                    />
                    <PrimaryButton
                      label="Cancel"
                      onPress={handleDismiss}
                      variant="ghost"
                      disabled={loading}
                    />
                  </View>
                </View>
              </ScrollView>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: SCREEN_HEIGHT * 0.9,
    ...Shadow.lg,
  },
  dragHandle: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  dragBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  keyboardView: {
    width: '100%',
  },
  safeArea: {
    width: '100%',
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 20 : 40,
    paddingTop: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    width: 34,
  },
  title: {
    ...Typography.headline,
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginBottom: Spacing.lg,
  },
  form: {
    gap: Spacing.lg,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  textArea: {
    height: undefined,
    minHeight: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  errorBox: {
    backgroundColor: 'rgba(204,43,43,0.06)',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(204,43,43,0.12)',
  },
  errorText: {
    ...Typography.footnote,
    color: Colors.accent.red,
    textAlign: 'center',
  },
  buttonGroup: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
});