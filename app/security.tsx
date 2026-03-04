import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Lock, ShieldCheck,
  Fingerprint, ScanFace, AlertCircle,
} from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAppLock } from '@/src/hooks/useAppLock';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Layout, Spacing } from '@/src/constants/spacing';

type BiometricType = 'faceid' | 'touchid' | 'none';

// ─── Static how-it-works content (no dynamic icons) ──────────────────────────
const HOW_ITEMS = [
  {
    key: 'lock',
    title: 'Auto-locks after 1 minute',
    desc: 'FocusVault locks itself if you leave the app for over a minute.',
  },
  {
    key: 'biometric',
    title: 'Unlocks with Face ID or Touch ID',
    desc: 'Tap the biometric button on the lock screen to instantly unlock.',
  },
  {
    key: 'fallback',
    title: 'Fallback to Passcode',
    desc: 'If biometrics fail, your device passcode is used as a backup.',
  },
];

export default function SecurityScreen() {
  const router = useRouter();
  const {
    isEnabled,
    enableAppLock,
    disableAppLock,
    getBiometricType,
  } = useAppLock();

  const [biometricType, setBiometricType] = useState<BiometricType>('none');
  const [isEnrolled, setIsEnrolled]       = useState(false);
  const [toggling, setToggling]           = useState(false);

  useEffect(() => {
    const check = async () => {
      const type     = await getBiometricType();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricType(type);
      setIsEnrolled(enrolled);
    };
    check();
  }, []);

  const handleToggle = useCallback(async () => {
    if (toggling) return;
    setToggling(true);

    if (isEnabled) {
      const success = await disableAppLock();
      if (!success) {
        Alert.alert(
          'Authentication Failed',
          'Could not verify your identity.\n\nTip: Go to Settings → Expo Go → Face ID and make sure it is enabled.',
        );
      }
    } else {
      if (!isEnrolled) {
        Alert.alert(
          'Biometrics Not Set Up',
          'Please set up Face ID or Touch ID in your device Settings first.',
        );
        setToggling(false);
        return;
      }
      const success = await enableAppLock();
      if (!success) {
        Alert.alert(
          'Authentication Failed',
          'Could not verify your identity.\n\nTip: Go to Settings → Expo Go → Face ID and make sure it is enabled.',
        );
      }
    }

    setToggling(false);
  }, [isEnabled, isEnrolled, toggling, enableAppLock, disableAppLock]);

  const biometricLabel =
    biometricType === 'faceid'   ? 'Face ID'   :
    biometricType === 'touchid'  ? 'Touch ID'  :
    'Biometrics';

  const BiometricIcon = biometricType === 'faceid' ? ScanFace : Fingerprint;

  const getHowItemIcon = (key: string) => {
    if (key === 'lock')      return Lock;
    if (key === 'biometric') return BiometricIcon;
    return ShieldCheck;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Nav bar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={Colors.text.primary} strokeWidth={2} />
          <Text style={styles.backText}>Profile</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Security</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <ShieldCheck size={32} color={Colors.text.primary} strokeWidth={1.5} />
          </View>
          <Text style={styles.heroTitle}>App Lock</Text>
          <Text style={styles.heroSubtitle}>
            {`When enabled, FocusVault will require ${biometricLabel} authentication after 1 minute in the background.`}
          </Text>
        </View>

        {/* Biometric unavailable warning */}
        {biometricType === 'none' && (
          <View style={styles.warningCard}>
            <AlertCircle size={18} color="#FF9F0A" strokeWidth={2} />
            <Text style={styles.warningText}>
              No biometrics detected. Set up Face ID or Touch ID in your device Settings to use App Lock.
            </Text>
          </View>
        )}

        {/* Expo Go tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            {'Using Expo Go? Go to iPhone Settings → Expo Go → Face ID & Passcode and make sure it is enabled.'}
          </Text>
        </View>

        {/* Main toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>APP LOCK</Text>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <View style={[
                  styles.iconWrap,
                  { backgroundColor: isEnabled ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)' },
                ]}>
                  <BiometricIcon
                    size={18}
                    color={isEnabled ? Colors.text.primary : Colors.text.tertiary}
                    strokeWidth={1.8}
                  />
                </View>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>
                    {`Require ${biometricLabel}`}
                  </Text>
                  <Text style={styles.toggleSublabel}>
                    {isEnabled
                      ? 'App locks after 1 min in background'
                      : 'App lock is disabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={handleToggle}
                disabled={toggling || biometricType === 'none'}
                trackColor={{ false: 'rgba(0,0,0,0.1)', true: Colors.text.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
          <View style={styles.card}>
            {HOW_ITEMS.map((item, index) => {
              const Icon = getHowItemIcon(item.key);
              return (
                <View key={item.key}>
                  <View style={styles.howRow}>
                    <View style={styles.howIconWrap}>
                      <Icon
                        size={16}
                        color={Colors.text.primary}
                        strokeWidth={1.8}
                      />
                    </View>
                    <View style={styles.howText}>
                      <Text style={styles.howTitle}>{item.title}</Text>
                      <Text style={styles.howDesc}>{item.desc}</Text>
                    </View>
                  </View>
                  {index < HOW_ITEMS.length - 1 && (
                    <View style={styles.rowDivider} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Status indicator */}
        <View style={[
          styles.statusCard,
          { backgroundColor: isEnabled ? 'rgba(52,199,89,0.08)' : 'rgba(0,0,0,0.04)' },
        ]}>
          <View style={[
            styles.statusDot,
            { backgroundColor: isEnabled ? '#34C759' : Colors.text.tertiary },
          ]} />
          <Text style={[
            styles.statusText,
            { color: isEnabled ? '#34C759' : Colors.text.tertiary },
          ]}>
            {isEnabled ? 'App Lock is active' : 'App Lock is inactive'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    minWidth: 80,
  },
  backText: {
    ...Typography.callout,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  navTitle: {
    ...Typography.headline,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  navSpacer: { minWidth: 80 },
  scroll: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.sm,
    paddingBottom: 48,
    gap: Spacing.lg,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.07)',
    ...Shadow.sm,
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  heroTitle: {
    ...Typography.title3,
    color: Colors.text.primary,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(255,159,10,0.08)',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,159,10,0.2)',
  },
  warningText: {
    ...Typography.footnote,
    color: '#FF9F0A',
    flex: 1,
    lineHeight: 18,
  },
  tipCard: {
    backgroundColor: 'rgba(10,132,255,0.06)',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(10,132,255,0.15)',
  },
  tipText: {
    ...Typography.footnote,
    color: '#0A84FF',
    lineHeight: 18,
    textAlign: 'center',
  },
  section: { gap: Spacing.sm },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.07)',
    ...Shadow.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleInfo: { gap: 2 },
  toggleLabel: {
    ...Typography.callout,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  toggleSublabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  howRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: Spacing.sm,
  },
  howIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  howText: { flex: 1, gap: 3 },
  howTitle: {
    ...Typography.callout,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  howDesc: {
    ...Typography.footnote,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.full,
    paddingVertical: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...Typography.subhead,
    fontWeight: '600',
  },
});