import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView,
} from 'react-native';
import { Bell, BellOff, X, Check } from 'lucide-react-native';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Spacing } from '@/src/constants/spacing';

interface ReminderTimePickerProps {
  value: string | null; // "HH:MM" or null
  onChange: (time: string | null) => void;
}

const HOURS   = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

const pad = (n: number) => n.toString().padStart(2, '0');

const formatDisplay = (time: string | null): string => {
  if (!time) return 'No reminder';
  const [h, m]  = time.split(':').map(Number);
  const period  = h >= 12 ? 'PM' : 'AM';
  const hour12  = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad(m)} ${period}`;
};

export const ReminderTimePicker = ({ value, onChange }: ReminderTimePickerProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour]     = useState(() => {
    if (!value) return 9;
    return parseInt(value.split(':')[0], 10);
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    if (!value) return 0;
    return parseInt(value.split(':')[1], 10);
  });

  const handleConfirm = useCallback(() => {
    onChange(`${pad(selectedHour)}:${pad(selectedMinute)}`);
    setModalVisible(false);
  }, [selectedHour, selectedMinute, onChange]);

  const handleClear = useCallback(() => {
    onChange(null);
    setModalVisible(false);
  }, [onChange]);

  return (
    <>
      {/* Trigger row */}
      <TouchableOpacity
        style={styles.triggerRow}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.triggerLeft}>
          <View style={[styles.iconWrap, value && styles.iconWrapActive]}>
            {value ? (
              <Bell size={15} color={Colors.text.primary} strokeWidth={1.8} />
            ) : (
              <BellOff size={15} color={Colors.text.tertiary} strokeWidth={1.8} />
            )}
          </View>
          <View>
            <Text style={styles.triggerLabel}>Daily Reminder</Text>
            <Text style={[
              styles.triggerValue,
              !value && styles.triggerValueEmpty,
            ]}>
              {formatDisplay(value)}
            </Text>
          </View>
        </View>
        <Text style={styles.triggerEdit}>{value ? 'Change' : 'Set'}</Text>
      </TouchableOpacity>

      {/* Picker modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.sheet}
            onPress={() => {}}
          >
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Set Reminder</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={18} color={Colors.text.secondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Time preview */}
            <View style={styles.preview}>
              <Text style={styles.previewTime}>
                {formatDisplay(`${pad(selectedHour)}:${pad(selectedMinute)}`)}
              </Text>
              <Text style={styles.previewSub}>Daily reminder</Text>
            </View>

            {/* Hour picker */}
            <Text style={styles.pickerLabel}>Hour</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pickerRow}
            >
              {HOURS.map(h => (
                <TouchableOpacity
                  key={h}
                  style={[
                    styles.timeChip,
                    selectedHour === h && styles.timeChipActive,
                  ]}
                  onPress={() => setSelectedHour(h)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.timeChipText,
                    selectedHour === h && styles.timeChipTextActive,
                  ]}>
                    {pad(h)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Minute picker */}
            <Text style={styles.pickerLabel}>Minute</Text>
            <View style={styles.minuteRow}>
              {MINUTES.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.timeChip,
                    styles.minuteChip,
                    selectedMinute === m && styles.timeChipActive,
                  ]}
                  onPress={() => setSelectedMinute(m)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.timeChipText,
                    selectedMinute === m && styles.timeChipTextActive,
                  ]}>
                    :{pad(m)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {value && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={handleClear}
                  activeOpacity={0.7}
                >
                  <BellOff size={15} color={Colors.accent.red} strokeWidth={1.8} />
                  <Text style={styles.clearText}>Remove</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Check size={16} color="#fff" strokeWidth={2.5} />
                <Text style={styles.confirmText}>Set Reminder</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  triggerLabel: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  triggerValue: {
    ...Typography.callout,
    color: Colors.text.primary,
    fontWeight: '500',
    marginTop: 1,
  },
  triggerValueEmpty: {
    color: Colors.text.tertiary,
  },
  triggerEdit: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    ...Shadow.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sheetTitle: {
    ...Typography.headline,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  preview: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  previewTime: {
    fontSize: 48,
    fontWeight: '200',
    color: Colors.text.primary,
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  previewSub: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  pickerLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 16,
  },
  pickerRow: {
    paddingHorizontal: 20,
    gap: 6,
  },
  minuteRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  minuteChip: {
    flex: 1,
    alignItems: 'center',
  },
  timeChipActive: {
    backgroundColor: Colors.text.primary,
    borderColor: Colors.text.primary,
  },
  timeChipText: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  timeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 24,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(204,43,43,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(204,43,43,0.12)',
  },
  clearText: {
    ...Typography.subhead,
    color: Colors.accent.red,
    fontWeight: '500',
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.text.primary,
    borderRadius: Radius.full,
    paddingVertical: 14,
    ...Shadow.sm,
  },
  confirmText: {
    ...Typography.subhead,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});