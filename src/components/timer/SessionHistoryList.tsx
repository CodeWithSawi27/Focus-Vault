import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, ChevronRight } from 'lucide-react-native';
import { getCategoryById } from '@/src/constants/categories';
import { Colors, Typography, Radius, Shadow } from '@/src/constants/theme';
import { Spacing } from '@/src/constants/spacing';
import type { FocusSessionRecord } from '@/src/hooks/useSessionHistory';

interface SessionHistoryListProps {
  sessions: FocusSessionRecord[];
  onViewAll?: () => void;
}

const formatDate = (iso: string): string => {
  const d    = new Date(iso);
  const now  = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export const SessionHistoryList = ({
  sessions,
  onViewAll,
}: SessionHistoryListProps) => {
  if (sessions.length === 0) {
    return (
      <View style={styles.empty}>
        <Clock size={22} color={Colors.text.tertiary} strokeWidth={1.5} />
        <Text style={styles.emptyText}>No sessions yet</Text>
        <Text style={styles.emptySubtext}>
          Complete your first session to see history
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <Text style={styles.sectionLabel}>Recent Sessions</Text>
        {onViewAll && sessions.length >= 5 && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.card}>
        {sessions.slice(0, 5).map((session, index) => {
          const cat    = getCategoryById(session.category);
          const isLast = index === Math.min(sessions.length, 5) - 1;

          return (
            <View
              key={session.id}
              style={[styles.row, !isLast && styles.rowBorder]}
            >
              <View style={styles.emojiWrap}>
                <Text style={styles.emoji}>{cat?.emoji ?? '⚡'}</Text>
              </View>

              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>
                  {cat?.label ?? 'Focus Session'}
                </Text>
                {session.notes ? (
                  <Text style={styles.rowNote} numberOfLines={1}>
                    {session.notes}
                  </Text>
                ) : (
                  <Text style={styles.rowDate}>
                    {formatDate(session.started_at)}
                  </Text>
                )}
              </View>

              <View style={styles.rowRight}>
                <Text style={styles.duration}>
                  {formatDuration(session.duration)}
                </Text>
                <Text style={styles.rowDateRight}>
                  {formatDate(session.started_at)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  viewAll: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.07)',
    overflow: 'hidden',
    ...Shadow.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  emojiWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 18,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    ...Typography.callout,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  rowNote: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
  rowDate: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  duration: {
    ...Typography.subhead,
    color: Colors.text.primary,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  rowDateRight: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  empty: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: 6,
  },
  emptyText: {
    ...Typography.callout,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  emptySubtext: {
    ...Typography.footnote,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});