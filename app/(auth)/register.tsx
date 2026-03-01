import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { InputField } from '@/src/components/ui/InputField';
import { registerUser } from '@/src/services/authService';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Layout, Spacing } from '@/src/constants/spacing';

export default function RegisterScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const handleRegister = useCallback(async () => {
    if (!displayName || !email || !password || !confirm) {
      setError('Please fill in all fields.'); return;
    }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      await registerUser(email.trim(), password, displayName.trim());
    } catch (e: any) {
      setError(e.message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [displayName, email, password, confirm]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back nav */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={Colors.text.primary} strokeWidth={2} />
            <Text style={styles.backText}>Sign In</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Start your productivity journey today
            </Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <View style={styles.form}>
              <InputField
                label="Full Name"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                autoCapitalize="words"
                autoComplete="name"
              />
              <InputField
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="you@example.com"
                autoComplete="email"
              />

              <View style={styles.divider} />

              <InputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Min. 6 characters"
                autoComplete="new-password"
              />
              <InputField
                label="Confirm Password"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                placeholder="Repeat password"
                autoComplete="new-password"
              />

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <PrimaryButton
                label="Create Account"
                onPress={handleRegister}
                loading={loading}
                style={styles.submitBtn}
              />
            </View>
          </View>

          {/* Terms note */}
          <Text style={styles.terms}>
            By creating an account you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: 24,
    gap: Spacing.lg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  backText: {
    ...Typography.callout,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  header: {
    gap: 6,
    paddingTop: Spacing.sm,
  },
  title: {
    ...Typography.largeTitle,
    color: Colors.text.primary,
    letterSpacing: -0.8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.tertiary,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    ...Shadow.md,
  },
  form: {
    gap: Spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: Spacing.xs,
  },
  errorBox: {
    backgroundColor: Colors.accent.redMuted,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    ...Typography.footnote,
    color: Colors.accent.red,
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: Spacing.xs,
  },
  terms: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },
  termsLink: {
    color: Colors.text.secondary,
    textDecorationLine: 'underline',
  },
});