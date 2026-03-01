import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';

export interface MenuItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: LucideIcon;
  onPress: () => void;
  destructive?: boolean;
  hideChevron?: boolean;
}

interface ProfileMenuSectionProps {
  title: string;
  items: MenuItem[];
}

export const ProfileMenuSection = ({ title, items }: ProfileMenuSectionProps) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        {items.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === items.length - 1;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.row, !isLast && styles.rowBorder]}
              onPress={item.onPress}
              activeOpacity={0.6}
            >
              <View style={[
                styles.iconWrap,
                item.destructive && styles.iconWrapDestructive,
              ]}>
                <Icon
                  size={16}
                  color={item.destructive ? Colors.accent.red : Colors.text.secondary}
                  strokeWidth={1.8}
                />
              </View>

              <View style={styles.rowContent}>
                <Text style={[
                  styles.rowLabel,
                  item.destructive && styles.rowLabelDestructive,
                ]}>
                  {item.label}
                </Text>
                {item.sublabel ? (
                  <Text style={styles.rowSublabel}>{item.sublabel}</Text>
                ) : null}
              </View>

              {!item.hideChevron && (
                <ChevronRight
                  size={16}
                  color={Colors.text.tertiary}
                  strokeWidth={1.8}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
    ...Shadow.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapDestructive: {
    backgroundColor: Colors.accent.redMuted,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    ...Typography.callout,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  rowLabelDestructive: {
    color: Colors.accent.red,
  },
  rowSublabel: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
  },
});