import { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SESSION_CATEGORIES, type SessionCategoryId } from '@/src/constants/categories';
import { Colors, Typography, Radius } from '@/src/constants/theme';

interface SessionCategoryPickerProps {
  selected: SessionCategoryId | null;
  onSelect: (id: SessionCategoryId) => void;
  disabled?: boolean;
}

export const SessionCategoryPicker = ({
  selected,
  onSelect,
  disabled = false,
}: SessionCategoryPickerProps) => {
  const handlePress = useCallback((id: SessionCategoryId) => {
    if (disabled) return;
    Haptics.selectionAsync();
    onSelect(id);
  }, [disabled, onSelect]);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {SESSION_CATEGORIES.map((cat) => {
          const active = selected === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                active && styles.chipActive,
                disabled && styles.chipDisabled,
              ]}
              onPress={() => handlePress(cat.id)}
              activeOpacity={0.7}
              disabled={disabled}
            >
              <Text style={styles.emoji}>{cat.emoji}</Text>
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
    alignSelf: 'stretch',
  },
  label: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
    paddingHorizontal: 2,
  },
  scroll: {
    gap: 8,
    paddingHorizontal: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  chipActive: {
    backgroundColor: Colors.text.primary,
    borderColor: Colors.text.primary,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  emoji: {
    fontSize: 14,
  },
  chipLabel: {
    ...Typography.subhead,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  chipLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});