import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { getCategoryById } from '@/src/constants/categories';
import { type SessionCategoryId } from '@/src/constants/categories';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Spacing } from '@/src/constants/spacing';

interface SessionNotesModalProps {
  visible: boolean;
  durationSeconds: number;
  category: SessionCategoryId | null;
  onSave: (notes: string) => void;
}

export const SessionNotesModal = ({
  visible,
  durationSeconds,
  category,
  onSave,
}: SessionNotesModalProps) => {
  const [notes, setNotes] = useState('');

  const durationMins = Math.floor(durationSeconds / 60);
  const cat          = getCategoryById(category);

  const handleSave = useCallback((skip = false) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSave(skip ? '' : notes.trim());
    setNotes('');
  }, [notes, onSave]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.flex}
          >
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                {/* Handle */}
                <View style={styles.handle} />

                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.celebrationEmoji}>🎉</Text>
                  <Text style={styles.title}>Session Complete!</Text>
                  <View style={styles.summaryRow}>
                    {cat && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>{cat.emoji} {cat.label}</Text>
                      </View>
                    )}
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>⏱ {durationMins} min</Text>
                    </View>
                  </View>
                </View>

                {/* Notes input */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Add a note (optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="What did you work on?"
                    placeholderTextColor={Colors.text.tertiary}
                    multiline
                    maxLength={200}
                    returnKeyType="done"
                    blurOnSubmit
                  />
                  <Text style={styles.charCount}>{notes.length}/200</Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={() => handleSave(false)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.saveBtnText}>Save Session</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.skipBtn}
                    onPress={() => handleSave(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.skipBtnText}>Skip</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  flex: { width: '100%' },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    gap: Spacing.lg,
    ...Shadow.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignSelf: 'center',
    marginBottom: 4,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  celebrationEmoji: {
    fontSize: 40,
  },
  title: {
    ...Typography.title2,
    color: Colors.text.primary,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  inputSection: {
    gap: 6,
  },
  inputLabel: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 14,
    ...Typography.callout,
    color: Colors.text.primary,
    minHeight: 90,
    textAlignVertical: 'top',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.09)',
  },
  charCount: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    alignSelf: 'flex-end',
  },
  actions: {
    gap: 10,
  },
  saveBtn: {
    backgroundColor: Colors.text.primary,
    borderRadius: Radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    ...Shadow.sm,
  },
  saveBtnText: {
    ...Typography.headline,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipBtnText: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
});