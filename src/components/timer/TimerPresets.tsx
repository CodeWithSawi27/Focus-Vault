import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Keyboard,
} from 'react-native';
import { Pencil, Check } from 'lucide-react-native';
import { Colors, Typography, Radius } from '@/src/constants/theme';

interface Preset {
  label: string;
  seconds: number;
}

interface TimerPresetsProps {
  presets: readonly Preset[];
  currentDuration: number;
  disabled: boolean;
  onSelect: (seconds: number) => void;
  onCustom: (minutes: number) => void;
}

export const TimerPresets = ({
  presets,
  currentDuration,
  disabled,
  onSelect,
  onCustom,
}: TimerPresetsProps) => {
  const [customMode, setCustomMode]   = useState(false);
  const [customInput, setCustomInput] = useState('');

  const presetSeconds = presets.map(p => p.seconds);
  const isCustomActive = !presetSeconds.includes(currentDuration);

  const handleCustomConfirm = () => {
    const mins = parseInt(customInput, 10);
    if (!isNaN(mins) && mins > 0) {
      onCustom(mins);
    }
    setCustomMode(false);
    setCustomInput('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.chips}>
        {presets.map((preset) => {
          const active = preset.seconds === currentDuration && !isCustomActive;
          return (
            <TouchableOpacity
              key={preset.seconds}
              onPress={() => { onSelect(preset.seconds); setCustomMode(false); }}
              disabled={disabled}
              activeOpacity={0.7}
              style={[
                styles.chip,
                active && styles.chipActive,
                disabled && styles.chipDisabled,
              ]}
            >
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Custom chip */}
        <TouchableOpacity
          onPress={() => { if (!disabled) setCustomMode(true); }}
          disabled={disabled}
          activeOpacity={0.7}
          style={[
            styles.chip,
            (isCustomActive || customMode) && styles.chipActive,
            disabled && styles.chipDisabled,
          ]}
        >
          <Pencil
            size={12}
            color={(isCustomActive || customMode) ? '#fff' : Colors.text.secondary}
            strokeWidth={2}
          />
          <Text style={[
            styles.chipLabel,
            (isCustomActive || customMode) && styles.chipLabelActive,
          ]}>
            {isCustomActive ? `${Math.floor(currentDuration / 60)}m` : 'Custom'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom input row */}
      {customMode && (
        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            value={customInput}
            onChangeText={(t) => setCustomInput(t.replace(/[^0-9]/g, ''))}
            placeholder="Minutes"
            placeholderTextColor={Colors.text.tertiary}
            keyboardType="number-pad"
            maxLength={3}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCustomConfirm}
          />
          <Text style={styles.customUnit}>min</Text>
          <TouchableOpacity
            style={styles.customConfirm}
            onPress={handleCustomConfirm}
            activeOpacity={0.8}
          >
            <Check size={16} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
    alignItems: 'center',
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: Colors.text.primary,
    borderColor: Colors.text.primary,
  },
  chipDisabled: {
    opacity: 0.35,
  },
  chipLabel: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  chipLabelActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  customInput: {
    ...Typography.title3,
    color: Colors.text.primary,
    width: 60,
    textAlign: 'center',
    paddingVertical: 8,
    fontVariant: ['tabular-nums'],
  },
  customUnit: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
  },
  customConfirm: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});