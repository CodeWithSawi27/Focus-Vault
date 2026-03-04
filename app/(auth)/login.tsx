import { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PrimaryButton }      from '@/src/components/ui/PrimaryButton';
import { InputField }         from '@/src/components/ui/InputField';
import { GoogleSignInButton } from '@/src/components/ui/GoogleSignInButton';
import { loginUser }          from '@/src/services/authService';
import { useGoogleAuth }      from '@/src/hooks/useGoogleAuth';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Layout, Spacing } from '@/src/constants/spacing';

export default function LoginScreen() {
  const router  = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const {
    signIn: googleSignIn,
    handleGoogleResponse,
    response: googleResponse,
    loading: googleLoading,
    error: googleError,
    ready: googleReady,
  } = useGoogleAuth();

  // Handle Google OAuth redirect response
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      handleGoogleResponse();
    }
  }, [googleResponse, handleGoogleResponse]);

  // Surface Google errors in the same error box
  useEffect(() => {
    if (googleError) setError(googleError);
  }, [googleError]);

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

  const isLoading = loading || googleLoading;

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
            <View style={styles.logoWrap}>
              <Image
                source={require('@/assets/App-Store-Icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
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
                onChangeText={(t) => { setEmail(t); setError(''); }}
                keyboardType="email-address"
                placeholder="you@example.com"
                autoComplete="email"
              />
              <InputField
                label="Password"
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
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
                disabled={isLoading}
                style={styles.submitBtn}
              />
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign-In */}
            <GoogleSignInButton
              onPress={googleSignIn}
              loading={googleLoading}
              disabled={isLoading || !googleReady}
            />
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
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 4,
    ...Shadow.md,
  },
  logo: {
    width: '100%',
    height: '100%',
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dividerText: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    fontWeight: '500',
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