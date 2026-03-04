import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, BellOff, Clock, Send, AlertCircle } from 'lucide-react-native';
import { useNotificationSettings } from '@/src/hooks/useNotificationSettings';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Layout, Spacing } from '@/src/constants/spacing';

const formatTime = (hour: number, minute: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h      = hour % 12 || 12;
  const m      = String(minute).padStart(2, '0');
  return `${h}:${m} ${period}`;
};

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const {
    permissionGranted, enabled,
    scheduledReminders, loading,
    toggle, sendTestNotification, refresh,
  } = useNotificationSettings();

  const handleTest = async () => {
    await sendTestNotification();
    Alert.alert('Test Sent', 'You will receive a notification in ~3 seconds.');
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
        <Text style={styles.navTitle}>Notifications</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={Colors.text.tertiary}
          />
        }
      >
        {/* Permission warning */}
        {!permissionGranted && (
          <View style={styles.warningCard}>
            <AlertCircle size={18} color="#FF9F0A" strokeWidth={2} />
            <Text style={styles.warningText}>
              Notifications are disabled in your device settings. Enable them
              in Settings → FocusVault → Notifications.
            </Text>
          </View>
        )}

        {/* Master toggle */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[
                styles.iconWrap,
                { backgroundColor: enabled ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.04)' },
              ]}>
                {enabled
                  ? <Bell size={18} color={Colors.text.primary} strokeWidth={1.8} />
                  : <BellOff size={18} color={Colors.text.tertiary} strokeWidth={1.8} />
                }
              </View>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Habit Reminders</Text>
                <Text style={styles.toggleSublabel}>
                  {enabled
                    ? `${scheduledReminders.length} reminder${scheduledReminders.length !== 1 ? 's' : ''} active`
                    : 'All reminders paused'}
                </Text>
              </View>
            </View>
            <Switch
              value={enabled && permissionGranted}
              onValueChange={toggle}
              trackColor={{ false: 'rgba(0,0,0,0.1)', true: Colors.text.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Scheduled reminders list */}
        {scheduledReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ACTIVE REMINDERS</Text>
            <View style={styles.card}>
              {scheduledReminders.map((reminder, index) => (
                <View key={reminder.identifier}>
                  <View style={styles.reminderRow}>
                    <View style={styles.reminderLeft}>
                      <Clock
                        size={15}
                        color={Colors.text.tertiary}
                        strokeWidth={1.8}
                      />
                      <View style={styles.reminderInfo}>
                        <Text style={styles.reminderTitle} numberOfLines={1}>
                          {reminder.title.replace('⏰ ', '')}
                        </Text>
                        {reminder.body ? (
                          <Text style={styles.reminderBody} numberOfLines={1}>
                            {reminder.body}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <Text style={styles.reminderTime}>
                      {formatTime(reminder.hour, reminder.minute)}
                    </Text>
                  </View>
                  {index < scheduledReminders.length - 1 && (
                    <View style={styles.rowDivider} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* No reminders empty state */}
        {enabled && permissionGranted && scheduledReminders.length === 0 && (
          <View style={styles.emptyCard}>
            <Bell size={28} color={Colors.text.tertiary} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No reminders set</Text>
            <Text style={styles.emptySubtitle}>
              Add a reminder time to your habits in the Habits tab to see them here.
            </Text>
          </View>
        )}

        {/* Manage note */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Individual reminder times are managed per-habit. Go to the Habits tab,
            tap a habit and set its reminder time there.
          </Text>
        </View>

        {/* Test notification */}
        {permissionGranted && (
          <TouchableOpacity
            style={styles.testBtn}
            onPress={handleTest}
            activeOpacity={0.8}
          >
            <Send size={16} color={Colors.text.primary} strokeWidth={2} />
            <Text style={styles.testBtnText}>Send Test Notification</Text>
          </TouchableOpacity>
        )}
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
    gap: Spacing.md,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(255,159,10,0.1)',
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
    width: 36,
    height: 36,
    borderRadius: 10,
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
  section: { gap: Spacing.sm },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  reminderInfo: { flex: 1, gap: 2 },
  reminderTitle: {
    ...Typography.callout,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  reminderBody: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  reminderTime: {
    ...Typography.subhead,
    color: Colors.text.primary,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.07)',
    ...Shadow.sm,
  },
  emptyTitle: {
    ...Typography.headline,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  emptySubtitle: {
    ...Typography.subhead,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  infoText: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    lineHeight: 18,
    textAlign: 'center',
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.full,
    paddingVertical: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
    ...Shadow.sm,
  },
  testBtnText: {
    ...Typography.callout,
    color: Colors.text.primary,
    fontWeight: '600',
  },
});