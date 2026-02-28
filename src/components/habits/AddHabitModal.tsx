import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  Animated, Dimensions, SafeAreaView, Pressable,
} from 'react-native';
import { X } from 'lucide-react-native';
import { InputField } from '@/src/components/ui/InputField';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { HabitFrequencyPicker } from './HabitFrequencyPicker';
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
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency]     = useState<'daily' | 'weekly'>('daily');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

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
      } else {
        setName(''); setDescription(''); setFrequency('daily');
      }
      setError('');
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 25,
        stiffness: 180,
      }).start();
    }
  }, [visible, editingHabit, slideAnim]);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) { setError('Habit name is required.'); return; }
    setError('');
    setLoading(true);
    try {
      await onSubmit({ name, description, frequency });
      handleDismiss();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [name, description, frequency, onSubmit, handleDismiss]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.root}>
        <Pressable style={styles.overlay} onPress={handleDismiss} />

        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
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
                    <HabitFrequencyPicker value={frequency} onChange={setFrequency} />
                  </View>

                  {error ? <Text style={styles.error}>{error}</Text> : null}

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
    maxHeight: SCREEN_HEIGHT * 0.85,
    ...Shadow.lg,
  },
  keyboardView: { width: '100%' },
  safeArea: { width: '100%' },
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
  headerLeft: { width: 34 },
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
  error: {
    ...Typography.footnote,
    color: Colors.accent.red,
    textAlign: 'center',
  },
  buttonGroup: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
});