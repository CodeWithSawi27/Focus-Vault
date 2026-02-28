import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Radius } from '@/src/constants/theme';

interface HabitFrequencyPickerProps {
  value: 'daily' | 'weekly';
  onChange: (value: 'daily' | 'weekly') => void;
}

const OPTIONS = [
  { value: 'daily' as const,  label: 'Daily' },
  { value: 'weekly' as const, label: 'Weekly' },
];

export const HabitFrequencyPicker = ({ value, onChange }: HabitFrequencyPickerProps) => {
  return (
    <View style={styles.container}>
      {OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.option, value === opt.value && styles.optionActive]}
          onPress={() => onChange(opt.value)}
          activeOpacity={0.7}
        >
          <Text style={[styles.label, value === opt.value && styles.labelActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: Radius.md,
    padding: 3,
    gap: 3,
  },
  option: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  labelActive: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
});