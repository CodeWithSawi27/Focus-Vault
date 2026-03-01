import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LogIn } from 'lucide-react-native';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { InputField } from '@/src/components/ui/InputField';
import { loginUser } from '@/src/services/authService';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Layout, Spacing } from '@/src/constants/spacing';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = useCallback(async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    try {
      await loginUser(email.trim(), password);
    } catch (e: any) {
      setError(e.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password]);

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
          {/* Brand block */}
          <View style={styles.brandBlock}>
            <View style={styles.logoMark}>
              <LogIn size={26} color={Colors.text.inverse} strokeWidth={2} />
            </View>
            <Text style={styles.brandName}>FocusVault</Text>
            <Text style={styles.brandTagline}>
              Build habits. Stay focused.{'\n'}Track your progress.
            </Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Welcome back</Text>
              <Text style={styles.cardSubtitle}>Sign in to continue</Text>
            </View>

            <View style={styles.form}>
              <InputField
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="you@example.com"
                autoComplete="email"
              />
              <InputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                autoComplete="password"
              />

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <PrimaryButton
                label="Sign In"
                onPress={handleLogin}
                loading={loading}
                style={styles.submitBtn}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>Create one</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 32,
    paddingBottom: 24,
    gap: Spacing.xl,
  },
  brandBlock: {
    alignItems: 'center',
    gap: 12,
    paddingTop: Spacing.lg,
  },
  logoMark: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    ...Shadow.md,
  },
  brandName: {
    ...Typography.title1,
    color: Colors.text.primary,
    letterSpacing: -0.6,
    fontWeight: '700',
  },
  brandTagline: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: Spacing.lg,
    ...Shadow.md,
  },
  cardHeader: {
    gap: 4,
  },
  cardTitle: {
    ...Typography.title3,
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
  },
  form: {
    gap: Spacing.md,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
  },
  footerLink: {
    ...Typography.subhead,
    color: Colors.text.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});