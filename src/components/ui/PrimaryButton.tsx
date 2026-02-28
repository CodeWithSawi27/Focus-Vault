import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors, Typography, Radius } from '@/src/constants/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'ghost' | 'danger';
}

export const PrimaryButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  style,
  variant = 'primary',
}: PrimaryButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'ghost'   && styles.ghost,
        variant === 'danger'  && styles.danger,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'ghost' ? Colors.text.primary : Colors.text.inverse}
          size="small"
        />
      ) : (
        <Text style={[
          styles.label,
          variant === 'ghost'  && styles.labelGhost,
          variant === 'danger' && styles.labelDanger,
        ]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  danger: {
    backgroundColor: Colors.accent.redMuted,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    ...Typography.headline,
    color: Colors.text.inverse,
    letterSpacing: -0.1,
  },
  labelGhost: {
    color: Colors.text.primary,
  },
  labelDanger: {
    color: Colors.accent.red,
  },
});