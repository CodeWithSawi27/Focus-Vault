import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { InputField } from '@/src/components/ui/InputField';
import { registerUser } from '@/src/services/authService';
import { Colors, Typography } from '@/src/constants/theme';
import { Layout } from '@/src/constants/spacing';

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
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start building better habits</Text>
        </View>

        <GlassCard>
          <View style={styles.form}>
            <InputField
              label="Full Name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              autoCapitalize="words"
            />
            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="you@example.com"
            />
            <InputField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Min. 6 characters"
            />
            <InputField
              label="Confirm Password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              placeholder="••••••••"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton label="Create Account" onPress={handleRegister} loading={loading} />
            <TouchableOpacity onPress={() => router.back()} style={styles.link}>
              <Text style={styles.linkText}>
                Already have an account? <Text style={styles.linkAccent}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: 60,
    gap: 32,
  },
  header: { alignItems: 'center', gap: 8 },
  title: { ...Typography.largeTitle, color: Colors.text.primary },
  subtitle: { ...Typography.body, color: Colors.text.secondary },
  form: { gap: 16 },
  error: { ...Typography.footnote, color: Colors.accent.red, textAlign: 'center' },
  link: { alignItems: 'center', paddingTop: 4 },
  linkText: { ...Typography.subhead, color: Colors.text.secondary },
  linkAccent: { color: Colors.primary, fontWeight: '600' },
});