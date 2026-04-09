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
import { useTheme } from "@/src/context/ThemeContext";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { InputField } from "@/src/components/ui/InputField";
import { GoogleSignInButton } from "@/src/components/ui/GoogleSignInButton";
import { loginUser } from "@/src/services/authService";
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
        duration: 280,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
};

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const brandAnim = useFadeUp(0);
  const cardAnim = useFadeUp(80);
  const footerAnim = useFadeUp(180);

  const {
    signIn: googleSignIn,
    loading: googleLoading,
    ready: googleReady,
  } = useGoogleAuth();

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await loginUser(email.trim(), password);
    } catch (e: any) {
      toast.error(e.message ?? "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email, password, toast]);

  const isLoading = loading || googleLoading;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        flex: { flex: 1 },
        container: {
          flexGrow: 1,
          paddingHorizontal: Layout.screenPadding,
          paddingTop: 32,
          paddingBottom: 24,
          gap: Spacing.xl,
        },
        brandBlock: { alignItems: "center", gap: 12, paddingTop: Spacing.lg },
        logoWrap: {
          width: 80,
          height: 80,
          borderRadius: 22,
          overflow: "hidden",
          marginBottom: 4,
          ...Shadow.md,
        },
        logo: { width: "100%", height: "100%" },
        brandName: {
          ...Typography.title1,
          color: colors.text.primary,
          letterSpacing: -0.6,
          fontWeight: "700",
        },
        brandTagline: {
          ...Typography.subhead,
          color: colors.text.tertiary,
          textAlign: "center",
          lineHeight: 20,
        },
        card: {
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.xl,
          padding: Spacing.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          gap: Spacing.lg,
          ...Shadow.md,
        },
        cardHeader: { gap: 4 },
        cardTitle: {
          ...Typography.title3,
          color: colors.text.primary,
          letterSpacing: -0.3,
        },
        cardSubtitle: { ...Typography.subhead, color: colors.text.tertiary },
        form: { gap: Spacing.md },
        submitBtn: { marginTop: Spacing.xs },
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
        footer: {
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        },
        footerText: { ...Typography.subhead, color: colors.text.tertiary },
        footerLink: {
          ...Typography.subhead,
          color: colors.text.primary,
          fontWeight: "600",
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
          <Animated.View style={[styles.brandBlock, brandAnim]}>
            <View style={styles.logoWrap}>
              <Image
                source={require("@/assets/App-Store-Icon.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.brandName}>FocusVault</Text>
            <Text style={styles.brandTagline}>
              Build habits. Stay focused.{"\n"}Track your progress.
            </Text>
          </Animated.View>

          <Animated.View style={cardAnim}>
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
                <PrimaryButton
                  label="Sign In"
                  onPress={handleLogin}
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
              />
            </View>
          </Animated.View>

          <Animated.View style={[styles.footer, footerAnim]}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLink}>Create one</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
