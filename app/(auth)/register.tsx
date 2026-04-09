import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { InputField } from "@/src/components/ui/InputField";
import { GoogleSignInButton } from "@/src/components/ui/GoogleSignInButton";
import { registerUser } from "@/src/services/authService";
import { useGoogleAuth } from "@/src/hooks/useGoogleAuth";
import { useToast } from "@/src/hooks/useToast";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Layout, Spacing } from "@/src/constants/spacing";

const useFadeUp = (delay = 0) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
};

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const backAnim = useFadeUp(0);
  const headerAnim = useFadeUp(60);
  const cardAnim = useFadeUp(100);
  const termsAnim = useFadeUp(200);

  const {
    signIn: googleSignIn,
    loading: googleLoading,
    ready: googleReady,
  } = useGoogleAuth();

  const handleRegister = useCallback(async () => {
    if (!displayName || !email || !password || !confirm) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await registerUser(email.trim(), password, displayName.trim());
      toast.success("Account created! Welcome to FocusVault.");
    } catch (e: any) {
      toast.error(e.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [displayName, email, password, confirm, toast]);

  const isLoading = loading || googleLoading;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        flex: { flex: 1 },
        container: {
          flexGrow: 1,
          paddingHorizontal: Layout.screenPadding,
          paddingTop: Spacing.md,
          paddingBottom: 24,
          gap: Spacing.lg,
        },
        backBtn: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          alignSelf: "flex-start",
          paddingVertical: 4,
        },
        backText: {
          ...Typography.callout,
          color: colors.text.primary,
          fontWeight: "500",
        },
        header: { gap: 10, paddingTop: Spacing.sm },
        logoWrap: {
          width: 64,
          height: 64,
          borderRadius: 18,
          overflow: "hidden",
          marginBottom: 4,
          ...Shadow.md,
        },
        logo: { width: "100%", height: "100%" },
        title: {
          ...Typography.largeTitle,
          color: colors.text.primary,
          letterSpacing: -0.8,
        },
        subtitle: { ...Typography.body, color: colors.text.tertiary },
        card: {
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.xl,
          padding: Spacing.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          gap: Spacing.lg,
          ...Shadow.md,
        },
        form: { gap: Spacing.md },
        divider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.border,
          marginVertical: Spacing.xs,
        },
        dividerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
        dividerLine: {
          flex: 1,
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.border,
        },
        dividerText: {
          ...Typography.footnote,
          color: colors.text.tertiary,
          fontWeight: "500",
        },
        submitBtn: { marginTop: Spacing.xs },
        terms: {
          ...Typography.footnote,
          color: colors.text.tertiary,
          textAlign: "center",
          lineHeight: 18,
          paddingHorizontal: Spacing.md,
        },
        termsLink: {
          color: colors.text.secondary,
          textDecorationLine: "underline",
        },
      }),
    [colors],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={backAnim}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <ArrowLeft
                size={20}
                color={colors.text.primary}
                strokeWidth={2}
              />
              <Text style={styles.backText}>Sign In</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={headerAnim}>
            <View style={styles.header}>
              <View style={styles.logoWrap}>
                <Image
                  source={require("@/assets/App-Store-Icon.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>
                Start your productivity journey today
              </Text>
            </View>
          </Animated.View>

          <Animated.View style={cardAnim}>
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
                <PrimaryButton
                  label="Create Account"
                  onPress={handleRegister}
                  loading={loading}
                  disabled={isLoading}
                  style={styles.submitBtn}
                />
              </View>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <GoogleSignInButton
                onPress={googleSignIn}
                loading={googleLoading}
                disabled={isLoading || !googleReady}
                label="Sign up with Google"
              />
            </View>
          </Animated.View>

          <Animated.View style={termsAnim}>
            <Text style={styles.terms}>
              By creating an account you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
