import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '@/src/store/onboardingStore';
import { RefreshCw } from 'lucide-react-native';
import {
  User, Bell, Shield, Star,
  LogOut, Info, Mail,
} from 'lucide-react-native';
import { useProfile } from '@/src/hooks/useProfile';
import { ProfileAvatar } from '@/src/components/profile/ProfileAvatar';
import { ProfileStats } from '@/src/components/profile/ProfileStats';
import { ProfileMenuSection } from '@/src/components/profile/ProfileMenuSection';
import type { MenuItem } from '@/src/components/profile/ProfileMenuSection';
import { Colors, Typography } from '@/src/constants/theme';
import { Layout, Spacing } from '@/src/constants/spacing';

export default function ProfileScreen() {
  const { user, stats, loading, fetchStats, logout } = useProfile();
  const { reset: resetOnboarding } = useOnboardingStore();

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };
  
  const accountItems: MenuItem[] = [
    {
      id: 'email',
      label: 'Email',
      sublabel: user?.email ?? '',
      icon: Mail,
      onPress: () => {},
      hideChevron: true,
    },
    {
      id: 'display_name',
      label: 'Display Name',
      sublabel: user?.displayName ?? 'Not set',
      icon: User,
      onPress: () => {},
      hideChevron: true,
    },
  ];

  const appItems: MenuItem[] = [
    {
      id: 'notifications',
      label: 'Notifications',
      sublabel: 'Reminders and alerts',
      icon: Bell,
      onPress: () => {},
    },
    {
      id: 'privacy',
      label: 'Privacy',
      sublabel: 'Data and permissions',
      icon: Shield,
      onPress: () => {},
    },
    {
      id: 'rate',
      label: 'Rate FocusVault',
      icon: Star,
      onPress: () => {},
    },
    {
      id: 'about',
      label: 'About',
      sublabel: 'Version 1.0.0',
      icon: Info,
      onPress: () => {},
    },
    {
  id: 'reset_onboarding',
  label: 'Reset Onboarding',
  sublabel: 'Dev only — view onboarding again',
  icon: RefreshCw,
  onPress: async () => {
    await resetOnboarding();
    Alert.alert('Done', 'Restart the app to see onboarding.');
  },
},
  ];

  const dangerItems: MenuItem[] = [
    {
      id: 'logout',
      label: 'Sign Out',
      icon: LogOut,
      onPress: handleLogout,
      destructive: true,
      hideChevron: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchStats}
            tintColor={Colors.text.tertiary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Avatar block */}
        <ProfileAvatar
          displayName={user?.displayName ?? null}
          email={user?.email ?? null}
        />

        {/* Lifetime stats */}
        {stats && (
          <ProfileStats
            totalHabits={stats.totalHabits}
            totalSessions={stats.totalSessions}
            totalFocusMinutes={stats.totalFocusMinutes}
            longestStreak={stats.longestStreak}
          />
        )}

        {/* Menu sections */}
        <ProfileMenuSection title="Account" items={accountItems} />
        <ProfileMenuSection title="App" items={appItems} />
        <ProfileMenuSection title="Session" items={dangerItems} />

        {/* Footer */}
        <Text style={styles.footer}>
          FocusVault · Built with love by Momoh Sawi
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: 48,
    gap: Spacing.lg,
  },
  header: {
    gap: 4,
  },
  title: {
    ...Typography.title2,
    color: Colors.text.primary,
    letterSpacing: -0.4,
  },
  footer: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    textAlign: 'center',
    paddingTop: Spacing.sm,
  },
});