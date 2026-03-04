import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Github, Globe,
  FileText, Shield, Heart,
} from 'lucide-react-native';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Layout, Spacing } from '@/src/constants/spacing';

const APP_VERSION  = '1.0.0';
const BUILD_NUMBER = '1';

interface LinkRowProps {
  icon: any;
  label: string;
  onPress: () => void;
}

const LinkRow = ({ icon: Icon, label, onPress }: LinkRowProps) => (
  <TouchableOpacity
    style={styles.linkRow}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.linkIconWrap}>
      <Icon size={16} color={Colors.text.primary} strokeWidth={1.8} />
    </View>
    <Text style={styles.linkLabel}>{label}</Text>
    <Text style={styles.linkArrow}>›</Text>
  </TouchableOpacity>
);

export default function AboutScreen() {
  const router = useRouter();

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
        <Text style={styles.navTitle}>About</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* App identity block */}
        <View style={styles.identityBlock}>
          <View style={styles.logoWrap}>
            <Image
              source={require('@/assets/App-Store-Icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>FocusVault</Text>
          <Text style={styles.tagline}>Liquid Glass Edition</Text>
          <View style={styles.versionRow}>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>
                v{APP_VERSION} · Build {BUILD_NUMBER}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.description}>
            FocusVault is a premium iOS productivity app designed to help you
            build consistent habits, manage deep focus sessions, and track your
            progress over time through beautiful analytics.
          </Text>
        </View>

        {/* Tech stack */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BUILT WITH</Text>
          <View style={styles.card}>
            {[
              { label: 'Framework',      value: 'React Native (Expo)' },
              { label: 'Navigation',     value: 'Expo Router' },
              { label: 'Authentication', value: 'Firebase Auth' },
              { label: 'Database',       value: 'Supabase (PostgreSQL)' },
              { label: 'Animations',     value: 'Reanimated + Moti' },
              { label: 'Charts',         value: 'Victory Native XL' },
            ].map((item, index, arr) => (
              <View key={item.label}>
                <View style={styles.stackRow}>
                  <Text style={styles.stackLabel}>{item.label}</Text>
                  <Text style={styles.stackValue}>{item.value}</Text>
                </View>
                {index < arr.length - 1 && (
                  <View style={styles.rowDivider} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LEGAL</Text>
          <View style={styles.card}>
            <LinkRow
              icon={FileText}
              label="Terms of Service"
              onPress={() => Linking.openURL('https://focusvault.app/terms')}
            />
            <View style={styles.rowDivider} />
            <LinkRow
              icon={Shield}
              label="Privacy Policy"
              onPress={() => Linking.openURL('https://focusvault.app/privacy')}
            />
          </View>
        </View>

        {/* Credits */}
        <View style={styles.creditsCard}>
          <Heart
            size={16}
            color={Colors.accent.red}
            strokeWidth={2}
            fill={Colors.accent.red}
          />
          <Text style={styles.creditsText}>
            Designed and built by{' '}
            <Text style={styles.creditsName}>Momoh Sawi</Text>
          </Text>
          <Text style={styles.creditsYear}>© {new Date().getFullYear()} FocusVault</Text>
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
  identityBlock: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
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
  appName: {
    ...Typography.title1,
    color: Colors.text.primary,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  tagline: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
  },
  versionRow: {
    marginTop: 4,
  },
  versionBadge: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  versionText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.07)',
    ...Shadow.sm,
  },
  description: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  section: { gap: Spacing.sm },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  stackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
  },
  stackLabel: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  stackValue: {
    ...Typography.subhead,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  linkIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkLabel: {
    ...Typography.callout,
    color: Colors.text.primary,
    fontWeight: '500',
    flex: 1,
  },
  linkArrow: {
    ...Typography.title3,
    color: Colors.text.tertiary,
    fontWeight: '300',
  },
  creditsCard: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
  },
  creditsText: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
  },
  creditsName: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  creditsYear: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
});