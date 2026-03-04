import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAppLock } from '@/src/hooks/useAppLock';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Spacing } from '@/src/constants/spacing';

const { width } = Dimensions.get('window');

type BiometricType = 'faceid' | 'touchid' | 'none';

const FaceIdIcon = () => (
  <View style={iconStyles.wrap}>
    <View style={iconStyles.corner_tl} />
    <View style={iconStyles.corner_tr} />
    <View style={iconStyles.corner_bl} />
    <View style={iconStyles.corner_br} />
    <View style={iconStyles.eyes}>
      <View style={iconStyles.eye} />
      <View style={iconStyles.eye} />
    </View>
    <View style={iconStyles.nose} />
    <View style={iconStyles.mouth} />
  </View>
);

const FingerprintIcon = () => (
  <View style={fpStyles.wrap}>
    {[28, 22, 16, 10].map((size, i) => (
      <View
        key={i}
        style={[
          fpStyles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: 1 - i * 0.15,
          },
        ]}
      />
    ))}
  </View>
);

export const LockScreen = () => {
  const { isLocked, authenticate } = useAppLock();
  const [biometricType, setBiometricType] = useState<BiometricType>('none');
  const [authFailed, setAuthFailed] = useState(false);

  useEffect(() => {
    const detect = async () => {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('faceid');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('touchid');
      } else {
        setBiometricType('none');
      }
    };
    if (isLocked) detect();
  }, [isLocked]);

  useEffect(() => {
    if (isLocked) {
      const timer = setTimeout(() => { handleUnlock(); }, 400);
      return () => clearTimeout(timer);
    }
  }, [isLocked]);

  const handleUnlock = useCallback(async () => {
    setAuthFailed(false);
    const success = await authenticate();
    if (!success) setAuthFailed(true);
  }, [authenticate]);

  if (!isLocked) return null;

  const biometricLabel = biometricType === 'faceid' ? 'Face ID' : biometricType === 'touchid' ? 'Touch ID' : 'Passcode';

  return (
    <View style={styles.container}>
      <BlurView style={StyleSheet.absoluteFill} intensity={80} tint="light" />
      <View style={styles.card}>
        <View style={styles.logoWrap}>
          <Image
            source={require('@/assets/App-Store-Icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.appName}>FocusVault</Text>
        <Text style={styles.subtitle}>
          {authFailed ? 'Authentication failed. Try again.' : `Unlock with ${biometricLabel}`}
        </Text>

        <TouchableOpacity
          style={[styles.biometricBtn, authFailed && styles.biometricBtnFailed]}
          onPress={handleUnlock}
          activeOpacity={0.75}
        >
          {biometricType === 'faceid' && <FaceIdIcon />}
          {biometricType === 'touchid' && <FingerprintIcon />}
          {biometricType === 'none' && <Text style={styles.passcodeText}>🔐</Text>}
        </TouchableOpacity>

        <Text style={styles.tapHint}>
          Tap to unlock with {biometricLabel}
        </Text>
      </View>
    </View>
  );
};

const CORNER_SIZE = 7;
const CORNER_THICK = 2;
const CORNER_COLOR = '#FFFFFF';

const iconStyles = StyleSheet.create({
  wrap: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  corner_tl: { position: 'absolute', top: 0, left: 0, width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderColor: CORNER_COLOR, borderTopLeftRadius: 3 },
  corner_tr: { position: 'absolute', top: 0, right: 0, width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderColor: CORNER_COLOR, borderTopRightRadius: 3 },
  corner_bl: { position: 'absolute', bottom: 0, left: 0, width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderColor: CORNER_COLOR, borderBottomLeftRadius: 3 },
  corner_br: { position: 'absolute', bottom: 0, right: 0, width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderColor: CORNER_COLOR, borderBottomRightRadius: 3 },
  eyes: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  eye: { width: 4, height: 5, backgroundColor: CORNER_COLOR, borderRadius: 2 },
  nose: { width: 2, height: 3, backgroundColor: CORNER_COLOR, borderRadius: 1, marginBottom: 2 },
  mouth: { width: 10, height: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK, borderRightWidth: CORNER_THICK, borderColor: CORNER_COLOR },
});

const fpStyles = StyleSheet.create({
  wrap: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  ring: { position: 'absolute', borderWidth: 2, borderColor: '#FFFFFF' },
});

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, zIndex: 9999, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', gap: 14, width: width * 0.78, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.9)', ...Shadow.lg },
  logoWrap: { width: 72, height: 72, borderRadius: 20, overflow: 'hidden', marginBottom: 4, ...Shadow.md },
  logo: { width: '100%', height: '100%' },
  appName: { ...Typography.title2, color: Colors.text.primary, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { ...Typography.subhead, color: Colors.text.secondary, textAlign: 'center' },
  biometricBtn: { width: 68, height: 68, borderRadius: 20, backgroundColor: Colors.text.primary, justifyContent: 'center', alignItems: 'center', marginVertical: 8, ...Shadow.md },
  biometricBtnFailed: { backgroundColor: Colors.accent.red },
  passcodeText: { fontSize: 28 },
  tapHint: { ...Typography.footnote, color: Colors.text.tertiary, textAlign: 'center' },
});