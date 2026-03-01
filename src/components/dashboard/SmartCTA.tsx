import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Timer, Play, ArrowRight } from 'lucide-react-native';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';

interface SmartCTAProps {
  lastSession: {
    duration: number;
    started_at: string;
  } | null;
}

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  return `${m} min`;
};

const timeAgo = (isoString: string): string => {
  const diff = Date.now() - new Date(isoString).getTime();
  const hours   = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));

  if (hours >= 24) return `${Math.floor(hours / 24)}d ago`;
  if (hours >= 1)  return `${hours}h ago`;
  if (minutes >= 1) return `${minutes}m ago`;
  return 'just now';
};

export const SmartCTA = ({ lastSession }: SmartCTAProps) => {
  const router = useRouter();

  if (lastSession) {
    return (
      <TouchableOpacity
        style={styles.continueCard}
        onPress={() => router.push('/(tabs)/timer')}
        activeOpacity={0.8}
      >
        {/* Icon */}
        <View style={styles.iconWrap}>
          <Timer size={20} color={Colors.text.inverse} strokeWidth={1.8} />
        </View>

        {/* Text */}
        <View style={styles.continueInfo}>
          <Text style={styles.continueTitle}>Continue Focusing</Text>
          <Text style={styles.continueSub}>
            Last: {formatDuration(lastSession.duration)} · {timeAgo(lastSession.started_at)}
          </Text>
        </View>

        <ArrowRight size={18} color="rgba(255,255,255,0.6)" strokeWidth={2} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.startCard}
      onPress={() => router.push('/(tabs)/timer')}
      activeOpacity={0.8}
    >
      <View style={styles.startLeft}>
        <View style={styles.startIconWrap}>
          <Play size={18} color={Colors.text.primary} fill={Colors.text.primary} strokeWidth={2} />
        </View>
        <View style={styles.startText}>
          <Text style={styles.startTitle}>Start Focusing</Text>
          <Text style={styles.startSub}>25, 50, or 90 minute sessions</Text>
        </View>
      </View>
      <ArrowRight size={18} color={Colors.text.tertiary} strokeWidth={2} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Last session variant — dark card
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.text.primary,
    borderRadius: Radius.lg,
    padding: 16,
    ...Shadow.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueInfo: {
    flex: 1,
    gap: 3,
  },
  continueTitle: {
    ...Typography.callout,
    color: Colors.text.inverse,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  continueSub: {
    ...Typography.footnote,
    color: 'rgba(255,255,255,0.5)',
  },

  // No session variant — white card
  startCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    ...Shadow.sm,
  },
  startLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  startIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startText: {
    gap: 3,
  },
  startTitle: {
    ...Typography.callout,
    color: Colors.text.primary,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  startSub: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
  },
});