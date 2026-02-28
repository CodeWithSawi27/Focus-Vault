import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { Colors, Typography, Radius } from '@/src/constants/theme';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export const InputField = ({ label, error, style, ...props }: InputFieldProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={Colors.text.tertiary}
        autoCapitalize="none"
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    height: 50,
    borderRadius: Radius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 14,
    ...Typography.body,
    color: Colors.text.primary,
  },
  inputError: {
    borderColor: Colors.accent.red,
  },
  error: {
    ...Typography.caption,
    color: Colors.accent.red,
  },
});