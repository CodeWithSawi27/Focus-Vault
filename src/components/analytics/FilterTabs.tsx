import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import type { AnalyticsPeriod } from '@/src/hooks/useAnalytics';

interface FilterTabsProps {
  period: AnalyticsPeriod;
  onChange: (p: AnalyticsPeriod) => void;
}

const TABS: { key: AnalyticsPeriod; label: string }[] = [
  { key: 'week',  label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

export const FilterTabs = ({ period, onChange }: FilterTabsProps) => {
  return (
    <View style={styles.container}>
      {TABS.map(tab => {
        const active = tab.key === period;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(tab.key);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: Radius.full,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    ...Shadow.sm,
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